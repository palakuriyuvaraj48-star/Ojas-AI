import { NextResponse } from "next/server";
import { analyzeSleep, defaultSignals } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "today";

  const signals = defaultSignals();

  if (action === "today") {
    const a = analyzeSleep(signals);
    return NextResponse.json({
      duration: `${Math.floor(a.durationHours)}h ${Math.round((a.durationHours % 1) * 60)}m`,
      quality: a.quality,
      sleepDebt: `${a.sleepDebt.toFixed(1)}h`,
      weeklyAverage: `${Math.floor(a.weeklyAverageHours)}h ${Math.round((a.weeklyAverageHours % 1) * 60)}m`,
      consistency: a.consistency,
      deepSleep: `${Math.floor(a.deepSleepHours)}h ${Math.round((a.deepSleepHours % 1) * 60)}m`,
      remSleep: `${Math.floor(a.remSleepHours)}h ${Math.round((a.remSleepHours % 1) * 60)}m`,
      bedtime: a.bedtime,
      wakeTime: a.wakeTime,
      aiInsight: a.aiInsight,
      weeklyTrend: a.weeklyTrend,
      recommendations: a.recommendations,
    });
  }

  if (action === "history") {
    const history = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const s = defaultSignals();
      s.sleepDuration = 6.6 + (i % 4) * 0.35;
      const a = analyzeSleep(s);
      return {
        date: d.toISOString().split("T")[0],
        duration: a.durationHours,
        quality: a.quality,
        deepSleep: Math.round(a.deepSleepHours * 60),
        remSleep: Math.round(a.remSleepHours * 60),
      };
    });
    return NextResponse.json({ history });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
