"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  type DynamicToolUIPart,
  type ToolUIPart,
} from "ai";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";

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

const TOOL_LABEL: Record<string, string> = {
  "tool-validate_formula": "Validate formula",
  "tool-lint_formula": "Lint formula",
  "tool-format_formula": "Format formula",
  "tool-test_formula": "Run tests",
  "tool-compile_group_rules": "Compile group rules",
};

export type ChatPanelHandle = {
  send: (text: string) => void;
};

type Props = {
  ref?: Ref<ChatPanelHandle>;
  formula: string;
  onFormulaSuggested: (formula: string) => void;
};

export function ChatPanel({ ref, formula, onFormulaSuggested }: Props) {
  const [input, setInput] = useState("");
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

  const statusDot =
    status === "streaming"
      ? "bg-amber-500 animate-pulse"
      : status === "submitted"
        ? "bg-blue-500 animate-pulse"
        : status === "error"
          ? "bg-red-500"
          : "bg-emerald-500";

  return (
    <div className="flex flex-col h-full rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            AI assistant
          </span>
          <span className="text-[10px] text-muted-foreground/70">claude-sonnet-4.6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} aria-hidden />
          <span className="text-[11px] text-muted-foreground capitalize">
            {status === "streaming" ? "thinking" : status === "submitted" ? "sending" : status}
          </span>
        </div>
      </div>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              title="Ask anything about IDM formulas"
              description={
                "Try: “Senior if grad year is 2026, Junior if 2027, otherwise Other.” Or paste a formula in the editor and click Explain."
              }
            />
          )}

          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <MessageResponse key={i}>{part.text}</MessageResponse>;
                  }
                  if (isToolUIPart(part)) {
                    return <ToolPartView key={part.toolCallId || i} part={part} />;
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}

          {error && (
            <div className="text-xs rounded-md p-2 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !busy) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
        className="border-t p-3 bg-muted/30"
      >
        <div className="flex gap-2 rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-foreground/30 transition-shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !busy) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }
            }}
            placeholder="Describe a rule, paste a formula, ask why…"
            rows={1}
            className="flex-1 min-h-[36px] max-h-32 text-sm px-3 py-2 bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/60"
            disabled={busy}
          />
          <div className="p-1 flex items-end">
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="h-8 px-3 text-xs rounded-md bg-muted text-foreground hover:bg-muted/80 transition"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-8 px-3 text-xs rounded-md bg-foreground text-background disabled:opacity-40 hover:opacity-90 transition font-medium"
              >
                Send ↵
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function ToolPartView({ part }: { part: ToolUIPart | DynamicToolUIPart }) {
  const isDynamic = part.type === "dynamic-tool";
  const friendly = isDynamic
    ? part.toolName
    : TOOL_LABEL[part.type] ?? part.type.replace(/^tool-/, "");
  const hasInput = part.state === "input-available" || part.state === "output-available";
  const hasOutput = part.state === "output-available";
  const hasError = part.state === "output-error";

  return (
    <Tool defaultOpen={hasError}>
      {isDynamic ? (
        <ToolHeader type="dynamic-tool" state={part.state} toolName={part.toolName} title={friendly} />
      ) : (
        <ToolHeader type={part.type} state={part.state} title={friendly} />
      )}
      <ToolContent>
        {hasInput && <ToolInput input={part.input} />}
        {(hasOutput || hasError) && (
          <ToolOutput
            output={
              hasOutput ? (
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(part.output, null, 2)}
                </pre>
              ) : undefined
            }
            errorText={hasError ? part.errorText : undefined}
          />
        )}
      </ToolContent>
    </Tool>
  );
}
