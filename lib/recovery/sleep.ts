import { RecoverySignals } from "./types";

export interface SleepAnalysis {
  durationHours: number;
  quality: number;
  consistency: number;
  sleepDebt: number;
  weeklyAverageHours: number;
  deepSleepHours: number;
  remSleepHours: number;
  bedtime: string;
  wakeTime: string;
  aiInsight: string;
  weeklyTrend: "Improving" | "Stable" | "Declining";
  recommendations: string[];
}

const BEDTIME = "22:30";
const WAKETIME = "06:45";

export function analyzeSleep(
  signals: RecoverySignals,
  history: { date: string; sleepDuration: number; sleepQuality: number }[] = []
): SleepAnalysis {
  const durationHours = signals.sleepDuration;
  const quality = Math.round(signals.sleepQuality);
  const consistency = Math.round(signals.sleepConsistency);
  const sleepDebt = Math.round(signals.sleepDebt * 10) / 10;

  const recent = history.slice(-7);
  const weeklyAverageHours = recent.length
    ? Math.round(avg(recent.map((h) => h.sleepDuration)) * 10) / 10
    : Math.round(durationHours * 10) / 10;

  const deepSleepHours = Math.round(durationHours * 0.18 * 10) / 10; // ~18% deep
  const remSleepHours = Math.round(durationHours * 0.22 * 10) / 10; // ~22% REM

  let trend: SleepAnalysis["weeklyTrend"] = "Stable";
  if (recent.length >= 2) {
    const first = avg(recent.slice(0, 3).map((h) => h.sleepQuality));
    const last = avg(recent.slice(-3).map((h) => h.sleepQuality));
    if (last - first >= 5) trend = "Improving";
    else if (first - last >= 5) trend = "Declining";
  }

  const recs: string[] = [];
  if (durationHours < 7) recs.push("Aim for 30-45 min earlier bedtime to reach 7.5h.");
  if (quality < 75) recs.push("Reduce screen time 60 min before bed to lift sleep quality.");
  if (consistency < 80) recs.push("Keep a fixed wake time — consistency beats total hours.");
  if (sleepDebt > 2) recs.push(`Pay down ${sleepDebt}h of sleep debt with an earlier night this week.`);
  if (recs.length === 0) recs.push("Maintain your current schedule — sleep architecture looks healthy.");

  const insight = buildSleepInsight(durationHours, quality, consistency, trend, sleepDebt);

  return {
    durationHours: Math.round(durationHours * 10) / 10,
    quality,
    consistency,
    sleepDebt,
    weeklyAverageHours,
    deepSleepHours,
    remSleepHours,
    bedtime: BEDTIME,
    wakeTime: WAKETIME,
    aiInsight: insight,
    weeklyTrend: trend,
    recommendations: recs.slice(0, 4),
  };
}

function buildSleepInsight(
  dur: number,
  quality: number,
  consistency: number,
  trend: SleepAnalysis["weeklyTrend"],
  debt: number
): string {
  const bits: string[] = [];
  bits.push(
    `You averaged ${dur.toFixed(1)}h of sleep at ${quality}% quality${trend !== "Stable" ? `, trend ${trend.toLowerCase()}` : ""}.`
  );
  if (consistency < 80) bits.push(`Bedtime consistency is ${consistency}% — locking a fixed wake time would sharpen your circadian rhythm.`);
  if (debt > 2) bits.push(`A ${debt.toFixed(1)}h sleep debt is lowering next-day recovery; protect one earlier night.`);
  if (quality >= 80 && consistency >= 80) bits.push("Sleep architecture is strong — this is a key driver of your recovery score.");
  return bits.join(" ");
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
