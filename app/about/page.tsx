import Link from "next/link";
import { IDM_FUNCTIONS } from "@/lib/idm/spec";
import { SAMPLE_PERSONAS, EXAMPLE_FORMULAS } from "@/lib/idm/sample-data";

export const metadata = {
  title: "About — Formula Helper",
  description: "Architecture, features, and credits for Formula Helper.",
};

const REPO_URL = "https://github.com/legertom/formulahelper";
const FORMULASTUDIO_REPO = "https://github.com/legertom/formulastudio";

export default function AboutPage() {
  return (
    <main className="flex-1 min-h-0 overflow-auto bg-background text-foreground">
      <header className="border-b border-border bg-background/90 backdrop-blur-[2px] px-5 h-11 flex items-center justify-between sticky top-0 z-10 text-[12px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[var(--lime)] text-base leading-none">ƒ</span>
          <span className="font-medium tracking-tight">formula-helper · about</span>
        </div>
        <Link
          href="/"
          className="h-7 px-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
        >
          ← back
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 space-y-12 text-[13px] leading-relaxed">
        <section className="space-y-3">
          <Heading>What this is</Heading>
          <p>
            <strong>Formula Helper</strong> is an AI-assisted workbench for building, testing,
            and explaining <strong>IDM (Identity Management) formulas</strong> — a small
            prefix-notation template language wrapped in{" "}
            <code className="font-mono">{"{{ ... }}"}</code> that maps identity attributes to
            output values (assigning students to groups, classifying staff into departments,
            mapping school SIS IDs to friendly names).
          </p>
          <p>
            The model never just guesses. It calls the deterministic toolchain at{" "}
            <a href="https://formulastudio.net" className="underline decoration-dotted">
              formulastudio.net
            </a>{" "}
            (validate, lint, format, test, compile-group-rules) as tool invocations.
          </p>
        </section>

        <section className="space-y-4">
          <Heading>Features</Heading>
          <ol className="space-y-4 list-none pl-0 counter-reset-features">
            <Feature
              n="01"
              title="Syntax-highlighted editor"
              body="Live colorization as you type. Function names and braces in lime, strings in foreground, numbers in amber, fields in muted gray, punctuation dimmed. Caret is lime. Live char/line counter in the toolbar."
            />
            <Feature
              n="02"
              title="Live result strip"
              body="Every keystroke debounces 350 ms, hits /api/idm-test, and shows the formula's actual output against the active sample record. Status pill (idle/eval/ok/error), elapsed ms, full output inline. No 'Run' button needed — the common path is immediate."
            />
            <Feature
              n="03"
              title="Sample data tab + persona library"
              body={
                <>
                  Editable JSON editor for the active record with parse-state badge. Six baked-in
                  personas covering edge cases:
                  <ul className="list-disc pl-5 mt-2 space-y-0.5 text-muted-foreground">
                    {SAMPLE_PERSONAS.map((p) => (
                      <li key={p.id}>
                        <strong className="text-foreground">{p.label}</strong> — {p.blurb}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
            <Feature
              n="04"
              title="Fields tab"
              body="extractFieldPaths() walks the parsed record and produces every dotted field path. Filterable list with a peek of the current value (truncated to 26 chars). Click any path to insert it into the formula."
            />
            <Feature
              n="05"
              title="Examples tab"
              body={
                <>
                  Five canned IDM patterns, one click loads into the editor:
                  <ol className="list-decimal pl-5 mt-2 space-y-0.5 text-muted-foreground">
                    {EXAMPLE_FORMULAS.map((ex) => (
                      <li key={ex.id}>
                        <strong className="text-foreground">{ex.title}</strong> — {ex.blurb}
                      </li>
                    ))}
                  </ol>
                </>
              }
            />
            <Feature
              n="06"
              title="Trace tab (hover-to-evaluate / step-through)"
              body={
                <>
                  A client-side parser (<code className="font-mono">lib/idm/parser.ts</code>) and
                  evaluator (<code className="font-mono">lib/idm/eval.ts</code>) walk the formula
                  into an AST and evaluate every sub-expression against the active record. The
                  trace renders each node as a colored-border line showing{" "}
                  <code className="font-mono">{"name → value"}</code>. <code>if</code> branches
                  are labeled <em>cond / true / false</em>; the untaken branch is dimmed.
                </>
              }
            />
            <Feature
              n="07"
              title="Branch coverage"
              body={`The trace tab has a "▷ run ${SAMPLE_PERSONAS.length} records" button. It evaluates the formula against every persona in the library and annotates each if-node with how many records hit the true vs false branch — surfaces unreachable branches in long classifier chains.`}
            />
            <Feature
              n="08"
              title="Format (pretty-print + canonicalize)"
              body={
                <>
                  Editor toolbar has a <code className="font-mono">format</code> button that POSTs
                  to <code className="font-mono">/api/idm-format</code> (a proxy to
                  formulastudio.net). Returns indentation-pretty IDM with canonical function
                  names (<code className="font-mono">equal</code> →{" "}
                  <code className="font-mono">equals</code>, <code className="font-mono">len</code> →{" "}
                  <code className="font-mono">length</code>). Format actions are recorded in
                  history.
                </>
              }
            />
            <Feature
              n="09"
              title="History + diff (persisted)"
              body={
                <>
                  Every formula change pushes onto a stack persisted to{" "}
                  <code className="font-mono">localStorage</code>. The editor toolbar shows{" "}
                  <code className="font-mono">history · N</code>; clicking opens a popover with
                  the last 30 versions tagged by source (
                  <span className="text-muted-foreground">edit</span>,{" "}
                  <span className="text-[var(--lime)]">ai</span>,{" "}
                  <span className="text-[var(--amber)]">example</span>, format, share, init).
                  Selecting a version shows a line-diff against the current; click{" "}
                  <strong>↺ restore</strong> to swap (and the current is itself pushed onto
                  history first, so restore is reversible).
                </>
              }
            />
            <Feature
              n="10"
              title="Share via URL (zero backend)"
              body={
                <>
                  <code className="font-mono">share</code> button copies a URL with the formula,
                  sample data, and active tab encoded into the hash fragment via{" "}
                  <code className="font-mono">lz-string</code>. Hash fragments never go to the
                  server — pure client-side. On load, the page decodes the hash and restores
                  state.{" "}
                  <em className="text-muted-foreground">
                    Privacy note: the hash does ride along in browser history and link
                    unfurlers — don&rsquo;t paste real PII into the data tab before sharing.
                  </em>
                </>
              }
            />
            <Feature
              n="11"
              title="Explain in plain English"
              body="Editor toolbar's explain → button sends the current formula to the assistant with a structured walkthrough request. Markdown response renders streaming, GFM tables and code blocks included."
            />
            <Feature
              n="12"
              title="Streaming AI assistant with five tool calls"
              body={
                <>
                  Built on <strong>AI SDK v6</strong> with <strong>Vercel AI Gateway</strong>{" "}
                  (default <code className="font-mono">anthropic/claude-sonnet-4.6</code>). Tools
                  exposed: <code className="font-mono">validate_formula</code>,{" "}
                  <code className="font-mono">lint_formula</code>,{" "}
                  <code className="font-mono">format_formula</code>,{" "}
                  <code className="font-mono">test_formula</code>,{" "}
                  <code className="font-mono">compile_group_rules</code>. Loop bounded by{" "}
                  <code className="font-mono">stepCountIs(15)</code>. Tool calls render as
                  collapsible cards with live state badges (pending / running / completed /
                  error). When the assistant emits a fenced{" "}
                  <code className="font-mono">handlebars</code> block the editor auto-syncs to
                  it (and history records it as <code className="font-mono">ai</code>).
                </>
              }
            />
            <Feature
              n="13"
              title="Local-validator fallback"
              body={
                <>
                  If formulastudio.net is unreachable, <code className="font-mono">validate_formula</code>{" "}
                  drops to a local spec-driven validator (
                  <code className="font-mono">lib/idm/local-validator.ts</code>) that checks{" "}
                  <code className="font-mono">{"{{ }}"}</code> wrapping, parens absence, function
                  arity, and basic structure. Tools return a <code className="font-mono">source: &quot;local-fallback&quot;</code>{" "}
                  flag so the model knows.
                </>
              }
            />
            <Feature
              n="14"
              title="Theme toggle (dark default)"
              body={
                <>
                  Built on <code className="font-mono">next-themes</code>. Sun/moon button in the
                  header; persists via <code className="font-mono">localStorage</code>; respects{" "}
                  <code className="font-mono">prefers-color-scheme</code>; SSR-safe with{" "}
                  <code className="font-mono">suppressHydrationWarning</code>. Both themes
                  hand-tuned in oklch with the same lime accent.
                </>
              }
            />
          </ol>
        </section>

        <section className="space-y-3">
          <Heading>Stack</Heading>
          <Table
            rows={[
              ["Framework", "Next.js 16 (App Router) on Node.js runtime, Turbopack"],
              ["Language", "TypeScript 5"],
              ["Styling", "Tailwind CSS v4 + shadcn/ui (base-nova) + custom Terminal/Studio palette"],
              ["AI SDK", "Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)"],
              ["AI provider", "Vercel AI Gateway — default `anthropic/claude-sonnet-4.6`"],
              ["Chat rendering", "AI Elements (Conversation, Message, MessageResponse, Tool) + streamdown"],
              ["Theme", "next-themes (dark default, system detection)"],
              ["Validation", "Zod (tool input schemas)"],
              ["Diff", "diff (jsdiff) for history line-level diffing"],
              ["Share", "lz-string compressed URL hash fragments"],
              ["Hosting", "Vercel Fluid Compute"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <Heading>Server routes</Heading>
          <p className="text-muted-foreground">
            All routes return JSON. The 11 deterministic endpoints below run client-grade
            algorithms on the server (no AI tokens). The two upstream proxies and{" "}
            <code className="font-mono">/api/chat</code> are the only AI-cost paths.
          </p>
          <Table
            rows={[
              ["POST /api/chat", "streamText agent loop with five IDM tools (uses AI tokens)"],
              ["POST /api/idm-test", "proxy → formulastudio.net /api/idm-test"],
              ["POST /api/idm-format", "proxy → formulastudio.net /api/idm-format"],
              [
                "POST /api/idm-trace",
                "Formula + record → AST + per-node values + branch-taken on every if. Deterministic.",
              ],
              [
                "POST /api/idm-coverage",
                "Formula + records[] → which if-branches each record hit, plus list of unreachable branches.",
              ],
              [
                "POST /api/idm-typecheck",
                "Formula + schema → list of field references that don't exist on the schema.",
              ],
              [
                "POST /api/idm-batch-test",
                "Like /api/idm-test but takes up to 5000 records and returns aggregate output distribution + pass/fail counts + elapsed ms.",
              ],
              [
                "POST /api/idm-decompile",
                "IDM formula → structured rules JSON (inverse of /api/idm-group-rules). Best-effort: returns `decompilable: false` with a reason if the formula doesn't fit the rule shape.",
              ],
              [
                "POST /api/idm-explain",
                "Formula → structured walkthrough JSON: { summary, branches: [{ when, output }] }.",
              ],
              [
                "POST /api/idm-diff",
                "{ before, after } → semantic diff: branch-added, branch-removed, output-changed, condition-changed, fallback-changed.",
              ],
              [
                "POST /api/idm-simplify",
                "Deterministic optimizer: collapses if-branches that share an output via `or`, removes double-negation, drops if-branches whose true/false sides are identical. Returns { formula, changed, notes }.",
              ],
              [
                "GET /api/idm-fields/:domain",
                "Curated field dictionaries: k12, hr, healthcare. Use _all to list domain summaries.",
              ],
              [
                "POST /api/idm-complete",
                "{ formula, pos, data?, limit? } → ranked completions for the prefix at the cursor (functions + field paths from the supplied data).",
              ],
              [
                "GET /api/health",
                "Status + upstream check against formulastudio.net. ok / degraded.",
              ],
            ]}
          />
        </section>

        <section className="space-y-3">
          <Heading>Supported IDM functions</Heading>
          <p className="text-muted-foreground">
            All 29 functions from the IDM language spec are embedded in the system prompt and
            implemented in the local evaluator (used by the trace tab). Source of truth:{" "}
            <code className="font-mono">https://formulastudio.net/api/idm-spec</code>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 text-[11px] font-mono">
            {IDM_FUNCTIONS.map((f) => (
              <div
                key={f.name}
                className="flex justify-between border-b border-border/50 py-0.5"
              >
                <span>{f.name}</span>
                <span className="text-muted-foreground">/{f.arity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <Heading>Source &amp; hosting</Heading>
          <Table
            rows={[
              [
                "This app",
                <a key="r" href={REPO_URL} className="underline decoration-dotted">
                  {REPO_URL}
                </a>,
              ],
              [
                "IDM toolchain",
                <a key="f" href={FORMULASTUDIO_REPO} className="underline decoration-dotted">
                  {FORMULASTUDIO_REPO}
                </a>,
              ],
              ["Hosting", "Vercel Fluid Compute, Node.js runtime, AI Gateway"],
              [
                "Auth",
                "Vercel OIDC in production; AI_GATEWAY_API_KEY for local dev (`vercel env pull`)",
              ],
            ]}
          />
        </section>

        <section className="space-y-3">
          <Heading>Environment variables</Heading>
          <Table
            rows={[
              ["AI_GATEWAY_API_KEY", "Required for local dev. Not needed on Vercel (OIDC)."],
              ["IDM_MODEL", "Optional. AI Gateway model string. Default: anthropic/claude-sonnet-4.6."],
              ["IDM_API_BASE", "Optional. IDM API root. Default: https://formulastudio.net."],
            ]}
          />
        </section>

        <section className="space-y-3">
          <Heading>Notes for builders — working with LLMs and a small DSL</Heading>
          <p>
            We use <code className="font-mono">claude-sonnet-4.6</code> via the Vercel AI
            Gateway. The model has the full IDM spec in its system prompt and a set of
            deterministic tools (validate, format, test) to call. Even so, when generating
            formulas it sometimes produces output that doesn&rsquo;t conform to IDM&rsquo;s
            rules. This section documents the patterns we observed and the layered approach
            we use to handle them.
          </p>

          <h3 className="text-[13px] font-semibold tracking-tight text-foreground pt-3 pb-1 border-b border-border flex items-center gap-2">
            <span className="text-[var(--lime)] text-[11px]">▸</span>
            Common failure patterns
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <strong className="text-foreground">Parentheses for grouping.</strong> IDM has no
              parens; argument position alone provides grouping. The model occasionally adds
              them anyway.
            </li>
            <li>
              <strong className="text-foreground">Commas between arguments.</strong> Arguments
              are whitespace-separated in IDM.
            </li>
            <li>
              <strong className="text-foreground">Infix operators</strong>{" "}
              (<code className="font-mono">a {">"} b</code>) or function-call syntax{" "}
              (<code className="font-mono">greater(a, b)</code>) instead of prefix notation.
            </li>
            <li>
              <strong className="text-foreground">Empty fallback in <code>if</code>.</strong>{" "}
              The third argument is sometimes omitted or set to{" "}
              <code className="font-mono">&quot;&quot;</code>. <code>if</code> is fixed-arity
              3; an explicit fallback like <code className="font-mono">&quot;uncategorized&quot;</code>{" "}
              is preferred.
            </li>
            <li>
              <strong className="text-foreground">Wrong arity on uncommon functions</strong>{" "}
              (e.g. <code className="font-mono">substr</code> with two arguments instead of three).
            </li>
            <li>
              <strong className="text-foreground">Alias drift.</strong> Use of{" "}
              <code className="font-mono">len</code>/<code className="font-mono">equal</code>{" "}
              instead of canonical <code className="font-mono">length</code>/<code className="font-mono">equals</code>.
            </li>
          </ul>

          <h3 className="text-[13px] font-semibold tracking-tight text-foreground pt-3 pb-1 border-b border-border flex items-center gap-2">
            <span className="text-[var(--lime)] text-[11px]">▸</span>
            Layered mitigations
          </h3>
          <p>
            We rely on four layers, each catching what the previous one missed.
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">A front-loaded system prompt.</strong> The
              IDM rules and a wrong-vs-right pair appear at the top of the prompt — see{" "}
              <code className="font-mono">lib/idm/spec.ts</code>. Rules listed earlier in the
              prompt are followed more reliably than rules buried below a long catalog.
            </li>
            <li>
              <strong className="text-foreground">Tool calls for verification.</strong> The
              chat agent is instructed to call <code className="font-mono">validate_formula</code>{" "}
              after every draft. The deterministic validator catches what the prompt did not.
            </li>
            <li>
              <strong className="text-foreground">A client-side parse before auto-apply.</strong>{" "}
              When the assistant emits a fenced <code className="font-mono">handlebars</code>{" "}
              block, the chat panel parses it locally before syncing it into the editor. If
              parsing fails or the formula contains parens/commas, the sync is held back and
              an &ldquo;apply anyway&rdquo; escape hatch is shown. See{" "}
              <code className="font-mono">components/chat-panel.tsx</code>.
            </li>
            <li>
              <strong className="text-foreground">Reversible state.</strong> Before any
              automated action mutates the user&rsquo;s formula (chat suggestion, format
              button, example load), the prior version is pushed onto the history stack so it
              can be restored from the history popover.
            </li>
          </ol>

          <h3 className="text-[13px] font-semibold tracking-tight text-foreground pt-3 pb-1 border-b border-border flex items-center gap-2">
            <span className="text-[var(--lime)] text-[11px]">▸</span>
            Approaches we considered but didn&rsquo;t use
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <strong className="text-foreground">Fine-tuning.</strong> Useful when prompt
              engineering plateaus, but the signal here is short and well-specified — a
              sharper prompt and a parser-based guard cover the same ground without the
              ongoing data and training overhead.
            </li>
            <li>
              <strong className="text-foreground">Post-hoc text cleanup</strong> (e.g. stripping
              parens with regex). The shape of an invalid formula isn&rsquo;t reliably
              recoverable; the safer path is to reject and re-prompt.
            </li>
            <li>
              <strong className="text-foreground">Treating model self-reports as truth.</strong>{" "}
              We don&rsquo;t rely on the assistant&rsquo;s claim that a formula is valid; we
              parse it ourselves before applying.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <Heading>API ideas for formulastudio.net</Heading>
          <p>
            While building this app, I kept reaching for endpoints that don&rsquo;t exist on{" "}
            <a href="https://formulastudio.net" className="underline decoration-dotted">
              formulastudio.net
            </a>{" "}
            yet. Suggestions for the API roadmap, ranked by leverage for downstream builders:
          </p>

          <Table
            rows={[
              [
                <code key="trace" className="font-mono text-foreground">
                  POST /api/idm-trace
                </code>,
                <span key="trace-d">
                  Formula + record → AST + per-node values + branch-taken on every <code>if</code>.
                  This is the killer one. Right now I had to write a client-side parser (
                  <code className="font-mono">lib/idm/parser.ts</code>) and evaluator (
                  <code className="font-mono">lib/idm/eval.ts</code>) just to render the trace
                  tab. Every UI builder will redo this work. Returns{" "}
                  <code className="font-mono">{"{ ast, trace: { [nodeId]: { value, error?, branchTaken? } } }"}</code>.
                </span>,
              ],
              [
                <code key="cov" className="font-mono text-foreground">
                  POST /api/idm-coverage
                </code>,
                <span key="cov-d">
                  Formula + records[] → per-<code>if</code> branch coverage report. Surfaces
                  unreachable branches and hot paths. Built trivially on top of trace.
                </span>,
              ],
              [
                <code key="dec" className="font-mono text-foreground">
                  POST /api/idm-decompile
                </code>,
                <span key="dec-d">
                  Inverse of <code className="font-mono">/api/idm-group-rules</code>. Given an
                  IDM formula, return the structured{" "}
                  <code className="font-mono">{"{ rules: [...], defaultOutput }"}</code> JSON.
                  Lets builders migrate hand-written formulas back to a rule-editor UI.
                </span>,
              ],
              [
                <code key="tc" className="font-mono text-foreground">
                  POST /api/idm-typecheck
                </code>,
                <span key="tc-d">
                  Formula + JSON schema (or a sample record) → list of field references that
                  don&rsquo;t exist on the schema. Catches{" "}
                  <code className="font-mono">student.sis_di</code> typos at edit time. The
                  validator already has the parser; just walk field nodes and check against
                  the schema.
                </span>,
              ],
              [
                <code key="simp" className="font-mono text-foreground">
                  POST /api/idm-simplify
                </code>,
                <span key="simp-d">
                  Refactor an IDM formula. Collapses redundant <code>if</code> branches that
                  share an output, dedupes <code>or</code> chains, flattens nested{" "}
                  <code>and</code>. Could ship as a deterministic optimizer, or LLM-backed with
                  the rules baked in plus a re-validate step.
                </span>,
              ],
              [
                <code key="exp" className="font-mono text-foreground">
                  POST /api/idm-explain
                </code>,
                <span key="exp-d">
                  Formula → structured plain-English walkthrough as JSON: an array of{" "}
                  <code className="font-mono">{"{ when, output, fields, tone }"}</code> entries
                  per branch. Lets every UI render explanation differently (popover, tooltip,
                  doc-export) without each one calling an LLM separately.
                </span>,
              ],
              [
                <code key="diff" className="font-mono text-foreground">
                  POST /api/idm-diff
                </code>,
                <span key="diff-d">
                  Semantic diff between two formulas (not just text diff). &ldquo;Branch 3
                  output changed from <code>&quot;A&quot;</code> to{" "}
                  <code>&quot;B&quot;</code>; new branch added before fallback.&rdquo; Lets
                  reviewers approve formula changes the way they approve code.
                </span>,
              ],
              [
                <code key="batch" className="font-mono text-foreground">
                  POST /api/idm-batch-test
                </code>,
                <span key="batch-d">
                  Optimized variant of <code className="font-mono">/api/idm-test</code> for
                  large datasets. Stream results via SSE; cap memory; return aggregate stats.
                </span>,
              ],
              [
                <code key="fields" className="font-mono text-foreground">
                  GET /api/idm-fields/:domain
                </code>,
                <span key="fields-d">
                  Curated dictionaries of common field paths per domain (k12, healthcare,
                  hr, finance). Each entry: path, type, example value, doc string. Drives
                  autocomplete in any editor.
                </span>,
              ],
              [
                <code key="comp" className="font-mono text-foreground">
                  POST /api/idm-complete
                </code>,
                <span key="comp-d">
                  Cursor-position autocomplete: given the current formula and caret offset,
                  return ranked completions (function names with arity hints, field paths
                  scoped by what&rsquo;s already typed). Server-side; works in any editor
                  including LSP-driven IDEs.
                </span>,
              ],
              [
                <code key="snap" className="font-mono text-foreground">
                  POST /api/idm-snapshots
                </code>,
                <span key="snap-d">
                  Server-stored named snapshots of{" "}
                  <code className="font-mono">{"{ formula, sampleData, label }"}</code>. Returns
                  a short id (<code className="font-mono">/s/abc123</code>). For when the
                  hash-fragment share URL gets too long for Slack/email previews.
                </span>,
              ],
              [
                <code key="health" className="font-mono text-foreground">
                  GET /api/health
                </code>,
                <span key="health-d">
                  Plain status endpoint. Lets downstream apps surface a banner when the
                  toolchain is degraded instead of silently falling back without telling
                  users.
                </span>,
              ],
            ]}
          />

          <p className="text-muted-foreground">
            <strong>Stretch ideas:</strong> a TypeScript SDK (
            <code className="font-mono">@formulastudio/idm</code>) wrapping the JSON APIs with
            typed responses; a VS Code extension using{" "}
            <code className="font-mono">/api/idm-validate</code> +{" "}
            <code className="font-mono">/api/idm-complete</code> over LSP; an MCP server so any
            agent can compile/validate formulas directly.
          </p>
        </section>

        <section className="space-y-3">
          <Heading>Credits</Heading>
          <p>
            IDM language, parser/validator/formatter/test-runner, and sample data:{" "}
            <a href="https://github.com/legertom" className="underline decoration-dotted">
              @legertom
            </a>{" "}
            via <code className="font-mono">formulastudio</code>. This helper is a thin AI shell
            on top of that toolchain plus a local evaluator for the trace tab.
          </p>
        </section>
      </article>
    </main>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[14px] font-semibold tracking-tight text-foreground border-b border-border pb-1.5 flex items-center gap-2">
      <span className="text-[var(--lime)] text-[11px]">▸</span>
      {children}
    </h2>
  );
}

function Feature({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-3">
      <span className="font-mono text-[11px] text-[var(--lime)] tracking-wider pt-0.5">
        {n}
      </span>
      <div>
        <div className="font-semibold text-foreground mb-1">{title}</div>
        <div className="text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

function Table({ rows }: { rows: Array<[React.ReactNode, React.ReactNode]> }) {
  return (
    <div className="border border-border">
      <dl className="divide-y divide-border">
        {rows.map(([k, v], i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 px-3 py-2 text-[12px]"
          >
            <dt className="font-mono text-foreground">{k}</dt>
            <dd className="text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
