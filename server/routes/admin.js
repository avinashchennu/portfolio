// Admin module (backend): overview numbers and user management
import { Router } from 'express';
import { store } from '../store.js';
import { requireAuth, requireAdmin } from '../middleware.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', (_req, res) => {
  const users = store.listUsers();
  const byTemplate = { workshop: 0, editorial: 0, minimal: 0 };
  users.forEach((u) => { byTemplate[u.template] = (byTemplate[u.template] || 0) + 1; });
  res.json({
    totalUsers: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    totalProjects: users.reduce((sum, u) => sum + u.projects, 0),
    byTemplate,
  });
});

router.get('/users', (_req, res) => {
  res.json({ users: store.listUsers() });
});

router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const target = store.findUserById(id);
  if (!target) return res.status(404).json({ error: 'User not found.' });
  if (target.role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot be deleted.' });
  store.deleteUser(id);
  res.json({ ok: true });
});

export default router;
