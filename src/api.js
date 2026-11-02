import { getToken, setToken } from './token.js';
import { localApi } from './api-local.js';
import { STATIC_DEMO } from './utils.js';

export { getToken, setToken };

// Optional: address of a deployed backend (leave empty to use the /api proxy)
const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Start everything with "npm run demo".');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fallback = data
      ? `Request failed (${res.status}).`
      : `The API did not answer (status ${res.status}). Is it running? Use "npm run demo".`;
    const error = new Error(data?.error || fallback);
    error.status = res.status;
    throw error;
  }
  return data ?? {};
}

const remoteApi = {
  // login module
  signup: (body) => request('/auth/signup', { method: 'POST', body, auth: false }),
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/auth/me'),

  // user module
  getPortfolio: () => request('/portfolio'),
  savePortfolio: (body) => request('/portfolio', { method: 'PUT', body }),
  setTemplate: (template) => request('/portfolio/template', { method: 'PUT', body: { template } }),
  getPublic: (id) => request(`/public/${id}`, { auth: false }),

  // admin module
  adminStats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};

// GitHub Pages build has no server, so it uses the browser-only version
export const api = STATIC_DEMO ? localApi : remoteApi;
