async function buildPulse(env) {
  if (!env.QARGA_METRICS_URL) return { ok: false, error: 'QARGA_METRICS_URL is not configured.' };
  const response = await fetch(env.QARGA_METRICS_URL, { headers: env.METRICS_BEARER_TOKEN ? { authorization: `Bearer ${env.METRICS_BEARER_TOKEN}` } : {} });
  if (!response.ok) return { ok: false, error: `Metrics endpoint returned ${response.status}.` };
  const metrics = await response.json();
  const payload = { type: 'qarga-weekly-pulse', timestamp: new Date().toISOString(), ok: true, metrics };
  if (env.REPORT_WEBHOOK_URL) await fetch(env.REPORT_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return payload;
}
export default {
  async scheduled(_event, env, ctx) { ctx.waitUntil(buildPulse(env)); },
  async fetch(_request, env) { return Response.json(await buildPulse(env)); }
};
