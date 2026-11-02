// Login module (backend): signup, login, current session
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../store.js';
import { requireAuth } from '../middleware.js';
import { str, sanitizePortfolio, publicUser, makeToken } from '../utils.js';

const router = Router();

router.post('/signup', (req, res) => {
  const name = str(req.body?.name, 80);
  const email = str(req.body?.email, 120).toLowerCase();
  const password = String(req.body?.password ?? '');

  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (store.findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const user = store.createUser({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    portfolio: sanitizePortfolio({ name, contactEmail: email }),
  });
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const email = str(req.body?.email, 120).toLowerCase();
  const password = String(req.body?.password ?? '');
  if (!email || !password) return res.status(400).json({ error: 'Enter both email and password.' });

  const user = store.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
