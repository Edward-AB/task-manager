export async function onRequestGet({ env, data, params }) {
  try {
    const deadline = await env.DB.prepare(
      'SELECT * FROM deadlines WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!deadline) {
      return Response.json({ error: 'Deadline not found' }, { status: 404 });
    }
    return Response.json({ data: deadline });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env, data, params }) {
  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM deadlines WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!existing) {
      return Response.json({ error: 'Deadline not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowed = ['title', 'description', 'start_date', 'due_date', 'color_idx', 'project_id', 'archived'];
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
      `UPDATE deadlines SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    const deadline = await env.DB.prepare('SELECT * FROM deadlines WHERE id = ?').bind(params.id).first();
    return Response.json({ data: deadline });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, data, params }) {
  try {
    const result = await env.DB.prepare(
      'DELETE FROM deadlines WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).run();

    if (!result.meta.changes) {
      return Response.json({ error: 'Deadline not found' }, { status: 404 });
    }
    return Response.json({ data: { id: params.id, deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
