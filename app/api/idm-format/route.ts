import { formatFormula } from "@/lib/idm/client";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      formula?: string;
      pretty?: boolean;
      canonicalize?: boolean;
    };
    if (!body.formula?.trim()) {
      return Response.json({ error: "formula is required" }, { status: 400 });
    }
    const result = await formatFormula(body.formula, {
      pretty: body.pretty,
      canonicalize: body.canonicalize,
    });
    return Response.json(result);
  } catch (err) {
    console.error("[/api/idm-format] error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
