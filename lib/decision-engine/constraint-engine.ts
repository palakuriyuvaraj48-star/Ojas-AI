/**
 * Engine 3: Constraint Engine
 * Evaluates Hard and Soft constraints against candidate actions.
 * Enforces real-world feasibility so Ojas never proposes impossible plans.
 */

import { CurrentContext } from "./context-fusion";

export interface CandidateAction {
  id: string;
  type: "FULL_TRAINING" | "REDUCED_TRAINING" | "MINIMUM_WORKOUT" | "SPORT_PRACTICE" | "RECOVERY_SESSION" | "MOBILITY" | "REST";
  durationMinutes: number;
  intensity: "low" | "moderate" | "high";
  requiredEquipment: string[];
  isOutdoor: boolean;
  targetBudgetINR?: number;
}

export interface ConstraintEvaluationResult {
  feasible: boolean;
  hardViolations: string[];
  softPenalties: number; // 0 - 100 penalty score (higher = less ideal)
  maxAllowedDuration: number;
  allowedEquipment: string[];
  isRecoveryMandated: boolean;
  rationale: string[];
}

/**
 * Check if required equipment is satisfied by user's available equipment.
 */
function isEquipmentSatisfied(required: string[], available: string[]): boolean {
  if (!required || required.length === 0) return true;
  const availNormalized = available.map((e) => e.toLowerCase().trim());
  if (availNormalized.includes("all") || availNormalized.includes("gym")) return true;

  return required.every((req) => {
    const r = req.toLowerCase().trim();
    if (r === "bodyweight" || r === "none") return true;
    return availNormalized.some((a) => a.includes(r) || r.includes(a));
  });
}

/**
 * Evaluate constraints against a candidate action.
 */
export function evaluateConstraints(
  action: CandidateAction,
  context: CurrentContext
): ConstraintEvaluationResult {
  const hardViolations: string[] = [];
  const rationale: string[] = [];
  let softPenalties = 0;

  // 1. Hard Constraint: Available Time
  if (action.durationMinutes > context.availableTimeMinutes) {
    hardViolations.push(
      `Duration of ${action.durationMinutes}m exceeds available time limit (${context.availableTimeMinutes}m).`
    );
  }

  // 2. Hard Constraint: Equipment Availability
  if (!isEquipmentSatisfied(action.requiredEquipment, context.equipmentAvailable)) {
    hardViolations.push(
      `Requires ${action.requiredEquipment.join(", ")}, which is not available in current setup (${context.equipmentAvailable.join(", ")}).`
    );
  }

  // 3. Hard Constraint: Severe Pain or Discomfort
  let isRecoveryMandated = false;
  if (context.painReported && (action.intensity === "high" || action.intensity === "moderate")) {
    hardViolations.push(
      "Discomfort/pain reported: High or moderate intensity training is locked for safety."
    );
    isRecoveryMandated = true;
  }

  // 4. Hard Constraint: Extreme Environmental Heat Alert (Outdoor)
  if (action.isOutdoor && context.environment.indoorRecommended) {
    hardViolations.push(
      `Extreme outdoor conditions (${context.environment.condition}). Outdoor workout prohibited.`
    );
  }

  // 5. Hard Constraint: Low Budget Nutrition Boundary
  if (action.targetBudgetINR && action.targetBudgetINR > context.dailyBudgetINR) {
    hardViolations.push(
      `Meal strategy cost ₹${action.targetBudgetINR} exceeds daily budget boundary (₹${context.dailyBudgetINR}).`
    );
  }

  // --- Soft Constraint Evaluations (Penalties) ---
  // Soft Constraint: High Exam Stress vs High Intensity
  if (context.isExamPeriod && action.intensity === "high") {
    softPenalties += 35;
    rationale.push("High intensity during active exam week increases cognitive fatigue.");
  }

  // Soft Constraint: Poor Sleep vs Long Workout
  if (context.sleepHours < 6 && action.durationMinutes > 30) {
    softPenalties += 30;
    rationale.push("Workout duration exceeds optimal metabolic capacity for <6h sleep.");
  }

  // Soft Constraint: Recovery Score vs Training Volume
  if (context.recoveryScore < 50 && action.intensity !== "low") {
    softPenalties += 40;
    rationale.push("Low recovery score (<50) penalizes intense workouts.");
  }

  // Soft Constraint: Travel status preference for bodyweight express sessions
  if (context.travelStatus === "travelling" && action.durationMinutes > 25) {
    softPenalties += 20;
    rationale.push("Hotel/travel mode prefers compact sessions (<=25m).");
  }

  return {
    feasible: hardViolations.length === 0,
    hardViolations,
    softPenalties,
    maxAllowedDuration: context.availableTimeMinutes,
    allowedEquipment: context.equipmentAvailable,
    isRecoveryMandated,
    rationale,
  };
}

/**
 * Filter and rank a list of candidate actions.
 */
export function filterAndRankCandidates(
  candidates: CandidateAction[],
  context: CurrentContext
): { validCandidates: CandidateAction[]; filteredOut: { action: CandidateAction; reasons: string[] }[] } {
  const validCandidates: { action: CandidateAction; score: number }[] = [];
  const filteredOut: { action: CandidateAction; reasons: string[] }[] = [];

  for (const candidate of candidates) {
    const evaluation = evaluateConstraints(candidate, context);
    if (!evaluation.feasible) {
      filteredOut.push({ action: candidate, reasons: evaluation.hardViolations });
    } else {
      // Base score 100 minus soft penalties
      const score = 100 - evaluation.softPenalties;
      validCandidates.push({ action: candidate, score });
    }
  }

  // Sort descending by score
  validCandidates.sort((a, b) => b.score - a.score);

  return {
    validCandidates: validCandidates.map((c) => c.action),
    filteredOut,
  };
}
