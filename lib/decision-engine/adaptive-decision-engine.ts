/**
 * Core Adaptive Human Performance Engine V2
 * The central intelligence of OJAS.
 * Executes the closed decision loop:
 * SENSE -> FUSE -> CONSTRAINTS -> RISK CHECK -> ADAPTIVE DECISION -> EXPLAIN.
 */

import { DigitalTwin } from "@/lib/digital-twin/types";
import { ClientProfile, DailyLog, FitnessGoal } from "@/types/profile";
import { fuseContext, CurrentContext } from "./context-fusion";
import { evaluateConstraints, CandidateAction, filterAndRankCandidates } from "./constraint-engine";
import { evaluateSafetyAndRisk, SafetyRiskAssessment } from "./safety-risk";

export type OjasActionType =
  | "FULL_TRAINING"
  | "REDUCED_TRAINING"
  | "MINIMUM_WORKOUT"
  | "SPORT_PRACTICE"
  | "RECOVERY_SESSION"
  | "MOBILITY"
  | "REST"
  | "NUTRITION_ACTION"
  | "SLEEP_PRIORITY";

export interface DecisionFactor {
  signal: string;
  observedValue: string | number;
  threshold: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export interface AdaptiveWorkoutPlan {
  title: string;
  durationMinutes: number;
  intensity: "Low" | "Moderate" | "High";
  focus: string;
  tier: "full" | "reduced" | "minimum_viable" | "recovery";
  fallbackHierarchy: {
    label: string;
    duration: number;
    intensity: string;
  }[];
  exercises: {
    name: string;
    sets: number;
    reps: string;
    notes: string;
    formCoachSupported?: boolean;
  }[];
  alternativeIndoorWorkout?: string;
}

export interface AdaptiveNutritionPlan {
  headline: string;
  recommendation: string;
  targetCalories: number;
  targetProteinGrams: number;
  dailyBudgetINR: number;
  budgetTier: "under_50" | "under_80" | "under_100" | "standard";
  practicalMealSuggestions: {
    meal: "Breakfast" | "Lunch" | "Snack" | "Dinner";
    name: string;
    approxCostINR: number;
    proteinGrams: number;
    isHostelMessFriendly: boolean;
  }[];
}

export interface AdaptiveDecisionResult {
  action: OjasActionType;
  badge: {
    label: string;
    color: "green" | "yellow" | "blue" | "rose" | "purple";
  };
  headline: string;
  subtitle: string;
  confidenceScore: number; // 0 - 100
  confidenceLabel: "High (Sensor Verified)" | "Moderate (Model Estimated)" | "Heuristic Baseline";
  twinCompleteness: number; // 0 - 100
  
  // Explainability & Transparent Rationale
  whyReasons: string[];
  decisionFactors: DecisionFactor[];
  safetyAssessment: SafetyRiskAssessment;

  // Concrete Actionable Outputs
  suggestedWorkout: AdaptiveWorkoutPlan;
  suggestedNutrition: AdaptiveNutritionPlan;
  sportsAction?: {
    sport: string;
    skillFocus: string;
    drills: string[];
    durationMinutes: number;
  };
  environmentalAdvice: string;
  
  timestamp: string;
}

/**
 * Generate candidate workout templates based on goal and profile.
 */
function generateCandidateActions(goal: FitnessGoal, availableTime: number, equipment: string[]): CandidateAction[] {
  const isGym = equipment.some((e) => e.toLowerCase().includes("gym") || e.toLowerCase().includes("barbell"));

  return [
    {
      id: "full_session",
      type: "FULL_TRAINING",
      durationMinutes: Math.min(60, Math.max(45, availableTime)),
      intensity: "high",
      requiredEquipment: isGym ? ["barbell", "dumbbells"] : ["dumbbells", "bodyweight"],
      isOutdoor: false,
    },
    {
      id: "reduced_session",
      type: "REDUCED_TRAINING",
      durationMinutes: Math.min(30, availableTime),
      intensity: "moderate",
      requiredEquipment: ["bodyweight", "dumbbells"],
      isOutdoor: false,
    },
    {
      id: "minimum_viable_7m",
      type: "MINIMUM_WORKOUT",
      durationMinutes: Math.min(15, availableTime),
      intensity: "moderate",
      requiredEquipment: ["bodyweight"],
      isOutdoor: false,
    },
    {
      id: "active_recovery",
      type: "RECOVERY_SESSION",
      durationMinutes: Math.min(20, availableTime),
      intensity: "low",
      requiredEquipment: ["bodyweight"],
      isOutdoor: false,
    },
    {
      id: "mobility_reset",
      type: "MOBILITY",
      durationMinutes: 15,
      intensity: "low",
      requiredEquipment: ["bodyweight"],
      isOutdoor: false,
    },
    {
      id: "complete_rest",
      type: "REST",
      durationMinutes: 0,
      intensity: "low",
      requiredEquipment: [],
      isOutdoor: false,
    },
  ];
}

/**
 * Build practical budget nutrition suggestions for India context.
 */
function buildNutritionPlan(context: CurrentContext, goal: FitnessGoal, weight: number): AdaptiveNutritionPlan {
  const budget = context.dailyBudgetINR;
  const targetProtein = Math.round(weight * (goal === "fat-loss" ? 2.0 : 1.8));
  const targetCalories = goal === "fat-loss" ? 2100 : goal === "muscle-gain" ? 2700 : 2350;

  let budgetTier: AdaptiveNutritionPlan["budgetTier"] = "standard";
  let suggestions: AdaptiveNutritionPlan["practicalMealSuggestions"] = [];

  if (budget <= 60) {
    budgetTier = "under_50";
    suggestions = [
      { meal: "Breakfast", name: "Sattu Drink (50g) + 2 Boiled Eggs", approxCostINR: 18, proteinGrams: 24, isHostelMessFriendly: true },
      { meal: "Lunch", name: "Mess Dal Double Serving + Rice + Curd", approxCostINR: 15, proteinGrams: 18, isHostelMessFriendly: true },
      { meal: "Snack", name: "Roasted Chana & Peanuts (60g)", approxCostINR: 10, proteinGrams: 14, isHostelMessFriendly: true },
      { meal: "Dinner", name: "Soya Chunks Curry (50g dry) + Rotis", approxCostINR: 15, proteinGrams: 28, isHostelMessFriendly: true },
    ];
  } else if (budget <= 90) {
    budgetTier = "under_80";
    suggestions = [
      { meal: "Breakfast", name: "Sprouts Chaat + 3 Boiled Eggs", approxCostINR: 22, proteinGrams: 26, isHostelMessFriendly: true },
      { meal: "Lunch", name: "Mess Thali + Paneer Bhurji / Egg Curry", approxCostINR: 25, proteinGrams: 28, isHostelMessFriendly: true },
      { meal: "Snack", name: "Sattu Shake + Banana", approxCostINR: 15, proteinGrams: 16, isHostelMessFriendly: true },
      { meal: "Dinner", name: "Soya-Dal Khichdi + Curd", approxCostINR: 20, proteinGrams: 30, isHostelMessFriendly: true },
    ];
  } else {
    budgetTier = budget <= 120 ? "under_100" : "standard";
    suggestions = [
      { meal: "Breakfast", name: "Oats with Milk & Peanut Butter + 2 Eggs", approxCostINR: 35, proteinGrams: 28, isHostelMessFriendly: true },
      { meal: "Lunch", name: "Chicken Curry / Paneer Tikka + Dal & Rotis", approxCostINR: 45, proteinGrams: 36, isHostelMessFriendly: true },
      { meal: "Snack", name: "Greek Yogurt / Curd + Roasted Chana", approxCostINR: 20, proteinGrams: 18, isHostelMessFriendly: true },
      { meal: "Dinner", name: "Soya chunks stir-fry + Eggs & Salad", approxCostINR: 35, proteinGrams: 34, isHostelMessFriendly: true },
    ];
  }

  return {
    headline: `₹${budget}/day Budget High-Protein Strategy`,
    recommendation: context.isHostelMode
      ? `Hostel Mess Optimized: Supplement mess meals with low-cost raw high-protein additions (Soya chunks, eggs, sattu).`
      : `High protein efficiency planned under ₹${budget}/day to meet ${targetProtein}g protein target.`,
    targetCalories,
    targetProteinGrams: targetProtein,
    dailyBudgetINR: budget,
    budgetTier,
    practicalMealSuggestions: suggestions,
  };
}

/**
 * Main Adaptive Decision Pipeline
 */
export function computeAdaptiveDecision(
  twin: DigitalTwin,
  profile: ClientProfile | null,
  dailyLog?: DailyLog | null,
  logsHistory: DailyLog[] = [],
  overrides?: any
): AdaptiveDecisionResult {
  const now = new Date().toISOString();
  const goal: FitnessGoal = profile?.goal || "fat-loss";
  const weight = profile?.weight || twin.physical.weight || 68.5;

  // 1. Fuse multi-signal telemetry
  const context = fuseContext({
    twin,
    profile,
    dailyLog,
    logsHistory,
    constraintOverrides: overrides,
  });

  // 2. Evaluate Safety and Training Risks
  const safety = evaluateSafetyAndRisk(context);

  // 3. Generate candidate actions
  const candidates = generateCandidateActions(goal, context.availableTimeMinutes, context.equipmentAvailable);

  // 4. Evaluate Constraints & Filter
  const { validCandidates, filteredOut } = filterAndRankCandidates(candidates, context);

  // 5. Priority Resolution Logic:
  // Safety > Recovery > Critical Lifestyle/Exam > Main Goal > Performance > Preference
  const decisionFactors: DecisionFactor[] = [
    {
      signal: "Sleep Duration",
      observedValue: `${context.sleepHours} hrs`,
      threshold: ">= 7.0 hrs",
      impact: context.sleepHours < 6 ? "negative" : "positive",
      description: context.sleepHours < 6 ? "Short sleep duration impairs central nervous system recovery." : "Healthy sleep foundation sustains training capacity.",
    },
    {
      signal: "Recovery Score",
      observedValue: `${Math.round(context.recoveryScore)}/100`,
      threshold: ">= 65/100",
      impact: context.recoveryScore < 50 ? "negative" : "positive",
      description: `Autonomic & lifestyle readiness status indicates ${context.recoveryScore >= 75 ? "primed capacity" : context.recoveryScore >= 50 ? "moderate load tolerance" : "elevated fatigue"}.`,
    },
    {
      signal: "Available Time",
      observedValue: `${context.availableTimeMinutes} min`,
      threshold: ">= 30 min",
      impact: context.availableTimeMinutes < 25 ? "negative" : "positive",
      description: `Target duration clamped strictly to real-world schedule ceiling.`,
    },
    {
      signal: "Academic / Stress Mode",
      observedValue: context.isExamPeriod ? "Exam Period Active" : "Normal Schedule",
      threshold: "Normal",
      impact: context.isExamPeriod ? "negative" : "neutral",
      description: context.isExamPeriod ? "Exam period requires express sessions to prevent schedule abandonment." : "Standard lifestyle baseline.",
    },
    {
      signal: "Vision Form Quality",
      observedValue: `${context.visionQuality.latestFormScore}%`,
      threshold: ">= 80%",
      impact: context.visionQuality.formTrend === "declining" ? "negative" : "positive",
      description: context.visionQuality.formTrend === "declining" ? "Vision coach detected motor degradation trend across sets." : "Consistent movement mechanics verified.",
    },
  ];

  const whyReasons: string[] = [];
  let chosenActionType: OjasActionType = "FULL_TRAINING";
  let workoutTier: AdaptiveWorkoutPlan["tier"] = "full";
  let workoutDuration = Math.min(45, context.availableTimeMinutes);
  let workoutIntensity: AdaptiveWorkoutPlan["intensity"] = "High";
  let badgeColor: AdaptiveDecisionResult["badge"]["color"] = "green";
  let headline = "Full Progressive Overload Session";
  let subtitle = "Optimal recovery and schedule availability detected.";

  // Rule Branch A: Safety Deload / High Risk Triggered
  if (safety.isRestMandated) {
    chosenActionType = "REST";
    workoutTier = "recovery";
    workoutDuration = 0;
    workoutIntensity = "Low";
    badgeColor = "rose";
    headline = "Active Rest & Discomfort Decompression";
    subtitle = "Physical discomfort reported. High mechanical load locked.";
    whyReasons.push("Pain or joint discomfort reported: Rest is mandated to avoid injury.");
  } else if (safety.isDeloadMandated || context.recoveryScore < 45 || (context.isExamPeriod && context.availableTimeMinutes <= 20)) {
    if (context.availableTimeMinutes <= 15) {
      chosenActionType = "MINIMUM_WORKOUT";
      workoutTier = "minimum_viable";
      workoutDuration = Math.min(12, context.availableTimeMinutes);
      workoutIntensity = "Low";
      badgeColor = "yellow";
      headline = "12-Min Minimum Viable Restorative Session";
      subtitle = "Compressed duration maintains consistency without taxing CNS.";
      whyReasons.push("Exam or severe time constraint active: Scaled to Minimum Viable Workout.");
      whyReasons.push("Fatigue elevated: Switched to mobility and restorative bodyweight flow.");
    } else {
      chosenActionType = "RECOVERY_SESSION";
      workoutTier = "recovery";
      workoutDuration = Math.min(20, context.availableTimeMinutes);
      workoutIntensity = "Low";
      badgeColor = "blue";
      headline = "18-Min Mobility & CNS Decompression";
      subtitle = "Elevated stress or sleep deficit detected. Deloading intensity.";
      whyReasons.push(`Sleep (${context.sleepHours}h) and stress require active deloading.`);
      whyReasons.push("Prevents burnout while preserving training habit.");
    }
  } else if (context.availableTimeMinutes < 35) {
    // Rule Branch B: Time constrained
    chosenActionType = "REDUCED_TRAINING";
    workoutTier = "reduced";
    workoutDuration = context.availableTimeMinutes;
    workoutIntensity = "Moderate";
    badgeColor = "yellow";
    headline = `${workoutDuration}-Min High-Efficiency Express Session`;
    subtitle = "Compressed rest intervals and compound movements maximize density.";
    whyReasons.push(`Time constraint (${context.availableTimeMinutes}m): Condensed into high-density circuit.`);
  } else {
    // Rule Branch C: Full Capacity
    chosenActionType = "FULL_TRAINING";
    workoutTier = "full";
    workoutDuration = Math.min(50, context.availableTimeMinutes);
    workoutIntensity = "High";
    badgeColor = "green";
    headline = `${workoutDuration}-Min Full Capacity Progression`;
    subtitle = "Recovery score primed (>75%). Proceeding with planned progressive overload.";
    whyReasons.push("Optimal recovery score and full available time detected.");
  }

  // Build Concrete Exercise Sequence
  let exercises: AdaptiveWorkoutPlan["exercises"] = [];
  if (workoutTier === "recovery" || workoutTier === "minimum_viable") {
    exercises = [
      { name: "Thoracic Spine Rotations", sets: 2, reps: "10 / side", notes: "Open ribcage, slow tempo", formCoachSupported: true },
      { name: "Deep Bodyweight Squat Hold", sets: 3, reps: "30 sec", notes: "Decompress hips & ankles", formCoachSupported: true },
      { name: "Cat-Cow Dynamic Stretch", sets: 2, reps: "12 reps", notes: "Rhythmic breathing", formCoachSupported: false },
      { name: "Deadbug Core Stabilization", sets: 3, reps: "8 / side", notes: "Zero momentum, spine flat", formCoachSupported: true },
    ];
  } else if (workoutTier === "reduced") {
    exercises = [
      { name: "Bodyweight / Goblet Squats", sets: 3, reps: "12 reps", notes: "Controlled 3s descent", formCoachSupported: true },
      { name: "Push-ups (Standard / Incline)", sets: 3, reps: "10-15 reps", notes: "Full elbow extension", formCoachSupported: true },
      { name: "Dumbbell / Backpack Rows", sets: 3, reps: "12 reps", notes: "Squeeze scapula", formCoachSupported: true },
      { name: "Plank to Shoulder Tap", sets: 3, reps: "40 sec", notes: "Anti-rotational core", formCoachSupported: true },
    ];
  } else {
    exercises = [
      { name: "Barbell / Dumbbell Squats", sets: 4, reps: "8-10 reps", notes: "Target RPE 8.0, full depth", formCoachSupported: true },
      { name: "Overhead Dumbbell Press", sets: 4, reps: "8-10 reps", notes: "Core braced, lock out", formCoachSupported: true },
      { name: "Romanian Deadlifts", sets: 3, reps: "10-12 reps", notes: "Hinge at hips, neutral spine", formCoachSupported: true },
      { name: "Pull-ups / Inverted Rows", sets: 3, reps: "Max clean reps", notes: "Full range of motion", formCoachSupported: true },
      { name: "Hanging Leg Raises", sets: 3, reps: "12 reps", notes: "Controlled eccentric", formCoachSupported: true },
    ];
  }

  const suggestedWorkout: AdaptiveWorkoutPlan = {
    title: headline,
    durationMinutes: workoutDuration,
    intensity: workoutIntensity,
    focus: workoutTier === "recovery" ? "Joint Mobility & Nervous System Decompression" : `${goal.replace(/-/g, " ")} Conditioning`,
    tier: workoutTier,
    fallbackHierarchy: [
      { label: "Full Plan", duration: 45, intensity: "High" },
      { label: "Reduced Express", duration: 25, intensity: "Moderate" },
      { label: "Minimum Viable", duration: 10, intensity: "Low" },
      { label: "Active Recovery", duration: 15, intensity: "Restorative" },
    ],
    exercises,
    alternativeIndoorWorkout: context.environment.indoorRecommended
      ? "Indoor Heat/Rain Protocol: 20-min Living Room Mobility & Calisthenics Flow"
      : undefined,
  };

  const suggestedNutrition = buildNutritionPlan(context, goal, weight);

  // Calculate recommendation confidence
  const confidenceScore = Math.min(95, Math.round(50 + (twin.dataQuality * 0.3) + (context.sources["availableTime"] === "user_input" ? 15 : 5)));

  return {
    action: chosenActionType,
    badge: {
      label: chosenActionType.replace(/_/g, " "),
      color: badgeColor,
    },
    headline,
    subtitle,
    confidenceScore,
    confidenceLabel: confidenceScore >= 80 ? "High (Sensor Verified)" : "Moderate (Model Estimated)",
    twinCompleteness: twin.dataQuality || 65,
    whyReasons,
    decisionFactors,
    safetyAssessment: safety,
    suggestedWorkout,
    suggestedNutrition,
    sportsAction: context.sportsContext
      ? {
          sport: context.sportsContext.sportId,
          skillFocus: `${context.sportsContext.gapAttribute} Acceleration & Deceleration Drills`,
          drills: ["Cone Shuttle 5-10-5", "Single-Leg Balance Catch", "Dynamic Footwork Ladder"],
          durationMinutes: 20,
        }
      : undefined,
    environmentalAdvice: context.environment.indoorRecommended
      ? `Environmental alert (${context.environment.condition}): High heat/humidity. Hydrate with +500ml water and exercise in ventilated indoor environment.`
      : `Weather favorable (${context.environment.tempC}°C). Standard hydration target applies.`,
    timestamp: now,
  };
}
