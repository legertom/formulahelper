"use client";

import { useId, type CSSProperties } from "react";
import { IDM_FN_BY_NAME } from "@/lib/idm/spec";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAskExplain: () => void;
};

const TOKEN_RE =
  /(\{\{|\}\}|"(?:[^"\\]|\\.)*"?|-?\d+(?:\.\d+)?|[A-Za-z_][A-Za-z0-9_.]*|\s+|[^\s])/g;

type Token = {
  text: string;
  kind: "brace" | "fn" | "string" | "number" | "field" | "ws" | "punct";
};

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
  brace: "text-[var(--lime)]",
  fn: "text-[var(--lime)]",
  string: "text-foreground",
  number: "text-[var(--amber)]",
  field: "text-muted-foreground",
  ws: "",
  punct: "text-muted-foreground/70",
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
  const lineCount = Math.max(1, value.split("\n").length);
  const charCount = value.length;

  const sharedStyle: CSSProperties = {
    fontFamily:
      'var(--font-geist-mono), ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
    fontSize: 13,
    lineHeight: "1.7",
    letterSpacing: 0,
    tabSize: 2,
  };

  return (
    <div className="flex flex-col h-full border border-border bg-card overflow-hidden">
      <div className="flex items-center h-8 border-b border-border bg-muted/30 px-3 text-[11px]">
        <span className="text-[var(--lime)] mr-2">▸</span>
        <span className="text-muted-foreground">formula.idm</span>
        <span className="mx-3 text-border">│</span>
        <span className="text-muted-foreground/70">{lineCount}L</span>
        <span className="mx-1.5 text-border">·</span>
        <span className="text-muted-foreground/70">{charCount}c</span>
        <span className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={onAskExplain}
            disabled={!hasContent}
            className="h-6 px-2 border border-border hover:bg-muted hover:text-foreground text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            explain →
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!hasContent}
            className="h-6 px-2 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
          >
            clear
          </button>
        </span>
      </div>
      <div className="flex-1 min-h-0 relative overflow-hidden">
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
              className="absolute inset-0 px-4 py-3 w-full h-full bg-transparent text-transparent caret-[var(--lime)] placeholder:text-muted-foreground/40 resize-none focus:outline-none whitespace-pre-wrap break-words"
              style={sharedStyle}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center h-7 border-t border-border bg-muted/30 px-3 text-[10.5px] text-muted-foreground gap-3">
        <span>
          <span className="text-[var(--lime)]">fn</span> ·{" "}
          <span className="text-foreground">&quot;str&quot;</span> ·{" "}
          <span className="text-[var(--amber)]">123</span> ·{" "}
          <span className="text-muted-foreground">field.path</span>
        </span>
        <span className="ml-auto text-muted-foreground/60">prefix · {"{{ }}"} · no parens</span>
      </div>
    </div>
  );
}
