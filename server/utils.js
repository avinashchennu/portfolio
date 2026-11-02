import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export const str = (v, max) => String(v ?? '').trim().slice(0, max);

// only http(s) links are kept, so "javascript:" URLs never reach a portfolio
export function safeUrl(v) {
  const value = str(v, 500);
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

export function sanitizePortfolio(input = {}) {
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

export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
export const makeToken = (u) => jwt.sign({ sub: u.id }, JWT_SECRET, { expiresIn: '7d' });
