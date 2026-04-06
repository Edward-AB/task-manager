async function makeToken(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const header = btoa(JSON.stringify({alg:'HS256',typ:'JWT'}));
  const body = btoa(JSON.stringify({...payload, exp: Math.floor(Date.now()/1000) + 30*24*60*60}));
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${header}.${body}`));
  return `${header}.${body}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json();
  if (!email || !password) return Response.json({ error: 'Missing fields' }, { status: 400 });
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password + env.SALT));
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuf)));
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
      .bind(id, email.toLowerCase(), hash, Date.now()).run();
  } catch {
    return Response.json({ error: 'Email already in use' }, { status: 409 });
  }
  const token = await makeToken({ userId: id }, env.JWT_SECRET);
  return Response.json({ token });
}
