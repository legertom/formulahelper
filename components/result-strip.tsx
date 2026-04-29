"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  formula: string;
  data: Record<string, unknown>;
};

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; output: unknown; ms: number }
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
      const t0 = performance.now();
      try {
        const res = await fetch("/api/idm-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formula, cases: [{ name: "live", data }] }),
        });
        const json = await res.json();
        if (reqId !== reqIdRef.current) return;
        if (!res.ok) {
          setState({ kind: "error", message: json?.error ?? `HTTP ${res.status}` });
          return;
        }
        const first = (json?.results ?? [])[0];
        setState({
          kind: "ok",
          output: first?.output,
          ms: Math.round(performance.now() - t0),
        });
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setState({ kind: "error", message: err instanceof Error ? err.message : "Network error" });
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formula, data]);

  let dot: React.ReactNode;
  let label: string;
  let body: React.ReactNode;
  let dotColor: string;

  if (state.kind === "idle") {
    dotColor = "bg-muted-foreground/40";
    label = "idle";
    body = <span className="text-muted-foreground/70">type a formula…</span>;
  } else if (state.kind === "loading") {
    dotColor = "bg-[var(--amber)] animate-pulse";
    label = "eval";
    body = <span className="text-muted-foreground">running…</span>;
  } else if (state.kind === "error") {
    dotColor = "bg-[var(--destructive)]";
    label = "error";
    body = <span className="text-[var(--destructive)] break-words">{state.message}</span>;
  } else {
    dotColor = "bg-[var(--lime)]";
    label = "ok";
    body = (
      <>
        <span className="text-foreground">{String(state.output ?? "")}</span>
        <span className="ml-auto text-muted-foreground/60 shrink-0">
          {state.ms}ms · live
        </span>
      </>
    );
  }
  dot = <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />;

  return (
    <div className="flex items-center h-9 border-l-2 border-l-[var(--lime)] border-t border-r border-b border-border bg-card px-3 gap-2.5 text-[12.5px]">
      {dot}
      <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
        {label}
      </span>
      <span className="text-border">│</span>
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">{body}</div>
    </div>
  );
}
