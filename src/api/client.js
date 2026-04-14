import { TOKEN_KEY } from '../constants';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Decode username from JWT payload */
export function getUsernameFromToken() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.username || null;
  } catch {
    return null;
  }
}

/** Decode userId from JWT payload */
export function getUserIdFromToken() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return payload.userId || null;
  } catch {
    return null;
  }
}

/** Make an authenticated API request */
export async function api(path, opts = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(path, { ...opts, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return res;
}

/** GET helper */
export async function apiGet(path) {
  const res = await api(path);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

/** POST helper */
export async function apiPost(path, data) {
  const res = await api(path, { method: 'POST', body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

/** PATCH helper */
export async function apiPatch(path, data) {
  const res = await api(path, { method: 'PATCH', body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

/** PUT helper */
export async function apiPut(path, data) {
  const res = await api(path, { method: 'PUT', body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

/** DELETE helper (optional body) */
export async function apiDelete(path, data) {
  const opts = { method: 'DELETE' };
  if (data !== undefined) opts.body = JSON.stringify(data);
  const res = await api(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}
