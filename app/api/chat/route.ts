import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { idmTools } from "@/lib/idm/tools";
import { IDM_SYSTEM_PROMPT } from "@/lib/idm/spec";

export const maxDuration = 60;

const MODEL = process.env.IDM_MODEL || "anthropic/claude-sonnet-4.6";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages: UIMessage[]; data?: { formula?: string } };
    const { messages, data } = body;

    const formulaContext = data?.formula?.trim()
      ? `\n\n# Current editor contents\n\nThe user's editor currently contains:\n\n\`\`\`handlebars\n${data.formula}\n\`\`\`\n\nWhen they say "this formula" or "the formula", they mean the one above.`
      : "";

    const result = streamText({
      model: MODEL,
      system: IDM_SYSTEM_PROMPT + formulaContext,
      messages: await convertToModelMessages(messages),
      tools: idmTools,
      stopWhen: stepCountIs(15),
      onError: ({ error }) => {
        console.error("[/api/chat] streamText error:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[/api/chat] handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
