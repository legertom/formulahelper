"use client";

import { useEffect, useRef, useState } from "react";
import { useFlavor } from "@/components/flavor-provider";
import { FLAVOR_LIST, FLAVORS, type FlavorId } from "@/lib/themes";

export function FlavorPicker() {
  const { flavor, setFlavor } = useFlavor();
  const [open, setOpen] = useState(false);
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

  const current = FLAVORS[flavor];

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pick theme flavor"
        className="h-7 px-2 flex items-center gap-1.5 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm text-[11px]"
      >
        <Swatches swatches={current.swatches} />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="text-foreground/50">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 w-[280px] bg-card border border-border shadow-lg overflow-hidden rounded-sm">
          <div className="px-3 h-7 flex items-center border-b border-border bg-muted/30 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            theme flavor
          </div>
          <ul>
            {FLAVOR_LIST.map((f) => {
              const active = f.id === flavor;
              return (
                <li key={f.id} className="border-b border-border/60 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFlavor(f.id as FlavorId);
                      setOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left transition flex items-start gap-2.5 ${
                      active ? "bg-muted/60" : "hover:bg-muted/40"
                    }`}
                  >
                    <Swatches swatches={f.swatches} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12.5px] font-semibold text-foreground">
                          {f.label}
                        </span>
                        {active && (
                          <span className="text-[10px] text-[var(--lime)]">● active</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-snug">
                        {f.blurb}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Swatches({ swatches }: { swatches: [string, string, string] }) {
  return (
    <span className="inline-flex shrink-0">
      {swatches.map((c, i) => (
        <span
          key={i}
          className="h-3 w-3 border border-foreground/30 -ml-[2px] first:ml-0 rounded-sm"
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}
