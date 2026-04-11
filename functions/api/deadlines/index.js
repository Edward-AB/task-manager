export async function onRequestGet({ env, data }) {
  try {
    const deadlines = await env.DB.prepare(`
      SELECT d.*,
        (SELECT COUNT(*) FROM tasks t WHERE t.deadline_id = d.id) AS task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.deadline_id = d.id AND t.done = 1) AS done_count
      FROM deadlines d
      WHERE d.user_id = ?
      ORDER BY d.due_date ASC
    `).bind(data.userId).all();

    return Response.json({ data: deadlines.results });
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
      title, description = '', start_date, due_date,
      color_idx = 0, project_id = null,
    } = body;

    if (!title || !start_date || !due_date) {
      return Response.json({ error: 'title, start_date, and due_date are required' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO deadlines (id, user_id, project_id, title, description, start_date, due_date,
                             color_idx, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.userId, project_id, title, description, start_date, due_date, color_idx, now, now).run();

    const deadline = await env.DB.prepare('SELECT * FROM deadlines WHERE id = ?').bind(id).first();
    return Response.json({ data: deadline }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
