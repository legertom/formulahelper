# Formula Helper

AI-assisted builder and explainer for [IDM (Identity Management) formulas](https://formulastudio.net/api/instructions).

Describe a rule in plain English and the assistant drafts, validates, and tests the formula. Paste an existing formula and ask for a plain-English explanation. The model invokes the deterministic IDM toolchain (validate / lint / format / test / compile-group-rules) at [formulastudio.net](https://formulastudio.net) as tool calls — it never just guesses.

## Stack

- **Next.js 16** App Router (Turbopack) on Node.js runtime
- **TypeScript 5**, **Tailwind CSS v4**
- **AI SDK v6** (`ai`, `@ai-sdk/react`) — `streamText`, `useChat`, `DefaultChatTransport`
- **Vercel AI Gateway** — default model `anthropic/claude-sonnet-4.6`
- **Zod** for tool input schemas
- Hosted on **Vercel** (Fluid Compute)

## Local development

```sh
cp .env.local.example .env.local
# add your AI_GATEWAY_API_KEY (or run `vercel link && vercel env pull` to inherit project env)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

```sh
npm i -g vercel       # if you don't have it
vercel link           # link to a project (or create one)
vercel deploy         # preview
vercel deploy --prod  # production
```

In production, OIDC handles AI Gateway auth automatically — no key needed.

## Environment variables

| Var | Purpose |
| --- | --- |
| `AI_GATEWAY_API_KEY` | Required for local dev. Not needed in Vercel deployments (OIDC). |
| `IDM_MODEL` | Optional. AI Gateway model string. Default: `anthropic/claude-sonnet-4.6`. |
| `IDM_API_BASE` | Optional. IDM API root. Default: `https://formulastudio.net`. |

## Project layout

```
app/
  api/chat/route.ts       streamText + tools, stopWhen stepCountIs(15)
  api/idm-test/route.ts   server proxy for the test-cases panel
  about/page.tsx          architecture + credits
  page.tsx                split UI: editor + tests + chat
components/
  chat-panel.tsx          useChat + tool part rendering
  formula-editor.tsx      textarea + "Explain in plain English"
  test-cases.tsx          per-row data + expected, runs against /api/idm-test
lib/idm/
  client.ts               fetch wrappers w/ live → local-validator fallback
  local-validator.ts      spec-driven backup validator
  spec.ts                 IDM function catalog + system prompt
  tools.ts                AI SDK tool() definitions
```

## Credits

IDM language + validator/formatter/test-runner: [legertom/formulastudio](https://github.com/legertom/formulastudio).
