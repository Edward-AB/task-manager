export async function onRequestGet({ env, data, params }) {
  try {
    const task = await env.DB.prepare(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    return Response.json({ data: task });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env, data, params }) {
  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!existing) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowed = [
      'text', 'date', 'priority', 'duration', 'slot', 'done',
      'color_id', 'note', 'sort_order', 'parent_task_id', 'deadline_id', 'project_id',
    ];
    const sets = [];
    const values = [];

    for (const field of allowed) {
      if (field in body) {
        sets.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    // Handle done_at automatically
    if ('done' in body) {
      sets.push('done_at = ?');
      values.push(body.done ? Date.now() : null);
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    sets.push('updated_at = ?');
    values.push(Date.now());
    values.push(params.id);
    values.push(data.userId);

    await env.DB.prepare(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first();
    return Response.json({ data: task });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, data, params }) {
  try {
    const result = await env.DB.prepare(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).run();

    if (!result.meta.changes) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }
    return Response.json({ data: { id: params.id, deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
