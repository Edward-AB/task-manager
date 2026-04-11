export async function onRequestPost({ request, env, data }) {
  try {
    const { taskId, newDate } = await request.json();

    if (!taskId || !newDate) {
      return Response.json({ error: 'taskId and newDate are required' }, { status: 400 });
    }

    const existing = await env.DB.prepare(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
    ).bind(taskId, data.userId).first();

    if (!existing) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    await env.DB.prepare(
      'UPDATE tasks SET date = ?, slot = NULL, updated_at = ? WHERE id = ? AND user_id = ?'
    ).bind(newDate, Date.now(), taskId, data.userId).run();

    const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?').bind(taskId).first();
    return Response.json({ data: task });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
