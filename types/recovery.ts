export type ReadinessLevel = "fresh" | "moderate" | "fatigued" | "overreaching";
export type SorenessLevel = "none" | "low" | "medium" | "high";
export type MobilityDifficulty = "beginner" | "intermediate" | "advanced";
export type StretchType = "pre-workout" | "post-workout" | "rest-day" | "desk" | "travel";
export type RestDayActivity = "full-rest" | "walking" | "yoga" | "stretching" | "breathing" | "light-cycling";

export interface RecoveryScore {
  score: number;
  readiness: ReadinessLevel;
  confidence: number;
  trend: "improving" | "stable" | "declining";
  explanation: string;
  fatigueLevel: number;
  muscleReadiness: { muscle: string; readiness: number; soreness: SorenessLevel }[];
}

export interface SleepLog {
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

export interface DOMSLog {
  id: string;
  date: string;
  muscle: string;
  sorenessLevel: SorenessLevel;
  painScore: number;
  notes?: string;
  recommendedAction: string;
}

export interface MobilityPlan {
  id: string;
  title: string;
  difficulty: MobilityDifficulty;
  duration: number;
  targetMuscles: string[];
  exercises: {
    name: string;
    duration: number;
    sets: number;
    reps?: string;
    hold?: string;
    instructions: string;
  }[];
  focus: string;
  aiNote: string;
}

export interface StretchingPlan {
  id: string;
  type: StretchType;
  title: string;
  duration: number;
  exercises: {
    name: string;
    duration: number;
    instructions: string;
    targetArea: string;
  }[];
}

export interface RestDayPlan {
  id: string;
  date: string;
  recommendation: RestDayActivity;
  duration: number;
  reasoning: string;
  alternatives: RestDayActivity[];
  confidence: number;
  expectedBenefit: string;
}

export interface RecoveryNotification {
  id: string;
  type: "warning" | "info" | "success" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface RecoveryAnalytics {
  period: "weekly" | "monthly";
  recoveryTrend: { day: string; score: number; readiness: number }[];
  sleepTrend: { day: string; duration: number; quality: number }[];
  fatigueTrend: { day: string; fatigue: number }[];
  trainingLoadTrend: { day: string; volume: number; intensity: number }[];
  restDaysTaken: number;
  averageRecovery: number;
  topRiskFactors: string[];
  aiInsight: string;
  weeklyReview: {
    patterns: string[];
    improvements: string[];
    actionItems: string[];
  };
}

export interface RecoveryHistoryEntry {
  id: string;
  date: string;
  recoveryScore: number;
  readiness: ReadinessLevel;
  sleepDuration: number;
  sleepQuality: number;
  fatigueLevel: number;
  trainingLoad: number;
  aiRecommendation: string;
  userNotes?: string;
}
