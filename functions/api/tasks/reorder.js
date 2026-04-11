export async function onRequestPost({ request, env, data }) {
  try {
    const { taskIds } = await request.json();

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return Response.json({ error: 'taskIds array is required' }, { status: 400 });
    }

    const stmts = taskIds.map((id, index) =>
      env.DB.prepare(
        'UPDATE tasks SET sort_order = ?, updated_at = ? WHERE id = ? AND user_id = ?'
      ).bind(index, Date.now(), id, data.userId)
    );

    await env.DB.batch(stmts);

    return Response.json({ data: { reordered: taskIds.length } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
