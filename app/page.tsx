"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ChatPanel, type ChatPanelHandle } from "@/components/chat-panel";
import { FormulaEditor } from "@/components/formula-editor";
import { TestCasesPanel } from "@/components/test-cases";

export default function Page() {
  const [formula, setFormula] = useState("");
  const chatRef = useRef<ChatPanelHandle>(null);

  const onAskExplain = useCallback(() => {
    if (!formula.trim()) return;
    chatRef.current?.send(
      `Explain in plain English what this formula does:\n\n\`\`\`handlebars\n${formula}\n\`\`\``,
    );
  }, [formula]);

  const onFormulaSuggested = useCallback((next: string) => {
    setFormula(next);
  }, []);

  return (
    <main className="flex flex-col flex-1 min-h-0 bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            ƒ
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Formula Helper
            </h1>
            <p className="text-xs text-zinc-500">
              IDM formulas, AI-assisted • powered by AI Gateway + formulastudio.net
            </p>
          </div>
        </div>
        <Link
          href="/about"
          className="text-xs px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          About
        </Link>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-3 p-3">
        <div className="grid grid-rows-[1.2fr_1fr] gap-3 min-h-0">
          <FormulaEditor value={formula} onChange={setFormula} onAskExplain={onAskExplain} />
          <TestCasesPanel formula={formula} />
        </div>
        <ChatPanel ref={chatRef} formula={formula} onFormulaSuggested={onFormulaSuggested} />
      </div>
    </main>
  );
}
