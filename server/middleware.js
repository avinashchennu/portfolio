import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';
import { store } from './store.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = store.findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Account not found. Please log in again.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });
  next();
}

export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found.' });
}

// last resort: always answer with JSON so the UI can show a real message
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request body.' });
  console.error(err);
  res.status(500).json({ error: 'Server error. Check the API terminal for details.' });
}
