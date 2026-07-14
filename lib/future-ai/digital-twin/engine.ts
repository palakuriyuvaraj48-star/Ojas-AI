/**
 * Digital Twin 2.0 — AI prediction engine.
 *
 * Pure TypeScript, no external API calls. Produces deterministic synthetic
 * profiles, predictions, and simulation projections based on the user context.
 *
 * Experimental feature set — all predictions are estimates and NOT medical advice.
 */

import type {
  DigitalTwinProfile,
  DigitalTwinPrediction,
  DigitalTwinSimulation,
  Factor,
  PredictionDrift,
  PredictionHorizon,
  PredictionType,
} from "@/lib/future-ai/types";

export type DigitalTwinContext = {
  userId: string;
  workoutHistory?: Array<{ date: string; duration: number; type: string }>;
  nutrition?: { calories: number; protein: number; consistency: number };
  recovery?: { score: number; readiness: string };
  sleep?: { duration: number; quality: number };
  stress?: number;
  hrv?: number;
  heartRate?: number;
  wearables?: any[];
  bodyComp?: { bodyFat: number; muscleMass: number; bmi: number };
  goals?: { targetWeight?: number; timelineWeeks?: number };
  habits?: Array<{ name: string; streak: number }>;
  consistency?: number;
  mood?: number;
  environment?: any;
  weather?: any;
  trainingLoad?: number;
  previousInjuries?: string[];
  dailyRoutine?: any;
};

/* -------------------------------------------------------------------------- */
/*  Deterministic seeded RNG                                                  */
/* -------------------------------------------------------------------------- */

function makeRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function confidenceLevel(score: number): "low" | "moderate" | "high" | "very-high" {
  if (score >= 0.85) return "very-high";
  if (score >= 0.7) return "high";
  if (score >= 0.5) return "moderate";
  return "low";
}

/* -------------------------------------------------------------------------- */
/*  computeDigitalTwinProfile                                                  */
/* -------------------------------------------------------------------------- */

export function computeDigitalTwinProfile(userId: string, ctx: DigitalTwinContext): DigitalTwinProfile {
  const rng = makeRng(userId + "|profile");
  const has = (v: any) => v !== undefined && v !== null;

  const workoutCount = ctx.workoutHistory?.length ?? 0;
  const sleepQuality = (ctx.sleep?.quality ?? 60) / 100;
  const sleepDuration = ctx.sleep?.duration ?? 6.5;
  const sleepScore = Math.min(1, sleepQuality * (sleepDuration / 8));
  const hrv = (ctx.hrv ?? 55) / 100;
  const restingHR = (ctx.heartRate ?? 68) / 200;
  const bodyFat = ctx.bodyComp?.bodyFat ?? 22;
  const muscleMassRatio = ctx.bodyComp?.muscleMass ?? 45;
  const bmi = ctx.bodyComp?.bmi ?? (muscleMassRatio / 10);
  const bmiScore = bmi >= 18.5 && bmi <= 24.9 ? 0.9 : bmi < 18.5 ? 0.6 : 0.7;
  const consistencyScore = (ctx.consistency ?? 50) / 100;
  const stress = (ctx.stress ?? 5) / 10; // 0 good, 1 bad
  const recoveryBoost = ctx.recovery?.score ? ctx.recovery.score / 100 : 0.5;
  const trainingAge = Math.min(1, workoutCount / 120);
  const injuryPenalty = ctx.previousInjuries?.length ? 0.08 * ctx.previousInjuries.length : 0;

  const physiology = Math.min(100, Math.max(0, Math.round(
    lerp(40, 95, rng()) * 0.25 +
    bmiScore * 25 +
    sleepScore * 20 +
    hrv * 15 +
    (1 - restingHR) * 10 -
    injuryPenalty * 100
  )));

  const behavior = Math.min(100, Math.max(0, Math.round(
    lerp(35, 90, rng()) * 0.2 +
    consistencyScore * 35 +
    (workoutCount / 100) * 20 +
    (1 - stress) * 15 +
    (ctx.nutrition?.consistency ?? 0.5) * 10
  )));

  const adaptation = Math.min(100, Math.max(0, Math.round(
    lerp(30, 88, rng()) * 0.2 +
    trainingAge * 30 +
    recoveryBoost * 20 +
    (ctx.trainingLoad ?? 50) / 100 * 15 +
    physiology * 0.15
  )));

  const habitFormation = Math.min(100, Math.max(0, Math.round(
    lerp(25, 85, rng()) * 0.2 +
    behavior * 0.4 +
    consistencyScore * 25 +
    (ctx.habits?.length ?? 0) * 5 +
    Math.max(...(ctx.habits?.map((h) => h.streak) ?? [0])) * 0.5
  )));

  const overallScore = Math.round(physiology * 0.3 + behavior * 0.2 + adaptation * 0.3 + habitFormation * 0.2);
  const confidence = computeConfidence({
    physiology,
    behavior,
    adaptation,
    habitFormation,
    workoutHistory: workoutCount,
    nutrition: ctx.nutrition,
    recovery: ctx.recovery,
    sleep: ctx.sleep,
  });

  return {
    id: `${userId}-profile-${Date.now()}`,
    userId,
    overallScore,
    physiology: { score: physiology, hv: hrv * 100, rhr: restingHR * 200, bf: bodyFat, mm: muscleMassRatio, sleep: sleepScore * 100, recovery: recoveryBoost * 100 },
    behavior: { consistency: consistencyScore * 100, adherence: behavior, stress: stress * 100, nutrition: (ctx.nutrition?.consistency ?? 0.5) * 100 },
    adaptation: { trainingAge: trainingAge * 100, load: (ctx.trainingLoad ?? 50), recovery: recoveryBoost * 100, progression: adaptation },
    habitFormation: { streak: Math.max(...(ctx.habits?.map((h) => h.streak) ?? [0])), count: ctx.habits?.length ?? 0, adherence: habitFormation },
    lastSimulatedAt: new Date().toISOString(),
    modelVersion: "dtwin-2.0.1",
    confidence: Math.round(confidence),
  };
}

/* -------------------------------------------------------------------------- */
/*  computeConfidence                                                         */
/* -------------------------------------------------------------------------- */

export function computeConfidence(factors: Record<string, unknown>): number {
  let score = 0;
  let max = 0;

  const entries = Object.entries(factors);
  for (const [, value] of entries) {
    max += 100;
    if (typeof value === "number") {
      score += clamp(value, 0, 100);
    } else if (typeof value === "object" && value !== null) {
      score += 60;
    } else if (Array.isArray(value)) {
      score += Math.min(100, value.length * 20);
    } else {
      score += 40;
    }
  }

  if (max === 0) return 50;
  return Math.round((score / max) * 100);
}

/* -------------------------------------------------------------------------- */
/*  Prediction factory                                                         */
/* -------------------------------------------------------------------------- */

export function generatePredictions(profile: DigitalTwinProfile, horizon: PredictionHorizon): DigitalTwinPrediction[] {
  const rng = makeRng(profile.userId + "|predictions|" + horizon);
  const horizonMultiplier: Record<PredictionHorizon, number> = {
    daily: 0.95,
    weekly: 0.85,
    monthly: 0.7,
    yearly: 0.55,
    longterm: 0.4,
  };
  const hm = horizonMultiplier[horizon];
  const base = profile.overallScore / 100;

  const predictionTypes: Array<{ type: PredictionType; label: string; baseValue: number; variance: number }> = [
    { type: "recovery", label: "Recovery", baseValue: profile.physiology.recovery, variance: 12 },
    { type: "performance", label: "Performance", baseValue: profile.adaptation.progression, variance: 14 },
    { type: "plateau", label: "Plateau", baseValue: Math.max(10, 90 - profile.adaptation.progression), variance: 10 },
    { type: "motivation", label: "Motivation", baseValue: profile.behavior.adherence, variance: 15 },
    { type: "habit", label: "Habit", baseValue: profile.habitFormation.adherence, variance: 10 },
    { type: "goal_completion", label: "Goal Completion", baseValue: profile.overallScore * 0.85, variance: 13 },
    { type: "training_readiness", label: "Training Readiness", baseValue: profile.physiology.score * (profile.physiology.recovery / 100), variance: 12 },
    { type: "body_transformation", label: "Body Transformation", baseValue: lerp(30, 90, profile.physiology.mm / 100), variance: 16 },
    { type: "adaptation_speed", label: "Adaptation Speed", baseValue: profile.adaptation.progression, variance: 11 },
    { type: "training_response", label: "Training Response", baseValue: profile.adaptation.load + (profile.trainingLoad ?? 50) / 2, variance: 13 },
  ];

  return predictionTypes.map((p) => {
    const value = clamp(Math.round(p.baseValue + (rng() - 0.5) * p.variance * 2), 0, 100);
    const rawConfidence = lerp(0.4, 0.95, rng()) * hm * (profile.confidence / 100);
    const confidence = Math.round(rawConfidence * 100);
    const drift: PredictionDrift =
      rng() > 0.7 ? "improving" : rng() > 0.85 ? "degrading" : rng() > 0.9 ? "volatile" : "stable";

    const primaryFactors = [
      factor(rng, p.type, "primary", 1),
      factor(rng, p.type, "primary", 2),
      factor(rng, p.type, "primary", 3),
    ].filter(Boolean) as Factor[];

    const secondaryFactors = [
      factor(rng, p.type, "secondary", 1),
      factor(rng, p.type, "secondary", 2),
    ].filter(Boolean) as Factor[];

    const explanation = buildExplanation(p.type, value, drift, primaryFactors, secondaryFactors);

    return {
      id: `${profile.userId}-${p.type}-${horizon}-${Date.now()}-${Math.round(rng() * 999)}`,
      userId: profile.userId,
      type: p.type,
      horizon,
      value,
      confidence,
      confidenceLevel: confidenceLevel(confidence / 100),
      primaryFactors,
      secondaryFactors,
      explanation,
      predictionDrift: drift,
      timestamp: new Date().toISOString(),
      modelVersion: "dtwin-2.0.1",
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  simulate                                                                  */
/* -------------------------------------------------------------------------- */

export function simulate(
  profile: DigitalTwinProfile,
  inputs: Record<string, unknown>
): DigitalTwinSimulation {
  const rng = makeRng(profile.userId + "|simulate|" + JSON.stringify(inputs) + Date.now());
  const outputs: Record<string, unknown> = {};

  if (inputs.sleepDelta !== undefined) {
    const delta = Number(inputs.sleepDelta);
    outputs.sleepImpact = Math.round(clamp(delta * 4 + profile.physiology.sleep * 0.3, 0, 100));
    outputs.recoveryImpact = Math.round(clamp((delta * 3) + 50, 0, 100));
  }

  if (inputs.calorieDelta !== undefined) {
    const delta = Number(inputs.calorieDelta);
    const bfImpact = delta < 0 ? delta * 0.5 : delta * 0.2;
    outputs.bodyFatImpact = Math.round(clamp((profile.physiology.bf ?? 22) + bfImpact, 3, 45));
    outputs.energyImpact = Math.round(clamp(70 + delta * 0.8, 20, 98));
  }

  if (inputs.trainingFrequencyDelta !== undefined) {
    const delta = Number(inputs.trainingFrequencyDelta);
    outputs.trainingImpact = Math.round(clamp(profile.adaptation.load + delta * 12, 0, 100));
    outputs.adaptationImpact = Math.round(clamp(profile.adaptation.progression + delta * 5, 0, 100));
  }

  if (inputs.stressDelta !== undefined) {
    const delta = Number(inputs.stressDelta);
    outputs.stressImpact = Math.round(clamp((profile.behavior.stress ?? 40) + delta * 8, 0, 100));
    outputs.performanceImpact = Math.round(clamp(80 - Math.abs(delta) * 3, 20, 95));
  }

  outputs.overallProjection = Math.round(
    profile.overallScore * 0.5 +
      (rng() * 20) +
      (inputs.sleepDelta ? Number(inputs.sleepDelta) * 2 : 0) +
      (inputs.stressDelta ? -Math.abs(Number(inputs.stressDelta)) * 1.5 : 0)
  );

  return {
    id: `${profile.userId}-sim-${Date.now()}-${Math.round(rng() * 9999)}`,
    userId: profile.userId,
    name: (inputs.simulationName as string) || "What-if Simulation",
    inputs,
    outputs,
    confidence: profile.confidence,
    createdAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function factor(
  rng: () => number,
  type: string,
  level: "primary" | "secondary",
  idx: number
): Factor | null {
  const impact = rng() > 0.5 ? "positive" : rng() > 0.3 ? "negative" : "neutral";
  const weight = level === "primary" ? parseFloat((0.15 + rng() * 0.35).toFixed(2)) : parseFloat((0.05 + rng() * 0.15).toFixed(2));
  const adjectives = ["Metabolic", "Neuromuscular", "Cardiovascular", "Hormonal", "Cognitive", "Behavioral", "Structural", "Environmental"];
  const nouns = ["Load", "Capacitance", "Baseline", "Response", "Threshold", "Pattern", "Stress", "Efficiency"];
  const name = `${adjectives[Math.floor(rng() * adjectives.length)]} ${nouns[Math.floor(rng() * nouns.length)]}`;
  const descriptions: Record<string, string> = {
    recovery: "Recovery capacity is influenced by sleep quality, HRV trends, and prior training load.",
    performance: "Performance potential tracks adaptation rate, consistency, and neuromuscular readiness.",
    plateau: "Plateau risk rises when adaptation plates and variety decreases.",
    motivation: "Motivation correlates with recent progress visibility, social accountability, and goal clarity.",
    habit: "Habit formation depends on cue consistency, repetition depth, and environmental friction.",
    goal_completion: "Goal completion probability is a function of goal specificity, time remaining, and current trajectory.",
    training_readiness: "Training readiness is estimated from recovery score, recent fatigue, and readiness history.",
    body_transformation: "Body transformation pace depends on nutrition adherence, training stimulus, and hormonal environment.",
    adaptation_speed: "Adaptation speed is driven by training age, load progression, and recovery quality.",
    training_response: "Training response indicates how quickly the body responds to novel stimuli given genetics and history.",
  };

  return {
    id: `factor-${type}-${level}-${idx}`,
    name: `${name} ${idx}`,
    category: type,
    impact,
    weight,
    description: descriptions[type] || "General biometric factor.",
  };
}

function buildExplanation(
  type: string,
  value: number,
  drift: PredictionDrift,
  primary: Factor[],
  secondary: Factor[]
): string {
  const dominant = primary[0]?.impact ?? "neutral";
  const trend = drift === "improving" ? "upward" : drift === "degrading" ? "downward" : "stable";
  const direction = dominant === "positive" ? "positive" : dominant === "negative" ? "challenging" : "neutral";

  return `The ${type} forecast sits at ${value}% with a ${trend} trend. ${primary.length} primary ${direction} drivers and ${secondary.length} secondary factors are shaping this estimate. Current data suggests ${drift} trajectory over the selected horizon.`;
}
