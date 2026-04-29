"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Props = {
  formula: string;
  data: Record<string, unknown>;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; output: unknown; warnings: string[] }
  | { kind: "error"; message: string };

export function ResultStrip({ formula, data }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (!formula.trim()) {
      setState({ kind: "idle" });
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setState({ kind: "loading" });
    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      try {
        const res = await fetch("/api/idm-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formula,
            cases: [{ name: "live", data }],
          }),
        });
        const json = await res.json();
        if (reqId !== reqIdRef.current) return;
        if (!res.ok) {
          setState({ kind: "error", message: json?.error ?? `${res.status}` });
          return;
        }
        const first = (json?.results ?? [])[0];
        setState({
          kind: "ok",
          output: first?.output,
          warnings: [],
        });
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Network error",
        });
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formula, data]);

  let pill: React.ReactNode;
  let body: React.ReactNode;

  if (state.kind === "idle") {
    pill = (
      <Badge variant="secondary" className="font-mono text-[10px]">
        idle
      </Badge>
    );
    body = (
      <span className="text-xs text-muted-foreground">
        Type or paste a formula to see live evaluation against the active sample record.
      </span>
    );
  } else if (state.kind === "loading") {
    pill = (
      <Badge variant="secondary" className="font-mono text-[10px] animate-pulse">
        evaluating…
      </Badge>
    );
    body = <span className="text-xs text-muted-foreground">Running against sample data…</span>;
  } else if (state.kind === "error") {
    pill = (
      <Badge variant="destructive" className="font-mono text-[10px]">
        error
      </Badge>
    );
    body = (
      <span className="text-xs text-red-600 dark:text-red-400 font-mono break-words">
        {state.message}
      </span>
    );
  } else {
    pill = (
      <Badge className="font-mono text-[10px] bg-emerald-600 text-white hover:bg-emerald-500">
        ok
      </Badge>
    );
    body = (
      <span className="text-sm font-mono text-foreground break-words">
        {String(state.output ?? "")}
      </span>
    );
  }

  return (
    <Card className="px-3.5 py-2 flex items-center gap-3 border-l-4 border-l-emerald-500/70 dark:border-l-emerald-400/40 shadow-none">
      <div className="flex flex-col items-start gap-0.5 shrink-0">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Live result
        </span>
        {pill}
      </div>
      <div className="flex-1 min-w-0 leading-tight">{body}</div>
    </Card>
  );
}
