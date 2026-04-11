export async function onRequestGet({ env, data, params }) {
  try {
    const project = await env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch associated tasks and deadlines
    const [tasks, deadlines] = await Promise.all([
      env.DB.prepare(
        'SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY date ASC, sort_order ASC'
      ).bind(params.id, data.userId).all(),
      env.DB.prepare(
        'SELECT * FROM deadlines WHERE project_id = ? AND user_id = ? ORDER BY due_date ASC'
      ).bind(params.id, data.userId).all(),
    ]);

    return Response.json({
      data: {
        ...project,
        tasks: tasks.results,
        deadlines: deadlines.results,
      },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPatch({ request, env, data, params }) {
  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).first();

    if (!existing) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const allowed = ['name', 'description', 'color_idx', 'start_date', 'end_date', 'budget', 'archived', 'sort_order'];
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
      `UPDATE projects SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();

    const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(params.id).first();
    return Response.json({ data: project });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, data, params }) {
  try {
    const result = await env.DB.prepare(
      'DELETE FROM projects WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).run();

    if (!result.meta.changes) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    return Response.json({ data: { id: params.id, deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
