// Accounts: email + password registration, Google sign-in, cookie sessions
// and the per-account daily question counter. Data lives in Postgres.
const crypto = require('crypto');
const { promisify } = require('util');
const { Pool } = require('pg');
const { PLANS, DEFAULT_PLAN, planId, FREE_TRIES } = require('./plans');
const notify = require('./notify');

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

// Neon closes idle connections (it sleeps between visits). Without this handler such a drop is an
// unhandled 'error' event and the whole server stops; the pool simply opens a new connection next time.
if (pool) pool.on('error', (err) => console.warn(`Database connection dropped: ${err.message}`));

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
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_of BIGINT REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS secret_enc TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_tier TEXT;
    CREATE TABLE IF NOT EXISTS payment_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      months INT NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at TIMESTAMPTZ
    );
    ALTER TABLE payment_requests ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'pro';
    CREATE TABLE IF NOT EXISTS token_usage (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      month TEXT NOT NULL,
      input BIGINT NOT NULL DEFAULT 0,
      output BIGINT NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, month)
    );
    CREATE TABLE IF NOT EXISTS topic_cache (
      subject TEXT NOT NULL,
      grade INT NOT NULL,
      lang TEXT NOT NULL,
      topics JSONB NOT NULL,
      PRIMARY KEY (subject, grade, lang)
    );
    -- Free tries of paid sections without a subscription: {"chat": 3, "test": 1, ...}.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS free_used JSONB NOT NULL DEFAULT '{}'::jsonb;
    -- Chat history (texts only; photos stay on the device). Seen only by the student.
    CREATE TABLE IF NOT EXISTS chats (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      id TEXT NOT NULL,
      subject TEXT NOT NULL,
      grade INT NOT NULL,
      day DATE NOT NULL,
      messages JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, id)
    );
    CREATE INDEX IF NOT EXISTS chats_user_updated ON chats (user_id, updated_at DESC);
    -- Sign-up by phone (the number, 998XXXXXXXXX, is also the login in the email column),
    -- confirmed contacts and consents: the rules (required) and news by SMS / email / calls (optional).
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_at TIMESTAMPTZ;
    -- Every consent given or withdrawn, with the exact text shown: proof if anyone asks.
    CREATE TABLE IF NOT EXISTS consents (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      granted BOOLEAN NOT NULL,
      version TEXT NOT NULL,
      lang TEXT NOT NULL,
      text TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS consents_user ON consents (user_id, at DESC);
    -- One-time codes (stored as a keyed hash) and a log of sends for the limits.
    CREATE TABLE IF NOT EXISTS verify_codes (
      target TEXT NOT NULL,
      purpose TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      attempts INT NOT NULL DEFAULT 0,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (target, purpose)
    );
    CREATE TABLE IF NOT EXISTS verify_sends (
      id BIGSERIAL PRIMARY KEY,
      channel TEXT NOT NULL,
      target TEXT NOT NULL,
      ip TEXT NOT NULL,
      at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS verify_sends_at ON verify_sends (at);
    -- Leaderboard points counted by the server (per day, Tashkent time), not taken from the browser.
    CREATE TABLE IF NOT EXISTS leader_points (
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      board TEXT NOT NULL,
      day DATE NOT NULL,
      points INT NOT NULL DEFAULT 0,
      last_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, board, day)
    );
    CREATE INDEX IF NOT EXISTS leader_points_board_day ON leader_points (board, day);
    -- Admin SMS broadcasts (to students who agreed to news), sent slowly from the owner's phone.
    CREATE TABLE IF NOT EXISTS sms_broadcasts (
      id BIGSERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      total INT NOT NULL DEFAULT 0,
      sent INT NOT NULL DEFAULT 0,
      failed INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'sending'
    );
    CREATE TABLE IF NOT EXISTS sms_outbox (
      id BIGSERIAL PRIMARY KEY,
      broadcast_id BIGINT NOT NULL REFERENCES sms_broadcasts(id) ON DELETE CASCADE,
      user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      at TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS sms_outbox_pending ON sms_outbox (status, id);
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

// Parent and admin accounts sign in with a login instead of an email (stored in the email column);
// phone accounts with their number.
const LOGIN_RE = /^[a-z0-9][a-z0-9-]{2,31}$/;
function normalizeLogin(v) {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (s.includes('@')) return normalizeEmail(s);
  if (isPhoneLike(s)) return normalizePhone(s);
  if (!LOGIN_RE.test(s)) throw new AuthError('invalid_email');
  return s;
}

function normalizeEmail(v) {
  const email = typeof v === 'string' ? v.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new AuthError('invalid_email');
  return email;
}

// Uzbek mobile numbers only: 998 and 9 digits. "+998 90 123-45-67" and "901234567" are accepted.
const isPhoneLike = (v) => typeof v === 'string' && /^[\d\s+()-]{9,20}$/.test(v.trim()) && /^(998)?\d{9}$/.test(v.replace(/\D/g, ''));
function normalizePhone(v) {
  const d = typeof v === 'string' ? v.replace(/\D/g, '') : '';
  const phone = d.length === 9 ? `998${d}` : d;
  if (!/^998\d{9}$/.test(phone)) throw new AuthError('invalid_phone');
  return phone;
}

// A student's account name in admin tools: a phone number or an email.
const normalizeAccount = (v) => (isPhoneLike(v) ? normalizePhone(v) : normalizeEmail(v));

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
    `SELECT u.id, u.email, u.created_at, u.premium_until, u.plan_kind, u.plan_tier, u.role, u.parent_of, u.free_used,
            u.phone, u.terms_at, u.marketing,
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
// tier: pro/gold/max (the free week counts as Pro); limits are its monthly token limits,
// questions its daily chat questions.
function plan(u) {
  const tier = u.plan_kind === 'trial' ? DEFAULT_PLAN : planId(u.plan_tier);
  const limits = { input: PLANS[tier].input, output: PLANS[tier].output };
  const { questions } = PLANS[tier];
  if (!u.created_at) return { active: true, trial: false, never: false, until: null, tier, limits, questions };
  const until = u.premium_until ? new Date(u.premium_until).getTime() : 0;
  return { active: until > Date.now(), trial: u.plan_kind === 'trial', never: !until, until: until ? new Date(until).toISOString() : null, tier, limits, questions };
}

// Free tries left per section, e.g. { chat: 20, test: 1, ... }.
function freeLeft(u) {
  const used = u.free_used || {};
  return Object.fromEntries(Object.entries(FREE_TRIES).map(([k, n]) => [k, Math.max(0, n - (Number(used[k]) || 0))]));
}

// Spends one free try of a section; false when none were left (counted atomically).
async function useFree(userId, key) {
  if (!Object.hasOwn(FREE_TRIES, key)) return false;
  const { rowCount } = await requirePool().query(
    `UPDATE users SET free_used = jsonb_set(free_used, ARRAY[$2::text], to_jsonb(COALESCE((free_used->>$2)::int, 0) + 1))
      WHERE id = $1 AND COALESCE((free_used->>$2)::int, 0) < $3`,
    [userId, key, FREE_TRIES[key]],
  );
  return rowCount > 0;
}

function publicUser(u) {
  return {
    email: u.email, phone: !!u.phone, google: !!u.has_google, password: !!u.has_password, plan: plan(u), role: u.role || 'student', free: freeLeft(u),
    terms: !!u.terms_at, marketing: !!u.marketing,
  };
}

// ---------- parent accounts ----------
// The parent's password is shown to the child in Settings, so besides the hash it is kept
// encrypted (AES-256-GCM) with a server key.
const SECRET = crypto.createHash('sha256').update(process.env.SECRET_KEY || process.env.ADMIN_API_KEY || 'nimi-dev-secret').digest();

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', SECRET, iv);
  const data = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString('base64')).join('.');
}

function decrypt(value) {
  try {
    const [iv, tag, data] = value.split('.').map((x) => Buffer.from(x, 'base64'));
    const d = crypto.createDecipheriv('aes-256-gcm', SECRET, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(data), d.final()]).toString('utf8');
  } catch {
    return null;
  }
}

// Easy to type: no 0/O, 1/l; always has letters and a digit.
function readablePassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const pick = (set) => set[crypto.randomInt(set.length)];
  return `${Array.from({ length: 4 }, () => pick(letters)).join('')}-${Array.from({ length: 4 }, () => pick(digits)).join('')}`;
}

async function setParentPassword(parentId) {
  const password = readablePassword();
  await requirePool().query('UPDATE users SET password_hash = $2, secret_enc = $3 WHERE id = $1', [parentId, await hashPassword(password), encrypt(password)]);
  return password;
}

// Creates the child's parent account once; returns { login, password }.
async function ensureParent(childId) {
  const db = requirePool();
  const found = await db.query(`SELECT id, email, secret_enc FROM users WHERE parent_of = $1 AND role = 'parent'`, [childId]);
  if (found.rows.length) {
    const p = found.rows[0];
    return { login: p.email, password: decrypt(p.secret_enc || '') || (await setParentPassword(p.id)) };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const login = `parent-${crypto.randomInt(100000, 1000000)}`;
    const password = readablePassword();
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, secret_enc, role, parent_of) VALUES ($1, $2, $3, 'parent', $4)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [login, await hashPassword(password), encrypt(password), childId],
    );
    if (rows.length) return { login, password };
  }
  throw new Error('could not create parent login');
}

async function resetParentPassword(childId) {
  const { rows } = await requirePool().query(`SELECT id, email FROM users WHERE parent_of = $1 AND role = 'parent'`, [childId]);
  if (!rows.length) return ensureParent(childId);
  return { login: rows[0].email, password: await setParentPassword(rows[0].id) };
}

async function getChild(childId) {
  const { rows } = await requirePool().query(
    `SELECT id, email, created_at, premium_until, plan_kind, plan_tier, role, free_used FROM users WHERE id = $1 AND role = 'student'`,
    [childId],
  );
  return rows[0] || null;
}

async function setPassword(userId, password) {
  validatePassword(password);
  await requirePool().query('UPDATE users SET password_hash = $2 WHERE id = $1', [userId, await hashPassword(password)]);
}

// ---------- admin tools ----------
async function listStudents(search) {
  const raw = (search || '').toLowerCase().slice(0, 60);
  const q = `%${/^[\d\s+()-]+$/.test(raw) ? raw.replace(/\D/g, '') : raw}%`;
  const { rows } = await requirePool().query(
    `SELECT email, created_at, premium_until, plan_kind, plan_tier, google_sub IS NOT NULL AS google, marketing
       FROM users WHERE role = 'student' AND email LIKE $1 ORDER BY created_at DESC LIMIT 100`,
    [q],
  );
  return rows;
}

async function resetStudentPassword(email) {
  const { rows } = await requirePool().query(`SELECT id FROM users WHERE email = $1 AND role = 'student'`, [normalizeAccount(email)]);
  if (!rows.length) throw new AuthError('user_not_found', 404);
  const password = readablePassword();
  await requirePool().query('UPDATE users SET password_hash = $2 WHERE id = $1', [rows[0].id, await hashPassword(password)]);
  await requirePool().query('DELETE FROM sessions WHERE user_id = $1', [rows[0].id]);
  return password;
}

// Deletes a student with everything linked (parent account, sessions, progress, requests).
async function deleteStudent(email) {
  const { rowCount } = await requirePool().query(`DELETE FROM users WHERE email = $1 AND role = 'student'`, [normalizeAccount(email)]);
  if (!rowCount) throw new AuthError('user_not_found', 404);
}

// Creates (or resets the password of) a staff account that only sees the admin panel.
// password is optional: without it a random one is made.
async function createAdminAccount(login, chosenPassword) {
  const name = normalizeLogin(login);
  if (name.includes('@')) throw new AuthError('invalid_email');
  const password = chosenPassword ? validatePassword(chosenPassword) : `${readablePassword()}-${readablePassword()}`;
  await requirePool().query(
    `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [name, await hashPassword(password)],
  );
  return { login: name, password };
}

// One open request per student; returns the existing one if it is still pending.
async function requestSubscription(userId, months, tier) {
  const db = requirePool();
  const open = await db.query(`SELECT id, months, plan, created_at FROM payment_requests WHERE user_id = $1 AND status = 'pending'`, [userId]);
  if (open.rows.length) {
    if (open.rows[0].months !== months || open.rows[0].plan !== tier) await db.query('UPDATE payment_requests SET months = $2, plan = $3 WHERE id = $1', [open.rows[0].id, months, tier]);
    return { ...open.rows[0], months, plan: tier };
  }
  const { rows } = await db.query('INSERT INTO payment_requests (user_id, months, plan) VALUES ($1, $2, $3) RETURNING id, months, plan, created_at', [userId, months, tier]);
  return rows[0];
}

async function listRequests() {
  const { rows } = await requirePool().query(
    `SELECT r.id, r.months, r.plan, r.status, r.created_at, r.resolved_at, u.email, u.premium_until, u.plan_kind, u.plan_tier
       FROM payment_requests r JOIN users u ON u.id = r.user_id
      ORDER BY (r.status = 'pending') DESC, r.created_at DESC LIMIT 50`,
  );
  return rows;
}

// Adds access after the current end (or from now if it has passed).
// months = 0 is the free week; otherwise paid months of 30 days on the given plan (pro/gold/max;
// without a plan the student keeps the current one).
async function grantMonths(email, months, requestId, tier) {
  const db = requirePool();
  const { rows } = await db.query(
    `UPDATE users SET premium_until = GREATEST(COALESCE(premium_until, now()), now()) + make_interval(days => $2), plan_kind = $3,
            plan_tier = CASE WHEN $3 = 'paid' THEN COALESCE($4::text, plan_tier, 'pro') ELSE plan_tier END
      WHERE email = $1 RETURNING id, email, premium_until, plan_kind, plan_tier`,
    [normalizeAccount(email), months ? months * 30 : TRIAL_DAYS, months ? 'paid' : 'trial', tier ? planId(tier) : null],
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
// ---------- consents ----------
// The exact texts of the two checkboxes. The site shows these (from /api/config) and the server
// records the one that was shown, so the record always matches what the person saw.
// When a text changes, raise CONSENT_VERSION.
const CONSENT_VERSION = '2026-11-06';
const CONSENT_TEXTS = {
  terms: {
    ru: 'Я принимаю правила использования и политику конфиденциальности Nimi AI и согласен(на) на обработку моих персональных данных (номер телефона или почта, учебные результаты) так, как в них описано. Если мне нет 18 лет, мои родители (законный представитель) согласны.',
    uz: "Men Nimi AI foydalanish qoidalari va maxfiylik siyosatini qabul qilaman hamda shaxsiy ma'lumotlarim (telefon raqami yoki pochta, o'qish natijalari) ularda yozilganidek qayta ishlanishiga roziman. 18 yoshga to'lmagan bo'lsam, ota-onam (qonuniy vakilim) bunga rozi.",
  },
  marketing: {
    ru: 'Я согласен(на) получать от Nimi AI SMS, письма и звонки о новостях, акциях и предложениях. Отказаться можно в любой момент в «Настройках».',
    uz: "Nimi AI menga yangiliklar, aksiyalar va takliflar haqida SMS, xat yuborishi va qo'ng'iroq qilishiga roziman. Bu rozilikdan istalgan vaqtda «Sozlamalar»da voz kechishim mumkin.",
  },
};
const consentLang = (v) => (v === 'ru' ? 'ru' : 'uz');

async function logConsent(db, req, userId, kind, granted, lang) {
  await db.query(
    `INSERT INTO consents (user_id, kind, granted, version, lang, text, ip, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [userId, kind, granted, CONSENT_VERSION, lang, CONSENT_TEXTS[kind][lang], clientIp(req).slice(0, 64), String(req.headers['user-agent'] || '').slice(0, 300)],
  );
}

// terms: true accepts the rules (once); marketing: true / false gives or withdraws the news consent.
async function applyConsents(req, userId, { terms, marketing, lang }) {
  const db = requirePool();
  const l = consentLang(lang);
  if (terms === true) {
    const { rowCount } = await db.query(`UPDATE users SET terms_at = now(), terms_version = $2 WHERE id = $1 AND terms_at IS NULL`, [userId, CONSENT_VERSION]);
    if (rowCount) await logConsent(db, req, userId, 'terms', true, l);
  }
  if (typeof marketing === 'boolean') {
    const { rowCount } = await db.query(
      `UPDATE users SET marketing = $2, marketing_at = now() WHERE id = $1 AND marketing IS DISTINCT FROM $2`,
      [userId, marketing],
    );
    if (rowCount) await logConsent(db, req, userId, 'marketing', marketing, l);
  }
}

// Students who agreed to news by SMS / email / calls (and did not withdraw), for the admin panel.
async function listMarketing() {
  const { rows } = await requirePool().query(
    `SELECT email, phone, marketing_at, created_at FROM users
      WHERE role = 'student' AND marketing ORDER BY marketing_at DESC LIMIT 20000`,
  );
  const { rows: [c] } = await requirePool().query(
    `SELECT count(*) FILTER (WHERE marketing) AS yes, count(*) AS total FROM users WHERE role = 'student'`,
  );
  return {
    users: rows.map((r) => ({ phone: r.phone, email: r.phone ? null : r.email, at: r.marketing_at, created: r.created_at })),
    yes: Number(c.yes), total: Number(c.total),
  };
}

// ---------- one-time codes (SMS / email) ----------
const CODE_TTL_MIN = 10;
const CODE_MAX_ATTEMPTS = 5;
const CODE_RESEND_SEC = 60;
const CODE_PER_TARGET_DAY = 5;
const CODE_PER_IP_HOUR = 10;
// A cap on paid SMS per day: protects the balance if someone floods the form.
const SMS_DAILY_LIMIT = Number(process.env.SMS_DAILY_LIMIT) || 300;
const SMS_HOURLY_LIMIT = Number(process.env.SMS_HOURLY_LIMIT) || 60;
const codeHash = (target, purpose, code) => crypto.createHmac('sha256', SECRET).update(`${purpose}|${target}|${code}`).digest('hex');

// { channel: 'sms' | 'email', target } from what the person typed.
function codeTarget(channel, to) {
  if (channel === 'sms') {
    if (!notify.smsEnabled()) throw new AuthError('auth_unavailable', 503);
    return normalizePhone(to);
  }
  if (!notify.emailEnabled()) throw new AuthError('auth_unavailable', 503);
  return normalizeEmail(to);
}

// Sends a code for sign-up ('register') or a new password ('reset').
async function sendCode(req, body) {
  const db = requirePool();
  const channel = body.channel === 'sms' ? 'sms' : 'email';
  const purpose = body.purpose === 'reset' ? 'reset' : 'register';
  const target = codeTarget(channel, body.to);
  const ip = clientIp(req).slice(0, 64);
  const { rows: [taken] } = await db.query(`SELECT id, role FROM users WHERE email = $1`, [target]);
  if (purpose === 'register' && taken) throw new AuthError(channel === 'sms' ? 'phone_taken' : 'email_taken', 409);
  const wait = await db.query(
    `SELECT CEIL(EXTRACT(EPOCH FROM sent_at + make_interval(secs => $3) - now()))::int AS s FROM verify_codes
      WHERE target = $1 AND purpose = $2 AND sent_at > now() - make_interval(secs => $3)`,
    [target, purpose, CODE_RESEND_SEC],
  );
  if (wait.rows.length) throw Object.assign(new AuthError('code_wait', 429), { retry: wait.rows[0].s });
  const { rows: [n] } = await db.query(
    `SELECT count(*) FILTER (WHERE target = $1 AND at > now() - interval '1 day') AS target_day,
            count(*) FILTER (WHERE ip = $2 AND at > now() - interval '1 hour') AS ip_hour,
            count(*) FILTER (WHERE channel = 'sms' AND at > now() - interval '1 day') AS sms_day,
            count(*) FILTER (WHERE channel = 'sms' AND at > now() - interval '1 hour') AS sms_hour
       FROM verify_sends WHERE at > now() - interval '1 day'`,
    [target, ip],
  );
  if (Number(n.target_day) >= CODE_PER_TARGET_DAY || Number(n.ip_hour) >= CODE_PER_IP_HOUR) throw new AuthError('code_limit', 429);
  if (channel === 'sms' && (Number(n.sms_day) >= SMS_DAILY_LIMIT || Number(n.sms_hour) >= SMS_HOURLY_LIMIT)) {
    console.warn(`SMS limit reached (${SMS_HOURLY_LIMIT} per hour / ${SMS_DAILY_LIMIT} per day): codes are paused for now`);
    throw new AuthError('code_limit', 429);
  }
  await db.query(`INSERT INTO verify_sends (channel, target, ip) VALUES ($1, $2, $3)`, [channel, target, ip]);
  db.query(`DELETE FROM verify_sends WHERE at < now() - interval '2 days'`).catch(() => {});
  // A new password only for an existing student account; the answer is the same either way,
  // so the form does not tell strangers which numbers and emails are registered.
  if (purpose === 'reset' && (!taken || taken.role !== 'student')) return { sent: true, retry: CODE_RESEND_SEC };
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  try {
    if (channel === 'sms') await notify.sendSmsCode(target, code, purpose);
    else await notify.sendEmailCode(target, code, purpose, body.lang);
  } catch {
    throw new AuthError('code_send_failed', 502);
  }
  await db.query(
    `INSERT INTO verify_codes (target, purpose, code_hash, expires_at) VALUES ($1, $2, $3, now() + make_interval(mins => $4))
     ON CONFLICT (target, purpose) DO UPDATE SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, sent_at = now()`,
    [target, purpose, codeHash(target, purpose, code), CODE_TTL_MIN],
  );
  return { sent: true, retry: CODE_RESEND_SEC };
}

// Checks a code; a correct one is used up. Five wrong tries and a new code is needed.
async function checkCode(target, purpose, code) {
  const db = requirePool();
  const clean = String(code || '').replace(/\D/g, '');
  const { rows: [row] } = await db.query(
    `UPDATE verify_codes SET attempts = attempts + 1 WHERE target = $1 AND purpose = $2 AND expires_at > now() AND attempts < $3
     RETURNING code_hash`,
    [target, purpose, CODE_MAX_ATTEMPTS],
  );
  if (!row) throw new AuthError('code_expired');
  const a = Buffer.from(row.code_hash);
  const b = Buffer.from(codeHash(target, purpose, clean));
  if (clean.length !== 6 || a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new AuthError('code_wrong');
  await db.query(`DELETE FROM verify_codes WHERE target = $1 AND purpose = $2`, [target, purpose]);
}

// ---------- actions ----------
// Sign-up by phone (always with an SMS code) or by email (with an email code when email sending
// is set up). The rules must be accepted; news by SMS / email / calls is a separate choice.
async function register(req, body) {
  const db = requirePool();
  if (body.terms !== true) throw new AuthError('terms_required');
  const byPhone = body.phone != null;
  const account = byPhone ? normalizePhone(body.phone) : normalizeEmail(body.email);
  const password = validatePassword(body.password);
  if (byPhone && !notify.smsEnabled()) throw new AuthError('auth_unavailable', 503);
  const exists = await db.query(`SELECT 1 FROM users WHERE email = $1`, [account]);
  if (exists.rows.length) throw new AuthError(byPhone ? 'phone_taken' : 'email_taken', 409);
  const verify = byPhone || notify.emailEnabled();
  if (verify) await checkCode(account, 'register', body.code);
  const hash = await hashPassword(password);
  const { rows } = await db.query(
    `INSERT INTO users (email, phone, password_hash, verified_at) VALUES ($1, $2, $3, CASE WHEN $4 THEN now() END)
     ON CONFLICT DO NOTHING RETURNING id, email`,
    [account, byPhone ? account : null, hash, verify],
  );
  if (!rows.length) throw new AuthError(byPhone ? 'phone_taken' : 'email_taken', 409);
  const user = { ...rows[0], has_password: true, has_google: false, role: 'student' };
  await applyConsents(req, user.id, { terms: true, marketing: body.marketing === true, lang: body.lang });
  await ensureParent(user.id);
  return { user, cookie: await startSession(req, user.id) };
}

// A new password with a code sent to the student's phone or email; signs in.
async function resetPassword(req, body) {
  const db = requirePool();
  const channel = body.channel === 'sms' ? 'sms' : 'email';
  const target = codeTarget(channel, body.to);
  const password = validatePassword(body.password);
  await checkCode(target, 'reset', body.code);
  const { rows } = await db.query(`SELECT id, email, role FROM users WHERE email = $1 AND role = 'student'`, [target]);
  if (!rows.length) throw new AuthError('code_expired');
  await db.query(`UPDATE users SET password_hash = $2, verified_at = COALESCE(verified_at, now()) WHERE id = $1`, [rows[0].id, await hashPassword(password)]);
  await db.query('DELETE FROM sessions WHERE user_id = $1', [rows[0].id]);
  return { user: { ...rows[0], has_password: true }, cookie: await startSession(req, rows[0].id) };
}

async function login(req, body) {
  const db = requirePool();
  const email = normalizeLogin(body.email);
  const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';
  const key = `${clientIp(req)}|${email}`;
  if (recentFailures(key).length >= MAX_FAILED_LOGINS) throw new AuthError('too_many_attempts', 429);

  const { rows } = await db.query(
    'SELECT id, email, role, password_hash, google_sub IS NOT NULL AS has_google FROM users WHERE email = $1',
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
  if (!valid) {
    // The reason only, without the token or the address: helps to see in the Render logs why sign-in failed.
    const why = !r.ok ? `tokeninfo ${r.status}` : info.aud !== GOOGLE_CLIENT_ID ? 'wrong client id' : !GOOGLE_ISSUERS.has(info.iss) ? 'wrong issuer'
      : Number(info.exp) * 1000 <= Date.now() ? 'expired' : info.email_verified !== 'true' ? 'email not verified' : 'no email';
    console.warn(`Google sign-in rejected: ${why}`);
    throw new AuthError('google_failed', 401);
  }
  return { sub: String(info.sub), email: normalizeEmail(info.email) };
}

// The Google account of an ID token: found, or created (with a parent account for a new student).
async function googleUser(body) {
  const db = requirePool();
  const { sub, email } = await verifyGoogleToken(body.credential);
  const known = await db.query(
    'SELECT id, email, google_sub, role, password_hash IS NOT NULL AS has_password FROM users WHERE google_sub = $1',
    [sub],
  );
  if (known.rows.length) {
    return { ...known.rows[0], has_google: true };
  }
  // New Google account, or an email account with the same (Google-verified) address.
  const { rows } = await db.query(
    `INSERT INTO users (email, google_sub) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET google_sub = COALESCE(users.google_sub, EXCLUDED.google_sub)
     RETURNING id, email, google_sub, role, password_hash IS NOT NULL AS has_password`,
    [email, sub],
  );
  const user = rows[0];
  if (user.google_sub !== sub) throw new AuthError('google_failed', 401);
  if (user.role === 'student') await ensureParent(user.id);
  return { ...user, has_google: true };
}

async function google(req, body) {
  const user = await googleUser(body);
  // Checkboxes ticked on the sign-up form; without them the site asks once after sign-in.
  if (user.role === 'student' && (body.terms === true || body.marketing === true)) {
    await applyConsents(req, user.id, { terms: body.terms === true, marketing: body.marketing === true ? true : undefined, lang: body.lang });
  }
  return { user, cookie: await startSession(req, user.id) };
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

// ---------- monthly token counter (the plan limits) ----------
async function tokensThisMonth(userId, month) {
  const { rows } = await requirePool().query('SELECT input, output FROM token_usage WHERE user_id = $1 AND month = $2', [userId, month]);
  return { input: Number(rows[0]?.input || 0), output: Number(rows[0]?.output || 0) };
}

async function addTokens(userId, month, used) {
  if (!used.input && !used.output) return;
  await requirePool().query(
    `INSERT INTO token_usage (user_id, month, input, output) VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, month) DO UPDATE SET input = token_usage.input + $3, output = token_usage.output + $4`,
    [userId, month, used.input, used.output],
  );
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

// ---------- leaderboards: games (coins) and the learning path (XP) ----------
// The server keeps its own count: after each lesson or battle the page reports "+N", and the server
// accepts at most what one lesson/battle can give, not more often than a real one can end, and not
// more than a daily cap. Editing numbers in the browser does not move anyone up.
// Names are made up from a hash of the account id (an animal and a number): no name, phone or email.
const LEADER_LIMIT = 20;
const LEADER_RULES = {
  path: { max: 20, gapMs: 30 * 1000, perDay: 300 },   // a lesson: 10–15 XP + 5 for no mistakes
  games: { max: 100, gapMs: 15 * 1000, perDay: 1000 }, // a battle: up to 50 coins + 30 for the daily chest
};
function nickOf(userId) {
  const h = crypto.createHmac('sha256', SECRET).update(`nick:${userId}`).digest();
  return { a: h[0] % 12, n: 100 + (h.readUInt16BE(1) % 900) };
}

async function addLeaderPoints(userId, board, amount) {
  const rule = LEADER_RULES[board];
  if (!rule) return { added: 0 };
  const n = Math.min(rule.max, Math.max(0, Math.floor(Number(amount) || 0)));
  if (!n) return { added: 0 };
  const db = requirePool();
  const { rows: [last] } = await db.query('SELECT max(last_at) AS at FROM leader_points WHERE user_id = $1 AND board = $2', [userId, board]);
  if (last.at && Date.now() - new Date(last.at).getTime() < rule.gapMs) return { added: 0 };
  const { rows: [r] } = await db.query(
    `INSERT INTO leader_points (user_id, board, day, points, last_at)
       VALUES ($1, $2, (now() AT TIME ZONE 'Asia/Tashkent')::date, LEAST($3::int, $4::int), now())
     ON CONFLICT (user_id, board, day) DO UPDATE SET points = LEAST(leader_points.points + EXCLUDED.points, $4::int), last_at = now()
     RETURNING points`,
    [userId, board, n, rule.perDay],
  );
  return { added: n, today: r.points };
}

// period: 'week' (since Monday, Tashkent time) or 'all'.
async function leaderboard(board, period, userId) {
  const b = board === 'path' ? 'path' : 'games';
  const week = period !== 'all';
  const { rows } = await requirePool().query(
    `WITH s AS (
       SELECT p.user_id AS id, sum(p.points)::bigint AS v
         FROM leader_points p JOIN users u ON u.id = p.user_id AND u.role = 'student'
        WHERE p.board = $1 AND ($2::boolean IS FALSE OR p.day >= date_trunc('week', now() AT TIME ZONE 'Asia/Tashkent')::date)
        GROUP BY p.user_id
     ), r AS (
       SELECT id, v, RANK() OVER (ORDER BY v DESC) AS rk FROM s WHERE v > 0
     )
     SELECT id, v, rk FROM r WHERE rk <= $3 OR id = $4 ORDER BY rk, id LIMIT $3 + 1`,
    [b, week, LEADER_LIMIT, userId],
  );
  const row = (r) => ({ ...nickOf(r.id), value: Number(r.v), rank: Number(r.rk), me: String(r.id) === String(userId) });
  const top = rows.filter((r) => Number(r.rk) <= LEADER_LIMIT).slice(0, LEADER_LIMIT).map(row);
  const mine = rows.find((r) => String(r.id) === String(userId));
  return { board: b, period: week ? 'week' : 'all', top, me: mine ? row(mine) : { ...nickOf(userId), value: 0, rank: null, me: true } };
}

// ---------- admin SMS broadcasts ----------
// Only to students who agreed to news (checked again right before each SMS), one SMS every
// SMS_BROADCAST_EVERY_SEC seconds and at most SMS_BROADCAST_DAILY a day: a personal SIM card
// that sends hundreds of messages at once can be blocked by the operator as spam.
const SMS_BROADCAST_DAILY = Number(process.env.SMS_BROADCAST_DAILY) || 100;
const SMS_BROADCAST_EVERY_SEC = Number(process.env.SMS_BROADCAST_EVERY_SEC) || 20;
const SMS_TEXT_MAX = 300;
const cleanSmsText = (v) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, SMS_TEXT_MAX);
const TODAY_TASHKENT = `date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent') AT TIME ZONE 'Asia/Tashkent'`;

// Who can get an SMS: students who agreed to news and have a phone; groups narrow it down.
const SMS_BASE = `role = 'student' AND marketing AND phone IS NOT NULL`;
const SMS_GROUPS = {
  all: 'TRUE',
  paid: `premium_until > now() AND plan_kind = 'paid'`,
  trial: `premium_until > now() AND plan_kind = 'trial'`,
  free: `(premium_until IS NULL OR premium_until <= now())`,
};

async function smsBroadcastInfo() {
  const db = requirePool();
  const [{ rows: [n] }, { rows: list }, { rows: [today] }, { rows: people }] = await Promise.all([
    db.query(`SELECT count(*)::int AS n,
                     count(*) FILTER (WHERE ${SMS_GROUPS.paid})::int AS paid,
                     count(*) FILTER (WHERE ${SMS_GROUPS.trial})::int AS trial,
                     count(*) FILTER (WHERE ${SMS_GROUPS.free})::int AS free
                FROM users WHERE ${SMS_BASE}`),
    db.query(`SELECT id, text, created_at, total, sent, failed, status FROM sms_broadcasts ORDER BY id DESC LIMIT 10`),
    db.query(`SELECT count(*)::int AS n FROM sms_outbox WHERE status = 'sent' AND at >= ${TODAY_TASHKENT}`),
    db.query(`SELECT phone, premium_until, plan_kind, plan_tier FROM users WHERE ${SMS_BASE} ORDER BY created_at DESC LIMIT 1000`),
  ]);
  return {
    gateway: notify.smsGate(), recipients: n.n, sentToday: today.n, dailyLimit: SMS_BROADCAST_DAILY, everySec: SMS_BROADCAST_EVERY_SEC,
    groups: { all: n.n, paid: n.paid, trial: n.trial, free: n.free },
    people: people.map((u) => ({ phone: u.phone, until: u.premium_until, kind: u.plan_kind, tier: u.plan_tier })),
    broadcasts: list.map((b) => ({ id: Number(b.id), text: b.text, at: b.created_at, total: b.total, sent: b.sent, failed: b.failed, status: b.status })),
  };
}

async function createBroadcast(text, group = 'all', phones = []) {
  const db = requirePool();
  const t = cleanSmsText(text);
  const pick = group === 'pick';
  const picked = pick ? [...new Set((Array.isArray(phones) ? phones : []).slice(0, 2000).map((p) => { try { return normalizePhone(String(p)); } catch { return null; } }).filter(Boolean))] : [];
  if (pick && !picked.length) throw new AuthError('bad_request');
  const where = pick ? 'phone = ANY($2::text[])' : SMS_GROUPS[group] || SMS_GROUPS.all;
  if (t.length < 2) throw new AuthError('bad_request');
  if (!notify.smsGate()) throw new AuthError('sms_unavailable', 503);
  const busy = await db.query(`SELECT 1 FROM sms_broadcasts WHERE status = 'sending' LIMIT 1`);
  if (busy.rows.length) throw new AuthError('broadcast_busy', 409);
  const { rows: [b] } = await db.query(`INSERT INTO sms_broadcasts (text) VALUES ($1) RETURNING id`, [t]);
  const { rowCount } = await db.query(
    `INSERT INTO sms_outbox (broadcast_id, user_id, phone)
     SELECT $1, id, phone FROM users WHERE ${SMS_BASE} AND ${where} ORDER BY id`, pick ? [b.id, picked] : [b.id]);
  await db.query(`UPDATE sms_broadcasts SET total = $2, status = CASE WHEN $2 = 0 THEN 'done' ELSE 'sending' END WHERE id = $1`, [b.id, rowCount]);
  if (rowCount) { broadcastActive = true; pausedUntil = 0; }
  return { id: Number(b.id), total: rowCount };
}

async function cancelBroadcast(id) {
  const db = requirePool();
  await db.query(`UPDATE sms_outbox SET status = 'cancelled' WHERE broadcast_id = $1 AND status = 'pending'`, [id]);
  await db.query(`UPDATE sms_broadcasts SET status = 'cancelled' WHERE id = $1 AND status = 'sending'`, [id]);
  return { ok: true };
}

// One test SMS to a number the admin types (e.g. their own) before sending to everyone.
const smsTests = [];
async function testSms(phone, text) {
  const t = cleanSmsText(text);
  if (t.length < 2) throw new AuthError('bad_request');
  if (!notify.smsGate()) throw new AuthError('sms_unavailable', 503);
  const target = normalizePhone(phone);
  const now = Date.now();
  while (smsTests.length && now - smsTests[0] > 3600 * 1000) smsTests.shift();
  if (smsTests.length >= 10) throw new AuthError('code_limit', 429);
  smsTests.push(now);
  try {
    await notify.sendText(target, t);
  } catch {
    throw new AuthError('code_send_failed', 502);
  }
  return { ok: true };
}

// Sends the next waiting SMS (called every SMS_BROADCAST_EVERY_SEC seconds by the server).
// The database is asked only while a broadcast is going on, so Neon can still sleep between
// visits (its free plan counts the hours it is awake). After the daily limit it waits for
// midnight in Tashkent (UTC+5).
let ticking = false;
let broadcastActive = false;
let pausedUntil = 0;
const nextTashkentMidnight = () => {
  const d = new Date(Date.now() + 5 * 3600 * 1000);
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime() - 5 * 3600 * 1000;
};
async function checkActiveBroadcast() {
  if (!pool) return;
  const { rows } = await pool.query(`SELECT 1 FROM sms_broadcasts WHERE status = 'sending' LIMIT 1`).catch(() => ({ rows: [] }));
  broadcastActive = rows.length > 0;
}
async function broadcastTick() {
  if (!pool || ticking || !broadcastActive || Date.now() < pausedUntil || !notify.smsGate()) return;
  ticking = true;
  try {
    const db = pool;
    const { rows: [today] } = await db.query(`SELECT count(*)::int AS n FROM sms_outbox WHERE status = 'sent' AND at >= ${TODAY_TASHKENT}`);
    if (today.n >= SMS_BROADCAST_DAILY) { pausedUntil = nextTashkentMidnight(); return; }
    const { rows: [m] } = await db.query(
      `UPDATE sms_outbox SET status = 'sending' WHERE id = (
         SELECT o.id FROM sms_outbox o JOIN sms_broadcasts b ON b.id = o.broadcast_id
          WHERE o.status = 'pending' AND b.status = 'sending' ORDER BY o.id LIMIT 1 FOR UPDATE OF o SKIP LOCKED)
       RETURNING id, broadcast_id, user_id, phone`);
    if (!m) { broadcastActive = false; return; }
    const { rows: [u] } = await db.query('SELECT marketing FROM users WHERE id = $1', [m.user_id]);
    const { rows: [b] } = await db.query('SELECT text FROM sms_broadcasts WHERE id = $1', [m.broadcast_id]);
    let status = 'skipped';
    if (u?.marketing) {
      try { await notify.sendText(m.phone, b.text); status = 'sent'; } catch { status = 'failed'; }
    }
    await db.query('UPDATE sms_outbox SET status = $2, at = now() WHERE id = $1', [m.id, status]);
    await db.query(
      `UPDATE sms_broadcasts SET sent = sent + $2, failed = failed + $3,
              status = CASE WHEN status = 'sending' AND NOT EXISTS (SELECT 1 FROM sms_outbox WHERE broadcast_id = $1 AND status IN ('pending', 'sending')) THEN 'done' ELSE status END
        WHERE id = $1`,
      [m.broadcast_id, status === 'sent' ? 1 : 0, status === 'failed' ? 1 : 0]);
  } catch (err) {
    console.warn(`SMS broadcast: ${err.message}`);
  } finally {
    ticking = false;
  }
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

// ---------- chat history ----------
// A chat as the browser keeps it: { id, date, subject, grade, messages: [{ role, content, ts, photo }] }.
const CHAT_KEEP = 50;
const chatOut = (r) => ({
  id: r.id, subject: r.subject, grade: r.grade, date: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
  updatedAt: new Date(r.updated_at).toISOString(), messages: r.messages,
});

// The newest chats with their messages (to merge into the device after sign-in).
async function recentChats(userId, limit) {
  const { rows } = await requirePool().query(
    `SELECT id, subject, grade, to_char(day, 'YYYY-MM-DD') AS day, messages, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2`,
    [userId, limit],
  );
  return rows.map(chatOut);
}

// History list without the messages: the first question is the title.
async function listChats(userId) {
  const { rows } = await requirePool().query(
    `SELECT id, subject, grade, to_char(day, 'YYYY-MM-DD') AS day, updated_at, jsonb_array_length(messages) AS count,
            (SELECT left(m->>'content', 140) FROM jsonb_array_elements(messages) m WHERE m->>'role' = 'user' LIMIT 1) AS title
       FROM chats WHERE user_id = $1 ORDER BY updated_at DESC LIMIT ${CHAT_KEEP}`,
    [userId],
  );
  return rows.map((r) => ({ ...chatOut({ ...r, messages: undefined }), count: Number(r.count) || 0, title: r.title || '' }));
}

async function getChat(userId, id) {
  const { rows } = await requirePool().query(
    `SELECT id, subject, grade, to_char(day, 'YYYY-MM-DD') AS day, messages, updated_at FROM chats WHERE user_id = $1 AND id = $2`,
    [userId, id],
  );
  return rows[0] ? chatOut(rows[0]) : null;
}

// Saves a chat; an older copy with fewer messages (from another device) never replaces a longer one.
// Only the newest CHAT_KEEP chats are kept.
async function saveChat(userId, chat) {
  const db = requirePool();
  await db.query(
    `INSERT INTO chats (user_id, id, subject, grade, day, messages, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (user_id, id) DO UPDATE SET subject = EXCLUDED.subject, grade = EXCLUDED.grade, messages = EXCLUDED.messages, updated_at = now()
     WHERE jsonb_array_length(EXCLUDED.messages) >= jsonb_array_length(chats.messages)`,
    [userId, chat.id, chat.subject, chat.grade, chat.date, JSON.stringify(chat.messages)],
  );
  await db.query(
    `DELETE FROM chats WHERE user_id = $1 AND id NOT IN (SELECT id FROM chats WHERE user_id = $1 ORDER BY updated_at DESC LIMIT ${CHAT_KEEP})`,
    [userId],
  );
}

async function deleteChat(userId, id) {
  await requirePool().query('DELETE FROM chats WHERE user_id = $1 AND id = $2', [userId, id]);
}

// ---------- admin dashboard: all numbers in one request ----------
// day is today's date in Tashkent (YYYY-MM-DD), month is YYYY-MM. Only students are counted.
const TIER_SQL = `CASE WHEN plan_tier IN ('gold', 'max') THEN plan_tier ELSE 'pro' END`;
const PAID_SQL = `COALESCE(plan_kind, 'paid') <> 'trial'`;
const ACTIVITY_SQL = `
  SELECT x.user_id, x.day, x.chat, x.learn FROM (
    SELECT user_id, day, count AS chat, 0 AS learn FROM usage WHERE day > $1::date - 30
    UNION ALL SELECT user_id, day, 0, count FROM learn_usage WHERE day > $1::date - 30) x
  JOIN users u ON u.id = x.user_id AND u.role = 'student'`;

async function adminStats(day, month) {
  const db = requirePool();
  const q = (sql, params = []) => db.query(sql, params).then((r) => r.rows);
  const num = (v) => Number(v) || 0;
  const student = `role = 'student'`;
  const localDay = `(created_at AT TIME ZONE 'Asia/Tashkent')::date`;

  const [[u], payments, [act], series, [tok], top, features] = await Promise.all([
    q(`SELECT
         count(*) FILTER (WHERE ${student}) AS students,
         count(*) FILTER (WHERE role = 'parent') AS parents,
         count(*) FILTER (WHERE role = 'admin') AS admins,
         count(*) FILTER (WHERE ${student} AND google_sub IS NOT NULL) AS google,
         count(*) FILTER (WHERE ${student} AND ${localDay} = $1::date) AS new_today,
         count(*) FILTER (WHERE ${student} AND ${localDay} > $1::date - 7) AS new_7d,
         count(*) FILTER (WHERE ${student} AND ${localDay} > $1::date - 30) AS new_30d,
         count(*) FILTER (WHERE ${student} AND premium_until > now()) AS active,
         count(*) FILTER (WHERE ${student} AND premium_until > now() AND NOT (${PAID_SQL})) AS trial,
         count(*) FILTER (WHERE ${student} AND premium_until > now() AND ${PAID_SQL} AND ${TIER_SQL} = 'pro') AS pro,
         count(*) FILTER (WHERE ${student} AND premium_until > now() AND ${PAID_SQL} AND ${TIER_SQL} = 'gold') AS gold,
         count(*) FILTER (WHERE ${student} AND premium_until > now() AND ${PAID_SQL} AND ${TIER_SQL} = 'max') AS max,
         count(*) FILTER (WHERE ${student} AND premium_until > now() AND premium_until < now() + interval '7 days') AS expiring,
         count(*) FILTER (WHERE ${student} AND premium_until <= now()) AS expired,
         count(*) FILTER (WHERE ${student} AND premium_until IS NULL) AS never,
         count(*) FILTER (WHERE ${student} AND free_used <> '{}'::jsonb) AS tried_free
       FROM users`, [day]),
    q(`SELECT status, plan, months, COALESCE(resolved_at > now() - interval '30 days', false) AS recent FROM payment_requests`),
    q(`WITH a AS (${ACTIVITY_SQL})
       SELECT
         count(DISTINCT user_id) FILTER (WHERE day = $1::date) AS dau,
         count(DISTINCT user_id) FILTER (WHERE day > $1::date - 7) AS wau,
         count(DISTINCT user_id) AS mau,
         COALESCE(sum(chat) FILTER (WHERE day = $1::date), 0) AS chat_today,
         COALESCE(sum(chat) FILTER (WHERE day > $1::date - 7), 0) AS chat_7d,
         COALESCE(sum(chat), 0) AS chat_30d,
         COALESCE(sum(learn) FILTER (WHERE day = $1::date), 0) AS learn_today,
         COALESCE(sum(learn) FILTER (WHERE day > $1::date - 7), 0) AS learn_7d,
         COALESCE(sum(learn), 0) AS learn_30d
       FROM a`, [day]),
    q(`WITH d AS (SELECT generate_series($1::date - 29, $1::date, interval '1 day')::date AS day),
       reg AS (SELECT ${localDay} AS day, count(*) AS n FROM users
                WHERE ${student} AND created_at > now() - interval '32 days' GROUP BY 1),
       act AS (SELECT day, count(DISTINCT user_id) AS users, sum(chat) AS chat, sum(learn) AS learn
                 FROM (${ACTIVITY_SQL}) a GROUP BY day)
       SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(reg.n, 0) AS reg, COALESCE(act.users, 0) AS users,
              COALESCE(act.chat, 0) AS chat, COALESCE(act.learn, 0) AS learn
         FROM d LEFT JOIN reg ON reg.day = d.day LEFT JOIN act ON act.day = d.day ORDER BY d.day`, [day]),
    q(`SELECT COALESCE(sum(t.input), 0) AS input, COALESCE(sum(t.output), 0) AS output, count(*) AS users
         FROM token_usage t JOIN users u ON u.id = t.user_id AND u.role = 'student' WHERE t.month = $1`, [month]),
    q(`SELECT u.email, u.created_at, u.premium_until, u.plan_kind, u.plan_tier, t.input, t.output
         FROM token_usage t JOIN users u ON u.id = t.user_id AND u.role = 'student'
        WHERE t.month = $1 ORDER BY t.output DESC LIMIT 10`, [month]),
    q(`SELECT d.key, count(*) AS n FROM user_data d JOIN users u ON u.id = d.user_id AND u.role = 'student' GROUP BY d.key`),
  ]);

  // Money: monthly value of the paid plans running now, and closed paid requests.
  const price = (id) => PLANS[planId(id)].price;
  const paid = payments.filter((p) => p.status === 'paid' && Number(p.months) > 0);
  const paidSum = (list) => list.reduce((s, p) => s + price(p.plan) * Number(p.months), 0);
  const subs = { pro: num(u.pro), gold: num(u.gold), max: num(u.max) };

  return {
    day,
    month,
    users: {
      students: num(u.students), parents: num(u.parents), admins: num(u.admins), google: num(u.google),
      newToday: num(u.new_today), new7d: num(u.new_7d), new30d: num(u.new_30d), triedFree: num(u.tried_free),
    },
    subscriptions: {
      active: num(u.active), trial: num(u.trial), ...subs,
      expiring: num(u.expiring), expired: num(u.expired), never: num(u.never),
    },
    money: {
      monthly: Object.entries(subs).reduce((s, [id, n]) => s + price(id) * n, 0),
      paid30d: paidSum(paid.filter((p) => p.recent)),
      paidAll: paidSum(paid),
      paidCount: paid.length,
      pending: payments.filter((p) => p.status === 'pending').length,
    },
    activity: Object.fromEntries(Object.entries(act).map(([k, v]) => [k, num(v)])),
    series: series.map((r) => ({ day: r.day, reg: num(r.reg), users: num(r.users), chat: num(r.chat), learn: num(r.learn) })),
    tokens: {
      input: num(tok.input), output: num(tok.output), users: num(tok.users),
      top: top.map((r) => {
        const p = plan(r);
        return {
          email: r.email, tier: p.active ? (p.trial ? 'trial' : p.tier) : null,
          input: num(r.input), output: num(r.output),
          share: Math.round(100 * Math.max(num(r.input) / p.limits.input, num(r.output) / p.limits.output)),
        };
      }),
    },
    features: Object.fromEntries(features.map((r) => [r.key, num(r.n)])),
  };
}

// ---------- admin: take access away ----------
// Access ends now; the plan the student had stays recorded (they can ask for a new one).
async function revokeSubscription(email) {
  const { rows } = await requirePool().query(
    `UPDATE users SET premium_until = now() WHERE email = $1 AND role = 'student' AND premium_until > now() RETURNING email`,
    [normalizeAccount(email)],
  );
  if (!rows.length) throw new AuthError('user_not_found', 404);
  return rows[0];
}

// Students with access now, except the kept emails. Without apply it only lists them; to end
// access, pass the exact list that was shown, so nobody who got access in between is touched.
const cleanEmails = (list) => list.map((v) => String(v || '').trim().toLowerCase()).filter(Boolean);

async function revokeAllExcept(keep, apply) {
  const kept = cleanEmails(keep);
  if (!apply) {
    const { rows } = await requirePool().query(
      `SELECT email, premium_until, plan_kind, plan_tier FROM users
        WHERE role = 'student' AND premium_until > now() AND NOT (email = ANY($1::text[])) ORDER BY premium_until DESC`,
      [kept],
    );
    return { users: rows };
  }
  const { rows } = await requirePool().query(
    `UPDATE users SET premium_until = now()
      WHERE role = 'student' AND premium_until > now() AND email = ANY($1::text[]) AND NOT (email = ANY($2::text[]))
      RETURNING email`,
    [cleanEmails(apply), kept],
  );
  return { revoked: rows.map((r) => r.email) };
}

module.exports = {
  plan,
  freeLeft,
  useFree,
  recentChats,
  listChats,
  getChat,
  saveChat,
  deleteChat,
  ensureParent,
  resetParentPassword,
  getChild,
  setPassword,
  listStudents,
  resetStudentPassword,
  deleteStudent,
  createAdminAccount,
  requestSubscription,
  listRequests,
  grantMonths,
  rejectRequest,
  adminStats,
  revokeSubscription,
  revokeAllExcept,
  countGeneration,
  generationsToday,
  tokensThisMonth,
  addTokens,
  getData,
  setData,
  cachedTopics,
  cacheTopics,
  AuthError,
  init,
  getUser,
  publicUser,
  register,
  sendCode,
  resetPassword,
  applyConsents,
  listMarketing,
  leaderboard,
  addLeaderPoints,
  smsBroadcastInfo,
  createBroadcast,
  cancelBroadcast,
  testSms,
  broadcastTick,
  checkActiveBroadcast,
  SMS_BROADCAST_EVERY_SEC,
  CONSENT_VERSION,
  CONSENT_TEXTS,
  login,
  google,
  googleUser,
  startSession,
  logout,
  usedToday,
  countQuestion,
  GOOGLE_CLIENT_ID,
  enabled: () => !!pool,
};
