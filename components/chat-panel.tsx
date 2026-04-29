"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ChatPanelHandle = {
  send: (text: string) => void;
};

type Props = {
  ref?: Ref<ChatPanelHandle>;
  formula: string;
  onFormulaSuggested: (formula: string) => void;
};

const FENCE = /```(?:handlebars|hbs|idm)?\n([\s\S]*?)```/g;
const BRACE = /\{\{[\s\S]+?\}\}/;

function extractFormulaFromText(text: string): string | null {
  let last: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = FENCE.exec(text)) !== null) {
    const inner = m[1].trim();
    if (BRACE.test(inner)) last = inner;
  }
  return last;
}

export function ChatPanel({ ref, formula, onFormulaSuggested }: Props) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const formulaRef = useRef(formula);
  formulaRef.current = formula;
  const lastSuggested = useRef<string | null>(null);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: { messages, data: { formula: formulaRef.current }, ...body },
      }),
    }),
  });

  useImperativeHandle(ref, () => ({
    send: (text: string) => {
      if (text.trim()) sendMessage({ text });
    },
  }));

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const text = last.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { text: string }).text)
      .join("\n");
    const found = extractFormulaFromText(text);
    if (found && found !== lastSuggested.current) {
      lastSuggested.current = found;
      onFormulaSuggested(found);
    }
  }, [messages, onFormulaSuggested]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          AI assistant
        </span>
        <span className="text-xs text-zinc-400">
          {status === "streaming" ? "thinking…" : status === "submitted" ? "sending…" : "ready"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-zinc-500 space-y-2">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Try one of these:</p>
            <ul className="space-y-1.5 text-xs">
              <li className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-zinc-50 dark:bg-zinc-900">
                &ldquo;Build a formula that returns &lsquo;Senior&rsquo; if grad year is 2026,
                &lsquo;Junior&rsquo; if 2027, otherwise &lsquo;Other&rsquo;.&rdquo;
              </li>
              <li className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-zinc-50 dark:bg-zinc-900">
                &ldquo;Group A is school_name=A AND sis_id starts with 2; Group B is school_name=B.
                Compile to IDM.&rdquo;
              </li>
              <li className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-zinc-50 dark:bg-zinc-900">
                Paste a formula in the editor, click <em>Explain in plain English</em>.
              </li>
            </ul>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-1.5">
            <div
              className={`text-xs font-semibold uppercase tracking-wider ${
                m.role === "user" ? "text-blue-600" : "text-emerald-600"
              }`}
            >
              {m.role === "user" ? "You" : "Assistant"}
            </div>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <div
                    key={i}
                    className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed"
                  >
                    <Markdown>{part.text}</Markdown>
                  </div>
                );
              }
              if (isToolUIPart(part)) {
                return (
                  <ToolPartView key={part.toolCallId || i} part={part as ToolUIPart} />
                );
              }
              return null;
            })}
          </div>
        ))}

        {error && (
          <div className="text-xs rounded-md p-2 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            {error.message}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !busy) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="border-t border-zinc-200 dark:border-zinc-800 p-3 flex gap-2 bg-zinc-50 dark:bg-zinc-900"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a rule, paste a formula, or ask a question…"
          className="flex-1 text-sm px-3 py-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
          disabled={busy}
        />
        {busy ? (
          <button
            type="button"
            onClick={stop}
            className="text-sm px-4 py-2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:opacity-90"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="text-sm px-4 py-2 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-40 hover:opacity-90"
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
}

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => <h1 className="text-base font-semibold mt-3 mb-1.5" {...props} />,
        h2: (props) => <h2 className="text-sm font-semibold mt-3 mb-1.5" {...props} />,
        h3: (props) => <h3 className="text-sm font-semibold mt-2.5 mb-1" {...props} />,
        h4: (props) => <h4 className="text-xs font-semibold uppercase tracking-wider mt-2 mb-1 text-zinc-600 dark:text-zinc-400" {...props} />,
        p: (props) => <p className="my-1.5" {...props} />,
        ul: (props) => <ul className="list-disc pl-5 my-1.5 space-y-1" {...props} />,
        ol: (props) => <ol className="list-decimal pl-5 my-1.5 space-y-1" {...props} />,
        li: (props) => <li className="leading-snug" {...props} />,
        strong: (props) => <strong className="font-semibold text-zinc-900 dark:text-zinc-50" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        a: (props) => (
          <a className="underline decoration-dotted text-blue-600 dark:text-blue-400" target="_blank" rel="noreferrer" {...props} />
        ),
        blockquote: (props) => (
          <blockquote
            className="my-2 pl-3 border-l-2 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 italic"
            {...props}
          />
        ),
        hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-800" />,
        code: (props) => {
          const { className, children, ...rest } = props as {
            className?: string;
            children?: React.ReactNode;
          };
          const isBlock = className && className.startsWith("language-");
          if (isBlock) {
            return (
              <code className={`${className ?? ""} font-mono`} {...rest}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="font-mono text-[0.85em] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              {...rest}
            >
              {children}
            </code>
          );
        },
        pre: (props) => (
          <pre
            className="my-2 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-xs overflow-x-auto whitespace-pre"
            {...props}
          />
        ),
        table: (props) => (
          <div className="my-2 overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-xs" {...props} />
          </div>
        ),
        thead: (props) => <thead className="bg-zinc-50 dark:bg-zinc-900" {...props} />,
        th: (props) => (
          <th
            className="text-left font-semibold px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800"
            {...props}
          />
        ),
        td: (props) => (
          <td
            className="px-3 py-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 align-top"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

type ToolUIPart = {
  type: `tool-${string}`;
  toolCallId: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function ToolPartView({ part }: { part: ToolUIPart }) {
  const toolName = part.type.replace(/^tool-/, "");
  const label =
    {
      validate_formula: "Validating",
      lint_formula: "Linting",
      format_formula: "Formatting",
      test_formula: "Running tests",
      compile_group_rules: "Compiling group rules",
    }[toolName] || toolName;

  const stateLabel = {
    "input-streaming": "preparing…",
    "input-available": "running…",
    "output-available": "done",
    "output-error": "error",
  }[part.state];

  return (
    <details className="text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 group">
      <summary className="cursor-pointer px-2.5 py-1.5 select-none flex items-center justify-between">
        <span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{label}</span>
          <span className="ml-2 text-zinc-500">{stateLabel}</span>
        </span>
        <span className="text-zinc-400 group-open:rotate-90 transition">›</span>
      </summary>
      <div className="px-2.5 pb-2 space-y-1.5">
        {part.state === "input-available" || part.state === "output-available" ? (
          <pre className="font-mono text-[11px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        ) : null}
        {part.state === "output-available" ? (
          <pre className="font-mono text-[11px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(part.output, null, 2)}
          </pre>
        ) : null}
        {part.state === "output-error" ? (
          <div className="text-red-600 dark:text-red-400">{part.errorText}</div>
        ) : null}
      </div>
    </details>
  );
}
