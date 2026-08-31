/**
 * Safety & Risk Engine
 * Runs BEFORE every recommendation is dispatched to ensure human safety.
 * Evaluates biomechanical, recovery, fatigue, and workload risk signals.
 * Strictly avoids medical diagnosis or disease prevention claims.
 */

import { CurrentContext } from "./context-fusion";

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL_DELOAD";

export interface SafetyRiskAssessment {
  riskLevel: RiskLevel;
  trainingLoadRisk: "safe" | "elevated" | "spike_warning";
  recoveryRisk: "optimal" | "manageable" | "insufficient";
  formFatigueRisk: "normal" | "degradation_warning";
  riskScore: number; // 0 (safest) - 100 (highest risk)
  mitigationActions: string[];
  safetyWarnings: string[];
  isDeloadMandated: boolean;
  isRestMandated: boolean;
}

/**
 * Evaluate safety and training risks based on multi-factor telemetry.
 */
export function evaluateSafetyAndRisk(context: CurrentContext): SafetyRiskAssessment {
  let riskScore = 10;
  const mitigationActions: string[] = [];
  const safetyWarnings: string[] = [];
  let isDeloadMandated = false;
  let isRestMandated = false;

  // 1. Evaluate Acute:Chronic Workload Ratio (ACWR)
  let trainingLoadRisk: SafetyRiskAssessment["trainingLoadRisk"] = "safe";
  if (context.acuteChronicRatio > 1.5 || context.acuteTrainingLoad > 85) {
    trainingLoadRisk = "spike_warning";
    riskScore += 35;
    safetyWarnings.push("Rapid workload spike detected (ACWR > 1.5). High cumulative joint & tendon stress.");
    mitigationActions.push("Reduce working set volume by 40% and eliminate forced reps.");
    isDeloadMandated = true;
  } else if (context.acuteChronicRatio > 1.3 || context.acuteTrainingLoad > 70) {
    trainingLoadRisk = "elevated";
    riskScore += 20;
    mitigationActions.push("Cap session intensity at RPE 7.5.");
  }

  // 2. Evaluate Sleep & Physiological Recovery
  let recoveryRisk: SafetyRiskAssessment["recoveryRisk"] = "optimal";
  if (context.sleepHours <= 5.5 && (context.stressLevel === "high" || context.fatigueLevel > 70)) {
    recoveryRisk = "insufficient";
    riskScore += 40;
    safetyWarnings.push("Severe sleep deficit (<=5.5h) paired with elevated stress. High systemic fatigue signal.");
    mitigationActions.push("Pivot session to mobility, active restoration, and nervous system decompression.");
    isDeloadMandated = true;
  } else if (context.sleepHours < 6.5 || context.recoveryScore < 50) {
    recoveryRisk = "manageable";
    riskScore += 18;
    mitigationActions.push("Avoid heavy axial spine loading (e.g. max squats or deadlifts).");
  }

  // 3. Evaluate Movement Quality & Form Degradation (Vision Coach signal)
  let formFatigueRisk: SafetyRiskAssessment["formFatigueRisk"] = "normal";
  if (context.visionQuality.formTrend === "declining" || context.visionQuality.latestFormScore < 70) {
    formFatigueRisk = "degradation_warning";
    riskScore += 25;
    safetyWarnings.push("Vision Coach detected progressive form degradation across recent sets.");
    mitigationActions.push("Switch to controlled tempo variations and reduce load to reinforce motor patterns.");
  }

  // 4. Evaluate User-Reported Pain/Discomfort
  if (context.painReported) {
    riskScore += 50;
    safetyWarnings.push("Physical discomfort reported. High-load training locked.");
    mitigationActions.push("Rest affected muscle group immediately. If discomfort persists, consult a qualified healthcare professional.");
    isRestMandated = true;
  }

  // Determine Overall Risk Level
  let riskLevel: RiskLevel = "LOW";
  if (riskScore >= 70 || isRestMandated) {
    riskLevel = "CRITICAL_DELOAD";
  } else if (riskScore >= 45 || isDeloadMandated) {
    riskLevel = "ELEVATED";
  } else if (riskScore >= 25) {
    riskLevel = "MODERATE";
  }

  return {
    riskLevel,
    trainingLoadRisk,
    recoveryRisk,
    formFatigueRisk,
    riskScore: Math.min(100, riskScore),
    mitigationActions,
    safetyWarnings,
    isDeloadMandated,
    isRestMandated,
  };
}
