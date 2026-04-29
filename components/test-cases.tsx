"use client";

import { useState } from "react";
import type { TestResult } from "@/lib/idm/client";

type Props = {
  formula: string;
};

type Row = { id: string; name: string; data: string; expected: string };

function makeRow(): Row {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    data: '{\n  "school_name": "A"\n}',
    expected: "",
  };
}

export function TestCasesPanel({ formula }: Props) {
  const [rows, setRows] = useState<Row[]>([makeRow()]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | { error: string } | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const cases = rows.map((r, i) => {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(r.data || "{}");
        } catch {
          throw new Error(`Row ${i + 1}: invalid JSON in data field.`);
        }
        return {
          name: r.name || `case ${i + 1}`,
          data: parsed,
          expected: r.expected || undefined,
        };
      });
      const res = await fetch("/api/idm-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula, cases }),
      });
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setRunning(false);
    }
  }

  const isError = result && "error" in result;
  const passed = result && !isError ? (result as TestResult).passCount : 0;
  const failed = result && !isError ? (result as TestResult).failCount : 0;

  return (
    <div className="flex flex-col h-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Test cases
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, makeRow()])}
            className="text-xs px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          >
            + Add row
          </button>
          <button
            type="button"
            onClick={run}
            disabled={!formula.trim() || running}
            className="text-xs px-3 py-1 rounded-md bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-500 transition"
          >
            {running ? "Running…" : "Run tests"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="border border-zinc-200 dark:border-zinc-800 rounded-md p-2 bg-zinc-50 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <input
                value={row.name}
                onChange={(e) =>
                  setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r)))
                }
                placeholder={`case ${idx + 1}`}
                className="text-xs px-2 py-1 flex-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
              />
              <input
                value={row.expected}
                onChange={(e) =>
                  setRows((rs) =>
                    rs.map((r) => (r.id === row.id ? { ...r, expected: e.target.value } : r)),
                  )
                }
                placeholder="expected (optional)"
                className="text-xs px-2 py-1 w-40 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400"
              />
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                disabled={rows.length === 1}
                className="text-xs text-zinc-400 hover:text-red-500 disabled:opacity-40 px-1"
                aria-label="Remove row"
              >
                ✕
              </button>
            </div>
            <textarea
              value={row.data}
              onChange={(e) =>
                setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, data: e.target.value } : r)))
              }
              spellCheck={false}
              rows={3}
              placeholder='{ "school_name": "A" }'
              className="w-full text-xs font-mono px-2 py-1.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 resize-y"
            />
          </div>
        ))}

        {result && (
          <div
            className={`text-xs rounded-md p-3 border ${
              isError
                ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300"
                : failed > 0
                  ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300"
            }`}
          >
            {isError ? (
              <span>{(result as { error: string }).error}</span>
            ) : (
              <>
                <div className="font-semibold mb-1">
                  {passed}/{(result as TestResult).compared || (result as TestResult).count} passed
                </div>
                <ul className="space-y-1 font-mono">
                  {(result as TestResult).results.map((r, i) => (
                    <li key={i}>
                      {r.passed === null ? "—" : r.passed ? "✓" : "✗"} {r.name}: {String(r.output)}
                      {r.expected !== undefined && (
                        <span className="opacity-60"> (expected {r.expected})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
