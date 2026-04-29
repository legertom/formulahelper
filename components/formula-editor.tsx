"use client";

import { useId, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IDM_FN_BY_NAME } from "@/lib/idm/spec";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAskExplain: () => void;
};

const TOKEN_RE =
  /(\{\{|\}\}|"(?:[^"\\]|\\.)*"?|-?\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_.]*|\s+|[^\s])/g;

type Token = { text: string; kind: "brace" | "fn" | "string" | "number" | "field" | "ws" | "punct" };

function classify(text: string): Token["kind"] {
  if (text === "{{" || text === "}}") return "brace";
  if (text.startsWith('"')) return "string";
  if (/^-?\d/.test(text) && /^-?\d+(\.\d+)?$/.test(text)) return "number";
  if (/^\s+$/.test(text)) return "ws";
  if (/^[A-Za-z_][A-Za-z0-9_.]*$/.test(text)) {
    if (!text.includes(".") && IDM_FN_BY_NAME[text]) return "fn";
    return "field";
  }
  return "punct";
}

const COLOR: Record<Token["kind"], string> = {
  brace: "text-violet-600 dark:text-violet-400 font-semibold",
  fn: "text-sky-700 dark:text-sky-300 font-medium",
  string: "text-emerald-700 dark:text-emerald-300",
  number: "text-amber-700 dark:text-amber-400",
  field: "text-zinc-800 dark:text-zinc-200",
  ws: "",
  punct: "text-zinc-500",
};

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(src)) !== null) {
    tokens.push({ text: m[0], kind: classify(m[0]) });
  }
  return tokens;
}

export function FormulaEditor({ value, onChange, onAskExplain }: Props) {
  const id = useId();
  const tokens = tokenize(value);
  const hasContent = value.trim().length > 0;

  const sharedStyle: CSSProperties = {
    fontFamily:
      'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace',
    fontSize: 13,
    lineHeight: "1.65",
    letterSpacing: 0,
    tabSize: 2,
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden p-0 gap-0">
      <CardHeader className="flex-row items-center justify-between gap-2 px-4 py-2.5 border-b bg-muted/40 [.border-b]:pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Formula
          </span>
          <span className="text-[11px] font-mono text-muted-foreground/70">.idm</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={onAskExplain}
            disabled={!hasContent}
            className="h-7 px-2.5 text-xs"
          >
            Explain in plain English
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onChange("")}
            disabled={!hasContent}
            className="h-7 px-2 text-xs text-muted-foreground"
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 relative p-0">
        <div className="absolute inset-0 overflow-auto">
          <div className="relative min-h-full">
            <pre
              aria-hidden
              className="px-4 py-3 m-0 whitespace-pre-wrap break-words pointer-events-none select-none"
              style={sharedStyle}
            >
              {tokens.map((t, i) => (
                <span key={i} className={COLOR[t.kind]}>
                  {t.text}
                </span>
              ))}
              {value.endsWith("\n") ? "\n" : ""}
              <span className="opacity-0">.</span>
            </pre>
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              placeholder='{{if equals school_name "A" "Group A" "uncategorized"}}'
              className="absolute inset-0 px-4 py-3 w-full h-full bg-transparent text-transparent caret-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none whitespace-pre-wrap break-words"
              style={sharedStyle}
            />
          </div>
        </div>
      </CardContent>
      <div className="px-4 py-1.5 border-t bg-muted/40 text-[10.5px] text-muted-foreground flex items-center gap-3">
        <span>
          Prefix notation. Wrap in <code className="font-mono">{"{{ ... }}"}</code>.
        </span>
        <span className="opacity-50">·</span>
        <span className="font-mono">
          <span className="text-sky-700 dark:text-sky-300">fn</span>{" "}
          <span className="text-emerald-700 dark:text-emerald-300">&quot;str&quot;</span>{" "}
          <span className="text-zinc-700 dark:text-zinc-300">field.path</span>
        </span>
      </div>
    </Card>
  );
}
