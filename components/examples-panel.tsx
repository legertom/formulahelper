"use client";

import { Button } from "@/components/ui/button";
import { EXAMPLE_FORMULAS } from "@/lib/idm/sample-data";

type Props = {
  onLoad: (formula: string) => void;
};

export function ExamplesPanel({ onLoad }: Props) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Examples
        </span>
        <span className="text-[10px] text-muted-foreground/70">
          {EXAMPLE_FORMULAS.length} canned
        </span>
      </div>
      <ul className="flex-1 min-h-0 overflow-auto divide-y">
        {EXAMPLE_FORMULAS.map((ex) => (
          <li key={ex.id} className="px-3 py-2.5 hover:bg-accent/40 group">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground">{ex.title}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{ex.blurb}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onLoad(ex.formula)}
                className="h-6 px-2 text-[10px] shrink-0"
              >
                Load
              </Button>
            </div>
            <pre className="font-mono text-[10.5px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap break-words leading-snug">
              {ex.formula}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
