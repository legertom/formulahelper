import { FIELD_DOMAINS } from "@/lib/idm/fields-domains";

export async function GET(
  _req: Request,
  context: { params: Promise<{ domain: string }> },
) {
  const { domain } = await context.params;
  if (domain === "_all") {
    return Response.json({
      success: true,
      domains: Object.values(FIELD_DOMAINS).map((d) => ({
        id: d.id,
        label: d.label,
        description: d.description,
        fieldCount: d.fields.length,
      })),
    });
  }
  const found = FIELD_DOMAINS[domain];
  if (!found) {
    return Response.json(
      {
        error: `unknown domain: ${domain}`,
        available: Object.keys(FIELD_DOMAINS),
      },
      { status: 404 },
    );
  }
  return Response.json({ success: true, ...found });
}
