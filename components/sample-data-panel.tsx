"use client";

import { useEffect, useState } from "react";
import { SAMPLE_RECORD_JSON } from "@/lib/idm/sample-data";

type Props = {
  json: string;
  onChange: (json: string) => void;
};

export function SampleDataPanel({ json, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      JSON.parse(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "invalid JSON");
    }
  }, [json]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-7 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${error ? "bg-[var(--destructive)]" : "bg-[var(--lime)]"}`}
          aria-hidden
        />
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          {error ? "invalid" : "parsed"}
        </span>
        <span className="text-border">│</span>
        <span className="text-muted-foreground">record.json</span>
        <button
          type="button"
          onClick={() => onChange(SAMPLE_RECORD_JSON)}
          className="ml-auto h-5 px-1.5 text-[10.5px] hover:bg-muted text-muted-foreground hover:text-foreground transition"
        >
          ↺ reset
        </button>
      </div>
      <textarea
        value={json}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-0 w-full p-3 font-mono text-[12px] leading-relaxed bg-transparent resize-none focus:outline-none text-foreground"
      />
      {error && (
        <div className="px-3 py-1.5 text-[11px] font-mono text-[var(--destructive)] border-t border-border bg-[var(--destructive)]/10">
          {error}
        </div>
      )}
    </div>
  );
}
