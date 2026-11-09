// Run inside the app container. Creates and removes only its own test accounts.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { Pool } = require('pg');
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';
const email = `deploy-check-${crypto.randomUUID()}@example.invalid`;
const password = `Check-${crypto.randomBytes(18).toString('hex')}`;
let cookie;
async function post(path, body, extra = {}) {
  const response = await fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'Origin': new URL(base).origin, ...(cookie ? { Cookie: cookie } : {}), ...extra },
    body: JSON.stringify(body), signal: AbortSignal.timeout(150000),
  });
  return { response, data: await response.json() };
}
async function main() {
  for (const path of ['/', '/health', '/health?db=1', '/styles.css', '/app.js', '/learn-ui.js', '/vendor/katex/katex.min.js', '/privacy.html']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const head = await fetch(base + path, { method: 'HEAD' });
    assert.equal(head.status, 200, `HEAD ${path}`);
    assert.equal(await head.text(), '', `HEAD ${path} must have no body`);
  }
  assert.equal((await (await fetch(base + '/api/config')).json()).accounts, true);
  const registered = await post('/api/auth/register', { email, password, terms: true, lang: 'ru' });
  assert.equal(registered.response.status, 200, JSON.stringify(registered.data));
  cookie = registered.response.headers.get('set-cookie').split(';')[0];
  assert.match(registered.response.headers.get('set-cookie'), /HttpOnly/);
  if (base.startsWith('https:')) assert.match(registered.response.headers.get('set-cookie'), /Secure/);
  assert.equal(registered.data.user.role, 'student');
  assert.equal(registered.data.user.plan.active, false);
  assert.equal(registered.data.user.free.chat, 20);
  assert.equal((await post('/api/admin/users', {})).response.status, 403);
  // Without a subscription only the chat is free (20 questions); a test is locked before any AI call.
  assert.equal((await post('/api/learn/test', { subject: 'math', grade: 2, lang: 'ru' })).response.status, 402);
  const settings = await post('/api/account/settings', {});
  assert.equal(settings.response.status, 200);
  assert.ok(settings.data.parent.login && settings.data.parent.password);
  const studentCookie = cookie;
  const parent = await post('/api/auth/login', { email: settings.data.parent.login, password: settings.data.parent.password });
  assert.equal(parent.response.status, 200);
  assert.equal(parent.data.user.role, 'parent');
  cookie = parent.response.headers.get('set-cookie').split(';')[0];
  const overview = await post('/api/parent/overview', {});
  assert.equal(overview.response.status, 200);
  assert.equal(overview.data.child.email, email);
  assert.equal((await post('/api/data', {})).response.status, 403);
  cookie = studentCookie;
  assert.equal((await post('/api/data', { key: 'diary', value: [{ text: 'deploy smoke test' }] })).response.status, 200);
  assert.equal((await post('/api/data', {})).data.diary[0].text, 'deploy smoke test');
  const forbidden = await post('/api/data', {}, { Origin: 'https://example.invalid' });
  assert.equal(forbidden.response.status, 403);
  await post('/api/auth/logout', {});
  const signedIn = await post('/api/auth/login', { email, password });
  assert.equal(signedIn.response.status, 200);
  assert.equal(signedIn.data.user.plan.active, false);
  cookie = signedIn.response.headers.get('set-cookie').split(';')[0];
  const grant = await post('/api/admin/grant', { email, months: 0 }, { 'X-Admin-Key': process.env.ADMIN_API_KEY });
  assert.equal(grant.response.status, 200);
  const response = await fetch(base + '/api/chat', {
    method:'POST', headers: { 'Content-Type':'application/json', Cookie:cookie, Origin:new URL(base).origin },
    body:JSON.stringify({messages:[{role:'user',content:'Объясни коротко, сколько будет 2 + 2.'}], grade:2, lang:'ru', stream:true}),
    signal:AbortSignal.timeout(150000),
  });
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.ok(text.includes('"type":"delta"') && text.includes('"type":"done"') && !text.includes('"type":"error"'), text.slice(0,500));
  console.log('PASS: static assets, database, registration, student/parent accounts, login, logout, access controls, saved data, subscription, live Gemini answer');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try { await pool.query('DELETE FROM users WHERE email = $1', [email]); }
  finally { await pool.end(); }
});
