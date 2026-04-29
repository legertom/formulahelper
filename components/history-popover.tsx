"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { diffLines } from "diff";
import type { HistoryEntry } from "@/lib/use-history";

type Props = {
  entries: HistoryEntry[];
  currentFormula: string;
  onRestore: (formula: string) => void;
  onClear: () => void;
};

const SOURCE_LABEL: Record<HistoryEntry["source"], string> = {
  edit: "edit",
  ai: "ai",
  example: "example",
  format: "format",
  init: "init",
  share: "share",
};

const SOURCE_COLOR: Record<HistoryEntry["source"], string> = {
  edit: "text-muted-foreground",
  ai: "text-[var(--lime)]",
  example: "text-[var(--amber)]",
  format: "text-foreground",
  init: "text-muted-foreground/60",
  share: "text-muted-foreground",
};

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function HistoryPopover({ entries, currentFormula, onRestore, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selectedEntry = entries.find((e) => e.id === selected) ?? null;

  const diff = useMemo(() => {
    if (!selectedEntry) return null;
    return diffLines(selectedEntry.formula, currentFormula);
  }, [selectedEntry, currentFormula]);

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-6 px-2 text-[11px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
      >
        history · {entries.length}
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-30 w-[640px] max-w-[calc(100vw-32px)] max-h-[420px] bg-card border border-border shadow-lg flex">
          <div className="w-[260px] border-r border-border flex flex-col">
            <div className="flex items-center h-7 px-2.5 border-b border-border bg-muted/30 text-[11px]">
              <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
                versions
              </span>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="ml-auto text-[10px] text-foreground/70 hover:text-[var(--destructive)] transition"
                >
                  clear all
                </button>
              )}
            </div>
            <ul className="flex-1 overflow-auto">
              {entries.length === 0 && (
                <li className="px-3 py-2 text-[11px] text-muted-foreground/70">
                  No history yet.
                </li>
              )}
              {entries.map((e) => {
                const isCurrent = e.formula === currentFormula;
                const isSelected = e.id === selected;
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(e.id)}
                      className={`w-full px-2.5 py-1.5 text-left border-b border-border/50 transition ${
                        isSelected ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-baseline gap-1.5 text-[10.5px] mb-0.5">
                        <span className={SOURCE_COLOR[e.source]}>
                          {SOURCE_LABEL[e.source]}
                        </span>
                        <span className="text-muted-foreground/60">
                          {relativeTime(e.ts)}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto text-[var(--lime)]">● current</span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-foreground truncate">
                        {e.formula.replace(/\s+/g, " ").slice(0, 60)}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center h-7 px-2.5 border-b border-border bg-muted/30 text-[11px] gap-2">
              <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
                diff
              </span>
              {selectedEntry && (
                <span className="text-muted-foreground/70">
                  selected → current
                </span>
              )}
              <span className="ml-auto" />
              {selectedEntry && selectedEntry.formula !== currentFormula && (
                <button
                  type="button"
                  onClick={() => {
                    onRestore(selectedEntry.formula);
                    setOpen(false);
                  }}
                  className="h-5 px-2 text-[10.5px] bg-[var(--lime)] text-background font-medium hover:opacity-90 transition rounded-sm"
                >
                  ↺ restore
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto p-2">
              {!selectedEntry ? (
                <div className="text-[11px] text-muted-foreground/70 px-1">
                  Select a version to compare.
                </div>
              ) : !diff ? null : (
                <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                  {diff.map((part, i) => (
                    <span
                      key={i}
                      className={
                        part.added
                          ? "bg-[var(--lime)]/15 text-foreground"
                          : part.removed
                            ? "bg-[var(--destructive)]/15 text-muted-foreground line-through"
                            : "text-muted-foreground"
                      }
                    >
                      {part.added ? "+ " : part.removed ? "- " : "  "}
                      {part.value}
                    </span>
                  ))}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
