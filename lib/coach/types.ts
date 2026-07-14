// Domain types for the AI Fitness Coach.
// Mix of client (localStorage) and server-safe (route) usage — no window access here.

export type CoachRole = "user" | "coach";

export interface CoachMessage {
  id: string;
  role: CoachRole;
  text: string;
  timestamp: string;
  intent?: string;
  recommendation?: CoachRecommendation;
  cards?: CoachCard[];
  safety?: boolean;
}

export type RecommendationCategory =
  | "workout"
  | "nutrition"
  | "recovery"
  | "habit"
  | "motivation"
  | "plan"
  | "insight";

export type Priority = "low" | "medium" | "high" | "critical";

export interface CoachRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  why: string;
  expectedBenefit: string;
  estimatedEffort: string;
  confidence: number; // 0-100
  alternative: string;
  priority: Priority;
}

export interface CoachCard {
  kind: "daily-plan" | "weekly-review" | "monthly-review" | "workout" | "meal" | "recovery" | "insight" | "memory";
  title: string;
  data: any;
}

export type CoachIntent =
  | "tired"
  | "no-time"
  | "gym-closed"
  | "skipped"
  | "travelling"
  | "overeat"
  | "pain-injury"
  | "what-workout"
  | "eat-query"
  | "buy-query"
  | "rest-query"
  | "build-workout"
  | "generate-meals"
  | "how-am-i"
  | "explain-recovery"
  | "plan-week"
  | "greeting"
  | "motivation"
  | "goal"
  | "progress"
  | "consistency"
  | "hydration"
  | "sleep"
  | "deload"
  | "general";

// Lightweight context the engine + API consume.
export interface CoachContextData {
  profile: any;
  dailyLog: any;
  logsHistory: any[];
  checkInHistory: any[];
  macroTargets: any;
  calorieTargets: any;
  metrics: any;
  recovery: {
    score: number;
    readiness: string;
    fatigue: number;
    confidence: number;
    recommendationLabel: string;
    muscleReadiness: { muscle: string; readiness: number; soreness: string }[];
  } | null;
  memory: CoachMemoryData;
}

export interface CoachMemoryData {
  favoriteWorkouts: string[];
  mealPreferences: string[];
  gymSchedule: string;
  travelHabits: string;
  equipment: string[];
  goals: string[];
  motivationStyle: string;
  notes: string[];
}

export const EMPTY_MEMORY: CoachMemoryData = {
  favoriteWorkouts: [],
  mealPreferences: [],
  gymSchedule: "",
  travelHabits: "",
  equipment: [],
  goals: [],
  motivationStyle: "",
  notes: [],
};

export interface ParsedIntent {
  intent: CoachIntent;
  sentiment: "positive" | "neutral" | "negative";
  entities: Record<string, string>;
}

// Daily / Weekly / Monthly plan shapes
export interface DailyPlan {
  date: string;
  greeting: string;
  motivation: string;
  morning: string[];
  workout: { title: string; focus: string; duration: number; note: string };
  meals: { label: string; suggestion: string; protein: number; calories: number }[];
  recovery: string[];
  night: string[];
}

export interface WeeklyReview {
  period: string;
  workoutsCompleted: number;
  avgRecovery: number;
  nutritionAdherence: number;
  habits: string[];
  progress: string[];
  trends: string[];
  celebration: string;
}

export interface MonthlyReview {
  month: string;
  achievements: string[];
  improve: string[];
  consistency: string;
  recovery: string;
  recommendations: string[];
}

export interface Insight {
  id: string;
  type: "progress" | "recovery" | "weight" | "strength";
  title: string;
  explanation: string;
  trend: "up" | "down" | "flat";
  confidence: number;
}
