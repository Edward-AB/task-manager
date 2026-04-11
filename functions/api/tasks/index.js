export async function onRequestGet({ request, env, data }) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to) {
      return Response.json({ error: 'from and to date params are required' }, { status: 400 });
    }

    const tasks = await env.DB.prepare(`
      SELECT id, parent_task_id, deadline_id, project_id, date, text, priority,
             duration, slot, done, done_at, color_id, note, sort_order, created_at, updated_at
      FROM tasks
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY sort_order ASC, created_at ASC
    `).bind(data.userId, from, to).all();

    return Response.json({ data: tasks.results });
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
      date, text, priority = null, duration = 2, slot = null,
      done = 0, color_id = 'white', note = '', sort_order = 0,
      parent_task_id = null, deadline_id = null, project_id = null,
    } = body;

    if (!date || !text) {
      return Response.json({ error: 'date and text are required' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO tasks (id, user_id, parent_task_id, deadline_id, project_id, date, text, priority,
                         duration, slot, done, color_id, note, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, data.userId, parent_task_id, deadline_id, project_id, date, text, priority,
      duration, slot, done ? 1 : 0, color_id, note, sort_order, now, now
    ).run();

    const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(id).first();
    return Response.json({ data: task }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
