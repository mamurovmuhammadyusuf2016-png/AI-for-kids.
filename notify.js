// Sends one-time codes: SMS through DevSMS (devsms.uz) and email through Brevo (brevo.com).
// Keys live only in Render environment variables:
//   DEVSMS_API_KEY            — DevSMS key with the sms:send permission
//   DEVSMS_SERVICE_NAME       — product name in the SMS (default "Nimi AI"; moderated by DevSMS)
//   BREVO_API_KEY, MAIL_FROM  — Brevo API key and the sender address verified in Brevo
//   MAIL_FROM_NAME            — sender name (default "Nimi AI")
// Without a key that channel is simply off: the site hides phone sign-up, or skips the email code.
const crypto = require('crypto');

const DEVSMS_API_KEY = process.env.DEVSMS_API_KEY || '';
// Free alternative: an Android phone with the owner's SIM card sends the SMS through the app
// "SMS Gateway for Android" (sms-gate.app, free cloud server). Login and password come from the app.
const SMSGATE_LOGIN = process.env.SMSGATE_LOGIN || '';
const SMSGATE_PASSWORD = process.env.SMSGATE_PASSWORD || '';
const DEVSMS_SERVICE = (process.env.DEVSMS_SERVICE_NAME || 'Nimi AI').slice(0, 50);
const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const MAIL_FROM = process.env.MAIL_FROM || '';
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Nimi AI';

const smsGate = () => !!(SMSGATE_LOGIN && SMSGATE_PASSWORD);
const smsEnabled = () => !!DEVSMS_API_KEY || smsGate();
const emailEnabled = () => !!(BREVO_API_KEY && MAIL_FROM);

// DevSMS "universal OTP" needs no template of our own. Types: 2 — password reset, 3 — sign up.
const OTP_TYPE = { register: 3, reset: 2 };

// The owner's phone sends a short text (one SMS: Latin and Cyrillic together fit 70 characters).
async function sendViaPhone(phone, code) {
  const text = `Nimi AI: ${code} — tasdiqlash kodi / код подтверждения`;
  const r = await fetch('https://api.sms-gate.app/3rdparty/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SMSGATE_LOGIN}:${SMSGATE_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textMessage: { text }, phoneNumbers: [`+${phone}`] }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (r && r.ok) return;
  // Only the status goes to the log: never the phone number, the code or the password.
  console.warn(`SMS gateway (phone): ${r ? r.status : 'network error'}`);
  throw new Error('sms_failed');
}

// Any text through the owner's phone (admin SMS broadcasts and tests). Only the phone gateway:
// DevSMS needs a moderated advertising template for such texts.
async function sendText(phone, text) {
  if (!smsGate()) throw new Error('sms_failed');
  const r = await fetch('https://api.sms-gate.app/3rdparty/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SMSGATE_LOGIN}:${SMSGATE_PASSWORD}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textMessage: { text }, phoneNumbers: [`+${phone}`] }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (r && r.ok) return;
  console.warn(`SMS gateway (text): ${r ? r.status : 'network error'}`);
  throw new Error('sms_failed');
}

async function sendSmsCode(phone, code, purpose) {
  if (smsGate() && !DEVSMS_API_KEY) return sendViaPhone(phone, code);
  const body = JSON.stringify({ phone, otp: { template_type: OTP_TYPE[purpose] || 1, service_name: DEVSMS_SERVICE, code } });
  // The same Idempotency-Key on a retry never sends or charges twice.
  const key = crypto.randomUUID();
  for (let attempt = 0; attempt < 3; attempt++) {
    let r;
    try {
      r = await fetch('https://devsms.uz/api/v1/sms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DEVSMS_API_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Idempotency-Key': key,
        },
        body,
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      await new Promise((ok) => setTimeout(ok, 1000 * (attempt + 1)));
      continue;
    }
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.success) return;
    // Only the error code goes to the log: never the phone number, the code or the key.
    console.warn(`DevSMS: ${r.status} ${data.error_code || 'error'}`);
    if (r.status < 500 && r.status !== 409 && r.status !== 429) break;
    await new Promise((ok) => setTimeout(ok, 1000 * (attempt + 1)));
  }
  throw new Error('sms_failed');
}

const MAIL_TEXT = {
  ru: {
    register: { subject: 'Код для регистрации в Nimi AI', line: 'Ваш код для регистрации в Nimi AI:' },
    reset: { subject: 'Код для смены пароля в Nimi AI', line: 'Ваш код для смены пароля в Nimi AI:' },
    tail: 'Код действует 10 минут. Никому его не сообщайте. Если вы не запрашивали код, просто удалите это письмо.',
  },
  uz: {
    register: { subject: "Nimi AI: ro'yxatdan o'tish kodi", line: "Nimi AI'da ro'yxatdan o'tish uchun kodingiz:" },
    reset: { subject: 'Nimi AI: parolni tiklash kodi', line: 'Nimi AI parolini tiklash uchun kodingiz:' },
    tail: "Kod 10 daqiqa amal qiladi. Uni hech kimga aytmang. Agar kodni siz so'ramagan bo'lsangiz, bu xatni o'chirib tashlang.",
  },
};

async function sendEmailCode(email, code, purpose, lang) {
  const T = MAIL_TEXT[lang === 'ru' ? 'ru' : 'uz'];
  const P = T[purpose] || T.register;
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
      to: [{ email }],
      subject: `${P.subject}: ${code}`,
      textContent: `${P.line} ${code}\n\n${T.tail}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p>${P.line}</p><p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:16px 0">${code}</p>
<p style="color:#555;font-size:14px">${T.tail}</p><p style="color:#555;font-size:14px">Nimi AI</p></div>`,
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (r && r.ok) return;
  console.warn(`Brevo: ${r ? r.status : 'network error'}`);
  throw new Error('email_failed');
}

// A news email from the admin panel. A footer always says how to stop the news (law on advertising).
const escapeHtml = (t) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NEWS_FOOTER = 'Nimi AI · Отказаться от новостей: Nimi → меню ⋮ → «Настройки» → «Новости и акции».\nYangiliklardan voz kechish: Nimi → ⋮ menyu → «Sozlamalar» → «Yangiliklar va aksiyalar».';
async function sendEmailText(email, subject, text) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: MAIL_FROM_NAME, email: MAIL_FROM },
      to: [{ email }],
      subject,
      textContent: `${text}\n\n—\n${NEWS_FOOTER}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#303b35;max-width:560px">` +
        `<p style="white-space:pre-line;margin:0 0 24px">${escapeHtml(text)}</p>` +
        `<p style="white-space:pre-line;color:#78847c;font-size:12px;border-top:1px solid #e7e9e1;padding-top:12px;margin:0">${escapeHtml(NEWS_FOOTER)}</p></div>`,
    }),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null);
  if (r && r.ok) return;
  console.warn(`Brevo news email: ${r ? r.status : 'network error'}`);
  throw new Error('email_failed');
}

module.exports = { smsEnabled, smsGate, emailEnabled, sendSmsCode, sendText, sendEmailCode, sendEmailText };
