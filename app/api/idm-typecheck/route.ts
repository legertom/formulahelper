import { parseFormula, walk } from "@/lib/idm/parser";

type FieldIssue = {
  path: string;
  start: number;
  end: number;
  reason: "missing" | "type-mismatch";
  expected?: string;
  found?: string;
};

function getAtPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function pathExistsIn(schema: unknown, path: string): boolean {
  const parts = path.split(".");
  let cursor: unknown = schema;
  for (const p of parts) {
    if (cursor === null || cursor === undefined || typeof cursor !== "object") {
      return false;
    }
    if (Array.isArray(cursor)) return false;
    if (!(p in (cursor as Record<string, unknown>))) return false;
    cursor = (cursor as Record<string, unknown>)[p];
  }
  return true;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      schema?: unknown;
    };
    if (!body.formula?.trim()) {
      return Response.json({ error: "formula is required" }, { status: 400 });
    }
    if (!body.schema || typeof body.schema !== "object") {
      return Response.json(
        { error: "schema is required and must be an object (a sample record works)" },
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

    const issues: FieldIssue[] = [];
    const fieldRefs = new Set<string>();

    walk(parsed.ast, (n) => {
      if (n.kind === "field") {
        fieldRefs.add(n.path);
        if (!pathExistsIn(body.schema, n.path)) {
          issues.push({
            path: n.path,
            start: n.start,
            end: n.end,
            reason: "missing",
          });
        }
      }
    });

    return Response.json({
      success: true,
      fieldsReferenced: Array.from(fieldRefs).sort(),
      issues,
      ok: issues.length === 0,
    });
  } catch (err) {
    console.error("[/api/idm-typecheck] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
