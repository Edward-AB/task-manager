import { hashPassword, makeToken } from '../_helpers/jwt.js';

export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hash = await hashPassword(password, env.SALT);
    const user = await env.DB.prepare(
      'SELECT id, username, is_admin FROM users WHERE email = ? AND password_hash = ?'
    ).bind(email.toLowerCase().trim(), hash).first();

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last_login_at
    await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
      .bind(Date.now(), user.id).run();

    const token = await makeToken(
      { userId: user.id, username: user.username || null, isAdmin: !!user.is_admin },
      env.JWT_SECRET
    );

    return Response.json({ token });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
