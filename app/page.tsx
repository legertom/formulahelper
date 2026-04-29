"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChatPanel, type ChatPanelHandle } from "@/components/chat-panel";
import { ExamplesPanel } from "@/components/examples-panel";
import { FieldsPanel } from "@/components/fields-panel";
import { FormulaEditor } from "@/components/formula-editor";
import { ResultStrip } from "@/components/result-strip";
import { SampleDataPanel } from "@/components/sample-data-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SAMPLE_RECORD_JSON, EXAMPLE_FORMULAS } from "@/lib/idm/sample-data";

type TabId = "data" | "fields" | "examples";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "data", label: "data" },
  { id: "fields", label: "fields" },
  { id: "examples", label: "examples" },
];

export default function Page() {
  const [formula, setFormula] = useState(EXAMPLE_FORMULAS[0].formula);
  const [dataJson, setDataJson] = useState(SAMPLE_RECORD_JSON);
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const chatRef = useRef<ChatPanelHandle>(null);

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
            v0.1 · ai-sdk · gateway
          </span>
        </div>

        <span className="ml-auto flex items-center gap-1">
          <a
            href="https://formulastudio.net"
            target="_blank"
            rel="noreferrer"
            className="h-7 px-2 hover:bg-muted text-muted-foreground hover:text-foreground transition border border-transparent hover:border-border"
          >
            studio ↗
          </a>
          <a
            href="https://github.com/legertom/formulahelper"
            target="_blank"
            rel="noreferrer"
            className="h-7 px-2 hover:bg-muted text-muted-foreground hover:text-foreground transition border border-transparent hover:border-border"
          >
            github ↗
          </a>
          <Link
            href="/about"
            className="h-7 px-2 hover:bg-muted text-muted-foreground hover:text-foreground transition border border-transparent hover:border-border"
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
            <FormulaEditor value={formula} onChange={setFormula} onAskExplain={onAskExplain} />
          </div>

          <ResultStrip formula={formula} data={parsedData ?? {}} />

          <div className="flex-1 min-h-[220px] flex flex-col bg-card">
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
                tab to switch · click field to insert
              </span>
            </div>
            <div className="flex-1 min-h-0">
              {activeTab === "data" && (
                <SampleDataPanel json={dataJson} onChange={setDataJson} />
              )}
              {activeTab === "fields" && (
                <FieldsPanel data={parsedData} onInsert={onInsertField} />
              )}
              {activeTab === "examples" && <ExamplesPanel onLoad={setFormula} />}
            </div>
          </div>
        </section>

        <section className="min-h-0 flex flex-col">
          <ChatPanel ref={chatRef} formula={formula} onFormulaSuggested={setFormula} />
        </section>
      </div>
    </main>
  );
}
