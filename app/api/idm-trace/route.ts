import { evaluate } from "@/lib/idm/eval";
import { parseFormula, walk, type ASTNode } from "@/lib/idm/parser";

type AstSummary =
  | { id: string; kind: "string"; value: string; start: number; end: number }
  | { id: string; kind: "number"; value: number; start: number; end: number }
  | { id: string; kind: "field"; path: string; start: number; end: number }
  | {
      id: string;
      kind: "fn";
      name: string;
      args: AstSummary[];
      start: number;
      end: number;
    };

function summarizeAst(node: ASTNode): AstSummary {
  if (node.kind === "fn") {
    return {
      id: node.id,
      kind: "fn",
      name: node.name,
      start: node.start,
      end: node.end,
      args: node.args.map(summarizeAst),
    };
  }
  return { ...node } as AstSummary;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      data?: Record<string, unknown>;
    };
    if (!body.formula?.trim()) {
      return Response.json({ error: "formula is required" }, { status: 400 });
    }
    const parsed = parseFormula(body.formula);
    if (!parsed.ast || parsed.errors.length > 0) {
      return Response.json(
        { success: false, errors: parsed.errors },
        { status: 200 },
      );
    }
    const result = evaluate(parsed.ast, body.data ?? {});
    const trace: Record<string, unknown> = {};
    walk(parsed.ast, (n) => {
      const entry = result.trace.get(n.id);
      if (entry) {
        trace[n.id] = entry;
      }
    });
    return Response.json({
      success: true,
      ast: summarizeAst(parsed.ast),
      result: result.value,
      error: result.error,
      trace,
    });
  } catch (err) {
    console.error("[/api/idm-trace] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
