import { NextResponse } from "next/server";
import { buildCoachContext, parseIntent, generateCoachReply } from "@/lib/coach";
import { routePrompt } from "@/lib/coach/prompts";

export const runtime = "nodejs";

// One-shot personalised recommendation for a given category/context.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message: string = body.message || "Give me a recommendation";
    const ctx = buildCoachContext({
      profile: body.profile,
      dailyLog: body.dailyLog,
      logsHistory: body.logsHistory ?? [],
      checkInHistory: body.checkInHistory ?? [],
      macroTargets: body.macroTargets,
      calorieTargets: body.calorieTargets,
      metrics: body.metrics,
      recovery: body.recovery,
      memory: body.memory,
    });
    const parsed = parseIntent(message, ctx);
    const reply = generateCoachReply(message, ctx, parsed);
    const prompt = routePrompt(parsed.intent);

    return NextResponse.json({
      recommendation: reply.recommendation ?? null,
      text: reply.text,
      intent: parsed.intent,
      promptTemplate: prompt,
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, note: "POST a context + message to receive a recommendation." });
}
