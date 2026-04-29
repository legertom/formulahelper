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
import { FlavorPicker } from "@/components/flavor-picker";
import { useFlavor } from "@/components/flavor-provider";
import { FLAVORS } from "@/lib/themes";
import {
  EXAMPLE_FORMULAS,
  SAMPLE_PERSONAS,
  SAMPLE_PERSONAS_BY_ID,
  SAMPLE_RECORD_JSON,
} from "@/lib/idm/sample-data";
import { buildShareUrl, decodeShare } from "@/lib/share";
import { useHistory } from "@/lib/use-history";

type TabId = "data" | "fields" | "examples" | "trace";

type TabDef = { id: TabId; n: string; label: string; emoji: string; hint: string };

const TABS: TabDef[] = [
  { id: "data", n: "01", label: "data", emoji: "📋", hint: "Pick a student to test against" },
  { id: "fields", n: "02", label: "fields", emoji: "🧩", hint: "Click a field to insert it" },
  { id: "examples", n: "03", label: "examples", emoji: "✨", hint: "Start from a working pattern" },
  { id: "trace", n: "04", label: "trace", emoji: "🔍", hint: "See how each piece evaluates" },
];

export default function Page() {
  const [formula, setFormula] = useState(EXAMPLE_FORMULAS[0].formula);
  const [dataJson, setDataJson] = useState(SAMPLE_RECORD_JSON);
  const [activePersonaId, setActivePersonaId] = useState<string>("maria-7");
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const [shareLabel, setShareLabel] = useState("share");
  const [restoredFromHash, setRestoredFromHash] = useState(false);
  const chatRef = useRef<ChatPanelHandle>(null);

  const { flavor } = useFlavor();
  const meta = FLAVORS[flavor];
  const history = useHistory(formula);

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
      history.push(formula, "edit");
      setFormula(formatted);
      history.push(formatted, "format");
    },
    [formula, history],
  );

  const onRestoreHistory = useCallback(
    (next: string) => {
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
      setShareLabel(flavor === "edtech" ? "copied 🎉" : "copied ✓");
    } catch {
      setShareLabel("copy failed");
    }
    setTimeout(() => setShareLabel("share"), 1800);
    if (typeof window !== "undefined") {
      const next = url.split("#")[1];
      if (next) window.history.replaceState(null, "", `#${next}`);
    }
  }, [formula, dataJson, activeTab, flavor]);

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

  // Flavor-shaped chrome
  const isSwiss = flavor === "swiss";
  const isEdtech = flavor === "edtech";

  return (
    <main className="flex flex-col flex-1 min-h-0 bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-canvas-grid pointer-events-none" />

      <header
        className={`relative shrink-0 flex items-center gap-3 ${
          isSwiss
            ? "px-8 py-5 border-b border-foreground"
            : isEdtech
              ? "px-6 py-4"
              : "border-b border-border bg-background/90 backdrop-blur-[2px] px-4 h-11 text-[12px]"
        }`}
      >
        <BrandMark flavor={flavor} />
        {!isSwiss && !isEdtech && (
          <>
            <span className="text-border">│</span>
            <span className="text-muted-foreground/80 hidden sm:inline text-[12px]">idm studio</span>
            <span className="text-border hidden sm:inline">│</span>
            <span className="text-muted-foreground/60 hidden md:inline text-[12px]">
              v0.4 · ai-sdk · gateway
            </span>
          </>
        )}

        <span className={`ml-auto flex items-center gap-1.5 ${isSwiss ? "text-[12px] uppercase tracking-[0.18em]" : "text-[12px]"}`}>
          <a
            href="https://formulastudio.net"
            target="_blank"
            rel="noreferrer"
            className={navLinkClass(flavor)}
          >
            studio ↗
          </a>
          <a
            href="https://github.com/legertom/formulahelper"
            target="_blank"
            rel="noreferrer"
            className={navLinkClass(flavor)}
          >
            github
          </a>
          <Link href="/about" className={navLinkClass(flavor)}>
            about
          </Link>
          <span className={isSwiss ? "mx-1 text-foreground/40" : "mx-1 text-border"}>│</span>
          <FlavorPicker />
          <ThemeToggle />
        </span>
      </header>

      {meta.features.showHero && (
        <Hero flavor={flavor} />
      )}

      <div
        className={`relative flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] overflow-hidden ${
          isSwiss ? "border-b border-foreground" : isEdtech ? "gap-4 px-4 pb-4 pt-3" : ""
        }`}
      >
        <section
          className={`flex flex-col min-h-0 overflow-hidden ${
            isSwiss
              ? "border-r border-foreground"
              : isEdtech
                ? "gap-4"
                : "border-r border-border"
          }`}
        >
          <div
            className={`min-h-0 overflow-hidden ${
              isEdtech
                ? "flex-[1.1] rounded-2xl shadow-sm"
                : isSwiss
                  ? "flex-[1.1] border-b border-foreground"
                  : "flex-[1.15] border-b border-border"
            }`}
          >
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

          <div className={isEdtech ? "rounded-2xl overflow-hidden" : ""}>
            <ResultStrip formula={formula} data={parsedData ?? {}} />
          </div>

          <div
            className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
              isEdtech ? "rounded-2xl bg-card border border-border shadow-sm" : "bg-card"
            }`}
          >
            <TabBar
              flavor={flavor}
              tabs={TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
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

        <section
          className={`min-h-0 flex flex-col overflow-hidden ${
            isEdtech ? "rounded-2xl shadow-sm" : ""
          }`}
        >
          <ChatPanel ref={chatRef} formula={formula} onFormulaSuggested={onAcceptAiFormula} />
        </section>
      </div>

      {meta.features.showFooter && (
        <footer className="shrink-0 px-8 py-4 flex items-baseline justify-between text-[10px] uppercase tracking-[0.22em] text-muted-foreground bg-background">
          <span>Formula Studio · 2026</span>
          <span>
            Built on{" "}
            <a href="https://formulastudio.net" className="hover:text-foreground">
              formulastudio.net
            </a>
          </span>
        </footer>
      )}
    </main>
  );
}

function navLinkClass(flavor: string): string {
  if (flavor === "swiss") {
    return "hover:text-[var(--accent-rule)] transition";
  }
  if (flavor === "edtech") {
    return "px-3 py-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition";
  }
  return "h-7 px-2 border border-foreground/25 bg-background hover:bg-foreground/10 hover:border-foreground/50 text-foreground transition rounded-sm flex items-center";
}

function BrandMark({ flavor }: { flavor: string }) {
  if (flavor === "swiss") {
    return (
      <Link href="/" className="flex items-baseline gap-3">
        <span className="text-[28px] font-bold tracking-tight leading-none">
          Formula
          <span className="text-[var(--accent-rule)]">.</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Studio · v0.4
        </span>
      </Link>
    );
  }
  if (flavor === "edtech") {
    return (
      <Link href="/" className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--accent-rule)] grid place-items-center text-white text-lg font-bold shadow-md shadow-[var(--primary)]/20">
          ƒ
        </span>
        <span>
          <span className="block text-base font-bold tracking-tight text-foreground">
            Formula Helper
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Build IDM formulas, no stress.
          </span>
        </span>
      </Link>
    );
  }
  return (
    <Link href="/" className="flex items-center gap-2 min-w-0 text-[12px]">
      <span className="text-[var(--accent-rule)] text-base leading-none">ƒ</span>
      <span className="font-medium text-foreground tracking-tight">formula-helper</span>
    </Link>
  );
}

function Hero({ flavor }: { flavor: string }) {
  if (flavor === "swiss") {
    return (
      <div className="shrink-0 px-8 py-4 md:py-6 border-b border-foreground grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-9">
          <h1 className="text-[32px] md:text-[44px] xl:text-[56px] leading-[0.95] tracking-tight font-bold">
            Identity formulas,
            <br />
            written precisely.
          </h1>
        </div>
        <div className="col-span-12 md:col-span-3 text-[13px] leading-relaxed text-muted-foreground">
          A workbench for the IDM formula language.
          <br />
          Compose. Validate. Explain. Test against {SAMPLE_PERSONAS.length} personas.
        </div>
      </div>
    );
  }
  // edtech friendly
  return (
    <div className="shrink-0 relative px-6 pb-3 flex items-baseline justify-between flex-wrap gap-3">
      <div>
        <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-foreground leading-tight">
          Hi! Let&rsquo;s build a formula. 👋
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1 max-w-xl">
          Describe what you want in plain English, paste an existing formula, or start from
          an example. Test against {SAMPLE_PERSONAS.length} students with one click.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground bg-card border border-border rounded-full px-4 py-1.5 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-[var(--accent-rule)]" aria-hidden />
        {SAMPLE_PERSONAS.length} personas · 27 examples · live trace
      </div>
    </div>
  );
}

function TabBar({
  flavor,
  tabs,
  activeTab,
  onChange,
}: {
  flavor: string;
  tabs: TabDef[];
  activeTab: TabId;
  onChange: (id: TabId) => void;
}) {
  if (flavor === "edtech") {
    const activeHint = tabs.find((t) => t.id === activeTab)?.hint ?? "";
    return (
      <div className="flex items-stretch gap-1 p-1.5 bg-muted/40 border-b border-border overflow-x-auto">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] transition ${
                active
                  ? "bg-[var(--primary)] text-white shadow-sm shadow-[var(--primary)]/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
              title={t.hint}
            >
              <span className="text-[13px]">{t.emoji}</span>
              <span className="font-medium capitalize">{t.label}</span>
            </button>
          );
        })}
        <span className="ml-auto self-center pr-3 text-[11px] text-muted-foreground hidden md:inline">
          {activeHint}
        </span>
      </div>
    );
  }
  if (flavor === "swiss") {
    return (
      <div className="flex items-stretch border-b border-foreground bg-background">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={`px-5 py-3 text-[11px] uppercase tracking-[0.2em] border-r border-foreground transition relative flex items-baseline gap-2 ${
                active
                  ? "text-foreground bg-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-[var(--accent-rule)] font-mono text-[10px]">{t.n}</span>
              <span className="capitalize">{t.label}</span>
              {active && (
                <span className="absolute left-0 right-0 bottom-[-1px] h-[3px] bg-[var(--accent-rule)]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }
  // terminal
  return (
    <div className="flex items-stretch h-8 border-b border-border bg-muted/20">
      {tabs.map((t) => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`px-3 text-[11.5px] uppercase tracking-wider border-r border-border transition relative ${
              active
                ? "text-foreground bg-background"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute left-0 right-0 bottom-[-1px] h-[1px] bg-[var(--accent-rule)]" />
            )}
          </button>
        );
      })}
      <span className="ml-auto self-center pr-3 text-[10.5px] text-muted-foreground/50 hidden sm:inline">
        {SAMPLE_PERSONAS.length} personas · click field to insert
      </span>
    </div>
  );
}
