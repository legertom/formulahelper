"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_FLAVOR,
  FLAVOR_STORAGE_KEY,
  isFlavor,
  type FlavorId,
} from "@/lib/themes";

type FlavorContextValue = {
  flavor: FlavorId;
  setFlavor: (id: FlavorId) => void;
  hydrated: boolean;
};

const FlavorContext = createContext<FlavorContextValue | null>(null);

export function FlavorProvider({ children }: { children: React.ReactNode }) {
  const [flavor, setFlavorState] = useState<FlavorId>(DEFAULT_FLAVOR);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FLAVOR_STORAGE_KEY);
      if (isFlavor(stored)) {
        setFlavorState(stored);
        document.documentElement.setAttribute("data-flavor", stored);
      } else if (!document.documentElement.getAttribute("data-flavor")) {
        document.documentElement.setAttribute("data-flavor", DEFAULT_FLAVOR);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  function setFlavor(id: FlavorId) {
    setFlavorState(id);
    document.documentElement.setAttribute("data-flavor", id);
    try {
      window.localStorage.setItem(FLAVOR_STORAGE_KEY, id);
    } catch {
      // ignore quota
    }
  }

  return (
    <FlavorContext.Provider value={{ flavor, setFlavor, hydrated }}>
      {children}
    </FlavorContext.Provider>
  );
}

export function useFlavor() {
  const ctx = useContext(FlavorContext);
  if (!ctx) {
    return { flavor: DEFAULT_FLAVOR, setFlavor: () => {}, hydrated: false };
  }
  return ctx;
}
