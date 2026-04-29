import { IDM_FUNCTIONS } from "@/lib/idm/spec";
import { extractFieldPaths } from "@/lib/idm/sample-data";

type Completion = {
  insertText: string;
  label: string;
  detail: string;
  kind: "function" | "field" | "literal";
  rank: number;
};

function lastWordAt(formula: string, pos: number): string {
  let i = Math.min(pos, formula.length);
  while (i > 0 && /[A-Za-z0-9_.]/.test(formula[i - 1])) i--;
  return formula.slice(i, pos);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      pos?: number;
      data?: Record<string, unknown>;
      limit?: number;
    };
    const formula = body.formula ?? "";
    const pos = typeof body.pos === "number" ? body.pos : formula.length;
    const limit = body.limit ?? 20;
    const prefix = lastWordAt(formula, pos);
    const lower = prefix.toLowerCase();

    const candidates: Completion[] = [];

    for (const fn of IDM_FUNCTIONS) {
      if (!prefix || fn.name.toLowerCase().startsWith(lower)) {
        candidates.push({
          insertText: fn.name,
          label: fn.name,
          detail: `fn arity ${fn.arity} · ${fn.signature}`,
          kind: "function",
          rank: prefix && fn.name.toLowerCase() === lower ? 100 : 80,
        });
      }
    }

    if (body.data && typeof body.data === "object") {
      const paths = extractFieldPaths(body.data as Record<string, unknown>);
      for (const path of paths) {
        if (!prefix || path.toLowerCase().includes(lower)) {
          const exact = path.toLowerCase().startsWith(lower);
          candidates.push({
            insertText: path,
            label: path,
            detail: "field",
            kind: "field",
            rank: exact ? 90 : 50,
          });
        }
      }
    }

    candidates.sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label));
    return Response.json({
      success: true,
      prefix,
      pos,
      completions: candidates.slice(0, limit),
    });
  } catch (err) {
    console.error("[/api/idm-complete] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
