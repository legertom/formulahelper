"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel, type ChatPanelHandle } from "@/components/chat-panel";
import { ExamplesPanel } from "@/components/examples-panel";
import { FieldsPanel } from "@/components/fields-panel";
import { FormulaEditor } from "@/components/formula-editor";
import { ResultStrip } from "@/components/result-strip";
import { SampleDataPanel } from "@/components/sample-data-panel";
import { SAMPLE_RECORD_JSON, EXAMPLE_FORMULAS } from "@/lib/idm/sample-data";

export default function Page() {
  const [formula, setFormula] = useState(EXAMPLE_FORMULAS[0].formula);
  const [dataJson, setDataJson] = useState(SAMPLE_RECORD_JSON);
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
    setFormula((current) => {
      const insertion = current.includes("{{") ? path : `{{${path}}}`;
      return current ? `${current} ${path}` : insertion;
    });
  }, []);

  return (
    <main className="flex flex-col flex-1 min-h-0 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/30">
      <header className="border-b bg-background/70 backdrop-blur-sm px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 grid place-items-center text-white text-sm font-bold shadow-sm shadow-emerald-500/20">
            ƒ
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              Formula Helper
              <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
                IDM · AI-assisted
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              Build, validate, and explain Identity Management formulas — backed by{" "}
              <a
                href="https://formulastudio.net"
                className="underline decoration-dotted hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                formulastudio.net
              </a>
              .
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="https://github.com/legertom/formulahelper"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-xs")}
          >
            GitHub
          </a>
          <Link
            href="/about"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs")}
          >
            About
          </Link>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-3 p-3">
        <section className="flex flex-col gap-3 min-h-0">
          <div className="flex-[1.1] min-h-[180px]">
            <FormulaEditor value={formula} onChange={setFormula} onAskExplain={onAskExplain} />
          </div>
          <ResultStrip formula={formula} data={parsedData ?? {}} />
          <div className="flex-1 min-h-[220px]">
            <Tabs defaultValue="data" className="h-full flex flex-col rounded-xl border bg-card overflow-hidden gap-0">
              <TabsList className="rounded-none bg-muted/40 border-b h-9 p-0 px-1 justify-start gap-0">
                <TabsTrigger value="data" className="text-xs h-8 rounded-none data-[state=active]:bg-background">
                  Sample data
                </TabsTrigger>
                <TabsTrigger value="fields" className="text-xs h-8 rounded-none data-[state=active]:bg-background">
                  Fields
                </TabsTrigger>
                <TabsTrigger value="examples" className="text-xs h-8 rounded-none data-[state=active]:bg-background">
                  Examples
                </TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="flex-1 min-h-0 m-0 outline-none">
                <SampleDataPanel json={dataJson} onChange={setDataJson} />
              </TabsContent>
              <TabsContent value="fields" className="flex-1 min-h-0 m-0 outline-none">
                <FieldsPanel data={parsedData} onInsert={onInsertField} />
              </TabsContent>
              <TabsContent value="examples" className="flex-1 min-h-0 m-0 outline-none">
                <ExamplesPanel onLoad={setFormula} />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="min-h-0">
          <ChatPanel ref={chatRef} formula={formula} onFormulaSuggested={setFormula} />
        </section>
      </div>
    </main>
  );
}
