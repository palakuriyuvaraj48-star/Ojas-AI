import {
  Decision,
  DECISION_LABELS,
  MuscleReadiness,
  MuscleSoreness,
  RecoveryResult,
  RecoveryRecommendation,
  RecoverySignals,
  ReadinessLevel,
  SignalContribution,
  SorenessLevel,
} from "./types";

// ---------- helpers ----------

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

function sorenessToLevel(s: number): SorenessLevel {
  if (s < 15) return "none";
  if (s < 40) return "low";
  if (s < 70) return "medium";
  return "high";
}

// Map a sleep duration (hours) to a 0-100 score. Optimal plateau ~7.5-9h.
function sleepDurationScore(hours: number): number {
  if (hours <= 4) return 10;
  if (hours >= 9) return 100;
  // smooth curve: steep early, plateau after 7.5
  const under = hours < 7.5 ? (hours - 4) / 3.5 : 1;
  const over = hours >= 7.5 ? (hours - 7.5) / 1.5 : 0;
  return clamp(40 + under * 50 + over * 10);
}

// ---------- the engine ----------

export interface EngineOptions {
  previousScore?: number; // yesterday's score, to derive a trend
  targetMusclesToday?: string[]; // muscles a planned workout would hit
}

export function computeRecovery(input: RecoverySignals, opts: EngineOptions = {}): RecoveryResult {
  const contributions: SignalContribution[] = [];

  // 1. Sleep duration (weight 18)
  const durScore = sleepDurationScore(input.sleepDuration);
  contributions.push({
    label: "Sleep Duration",
    contribution: durScore * 0.18,
    weight: 18,
    detail: `${input.sleepDuration.toFixed(1)}h logged (target 7.5-9h)`,
  });

  // 2. Sleep quality (weight 14)
  contributions.push({
    label: "Sleep Quality",
    contribution: input.sleepQuality * 0.14,
    weight: 14,
    detail: `${Math.round(input.sleepQuality)}% restorative quality`,
  });

  // 3. Sleep consistency (weight 10)
  contributions.push({
    label: "Sleep Consistency",
    contribution: input.sleepConsistency * 0.1,
    weight: 10,
    detail: `${Math.round(input.sleepConsistency)}% on-schedule adherence`,
  });

  // 4. HRV (weight 14) relative to baseline when available
  let hrvScore = 70; // neutral default when no wearable
  if (input.hrv && input.hrvBaseline) {
    const ratio = input.hrv / input.hrvBaseline;
    hrvScore = clamp(50 + (ratio - 0.85) * 200);
  } else if (input.hrv) {
    hrvScore = clamp((input.hrv / 70) * 100);
  }
  contributions.push({
    label: "HRV",
    contribution: hrvScore * 0.14,
    weight: 14,
    detail: input.hrvBaseline
      ? `${Math.round(input.hrv ?? 0)}ms vs ${Math.round(input.hrvBaseline)}ms baseline`
      : input.hrv
        ? `${Math.round(input.hrv)}ms (no baseline)`
        : "No wearable — estimated",
  });

  // 5. Resting HR (weight 8) inverse relative to baseline
  let rhrScore = 80;
  if (input.restingHR && input.restingHRBaseline) {
    const delta = input.restingHR - input.restingHRBaseline;
    rhrScore = clamp(90 - delta * 4);
  } else if (input.restingHR) {
    rhrScore = clamp(110 - input.restingHR);
  }
  contributions.push({
    label: "Resting HR",
    contribution: rhrScore * 0.08,
    weight: 8,
    detail: input.restingHRBaseline
      ? `${Math.round(input.restingHR ?? 0)}bpm (${delta(input.restingHR, input.restingHRBaseline)} vs baseline)`
      : input.restingHR
        ? `${Math.round(input.restingHR)}bpm (no baseline)`
        : "No wearable — estimated",
  });

  // 6. Training load (weight 16) inverse
  const loadScore = clamp(100 - input.trainingLoad);
  contributions.push({
    label: "Training Load",
    contribution: loadScore * 0.16,
    weight: 16,
    detail: `Load ${Math.round(input.trainingLoad)}/100 — ${input.trainingLoad > 70 ? "high accumulation" : "managed"}`,
  });

  // 7. Consecutive training days (weight 6) penalty after day 3
  let streakScore = 100;
  if (input.consecutiveTrainingDays >= 6) streakScore = 45;
  else if (input.consecutiveTrainingDays >= 5) streakScore = 60;
  else if (input.consecutiveTrainingDays >= 4) streakScore = 75;
  else if (input.consecutiveTrainingDays >= 3) streakScore = 88;
  contributions.push({
    label: "Training Streak",
    contribution: streakScore * 0.06,
    weight: 6,
    detail: `${input.consecutiveTrainingDays} consecutive training days`,
  });

  // 8. Hydration (weight 6)
  const hydRatio = input.hydrationTargetLiters > 0 ? input.hydrationLiters / input.hydrationTargetLiters : 1;
  const hydScore = clamp(hydRatio * 100);
  contributions.push({
    label: "Hydration",
    contribution: hydScore * 0.06,
    weight: 6,
    detail: `${input.hydrationLiters.toFixed(1)}L / ${input.hydrationTargetLiters.toFixed(1)}L target`,
  });

  // 9. Nutrition consistency (weight 6)
  contributions.push({
    label: "Nutrition Consistency",
    contribution: input.nutritionConsistency * 0.06,
    weight: 6,
    detail: `${Math.round(input.nutritionConsistency)}% adherence to targets`,
  });

  // 10. Stress (weight 6) inverse
  const stressScore = clamp(100 - input.stressLevel);
  contributions.push({
    label: "Stress",
    contribution: stressScore * 0.06,
    weight: 6,
    detail: `Stress index ${Math.round(input.stressLevel)}/100`,
  });

  // 11. Muscle soreness (weight 6) inverse of average
  const sorenessAvg = input.soreness.length
    ? input.soreness.reduce((s, m) => s + m.soreness, 0) / input.soreness.length
    : 20;
  const sorenessScore = clamp(100 - sorenessAvg);
  contributions.push({
    label: "Muscle Soreness",
    contribution: sorenessScore * 0.06,
    weight: 6,
    detail: `Avg soreness ${Math.round(sorenessAvg)}/100`,
  });

  const raw = contributions.reduce((sum, c) => sum + c.contribution, 0);
  const score = Math.round(clamp(raw));

  const readiness = readinessFromScore(score);
  const fatigueLevel = clamp(100 - score);
  const confidence = confidenceFromSignals(input);

  // Trend vs previous day
  let trend: RecoveryResult["trend"] = "stable";
  if (opts.previousScore !== undefined) {
    const diff = score - opts.previousScore;
    if (diff >= 4) trend = "improving";
    else if (diff <= -4) trend = "declining";
  }

  const muscleReadiness = computeMuscleReadiness(input.soreness, opts.targetMusclesToday);
  const explanation = buildExplanation(score, readiness, contributions, input, trend);
  const recommendation = buildRecommendation(score, fatigueLevel, input, muscleReadiness, opts.targetMusclesToday);

  return {
    score,
    readiness,
    fatigueLevel,
    confidence,
    trend,
    explanation,
    signals: contributions,
    muscleReadiness,
    sorenessAvg,
    recommendation,
    generatedAt: new Date().toISOString(),
  };
}

function delta(v?: number, base?: number): string {
  if (v === undefined || base === undefined) return "";
  const d = Math.round(v - base);
  if (d === 0) return "equal to baseline";
  return `${d > 0 ? "+" : ""}${d}bpm ${d > 0 ? "above" : "below"}`;
}

function readinessFromScore(score: number): ReadinessLevel {
  if (score >= 80) return "fresh";
  if (score >= 60) return "moderate";
  if (score >= 40) return "fatigued";
  return "overreaching";
}

function confidenceFromSignals(input: RecoverySignals): number {
  let signals = 6; // sleep duration, quality, consistency, load, nutrition, stress
  if (input.hrv) signals += 2;
  if (input.hrvBaseline) signals += 1;
  if (input.restingHR) signals += 1;
  if (input.restingHRBaseline) signals += 1;
  if (input.soreness.length) signals += 1;
  if (input.hydrationLiters > 0) signals += 1;
  const conf = 55 + signals * 4;
  return clamp(Math.round(conf), 55, 96);
}

function computeMuscleReadiness(soreness: MuscleSoreness[], target?: string[]): MuscleReadiness[] {
  return soreness.map((m) => {
    const readiness = clamp(100 - m.soreness);
    return {
      muscle: m.muscle,
      readiness,
      soreness: sorenessToLevel(m.soreness),
    };
  });
}

function buildExplanation(
  score: number,
  readiness: ReadinessLevel,
  contributions: SignalContribution[],
  input: RecoverySignals,
  trend: RecoveryResult["trend"]
): string {
  const sorted = [...contributions].sort((a, b) => b.contribution - a.contribution);
  const top = sorted[0];
  const worst = [...contributions].sort((a, b) => a.contribution / a.weight - b.contribution / b.weight)[0];
  const trendWord =
    trend === "improving" ? "improving" : trend === "declining" ? "declining" : "holding steady";
  const readinessWord =
    readiness === "fresh"
      ? "fully recovered and ready for high intensity"
      : readiness === "moderate"
        ? "moderately recovered — solid training is possible"
        : readiness === "fatigued"
          ? "showing fatigue — favour lower intensity"
          : "in an overreaching state — prioritise recovery";

  const bits: string[] = [];
  bits.push(`Recovery is ${score}/100 (${readinessWord}), trend ${trendWord}.`);
  bits.push(`Biggest contributor: ${top.label} (${top.detail}).`);
  if (worst && worst.contribution / worst.weight < 0.6) {
    bits.push(`Primary limiter: ${worst.label} (${worst.detail}).`);
  }
  if (input.consecutiveTrainingDays >= 4) {
    bits.push(`Caution: ${input.consecutiveTrainingDays} consecutive training days without a deload.`);
  }
  if (input.sleepDebt > 2) {
    bits.push(`Sleep debt of ${input.sleepDebt.toFixed(1)}h is reducing readiness.`);
  }
  return bits.join(" ");
}

function buildRecommendation(
  score: number,
  fatigueLevel: number,
  input: RecoverySignals,
  muscleReadiness: MuscleReadiness[],
  targetMusclesToday?: string[]
): RecoveryRecommendation {
  // Safety override: if today's planned muscles are heavily sore, cap intensity.
  let decision: Decision;
  if (score >= 80) decision = "train-hard";
  else if (score >= 65) decision = "train-moderate";
  else if (score >= 50) decision = "mobility";
  else if (score >= 35) decision = "active-recovery";
  else decision = "rest-day";

  if (targetMusclesToday && targetMusclesToday.length) {
    const relevant = muscleReadiness.filter((m) => targetMusclesToday.includes(m.muscle));
    const avgRelevant = relevant.length
      ? relevant.reduce((s, m) => s + m.readiness, 0) / relevant.length
      : 100;
    if (avgRelevant < 45 && decision === "train-hard") decision = "train-moderate";
    if (avgRelevant < 30 && (decision === "train-moderate" || decision === "mobility"))
      decision = "active-recovery";
  }

  const confidence = clamp(Math.round(60 + (score > 50 ? 30 : 15) + (input.hrv ? 5 : 0)));

  const map: Record<Decision, { label: string; action: string }> = {
    "train-hard": {
      label: "Train Hard",
      action: "Push your planned session at full intensity with progressive overload.",
    },
    "train-moderate": {
      label: "Train Moderate",
      action: "Train today but reduce volume by ~15-20% and keep RPE around 7-8.",
    },
    mobility: {
      label: "Mobility Work",
      action: "Do a 15-20 min mobility flow and light activation; skip heavy loading.",
    },
    "active-recovery": {
      label: "Active Recovery",
      action: "20-30 min Zone 1 cardio (walk/cycle) plus stretching.",
    },
    "rest-day": {
      label: "Rest Day",
      action: "Take a full rest day. Prioritise sleep and breathwork to reset.",
    },
  };

  const verb =
    decision === "train-hard"
      ? "Your metrics support a high-intensity session."
      : decision === "train-moderate"
        ? "Your metrics support training at reduced intensity."
        : decision === "mobility"
          ? "Your recovery favours movement without load today."
          : decision === "active-recovery"
            ? "Low recovery suggests restorative movement, not training."
            : "Recovery is critically low — rest is the priority today.";

  return {
    decision,
    label: DECISION_LABELS[decision],
    confidence,
    explanation: `${verb} Fatigue index ${fatigueLevel}/100.`,
    primaryAction: map[decision].action,
  };
}
