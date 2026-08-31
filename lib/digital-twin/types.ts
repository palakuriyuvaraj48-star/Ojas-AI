import type { SportTwinState } from "@/lib/sports/types";

/**
 * Digital Twin: Persistent, evolving representation of user's complete state.
 * Updated as new data arrives. Compared against current plan to drive adaptation.
 */

export type TwinState = "initial" | "developing" | "stable" | "adapting";

export interface PhysicalState {
  weight: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
  };
  fitnessLevel: "beginner" | "intermediate" | "advanced"; // inferred from performance
  strengthTrend: "decreasing" | "stable" | "increasing";
  workoutPerformance: {
    avgRepRange: [number, number]; // typical rep range
    avgDuration: number; // typical workout duration
    exercises: string[]; // frequently performed exercises
  };
}

export interface BehavioralState {
  workoutConsistency: number; // 0-100: adherence rate
  missedWorkouts: number; // count in recent period
  preferredWorkoutTime: string; // "morning", "evening", "midday"
  workoutDaysPerWeekActual: number; // actual vs planned
  exercisePreferences: string[];
  adherencePattern: "high" | "moderate" | "low";
}

export interface RecoveryState {
  sleepDuration: number; // hours
  sleepQuality: "poor" | "average" | "good";
  fatigueLevel: number; // 0-100
  trainingLoad: number; // recent cumulative load
  recoveryScore: number; // 0-100
  readiness: "fresh" | "moderate" | "fatigued" | "overreaching";
  hrvTrend?: "decreasing" | "stable" | "increasing";
  lastRestDay: string; // date
}

export interface NutritionState {
  averageCaloriesConsumed: number;
  macroAdhererence: {
    protein: number; // 0-100: adherence to target
    carbs: number;
    fat: number;
  };
  foodPreferences: string[];
  budget: number; // daily budget in rupees
  budgetAdherence: number; // 0-100
  mealFrequency: number; // meals per day
  hydrationLevel: number; // liters/day
}

export interface LifestyleState {
  availableTime: number; // minutes per day for fitness
  availableEquipment: string[];
  workoutEnvironment: "gym" | "home" | "both" | "limited" | "outdoor" | "college";
  stressLevel: "low" | "medium" | "high";
  lifestyle: string; // "student", "working", "busy", etc.
  travelStatus: "home" | "travelling";
  occupationalActivity: "sedentary" | "light" | "moderate" | "active";
  seasonalFactors?: string[];
}

export interface ContextChanges {
  availableTimeChange?: { before: number; after: number };
  sleepChange?: { before: number; after: number };
  stressLevelChange?: { before: string; after: string };
  budgetChange?: { before: number; after: number };
  travelChange?: { before: string; after: string };
  equipmentChange?: { before: string[]; after: string[] };
  timestamp: string;
  reason?: string; // "exam period", "travel", "injury", etc.
}

/**
 * The Digital Twin: Complete, evolving user state model.
 * Version-stamped to track evolution over time.
 */
export interface DigitalTwin {
  id: string;
  userId: string;
  version: number; // incremented on each update
  timestamp: string; // ISO datetime
  state: TwinState;

  // Core state layers
  physical: PhysicalState;
  behavioral: BehavioralState;
  recovery: RecoveryState;
  nutrition: NutritionState;
  lifestyle: LifestyleState;
  sport?: SportTwinState;

  // Tracking
  recentChanges: ContextChanges[];
  lastUpdated: string;
  dataQuality: number; // 0-100: confidence in the twin
  notes?: string[];
}

/**
 * Twin Delta: What changed between two versions.
 */
export interface TwinDelta {
  fromVersion: number;
  toVersion: number;
  physicalDelta?: Partial<PhysicalState>;
  behavioralDelta?: Partial<BehavioralState>;
  recoveryDelta?: Partial<RecoveryState>;
  nutritionDelta?: Partial<NutritionState>;
  lifestyleDelta?: Partial<LifestyleState>;
  significantChanges: string[]; // human-readable summary
  timestamp: string;
}

/**
 * Twin History: Track evolution of user state over time.
 */
export interface TwinHistory {
  userId: string;
  twins: DigitalTwin[];
  deltas: TwinDelta[];
  createdAt: string;
  lastUpdated: string;
}
