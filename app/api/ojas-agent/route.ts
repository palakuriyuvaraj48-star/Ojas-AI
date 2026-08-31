import { NextResponse } from "next/server";
import { runOjasAgent } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, language = "en", conversationHistory = [], context = {} } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    const agentResult = await runOjasAgent({
      query,
      language,
      conversationHistory,
      context,
    });

    return NextResponse.json(agentResult, { status: 200 });
  } catch (err: any) {
    console.error("[API /api/ojas-agent] Error handling agent request:", err);
    return NextResponse.json(
      {
        intent: "error",
        response: "I encountered an error processing your request. Please try again.",
        responseLanguage: "en",
        toolCallsExecuted: [],
        provider: "deterministic-fallback",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
