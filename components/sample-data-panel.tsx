"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Active record
          </span>
          {error ? (
            <Badge variant="destructive" className="text-[10px]">
              invalid JSON
            </Badge>
          ) : (
            <Badge className="text-[10px] bg-emerald-600 hover:bg-emerald-500">parsed</Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange(SAMPLE_RECORD_JSON)}
          className="h-7 px-2 text-[11px]"
        >
          Reset to default
        </Button>
      </div>
      <textarea
        value={json}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-0 w-full p-3 font-mono text-[12px] leading-relaxed bg-transparent resize-none focus:outline-none"
      />
      {error && (
        <div className="px-3 py-1.5 text-[11px] font-mono text-red-600 dark:text-red-400 border-t bg-red-50/60 dark:bg-red-950/30">
          {error}
        </div>
      )}
    </div>
  );
}
