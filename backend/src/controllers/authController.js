import { authenticate, createAdminToken, adminIdentity } from '../utils/auth.js';
import { HttpError } from '../utils/httpError.js';

export function login(req, res) {
  const { username, password } = req.body || {};
  if (!authenticate(String(username || ''), String(password || ''))) {
    throw new HttpError(401, 'Invalid username or password.');
  }
  res.json({
    token: createAdminToken(),
    user: adminIdentity(),
    expiresInHours: 8,
  });
}

export function me(req, res) {
  res.json({ user: req.admin });
}
