export async function onRequestGet({ env }) {
  try {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const [totalUsers, totalTasks, activeUsers, signupsThisWeek] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) AS count FROM users').first(),
      env.DB.prepare('SELECT COUNT(*) AS count FROM tasks').first(),
      env.DB.prepare(
        'SELECT COUNT(*) AS count FROM users WHERE last_login_at > ?'
      ).bind(sevenDaysAgo).first(),
      env.DB.prepare(
        'SELECT COUNT(*) AS count FROM users WHERE created_at > ?'
      ).bind(sevenDaysAgo).first(),
    ]);

    return Response.json({
      data: {
        total_users: totalUsers.count,
        total_tasks: totalTasks.count,
        active_users_7d: activeUsers.count,
        signups_this_week: signupsThisWeek.count,
      },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
