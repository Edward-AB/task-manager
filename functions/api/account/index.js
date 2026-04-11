export async function onRequestGet({ env, data }) {
  try {
    const user = await env.DB.prepare(
      'SELECT id, username, email, is_admin, avatar_url, email_verified, timezone, created_at, last_login_at, onboarding_completed FROM users WHERE id = ?'
    ).bind(data.userId).first();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ data: user });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env, data }) {
  try {
    const body = await request.json();
    const allowed = ['username', 'email', 'avatar_url', 'timezone', 'onboarding_completed'];
    const sets = [];
    const values = [];

    for (const field of allowed) {
      if (field in body) {
        let val = body[field];

        // Validate username
        if (field === 'username') {
          val = String(val).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          if (val.length < 2 || val.length > 24) {
            return Response.json(
              { error: 'Username must be 2-24 characters (letters, numbers, _)' },
              { status: 400 }
            );
          }
        }

        // Validate email
        if (field === 'email') {
          val = String(val).trim().toLowerCase();
          if (!val.includes('@')) {
            return Response.json({ error: 'Invalid email' }, { status: 400 });
          }
        }

        sets.push(`${field} = ?`);
        values.push(val);
      }
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    sets.push('updated_at = ?');
    values.push(Date.now());
    values.push(data.userId);

    try {
      await env.DB.prepare(
        `UPDATE users SET ${sets.join(', ')} WHERE id = ?`
      ).bind(...values).run();
    } catch (e) {
      const msg = String(e).toLowerCase();
      if (msg.includes('unique') && msg.includes('username')) {
        return Response.json({ error: 'Username already taken' }, { status: 409 });
      }
      if (msg.includes('unique') && msg.includes('email')) {
        return Response.json({ error: 'Email already in use' }, { status: 409 });
      }
      throw e;
    }

    const user = await env.DB.prepare(
      'SELECT id, username, email, is_admin, avatar_url, email_verified, timezone, created_at, last_login_at, onboarding_completed FROM users WHERE id = ?'
    ).bind(data.userId).first();

    return Response.json({ data: user });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, data }) {
  try {
    // Cascade delete all user data
    const tables = ['tasks', 'deadlines', 'projects', 'events', 'blocked_times', 'day_notes',
                    'activity_log', 'password_resets', 'email_verifications', 'user_settings'];

    const stmts = tables.map(table =>
      env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(data.userId)
    );

    // Delete the user last
    stmts.push(env.DB.prepare('DELETE FROM users WHERE id = ?').bind(data.userId));

    await env.DB.batch(stmts);

    return Response.json({ data: { deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
