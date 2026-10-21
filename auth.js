// Accounts: email + password registration, Google sign-in, cookie sessions
// and the per-account daily question counter. Data lives in Postgres.
const crypto = require('crypto');
const { promisify } = require('util');
const { Pool } = require('pg');

const scrypt = promisify(crypto.scrypt);

const DATABASE_URL = process.env.DATABASE_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SESSION_COOKIE = 'nimi_session';
const SESSION_DAYS = 30;
const MAX_FAILED_LOGINS = 10;
const FAILED_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    })
  : null;

// "ip|email" -> [timestamps of failed logins]
const failedLogins = new Map();

class AuthError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

async function init() {
  if (!pool) {
    console.warn('DATABASE_URL is not set: accounts are disabled');
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_sub TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS usage (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day DATE NOT NULL,
      count INT NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
    CREATE TABLE IF NOT EXISTS learn_usage (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day DATE NOT NULL,
      count INT NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
    CREATE TABLE IF NOT EXISTS user_data (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, key)
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_kind TEXT;
    CREATE TABLE IF NOT EXISTS payment_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      months INT NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at TIMESTAMPTZ
    );
    CREATE TABLE IF NOT EXISTS topic_cache (
      subject TEXT NOT NULL,
      grade INT NOT NULL,
      lang TEXT NOT NULL,
      topics JSONB NOT NULL,
      PRIMARY KEY (subject, grade, lang)
    );
  `);
  console.log('Accounts database ready');
}

function requirePool() {
  if (!pool) throw new AuthError('auth_unavailable', 503);
  return pool;
}

// ---------- passwords ----------
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function checkPassword(password, stored) {
  const [, saltB64, hashB64] = (stored || 'scrypt$$').split('$');
  const expected = Buffer.from(hashB64 || '', 'base64');
  const actual = await scrypt(password, Buffer.from(saltB64 || '', 'base64'), 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// Used for unknown emails so a wrong email and a wrong password take the same time.
const DUMMY_HASH = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

function normalizeEmail(v) {
  const email = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new AuthError('invalid_email');
  return email;
}

function validatePassword(v) {
  if (typeof v !== 'string' || v.length < 8 || v.length > 128 || !/\p{L}/u.test(v) || !/\d/.test(v)) {
    throw new AuthError('weak_password');
  }
  return v;
}

// ---------- sessions ----------
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isHttps(req) {
  return req.headers['x-forwarded-proto'] === 'https';
}

function sessionCookie(req, token, maxAge) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`;
}

async function startSession(req, userId) {
  const db = requirePool();
  const token = crypto.randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + make_interval(days => $3))`,
    [sha256(token), userId, SESSION_DAYS],
  );
  db.query('DELETE FROM sessions WHERE expires_at < now()').catch(() => {});
  return sessionCookie(req, token, SESSION_DAYS * 24 * 3600);
}

async function getUser(req) {
  if (!pool) return null;
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.created_at, u.premium_until, u.plan_kind,
            u.password_hash IS NOT NULL AS has_password, u.google_sub IS NOT NULL AS has_google
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  );
  return rows[0] || null;
}

// ---------- subscription: the owner grants a free week or paid months by hand ----------
const TRIAL_DAYS = 7;

// never: no free week or subscription was ever given; trial: the current access is the free week.
function plan(u) {
  if (!u.created_at) return { active: true, trial: false, never: false, until: null };
  const until = u.premium_until ? new Date(u.premium_until).getTime() : 0;
  return { active: until > Date.now(), trial: u.plan_kind === 'trial', never: !until, until: until ? new Date(until).toISOString() : null };
}

function publicUser(u) {
  return { email: u.email, google: !!u.has_google, password: !!u.has_password, plan: plan(u) };
}

// One open request per student; returns the existing one if it is still pending.
async function requestSubscription(userId, months) {
  const db = requirePool();
  const open = await db.query(`SELECT id, months, created_at FROM payment_requests WHERE user_id = $1 AND status = 'pending'`, [userId]);
  if (open.rows.length) {
    if (open.rows[0].months !== months) await db.query('UPDATE payment_requests SET months = $2 WHERE id = $1', [open.rows[0].id, months]);
    return { ...open.rows[0], months };
  }
  const { rows } = await db.query('INSERT INTO payment_requests (user_id, months) VALUES ($1, $2) RETURNING id, months, created_at', [userId, months]);
  return rows[0];
}

async function listRequests() {
  const { rows } = await requirePool().query(
    `SELECT r.id, r.months, r.status, r.created_at, r.resolved_at, u.email, u.premium_until
       FROM payment_requests r JOIN users u ON u.id = r.user_id
      ORDER BY (r.status = 'pending') DESC, r.created_at DESC LIMIT 50`,
  );
  return rows;
}

// Adds access after the current end (or from now if it has passed).
// months = 0 is the free week; otherwise paid months of 30 days.
async function grantMonths(email, months, requestId) {
  const db = requirePool();
  const { rows } = await db.query(
    `UPDATE users SET premium_until = GREATEST(COALESCE(premium_until, now()), now()) + make_interval(days => $2), plan_kind = $3
      WHERE email = $1 RETURNING id, email, premium_until, plan_kind`,
    [normalizeEmail(email), months ? months * 30 : TRIAL_DAYS, months ? 'paid' : 'trial'],
  );
  if (!rows.length) throw new AuthError('user_not_found', 404);
  // Close the request it pays for, or every open request of this student.
  if (requestId) {
    await db.query(`UPDATE payment_requests SET status = $2, resolved_at = now() WHERE id = $1`, [requestId, months ? 'paid' : 'granted']);
  } else {
    await db.query(`UPDATE payment_requests SET status = $2, resolved_at = now() WHERE user_id = $1 AND status = 'pending'`, [rows[0].id, months ? 'paid' : 'granted']);
  }
  return rows[0];
}

async function rejectRequest(id) {
  await requirePool().query(`UPDATE payment_requests SET status = 'rejected', resolved_at = now() WHERE id = $1 AND status = 'pending'`, [id]);
}

// ---------- brute-force protection ----------
function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
}

function recentFailures(key) {
  const now = Date.now();
  const list = (failedLogins.get(key) || []).filter((t) => now - t < FAILED_WINDOW_MS);
  failedLogins.set(key, list);
  return list;
}

// ---------- actions ----------
async function register(req, body) {
  const db = requirePool();
  const email = normalizeEmail(body.email);
  const password = validatePassword(body.password);
  const hash = await hashPassword(password);
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id, email`,
    [email, hash],
  );
  if (!rows.length) throw new AuthError('email_taken', 409);
  const user = { ...rows[0], has_password: true, has_google: false };
  return { user, cookie: await startSession(req, user.id) };
}

async function login(req, body) {
  const db = requirePool();
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';
  const key = `${clientIp(req)}|${email}`;
  if (recentFailures(key).length >= MAX_FAILED_LOGINS) throw new AuthError('too_many_attempts', 429);

  const { rows } = await db.query(
    'SELECT id, email, password_hash, google_sub IS NOT NULL AS has_google FROM users WHERE email = $1',
    [email],
  );
  const user = rows[0];
  const ok = await checkPassword(password, user?.password_hash || DUMMY_HASH);
  if (user && !user.password_hash) throw new AuthError('use_google', 401);
  if (!user || !ok) {
    recentFailures(key).push(Date.now());
    throw new AuthError('invalid_credentials', 401);
  }
  failedLogins.delete(key);
  return { user: { ...user, has_password: true }, cookie: await startSession(req, user.id) };
}

async function verifyGoogleToken(credential) {
  if (!GOOGLE_CLIENT_ID) throw new AuthError('auth_unavailable', 503);
  if (typeof credential !== 'string' || credential.length > 4096) throw new AuthError('google_failed', 401);
  const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const info = await r.json().catch(() => ({}));
  const valid = r.ok &&
    info.aud === GOOGLE_CLIENT_ID &&
    GOOGLE_ISSUERS.has(info.iss) &&
    Number(info.exp) * 1000 > Date.now() &&
    info.email_verified === 'true' &&
    info.sub && info.email;
  if (!valid) throw new AuthError('google_failed', 401);
  return { sub: String(info.sub), email: normalizeEmail(info.email) };
}

async function google(req, body) {
  const db = requirePool();
  const { sub, email } = await verifyGoogleToken(body.credential);
  const known = await db.query(
    'SELECT id, email, google_sub, password_hash IS NOT NULL AS has_password FROM users WHERE google_sub = $1',
    [sub],
  );
  if (known.rows.length) {
    const user = known.rows[0];
    return { user: { ...user, has_google: true }, cookie: await startSession(req, user.id) };
  }
  // New Google account, or an email account with the same (Google-verified) address.
  const { rows } = await db.query(
    `INSERT INTO users (email, google_sub) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET google_sub = COALESCE(users.google_sub, EXCLUDED.google_sub)
     RETURNING id, email, google_sub, password_hash IS NOT NULL AS has_password`,
    [email, sub],
  );
  const user = rows[0];
  if (user.google_sub !== sub) throw new AuthError('google_failed', 401);
  return { user: { ...user, has_google: true }, cookie: await startSession(req, user.id) };
}

async function logout(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (pool && token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
  return sessionCookie(req, '', 0);
}

// ---------- daily question counter ----------
async function usedToday(userId, day) {
  const { rows } = await requirePool().query('SELECT count FROM usage WHERE user_id = $1 AND day = $2', [userId, day]);
  return rows[0]?.count || 0;
}

async function countQuestion(userId, day) {
  const { rows } = await requirePool().query(
    `INSERT INTO usage (user_id, day, count) VALUES ($1, $2, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET count = usage.count + 1 RETURNING count`,
    [userId, day],
  );
  return rows[0].count;
}

// ---------- learning data ----------
// Daily counter for generated exercises (separate from chat questions).
async function countGeneration(userId, day) {
  const { rows } = await requirePool().query(
    `INSERT INTO learn_usage (user_id, day, count) VALUES ($1, $2, 1)
     ON CONFLICT (user_id, day) DO UPDATE SET count = learn_usage.count + 1 RETURNING count`,
    [userId, day],
  );
  return rows[0].count;
}

async function generationsToday(userId, day) {
  const { rows } = await requirePool().query('SELECT count FROM learn_usage WHERE user_id = $1 AND day = $2', [userId, day]);
  return rows[0]?.count || 0;
}

async function getData(userId) {
  const { rows } = await requirePool().query('SELECT key, value FROM user_data WHERE user_id = $1', [userId]);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function setData(userId, key, value) {
  await requirePool().query(
    `INSERT INTO user_data (user_id, key, value, updated_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [userId, key, JSON.stringify(value)],
  );
}

async function cachedTopics(subject, grade, lang) {
  if (!pool) return null;
  const { rows } = await pool.query('SELECT topics FROM topic_cache WHERE subject = $1 AND grade = $2 AND lang = $3', [subject, grade, lang]);
  return rows[0]?.topics || null;
}

async function cacheTopics(subject, grade, lang, topics) {
  if (!pool) return;
  await pool.query(
    `INSERT INTO topic_cache (subject, grade, lang, topics) VALUES ($1, $2, $3, $4)
     ON CONFLICT (subject, grade, lang) DO UPDATE SET topics = EXCLUDED.topics`,
    [subject, grade, lang, JSON.stringify(topics)],
  );
}

module.exports = {
  plan,
  requestSubscription,
  listRequests,
  grantMonths,
  rejectRequest,
  countGeneration,
  generationsToday,
  getData,
  setData,
  cachedTopics,
  cacheTopics,
  AuthError,
  init,
  getUser,
  publicUser,
  register,
  login,
  google,
  logout,
  usedToday,
  countQuestion,
  GOOGLE_CLIENT_ID,
  enabled: () => !!pool,
};
