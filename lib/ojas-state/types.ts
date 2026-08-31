/**
 * Canonical Ojas State Types
 * Single source of truth for all user state across the application.
 */

export type PerformanceTrend = "improving" | "stable" | "declining" | "plateau";
export type RecoveryStateStatus = "recovered" | "moderate" | "poor";
export type TrainingRiskLevel = "low" | "moderate" | "elevated";
export type AdherenceLevel = "high" | "moderate" | "low" | "at_risk";

export interface FitnessState {
  strength: number;
  endurance: number;
  mobility: number;
  activityLevel: number;
  trend: PerformanceTrend;
  weeklyWorkouts: number;
  lastWorkoutDate?: string;
}

export interface SportsState {
  sport?: string;
  position?: string;
  skillLevel: number;
  performanceScore: number;
  trainingLoad: number;
  competitionContext?: {
    hasCompetition: boolean;
    daysUntil?: number;
    competitionType?: string;
  };
  trend: PerformanceTrend;
}

export interface RecoveryState {
  sleepHours: number;
  sleepQuality: "poor" | "average" | "good" | "optimal";
  fatigueLevel: number;
  sorenessLevel: "none" | "mild" | "moderate" | "severe";
  recoveryScore: number;
  readiness: "fresh" | "moderate" | "fatigued" | "overreaching";
  status: RecoveryStateStatus;
  hrvStatus?: "elevated" | "stable" | "depressed";
  lastRestDay?: string;
  painReported: boolean;
}

export interface NutritionState {
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  fiberConsumed: number;
  waterTargetLiters: number;
  waterConsumedLiters: number;
  dailyBudgetINR: number;
  spentINR: number;
  isHostelMode: boolean;
  foodPreference: string;
  mealPacing: "on_track" | "protein_lagging" | "calorie_surplus" | "need_fiber";
}

export interface LifestyleState {
  availableTimeMinutes: number;
  exerciseLocation: "gym" | "home" | "outdoor" | "limited" | "college";
  equipmentAvailable: string[];
  travelStatus: "home" | "travelling" | "hostel";
  stressLevel: "low" | "medium" | "high";
  isExamPeriod: boolean;
  workStudyHours: number;
  schedule: string;
}

export interface BehaviourState {
  adherencePercentage: number;
  missedSessions: number;
  consecutiveMisses: number;
  skipReasons: Record<string, number>;
  preferredWorkoutTime?: string;
  preferredDuration?: number;
  feedbackHistory: FeedbackEntry[];
  adherenceLevel: AdherenceLevel;
}

export interface FeedbackEntry {
  date: string;
  completed: boolean;
  difficulty?: number;
  energy?: number;
  discomfort?: boolean;
  tooEasy?: boolean;
  tooHard?: boolean;
}

export interface TrainingState {
  recentLoad: number;
  acuteLoad: number;
  chronicLoad: number;
  acuteChronicRatio: number;
  muscleReadiness: {
    upperBody: "primed" | "recovering" | "fatigued";
    lowerBody: "primed" | "recovering" | "fatigued";
    core: "primed" | "recovering" | "fatigued";
  };
  formScoreAverage: number;
  formTrend: PerformanceTrend;
}

export interface EnvironmentState {
  temperatureC?: number;
  humidityPct?: number;
  condition?: string;
  indoorRecommended: boolean;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
}

export interface RiskState {
  trainingRisk: TrainingRiskLevel;
  recoveryConcern: boolean;
  overreachingSignal: boolean;
  formDegradation: boolean;
  painReported: boolean;
  riskFactors: string[];
}

export interface Constraints {
  hard: {
    availableTimeMinutes: number;
    equipment: string[];
    budgetINR: number;
    location: string;
    injuries: string[];
    unavailableActivities: string[];
  };
  soft: {
    preferredTime?: string;
    preferredExercises?: string[];
    preferredDuration?: number;
    foodPreference?: string;
    sportPreference?: string;
  };
}

export interface PerformanceTrends {
  fitness: PerformanceTrend;
  sports: PerformanceTrend;
  recovery: PerformanceTrend;
  nutrition: PerformanceTrend;
  adherence: PerformanceTrend;
  weeklyScores: number[];
}

export interface OjasState {
  userId: string;
  timestamp: string;
  version: number;

  fitness: FitnessState;
  sports: SportsState;
  recovery: RecoveryState;
  nutrition: NutritionState;
  lifestyle: LifestyleState;
  behaviour: BehaviourState;
  training: TrainingState;
  environment: EnvironmentState;
  risk: RiskState;
  constraints: Constraints;
  trends: PerformanceTrends;

  dataQuality: number;
  lastEvent?: string;
  lastEventTimestamp?: string;
}

export interface OjasEvent {
  id: string;
  type: OjasEventType;
  timestamp: string;
  payload: Record<string, unknown>;
  source: "user_input" | "system" | "vision" | "external";
}

export type OjasEventType =
  | "WORKOUT_COMPLETED"
  | "WORKOUT_SKIPPED"
  | "WORKOUT_DIFFICULTY_CHANGED"
  | "SLEEP_CHANGED"
  | "STRESS_CHANGED"
  | "TIME_CONSTRAINT_CHANGED"
  | "SPORTS_PRACTICE_COMPLETED"
  | "SPORTS_PERFORMANCE_CHANGED"
  | "VISION_ANALYSIS_COMPLETED"
  | "NUTRITION_CHANGED"
  | "TRAVEL_DETECTED"
  | "EXAM_PERIOD_TOGGLED"
  | "EQUIPMENT_CHANGED"
  | "BUDGET_CHANGED"
  | "COMPETITION_APPROACHING"
  | "USER_FEEDBACK_RECEIVED"
  | "PAIN_REPORTED"
  | "PROFILE_UPDATED";

export interface DecisionHistoryEntry {
  date: string;
  decision: string;
  reason: string;
  result?: "completed" | "skipped" | "partial";
  factors: string[];
}

export interface OjasDecision {
  action: OjasAction;
  badge: {
    label: string;
    color: "green" | "yellow" | "blue" | "rose" | "purple";
  };
  headline: string;
  subtitle: string;
  confidence: number;
  confidenceLabel: string;

  workout?: {
    title: string;
    durationMinutes: number;
    intensity: "Low" | "Moderate" | "High";
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      notes: string;
    }[];
  };

  sports?: {
    sport: string;
    skillFocus: string;
    drills: string[];
    durationMinutes: number;
  };

  recovery?: {
    headline: string;
    protocol: string;
    mobilityMinutes: number;
  };

  nutrition?: {
    headline: string;
    recommendation: string;
    affordableProteinHack?: string;
    estimatedCostINR: number;
  };

  whyReasons: string[];
  decisionFactors: {
    signal: string;
    value: string;
    impact: "positive" | "negative" | "neutral";
  }[];

  timestamp: string;
}

export type OjasAction =
  | "FULL_TRAINING"
  | "REDUCED_TRAINING"
  | "MINIMUM_TRAINING"
  | "SPORT_PRACTICE"
  | "RECOVERY"
  | "MOBILITY"
  | "REST"
  | "NUTRITION_ACTION"
  | "SLEEP_PRIORITY";
