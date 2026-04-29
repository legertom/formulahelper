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
        aria-haspopup="menu"
        aria-expanded={open}
        title="Theme flavor"
        className="h-7 px-2.5 flex items-center gap-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm text-[11px]"
      >
        <span
          className="h-2 w-2 rounded-full border border-foreground/30 shrink-0"
          style={{ backgroundColor: current.swatches[1] }}
          aria-hidden
        />
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-50 w-[300px] bg-popover border-2 border-foreground/40 shadow-2xl shadow-black/50 dark:shadow-black overflow-hidden rounded-sm ring-1 ring-foreground/10"
        >
          <div className="px-3 h-8 flex items-center justify-between border-b border-border bg-muted/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Theme flavor</span>
            <span className="text-foreground/40">{FLAVOR_LIST.length} options</span>
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
    <span className="inline-flex shrink-0 gap-px">
      {swatches.map((c, i) => (
        <span
          key={i}
          className="h-4 w-2 border border-foreground/30 first:rounded-l-sm last:rounded-r-sm"
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={`text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="M2 4l3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
