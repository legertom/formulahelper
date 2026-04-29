"use client";

import { useMemo, useState } from "react";
import { evaluate, type EvalTrace } from "@/lib/idm/eval";
import { parseFormula, type ASTNode } from "@/lib/idm/parser";
import { SAMPLE_PERSONAS } from "@/lib/idm/sample-data";

type Props = {
  formula: string;
  data: Record<string, unknown> | null;
};

type CoverageMap = Map<string, { ifs: Map<number, number> }>;
// keyed by AST node id of the if; inner map is branch (1=true, 2=false) -> count

function summarize(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value === "" ? '""' : `"${value}"`;
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function nodeColor(value: unknown, error?: string): string {
  if (error) return "border-l-[var(--destructive)]";
  if (value === false || value === undefined || value === null || value === "")
    return "border-l-muted-foreground/30";
  return "border-l-[var(--lime)]";
}

export function TracePanel({ formula, data }: Props) {
  const [coverage, setCoverage] = useState<CoverageMap | null>(null);
  const [coverageRunning, setCoverageRunning] = useState(false);

  const parsed = useMemo(() => parseFormula(formula), [formula]);

  const evalResult = useMemo(() => {
    if (!parsed.ast || !data) return null;
    return evaluate(parsed.ast, data);
  }, [parsed.ast, data]);

  async function runAllRecords() {
    if (!parsed.ast) return;
    setCoverageRunning(true);
    setCoverage(null);
    try {
      const cov: CoverageMap = new Map();
      for (const persona of SAMPLE_PERSONAS) {
        const result = evaluate(parsed.ast, persona.record);
        for (const [nodeId, entry] of result.trace) {
          if (entry.branchTaken === undefined) continue;
          let bucket = cov.get(nodeId);
          if (!bucket) {
            bucket = { ifs: new Map() };
            cov.set(nodeId, bucket);
          }
          bucket.ifs.set(entry.branchTaken, (bucket.ifs.get(entry.branchTaken) ?? 0) + 1);
        }
      }
      setCoverage(cov);
    } finally {
      setCoverageRunning(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-7 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          trace
        </span>
        {parsed.errors.length > 0 ? (
          <span className="flex items-center gap-1 text-[var(--destructive)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]" aria-hidden />
            {parsed.errors[0].message}
          </span>
        ) : evalResult?.error ? (
          <span className="flex items-center gap-1 text-[var(--destructive)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]" aria-hidden />
            {evalResult.error}
          </span>
        ) : evalResult ? (
          <span className="flex items-center gap-1 text-muted-foreground">
            result <span className="text-foreground">{summarize(evalResult.value)}</span>
          </span>
        ) : null}
        <span className="ml-auto" />
        <button
          type="button"
          onClick={runAllRecords}
          disabled={!parsed.ast || coverageRunning}
          className="h-5 px-2 text-[10.5px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition disabled:opacity-30 rounded-sm"
        >
          {coverageRunning ? "running…" : `▷ run ${SAMPLE_PERSONAS.length} records`}
        </button>
        {coverage && (
          <button
            type="button"
            onClick={() => setCoverage(null)}
            aria-label="Dismiss coverage"
            className="h-5 w-5 grid place-items-center text-[10.5px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-3">
        {parsed.ast && evalResult ? (
          <NodeView
            node={parsed.ast}
            trace={evalResult.trace}
            depth={0}
            coverage={coverage}
          />
        ) : (
          <div className="text-[11.5px] text-muted-foreground/70">
            {parsed.errors.length > 0
              ? "Fix the parse error above to see the trace."
              : "No formula yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function NodeView({
  node,
  trace,
  depth,
  coverage,
}: {
  node: ASTNode;
  trace: EvalTrace;
  depth: number;
  coverage: CoverageMap | null;
}) {
  const entry = trace.get(node.id);
  const value = entry?.value;
  const error = entry?.error;
  const colorClass = nodeColor(value, error);

  if (node.kind === "string") {
    return (
      <Line depth={depth} colorClass={colorClass}>
        <span className="text-foreground">&quot;{node.value}&quot;</span>
        <ResultBadge value={value} error={error} />
      </Line>
    );
  }
  if (node.kind === "number") {
    return (
      <Line depth={depth} colorClass={colorClass}>
        <span className="text-[var(--amber)]">{node.value}</span>
        <ResultBadge value={value} error={error} />
      </Line>
    );
  }
  if (node.kind === "field") {
    return (
      <Line depth={depth} colorClass={colorClass}>
        <span className="text-muted-foreground">{node.path}</span>
        <ResultBadge value={value} error={error} />
      </Line>
    );
  }

  // fn
  const branchTaken = entry?.branchTaken;
  const cov = coverage?.get(node.id);

  return (
    <div className="leading-tight">
      <Line depth={depth} colorClass={colorClass}>
        <span className="text-[var(--lime)]">{node.name}</span>
        {node.name === "if" && branchTaken !== undefined && (
          <span className="text-[10px] text-muted-foreground/70 ml-1.5">
            → branch {branchTaken === 1 ? "true" : "false"}
          </span>
        )}
        <ResultBadge value={value} error={error} />
      </Line>

      {node.name === "if" && cov && (
        <div
          className="text-[10px] font-mono text-muted-foreground/80 mt-0.5"
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          coverage:{" "}
          <span className="text-[var(--lime)]">
            true {cov.ifs.get(1) ?? 0}
          </span>
          {" · "}
          <span className="text-muted-foreground">false {cov.ifs.get(2) ?? 0}</span>
        </div>
      )}

      {node.args.map((child, i) => {
        const isCondArg = node.name === "if" && i === 0;
        const isTrueArg = node.name === "if" && i === 1;
        const isFalseArg = node.name === "if" && i === 2;
        const dimmed =
          (isTrueArg && branchTaken === 2) || (isFalseArg && branchTaken === 1);
        return (
          <div key={child.id} className={dimmed ? "opacity-40" : ""}>
            {(isCondArg || isTrueArg || isFalseArg) && (
              <div
                className="text-[9.5px] uppercase tracking-wider text-muted-foreground/50 mt-1"
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
              >
                {isCondArg ? "cond" : isTrueArg ? "true" : "false"}
              </div>
            )}
            <NodeView node={child} trace={trace} depth={depth + 1} coverage={coverage} />
          </div>
        );
      })}
    </div>
  );
}

function Line({
  depth,
  colorClass,
  children,
}: {
  depth: number;
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-baseline gap-1.5 border-l-2 ${colorClass} pl-2 py-0.5 text-[12px] font-mono hover:bg-muted/40 transition`}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      {children}
    </div>
  );
}

function ResultBadge({ value, error }: { value: unknown; error?: string }) {
  if (error) {
    return (
      <span className="ml-auto pl-3 text-[var(--destructive)] text-[11px] truncate max-w-[40%]">
        ✗ {error}
      </span>
    );
  }
  return (
    <span className="ml-auto pl-3 text-muted-foreground text-[11px] truncate max-w-[55%]">
      → <span className="text-foreground">{summarize(value)}</span>
    </span>
  );
}
