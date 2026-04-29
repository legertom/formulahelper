"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAskExplain: () => void;
};

export function FormulaEditor({ value, onChange, onAskExplain }: Props) {
  return (
    <div className="flex flex-col h-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Formula
          </span>
          <span className="text-xs text-zinc-400 font-mono">.idm</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAskExplain}
            disabled={!value.trim()}
            className="text-xs px-2.5 py-1 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            Explain in plain English
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!value}
            className="text-xs px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-40 transition"
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder='{{if equals school_name "A" "Group A" "uncategorized"}}'
        className="flex-1 p-4 font-mono text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 resize-none focus:outline-none"
      />
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-500">
        Prefix notation. Wrap in <code className="font-mono">{"{{ ... }}"}</code>. No parentheses
        or commas.
      </div>
    </div>
  );
}
