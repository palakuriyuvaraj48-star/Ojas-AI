import { NextResponse } from "next/server";
import { computeRecovery, defaultSignals, generateWeeklyReview, HistoryPoint } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "weekly";

  // Build a stable synthetic history from the engine so the timeline is meaningful.
  const seed = defaultSignals();
  const build = (offset: number, baseScore: number, baseLoad: number, baseSleep: number, restDay: boolean): HistoryPoint => {
    const s = { ...seed };
    s.trainingLoad = restDay ? 10 : baseLoad;
    s.sleepDuration = baseSleep;
    s.sleepQuality = baseScore;
    const r = computeRecovery(s, { previousScore: baseScore });
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return {
      date: d.toISOString().split("T")[0],
      score: r.score,
      fatigue: r.fatigueLevel,
      trainingLoad: Math.round(s.trainingLoad),
      sleepDuration: s.sleepDuration,
      sleepQuality: Math.round(s.sleepQuality),
      restDay,
    };
  };

  const weekly: HistoryPoint[] = [
    build(6, 68, 60, 7.2, false),
    build(5, 74, 62, 7.4, false),
    build(4, 70, 55, 7.0, true),
    build(3, 82, 64, 7.8, false),
    build(2, 78, 50, 7.5, false),
    build(1, 85, 30, 8.0, true),
    build(0, 76, 58, 7.3, false),
  ];

  const monthly: HistoryPoint[] = Array.from({ length: 30 }, (_, i) => {
    const offset = 29 - i;
    const base = 60 + ((i * 7) % 25);
    const restDay = i % 6 === 5;
    return build(offset, base, restDay ? 12 : 55 + (i % 5) * 4, 6.8 + (i % 4) * 0.3, restDay);
  });

  const history = period === "weekly" ? weekly : monthly;
  const review = generateWeeklyReview(weekly);

  const mapTrend = (h: HistoryPoint[]) =>
    h.map((d) => ({ date: d.date, day: new Date(d.date).toLocaleDateString([], { weekday: "short" }), score: d.score }));

  return NextResponse.json({
    period,
    trend: mapTrend(history),
    recovery: mapTrend(history),
    sleep: history.map((d) => ({ date: d.date, duration: d.sleepDuration ?? 7, quality: d.sleepQuality ?? 80 })),
    fatigue: history.map((d) => ({ date: d.date, fatigue: d.fatigue })),
    trainingLoad: history.map((d) => ({ date: d.date, volume: d.trainingLoad ?? 55, intensity: Math.round((d.trainingLoad ?? 55) * 0.8) })),
    restDaysTaken: period === "weekly" ? 2 : 5,
    averageRecovery: review.averageRecovery,
    topRiskFactors: review.riskFactors,
    aiInsight: review.patterns.join(" "),
    weeklyReview: {
      patterns: review.patterns,
      improvements: review.improvements,
      actionItems: review.actionItems,
    },
  });
}
