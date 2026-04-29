const STARTED_AT = Date.now();

export async function GET() {
  let upstreamOk = false;
  let upstreamLatencyMs: number | null = null;
  try {
    const t0 = Date.now();
    const res = await fetch("https://www.formulastudio.net/api/idm-spec", {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    upstreamOk = res.ok;
    upstreamLatencyMs = Date.now() - t0;
  } catch {
    upstreamOk = false;
  }

  return Response.json({
    status: upstreamOk ? "ok" : "degraded",
    version: "0.3",
    uptimeSeconds: Math.floor((Date.now() - STARTED_AT) / 1000),
    checks: {
      formulastudio_upstream: {
        ok: upstreamOk,
        latencyMs: upstreamLatencyMs,
      },
    },
    timestamp: new Date().toISOString(),
  });
}
