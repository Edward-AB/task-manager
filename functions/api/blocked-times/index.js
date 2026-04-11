export async function onRequestGet({ env, data }) {
  try {
    const blockedTimes = await env.DB.prepare(
      'SELECT * FROM blocked_times WHERE user_id = ? ORDER BY start_slot ASC'
    ).bind(data.userId).all();

    return Response.json({ data: blockedTimes.results });
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
      label = 'Blocked', start_slot, end_slot,
      days = '0,1,2,3,4,5,6', color = '#374151',
    } = body;

    if (start_slot == null || end_slot == null) {
      return Response.json({ error: 'start_slot and end_slot are required' }, { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO blocked_times (id, user_id, label, start_slot, end_slot, days, color, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, data.userId, label, start_slot, end_slot, days, color, now).run();

    const blocked = await env.DB.prepare('SELECT * FROM blocked_times WHERE id = ?').bind(id).first();
    return Response.json({ data: blocked }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
