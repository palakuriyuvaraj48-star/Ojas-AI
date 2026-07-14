import { RecoveryResult, RecoverySignals } from "./types";

// ---------- Recovery Budget ----------
// Balances the day's finite recovery "energy" across training, sleep, stress and time.

export interface RecoveryBudget {
  total: number; // available recovery energy (mirrors recovery score)
  allocations: {
    training: number; // energy you can spend on training today
    sleep: number; // energy reserved for sleep repair
    stress: number; // energy lost to stress
    time: number; // energy available given free time
  };
  balance: number; // 0-100 how well-balanced the day is
  advice: string[];
}

export function computeRecoveryBudget(result: RecoveryResult, input: RecoverySignals, freeTimeMinutes: number): RecoveryBudget {
  const total = result.score;
  // Training capacity shrinks with fatigue & soreness.
  const training = clamp(total - result.fatigueLevel * 0.4, 0, 100);
  // Sleep repair demand rises with sleep debt.
  const sleep = clamp(60 + input.sleepDebt * 12 + (100 - input.sleepConsistency) * 0.3, 0, 100);
  // Stress drains budget.
  const stress = clamp(input.stressLevel, 0, 100);
  // Time available scales capacity.
  const timeScore = clamp((freeTimeMinutes / 120) * 100, 0, 100);
  const time = timeScore;

  const balance = clamp(Math.round((training * 0.4 + (100 - stress) * 0.3 + timeScore * 0.15 + (100 - sleep) * 0.15)));

  const advice: string[] = [];
  if (training < 50) advice.push("Limit training to low intensity — your recovery budget is tight.");
  if (sleep > 70) advice.push("Prioritise 30+ min earlier bedtime to pay down sleep debt.");
  if (stress > 60) advice.push("Add a 10-min breathing block; stress is draining your budget.");
  if (time < 40) advice.push("Short on time — favour a 10-min mobility flow over a long session.");
  if (advice.length === 0) advice.push("Budget is balanced. You can train and still recover well.");

  return { total, allocations: { training, sleep, stress, time }, balance, advice };
}

// ---------- Recovery Decision Engine ----------
// Explains *why* today's recommendation differs from yesterday's.

export interface DecisionDelta {
  factor: string;
  change: number; // +/- points of recovery
  direction: "improved" | "worsened" | "unchanged";
  note: string;
}

export interface DecisionExplanation {
  todayDecision: string;
  yesterdayDecision?: string;
  changed: boolean;
  deltas: DecisionDelta[];
  summary: string;
}

export function explainDecision(
  today: RecoveryResult,
  todaySignals: RecoverySignals,
  yesterday?: { result: RecoveryResult; signals: RecoverySignals }
): DecisionExplanation {
  const deltas: DecisionDelta[] = [];
  if (yesterday) {
    const pairs: [string, number, number, string][] = [
      ["Sleep Duration", todaySignals.sleepDuration, yesterday.signals.sleepDuration, "h"],
      ["Sleep Quality", todaySignals.sleepQuality, yesterday.signals.sleepQuality, "%"],
      ["Sleep Consistency", todaySignals.sleepConsistency, yesterday.signals.sleepConsistency, "%"],
      ["Training Load", todaySignals.trainingLoad, yesterday.signals.trainingLoad, "/100"],
      ["Consecutive Days", todaySignals.consecutiveTrainingDays, yesterday.signals.consecutiveTrainingDays, "d"],
      ["Hydration", todaySignals.hydrationLiters, yesterday.signals.hydrationLiters, "L"],
      ["Nutrition", todaySignals.nutritionConsistency, yesterday.signals.nutritionConsistency, "%"],
      ["Stress", todaySignals.stressLevel, yesterday.signals.stressLevel, "%"],
      ["Soreness", todaySignals.soreness.length ? avg(todaySignals.soreness) : 20, yesterday.signals.soreness.length ? avg(yesterday.signals.soreness) : 20, "/100"],
    ];
    // Map raw unit deltas into approximate recovery-point changes.
    const multipliers: Record<string, number> = {
      "Sleep Duration": 12,
      "Sleep Quality": 0.14,
      "Sleep Consistency": 0.1,
      "Training Load": -0.16,
      "Consecutive Days": -3,
      Hydration: 6,
      Nutrition: 0.06,
      Stress: -0.06,
      Soreness: -0.06,
    };
    for (const [factor, cur, prev, unit] of pairs) {
      const rawChange = cur - prev;
      if (Math.abs(rawChange) < 0.001) continue;
      const recoveredChange = rawChange * (multipliers[factor] ?? 0);
      const direction = recoveredChange > 1 ? "improved" : recoveredChange < -1 ? "worsened" : "unchanged";
      deltas.push({
        factor,
        change: Math.round(recoveredChange * 10) / 10,
        direction,
        note: `${factor} ${rawChange > 0 ? "up" : "down"} ${Math.abs(round(rawChange, unit))}${unit}`,
      });
    }
  }

  const sorted = [...deltas].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const top = sorted[0];
  const changed = today.recommendation.label !== (yesterday?.result.recommendation.label ?? today.recommendation.label);

  let summary: string;
  if (!yesterday) {
    summary = `Today's recommendation is "${today.recommendation.label}" based on a recovery score of ${today.score}/100.`;
  } else if (!changed) {
    summary = `Your plan is unchanged ("${today.recommendation.label}"). ${top ? `Maintained because ${top.factor} held steady.` : "Signals were stable versus yesterday."}`;
  } else if (top) {
    const dir = top.direction === "improved" ? "improved" : "worsened";
    summary = `Recommendation changed from "${yesterday.result.recommendation.label}" to "${today.recommendation.label}" because ${top.factor} ${dir} (≈${Math.abs(top.change)} recovery points).`;
  } else {
    summary = `Recommendation shifted to "${today.recommendation.label}".`;
  }

  return {
    todayDecision: today.recommendation.label,
    yesterdayDecision: yesterday?.result.recommendation.label,
    changed,
    deltas: sorted,
    summary,
  };
}

// ---------- Weekly Recovery Review ----------

export interface WeeklyReview {
  grade: string;
  averageRecovery: number;
  restDaysTaken: number;
  trainingDays: number;
  patterns: string[];
  improvements: string[];
  actionItems: string[];
  riskFactors: string[];
}

export interface HistoryPoint {
  date: string;
  day?: string;
  score: number;
  fatigue: number;
  trainingLoad?: number;
  sleepDuration?: number;
  sleepQuality?: number;
  restDay?: boolean;
}

export function generateWeeklyReview(history: HistoryPoint[]): WeeklyReview {
  if (!history.length) {
    return {
      grade: "—",
      averageRecovery: 0,
      restDaysTaken: 0,
      trainingDays: 0,
      patterns: ["No data logged yet this week."],
      improvements: ["Log sleep and workouts to unlock your weekly review."],
      actionItems: ["Complete onboarding and track your first recovery day."],
      riskFactors: ["Insufficient data"],
    };
  }

  const avg = Math.round(avgNum(history.map((h) => h.score)));
  const restDays = history.filter((h) => h.restDay).length;
  const trainingDays = history.filter((h) => !h.restDay && (h.trainingLoad ?? 0) > 10).length;
  const avgSleep = avgNum(history.map((h) => h.sleepDuration ?? 0).filter((v) => v > 0));
  const avgQuality = avgNum(history.map((h) => h.sleepQuality ?? 0).filter((v) => v > 0));

  const grade = avg >= 80 ? "A" : avg >= 70 ? "B" : avg >= 60 ? "C" : avg >= 45 ? "D" : "F";

  const patterns: string[] = [];
  const recoveryTrend = history[history.length - 1].score - history[0].score;
  if (recoveryTrend >= 5) patterns.push("Recovery has trended upward across the week — your routine is working.");
  else if (recoveryTrend <= -5) patterns.push("Recovery has drifted downward — accumulating fatigue.");
  else patterns.push("Recovery has been stable week-over-week.");
  if (avgSleep > 0) patterns.push(`Average sleep ${avgSleep.toFixed(1)}h — ${avgSleep >= 7.5 ? "on target" : "below the 7.5h target"}.`);
  patterns.push(`You trained ${trainingDays} days and rested ${restDays} days this period.`);

  const improvements: string[] = [];
  if (avgQuality >= 80) improvements.push("Sleep quality is in a strong range.");
  else improvements.push("Sleep quality has room to improve — protect your wind-down window.");
  if (restDays >= 1) improvements.push(`You honoured ${restDays} rest day(s) — good for supercompensation.`);
  if (grade === "A" || grade === "B") improvements.push("Overall recovery grade is healthy.");

  const actionItems: string[] = [];
  if (avgSleep > 0 && avgSleep < 7.5) actionItems.push("Shift bedtime 20-30 min earlier to reach 7.5h sleep.");
  if (trainingDays >= 6) actionItems.push("Schedule at least one full rest day next week to avoid overreaching.");
  if (restDays === 0 && trainingDays >= 4) actionItems.push("Add one mobility or active-recovery day.");
  actionItems.push("Log DOMS after heavy sessions so muscle readiness stays accurate.");
  if (actionItems.length === 0) actionItems.push("Maintain your current rhythm and aim to raise the weekly average.");

  const riskFactors: string[] = [];
  if (trainingDays >= 6) riskFactors.push("Very high training frequency (6+ days).");
  if (avgSleep > 0 && avgSleep < 6.5) riskFactors.push("Chronic sleep shortfall.");
  if (history.some((h) => h.fatigue > 70)) riskFactors.push("Multiple high-fatigue days detected.");
  if (restDays === 0) riskFactors.push("No dedicated rest days this period.");
  if (riskFactors.length === 0) riskFactors.push("No major risk factors this week.");

  return { grade, averageRecovery: avg, restDaysTaken: restDays, trainingDays, patterns, improvements, actionItems, riskFactors };
}

// ---------- utils ----------

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}
function avg(soreness: { soreness: number }[]): number {
  if (!soreness.length) return 0;
  return soreness.reduce((s, m) => s + m.soreness, 0) / soreness.length;
}
function avgNum(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
function round(v: number, unit: string): number {
  return unit === "h" || unit === "L" ? Math.round(v * 10) / 10 : Math.round(v);
}
