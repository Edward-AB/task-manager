async function verifyToken(token, secret) {
  const enc = new TextEncoder();
  const [header, body, sig] = token.split('.');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(sig), c=>c.charCodeAt(0)), enc.encode(`${header}.${body}`));
  if (!valid) return null;
  const payload = JSON.parse(atob(body));
  if (payload.exp < Math.floor(Date.now()/1000)) return null;
  return payload;
}

async function getUserId(request, secret) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try { const p = await verifyToken(token, secret); return p?.userId || null; }
  catch { return null; }
}

export async function onRequestGet({ request, env }) {
  const userId = await getUserId(request, env.JWT_SECRET);
  if (!userId) return new Response('Unauthorised', { status: 401 });
  const row = await env.DB.prepare('SELECT data FROM store WHERE user_id = ?').bind(userId).first();
  return Response.json(row ? JSON.parse(row.data) : {});
}

export async function onRequestPost({ request, env }) {
  const userId = await getUserId(request, env.JWT_SECRET);
  if (!userId) return new Response('Unauthorised', { status: 401 });
  const data = await request.json();
  await env.DB.prepare('INSERT OR REPLACE INTO store (user_id, data, updated_at) VALUES (?, ?, ?)')
    .bind(userId, JSON.stringify(data), Date.now()).run();
  return Response.json({ ok: true });
}
