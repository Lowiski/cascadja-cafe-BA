import { verifyAdminToken } from '../utils/auth.js';

// Every write route sits behind this middleware. Read-only analytics stay open
// to the app, while adding menu items or sales requires an admin token.
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const admin = verifyAdminToken(token);
  if (!admin) {
    return res.status(401).json({ error: 'Admin sign-in required.' });
  }
  req.admin = admin;
  return next();
}

export default requireAdmin;
