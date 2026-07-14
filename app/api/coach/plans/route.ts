import { NextResponse } from "next/server";
import { buildCoachContext, generateDailyPlan, generateWeeklyReview, generateMonthlyReview } from "@/lib/coach";

export const runtime = "nodejs";

// Generate daily / weekly / monthly plans from context.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type: "daily" | "weekly" | "monthly" = body.type || "daily";
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

    const plan =
      type === "weekly" ? generateWeeklyReview(ctx) : type === "monthly" ? generateMonthlyReview(ctx) : generateDailyPlan(ctx);

    return NextResponse.json({ type, plan });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
