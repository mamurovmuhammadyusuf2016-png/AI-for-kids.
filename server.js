const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildSystemPrompt, REPORT_PROMPT } = require('./prompt');
const { verifyStudentMessages, findWrongClaims, fmt } = require('./math');
const auth = require('./auth');
const learn = require('./learn');

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
const DATA_KEYS = new Set(['progress', 'diary', 'cards']);

// Subscription: price and how students reach the owner (set on Render).
const PRICE_UZS = Number(process.env.PRICE_UZS) || 45000;
const CONTACT_TELEGRAM = (process.env.CONTACT_TELEGRAM || '').replace(/^@/, '');
const CONTACT_PHONE = process.env.CONTACT_PHONE || '';
const PAYMENT_CARD = process.env.PAYMENT_CARD || '';
const ADMIN_EMAILS = new Set((process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));
// Free without a subscription: word cards (and the topic list), games and diary run in the browser.
const FREE_PATHS = new Set(['/api/learn/cards', '/api/learn/topics', '/api/data', '/api/subscribe']);
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

async function callModel(model, systemText, contents, timeoutMs, generationConfig) {
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
async function streamModel(model, systemText, contents, timeoutMs, onDelta) {
  const ctrl = new AbortController();
  let timer = setTimeout(() => ctrl.abort(), timeoutMs);
  let text = '';
  try {
    const r = await fetch(`${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemText }] }, contents }),
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
          const piece = (json.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('');
          if (!piece) continue;
          if (!text) { clearTimeout(timer); timer = setTimeout(() => ctrl.abort(), 90000); }
          text += piece;
          onDelta(piece);
        }
      }
    }
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

async function generateStream(systemText, messages, onDelta) {
  const contents = toContents(messages);
  try {
    return await streamModel(MODEL, systemText, contents, MODEL_TIMEOUT_MS, onDelta);
  } catch (err) {
    if (!['overloaded', 'rate_limited'].includes(err.code) || !FALLBACK_MODEL) throw err;
    console.log(`Main model ${err.code}, streaming from ${FALLBACK_MODEL}`);
    return streamModel(FALLBACK_MODEL, systemText, contents, FALLBACK_TIMEOUT_MS, onDelta);
  }
}

// opts.schema asks Gemini for JSON in that shape; opts.slow allows more time (big exercise sets).
async function generate(systemText, messages, opts = {}) {
  const contents = toContents(messages);
  const config = opts.schema ? { responseMimeType: 'application/json', responseSchema: opts.schema } : undefined;
  const scale = opts.slow ? 2 : 1;
  try {
    return await callModel(MODEL, systemText, contents, MODEL_TIMEOUT_MS * scale, config);
  } catch (err) {
    if (!['overloaded', 'rate_limited'].includes(err.code) || !FALLBACK_MODEL) throw err;
    console.log(`Main model ${err.code}, using ${FALLBACK_MODEL}`);
    return callModel(FALLBACK_MODEL, systemText, contents, FALLBACK_TIMEOUT_MS * scale, config);
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
  if ((await usedToday(user.id, day)) >= DAILY_LIMIT) {
    return sendJson(res, 429, { code: 'daily_limit', remaining: 0, limit: DAILY_LIMIT });
  }
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
  try {
    const raw = send ? await generateStream(systemText, messages, (text) => send({ type: 'delta', text })) : await generate(systemText, messages);
    reply = stripEmoji(raw);
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
  const result = { reply, remaining: Math.max(0, DAILY_LIMIT - used), limit: DAILY_LIMIT, tooFrequent, corrected: wrong.length > 0 };
  if (!send) return sendJson(res, 200, result);
  send({ type: 'done', ...result });
  res.end();
}

async function handleReport(req, res, body) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
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
    const report = await generate(REPORT_PROMPT.replace('{LANG}', lang), [
      { role: 'user', content: `Переписка ученика с репетитором:\n\n${transcript}` },
    ]);
    sendJson(res, 200, { report: stripEmoji(report) });
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

  const spec = LEARN_KINDS[kind](params);
  let data;
  try {
    const text = await generate(spec.prompt, [{ role: 'user', content: 'Составь материал по инструкции.' }], { schema: spec.schema, slow: true });
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
  sendJson(res, 200, data);
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

const isAdmin = (user) => !!user?.email && ADMIN_EMAILS.has(user.email);

async function handleMe(req, res) {
  const user = await auth.getUser(req);
  if (!user) return sendJson(res, 200, { user: null });
  const used = await auth.usedToday(user.id, today());
  sendJson(res, 200, {
    user: { ...auth.publicUser(user), admin: isAdmin(user) },
    remaining: Math.max(0, DAILY_LIMIT - used),
    limit: DAILY_LIMIT,
  });
}

// ---------- subscription requests and admin ----------
async function handleSubscribe(req, res, body, user) {
  if (!auth.enabled()) return sendJson(res, 503, { code: 'auth_unavailable' });
  const months = [1, 3, 6, 12].includes(Number(body.months)) ? Number(body.months) : 1;
  const request = await auth.requestSubscription(user.id, months);
  sendJson(res, 200, { request: { id: request.id, months: request.months }, price: PRICE_UZS * request.months });
}

async function handleAdmin(req, res, body, user, action) {
  if (!isAdmin(user)) return sendJson(res, 403, { code: 'forbidden' });
  if (action === 'requests') return sendJson(res, 200, { requests: await auth.listRequests() });
  if (action === 'grant') {
    const months = Math.min(12, Math.max(1, parseInt(body.months, 10) || 1));
    const granted = await auth.grantMonths(cleanText(body.email, 254), months, parseInt(body.requestId, 10) || null);
    return sendJson(res, 200, { email: granted.email, until: granted.premium_until });
  }
  if (action === 'reject') {
    await auth.rejectRequest(parseInt(body.requestId, 10));
    return sendJson(res, 200, { ok: true });
  }
  sendJson(res, 404, { code: 'not_found' });
}

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
  const handler = Object.hasOwn(LEARN_KINDS, learnKind || '')
    ? (q, r, b, u) => handleLearn(q, r, b, u, learnKind)
    : urlPath.startsWith('/api/admin/')
      ? (q, r, b, u) => handleAdmin(q, r, b, u, urlPath.slice('/api/admin/'.length))
      : { '/api/chat': handleChat, '/api/report': handleReport, '/api/data': handleData, '/api/subscribe': handleSubscribe }[urlPath];
  if (!handler) return sendJson(res, 404, { code: 'not_found' });
  // Without a database the app runs in guest mode, limited per device.
  const deviceId = cleanText(body.deviceId, 64);
  if (!auth.enabled() && !deviceId) return sendJson(res, 400, { code: 'bad_request' });
  const user = auth.enabled() ? await auth.getUser(req) : { id: `device:${deviceId}` };
  if (!user) return sendJson(res, 401, { code: 'unauthorized' });
  // After the free week only cards, games and the diary stay open (admins always have access).
  const locked = auth.enabled() && !FREE_PATHS.has(urlPath) && !urlPath.startsWith('/api/admin/') && !isAdmin(user) && !auth.plan(user).active;
  if (locked) return sendJson(res, 402, { code: 'premium_required' });
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
        billing: { price: PRICE_UZS, trialDays: 7, telegram: CONTACT_TELEGRAM, phone: CONTACT_PHONE, card: PAYMENT_CARD },
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

auth.init()
  .catch((err) => console.error('Database init failed', err.message))
  .finally(() => {
    http.createServer(route).listen(PORT, () => console.log(`Nimi AI listening on port ${PORT}, model ${MODEL}`));
  });
