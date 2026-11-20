import crypto from 'node:crypto';

// Local capstone admin auth. Credentials come from backend/.env; the defaults
// are development-only and should be changed before any real deployment.
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cascadja2026';
const AUTH_SECRET = process.env.AUTH_SECRET || 'cascadja-local-dev-secret-change-me';
const TOKEN_HOURS = 8;

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function authenticate(username, password) {
  return safeEqual(username, ADMIN_USERNAME) && safeEqual(password, ADMIN_PASSWORD);
}

function sign(payload) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
}

export function createAdminToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: ADMIN_USERNAME,
    role: 'admin',
    iat: now,
    exp: now + TOKEN_HOURS * 60 * 60,
  })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (claims.sub !== ADMIN_USERNAME || claims.role !== 'admin') return null;
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null;
    return { username: claims.sub, role: claims.role };
  } catch {
    return null;
  }
}

export function adminIdentity() {
  return { username: ADMIN_USERNAME, role: 'admin' };
}
