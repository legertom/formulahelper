"use client";

import { useMemo, useState } from "react";
import { EXAMPLE_FORMULAS, type ExampleCategory } from "@/lib/idm/sample-data";

type Props = {
  onLoad: (formula: string) => void;
};

const CATEGORY_LABEL: Record<ExampleCategory, string> = {
  logic: "logic",
  string: "string",
  naming: "naming",
  ou: "ou",
  date: "date",
  "ai-friendly": "idioms",
};

export function ExamplesPanel({ onLoad }: Props) {
  const [filter, setFilter] = useState("");
  const [activeCat, setActiveCat] = useState<ExampleCategory | "all">("all");

  const grouped = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return EXAMPLE_FORMULAS.filter((ex) => {
      if (activeCat !== "all" && ex.category !== activeCat) return false;
      if (!f) return true;
      return (
        ex.title.toLowerCase().includes(f) ||
        ex.blurb.toLowerCase().includes(f) ||
        ex.formula.toLowerCase().includes(f)
      );
    });
  }, [filter, activeCat]);

  const cats: Array<ExampleCategory | "all"> = [
    "all",
    "logic",
    "string",
    "naming",
    "ou",
    "date",
    "ai-friendly",
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-7 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          examples
        </span>
        <span className="text-muted-foreground/60 tabular-nums">
          {grouped.length}/{EXAMPLE_FORMULAS.length}
        </span>
        <span className="ml-auto" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter…"
          className="h-5 w-[140px] bg-transparent border-b border-border focus:border-[var(--lime)] outline-none px-0 text-[11px] placeholder:text-muted-foreground/40"
        />
      </div>

      <div className="flex items-center gap-px border-b border-border bg-muted/20 overflow-x-auto">
        {cats.map((cat) => {
          const active = activeCat === cat;
          const count =
            cat === "all"
              ? EXAMPLE_FORMULAS.length
              : EXAMPLE_FORMULAS.filter((ex) => ex.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-2.5 h-6 text-[10.5px] uppercase tracking-wider border-r border-border transition relative ${
                active
                  ? "text-foreground bg-background"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {cat === "all" ? "all" : CATEGORY_LABEL[cat]}
              <span className="ml-1 text-muted-foreground/60 tabular-nums">{count}</span>
              {active && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[1px] bg-[var(--lime)]" />
              )}
            </button>
          );
        })}
      </div>

      <ul className="flex-1 min-h-0 overflow-auto">
        {grouped.map((ex, idx) => (
          <li key={ex.id} className="border-b border-border last:border-0">
            <button
              type="button"
              onClick={() => onLoad(ex.formula)}
              className="w-full px-3 py-2 text-left hover:bg-muted/40 transition group"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[10.5px] text-muted-foreground/60 tabular-nums shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="text-[12.5px] font-medium text-foreground group-hover:text-[var(--lime)] transition">
                  {ex.title}
                </span>
                <span className="ml-auto text-[9.5px] uppercase tracking-wider text-muted-foreground/60 shrink-0 border border-border px-1 rounded-sm">
                  {CATEGORY_LABEL[ex.category]}
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
        {grouped.length === 0 && (
          <li className="px-3 py-3 text-[11.5px] text-muted-foreground/70">no matches</li>
        )}
      </ul>
    </div>
  );
}
