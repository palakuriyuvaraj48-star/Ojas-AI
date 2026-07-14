/**
 * Local storage schema definitions.
 * These act as logical tables — no existing tables are removed.
 */

export const TABLES = {
  PROFILE: "lumina_profile",
  DAILY_LOGS: "lumina_logs",
  CHECKINS: "lumina_checkins",
  CHAT: "lumina_chat",
  AUTH_SESSION: "titan_auth",
  USER_PREFERENCES: "titan_preferences",
  ONBOARDING: "titan_onboarding_complete",
  ACHIEVEMENTS: "titan_achievements",
  SUBSCRIPTION: "titan_subscription",
  CONNECTED_DEVICES: "titan_devices",
  MUSIC_STATE: "fitness-music-state",
  EXERCISES: "titan_exercises",
  WORKOUT_HISTORY: "titan_workout_history",
  PERSONAL_RECORDS: "titan_personal_records",
  FOODS: "titan_foods",
  MEAL_PLANS: "titan_meal_plans",
  RECIPES: "titan_recipes",
  GROCERY_LIST: "titan_grocery_list",
  WATER_LOGS: "titan_water_logs",
  NUTRITION_GOALS: "titan_nutrition_goals",
  MICRONUTRIENTS: "titan_micronutrients",
  FOOD_ENTRIES: "titan_food_entries",
  NUTRITION_NOTIFICATIONS: "titan_nutrition_notifications",
  RESTAURANT_OPTIONS: "titan_restaurant_options",
  RECOVERY_LOGS: "titan_recovery_logs",
  READINESS_SCORES: "titan_readiness_scores",
  SLEEP_LOGS: "titan_sleep_logs",
  DOMS_LOGS: "titan_doms_logs",
  MOBILITY_SESSIONS: "titan_mobility_sessions",
  RECOVERY_RECOMMENDATIONS: "titan_recovery_recommendations",
  AI_CONVERSATIONS: "titan_ai_conversations",
  AI_RECOMMENDATIONS: "titan_ai_recommendations",
  AI_MEMORY: "titan_ai_memory",
  AI_PLANS: "titan_ai_plans",
  AI_INSIGHTS: "titan_ai_insights",

  // Smart Form Coach (Phase 7 — Computer Vision)
  FORM_SESSIONS: "titan_form_sessions",
  FORM_ANALYSIS: "titan_form_analysis",
  REP_HISTORY: "titan_rep_history",
  EXERCISE_VIDEOS: "titan_exercise_videos",
  AI_FEEDBACK: "titan_ai_feedback",
} as const;

export const NEW_TABLES = {
  AUTH_SESSION: TABLES.AUTH_SESSION,
  USER_PREFERENCES: TABLES.USER_PREFERENCES,
  ONBOARDING: TABLES.ONBOARDING,
  ACHIEVEMENTS: TABLES.ACHIEVEMENTS,
  SUBSCRIPTION: TABLES.SUBSCRIPTION,
  CONNECTED_DEVICES: TABLES.CONNECTED_DEVICES,
} as const;

export interface AchievementRecord {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  category: "workout" | "nutrition" | "streak" | "social";
}

export interface SubscriptionRecord {
  plan: "free" | "pro" | "elite";
  status: "active" | "cancelled" | "trial";
  expiresAt?: string;
  features: string[];
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: "whoop" | "garmin" | "apple_health" | "google_fit" | "fitbit";
  connected: boolean;
  lastSync?: string;
}

export interface NutritionGoalRecord {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
}

export interface MicronutrientRecord {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  status: "deficient" | "low" | "optimal" | "excess";
  percent: number;
}

export interface FoodEntryRecord {
  id: string;
  name: string;
  source: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  portion?: string;
  confidence?: number;
  loggedAt: string;
}

export interface NotificationRecord {
  id: string;
  type: "warning" | "info" | "success" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface RecoveryLogRecord {
  id: string;
  date: string;
  recoveryScore: number;
  readiness: "fresh" | "moderate" | "fatigued" | "overreaching";
  fatigueLevel: number;
  trainingLoad: number;
  sleepDuration: number;
  sleepQuality: number;
  hrv?: number;
  restingHR?: number;
  aiRecommendation: string;
  userNotes?: string;
}

export interface ReadinessScoreRecord {
  id: string;
  date: string;
  score: number;
  confidence: number;
  trend: "improving" | "stable" | "declining";
  muscleReadiness: { muscle: string; readiness: number; soreness: string }[];
}

export interface SleepLogRecord {
  id: string;
  date: string;
  duration: number;
  quality: number;
  sleepDebt: number;
  deepSleep: number;
  remSleep: number;
  consistency: number;
  bedtime: string;
  wakeTime: string;
  aiInsight: string;
}

export interface DOMSLogRecord {
  id: string;
  date: string;
  muscle: string;
  sorenessLevel: "none" | "low" | "medium" | "high";
  painScore: number;
  notes?: string;
  recommendedAction: string;
}

export interface MobilitySessionRecord {
  id: string;
  date: string;
  title: string;
  difficulty: string;
  duration: number;
  targetMuscles: string[];
  exercises: any[];
  aiNote: string;
}

export interface RecoveryRecommendationRecord {
  id: string;
  date: string;
  type: string;
  title: string;
  reasoning: string;
  confidence: number;
  expectedBenefit: string;
  alternatives: string[];
}

// ---------------------------------------------------------------------------
// Smart Form Coach (Phase 7 — Computer Vision) logical tables
// Full shapes live in lib/vision/types.ts; these describe the stored records.
// ---------------------------------------------------------------------------

export interface FormSessionRecord {
  id: string;
  exercise: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  sets: number;
  reps: number;
  partialReps: number;
  formScore: number;
  avgRom: number;
  avgSymmetry: number;
  bestRepScore: number;
  notes: string;
  feedback: AiFeedbackStoredRecord[];
  source: "mediapipe" | "simulation";
  hasVideo: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface AiFeedbackStoredRecord {
  id: string;
  setNumber: number;
  exercise: string;
  strengths: string[];
  improvements: string[];
  corrections: string[];
  summary: string;
  createdAt: string;
}

export interface RepHistoryStoredRecord {
  id: string;
  sessionId: string;
  exercise: string;
  setNumber: number;
  repIndex: number;
  score: number;
  rom: number;
  symmetryIndex: number;
  partial: boolean;
  createdAt: string;
}

export interface ExerciseVideoStoredRecord {
  id: string;
  sessionId: string;
  exercise: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

// Future AI (Phase 15 — Experimental)
export const FUTURE_AI_TABLES = {
  DIGITAL_TWIN_PROFILE: "titan_future_digital_twin_profile",
  DIGITAL_TWIN_PREDICTIONS: "titan_future_digital_twin_predictions",
  DIGITAL_TWIN_SIMULATIONS: "titan_future_digital_twin_simulations",
  AR_COACH_SESSIONS: "titan_future_ar_coach_sessions",
  AR_COACH_ANALYTICS: "titan_future_ar_coach_analytics",
  SMART_GYM_DEVICES: "titan_future_smart_gym_devices",
  SMART_GYM_WORKOUTS: "titan_future_smart_gym_workouts",
  REHAB_PLANS: "titan_future_rehab_plans",
  REHAB_ASSESSMENTS: "titan_future_rehab_assessments",
  REHAB_PAIN_LOGS: "titan_future_rehab_pain_logs",
  HEALTH_RISK_ASSESSMENTS: "titan_future_health_risk_assessments",
  HEALTH_RISK_FACTORS: "titan_future_health_risk_factors",
} as const;

export interface DigitalTwinProfileRecord {
  id: string;
  userId: string;
  physiology: Record<string, number>;
  behavior: Record<string, number>;
  adaptation: Record<string, number>;
  habitFormation: Record<string, number>;
  lastSimulatedAt: string;
  metadata: Record<string, unknown>;
}

export interface DigitalTwinPredictionRecord {
  id: string;
  userId: string;
  type: string;
  horizon: "daily" | "weekly" | "monthly" | "yearly" | "longterm";
  prediction: Record<string, unknown>;
  confidence: number;
  factors: {
    primary: string[];
    secondary: string[];
  };
  modelVersion: string;
  predictedAt: string;
  expiresAt: string;
}

export interface DigitalTwinSimulationRecord {
  id: string;
  userId: string;
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  confidence: number;
  createdAt: string;
}

export interface ARCoachSessionRecord {
  id: string;
  userId: string;
  exercise: string;
  startedAt: string;
  endedAt?: string;
  reps: number;
  formScore: number;
  movementQuality: number;
  fatigueIndicator: number;
  commonMistakes: string[];
  improvementSuggestions: string[];
  hasRecording: boolean;
  recordingUrl?: string;
  metadata: Record<string, unknown>;
}

export interface ARCoachAnalyticsRecord {
  id: string;
  userId: string;
  exercise: string;
  date: string;
  movementQuality: number;
  consistency: number;
  fatigueIndicator: number;
  jointStress: number;
  tempo: number;
}

export interface SmartGymDeviceRecord {
  id: string;
  userId: string;
  name: string;
  type: "strength" | "cardio" | "resistance" | "sensor";
  manufacturer?: string;
  model?: string;
  connected: boolean;
  lastSync?: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface SmartGymWorkoutRecord {
  id: string;
  userId: string;
  deviceId?: string;
  exercise: string;
  startedAt: string;
  endedAt?: string;
  sets: Array<{ weight?: number; reps?: number; duration?: number; resistance?: number }>;
  metadata: Record<string, unknown>;
}

export interface RehabPlanRecord {
  id: string;
  userId: string;
  clinicianId?: string;
  coachId?: string;
  title: string;
  phase: string;
  exercises: Array<Record<string, unknown>>;
  startDate: string;
  targetDate: string;
  completed: boolean;
  adherence: number;
  currentStep: number;
  metadata: Record<string, unknown>;
}

export interface RehabAssessmentRecord {
  id: string;
  userId: string;
  type: string;
  score: number;
  details: Record<string, unknown>;
  assessedAt: string;
}

export interface RehabPainLogRecord {
  id: string;
  userId: string;
  level: number;
  location: string[];
  description?: string;
  loggedAt: string;
}

export interface HealthRiskAssessmentRecord {
  id: string;
  userId: string;
  category: string;
  riskScore: number;
  confidence: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  contributingFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  assessedAt: string;
  expiresAt: string;
  modelVersion: string;
}
