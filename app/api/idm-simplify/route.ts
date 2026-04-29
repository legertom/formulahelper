import { parseFormula } from "@/lib/idm/parser";
import { serializeFormula } from "@/lib/idm/serialize";
import { simplifyAst } from "@/lib/idm/simplify";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { formula?: string };
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
    const { ast, notes } = simplifyAst(parsed.ast);
    const formula = serializeFormula(ast);
    return Response.json({
      success: true,
      formula,
      changed: formula !== body.formula.trim(),
      notes,
    });
  } catch (err) {
    console.error("[/api/idm-simplify] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
