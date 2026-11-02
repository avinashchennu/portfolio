// Static demo mode (GitHub Pages): the same API as api.js, but the "server"
// is the browser's localStorage. Data stays in this browser only.
import { getToken } from './token.js';

const DB_KEY = 'pf_local_db';
const TEMPLATES = ['workshop', 'editorial', 'minimal'];

// ---------- helpers ----------
const str = (v, max) => String(v ?? '').trim().slice(0, max);

function safeUrl(v) {
  const value = str(v, 500);
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function sanitizePortfolio(input = {}) {
  const skills = Array.isArray(input.skills) ? input.skills : [];
  const projects = Array.isArray(input.projects) ? input.projects : [];
  return {
    name: str(input.name, 80),
    tagline: str(input.tagline, 80),
    bio: str(input.bio, 500),
    skills: skills.map((s) => str(s, 40)).filter(Boolean).slice(0, 30),
    projects: projects.slice(0, 30).map((p) => ({
      title: str(p?.title, 100),
      link: safeUrl(p?.link),
      desc: str(p?.desc, 500),
    })),
    contactEmail: str(input.contactEmail, 120),
    github: safeUrl(input.github),
    linkedin: safeUrl(input.linkedin),
  };
}

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`pf:${text}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

// ---------- storage ----------
async function seed() {
  const demo = sanitizePortfolio({
    name: 'Demo Student',
    tagline: 'CSE student & frontend tinkerer',
    bio: 'I build small web apps and enjoy turning rough ideas into clean interfaces. Currently learning React and Node.',
    skills: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'Git'],
    projects: [
      { title: 'Portfolio Maker', link: 'https://github.com', desc: 'Fill in a form and get a shareable portfolio page.' },
      { title: 'Task Tracker', link: 'https://github.com', desc: 'A small to-do app with filters and local persistence.' },
      { title: 'Weather Board', link: 'https://github.com', desc: 'Dashboard showing the forecast for saved cities.' },
    ],
    contactEmail: 'demo@example.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  });
  const now = new Date().toISOString();
  return {
    nextId: 3,
    users: [
      { id: 1, name: 'Demo Student', email: 'demo@example.com', passwordHash: await hash('demo1234'), role: 'user', createdAt: now },
      { id: 2, name: 'Admin', email: 'admin@example.com', passwordHash: await hash('admin1234'), role: 'admin', createdAt: now },
    ],
    portfolios: {
      1: { template: 'workshop', data: demo },
      2: { template: 'workshop', data: sanitizePortfolio({ name: 'Admin', contactEmail: 'admin@example.com' }) },
    },
  };
}

async function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through and rebuild
  }
  const db = await seed();
  saveDb(db);
  return db;
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

async function currentUser() {
  const token = getToken();
  const id = Number(String(token || '').replace('local:', ''));
  const db = await loadDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw fail('Please log in.', 401);
  return { db, user };
}

async function adminOnly() {
  const ctx = await currentUser();
  if (ctx.user.role !== 'admin') throw fail('Admins only.', 403);
  return ctx;
}

const readPortfolio = (db, id) => {
  const row = db.portfolios[id];
  return row ? { id, ...row.data, template: row.template } : null;
};

function summarize(db) {
  return db.users.map((u) => {
    const p = db.portfolios[u.id];
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      template: p?.template || 'workshop',
      projects: p?.data?.projects?.length || 0,
      skills: p?.data?.skills?.length || 0,
    };
  });
}

// ---------- the API (same shape as api.js) ----------
export const localApi = {
  async signup({ name, email, password }) {
    const db = await loadDb();
    const cleanName = str(name, 80);
    const cleanEmail = str(email, 120).toLowerCase();
    if (!cleanName || !cleanEmail) throw fail('Name and email are required.');
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw fail('Enter a valid email address.');
    if (String(password ?? '').length < 6) throw fail('Password must be at least 6 characters.');
    if (db.users.some((u) => u.email === cleanEmail)) throw fail('An account with this email already exists.', 409);

    const user = {
      id: db.nextId++,
      name: cleanName,
      email: cleanEmail,
      passwordHash: await hash(password),
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    db.portfolios[user.id] = { template: 'workshop', data: sanitizePortfolio({ name: cleanName, contactEmail: cleanEmail }) };
    saveDb(db);
    return { token: `local:${user.id}`, user: publicUser(user) };
  },

  async login({ email, password }) {
    const db = await loadDb();
    const cleanEmail = str(email, 120).toLowerCase();
    if (!cleanEmail || !password) throw fail('Enter both email and password.');
    const user = db.users.find((u) => u.email === cleanEmail);
    if (!user || user.passwordHash !== (await hash(password))) throw fail('Invalid email or password.', 401);
    return { token: `local:${user.id}`, user: publicUser(user) };
  },

  async me() {
    const { user } = await currentUser();
    return { user: publicUser(user) };
  },

  async getPortfolio() {
    const { db, user } = await currentUser();
    return readPortfolio(db, user.id);
  },

  async savePortfolio(body) {
    const { db, user } = await currentUser();
    const data = sanitizePortfolio(body);
    if (!data.name) throw fail('Full name is required.');
    db.portfolios[user.id].data = data;
    saveDb(db);
    return readPortfolio(db, user.id);
  },

  async setTemplate(template) {
    const { db, user } = await currentUser();
    if (!TEMPLATES.includes(template)) throw fail('Unknown template.');
    db.portfolios[user.id].template = template;
    saveDb(db);
    return { template };
  },

  async getPublic(id) {
    const db = await loadDb();
    const portfolio = readPortfolio(db, Number(id));
    if (!portfolio) throw fail('Portfolio not found. In the static demo, links only work in the browser where the portfolio was created.', 404);
    return portfolio;
  },

  async adminStats() {
    const { db } = await adminOnly();
    const users = summarize(db);
    const byTemplate = { workshop: 0, editorial: 0, minimal: 0 };
    users.forEach((u) => { byTemplate[u.template] = (byTemplate[u.template] || 0) + 1; });
    return {
      totalUsers: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      totalProjects: users.reduce((sum, u) => sum + u.projects, 0),
      byTemplate,
    };
  },

  async adminUsers() {
    const { db } = await adminOnly();
    return { users: summarize(db) };
  },

  async adminDeleteUser(id) {
    const { db } = await adminOnly();
    const target = db.users.find((u) => u.id === Number(id));
    if (!target) throw fail('User not found.', 404);
    if (target.role === 'admin') throw fail('Admin accounts cannot be deleted.');
    db.users = db.users.filter((u) => u.id !== target.id);
    delete db.portfolios[target.id];
    saveDb(db);
    return { ok: true };
  },
};
