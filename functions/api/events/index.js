export async function onRequestGet({ request, env, data }) {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to) {
      return Response.json({ error: 'from and to date params are required' }, { status: 400 });
    }

    const events = await env.DB.prepare(`
      SELECT * FROM events
      WHERE user_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC, start_slot ASC
    `).bind(data.userId, from, to).all();

    return Response.json({ data: events.results });
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
      title, description = '', date, start_slot = null, end_slot = null,
      color = '#6366f1', all_day = 0, recurring = null,
    } = body;

    if (!title || !date) {
      return Response.json({ error: 'title and date are required' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO events (id, user_id, title, description, date, start_slot, end_slot,
                          color, all_day, recurring, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.userId, title, description, date, start_slot, end_slot, color, all_day ? 1 : 0, recurring, now, now).run();

    const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first();
    return Response.json({ data: event }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
