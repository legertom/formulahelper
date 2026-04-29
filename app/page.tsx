"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatPanel, type ChatPanelHandle } from "@/components/chat-panel";
import { ExamplesPanel } from "@/components/examples-panel";
import { FieldsPanel } from "@/components/fields-panel";
import { FormulaEditor } from "@/components/formula-editor";
import { ResultStrip } from "@/components/result-strip";
import { SampleDataPanel } from "@/components/sample-data-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { TracePanel } from "@/components/trace-panel";
import {
  EXAMPLE_FORMULAS,
  SAMPLE_PERSONAS,
  SAMPLE_PERSONAS_BY_ID,
  SAMPLE_RECORD_JSON,
} from "@/lib/idm/sample-data";
import { buildShareUrl, decodeShare } from "@/lib/share";
import { useHistory } from "@/lib/use-history";

type TabId = "data" | "fields" | "examples" | "trace";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "data", label: "data" },
  { id: "fields", label: "fields" },
  { id: "examples", label: "examples" },
  { id: "trace", label: "trace" },
];

export default function Page() {
  const [formula, setFormula] = useState(EXAMPLE_FORMULAS[0].formula);
  const [dataJson, setDataJson] = useState(SAMPLE_RECORD_JSON);
  const [activePersonaId, setActivePersonaId] = useState<string>("maria-7");
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const [shareLabel, setShareLabel] = useState("share");
  const [restoredFromHash, setRestoredFromHash] = useState(false);
  const chatRef = useRef<ChatPanelHandle>(null);

  const history = useHistory(formula);

  // Restore state from URL hash on mount
  useEffect(() => {
    const decoded = decodeShare(window.location.hash);
    if (decoded) {
      setFormula(decoded.f);
      setDataJson(decoded.d);
      setActivePersonaId("__custom");
      if (decoded.t && (decoded.t === "data" || decoded.t === "fields" || decoded.t === "examples" || decoded.t === "trace")) {
        setActiveTab(decoded.t);
      }
      history.push(decoded.f, "share");
    } else {
      history.push(EXAMPLE_FORMULAS[0].formula, "init");
    }
    setRestoredFromHash(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsedData = useMemo<Record<string, unknown> | null>(() => {
    try {
      return JSON.parse(dataJson);
    } catch {
      return null;
    }
  }, [dataJson]);

  const onAskExplain = useCallback(() => {
    if (!formula.trim()) return;
    chatRef.current?.send(
      `Explain in plain English what this formula does:\n\n\`\`\`handlebars\n${formula}\n\`\`\``,
    );
  }, [formula]);

  const onInsertField = useCallback((path: string) => {
    setFormula((current) => (current ? `${current} ${path}` : `{{${path}}}`));
  }, []);

  const onLoadExample = useCallback(
    (next: string) => {
      setFormula(next);
      history.push(next, "example");
    },
    [history],
  );

  const onAcceptAiFormula = useCallback(
    (next: string) => {
      setFormula(next);
      history.push(next, "ai");
    },
    [history],
  );

  const onFormatted = useCallback(
    (formatted: string) => {
      // push the PRE-format formula first so the user can always restore
      history.push(formula, "edit");
      setFormula(formatted);
      history.push(formatted, "format");
    },
    [formula, history],
  );

  const onRestoreHistory = useCallback(
    (next: string) => {
      // push current first so the restore is itself reversible
      history.push(formula, "edit");
      setFormula(next);
    },
    [formula, history],
  );

  const onPersonaChange = useCallback((id: string) => {
    if (id === "__custom") {
      setActivePersonaId("__custom");
      return;
    }
    const persona = SAMPLE_PERSONAS_BY_ID[id];
    if (!persona) return;
    setActivePersonaId(id);
    setDataJson(JSON.stringify(persona.record, null, 2));
  }, []);

  const onCustomDataChange = useCallback((next: string) => {
    setDataJson(next);
    setActivePersonaId("__custom");
  }, []);

  const onShare = useCallback(async () => {
    const url = buildShareUrl({ f: formula, d: dataJson, t: activeTab });
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("copied ✓");
    } catch {
      setShareLabel("copy failed");
    }
    setTimeout(() => setShareLabel("share"), 1800);
    // also update the visible URL so opening it works immediately
    if (typeof window !== "undefined") {
      const next = url.split("#")[1];
      if (next) window.history.replaceState(null, "", `#${next}`);
    }
  }, [formula, dataJson, activeTab]);

  // Debounced push of formula edits into history
  const lastEditRef = useRef<string>(formula);
  useEffect(() => {
    if (!restoredFromHash) return;
    if (formula === lastEditRef.current) return;
    const t = setTimeout(() => {
      history.push(formula, "edit");
      lastEditRef.current = formula;
    }, 1500);
    return () => clearTimeout(t);
  }, [formula, history, restoredFromHash]);

  return (
    <main className="flex flex-col flex-1 min-h-0 bg-background text-foreground relative">
      <div className="absolute inset-0 bg-canvas-grid pointer-events-none" />

      <header className="relative border-b border-border bg-background/90 backdrop-blur-[2px] px-4 h-11 flex items-center gap-3 text-[12px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[var(--lime)] text-base leading-none">ƒ</span>
          <span className="font-medium text-foreground tracking-tight">formula-helper</span>
          <span className="text-border">│</span>
          <span className="text-muted-foreground/80 hidden sm:inline">idm studio</span>
          <span className="text-border hidden sm:inline">│</span>
          <span className="text-muted-foreground/60 hidden md:inline">
            v0.2 · ai-sdk · gateway
          </span>
        </div>

        <span className="ml-auto flex items-center gap-1">
          <a
            href="https://formulastudio.net"
            target="_blank"
            rel="noreferrer"
            className="h-7 px-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            studio ↗
          </a>
          <a
            href="https://github.com/legertom/formulahelper"
            target="_blank"
            rel="noreferrer"
            className="h-7 px-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            github ↗
          </a>
          <Link
            href="/about"
            className="h-7 px-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm"
          >
            about
          </Link>
          <span className="mx-1 text-border">│</span>
          <ThemeToggle />
        </span>
      </header>

      <div className="relative flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="flex flex-col min-h-0 border-r border-border">
          <div className="flex-[1.15] min-h-[180px] border-b border-border">
            <FormulaEditor
              value={formula}
              onChange={setFormula}
              onAskExplain={onAskExplain}
              onFormatted={onFormatted}
              onShare={onShare}
              shareLabel={shareLabel}
              history={history.entries}
              onRestoreHistory={onRestoreHistory}
              onClearHistory={history.clear}
            />
          </div>

          <ResultStrip formula={formula} data={parsedData ?? {}} />

          <div className="flex-1 min-h-[260px] flex flex-col bg-card">
            <div className="flex items-stretch h-8 border-b border-border bg-muted/20">
              {TABS.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3 text-[11.5px] uppercase tracking-wider border-r border-border transition relative ${
                      active
                        ? "text-foreground bg-background"
                        : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {t.label}
                    {active && (
                      <span className="absolute left-0 right-0 bottom-[-1px] h-[1px] bg-[var(--lime)]" />
                    )}
                  </button>
                );
              })}
              <span className="ml-auto self-center pr-3 text-[10.5px] text-muted-foreground/50 hidden sm:inline">
                {SAMPLE_PERSONAS.length} personas · click field to insert
              </span>
            </div>
            <div className="flex-1 min-h-0">
              {activeTab === "data" && (
                <SampleDataPanel
                  json={dataJson}
                  onChange={onCustomDataChange}
                  activePersonaId={activePersonaId}
                  onPersonaChange={onPersonaChange}
                />
              )}
              {activeTab === "fields" && (
                <FieldsPanel data={parsedData} onInsert={onInsertField} />
              )}
              {activeTab === "examples" && <ExamplesPanel onLoad={onLoadExample} />}
              {activeTab === "trace" && <TracePanel formula={formula} data={parsedData} />}
            </div>
          </div>
        </section>

        <section className="min-h-0 flex flex-col">
          <ChatPanel ref={chatRef} formula={formula} onFormulaSuggested={onAcceptAiFormula} />
        </section>
      </div>
    </main>
  );
}
