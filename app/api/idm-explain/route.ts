import { explainAst } from "@/lib/idm/explain";
import { parseFormula } from "@/lib/idm/parser";

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
    const explanation = explainAst(parsed.ast);
    return Response.json({
      success: true,
      ...explanation,
    });
  } catch (err) {
    console.error("[/api/idm-explain] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
