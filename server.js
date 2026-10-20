const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildSystemPrompt, REPORT_PROMPT } = require('./prompt');
const { verifyStudentMessages, findWrongClaims, fmt } = require('./math');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'gemini-flash-latest';
// Used only when the main model is overloaded (503), rate-limited (429) or times out.
const FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || 'gemini-flash-lite-latest';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_TIMEOUT_MS = 20000;
const FALLBACK_TIMEOUT_MS = 30000;
const MAX_HISTORY = 20;
const DAILY_LIMIT = 30;
const FREQUENT_WINDOW_MS = 3 * 60 * 1000;
const FREQUENT_COUNT = 5;

const PUBLIC_DIR = path.join(__dirname, 'public');
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
};

// deviceId -> { day, count, recent: [timestamps] }. In memory: resets when the server restarts.
const devices = new Map();

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
}

function deviceState(id) {
  let s = devices.get(id);
  if (!s || s.day !== today()) {
    s = { day: today(), count: 0, recent: [] };
    devices.set(id, s);
  }
  return s;
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 200000) {
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

async function callModel(model, systemText, contents, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemText }] }, contents }),
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

async function generate(systemText, messages) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  try {
    return await callModel(MODEL, systemText, contents, MODEL_TIMEOUT_MS);
  } catch (err) {
    if (!['overloaded', 'rate_limited'].includes(err.code) || !FALLBACK_MODEL) throw err;
    console.log(`Main model ${err.code}, using ${FALLBACK_MODEL}`);
    return callModel(FALLBACK_MODEL, systemText, contents, FALLBACK_TIMEOUT_MS);
  }
}

function aiErrorResponse(res, err) {
  if (err.code === 'rate_limited') return sendJson(res, 429, { code: 'rate_limited' });
  if (err.code === 'blocked') return sendJson(res, 200, { code: 'blocked' });
  return sendJson(res, 502, { code: 'ai_error' });
}

async function handleChat(req, res) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { code: 'bad_request' });
  }
  const deviceId = cleanText(body.deviceId, 64);
  const messages = cleanMessages(body.messages, MAX_HISTORY);
  if (!deviceId || !messages.length || messages[messages.length - 1].role !== 'user') {
    return sendJson(res, 400, { code: 'bad_request' });
  }

  const state = deviceState(deviceId);
  if (state.count >= DAILY_LIMIT) {
    return sendJson(res, 429, { code: 'daily_limit', remaining: 0, limit: DAILY_LIMIT });
  }
  const now = Date.now();
  state.recent = state.recent.filter((t) => now - t < FREQUENT_WINDOW_MS);
  const tooFrequent = state.recent.length >= FREQUENT_COUNT - 1;

  const userTexts = messages.filter((m) => m.role === 'user').map((m) => m.content);
  const systemText = buildSystemPrompt({
    subject: cleanText(body.subject, 60),
    grade: cleanText(String(body.grade || ''), 4),
    lang: body.lang === 'uz' ? 'uz' : 'ru',
    turn: Math.min(Number(body.turn) || userTexts.length, 1000),
    tooFrequent,
    verified: verifyStudentMessages(userTexts),
  });

  let reply;
  try {
    reply = await generate(systemText, messages);
  } catch (err) {
    return aiErrorResponse(res, err);
  }

  // Function 3: re-check the model's own arithmetic in code.
  const wrong = findWrongClaims(reply);
  if (wrong.length) {
    const fix = wrong.map((c) => `${c.src} = ${fmt(c.value)}`).join('; ');
    reply += body.lang === 'uz'
      ? `\n\n⚠️ Server tekshiruvi: hisobda xato bor. To'g'risi: ${fix}`
      : `\n\n⚠️ Проверка сервера: в вычислении ошибка. Правильно: ${fix}`;
  }

  state.count += 1;
  state.recent.push(now);
  sendJson(res, 200, {
    reply,
    remaining: DAILY_LIMIT - state.count,
    limit: DAILY_LIMIT,
    tooFrequent,
    corrected: wrong.length > 0,
  });
}

async function handleReport(req, res) {
  if (!API_KEY) return sendJson(res, 500, { code: 'ai_error' });
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return sendJson(res, 400, { code: 'bad_request' });
  }
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
    sendJson(res, 200, { report });
  } catch (err) {
    aiErrorResponse(res, err);
  }
}

function serveStatic(res, urlPath) {
  const entry = STATIC[urlPath];
  if (!entry) return false;
  fs.readFile(path.join(PUBLIC_DIR, entry[0]), (err, data) => {
    if (err) return sendJson(res, 404, { code: 'not_found' });
    res.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': 'no-cache' });
    res.end(data);
  });
  return true;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  if (req.method === 'POST' && urlPath === '/api/chat') return handleChat(req, res);
  if (req.method === 'POST' && urlPath === '/api/report') return handleReport(req, res);
  if (req.method === 'GET' && urlPath === '/health') return sendJson(res, 200, { ok: true });
  if (req.method === 'GET' && serveStatic(res, urlPath)) return;
  sendJson(res, 404, { code: 'not_found' });
});

server.listen(PORT, () => console.log(`AI tutor listening on port ${PORT}, model ${MODEL}`));
