"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_PERSONAS } from "@/lib/idm/sample-data";

type Props = {
  json: string;
  onChange: (json: string) => void;
  activePersonaId: string | null;
  onPersonaChange: (id: string) => void;
};

export function SampleDataPanel({ json, onChange, activePersonaId, onPersonaChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      JSON.parse(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "invalid JSON");
    }
  }, [json]);

  function flashMsg(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 2000);
  }

  function downloadJson() {
    try {
      JSON.parse(json);
    } catch {
      flashMsg("invalid JSON — fix before download");
      return;
    }
    const personaLabel = activePersonaId && activePersonaId !== "__custom" ? activePersonaId : "record";
    const filename = `${personaLabel}.json`;
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flashMsg(`↓ ${filename}`);
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      try {
        const parsed = JSON.parse(raw);
        const pretty = JSON.stringify(parsed, null, 2);
        onChange(pretty);
        onPersonaChange("__custom");
        flashMsg(`↑ loaded ${file.name}`);
      } catch (err) {
        flashMsg(err instanceof Error ? err.message : "invalid JSON file");
      }
    };
    reader.onerror = () => flashMsg("failed to read file");
    reader.readAsText(file);
    // reset so picking the same file again still triggers
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-8 px-3 border-b border-border bg-muted/30 text-[11px] gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${error ? "bg-[var(--destructive)]" : "bg-[var(--lime)]"}`}
          aria-hidden
        />
        <span className="text-muted-foreground/80 uppercase tracking-wider text-[10px]">
          {error ? "invalid" : "parsed"}
        </span>
        <span className="text-border">│</span>
        <select
          value={activePersonaId ?? ""}
          onChange={(e) => onPersonaChange(e.target.value)}
          className="bg-background border border-foreground/25 hover:border-foreground/50 text-[11px] px-1.5 py-[2px] focus:outline-none focus:border-[var(--lime)] text-foreground rounded-sm"
        >
          <option value="" disabled>
            persona…
          </option>
          {SAMPLE_PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
          <option value="__custom">— custom —</option>
        </select>

        <span className="ml-auto flex items-center gap-1">
          {actionMsg && (
            <span className="text-[10.5px] text-[var(--lime)] mr-1">{actionMsg}</span>
          )}
          <button
            type="button"
            onClick={downloadJson}
            className="h-6 px-2 text-[10.5px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            ↓ download
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-6 px-2 text-[10.5px] border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            ↑ upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onFilePicked}
            className="hidden"
          />
        </span>
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
