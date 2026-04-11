export async function onRequestPost({ data }) {
  if (!data.isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json({ error: 'Not implemented' }, { status: 501 });
}
