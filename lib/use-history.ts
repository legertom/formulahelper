"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HistoryEntry = {
  id: string;
  formula: string;
  ts: number;
  source: "edit" | "ai" | "example" | "format" | "init" | "share";
};

const STORAGE_KEY = "formulahelper:history:v1";
const MAX_ENTRIES = 30;

function load(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function save(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // ignore quota errors
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useHistory(currentFormula: string) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const lastPushedRef = useRef<string>("");

  useEffect(() => {
    setEntries(load());
    setHydrated(true);
  }, []);

  const push = useCallback((formula: string, source: HistoryEntry["source"]) => {
    if (!formula.trim()) return;
    if (formula === lastPushedRef.current) return;
    lastPushedRef.current = formula;
    setEntries((prev) => {
      if (prev[0]?.formula === formula) return prev;
      const next: HistoryEntry[] = [
        { id: uid(), formula, ts: Date.now(), source },
        ...prev,
      ].slice(0, MAX_ENTRIES);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    save([]);
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { entries, push, clear, remove, hydrated, currentFormula };
}
