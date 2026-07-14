// Core domain types for the AI Recovery Engine.
// All scoring is deterministic and explained (no black boxes).

export type ReadinessLevel = "fresh" | "moderate" | "fatigued" | "overreaching";
export type SorenessLevel = "none" | "low" | "medium" | "high";
export type MobilityDifficulty = "beginner" | "intermediate" | "advanced";
export type StretchType = "pre-workout" | "post-workout" | "rest-day" | "desk" | "travel";
export type RestDayActivity =
  | "full-rest"
  | "walking"
  | "yoga"
  | "stretching"
  | "breathing"
  | "light-cycling";

export type Decision = "train-hard" | "train-moderate" | "mobility" | "active-recovery" | "rest-day";

export const MUSCLE_GROUPS = [
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Chest",
  "Back",
  "Lats",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Core",
  "Hip Flexors",
  "Forearms",
  "Traps",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export interface MuscleSoreness {
  muscle: string;
  soreness: number; // 0 (fresh) - 100 (severe)
}

// Raw physiological / behavioural signals the engine consumes.
export interface RecoverySignals {
  sleepDuration: number; // hours
  sleepQuality: number; // 0-100
  sleepConsistency: number; // 0-100
  sleepDebt: number; // hours (positive = deficit)
  trainingLoad: number; // 0-100 (higher = more accumulated fatigue)
  consecutiveTrainingDays: number;
  hrv?: number; // ms
  hrvBaseline?: number; // ms
  restingHR?: number; // bpm
  restingHRBaseline?: number; // bpm
  hydrationLiters: number;
  hydrationTargetLiters: number;
  nutritionConsistency: number; // 0-100
  stressLevel: number; // 0-100 (higher = worse)
  soreness: MuscleSoreness[];
}

export interface SignalContribution {
  label: string;
  contribution: number; // weighted points added to score (can be negative)
  weight: number;
  detail: string;
}

export interface MuscleReadiness {
  muscle: string;
  readiness: number; // 0-100
  soreness: SorenessLevel;
}

export interface RecoveryRecommendation {
  decision: Decision;
  label: string;
  confidence: number;
  explanation: string;
  primaryAction: string;
}

export interface RecoveryResult {
  score: number; // 0-100
  readiness: ReadinessLevel;
  fatigueLevel: number; // 0-100 (inverse of recovery)
  confidence: number; // 0-100
  trend: "improving" | "stable" | "declining";
  explanation: string; // plain-language AI summary
  signals: SignalContribution[];
  muscleReadiness: MuscleReadiness[];
  sorenessAvg: number;
  recommendation: RecoveryRecommendation;
  generatedAt: string;
}

export const DECISION_LABELS: Record<Decision, string> = {
  "train-hard": "Train Hard",
  "train-moderate": "Train Moderate",
  mobility: "Mobility Work",
  "active-recovery": "Active Recovery",
  "rest-day": "Rest Day",
};
