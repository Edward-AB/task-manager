// Shared JWT helpers for PineTask Cloudflare Pages Functions

export function b64url(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function fromb64url(str) {
  return str.replace(/-/g, '+').replace(/_/g, '/');
}

export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password + salt));
  return b64url(btoa(String.fromCharCode(...new Uint8Array(hashBuf))));
}

export async function makeToken(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const header = b64url(btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = b64url(btoa(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  })));
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${b64url(btoa(String.fromCharCode(...new Uint8Array(sig))))}`;
}

export async function verifyToken(token, secret) {
  const enc = new TextEncoder();
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const sigBytes = Uint8Array.from(atob(fromb64url(sig)), c => c.charCodeAt(0));
  const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(`${header}.${body}`));
  if (!valid) return null;
  const payload = JSON.parse(atob(fromb64url(body)));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
