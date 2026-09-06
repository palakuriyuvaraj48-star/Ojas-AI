/**
 * Recovery and Readiness Data Models for OJAS AI
 */

export interface SleepData {
  date: string;
  duration: number; // in hours (e.g. 7.4)
  quality: "poor" | "fair" | "good" | "excellent";
  bedtime: string;
  wakeTime: string;
  interruptions: number;
  notes: string;
}

export interface FatigueData {
  date: string;
  level: number; // 0-10
  muscularFatigue: number; // 0-10
  mentalFatigue: number; // 0-10
  systemicFatigue: number; // 0-10
  trend: "improving" | "stable" | "declining";
}

export interface DomsData {
  date: string;
  bodyRegions: {
    legs: number; // 0-10 soreness level
    chest: number;
    back: number;
    shoulders: number;
    arms?: number;
    core?: number;
  };
  previousTraining: string;
  expectedRecoveryDays: number;
}

export interface HydrationData {
  logged: number; // ml
  target: number; // ml
  percentage: number;
}

export interface RecoveryScore {
  overall: number; // 0-100
  sleep: number;
  fatigue: number;
  soreness: number;
  stressLevel: number;
  readiness: "fresh" | "moderate" | "fatigued" | "overreaching";
  trend: number; // change from yesterday
}

export type StretchType = "pre-workout" | "post-workout" | "rest-day" | "desk" | "travel";
