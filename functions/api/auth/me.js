export async function onRequestGet({ env, data }) {
  try {
    const user = await env.DB.prepare(`
      SELECT u.id, u.username, u.email, u.is_admin, u.avatar_url, u.email_verified,
             u.timezone, u.created_at, u.last_login_at, u.onboarding_completed,
             s.work_hours_start, s.work_hours_end, s.default_task_duration,
             s.week_starts_on, s.date_format, s.enable_sounds, s.enable_celebrations
      FROM users u
      LEFT JOIN user_settings s ON s.user_id = u.id
      WHERE u.id = ?
    `).bind(data.userId).first();

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: !!user.is_admin,
        avatar_url: user.avatar_url,
        email_verified: !!user.email_verified,
        timezone: user.timezone,
        created_at: user.created_at,
        last_login_at: user.last_login_at,
        onboarding_completed: !!user.onboarding_completed,
        settings: {
          work_hours_start: user.work_hours_start,
          work_hours_end: user.work_hours_end,
          default_task_duration: user.default_task_duration,
          week_starts_on: user.week_starts_on,
          date_format: user.date_format,
          enable_sounds: !!user.enable_sounds,
          enable_celebrations: !!user.enable_celebrations,
        },
      },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
