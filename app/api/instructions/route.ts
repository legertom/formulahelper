import {
  API_ENDPOINTS,
  CATEGORY_LABELS,
  COST_COLORS,
  COST_LABELS,
  type ApiEndpoint,
} from "@/lib/api-docs";

function originFromRequest(req: Request): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
  try {
    return new URL(req.url).origin;
  } catch {
    return "https://idmformulahelper.vercel.app";
  }
}

const FALLBACK_BASE = "https://idmformulahelper.vercel.app";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rewriteBase(text: string | undefined, base: string): string | undefined {
  if (!text) return text;
  return text.replaceAll(FALLBACK_BASE, base);
}

function buildJson(base: string) {
  return {
    name: "Formula Helper API",
    version: "0.4",
    baseUrl: base,
    auth: "none currently required",
    upstream: "https://www.formulastudio.net",
    repo: "https://github.com/legertom/formulahelper",
    aboutPage: `${base}/about`,
    endpointCount: API_ENDPOINTS.length,
    endpoints: API_ENDPOINTS.map((e) => ({
      id: e.id,
      method: e.method,
      path: e.path,
      cost: e.cost,
      category: e.category,
      purpose: e.purpose,
      description: e.description,
      requestShape: e.requestShape,
      responseShape: e.responseShape,
      curl: rewriteBase(e.curl, base),
    })),
    categories: CATEGORY_LABELS,
    costs: COST_LABELS,
  };
}

function endpointSection(ep: ApiEndpoint, base: string): string {
  const url = `${base}${ep.path}`;
  const curl = rewriteBase(ep.curl, base);
  const costColor = COST_COLORS[ep.cost];
  const costLabel = COST_LABELS[ep.cost];
  return `
  <section class="ep" id="${ep.id}">
    <header>
      <code class="method ${ep.method}">${ep.method}</code>
      <a href="#${ep.id}" class="path">${escapeHtml(ep.path)}</a>
      <span class="cost" style="background:${costColor}1a;color:${costColor};border-color:${costColor}40;">${escapeHtml(costLabel)}</span>
    </header>
    <p class="purpose">${ep.purpose
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")}</p>
    ${ep.description ? `<p class="desc">${escapeHtml(ep.description).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>` : ""}
    ${ep.requestShape ? `<details open><summary>Request body</summary><pre><code>${escapeHtml(ep.requestShape)}</code></pre></details>` : ""}
    ${ep.responseShape ? `<details><summary>Response</summary><pre><code>${escapeHtml(ep.responseShape)}</code></pre></details>` : ""}
    ${curl ? `<details><summary>curl</summary><pre><code>${escapeHtml(curl)}</code></pre></details>` : ""}
    <p class="try">→ <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></p>
  </section>`;
}

function buildHtml(base: string): string {
  const grouped = API_ENDPOINTS.reduce<Record<string, ApiEndpoint[]>>(
    (acc, e) => {
      (acc[e.category] ??= []).push(e);
      return acc;
    },
    {},
  );
  const tocRows = API_ENDPOINTS.map((ep) => {
    const color = COST_COLORS[ep.cost];
    return `
      <tr>
        <td><code class="method ${ep.method}">${ep.method}</code></td>
        <td><a href="#${ep.id}">${escapeHtml(ep.path)}</a></td>
        <td>${ep.purpose
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/`([^`]+)`/g, "<code>$1</code>")}</td>
        <td><span class="dot" style="background:${color}"></span></td>
      </tr>`;
  }).join("");

  const sections = Object.entries(grouped)
    .map(
      ([cat, eps]) => `
    <h2 id="cat-${cat}">${escapeHtml(CATEGORY_LABELS[cat as ApiEndpoint["category"]])}</h2>
    ${eps.map((ep) => endpointSection(ep, base)).join("")}
  `,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Formula Helper · API Instructions</title>
  <style>
    :root {
      --bg: #fafafa;
      --fg: #18181b;
      --muted: #71717a;
      --line: #e4e4e7;
      --card: #ffffff;
      --code-bg: #18181b;
      --code-fg: #e4e4e7;
      --accent: #65a30d;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #09090b;
        --fg: #fafafa;
        --muted: #a1a1aa;
        --line: #27272a;
        --card: #18181b;
        --code-bg: #0a0a0a;
        --code-fg: #d4d4d8;
        --accent: #84cc16;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--fg);
      font-family: ui-sans-serif, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      line-height: 1.55;
      font-size: 15px;
    }
    .wrap { max-width: 880px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    h1 { font-size: 1.7rem; margin: 0 0 0.4rem; letter-spacing: -0.01em; }
    h2 {
      font-size: 1.05rem;
      margin: 2.2rem 0 0.8rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid var(--line);
      letter-spacing: -0.005em;
    }
    .lede {
      color: var(--muted);
      margin: 0 0 1.5rem;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code, pre {
      font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace;
      font-size: 0.85rem;
    }
    p code, td code, summary code, .purpose code, .desc code {
      background: var(--line);
      color: var(--fg);
      padding: 0.05rem 0.35rem;
      border-radius: 3px;
      font-size: 0.85em;
    }
    pre {
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 0.85rem 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0.5rem 0 0;
      border: 1px solid var(--line);
    }
    pre code { background: transparent; padding: 0; color: inherit; font-size: 0.82rem; }
    .summary-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.9rem 1rem;
      margin: 0 0 1.5rem;
      font-size: 0.92rem;
    }
    .summary-card strong { font-weight: 600; }
    .summary-card .row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .summary-card .row > div { flex: 1 1 200px; }
    .summary-card label {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 0.15rem;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.88rem; }
    th, td {
      padding: 0.55rem 0.5rem;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    th { font-weight: 600; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; }
    .method {
      display: inline-block;
      padding: 0.05rem 0.4rem;
      border-radius: 3px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      background: var(--line);
      color: var(--fg);
    }
    .method.GET { background: #d1fae5; color: #065f46; }
    .method.POST { background: #dbeafe; color: #1e40af; }
    @media (prefers-color-scheme: dark) {
      .method.GET { background: #064e3b; color: #6ee7b7; }
      .method.POST { background: #1e3a8a; color: #93c5fd; }
    }
    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .ep {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem;
      margin: 0.75rem 0;
      background: var(--card);
    }
    .ep header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .ep .path {
      font-family: ui-monospace, monospace;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--fg);
    }
    .cost {
      font-size: 0.7rem;
      padding: 0.1rem 0.5rem;
      border-radius: 999px;
      border: 1px solid;
      letter-spacing: 0.02em;
      font-weight: 500;
    }
    .purpose { margin: 0.25rem 0; }
    .desc { margin: 0.25rem 0 0.5rem; color: var(--muted); font-size: 0.9rem; }
    .ep details { margin-top: 0.6rem; }
    .ep summary {
      cursor: pointer;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      padding: 0.2rem 0;
    }
    .ep summary:hover { color: var(--fg); }
    .try { margin: 0.75rem 0 0; font-size: 0.78rem; color: var(--muted); }
    .try a { word-break: break-all; }
    .legend {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.78rem;
      color: var(--muted);
      margin-top: 0.5rem;
    }
    .legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
    nav.tabs {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin: 1rem 0 0;
    }
    nav.tabs a {
      padding: 0.25rem 0.7rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      font-size: 0.8rem;
      color: var(--muted);
    }
    nav.tabs a:hover { color: var(--fg); border-color: var(--fg); text-decoration: none; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: 0.78rem; }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>Formula Helper · API Instructions</h1>
    <p class="lede">
      ${API_ENDPOINTS.length} endpoints for working with IDM formulas. ${API_ENDPOINTS.filter((e) => e.cost === "free").length} are pure deterministic algorithms (no AI tokens). 2 are proxies to <a href="https://www.formulastudio.net">formulastudio.net</a>. 1 (<a href="#chat"><code>/api/chat</code></a>) burns AI tokens.
    </p>

    <div class="summary-card">
      <div class="row">
        <div>
          <label>Base URL</label>
          <strong><code>${base}</code></strong>
        </div>
        <div>
          <label>Auth</label>
          <strong>None currently required</strong>
        </div>
        <div>
          <label>Format</label>
          <strong>JSON over <code>?format=json</code> or <code>Accept: application/json</code></strong>
        </div>
      </div>
      <div class="legend">
        <span><span class="dot" style="background:${COST_COLORS.free}"></span> Free / deterministic (no tokens)</span>
        <span><span class="dot" style="background:${COST_COLORS.proxy}"></span> Proxy to formulastudio.net</span>
        <span><span class="dot" style="background:${COST_COLORS["ai-tokens"]}"></span> Uses AI tokens</span>
      </div>
    </div>

    <nav class="tabs">
      ${Object.entries(grouped)
        .map(
          ([cat]) =>
            `<a href="#cat-${cat}">${escapeHtml(CATEGORY_LABELS[cat as ApiEndpoint["category"]])}</a>`,
        )
        .join("")}
      <a href="https://github.com/legertom/formulahelper" target="_blank" rel="noreferrer">GitHub ↗</a>
      <a href="${base}/about">About →</a>
      <a href="https://www.formulastudio.net/api/instructions" target="_blank" rel="noreferrer">formulastudio.net docs ↗</a>
    </nav>

    <h2 id="endpoints">All endpoints</h2>
    <table>
      <thead><tr><th>Method</th><th>Path</th><th>Purpose</th><th></th></tr></thead>
      <tbody>${tocRows}</tbody>
    </table>

    ${sections}

    <footer>
      <strong>Formula Helper</strong> · Built on <a href="https://nextjs.org">Next.js 16</a>, the <a href="https://sdk.vercel.ai">Vercel AI SDK</a>, and <a href="https://www.formulastudio.net/api/instructions">formulastudio.net</a>. Source at <a href="https://github.com/legertom/formulahelper">github.com/legertom/formulahelper</a>.
    </footer>
  </main>
</body>
</html>`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accept = req.headers.get("accept") ?? "";
    const wantsJson =
      url.searchParams.get("format") === "json" ||
      accept.includes("application/json");
    const base = originFromRequest(req);

    if (wantsJson) {
      return Response.json(buildJson(base));
    }

    return new Response(buildHtml(base), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[/api/instructions] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
