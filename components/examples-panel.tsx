"use client";

import { EXAMPLE_FORMULAS } from "@/lib/idm/sample-data";

type Props = {
  onLoad: (formula: string) => void;
};

export function ExamplesPanel({ onLoad }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-7 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          examples
        </span>
        <span className="text-muted-foreground/60 tabular-nums">{EXAMPLE_FORMULAS.length}</span>
      </div>
      <ul className="flex-1 min-h-0 overflow-auto">
        {EXAMPLE_FORMULAS.map((ex, idx) => (
          <li key={ex.id} className="border-b border-border last:border-0">
            <button
              type="button"
              onClick={() => onLoad(ex.formula)}
              className="w-full px-3 py-2 text-left hover:bg-muted/40 transition group"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[10.5px] text-muted-foreground/60 tabular-nums">
                  {String(idx).padStart(2, "0")}
                </span>
                <span className="text-[12.5px] font-medium text-foreground group-hover:text-[var(--lime)] transition">
                  {ex.title}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground/80 leading-snug ml-[26px] mb-1">
                {ex.blurb}
              </div>
              <pre className="ml-[26px] font-mono text-[10.5px] text-muted-foreground/70 leading-snug overflow-x-auto whitespace-pre-wrap break-words">
                {ex.formula}
              </pre>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
