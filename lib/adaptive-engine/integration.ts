/**
 * Adaptive Fitness System Integration Layer
 * Extends the existing coach system with Digital Twin and Adaptive Engine capabilities.
 * This module acts as the bridge between the FitnessProvider and the adaptive intelligence.
 */

import {
  createInitialTwin,
  updateTwinFromLogs,
  applyScenario,
  compareTwins,
  DigitalTwin,
  TwinDelta,
} from "@/lib/digital-twin";
import {
  generateInitialPlan,
  adaptPlan,
  FitnessPlan,
  AdaptedPlan,
} from "@/lib/adaptive-engine";
import { ClientProfile, DailyLog, WeeklyCheckIn } from "@/types/profile";

/**
 * Core adaptation context that's passed to API routes.
 * This ties together the user's profile, twin, and plan.
 */
export interface AdaptationContext {
  userId: string;
  profile: ClientProfile;
  dailyLogs: DailyLog[];
  checkIns: WeeklyCheckIn[];
  currentTwin: DigitalTwin | null;
  previousTwin: DigitalTwin | null;
  currentPlan: FitnessPlan | null;
  previousPlan: FitnessPlan | null;
  adaptationHistory: Array<{
    timestamp: string;
    scenario?: string;
    twinDelta?: TwinDelta;
    planAdaptation?: AdaptedPlan;
  }>;
}

/**
 * Initialize or update a user's Digital Twin.
 * Called on first onboarding and periodically as data updates.
 */
export async function initializeUserTwin(
  userId: string,
  profile: ClientProfile
): Promise<DigitalTwin> {
  const twin = createInitialTwin(profile, userId);

  // In production, persist to database:
  // await db.digitalTwins.create({ userId, ...twin })

  return twin;
}

/**
 * Detect and apply scenario changes to the twin.
 * Returns updated twin + adaptation explanation.
 */
export async function detectAndApplyScenario(
  currentTwin: DigitalTwin,
  input: {
    availableTimeMinutes?: number;
    sleepHours?: number;
    stressLevel?: "low" | "medium" | "high";
    foodBudget?: number;
    travelStatus?: "home" | "travelling";
    injuryReport?: boolean;
    gymAccessible?: boolean;
  }
): Promise<{
  updatedTwin: DigitalTwin;
  changesDetected: boolean;
  explanation: string;
  scenario?: string;
}> {
  // Several life changes can happen together. Apply every detected change so an
  // exam period with a lower budget, for example, updates both training and food.
  const scenarios: string[] = [];

  if (
    input.availableTimeMinutes &&
    input.availableTimeMinutes < currentTwin.lifestyle.availableTime * 0.5
  ) {
    scenarios.push("time-constrained");
  }

  if (
    input.sleepHours &&
    (input.sleepHours < 6 || input.sleepHours < currentTwin.recovery.sleepDuration - 1.5)
  ) {
    scenarios.push("poor-sleep");
  }

  if (input.stressLevel === "high" && currentTwin.lifestyle.stressLevel !== "high") {
    scenarios.push("high-stress");
  }

  if (input.foodBudget && input.foodBudget < currentTwin.nutrition.budget * 0.6) {
    scenarios.push("budget-change");
  }

  if (input.travelStatus === "travelling" && currentTwin.lifestyle.travelStatus !== "travelling") {
    scenarios.push("travel");
  }

  if (input.injuryReport) {
    scenarios.push("injury");
  }

  if (input.gymAccessible === false && currentTwin.lifestyle.workoutEnvironment === "gym") {
    scenarios.push("gym-closed");
  }

  if (scenarios.length === 0) {
    return {
      updatedTwin: currentTwin,
      changesDetected: false,
      explanation: "No significant changes detected in your circumstances.",
    };
  }

  // Apply the detected scenario
  const scenarioMap: Record<string, any> = {
    "time-constrained": { type: "exam" }, // exam is the time-constrained scenario
    "poor-sleep": { type: "poor-sleep" },
    "high-stress": { type: "exam" }, // high stress often paired with exams
    "budget-change": { type: "budget-change", metadata: { newBudget: input.foodBudget } },
    travel: { type: "travel" },
    injury: { type: "injury" },
    "gym-closed": { type: "gym-closed" },
  };

  // An exam scenario already captures poor sleep and high stress, so avoid
  // applying those reductions twice while retaining any independent changes.
  const uniqueScenarios = [...new Set(scenarios)].filter(
    (item) => item !== "poor-sleep" && item !== "high-stress" || !scenarios.includes("time-constrained")
  );
  let updatedTwin = currentTwin;
  const explanations: string[] = [];
  for (const scenario of uniqueScenarios) {
    const result = applyScenario(updatedTwin, scenarioMap[scenario]);
    updatedTwin = result.updatedTwin;
    explanations.push(result.explanation);
  }

  return {
    updatedTwin,
    changesDetected: true,
    explanation: explanations.join("\n"),
    scenario: uniqueScenarios.join(", "),
  };
}

/**
 * Generate or adapt a fitness plan based on current twin.
 */
export async function generateOrAdaptPlan(
  profile: ClientProfile,
  currentTwin: DigitalTwin,
  previousTwin: DigitalTwin | null,
  existingPlan: FitnessPlan | null
): Promise<{
  plan: FitnessPlan | AdaptedPlan;
  isAdapted: boolean;
  explanation?: string;
}> {
  // First time: generate initial plan
  if (!existingPlan) {
    const initialPlan = generateInitialPlan(profile, currentTwin);
    return {
      plan: initialPlan,
      isAdapted: false,
    };
  }

  // Subsequent times: check if adaptation is needed
  if (!previousTwin) {
    // No previous twin to compare, return existing plan
    return {
      plan: existingPlan,
      isAdapted: false,
    };
  }

  // Compare twins and adapt if needed
  const adaptedPlan = adaptPlan(existingPlan, currentTwin, previousTwin);

  // Check if adaptations were actually made
  const hasChanges = adaptedPlan.adaptations.length > 0;

  return {
    plan: adaptedPlan,
    isAdapted: hasChanges,
    explanation: hasChanges ? adaptedPlan.changeReasoning : undefined,
  };
}

/**
 * Build adaptation context for use in API routes and components.
 */
export function buildAdaptationContext(
  userId: string,
  profile: ClientProfile,
  dailyLogs: DailyLog[],
  checkIns: WeeklyCheckIn[],
  storedTwins?: { current?: DigitalTwin; previous?: DigitalTwin },
  storedPlans?: { current?: FitnessPlan; previous?: FitnessPlan }
): AdaptationContext {
  return {
    userId,
    profile,
    dailyLogs,
    checkIns,
    currentTwin: storedTwins?.current ?? null,
    previousTwin: storedTwins?.previous ?? null,
    currentPlan: storedPlans?.current ?? null,
    previousPlan: storedPlans?.previous ?? null,
    adaptationHistory: [],
  };
}

/**
 * Format adaptation explanation for UI display.
 */
export function formatAdaptationExplanation(adaptedPlan: AdaptedPlan): string {
  if (!adaptedPlan.adaptations || adaptedPlan.adaptations.length === 0) {
    return "No plan changes were needed.";
  }

  const reasons = adaptedPlan.adaptations
    .map((a) => `• ${a.reasoning}`)
    .join("\n");

  return `Your plan has been adapted:\n\n${reasons}`;
}
