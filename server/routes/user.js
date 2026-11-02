// User module (backend): own portfolio, template choice, public link
import { Router } from 'express';
import { store } from '../store.js';
import { requireAuth } from '../middleware.js';
import { sanitizePortfolio } from '../utils.js';
import { TEMPLATES } from '../config.js';

const router = Router();

router.get('/portfolio', requireAuth, (req, res) => {
  const portfolio = store.getPortfolio(req.user.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });
  res.json(portfolio);
});

router.put('/portfolio', requireAuth, (req, res) => {
  const data = sanitizePortfolio(req.body);
  if (!data.name) return res.status(400).json({ error: 'Full name is required.' });
  store.savePortfolio(req.user.id, data);
  res.json(store.getPortfolio(req.user.id));
});

router.put('/portfolio/template', requireAuth, (req, res) => {
  const template = String(req.body?.template ?? '');
  if (!TEMPLATES.includes(template)) return res.status(400).json({ error: 'Unknown template.' });
  store.saveTemplate(req.user.id, template);
  res.json({ template });
});

// public read-only view used by the shareable link
router.get('/public/:id', (req, res) => {
  const portfolio = store.getPortfolio(Number(req.params.id));
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found.' });
  res.json(portfolio);
});

export default router;
