// Tiny JSON-file database: no native modules, nothing extra to install.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data.json');

function load() {
  try {
    const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    db.users.forEach((u) => { u.role ||= 'user'; }); // older data had no roles
    return db;
  } catch {
    return { nextId: 1, users: [], portfolios: {} };
  }
}

const db = load();

function persist() {
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export const store = {
  findUserByEmail: (email) => db.users.find((u) => u.email === email),
  findUserById: (id) => db.users.find((u) => u.id === id),

  createUser({ name, email, passwordHash, role = 'user', portfolio }) {
    const user = { id: db.nextId++, name, email, passwordHash, role, createdAt: new Date().toISOString() };
    db.users.push(user);
    db.portfolios[user.id] = { template: 'workshop', data: portfolio };
    persist();
    return user;
  },

  deleteUser(id) {
    db.users = db.users.filter((u) => u.id !== id);
    delete db.portfolios[id];
    persist();
  },

  listUsers() {
    return db.users.map((u) => {
      const p = db.portfolios[u.id];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt || null,
        template: p?.template || 'workshop',
        projects: p?.data?.projects?.length || 0,
        skills: p?.data?.skills?.length || 0,
      };
    });
  },

  getPortfolio(userId) {
    const row = db.portfolios[userId];
    return row ? { id: userId, ...row.data, template: row.template } : null;
  },

  savePortfolio(userId, data) {
    db.portfolios[userId].data = data;
    persist();
  },

  saveTemplate(userId, template) {
    db.portfolios[userId].template = template;
    persist();
  },
};
