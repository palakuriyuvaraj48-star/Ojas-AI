import { NextResponse } from "next/server";
import { buildCoachContext, generateDailyPlan, generateWeeklyReview, generateMonthlyReview } from "@/lib/coach";
import {
  detectAndApplyScenario,
  generateOrAdaptPlan,
  buildAdaptationContext,
} from "@/lib/adaptive-engine/integration";
import { createInitialTwin, updateTwinFromLogs } from "@/lib/digital-twin";

export const runtime = "nodejs";

// Generate daily / weekly / monthly plans from context.
// Enhanced to support adaptive fitness planning with Digital Twin.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type: "daily" | "weekly" | "monthly" | "adaptive" = body.type || "daily";
    const userId = body.userId || "default-user";

    // Build traditional coach context for daily/weekly/monthly plans
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

    // If adaptive planning is requested, use Digital Twin + Adaptive Engine
    if (type === "adaptive") {
      try {
        // Get or create Digital Twin
        let currentTwin = body.currentTwin;
        if (!currentTwin) {
          currentTwin = createInitialTwin(body.profile, userId);
        }

        // Update twin with recent logs if available
        if (body.logsHistory && body.logsHistory.length > 0) {
          const { updatedTwin } = updateTwinFromLogs(
            currentTwin,
            body.logsHistory.slice(-7), // last 7 days
            body.checkInHistory ?? []
          );
          currentTwin = updatedTwin;
        }

        // Check for scenario changes if input provided
        if (body.scenarioInput) {
          const scenarioResult = await detectAndApplyScenario(
            currentTwin,
            body.scenarioInput
          );
          if (scenarioResult.changesDetected) {
            currentTwin = scenarioResult.updatedTwin;
          }
        }

        // Generate or adapt the fitness plan
        const planResult = await generateOrAdaptPlan(
          body.profile,
          currentTwin,
          body.previousTwin ?? null,
          body.currentPlan ?? null
        );

        return NextResponse.json({
          type: "adaptive",
          success: true,
          plan: planResult.plan,
          isAdapted: planResult.isAdapted,
          explanation: planResult.explanation,
          currentTwin,
          previousTwin: body.previousTwin ?? null,
        });
      } catch (adaptError) {
        console.error("Adaptive planning error:", adaptError);
        // Fall back to traditional planning
        return NextResponse.json({
          type: "adaptive",
          success: false,
          error: "Adaptive planning failed, using traditional plan",
          plan: generateDailyPlan(ctx),
        });
      }
    }

    // Traditional planning paths
    const plan =
      type === "weekly"
        ? generateWeeklyReview(ctx)
        : type === "monthly"
          ? generateMonthlyReview(ctx)
          : generateDailyPlan(ctx);

    return NextResponse.json({ type, plan, success: true });
  } catch (err) {
    console.error("Plans route error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
