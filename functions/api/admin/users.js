export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let countQuery, dataQuery;

    if (search) {
      const like = `%${search}%`;
      countQuery = env.DB.prepare(
        'SELECT COUNT(*) AS total FROM users WHERE email LIKE ? OR username LIKE ?'
      ).bind(like, like);
      dataQuery = env.DB.prepare(`
        SELECT id, username, email, is_admin, email_verified, timezone, created_at, last_login_at
        FROM users
        WHERE email LIKE ? OR username LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(like, like, limit, offset);
    } else {
      countQuery = env.DB.prepare('SELECT COUNT(*) AS total FROM users');
      dataQuery = env.DB.prepare(`
        SELECT id, username, email, is_admin, email_verified, timezone, created_at, last_login_at
        FROM users
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).bind(limit, offset);
    }

    const [countResult, dataResult] = await Promise.all([
      countQuery.first(),
      dataQuery.all(),
    ]);

    return Response.json({
      data: dataResult.results,
      pagination: {
        page,
        limit,
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit),
      },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
