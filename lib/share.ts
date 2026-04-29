import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export type ShareState = {
  v: 1;
  f: string;
  d: string;
  t?: "data" | "fields" | "examples" | "trace" | "history";
};

export function encodeShare(state: Omit<ShareState, "v">): string {
  const payload: ShareState = { v: 1, ...state };
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(hash: string): Omit<ShareState, "v"> | null {
  if (!hash) return null;
  const trimmed = hash.replace(/^#/, "").replace(/^s=/, "");
  if (!trimmed) return null;
  try {
    const json = decompressFromEncodedURIComponent(trimmed);
    if (!json) return null;
    const parsed = JSON.parse(json) as ShareState;
    if (parsed.v !== 1) return null;
    return { f: parsed.f ?? "", d: parsed.d ?? "", t: parsed.t };
  } catch {
    return null;
  }
}

export function buildShareUrl(state: Omit<ShareState, "v">): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeShare(state);
  const url = new URL(window.location.href);
  url.hash = `s=${encoded}`;
  return url.toString();
}
