"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-7 w-7 grid place-items-center border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition rounded-sm"
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="h-3.5 w-3.5" />
        ) : (
          <MoonIcon className="h-3.5 w-3.5" />
        )
      ) : (
        <span className="h-3.5 w-3.5 block opacity-0" />
      )}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="8" cy="8" r="3" />
      <path strokeLinecap="round" d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M9 1.5a6.5 6.5 0 1 0 5.5 9.66 5.5 5.5 0 0 1-5.5-8.74A6.5 6.5 0 0 0 9 1.5z" />
    </svg>
  );
}
