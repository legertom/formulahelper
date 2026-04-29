"use client";

import { useMemo, useState } from "react";
import { extractFieldPaths } from "@/lib/idm/sample-data";

type Props = {
  data: Record<string, unknown> | null;
  onInsert: (path: string) => void;
};

function getValueAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === "object") return "{…}";
  if (typeof v === "string") return v.length > 26 ? `${v.slice(0, 26)}…` : v;
  return String(v);
}

export function FieldsPanel({ data, onInsert }: Props) {
  const [filter, setFilter] = useState("");
  const allPaths = useMemo(() => (data ? extractFieldPaths(data).sort() : []), [data]);
  const filtered = useMemo(() => {
    if (!filter.trim()) return allPaths;
    const f = filter.toLowerCase();
    return allPaths.filter((p) => p.toLowerCase().includes(f));
  }, [allPaths, filter]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-7 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          fields
        </span>
        <span className="text-muted-foreground/60 tabular-nums">
          {filtered.length}/{allPaths.length}
        </span>
        <span className="ml-auto" />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter…"
          className="h-5 w-[140px] bg-transparent border-b border-border focus:border-[var(--lime)] outline-none px-0 text-[11px] placeholder:text-muted-foreground/40"
        />
      </div>
      {data ? (
        <ul className="flex-1 min-h-0 overflow-auto">
          {filtered.map((path) => {
            const value = getValueAtPath(data, path);
            return (
              <li key={path}>
                <button
                  type="button"
                  onClick={() => onInsert(path)}
                  className="w-full px-3 py-1 hover:bg-muted/50 text-left text-[12px] font-mono flex items-center gap-2 group"
                >
                  <span className="text-muted-foreground/40 group-hover:text-[var(--lime)] transition">
                    +
                  </span>
                  <span className="text-foreground">{path}</span>
                  <span className="ml-auto text-[10.5px] text-muted-foreground/70 truncate max-w-[42%]">
                    {formatValue(value)}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-[11.5px] text-muted-foreground/70">no matches</li>
          )}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[11.5px] text-muted-foreground p-4 text-center">
          sample record is invalid JSON. fix it on the data tab.
        </div>
      )}
    </div>
  );
}
