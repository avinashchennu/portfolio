// Only allow http(s) links. Blocks "javascript:" and similar schemes.
export function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

// true in the GitHub Pages build (set by VITE_STATIC_DEMO=true)
export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === 'true';

export function publicLink(id) {
  const { origin, pathname } = window.location;
  return STATIC_DEMO ? `${origin}${pathname}#/p/${id}` : `${origin}/p/${id}`;
}
