import { RecoveryResult, RecoverySignals } from "./types";

// ---------- Fatigue Monitoring ----------
export interface FatigueStatus {
  fatigueLevel: number; // 0-100
  status: "optimal" | "moderate" | "elevated" | "high";
  warning: string | null;
  factors: { factor: string; impact: number }[];
}

export function estimateFatigue(input: RecoverySignals): FatigueStatus {
  const loadImpact = input.trainingLoad * 0.4;
  const streakImpact = Math.min(35, Math.max(0, (input.consecutiveTrainingDays - 3) * 12));
  const sorenessImpact = input.soreness.length
    ? (input.soreness.reduce((s, m) => s + m.soreness, 0) / input.soreness.length) * 0.25
    : 0;
  const sleepImpact = (100 - input.sleepQuality) * 0.2;
  const stressImpact = input.stressLevel * 0.15;

  const fatigueLevel = clamp(Math.round(loadImpact + streakImpact + sorenessImpact + sleepImpact + stressImpact));

  const status: FatigueStatus["status"] =
    fatigueLevel < 35 ? "optimal" : fatigueLevel < 55 ? "moderate" : fatigueLevel < 75 ? "elevated" : "high";

  const warning =
    fatigueLevel >= 75
      ? "High fatigue detected — consider a rest or active-recovery day."
      : fatigueLevel >= 55
        ? "Fatigue is elevated. Reduce intensity and monitor sleep tonight."
        : null;

  const factors = [
    { factor: "Training Load", impact: Math.round(loadImpact) },
    { factor: "Consecutive Days", impact: Math.round(streakImpact) },
    { factor: "Muscle Soreness", impact: Math.round(sorenessImpact) },
    { factor: "Sleep Quality", impact: Math.round(sleepImpact) },
    { factor: "Stress", impact: Math.round(stressImpact) },
  ].sort((a, b) => b.impact - a.impact);

  return { fatigueLevel, status, warning, factors };
}

// ---------- Recovery Coach ----------
export interface CoachContext {
  result: RecoveryResult;
  signals: RecoverySignals;
  fatigue: FatigueStatus;
}

export function recoveryCoachReply(message: string, ctx: CoachContext): string {
  const m = message.toLowerCase();
  const { result, signals, fatigue } = ctx;

  if (m.includes("train today") || m.includes("should i train") || m.includes("workout today")) {
    return `Based on your recovery score of ${result.score}/100 (${result.readiness}), my recommendation is "${result.recommendation.label}". ${result.recommendation.primaryAction} Confidence: ${result.recommendation.confidence}%.`;
  }
  if (m.includes("why is my recovery low") || m.includes("recovery low") || m.includes("why low")) {
    const worst = [...result.signals].sort((a, b) => a.contribution / a.weight - b.contribution / b.weight)[0];
    return `Your recovery is limited mainly by ${worst.label} (${worst.detail}). The largest levers today are improving sleep duration/quality and managing training load. Confidence: ${result.confidence}%.`;
  }
  if (m.includes("legs") || m.includes("leg day")) {
    const leg = result.muscleReadiness.filter((x) => ["Quads", "Hamstrings", "Glutes", "Calves", "Hip Flexors"].includes(x.muscle));
    const avg = leg.length ? Math.round(leg.reduce((s, x) => s + x.readiness, 0) / leg.length) : 70;
    return `Leg readiness is ~${avg}%. ${avg < 45 ? "I'd avoid heavy squats/deadlifts today — do upper body or mobility." : avg < 65 ? "Train legs but cut volume ~20% and prioritise a post-session stretch." : "Legs are ready for a solid session."} Confidence: 78%.`;
  }
  if (m.includes("instead") || m.includes("what should i do") || m.includes("alternative")) {
    return `Suggested alternative: a 20-30 min active-recovery session — Zone 1 walk or cycling plus 10 min of mobility. This keeps blood flowing for repair without adding CNS load. Confidence: 85%.`;
  }
  if (m.includes("sleep")) {
    return `Sleep is your top recovery driver. You logged ${signals.sleepDuration.toFixed(1)}h at ${Math.round(signals.sleepQuality)}% quality. Aim for 7.5-8h and a fixed wake time; a 30-min earlier bedtime would lift tomorrow's score. Confidence: 88%.`;
  }
  if (m.includes("tired") || m.includes("fatigue") || m.includes("exhausted")) {
    return `Fatigue index is ${fatigue.fatigueLevel}/100 (${fatigue.status}). I recommend active recovery or rest today, avoid compound lifts over 70% 1RM, and prioritise an earlier bedtime. Confidence: 84%.`;
  }
  if (m.includes("mobility") || m.includes("stretch")) {
    return `A 15-minute mobility flow targeting your tightest areas would help. Your highest-soreness muscles are ${topSore(signals)}. Pair it with a post-session stretch to speed DOMS recovery. Confidence: 82%.`;
  }
  if (m.includes("hydrat") || m.includes("water")) {
    return `You've logged ${signals.hydrationLiters.toFixed(1)}L toward a ${signals.hydrationTargetLiters.toFixed(1)}L target. Stay ahead of thirst — sip ~${(signals.hydrationTargetLiters / 14).toFixed(2)}L per waking hour. Confidence: 80%.`;
  }
  if (m.includes("nutrition") || m.includes("protein") || m.includes("food")) {
    return `Nutrition consistency is ${Math.round(signals.nutritionConsistency)}%. Hitting your protein target and even calorie intake are the biggest levers for overnight repair. Confidence: 81%.`;
  }
  if (m.includes("rest") || m.includes("deload")) {
    return `Given a recovery score of ${result.score}/100, ${result.recommendation.label} is the right call. ${result.recommendation.primaryAction} Confidence: ${result.recommendation.confidence}%.`;
  }

  return `Your recovery reads ${result.score}/100 (${result.readiness}) with fatigue at ${fatigue.fatigueLevel}/100. My plan for today: "${result.recommendation.label}". ${result.explanation} This is a general recommendation, not a medical diagnosis.`;
}

function topSore(s: RecoverySignals): string {
  if (!s.soreness.length) return "none reported";
  const sorted = [...s.soreness].sort((a, b) => b.soreness - a.soreness);
  return sorted.slice(0, 2).map((x) => x.muscle).join(" and ");
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}
