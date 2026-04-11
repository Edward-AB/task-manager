export async function onRequestDelete({ env, data, params }) {
  try {
    const result = await env.DB.prepare(
      'DELETE FROM blocked_times WHERE id = ? AND user_id = ?'
    ).bind(params.id, data.userId).run();

    if (!result.meta.changes) {
      return Response.json({ error: 'Blocked time not found' }, { status: 404 });
    }
    return Response.json({ data: { id: params.id, deleted: true } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
