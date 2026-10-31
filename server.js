const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildSystemPrompt, REPORT_PROMPT } = require('./prompt');
const { verifyStudentMessages, findWrongClaims, fmt } = require('./math');
const auth = require('./auth');
const learn = require('./learn');
const { PLANS, planId, FREE_TRIES } = require('./plans');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gemini-flash-latest';
// Used only when the main model is overloaded (503), rate-limited (429) or times out.
const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || 'gemini-flash-lite-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_TIMEOUT_MS = 20000;
const FALLBACK_TIMEOUT_MS = 40000;
const MAX_HISTORY = 20;
const DAILY_LIMIT = 30;
// Generated exercise sets (training, tests, reading, cards) per day.
const LEARN_LIMIT = 20;
const DATA_KEYS = new Set(['progress', 'diary', 'cards', 'quest']);

// Subscription: price and how students reach the owner (set on Render).
const CONTACT_TELEGRAM = (process.env.CONTACT_TELEGRAM || '').replace(/^@/, '');
const CONTACT_PHONE = process.env.CONTACT_PHONE || '';
const PAYMENT_CARD = process.env.PAYMENT_CARD || '';
// Lets Claude grant access from the chat ("выдай подписку ..."): header X-Admin-Key.
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
const ADMIN_EMAILS = new Set((process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));
// Free without a subscription: word cards (and the topic list), games and diary run in the browser.
const FREE_PATHS = new Set(['/api/learn/cards', '/api/learn/topics', '/api/data', '/api/subscribe']);
// Paid sections that can be tried for free once (plans.js FREE_TRIES): the key of each request.
const TRY_KINDS = new Set(['training', 'test', 'exam', 'olympiad', 'reading']);
function tryKey(urlPath, body) {
  if (urlPath === '/api/chat') return body.image ? 'photo' : 'chat';
  if (urlPath === '/api/report') return 'report';
  const kind = urlPath.startsWith('/api/learn/') ? urlPath.slice('/api/learn/'.length) : '';
  return TRY_KINDS.has(kind) ? kind : null;
}
// After a free try worked: spend it and say how many of this kind are left.
async function spendFreeTry(user) {
  if (!user.freeTry) return undefined;
  await auth.useFree(user.id, user.freeTry);
  return Math.max(0, (auth.freeLeft(user)[user.freeTry] || 0) - 1);
}
const MAX_DATA_BYTES = 300000;
const FREQUENT_WINDOW_MS = 3 * 60 * 1000;
const FREQUENT_COUNT = 5;

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

// userId -> [timestamps of recent questions], for the "asking too often" nudge.
const recentQuestions = new Map();
// Daily counter used only when there is no database (guest mode): resets on restart.
const guestUsage = new Map();

async function usedToday(userId, day) {
  if (auth.enabled()) return auth.usedToday(userId, day);
  const u = guestUsage.get(userId);
  return u && u.day === day ? u.count : 0;
}

async function countQuestion(userId, day) {
  if (auth.enabled()) return auth.countQuestion(userId, day);
  const count = (await usedToday(userId, day)) + 1;
  guestUsage.set(userId, { day, count });
  return count;
}

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
}

// ---------- plan token limits (per calendar month, Tashkent time) ----------
const month = () => today().slice(0, 7);
const metered = (user) => auth.enabled() && !!user?.created_at;

// Guests and admins have no limit; a student stops when either monthly limit is used up.
async function tokensLeft(user) {
  if (!metered(user) || isAdmin(user)) return true;
  const used = await auth.tokensThisMonth(user.id, month());
  const { limits } = auth.plan(user);
  return used.input < limits.input && used.output < limits.output;
}

async function chargeTokens(user, meter) {
  if (metered(user)) await auth.addTokens(user.id, month(), meter);
}

const newMeter = () => ({ input: 0, output: 0 });

// How the AI answers for this account: thinking depth and how long to wait for the main model.
const aiFor = (user) => PLANS[metered(user) ? auth.plan(user).tier : 'pro'].ai;

// Chat questions per day: by plan for students, DAILY_LIMIT in guest mode.
const dailyLimit = (user) => (metered(user) ? auth.plan(user).questions : DAILY_LIMIT);

// Adds the model's reported token counts to a meter; thinking counts as output.
function addUsage(meter, u) {
  if (!meter || !u) return;
  meter.input += u.promptTokenCount || 0;
  meter.output += (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0);
}

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(data));
}

function readBody(req, limit = 400000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanMessages(messages, limit) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-limit);
}

function cleanText(v, max) {
  return typeof v === 'string' ? v.slice(0, max) : '';
}

class AiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function callModel(model, systemText, contents, timeoutMs, generationConfig, meter) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemText }] }, contents, generationConfig }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 429) throw new AiError('rate_limited', 429);
    if (!r.ok) {
      console.error(`Gemini ${model} error`, r.status, JSON.stringify(data).slice(0, 500));
      throw new AiError(r.status === 503 || r.status >= 500 ? 'overloaded' : 'ai_error', r.status);
    }
    addUsage(meter, data.usageMetadata);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      console.error(`Gemini ${model} empty`, JSON.stringify(data).slice(0, 500));
      throw new AiError('blocked', 200);
    }
    return text;
  } catch (err) {
    if (err instanceof AiError) throw err;
    console.error(`Gemini ${model} request failed`, err.name, err.message);
    throw new AiError('overloaded', 0);
  } finally {
    clearTimeout(timer);
  }
}

function toContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: m.image ? [{ inlineData: { mimeType: m.image.mime, data: m.image.data } }, { text: m.content }] : [{ text: m.content }],
  }));
}

// Streams the answer piece by piece: onDelta(text) for each piece, returns the whole text.
async function streamModel(model, systemText, contents, timeoutMs, onDelta, meter, generationConfig) {
  const ctrl = new AbortController();
  let timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let text = '';
  let usage = null;
  try {
    const r = await fetch(`${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemText }] }, contents, generationConfig }),
      signal: ctrl.signal,
    });
    if (r.status === 429) throw new AiError('rate_limited', 429);
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      console.error(`Gemini ${model} stream error`, r.status, JSON.stringify(data).slice(0, 500));
      throw new AiError(r.status >= 500 ? 'overloaded' : 'ai_error', r.status);
    }
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let end;
      while ((end = buf.indexOf('\n\n')) >= 0) {
        const event = buf.slice(0, end);
        buf = buf.slice(end + 2);
        for (const line of event.split('\n')) {
          if (!line.startsWith('data:')) continue;
          let json;
          try { json = JSON.parse(line.slice(5).trim()); } catch { continue; }
          // Every chunk carries the running totals; the last one is the whole answer.
          if (json.usageMetadata) usage = json.usageMetadata;
          const piece = (json.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('');
          if (!piece) continue;
          if (!text) { clearTimeout(timer); timer = setTimeout(() => ctrl.abort(), 90000); }
          text += piece;
          onDelta(piece);
        }
      }
    }
    addUsage(meter, usage);
    if (!text.trim()) throw new AiError('blocked', 200);
    return text.trim();
  } catch (err) {
    if (err instanceof AiError) throw err;
    console.error(`Gemini ${model} stream failed`, err.name, err.message);
    // Nothing shown yet: the fallback model can still answer.
    throw new AiError(text ? 'ai_error' : 'overloaded', 0);
  } finally {
    clearTimeout(timer);
  }
}

// ai: the plan's settings ({ thinking, waitMs }); thinking applies to the main model only.
const thinkingConfig = (ai) => (ai?.thinking ? { thinkingConfig: ai.thinking } : undefined);

async function generateStream(systemText, messages, onDelta, meter, ai) {
  const contents = toContents(messages);
  try {
    return await streamModel(MODEL, systemText, contents, ai?.waitMs || MODEL_TIMEOUT_MS, onDelta, meter, thinkingConfig(ai));
  } catch (err) {
    // A thinking setting the model does not accept: ask again with the model's own default.
    if (err.status === 400 && ai?.thinking) return generateStream(systemText, messages, onDelta, meter, { ...ai, thinking: null });
    if (!['overloaded', 'rate_limited'].includes(err.code) || !FALLBACK_MODEL) throw err;
    console.log(`Main model ${err.code}, streaming from ${FALLBACK_MODEL}`);
    return streamModel(FALLBACK_MODEL, systemText, contents, FALLBACK_TIMEOUT_MS, onDelta, meter);
  }
}

// opts.schema asks Gemini for JSON in that shape; opts.slow allows more time (big exercise sets);
// opts.meter collects the tokens used; opts.ai is the plan's AI settings.
async function generate(systemText, messages, opts = {}) {
  const contents = toContents(messages);
  const config = opts.schema ? { responseMimeType: 'application/json', responseSchema: opts.schema } : undefined;
  const scale = opts.slow ? 2 : 1;
  try {
    const main = thinkingConfig(opts.ai) ? { ...config, ...thinkingConfig(opts.ai) } : config;
    return await callModel(MODEL, systemText, contents, (opts.ai?.waitMs || MODEL_TIMEOUT_MS) * scale, main, opts.meter);
  } catch (err) {
    if (err.status === 400 && opts.ai?.thinking) return generate(systemText, messages, { ...opts, ai: { ...opts.ai, thinking: null } });
    if (!['overloaded', 'rate_limited'].includes(err.code) || !FALLBACK_MODEL) throw err;
    console.log(`Main model ${err.code}, using ${FALLBACK_MODEL}`);
    return callModel(FALLBACK_MODEL, systemText, contents, FALLBACK_TIMEOUT_MS * scale, config, opts.meter);
  }
}

const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu;

function stripEmoji(text) {
  return text.replace(EMOJI_RE, '').replace(/[ \t]{2,}/g, ' ').replace(/ +([.,!?:;])/g, '$1').trim();
}

function aiErrorResponse(res, err) {
  if (err.code === 'rate_limited') return sendJson(res, 429, { code: 'rate_limited' });
  if (err.code === 'blocked') return sendJson(res, 200, { code: 'blocked' });
  return sendJson(res, 502, { code: 'ai_error' });
}

async function handleChat(req, res, body, user) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
  const messages = cleanMessages(body.messages, MAX_HISTORY);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return sendJson(res, 400, { code: 'bad_request' });
  }
  const image = body.image;
  if (image) {
    const okImage = ['image/jpeg', 'image/png', 'image/webp'].includes(image.mime) &&
      typeof image.data === 'string' && image.data.length < 3400000 && /^[A-Za-z0-9+/=]+$/.test(image.data);
    if (!okImage) return sendJson(res, 400, { code: 'bad_image' });
    messages[messages.length - 1].image = { mime: image.mime, data: image.data };
  }

  const day = today();
  const limit = dailyLimit(user);
  if ((await usedToday(user.id, day)) >= limit) {
    return sendJson(res, 429, { code: 'daily_limit', remaining: 0, limit });
  }
  if (!(await tokensLeft(user))) return sendJson(res, 429, { code: 'tokens_out' });
  const now = Date.now();
  const recent = (recentQuestions.get(user.id) || []).filter((t) => now - t < FREQUENT_WINDOW_MS);
  recentQuestions.set(user.id, recent);
  const tooFrequent = recent.length >= FREQUENT_COUNT - 1;

  const userTexts = messages.filter((m) => m.role === 'user').map((m) => m.content);
  const systemText = buildSystemPrompt({
    subject: cleanText(body.subject, 60),
    grade: cleanText(String(body.grade || ''), 4),
    lang: body.lang === 'uz' ? 'uz' : 'ru',
    turn: Math.min(Number(body.turn) || userTexts.length, 1000),
    tooFrequent,
    verified: verifyStudentMessages(userTexts),
  });

  // Streaming: the student sees the answer appear word by word (Server-Sent Events).
  let send = null;
  if (body.stream) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no' });
    send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
  }
  let reply;
  const meter = newMeter();
  try {
    const raw = send
      ? await generateStream(systemText, messages, (text) => send({ type: 'delta', text }), meter, aiFor(user))
      : await generate(systemText, messages, { meter, ai: aiFor(user) });
    reply = stripEmoji(raw);
    await chargeTokens(user, meter);
  } catch (err) {
    if (!send) return aiErrorResponse(res, err);
    send({ type: 'error', code: ['rate_limited', 'blocked'].includes(err.code) ? err.code : 'ai_error' });
    return res.end();
  }

  // Function 3: re-check the model's own arithmetic in code.
  const wrong = findWrongClaims(reply);
  if (wrong.length) {
    const fix = wrong.map((c) => `${c.src} = ${fmt(c.value)}`).join('; ');
    reply += body.lang === 'uz'
      ? `\n\nServer tekshiruvi: hisobda xato bor. To'g'risi: ${fix}`
      : `\n\nПроверка сервера: в вычислении ошибка. Правильно: ${fix}`;
  }

  const used = await countQuestion(user.id, day);
  recent.push(now);
  const freeLeft = await spendFreeTry(user);
  const result = { reply, remaining: Math.max(0, limit - used), limit, tooFrequent, corrected: wrong.length > 0, freeLeft };
  if (!send) return sendJson(res, 200, result);
  send({ type: 'done', ...result });
  res.end();
}

async function handleReport(req, res, body, user) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
  if (!(await tokensLeft(user))) return sendJson(res, 429, { code: 'tokens_out' });
  const sessions = Array.isArray(body.sessions) ? body.sessions.slice(-10) : [];
  const transcript = sessions
    .map((s) => {
      const msgs = cleanMessages(s.messages, 30)
        .map((m) => `${m.role === 'user' ? 'Ученик' : 'Репетитор'}: ${m.content.slice(0, 600)}`)
        .join('\n');
      return `### ${cleanText(s.subject, 60)}, ${cleanText(String(s.grade || ''), 4)} класс, ${cleanText(s.date, 20)}\n${msgs}`;
    })
    .join('\n\n')
    .slice(-30000);
  if (!transcript.trim()) return sendJson(res, 200, { code: 'empty' });

  const lang = body.lang === 'uz' ? 'узбекский (латиница)' : 'русский';
  try {
    const meter = newMeter();
    const report = await generate(REPORT_PROMPT.replace('{LANG}', lang), [
      { role: 'user', content: `Переписка ученика с репетитором:\n\n${transcript}` },
    ], { meter });
    await chargeTokens(user, meter);
    sendJson(res, 200, { report: stripEmoji(report), freeLeft: await spendFreeTry(user) });
  } catch (err) {
    aiErrorResponse(res, err);
  }
}

function serveStatic(res, urlPath) {
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath));
  const type = MIME[path.extname(file)];
  if (!file.startsWith(PUBLIC_DIR + path.sep) || !type) return false;
  fs.readFile(file, (err, data) => {
    if (err) return sendJson(res, 404, { code: 'not_found' });
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
  return true;
}

// ---------- learning: generated exercises ----------
const LEARN_KINDS = {
  training: (b) => ({
    prompt: learn.trainingPrompt(b),
    schema: learn.TASK_SCHEMA,
    shape: (d) => ({ tasks: learn.cleanTasks(d, 10) }),
  }),
  test: (b) => ({
    prompt: learn.testPrompt(b),
    schema: learn.TASK_SCHEMA,
    shape: (d) => ({ tasks: learn.cleanTasks(d, 10) }),
  }),
  exam: (b) => ({
    prompt: learn.examPrompt(b),
    schema: learn.TASK_SCHEMA,
    shape: (d) => ({ tasks: learn.cleanTasks(d, 15) }),
  }),
  olympiad: (b) => ({
    prompt: learn.olympiadPrompt(b),
    schema: learn.TASK_SCHEMA,
    shape: (d) => ({ tasks: learn.cleanTasks(d, 6) }),
  }),
  reading: (b) => ({
    prompt: learn.readingPrompt(b),
    schema: learn.READING_SCHEMA,
    shape: (d) => ({
      title: learn.str(d.title, 120),
      text: learn.str(d.text, 4000),
      tasks: learn.cleanTasks({ tasks: (d.questions || []).map((q) => ({ ...q, type: 'choice', topic: 'reading', rule: '' })) }, 5),
    }),
  }),
  cards: (b) => ({
    prompt: learn.cardsPrompt(b),
    schema: learn.CARDS_SCHEMA,
    shape: (d) => ({
      title: learn.str(d.title, 80),
      words: (Array.isArray(d.words) ? d.words : [])
        .map((w) => ({ front: learn.str(w.front, 60), back: learn.str(w.back, 80), example: learn.str(w.example, 200) }))
        .filter((w) => w.front && w.back)
        .slice(0, 20),
    }),
  }),
  topics: (b) => ({
    prompt: learn.topicsPrompt(b),
    schema: learn.TOPICS_SCHEMA,
    shape: (d) => ({ topics: (Array.isArray(d.topics) ? d.topics : []).map((x) => learn.str(x, 60)).filter(Boolean).slice(0, 12) }),
  }),
};

function learnParams(body) {
  const pick = (v, allowed, dflt) => (allowed.includes(v) ? v : dflt);
  return {
    subject: cleanText(body.subject, 60) || 'Математика',
    grade: Math.min(11, Math.max(1, parseInt(body.grade, 10) || 5)),
    lang: pick(body.lang, ['ru', 'uz'], 'ru'),
    level: Math.min(5, Math.max(1, parseInt(body.level, 10) || 2)),
    topic: cleanText(body.topic, 80),
    learn: pick(body.learn, ['en', 'ru', 'uz'], 'en'),
    native: pick(body.native, ['ru', 'uz'], 'ru'),
    examType: pick(body.examType, ['final', 'dtm'], 'final'),
    topics: Array.isArray(body.topics) ? body.topics.map((x) => cleanText(x, 60)).filter(Boolean).slice(0, 12) : [],
  };
}

async function generationsToday(userId, day) {
  if (auth.enabled()) return auth.generationsToday(userId, day);
  const u = guestUsage.get(`learn:${userId}`);
  return u && u.day === day ? u.count : 0;
}

async function countGeneration(userId, day) {
  if (auth.enabled()) return auth.countGeneration(userId, day);
  const count = (await generationsToday(userId, day)) + 1;
  guestUsage.set(`learn:${userId}`, { day, count });
  return count;
}

async function handleLearn(req, res, body, user, kind) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
  const params = learnParams(body);
  if (kind === 'topics') {
    const cached = await auth.cachedTopics(params.subject, params.grade, params.lang);
    if (cached) return sendJson(res, 200, { topics: cached });
  }
  const day = today();
  if ((await generationsToday(user.id, day)) >= LEARN_LIMIT) return sendJson(res, 429, { code: 'learn_limit' });
  if (!(await tokensLeft(user))) return sendJson(res, 429, { code: 'tokens_out' });

  const spec = LEARN_KINDS[kind](params);
  let data;
  try {
    const meter = newMeter();
    const text = await generate(spec.prompt, [{ role: 'user', content: 'Составь материал по инструкции.' }], { schema: spec.schema, slow: true, meter, ai: { waitMs: aiFor(user).waitMs } });
    await chargeTokens(user, meter);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // "\sqrt", "\left" etc. are not valid JSON escapes: double such backslashes and retry.
      parsed = JSON.parse(text.replace(/\\(["\\/bfnrtu]?)/g, (m, c) => (c ? m : '\\\\')));
    }
    data = spec.shape(learn.repairLatex(parsed));
  } catch (err) {
    if (err instanceof SyntaxError) return sendJson(res, 502, { code: 'ai_error' });
    return aiErrorResponse(res, err);
  }
  const empty = (data.tasks && !data.tasks.length) || (data.words && !data.words.length) || (data.topics && !data.topics.length);
  if (empty) return sendJson(res, 502, { code: 'ai_error' });
  if (kind === 'topics') await auth.cacheTopics(params.subject, params.grade, params.lang, data.topics);
  else await countGeneration(user.id, day);
  sendJson(res, 200, { ...data, freeLeft: await spendFreeTry(user) });
}

// ---------- learning: saved progress, diary and cards ----------
async function handleData(req, res, body, user) {
  if (!auth.enabled()) return sendJson(res, 503, { code: 'auth_unavailable' });
  if (body.key === undefined) return sendJson(res, 200, await auth.getData(user.id));
  if (!DATA_KEYS.has(body.key) || typeof body.value !== 'object' || body.value === null) {
    return sendJson(res, 400, { code: 'bad_request' });
  }
  if (JSON.stringify(body.value).length > MAX_DATA_BYTES) return sendJson(res, 413, { code: 'too_large' });
  await auth.setData(user.id, body.key, body.value);
  sendJson(res, 200, { ok: true });
}

const isAdmin = (user) => !!user?.apiAdmin || user?.role === 'admin' || (!!user?.email && ADMIN_EMAILS.has(user.email));

function hasAdminKey(req) {
  const given = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const key = Buffer.from(ADMIN_API_KEY);
  return key.length >= 24 && given.length === key.length && require('crypto').timingSafeEqual(given, key);
}

async function handleMe(req, res) {
  const user = await auth.getUser(req);
  if (!user) return sendJson(res, 200, { user: null });
  const used = await auth.usedToday(user.id, today());
  const tokens = user.role === 'student' ? await auth.tokensThisMonth(user.id, month()) : undefined;
  sendJson(res, 200, {
    user: { ...auth.publicUser(user), admin: isAdmin(user), tokens },
    child: user.role === 'parent' ? (await auth.getChild(user.parent_of))?.email || null : undefined,
    remaining: Math.max(0, dailyLimit(user) - used),
    limit: dailyLimit(user),
  });
}

// ---------- subscription requests and admin ----------
async function handleSubscribe(req, res, body, user) {
  if (!auth.enabled()) return sendJson(res, 503, { code: 'auth_unavailable' });
  // months = 0 asks for the free week.
  const months = [0, 1, 3, 6, 12].includes(Number(body.months)) ? Number(body.months) : 1;
  const request = await auth.requestSubscription(user.id, months, planId(body.plan));
  sendJson(res, 200, { request: { id: request.id, months: request.months, plan: request.plan }, price: PLANS[request.plan].price * request.months });
}

async function handleAdmin(req, res, body, user, action) {
  if (!isAdmin(user)) return sendJson(res, 403, { code: 'forbidden' });
  if (action === 'requests') return sendJson(res, 200, { requests: await auth.listRequests() });
  if (action === 'grant') {
    const months = Number(body.months) === 0 ? 0 : Math.min(12, Math.max(1, parseInt(body.months, 10) || 1));
    const granted = await auth.grantMonths(cleanText(body.email, 254), months, parseInt(body.requestId, 10) || null, body.plan ? planId(body.plan) : null);
    return sendJson(res, 200, { email: granted.email, until: granted.premium_until, kind: granted.plan_kind, plan: granted.plan_tier });
  }
  if (action === 'reject') {
    await auth.rejectRequest(parseInt(body.requestId, 10));
    return sendJson(res, 200, { ok: true });
  }
  if (action === 'users') return sendJson(res, 200, { users: await auth.listStudents(cleanText(body.search, 60)) });
  if (action === 'reset-password') {
    return sendJson(res, 200, { email: cleanText(body.email, 254), password: await auth.resetStudentPassword(cleanText(body.email, 254)) });
  }
  if (action === 'delete-user') {
    await auth.deleteStudent(cleanText(body.email, 254));
    return sendJson(res, 200, { ok: true });
  }
  if (action === 'stats') return sendJson(res, 200, await auth.adminStats(today(), month()));
  if (action === 'revoke') return sendJson(res, 200, await auth.revokeSubscription(cleanText(body.email, 254)));
  // Without "apply" it only lists who would lose access; "apply" is that list, confirmed.
  if (action === 'revoke-except') {
    const list = (v, max) => (Array.isArray(v) ? v.slice(0, max).map((e) => cleanText(e, 254)) : []);
    return sendJson(res, 200, await auth.revokeAllExcept(list(body.keep, 100), Array.isArray(body.apply) ? list(body.apply, 20000) : null));
  }
  // Staff accounts are created only with the admin key (from the chat with Claude).
  if (action === 'create-admin' && user.apiAdmin) return sendJson(res, 200, await auth.createAdminAccount(cleanText(body.login, 32), cleanText(body.password, 128)));
  sendJson(res, 404, { code: 'not_found' });
}

// ---------- student settings: the parent's login and password ----------
async function handleAccount(req, res, body, user, action) {
  if (action === 'settings') return sendJson(res, 200, { email: user.email, parent: await auth.ensureParent(user.id) });
  if (action === 'parent-reset') return sendJson(res, 200, { parent: await auth.resetParentPassword(user.id) });
  sendJson(res, 404, { code: 'not_found' });
}

// ---------- chat history (saved for the student; open without a subscription) ----------
const CHAT_ID_RE = /^[A-Za-z0-9_-]{6,40}$/;
const MAX_CHAT_BYTES = 300000;

// A chat from the browser: texts only (a photo is kept as a mark, the picture stays on the device).
function cleanChat(c) {
  if (!c || typeof c !== 'object' || !CHAT_ID_RE.test(String(c.id || ''))) return null;
  const messages = (Array.isArray(c.messages) ? c.messages : []).slice(-200)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000), ts: Number(m.ts) || 0, ...(m.photo || m.img ? { photo: true } : {}) }));
  if (!messages.length) return null;
  return {
    id: String(c.id),
    date: /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? c.date : today(),
    subject: /^[a-z]{2,20}$/.test(c.subject) ? c.subject : 'math',
    grade: Math.min(11, Math.max(1, parseInt(c.grade, 10) || 5)),
    messages,
  };
}

async function handleChats(req, res, body, user, action) {
  if (!auth.enabled()) return sendJson(res, 503, { code: 'auth_unavailable' });
  if (action === 'list') return sendJson(res, 200, { chats: await auth.listChats(user.id) });
  if (action === 'recent') return sendJson(res, 200, { chats: await auth.recentChats(user.id, 10) });
  const id = String(body.id || body.chat?.id || '');
  if (!CHAT_ID_RE.test(id)) return sendJson(res, 400, { code: 'bad_request' });
  if (action === 'get') return sendJson(res, 200, { chat: await auth.getChat(user.id, id) });
  if (action === 'delete') {
    await auth.deleteChat(user.id, id);
    return sendJson(res, 200, { ok: true });
  }
  if (action === 'save') {
    const chat = cleanChat(body.chat);
    if (!chat) return sendJson(res, 400, { code: 'bad_request' });
    if (JSON.stringify(chat).length > MAX_CHAT_BYTES) return sendJson(res, 413, { code: 'too_large' });
    await auth.saveChat(user.id, chat);
    return sendJson(res, 200, { ok: true });
  }
  sendJson(res, 404, { code: 'not_found' });
}

// ---------- parent account: the child's progress, diary, subscription ----------
const PARENT_REPORT_PROMPT = `Ты помогаешь родителям понять, как учится их ребёнок в Nimi AI (ИИ-репетитор для школьников).
По статистике составь короткий отчёт для родителей на языке: {LANG}. Обычный текст, короткие пункты, без таблиц, без эмодзи.
1. Как регулярно занимается ребёнок.
2. Какие темы освоены хорошо, какие стоит повторить, где трудно.
3. Домашние задания (сделано / не сделано).
4. 1–2 совета родителям, как помочь дома.`;

async function handleParent(req, res, body, user, action) {
  const child = await auth.getChild(user.parent_of);
  if (!child) return sendJson(res, 404, { code: 'user_not_found' });
  if (action === 'overview') {
    const data = await auth.getData(child.id);
    return sendJson(res, 200, {
      child: { email: child.email, plan: auth.plan(child), free: auth.freeLeft(child), tokens: await auth.tokensThisMonth(child.id, month()) },
      usedToday: await auth.usedToday(child.id, today()),
      limit: dailyLimit(child),
      progress: data.progress || null,
      diary: data.diary || [],
    });
  }
  if (action === 'child-password') {
    await auth.setPassword(child.id, body.password);
    return sendJson(res, 200, { ok: true });
  }
  if (action === 'subscribe') {
    const months = [0, 1, 3, 6, 12].includes(Number(body.months)) ? Number(body.months) : 1;
    const request = await auth.requestSubscription(child.id, months, planId(body.plan));
    return sendJson(res, 200, { request: { id: request.id, months: request.months, plan: request.plan }, price: PLANS[request.plan].price * request.months, email: child.email });
  }
  if (action === 'report') {
    // Without a subscription the AI report can be tried once (the child's free try).
    const trying = !auth.plan(child).active;
    if (trying && !auth.freeLeft(child).report) return sendJson(res, 402, { code: 'premium_required', feature: 'report' });
    if (!(await tokensLeft(child))) return sendJson(res, 429, { code: 'tokens_out' });
    const data = await auth.getData(child.id);
    const stats = JSON.stringify({ progress: data.progress || {}, diary: (data.diary || []).slice(-30) }).slice(0, 20000);
    const lang = body.lang === 'uz' ? 'узбекский (латиница)' : 'русский';
    try {
      const meter = newMeter();
      const report = await generate(PARENT_REPORT_PROMPT.replace('{LANG}', lang), [{ role: 'user', content: `Статистика ребёнка (JSON): ${stats}` }], { meter });
      await chargeTokens(child, meter);
      if (trying) await auth.useFree(child.id, 'report');
      return sendJson(res, 200, { report: stripEmoji(report) });
    } catch (err) {
      return aiErrorResponse(res, err);
    }
  }
  sendJson(res, 404, { code: 'not_found' });
}

// API areas with a sub-action in the path: /api/<area>/<action>.
const AREA_HANDLERS = { admin: handleAdmin, parent: handleParent, account: handleAccount, chats: handleChats };

// Account actions: each returns { user, cookie }.
const AUTH_ACTIONS = { '/api/auth/register': auth.register, '/api/auth/login': auth.login, '/api/auth/google': auth.google };

// Blocks cross-site form posts: a browser always sends Origin on POST from another site.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

async function handleApiPost(req, res, urlPath) {
  if (!sameOrigin(req)) return sendJson(res, 403, { code: 'forbidden' });
  let body;
  try {
    // A chat message may carry a photo of the task.
    body = JSON.parse(await readBody(req, urlPath === '/api/chat' ? 3500000 : 400000)) || {};
  } catch {
    return sendJson(res, 400, { code: 'bad_request' });
  }
  if (urlPath === '/api/auth/logout') {
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': await auth.logout(req) });
  }
  const action = AUTH_ACTIONS[urlPath];
  if (action) {
    const { user, cookie } = await action(req, body);
    return sendJson(res, 200, { user: auth.publicUser(user) }, { 'Set-Cookie': cookie });
  }
  const learnKind = urlPath.startsWith('/api/learn/') && urlPath.slice('/api/learn/'.length);
  const [, , areaName, areaAction] = urlPath.split('/');
  const areaHandler = Object.hasOwn(AREA_HANDLERS, areaName) && areaAction ? AREA_HANDLERS[areaName] : null;
  const handler = Object.hasOwn(LEARN_KINDS, learnKind || '')
    ? (q, r, b, u) => handleLearn(q, r, b, u, learnKind)
    : areaHandler
      ? (q, r, b, u) => areaHandler(q, r, b, u, areaAction)
      : { '/api/chat': handleChat, '/api/report': handleReport, '/api/data': handleData, '/api/subscribe': handleSubscribe }[urlPath];
  if (!handler) return sendJson(res, 404, { code: 'not_found' });
  // Without a database the app runs in guest mode, limited per device.
  const deviceId = cleanText(body.deviceId, 64);
  if (!auth.enabled() && !deviceId) return sendJson(res, 400, { code: 'bad_request' });
  const viaKey = urlPath.startsWith('/api/admin/') && hasAdminKey(req);
  const user = viaKey ? { id: 0, apiAdmin: true } : auth.enabled() ? await auth.getUser(req) : { id: `device:${deviceId}` };
  if (!user) return sendJson(res, 401, { code: 'unauthorized' });
  // Each kind of account has its own part of the API.
  const role = user.apiAdmin ? 'admin' : user.role || 'student';
  const area = areaName === 'admin' ? 'admin' : areaName === 'parent' ? 'parent' : 'student';
  if (area === 'parent' && role !== 'parent') return sendJson(res, 403, { code: 'forbidden' });
  if (area === 'student' && role !== 'student') return sendJson(res, 403, { code: 'forbidden' });
  if (areaName === 'account' && !auth.enabled()) return sendJson(res, 503, { code: 'auth_unavailable' });
  // Without access (no free week or subscription) cards, games, the diary and chat history stay open,
  // and every paid section can be tried for free (plans.js FREE_TRIES).
  const locked = area === 'student' && auth.enabled() && !FREE_PATHS.has(urlPath) && !['account', 'chats'].includes(areaName) && !isAdmin(user) && !auth.plan(user).active;
  if (locked) {
    const key = tryKey(urlPath, body);
    if (!key || !auth.freeLeft(user)[key]) return sendJson(res, 402, { code: 'premium_required', feature: key });
    user.freeTry = key;
  }
  return handler(req, res, body, user);
}

async function route(req, res) {
  const urlPath = req.url.split('?')[0];
  try {
    if (req.method === 'POST' && urlPath.startsWith('/api/')) return await handleApiPost(req, res, urlPath);
    if (req.method === 'GET' && urlPath === '/api/auth/me') return await handleMe(req, res);
    if (req.method === 'GET' && urlPath === '/api/config') {
      return sendJson(res, 200, {
        googleClientId: auth.GOOGLE_CLIENT_ID,
        accounts: auth.enabled(),
        billing: {
          plans: Object.entries(PLANS).map(([id, p]) => ({ id, name: p.name, price: p.price, input: p.input, output: p.output, questions: p.questions })),
          price: PLANS.pro.price,
          freeTries: FREE_TRIES,
          trialDays: 7,
          telegram: CONTACT_TELEGRAM,
          phone: CONTACT_PHONE,
          card: PAYMENT_CARD,
        },
      });
    }
    if (req.method === 'GET' && urlPath === '/health') return sendJson(res, 200, { ok: true });
    if (req.method === 'GET' && serveStatic(res, urlPath)) return;
    sendJson(res, 404, { code: 'not_found' });
  } catch (err) {
    if (err instanceof auth.AuthError) return sendJson(res, err.status, { code: err.code });
    console.error('Request failed', urlPath, err);
    if (!res.headersSent) sendJson(res, 500, { code: 'server_error' });
  }
}

// Keep the site awake: Render's free plan puts it to sleep after 15 minutes without visitors, and
// the next visitor waits about 30 seconds. So the server visits its own /health every 10 minutes
// (through the public address, which Render counts as a visit). /health does not touch the
// database, so Neon still sleeps between real visits. RENDER_EXTERNAL_URL is set by Render itself;
// KEEP_AWAKE=off turns this off, KEEP_AWAKE_MINUTES changes the interval.
function keepAwake() {
  const base = (process.env.KEEP_AWAKE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
  const minutes = Number(process.env.KEEP_AWAKE_MINUTES) || 10;
  if (!base || process.env.KEEP_AWAKE === 'off') return;
  setInterval(() => {
    fetch(`${base}/health`, { signal: AbortSignal.timeout(20000) })
      .catch((err) => console.warn('Keep-awake visit failed', err.name, err.message));
  }, minutes * 60 * 1000);
  console.log(`Keep-awake: visiting ${base}/health every ${minutes} min`);
}

auth.init()
  .catch((err) => console.error('Database init failed', err.message))
  .finally(() => {
    http.createServer(route).listen(PORT, () => {
      console.log(`Nimi AI listening on port ${PORT}, model ${MODEL}`);
      keepAwake();
    });
  });
