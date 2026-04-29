export type ApiCost = "free" | "ai-tokens" | "proxy";

export type ApiEndpoint = {
  id: string;
  method: "GET" | "POST";
  path: string;
  cost: ApiCost;
  category:
    | "docs"
    | "chat"
    | "core"
    | "trace"
    | "transform"
    | "test"
    | "intel"
    | "ops";
  purpose: string;
  description?: string;
  requestShape?: string;
  responseShape?: string;
  curl?: string;
};

// Public origin for example URLs in the docs. Set NEXT_PUBLIC_BASE_URL on
// custom domains; falls back to Vercel's auto-injected VERCEL_PROJECT_PRODUCTION_URL
// at build time, then to the canonical preview URL.
const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://idmformulahelper.vercel.app");

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    id: "instructions",
    method: "GET",
    path: "/api/instructions",
    cost: "free",
    category: "docs",
    purpose: "This page. HTML for humans, JSON via `?format=json` for bots.",
    curl: `curl ${BASE}/api/instructions
curl -H "Accept: application/json" ${BASE}/api/instructions
curl ${BASE}/api/instructions?format=json`,
  },
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    cost: "free",
    category: "ops",
    purpose: "Status + upstream check against formulastudio.net.",
    responseShape: `{
  "status": "ok" | "degraded",
  "version": "0.3",
  "uptimeSeconds": 1234,
  "checks": { "formulastudio_upstream": { "ok": true, "latencyMs": 142 } }
}`,
    curl: `curl ${BASE}/api/health`,
  },
  {
    id: "chat",
    method: "POST",
    path: "/api/chat",
    cost: "ai-tokens",
    category: "chat",
    purpose:
      "Streaming AI chat with five IDM tool calls. Uses AI Gateway → claude-sonnet-4.6 by default. **Burns tokens on every conversation.**",
    description:
      "Wraps `streamText` from the Vercel AI SDK. The model can call validate_formula, lint_formula, format_formula, test_formula, and compile_group_rules tools (which proxy to formulastudio.net). Responses stream as UIMessageStream parts compatible with `@ai-sdk/react`'s useChat hook.",
    requestShape: `{
  "messages": UIMessage[],            // from useChat
  "data": { "formula": string }       // optional: editor context
}`,
  },
  {
    id: "idm-test",
    method: "POST",
    path: "/api/idm-test",
    cost: "proxy",
    category: "core",
    purpose:
      "Proxy to formulastudio.net /api/idm-test. Runs a formula against sample records.",
    requestShape: `{
  "formula": "{{...}}",
  "cases": [{ "name": string, "data": object, "expected"?: string }]
}`,
    curl: `curl -X POST ${BASE}/api/idm-test \\
  -H "Content-Type: application/json" \\
  -d '{"formula":"{{if equals school_name \\"A\\" \\"yes\\" \\"no\\"}}","cases":[{"data":{"school_name":"A"}}]}'`,
  },
  {
    id: "idm-format",
    method: "POST",
    path: "/api/idm-format",
    cost: "proxy",
    category: "transform",
    purpose: "Proxy to formulastudio.net /api/idm-format. Pretty-print or single-line + canonicalize aliases.",
    requestShape: `{
  "formula": "{{...}}",
  "pretty": true,                     // default true
  "canonicalize": true                // default true: equal -> equals, len -> length
}`,
    responseShape: `{
  "success": true,
  "formula": "{{if\\n  equals school_name \\"A\\"\\n  \\"yes\\"\\n  \\"no\\"}}",
  "options": { "pretty": true, "canonicalize": true }
}`,
    curl: `curl -X POST ${BASE}/api/idm-format \\
  -H "Content-Type: application/json" \\
  -d '{"formula":"{{if equal school_name \\"A\\" \\"yes\\" \\"no\\"}}","pretty":true}'`,
  },
  {
    id: "idm-trace",
    method: "POST",
    path: "/api/idm-trace",
    cost: "free",
    category: "trace",
    purpose:
      "Formula + record → AST + per-node trace + branch-taken on every if. **The killer endpoint** — lets any UI render hover-to-evaluate without re-implementing the parser/evaluator.",
    requestShape: `{
  "formula": "{{...}}",
  "data": object                      // a record to evaluate against
}`,
    responseShape: `{
  "success": true,
  "ast": { id, kind, ... },           // recursive
  "result": any,
  "trace": {
    "[nodeId]": { "value": any, "error"?: string, "branchTaken"?: 1 | 2 }
  }
}`,
    curl: `curl -X POST ${BASE}/api/idm-trace \\
  -H "Content-Type: application/json" \\
  -d '{"formula":"{{if equals school_name \\"A\\" \\"yes\\" \\"no\\"}}","data":{"school_name":"A"}}'`,
  },
  {
    id: "idm-coverage",
    method: "POST",
    path: "/api/idm-coverage",
    cost: "free",
    category: "trace",
    purpose: "Formula + records[] → per-if true/false counts + list of unreachable branches.",
    requestShape: `{
  "formula": "{{...}}",
  "records": [{ "name"?: string, "data": object }]
}`,
    responseShape: `{
  "success": true,
  "records": 6,
  "ifNodes": 3,
  "coverage": { "[nodeId]": { "true": 2, "false": 4 } },
  "unreachableBranches": [{ "nodeId", "start", "end", "emptyBranch": "true" }],
  "results": [{ "name", "output", "error"? }]
}`,
  },
  {
    id: "idm-typecheck",
    method: "POST",
    path: "/api/idm-typecheck",
    cost: "free",
    category: "intel",
    purpose: "Formula + schema → list of field references that don't exist on the schema. Catches `student.sis_di` typos.",
    requestShape: `{
  "formula": "{{...}}",
  "schema": object                    // a sample record works
}`,
    responseShape: `{
  "success": true,
  "ok": true,
  "fieldsReferenced": ["student.sis_id", "name.first"],
  "issues": [{ "path", "start", "end", "reason": "missing" }]
}`,
  },
  {
    id: "idm-batch-test",
    method: "POST",
    path: "/api/idm-batch-test",
    cost: "free",
    category: "test",
    purpose: "Like /api/idm-test but takes up to 5000 records. Returns aggregate output distribution + pass/fail counts + elapsed ms.",
    requestShape: `{
  "formula": "{{...}}",
  "records": [{ "name"?: string, "data": object, "expected"?: string }]
}`,
    responseShape: `{
  "success": true,
  "count": 5000,
  "compared": 5000,
  "passCount": 4987,
  "failCount": 13,
  "elapsedMs": 87,
  "distribution": [{ "output": "Senior", "count": 1240 }, ...],
  "results": [...]
}`,
  },
  {
    id: "idm-decompile",
    method: "POST",
    path: "/api/idm-decompile",
    cost: "free",
    category: "transform",
    purpose: "IDM formula → structured rules JSON (inverse of /api/idm-group-rules). Best-effort.",
    description:
      "Returns `decompilable: false` with a reason if the formula uses shapes outside {equals, contains, in, comparisons} over field+literal optionally chained with and/or.",
    requestShape: `{ "formula": "{{...}}" }`,
    responseShape: `{
  "success": true,
  "decompilable": true,
  "rules": [
    { "priority": 1, "output": "A", "match": "all", "conditions": [{...}] }
  ],
  "defaultOutput": "Other"
}`,
  },
  {
    id: "idm-explain",
    method: "POST",
    path: "/api/idm-explain",
    cost: "free",
    category: "intel",
    purpose: "Formula → structured plain-English walkthrough. Template-driven, no AI.",
    requestShape: `{ "formula": "{{...}}" }`,
    responseShape: `{
  "success": true,
  "shape": "if-chain",
  "summary": "Maps 2 conditions to outputs, with a final fallback.",
  "branches": [
    { "when": "school_name equals \\"A\\"", "output": "\\"yes\\"" },
    { "when": "otherwise", "output": "\\"no\\"", "isFallback": true }
  ]
}`,
  },
  {
    id: "idm-diff",
    method: "POST",
    path: "/api/idm-diff",
    cost: "free",
    category: "trace",
    purpose: "Semantic diff between two formulas (not text diff). Aligns by index across the if-chain.",
    requestShape: `{ "before": "{{...}}", "after": "{{...}}" }`,
    responseShape: `{
  "success": true,
  "shapeBefore": "if-chain(3)",
  "shapeAfter": "if-chain(4)",
  "identical": false,
  "summary": "1 branch-added, 1 output-changed",
  "changes": [
    { "kind": "branch-added", "where": 1, "condition": "...", "output": "..." },
    { "kind": "output-changed", "where": 2, "before": "...", "after": "..." }
  ]
}`,
  },
  {
    id: "idm-simplify",
    method: "POST",
    path: "/api/idm-simplify",
    cost: "free",
    category: "transform",
    purpose: "Deterministic optimizer. Collapses if-branches that share an output, removes double-negation, drops if-branches with identical sides.",
    description:
      "Rewrites: `if c1 X if c2 X if c3 X fb` → `if or or c1 c2 c3 X fb`. Returns notes describing each transformation applied.",
    requestShape: `{ "formula": "{{...}}" }`,
    responseShape: `{
  "success": true,
  "formula": "{{...}}",                // simplified
  "changed": true,
  "notes": ["merged consecutive if-branches that share an output via \`or\`"]
}`,
  },
  {
    id: "idm-fields",
    method: "GET",
    path: "/api/idm-fields/{domain}",
    cost: "free",
    category: "intel",
    purpose: "Curated field dictionaries for a domain. Drives autocomplete in editor UIs.",
    description: "Domains: `k12` (40+ paths), `hr` (~14 paths), `healthcare` (~10 paths). Use `_all` to list domain summaries.",
    responseShape: `{
  "success": true,
  "id": "k12",
  "label": "K-12 Identity",
  "description": "...",
  "fields": [
    { "path": "student.sis_id", "type": "string", "description": "...", "example": "STU-847291" }
  ]
}`,
    curl: `curl ${BASE}/api/idm-fields/k12
curl ${BASE}/api/idm-fields/_all`,
  },
  {
    id: "idm-complete",
    method: "POST",
    path: "/api/idm-complete",
    cost: "free",
    category: "intel",
    purpose: "Cursor-position autocomplete. LSP-shaped output: ranked completions for the prefix at the cursor (functions + dotted field paths from the supplied data).",
    requestShape: `{
  "formula": "{{if greater stu",
  "pos": 17,                          // cursor offset in formula
  "data"?: object,                    // record to extract field paths from
  "limit"?: 20
}`,
    responseShape: `{
  "success": true,
  "prefix": "stu",
  "pos": 17,
  "completions": [
    { "insertText": "student.sis_id", "label": "...", "detail": "field", "kind": "field", "rank": 90 }
  ]
}`,
  },
];

export const CATEGORY_LABELS: Record<ApiEndpoint["category"], string> = {
  docs: "Docs",
  chat: "Chat (AI)",
  core: "Core toolchain (proxy)",
  transform: "Transform",
  trace: "Trace & coverage",
  test: "Testing",
  intel: "Intelligence (typecheck / explain / fields / autocomplete)",
  ops: "Ops",
};

export const COST_LABELS: Record<ApiCost, string> = {
  free: "Deterministic — no AI tokens",
  "ai-tokens": "Uses AI tokens",
  proxy: "Proxy to formulastudio.net",
};

export const COST_COLORS: Record<ApiCost, string> = {
  free: "#16a34a",
  "ai-tokens": "#dc2626",
  proxy: "#2563eb",
};
