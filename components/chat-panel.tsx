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
