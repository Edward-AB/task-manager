import { SignJWT } from 'jose';

export async function onRequestPost({ request, env }) {
  const { email, password } = await request.json();
  const enc = new TextEncoder();
  const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(password + env.SALT));
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuf)));

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?')
    .bind(email.toLowerCase(), hash).first();
  if (!user) return Response.json({ error: 'Invalid email or password' }, { status: 401 });

  const token = await new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(enc.encode(env.JWT_SECRET));

  return Response.json({ token });
}
