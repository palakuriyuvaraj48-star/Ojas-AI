/**
 * Feature 150 — Health Risk Prediction
 * Type definitions for the Health Risk engine, views, and API.
 *
 * EXPERIMENTAL / INFORMATIONAL ONLY.
 * These types describe heuristic estimates, not medical diagnoses.
 */

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type HealthRiskCategory =
  | "cardiovascular"
  | "metabolic"
  | "overtraining"
  | "recovery"
  | "stress"
  | "sleep"
  | "injury"
  | "weightRegain"
  | "trainingSustainability"
  | "habitConsistency"
  | "lifestyleBalance";

export interface HealthFactor {
  id: string;
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // 0-1 influence weight within the category
  description: string;
}

export interface HealthRiskAssessment {
  id: string;
  userId: string;
  category: HealthRiskCategory;
  riskScore: number; // 0-100, higher = greater risk
  confidence: number; // 0-100, data completeness / certainty
  riskLevel: RiskLevel;
  contributingFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  assessedAt: string;
  expiresAt: string;
  modelVersion: string;
}

export interface HealthInsight {
  id: string;
  userId: string;
  category: HealthRiskCategory;
  trend: "improving" | "stable" | "worsening";
  change: number; // delta in risk points vs previous assessment
  context: string;
}

export interface RiskHeatmapPoint {
  category: HealthRiskCategory;
  date: string; // ISO date
  riskScore: number;
  confidence: number;
}

export interface ScenarioComparison {
  name: string;
  riskScore: number;
  changes: string[];
  description: string;
}

/** Raw signals used as inputs to the heuristic risk engine. All optional. */
export interface HealthRiskSignals {
  age?: number;
  restingHeartRate?: number; // bpm
  vo2max?: number; // ml/kg/min
  restingSystolic?: number; // mmHg
  restingDiastolic?: number; // mmHg
  weeklyCardioSessions?: number;
  weeklyStrengthSessions?: number;
  fastingGlucose?: number; // mg/dL
  hba1c?: number; // %
  waistCircumference?: number; // cm
  bmi?: number;
  sleepHours?: number;
  sleepQuality?: number; // 0-100 self/device reported
  sleepConsistency?: number; // 0-100 regularity
  stressLevel?: number; // 0-100 perceived
  recoveryScore?: number; // 0-100
  hrv?: number; // ms
  sorenessLevel?: number; // 0-100
  trainingStressBalance?: number; // acute:chronic workload ratio
  workoutAdherence?: number; // 0-100
  nutritionAdherence?: number; // 0-100
  hydrationLiters?: number; // liters/day
  stepsPerDay?: number;
  weightHistoryStability?: number; // 0-100
  priorInjuries?: number;
  mobilityScore?: number; // 0-100
  previousWeightLossAttempts?: number;
  currentDeficit?: number; // kcal/day
  alcoholUnitsPerWeek?: number;
  smoking?: boolean;
  familyHistory?: {
    cardiac?: boolean;
    metabolic?: boolean;
    diabetes?: boolean;
  };
}

export interface LongTermProjection {
  horizon: "3months" | "6months" | "12months";
  categories: Partial<Record<HealthRiskCategory, { riskScore: number; confidence: number }>>;
  modelVersion: string;
}

export interface EducationalContent {
  category: HealthRiskCategory;
  title: string;
  summary: string;
  detail: string;
  sources: string[];
}
