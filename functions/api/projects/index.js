export async function onRequestGet({ env, data }) {
  try {
    const projects = await env.DB.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.done = 1) AS done_task_count,
        (SELECT COUNT(*) FROM deadlines d WHERE d.project_id = p.id) AS deadline_count
      FROM projects p
      WHERE p.user_id = ?
      ORDER BY p.sort_order ASC, p.created_at ASC
    `).bind(data.userId).all();

    return Response.json({ data: projects.results });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPost({ request, env, data }) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = Date.now();

    const {
      name, description = '', color_idx = 0,
      start_date = null, end_date = null, budget = null, sort_order = 0,
    } = body;

    if (!name) {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO projects (id, user_id, name, description, color_idx, start_date, end_date,
                            budget, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.userId, name, description, color_idx, start_date, end_date, budget, sort_order, now, now).run();

    const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    return Response.json({ data: project }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
