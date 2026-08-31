import type { SportTwinState } from "@/lib/sports/types";
import { ClientProfile, FitnessGoal, ActivityLevel, StressLevel } from "@/types/profile";

/**
 * Digital Twin V2: Persistent, evolving representation of user's complete biological & behavioral state.
 * Updated as new data arrives via events. Drives continuous adaptive decision making.
 */

export type TwinState = "initial" | "developing" | "stable" | "adapting" | "deloading" | "recovery_priority";

export interface PhysicalState {
  weight: number;
  height?: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
    neck?: number;
  };
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  strengthTrend: "decreasing" | "stable" | "increasing";
  mobilityTrend: "improving" | "stable" | "restricted";
  formQualityScore: number; // 0-100 derived from Vision Coach
  workoutPerformance: {
    avgRepRange: [number, number];
    avgDuration: number; // typical workout duration (minutes)
    exercises: string[];
    recentFormScores: number[]; // rolling form scores
  };
}

export interface BehavioralState {
  workoutConsistency: number; // 0-100: adherence rate
  missedWorkouts: number; // count in recent period
  consecutiveMisses: number;
  skipReasons: Record<string, number>; // e.g. { "exam_study": 3, "fatigue": 1 }
  preferredWorkoutTime: string; // "morning", "evening", "midday"
  preferredDuration: number; // minutes
  workoutDaysPerWeekActual: number;
  exercisePreferences: string[];
  adherencePattern: "high" | "moderate" | "low" | "at_risk";
  frictionPoints: string[]; // e.g. "Evening workouts skipped during exams"
}

export interface RecoveryState {
  sleepDuration: number; // hours
  sleepQuality: "poor" | "average" | "good" | "optimal";
  fatigueLevel: number; // 0-100
  acuteTrainingLoad: number; // last 7 days workload
  chronicTrainingLoad: number; // last 28 days workload
  acuteChronicRatio: number; // ACWR e.g. 0.8 - 1.5
  recoveryScore: number; // 0-100
  readiness: "fresh" | "moderate" | "fatigued" | "overreaching";
  muscleSoreness: {
    upperBody: "none" | "mild" | "moderate" | "severe";
    lowerBody: "none" | "mild" | "moderate" | "severe";
    core: "none" | "mild" | "moderate" | "severe";
  };
  lastRestDay: string; // ISO date
  painDiscomfortReported: boolean;
  painNotes?: string;
}

export interface NutritionState {
  calorieTarget: number;
  averageCaloriesConsumed: number;
  proteinTarget: number;
  averageProteinConsumed: number;
  macroAdherence: {
    protein: number; // 0-100
    carbs: number;
    fat: number;
  };
  foodPreferences: string[];
  budget: number; // daily budget in INR e.g. 80, 100, 150
  budgetAdherence: number; // 0-100
  isHostelMode: boolean;
  messContext?: {
    identifiedMeals: string[];
    proteinLagging: boolean;
  };
  hydrationLevel: number; // liters/day
}

export interface LifestyleState {
  availableTime: number; // minutes per day for fitness
  availableEquipment: string[];
  workoutEnvironment: "gym" | "home" | "both" | "limited" | "outdoor" | "college";
  stressLevel: StressLevel;
  lifestyle: string;
  isExamPeriod: boolean;
  travelStatus: "home" | "travelling" | "hostel";
  occupationalActivity: "sedentary" | "light" | "moderate" | "active";
  workStudyHours: number; // hours/day
}

export interface EnvironmentState {
  temperatureC?: number;
  feelsLikeC?: number;
  humidityPct?: number;
  airQualityIndex?: number;
  isHeatWaveAlert?: boolean;
  condition?: "sunny" | "hot" | "humid" | "rainy" | "cool" | "cloudy" | "indoor_controlled" | "unavailable";
  recommendIndoor: boolean;
}

export interface ContextChanges {
  availableTimeChange?: { before: number; after: number };
  sleepChange?: { before: number; after: number };
  stressLevelChange?: { before: string; after: string };
  budgetChange?: { before: number; after: number };
  travelChange?: { before: string; after: string };
  equipmentChange?: { before: string[]; after: string[] };
  examChange?: { before: boolean; after: boolean };
  formChange?: { before: number; after: number };
  timestamp: string;
  reason?: string;
}

/**
 * Event-Driven Update Architecture:
 * Emitted by Vision Coach, Logs, User Inputs, Context Sensor, and Feedback loops.
 */
export type TwinEventType =
  | "WORKOUT_COMPLETED"
  | "WORKOUT_SKIPPED"
  | "FORM_SCORE_UPDATED"
  | "FORM_DEGRADATION_DETECTED"
  | "SLEEP_LOGGED"
  | "STRESS_UPDATED"
  | "EXAM_MODE_TOGGLED"
  | "BUDGET_CHANGED"
  | "TIME_CONSTRAINTS_UPDATED"
  | "EQUIPMENT_UPDATED"
  | "ENVIRONMENT_UPDATED"
  | "TRAVEL_UPDATED"
  | "SPORTS_PRACTICE_LOGGED"
  | "USER_FEEDBACK_RECEIVED"
  | "PROFILE_UPDATED";

export interface TwinEvent<T = any> {
  id: string;
  type: TwinEventType;
  userId: string;
  timestamp: string;
  payload: T;
}

/**
 * The Digital Twin V2 Model
 */
export interface DigitalTwin {
  id: string;
  userId: string;
  version: number;
  timestamp: string;
  state: TwinState;

  // Core state layers
  physical: PhysicalState;
  behavioral: BehavioralState;
  recovery: RecoveryState;
  nutrition: NutritionState;
  lifestyle: LifestyleState;
  environment: EnvironmentState;
  sport?: SportTwinState;

  // Tracking & Diagnostics
  recentChanges: ContextChanges[];
  lastUpdated: string;
  dataQuality: number; // 0-100: data completeness & signal freshness
  notes: string[];
}

/**
 * Twin Delta: What changed between two snapshots.
 */
export interface TwinDelta {
  fromVersion: number;
  toVersion: number;
  physicalDelta?: Partial<PhysicalState>;
  behavioralDelta?: Partial<BehavioralState>;
  recoveryDelta?: Partial<RecoveryState>;
  nutritionDelta?: Partial<NutritionState>;
  lifestyleDelta?: Partial<LifestyleState>;
  environmentDelta?: Partial<EnvironmentState>;
  significantChanges: string[];
  timestamp: string;
}

/**
 * Twin History
 */
export interface TwinHistory {
  userId: string;
  twins: DigitalTwin[];
  deltas: TwinDelta[];
  createdAt: string;
  lastUpdated: string;
}
