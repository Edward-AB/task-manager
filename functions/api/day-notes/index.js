export async function onRequestGet({ request, env, data }) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return Response.json({ error: 'date param is required' }, { status: 400 });
    }

    const note = await env.DB.prepare(
      'SELECT * FROM day_notes WHERE user_id = ? AND date = ?'
    ).bind(data.userId, date).first();

    return Response.json({ data: note || { date, content: '' } });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, data }) {
  try {
    const { date, content } = await request.json();

    if (!date) {
      return Response.json({ error: 'date is required' }, { status: 400 });
    }

    const now = Date.now();

    // Upsert: try update first, then insert
    const existing = await env.DB.prepare(
      'SELECT id FROM day_notes WHERE user_id = ? AND date = ?'
    ).bind(data.userId, date).first();

    if (existing) {
      await env.DB.prepare(
        'UPDATE day_notes SET content = ?, updated_at = ? WHERE id = ?'
      ).bind(content || '', now, existing.id).run();
    } else {
      const id = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO day_notes (id, user_id, date, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, data.userId, date, content || '', now, now).run();
    }

    const note = await env.DB.prepare(
      'SELECT * FROM day_notes WHERE user_id = ? AND date = ?'
    ).bind(data.userId, date).first();

    return Response.json({ data: note });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
