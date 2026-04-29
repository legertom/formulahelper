import { evaluate } from "@/lib/idm/eval";
import { parseFormula, walk } from "@/lib/idm/parser";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      records?: Array<{ name?: string; data: Record<string, unknown> }>;
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
    const parsed = parseFormula(body.formula);
    if (!parsed.ast || parsed.errors.length > 0) {
      return Response.json(
        { success: false, errors: parsed.errors },
        { status: 200 },
      );
    }

    const ifNodeIds: Array<{ id: string; start: number; end: number }> = [];
    walk(parsed.ast, (n) => {
      if (n.kind === "fn" && n.name === "if") {
        ifNodeIds.push({ id: n.id, start: n.start, end: n.end });
      }
    });

    const coverage: Record<string, { true: number; false: number }> = {};
    for (const node of ifNodeIds) {
      coverage[node.id] = { true: 0, false: 0 };
    }

    const recordResults: Array<{
      name: string;
      output: unknown;
      error?: string;
    }> = [];

    for (let i = 0; i < body.records.length; i++) {
      const r = body.records[i];
      const name = r.name ?? `record ${i + 1}`;
      const result = evaluate(parsed.ast, r.data ?? {});
      recordResults.push({ name, output: result.value, error: result.error });
      for (const node of ifNodeIds) {
        const entry = result.trace.get(node.id);
        if (!entry || entry.branchTaken === undefined) continue;
        if (entry.branchTaken === 1) coverage[node.id].true++;
        else if (entry.branchTaken === 2) coverage[node.id].false++;
      }
    }

    const unreachable = ifNodeIds
      .filter(
        (n) =>
          coverage[n.id].true + coverage[n.id].false > 0 &&
          (coverage[n.id].true === 0 || coverage[n.id].false === 0),
      )
      .map((n) => ({
        nodeId: n.id,
        start: n.start,
        end: n.end,
        emptyBranch: coverage[n.id].true === 0 ? "true" : "false",
      }));

    return Response.json({
      success: true,
      records: body.records.length,
      ifNodes: ifNodeIds.length,
      coverage,
      results: recordResults,
      unreachableBranches: unreachable,
    });
  } catch (err) {
    console.error("[/api/idm-coverage] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
