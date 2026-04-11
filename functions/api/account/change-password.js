import { hashPassword } from '../_helpers/jwt.js';

export async function onRequestPost({ request, env, data }) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'currentPassword and newPassword are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const currentHash = await hashPassword(currentPassword, env.SALT);
    const user = await env.DB.prepare(
      'SELECT id FROM users WHERE id = ? AND password_hash = ?'
    ).bind(data.userId, currentHash).first();

    if (!user) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword, env.SALT);
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(newHash, Date.now(), data.userId).run();

    return Response.json({ data: { message: 'Password changed successfully' } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
