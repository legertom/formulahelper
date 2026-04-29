import { diffAsts } from "@/lib/idm/diff";
import { parseFormula } from "@/lib/idm/parser";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      before?: string;
      after?: string;
    };
    if (!body.before?.trim() || !body.after?.trim()) {
      return Response.json(
        { error: "both `before` and `after` are required" },
        { status: 400 },
      );
    }
    const a = parseFormula(body.before);
    const b = parseFormula(body.after);
    if (!a.ast || a.errors.length > 0) {
      return Response.json(
        { success: false, side: "before", errors: a.errors },
        { status: 200 },
      );
    }
    if (!b.ast || b.errors.length > 0) {
      return Response.json(
        { success: false, side: "after", errors: b.errors },
        { status: 200 },
      );
    }
    const result = diffAsts(a.ast, b.ast);
    return Response.json({ success: true, ...result });
  } catch (err) {
    console.error("[/api/idm-diff] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
