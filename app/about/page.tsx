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
          <Table
            rows={[
              ["POST /api/chat", "streamText agent loop with five IDM tools, max 15 steps"],
              ["POST /api/idm-test", "proxy → formulastudio.net /api/idm-test (live result strip)"],
              ["POST /api/idm-format", "proxy → formulastudio.net /api/idm-format (format button)"],
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

function Table({ rows }: { rows: Array<[string, React.ReactNode]> }) {
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
