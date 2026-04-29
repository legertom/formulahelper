import { testFormula, type TestCase } from "@/lib/idm/client";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { formula?: string; cases?: TestCase[] };
    if (!body.formula?.trim()) {
      return Response.json({ error: "formula is required" }, { status: 400 });
    }
    if (!Array.isArray(body.cases) || body.cases.length === 0) {
      return Response.json({ error: "cases must be a non-empty array" }, { status: 400 });
    }
    const result = await testFormula(body.formula, body.cases);
    return Response.json(result);
  } catch (err) {
    console.error("[/api/idm-test] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
