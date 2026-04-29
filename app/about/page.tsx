import Link from "next/link";
import { IDM_FUNCTIONS } from "@/lib/idm/spec";

export const metadata = {
  title: "About — Formula Helper",
  description: "How Formula Helper works under the hood.",
};

const REPO_URL = "https://github.com/legertom/formulahelper";
const FORMULASTUDIO_REPO = "https://github.com/legertom/formulastudio";

export default function AboutPage() {
  return (
    <main className="flex-1 min-h-0 overflow-auto bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            ƒ
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Formula Helper · About
            </h1>
            <p className="text-xs text-zinc-500">Architecture, stack, and credits.</p>
          </div>
        </div>
        <Link
          href="/"
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90"
        >
          Back to app
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10 space-y-10 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            What this is
          </h2>
          <p>
            Formula Helper is an AI-assisted tool for building and explaining{" "}
            <strong>IDM (Identity Management) formulas</strong> &mdash; a small prefix-notation
            template language wrapped in <code className="font-mono">{"{{ ... }}"}</code> used to
            map identity attributes into output values (e.g. assign students to groups based on
            school, sis_id, or graduation year).
          </p>
          <p>
            You can describe a rule in plain English (&ldquo;Senior if grad year is 2026, else
            Junior&rdquo;) and the assistant drafts, validates, and tests the formula. You can also
            paste an existing formula and ask for a plain-English explanation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Stack</h2>
          <Table
            rows={[
              ["Framework", "Next.js 16 (App Router) on the Node.js runtime, Turbopack bundler"],
              ["Language", "TypeScript 5"],
              ["Styling", "Tailwind CSS v4"],
              ["AI SDK", "Vercel AI SDK v6 (`ai`, `@ai-sdk/react`)"],
              ["AI provider", "Vercel AI Gateway — default model `anthropic/claude-sonnet-4.6`"],
              ["Validation", "Zod (tool input schemas)"],
              ["Hosting", "Vercel Fluid Compute — `/api/chat` streams via `streamText`"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            How the AI loop works
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              The browser uses <code className="font-mono">useChat</code> from{" "}
              <code className="font-mono">@ai-sdk/react</code> with a{" "}
              <code className="font-mono">DefaultChatTransport</code> pointing at{" "}
              <code className="font-mono">/api/chat</code>.
            </li>
            <li>
              On every send, we attach the current editor contents under{" "}
              <code className="font-mono">data.formula</code> so the model has live context.
            </li>
            <li>
              The route handler calls <code className="font-mono">streamText</code> with the IDM
              system prompt, the user&rsquo;s messages, and a tool catalog. The default model is
              the Vercel AI Gateway alias <code className="font-mono">anthropic/claude-sonnet-4.6</code>{" "}
              (override with <code className="font-mono">IDM_MODEL</code>).
            </li>
            <li>
              The model can call any of the tools below. After each tool call, the agent loop
              feeds the result back and the model decides what to do next, up to{" "}
              <code className="font-mono">stepCountIs(15)</code>.
            </li>
            <li>
              The response streams back as a UI message stream (tool parts + text). When the
              model emits a fenced <code className="font-mono">handlebars</code> block containing{" "}
              <code className="font-mono">{"{{...}}"}</code>, the client auto-syncs it into the
              editor.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Tools</h2>
          <p>
            Each tool wraps a public endpoint at{" "}
            <a
              href="https://formulastudio.net/api/instructions"
              className="underline decoration-dotted"
            >
              formulastudio.net
            </a>
            . All have an <code className="font-mono">8&ndash;10s</code> timeout; if the live
            endpoint is unreachable, <code className="font-mono">validate_formula</code> falls
            back to a local spec-driven validator.
          </p>
          <Table
            rows={[
              ["validate_formula", "POST /api/idm-validate"],
              ["lint_formula", "POST /api/idm-validate (mode: lint)"],
              ["format_formula", "POST /api/idm-format"],
              ["test_formula", "POST /api/idm-test"],
              ["compile_group_rules", "POST /api/idm-group-rules"],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Supported IDM functions
          </h2>
          <p>
            The system prompt lists every function so the model never has to guess arity. Source
            of truth is{" "}
            <code className="font-mono">https://formulastudio.net/api/idm-spec</code>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono">
            {IDM_FUNCTIONS.map((f) => (
              <div key={f.name} className="flex justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 py-1">
                <span>{f.name}</span>
                <span className="text-zinc-500">arity {f.arity}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Source &amp; hosting
          </h2>
          <Table
            rows={[
              [
                "This app",
                <a key="repo" href={REPO_URL} className="underline decoration-dotted">
                  {REPO_URL}
                </a>,
              ],
              [
                "IDM toolchain (validator, parser, API)",
                <a key="fs" href={FORMULASTUDIO_REPO} className="underline decoration-dotted">
                  {FORMULASTUDIO_REPO}
                </a>,
              ],
              [
                "API surface",
                <a
                  key="api"
                  href="https://formulastudio.net/api/instructions"
                  className="underline decoration-dotted"
                >
                  formulastudio.net/api/instructions
                </a>,
              ],
              ["Hosting", "Vercel (Fluid Compute, Node.js runtime, AI Gateway)"],
              [
                "Model auth",
                "Vercel OIDC in production; AI_GATEWAY_API_KEY for local dev (`vercel env pull`)",
              ],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Environment variables
          </h2>
          <Table
            rows={[
              [
                "AI_GATEWAY_API_KEY",
                "Required for local dev. Created at vercel.com → AI Gateway → API Keys.",
              ],
              [
                "IDM_MODEL",
                "Optional. Override the default model (e.g. `openai/gpt-5`, `google/gemini-2.5-pro`).",
              ],
              [
                "IDM_API_BASE",
                "Optional. Override the IDM API root (default `https://formulastudio.net`).",
              ],
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Credits</h2>
          <p>
            IDM language and toolchain by{" "}
            <a href="https://github.com/legertom" className="underline decoration-dotted">
              @legertom
            </a>
            . This helper is a thin shell that turns natural language into IDM by leaning on the
            existing validator/formatter/test-runner.
          </p>
        </section>
      </article>
    </main>
  );
}

function Table({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <dl className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
        {rows.map(([k, v], i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-4 px-4 py-2.5 text-xs"
          >
            <dt className="font-semibold text-zinc-700 dark:text-zinc-300">{k}</dt>
            <dd className="text-zinc-700 dark:text-zinc-300">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
