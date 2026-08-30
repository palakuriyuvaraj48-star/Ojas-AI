/**
 * Adaptive Plan Types: Captures current fitness plan and how it should adapt.
 */

export interface WorkoutPlan {
  id: string;
  durationMinutes: number;
  daysPerWeek: number;
  intensity: "low" | "moderate" | "high";
  exercises: {
    name: string;
    sets: number;
    reps: [number, number]; // min-max range
    rest: number; // seconds
    notes: string;
  }[];
  focusAreas: string[];
  equipment: string[];
  expectedProgress: string;
}

export interface NutritionPlan {
  id: string;
  dailyCalories: number;
  macros: {
    protein: { grams: number; percent: number };
    carbs: { grams: number; percent: number };
    fat: { grams: number; percent: number };
  };
  meals: {
    label: string; // "breakfast", "lunch", etc.
    calorieTarget: number;
    mealOptions: string[];
    proteinTarget: number;
  }[];
  budget: number;
  foodPreferences: string[];
  notes: string;
}

export interface RecoveryPlan {
  id: string;
  sleepTarget: number; // hours
  restDays: number;
  mobilityMinutes: number;
  stressManagement: string[];
  notes: string;
}

export interface FitnessPlan {
  id: string;
  userId: string;
  version: number;
  timestamp: string;
  name: string;
  goal: string;
  duration: number; // weeks
  workoutPlan: WorkoutPlan;
  nutritionPlan: NutritionPlan;
  recoveryPlan: RecoveryPlan;
  milestones: {
    week: number;
    target: string;
    expectedProgress: string;
  }[];
  /** Prototype AI Decision Confidence: transparent rule-evidence score, not a clinical prediction. */
  confidence: number; // 0-100
  notes?: string[];
}

/**
 * Adaptation recommendation: what should change in the plan and why.
 */
export interface AdaptationRecommendation {
  id: string;
  planId: string;
  type:
    | "workout-duration"
    | "workout-intensity"
    | "training-days"
    | "exercise-selection"
    | "nutrition-calories"
    | "nutrition-budget"
    | "recovery-priority"
    | "milestones"
    | "overall-strategy";
  currentValue: any;
  recommendedValue: any;
  reasoning: string; // why this change is recommended
  /** Prototype AI Decision Confidence: transparent rule-evidence score, not a clinical prediction. */
  confidence: number; // 0-100
  impact: "low" | "medium" | "high";
  relatedFactors: string[]; // "available_time", "sleep_quality", "recovery_score", etc.
}

/**
 * Adapted plan: the new plan after applying adaptations.
 */
export interface AdaptedPlan extends FitnessPlan {
  previousVersion: number;
  adaptations: AdaptationRecommendation[];
  changeReasoning: string; // summary of why the plan changed
  beforeAfterComparison: {
    category: string;
    before: string;
    after: string;
  }[];
  timelineAdjustment?: number; // weeks added/removed
}
