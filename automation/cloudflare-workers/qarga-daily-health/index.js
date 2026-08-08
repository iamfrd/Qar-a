async function fetchHealth(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: 'follow' });
    return { url, ok: response.ok, status: response.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { url, ok: false, status: null, latencyMs: Date.now() - started, error: String(error?.message || error).slice(0, 200) };
  }
}
async function report(env) {
  const urls = String(env.QARGA_HEALTH_URLS || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!urls.length) return { ok: false, error: 'QARGA_HEALTH_URLS is not configured.' };
  const checks = await Promise.all(urls.map(fetchHealth));
  const payload = { type: 'qarga-daily-health', timestamp: new Date().toISOString(), ok: checks.every((x) => x.ok), checks };
  if (env.REPORT_WEBHOOK_URL) await fetch(env.REPORT_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return payload;
}
export default {
  async scheduled(_event, env, ctx) { ctx.waitUntil(report(env)); },
  async fetch(_request, env) { return Response.json(await report(env)); }
};
