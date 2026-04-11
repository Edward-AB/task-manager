export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) return next();
  return env.ASSETS.fetch(request);
}
