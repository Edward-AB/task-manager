export async function onRequestPost({ request }) {
  try {
    const { email } = await request.json();
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    return Response.json({
      data: { message: 'If an account with that email exists, a reset link has been sent.' },
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
