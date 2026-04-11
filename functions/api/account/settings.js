export async function onRequestGet({ env, data }) {
  try {
    const settings = await env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(data.userId).first();

    if (!settings) {
      // Return defaults if no settings row exists
      return Response.json({
        data: {
          user_id: data.userId,
          work_hours_start: 32,
          work_hours_end: 68,
          default_task_duration: 2,
          week_starts_on: 1,
          date_format: 'en-GB',
          enable_sounds: 1,
          enable_celebrations: 1,
          font_preference: 'default',
        },
      });
    }

    return Response.json({ data: settings });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, data }) {
  try {
    const body = await request.json();
    const now = Date.now();

    const allowed = [
      'work_hours_start', 'work_hours_end', 'default_task_duration',
      'week_starts_on', 'date_format', 'enable_sounds', 'enable_celebrations',
      'font_preference',
    ];

    // Check if settings row exists
    const existing = await env.DB.prepare(
      'SELECT user_id FROM user_settings WHERE user_id = ?'
    ).bind(data.userId).first();

    if (!existing) {
      // Insert with defaults then update
      await env.DB.prepare(
        'INSERT INTO user_settings (user_id, updated_at) VALUES (?, ?)'
      ).bind(data.userId, now).run();
    }

    const sets = [];
    const values = [];

    for (const field of allowed) {
      if (field in body) {
        sets.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    sets.push('updated_at = ?');
    values.push(now);
    values.push(data.userId);

    await env.DB.prepare(
      `UPDATE user_settings SET ${sets.join(', ')} WHERE user_id = ?`
    ).bind(...values).run();

    const settings = await env.DB.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(data.userId).first();

    return Response.json({ data: settings });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
