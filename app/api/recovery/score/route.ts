import { NextResponse } from "next/server";
import { computeRecovery, defaultSignals } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "today";

  const signals = defaultSignals();

  if (action === "today") {
    const result = computeRecovery(signals, { previousScore: 72 });

    return NextResponse.json({
      score: result.score,
      readiness: result.readiness,
      confidence: result.confidence,
      trend: result.trend,
      explanation: result.explanation,
      fatigueLevel: result.fatigueLevel,
      muscleReadiness: result.muscleReadiness.map((m) => ({
        muscle: m.muscle,
        readiness: m.readiness,
        soreness: m.soreness,
      })),
      sleepDuration: signals.sleepDuration,
      sleepQuality: Math.round(signals.sleepQuality),
      hrv: signals.hrv,
      restingHR: signals.restingHR,
      trainingLoad: signals.trainingLoad,
      consecutiveDays: signals.consecutiveTrainingDays,
      hydration: signals.hydrationLiters,
      nutritionConsistency: Math.round(signals.nutritionConsistency),
      recommendation: result.recommendation,
    });
  }

  if (action === "history") {
    const history = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const s = defaultSignals();
      s.sleepDuration = 6.8 + (i % 3) * 0.4;
      const r = computeRecovery(s, { previousScore: 70 });
      return {
        date: d.toISOString().split("T")[0],
        score: r.score,
        readiness: r.readiness,
        sleepDuration: r.signals.find((x) => x.label === "Sleep Duration")?.detail ?? "7h",
        sleepQuality: Math.round(s.sleepQuality),
        fatigueLevel: r.fatigueLevel,
        trainingLoad: Math.round(s.trainingLoad),
      };
    });
    return NextResponse.json({ history });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
