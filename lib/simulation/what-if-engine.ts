/**
 * What-If Simulation Engine
 * Runs hypothetical user contexts through the exact same Adaptive Decision Engine
 * WITHOUT modifying the user's real Digital Twin.
 */

import { DigitalTwin } from "@/lib/digital-twin/types";
import { ClientProfile } from "@/types/profile";
import { computeAdaptiveDecision, AdaptiveDecisionResult } from "@/lib/decision-engine/adaptive-decision-engine";

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  overrides: {
    availableTime?: number;
    sleepHours?: number;
    isExamPeriod?: boolean;
    equipment?: string[];
    dailyBudgetINR?: number;
    travelStatus?: "home" | "travelling" | "hostel";
    stressLevel?: "low" | "medium" | "high";
  };
}

export interface SimulationResult {
  scenario: SimulationScenario;
  baselineDecision: AdaptiveDecisionResult;
  simulatedDecision: AdaptiveDecisionResult;
  comparisonHighlights: {
    metric: string;
    before: string;
    after: string;
    reason: string;
  }[];
}

export const PRESET_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: "exam_crunch",
    title: "📚 Exam Period Begins",
    description: "Available time drops to 18 min, sleep drops to 5.5 hours, high study stress.",
    overrides: {
      isExamPeriod: true,
      availableTime: 18,
      sleepHours: 5.5,
      stressLevel: "high",
    },
  },
  {
    id: "hotel_travel",
    title: "✈️ Travel / Hotel Room (No Equipment)",
    description: "Away from gym, bodyweight only, 20-min available window.",
    overrides: {
      travelStatus: "travelling",
      availableTime: 20,
      equipment: ["bodyweight"],
    },
  },
  {
    id: "budget_crunch",
    title: "💰 Budget Drops to ₹80/day",
    description: "Need ultra-high protein efficiency on an ₹80 daily grocery/mess allowance.",
    overrides: {
      dailyBudgetINR: 80,
    },
  },
  {
    id: "express_15m",
    title: "⚡ Time Crunch (Only 15 Minutes)",
    description: "Extremely busy day with only 15 minutes before daily commitments.",
    overrides: {
      availableTime: 15,
    },
  },
  {
    id: "poor_sleep_recovery",
    title: "😴 Severe Sleep Deficit (4.5h)",
    description: "Insomnia or late night results in high central nervous system fatigue.",
    overrides: {
      sleepHours: 4.5,
      stressLevel: "high",
    },
  },
];

/**
 * Execute a simulation scenario against a cloned Digital Twin.
 */
export function runWhatIfSimulation(
  twin: DigitalTwin,
  profile: ClientProfile | null,
  scenario: SimulationScenario
): SimulationResult {
  // 1. Compute baseline decision with real state
  const baselineDecision = computeAdaptiveDecision(twin, profile);

  // 2. Clone Digital Twin deeply to prevent any leakage or mutation
  const clonedTwin: DigitalTwin = JSON.parse(JSON.stringify(twin));

  // 3. Compute simulated decision with overrides
  const simulatedDecision = computeAdaptiveDecision(clonedTwin, profile, null, [], scenario.overrides);

  // 4. Compute comparison highlights
  const comparisonHighlights: SimulationResult["comparisonHighlights"] = [];

  if (baselineDecision.suggestedWorkout.durationMinutes !== simulatedDecision.suggestedWorkout.durationMinutes) {
    comparisonHighlights.push({
      metric: "Workout Duration",
      before: `${baselineDecision.suggestedWorkout.durationMinutes} min`,
      after: `${simulatedDecision.suggestedWorkout.durationMinutes} min`,
      reason: `Adapted to fit simulated time ceiling of ${scenario.overrides.availableTime ?? "adjusted"}m.`,
    });
  }

  if (baselineDecision.suggestedWorkout.intensity !== simulatedDecision.suggestedWorkout.intensity) {
    comparisonHighlights.push({
      metric: "Workout Intensity",
      before: baselineDecision.suggestedWorkout.intensity,
      after: simulatedDecision.suggestedWorkout.intensity,
      reason: "Intensity deloaded to match recovery and stress capacity.",
    });
  }

  if (baselineDecision.suggestedNutrition.dailyBudgetINR !== simulatedDecision.suggestedNutrition.dailyBudgetINR) {
    comparisonHighlights.push({
      metric: "Nutrition Budget Tier",
      before: `₹${baselineDecision.suggestedNutrition.dailyBudgetINR}/day`,
      after: `₹${simulatedDecision.suggestedNutrition.dailyBudgetINR}/day`,
      reason: "Recomputed high-protein swaps for low-cost Indian staple foods.",
    });
  }

  if (baselineDecision.action !== simulatedDecision.action) {
    comparisonHighlights.push({
      metric: "Primary Recommendation",
      before: baselineDecision.headline,
      after: simulatedDecision.headline,
      reason: simulatedDecision.whyReasons[0] || "Safety & constraint filters modified primary action.",
    });
  }

  return {
    scenario,
    baselineDecision,
    simulatedDecision,
    comparisonHighlights,
  };
}
