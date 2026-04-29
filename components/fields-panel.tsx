"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
  if (Array.isArray(v)) return `[${v.length} items]`;
  if (typeof v === "object") return "{…}";
  if (typeof v === "string") return v.length > 28 ? `${v.slice(0, 28)}…` : v;
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
      <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground shrink-0">
          Fields
        </span>
        <span className="text-[10px] text-muted-foreground/70 shrink-0">
          {filtered.length}/{allPaths.length}
        </span>
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter…"
          className="h-7 text-xs ml-auto max-w-[180px]"
        />
      </div>
      {data ? (
        <ul className="flex-1 min-h-0 overflow-auto py-1">
          {filtered.map((path) => {
            const value = getValueAtPath(data, path);
            return (
              <li key={path}>
                <button
                  type="button"
                  onClick={() => onInsert(path)}
                  className="w-full px-3 py-1 hover:bg-accent text-left text-xs font-mono flex items-center gap-2 group"
                >
                  <span className="text-foreground">{path}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground truncate max-w-[40%] opacity-70 group-hover:opacity-100">
                    {formatValue(value)}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">No matches.</li>
          )}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
          Sample record is invalid JSON. Fix it on the Data tab.
        </div>
      )}
    </div>
  );
}
