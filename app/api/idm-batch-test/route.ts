import { evaluate } from "@/lib/idm/eval";
import { parseFormula } from "@/lib/idm/parser";

const MAX_RECORDS = 5000;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      records?: Array<{
        name?: string;
        data: Record<string, unknown>;
        expected?: string;
      }>;
    };
    if (!body.formula?.trim()) {
      return Response.json({ error: "formula is required" }, { status: 400 });
    }
    if (!Array.isArray(body.records) || body.records.length === 0) {
      return Response.json(
        { error: "records must be a non-empty array" },
        { status: 400 },
      );
    }
    if (body.records.length > MAX_RECORDS) {
      return Response.json(
        { error: `too many records (max ${MAX_RECORDS})` },
        { status: 413 },
      );
    }

    const parsed = parseFormula(body.formula);
    if (!parsed.ast || parsed.errors.length > 0) {
      return Response.json(
        { success: false, errors: parsed.errors },
        { status: 200 },
      );
    }

    const t0 = performance.now();
    const results = body.records.map((r, i) => {
      const name = r.name ?? `record ${i + 1}`;
      const result = evaluate(parsed.ast!, r.data ?? {});
      const output = result.value;
      const passed =
        r.expected === undefined ? null : String(output) === String(r.expected);
      return { name, output, expected: r.expected, passed, error: result.error };
    });
    const elapsed = Math.round(performance.now() - t0);

    const compared = results.filter((r) => r.passed !== null);
    const passCount = compared.filter((r) => r.passed === true).length;
    const failCount = compared.length - passCount;

    const outputs = new Map<string, number>();
    for (const r of results) {
      const key = String(r.output);
      outputs.set(key, (outputs.get(key) ?? 0) + 1);
    }
    const distribution = Array.from(outputs.entries())
      .map(([output, count]) => ({ output, count }))
      .sort((a, b) => b.count - a.count);

    return Response.json({
      success: true,
      count: results.length,
      compared: compared.length,
      passCount,
      failCount,
      elapsedMs: elapsed,
      distribution,
      results,
    });
  } catch (err) {
    console.error("[/api/idm-batch-test] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
