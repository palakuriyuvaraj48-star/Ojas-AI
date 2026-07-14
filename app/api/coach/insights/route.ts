import { NextResponse } from "next/server";
import { buildCoachContext, generateInsights } from "@/lib/coach";

export const runtime = "nodejs";

// Insights from history (why progress/recovery/weight/strength changed).
export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    const insights = generateInsights(ctx);
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
