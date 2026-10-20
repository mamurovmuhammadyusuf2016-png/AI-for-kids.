const http = require('http');
const fs = require('fs');
const path = require('path');
const SYSTEM_PROMPT = require('./prompt');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL || 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_HISTORY = 20;

const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-MAX_HISTORY);
}

async function handleChat(req, res) {
  if (!API_KEY) return sendJson(res, 500, { error: 'AI_API_KEY не задан на сервере' });
  let messages;
  try {
    messages = cleanMessages(JSON.parse(await readBody(req)).messages);
  } catch {
    return sendJson(res, 400, { error: 'Неверный запрос' });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return sendJson(res, 400, { error: 'Нет сообщения' });
  }

  try {
    const r = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.4,
        max_tokens: 1024,
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('Groq error', r.status, JSON.stringify(data));
      return sendJson(res, 502, { error: 'ИИ временно недоступен, попробуй ещё раз' });
    }
    const reply = data.choices?.[0]?.message?.content?.trim() || '...';
    sendJson(res, 200, { reply });
  } catch (err) {
    console.error('Chat failed', err);
    sendJson(res, 502, { error: 'ИИ временно недоступен, попробуй ещё раз' });
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') return handleChat(req, res);
  if (req.method === 'GET' && req.url === '/health') return sendJson(res, 200, { ok: true });
  if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?'))) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(indexHtml);
  }
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`AI tutor listening on port ${PORT}, model ${MODEL}`));
