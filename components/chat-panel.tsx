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
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
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
  "tool-validate_formula": "validate",
  "tool-lint_formula": "lint",
  "tool-format_formula": "format",
  "tool-test_formula": "test",
  "tool-compile_group_rules": "compile rules",
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
  const dotColor =
    status === "streaming"
      ? "bg-[var(--amber)] animate-pulse"
      : status === "submitted"
        ? "bg-[var(--lime)] animate-pulse"
        : status === "error"
          ? "bg-[var(--destructive)]"
          : "bg-[var(--lime)]";

  return (
    <div className="flex flex-col h-full border border-border bg-card overflow-hidden">
      <div className="flex items-center h-8 border-b border-border bg-muted/30 px-3 text-[11px] gap-2">
        <span className="text-[var(--lime)]">▸</span>
        <span className="text-muted-foreground">assistant</span>
        <span className="text-border">│</span>
        <span className="text-muted-foreground/60">claude-sonnet-4.6</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />
          <span className="text-muted-foreground capitalize">
            {status === "streaming" ? "thinking" : status === "submitted" ? "sending" : status}
          </span>
        </span>
      </div>

      <Conversation className="flex-1 [&_*]:font-sans-prose">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              title="Ask anything about IDM formulas"
              description="“Senior if grad year is 2026, Junior if 2027, otherwise Other.” Or paste a formula in the editor and click explain."
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
            <div className="text-[11px] font-mono p-2 border border-[var(--destructive)] text-[var(--destructive)] bg-[var(--destructive)]/10">
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
        className="border-t border-border bg-muted/20 p-2"
      >
        <div className="flex items-end gap-1.5 border border-border focus-within:border-[var(--lime)] bg-background transition">
          <span className="px-2.5 py-2.5 text-[var(--lime)] text-[12px] select-none">$</span>
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
            placeholder="describe a rule, paste a formula, ask why…"
            rows={1}
            className="flex-1 min-h-[36px] max-h-32 text-[12.5px] py-2 pl-0 pr-2 bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 font-mono"
            disabled={busy}
          />
          <div className="p-1 flex items-end">
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="h-7 px-2.5 text-[11px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
              >
                stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-7 px-2.5 text-[11px] bg-[var(--lime)] text-background hover:opacity-90 disabled:opacity-30 transition font-medium rounded-sm"
              >
                send ↵
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
    <Tool defaultOpen={hasError} className="font-mono">
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
                <pre className="whitespace-pre-wrap break-words text-[11px] text-foreground">
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
