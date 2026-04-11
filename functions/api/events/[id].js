export async function onRequestGet({ env, data, params }) {
  try {
    const event = await env.DB.prepare(
      'SELECT * FROM events WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    return Response.json({ data: event });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env, data, params }) {
  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM events WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!existing) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowed = ['title', 'description', 'date', 'start_slot', 'end_slot', 'color', 'all_day', 'recurring'];
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
    values.push(Date.now());
    values.push(params.id);
    values.push(data.userId);

    await env.DB.prepare(
      `UPDATE events SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(params.id).first();
    return Response.json({ data: event });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, data, params }) {
  try {
    const result = await env.DB.prepare(
      'DELETE FROM events WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).run();

    if (!result.meta.changes) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }
    return Response.json({ data: { id: params.id, deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
