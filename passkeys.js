// Face ID / fingerprint / Windows Hello as the second sign-in step for admins (WebAuthn passkeys).
// An admin adds a passkey in the admin panel; from then on the password alone only starts a
// "pending" session (sessions.pending_2fa) that becomes a real one after the passkey is checked.
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const auth = require('./auth');

const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const challenges = new Map(); // `${kind}:${userId}` -> { challenge, exp }

// Passkeys are bound to the site's domain (rpID); the browser reports the page's origin.
function site(req) {
  const host = String(req.headers.host || '').toLowerCase();
  const https = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
  return { rpID: host.split(':')[0], origin: `${https ? 'https' : 'http'}://${host}` };
}
function remember(key, challenge) {
  const now = Date.now();
  for (const [k, v] of challenges) if (v.exp < now) challenges.delete(k);
  challenges.set(key, { challenge, exp: now + CHALLENGE_TTL_MS });
}
function take(key) {
  const entry = challenges.get(key);
  challenges.delete(key);
  if (!entry || entry.exp < Date.now()) throw new auth.AuthError('passkey_expired', 400);
  return entry.challenge;
}
const transportsOf = (row) => (row.transports ? row.transports.split(',').filter(Boolean) : undefined);

async function registrationOptions(req, user) {
  const { rpID } = site(req);
  const keys = await auth.listPasskeys(user.id);
  const options = await generateRegistrationOptions({
    rpName: 'Nimi AI',
    rpID,
    userName: user.email,
    userDisplayName: user.email,
    userID: Buffer.from(String(user.id)),
    attestationType: 'none',
    excludeCredentials: keys.map((k) => ({ id: k.id, transports: transportsOf(k) })),
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
  });
  remember(`reg:${user.id}`, options.challenge);
  return options;
}

async function register(req, user, body) {
  const { rpID, origin } = site(req);
  const expectedChallenge = take(`reg:${user.id}`);
  let result;
  try {
    result = await verifyRegistrationResponse({ response: body.response, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
  } catch {
    throw new auth.AuthError('passkey_failed', 400);
  }
  if (!result.verified || !result.registrationInfo) throw new auth.AuthError('passkey_failed', 400);
  const { credential } = result.registrationInfo;
  await auth.addPasskey(user.id, {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter || 0,
    transports: (credential.transports || body.response?.response?.transports || []).join(','),
    name: String(body.name || '').trim().slice(0, 40) || null,
  });
  return { ok: true };
}

async function loginOptions(req, user) {
  const { rpID } = site(req);
  const keys = await auth.listPasskeys(user.id);
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: keys.map((k) => ({ id: k.id, transports: transportsOf(k) })),
  });
  remember(`login:${user.id}`, options.challenge);
  return options;
}

async function login(req, user, body) {
  const { rpID, origin } = site(req);
  const expectedChallenge = take(`login:${user.id}`);
  const key = (await auth.listPasskeys(user.id)).find((k) => k.id === body.response?.id);
  if (!key) throw new auth.AuthError('passkey_failed', 400);
  let result;
  try {
    result = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
      credential: { id: key.id, publicKey: Buffer.from(key.public_key, 'base64url'), counter: Number(key.counter), transports: transportsOf(key) },
    });
  } catch {
    throw new auth.AuthError('passkey_failed', 400);
  }
  if (!result.verified) throw new auth.AuthError('passkey_failed', 400);
  await auth.usePasskey(key.id, result.authenticationInfo.newCounter);
  await auth.releaseSession(req);
}

// The admin panel list: no keys, only names and dates.
async function list(user) {
  return (await auth.listPasskeys(user.id)).map((k) => ({ id: k.id, name: k.name, created: k.created_at, used: k.last_used }));
}

module.exports = { registrationOptions, register, loginOptions, login, list };
