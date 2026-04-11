import { hashPassword, makeToken } from '../_helpers/jwt.js';

export async function onRequestPost({ request, env }) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!username || !username.trim()) {
      return Response.json({ error: 'Username is required' }, { status: 400 });
    }

    const uname = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (uname.length < 2 || uname.length > 24) {
      return Response.json(
        { error: 'Username must be 2-24 characters (letters, numbers, _)' },
        { status: 400 }
      );
    }

    const hash = await hashPassword(password, env.SALT);
    const id = crypto.randomUUID();
    const now = Date.now();

    try {
      await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, username, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, 1, ?, ?)'
      ).bind(id, email.toLowerCase().trim(), hash, uname, now, now).run();
    } catch (e) {
      const msg = String(e).toLowerCase();
      if (msg.includes('username')) {
        return Response.json({ error: 'Username already taken' }, { status: 409 });
      }
      return Response.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Insert default user_settings
    await env.DB.prepare(
      'INSERT INTO user_settings (user_id, updated_at) VALUES (?, ?)'
    ).bind(id, now).run();

    const token = await makeToken(
      { userId: id, username: uname, isAdmin: false },
      env.JWT_SECRET
    );

    return Response.json({ token });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
