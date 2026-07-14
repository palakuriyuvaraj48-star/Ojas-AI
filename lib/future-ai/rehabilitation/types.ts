export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: number;
  duration?: number;
  description?: string;
  instructions?: string[];
  substitutions?: string[];
  completed?: boolean;
}

export interface RehabPlan {
  id: string;
  userId: string;
  clinicianId?: string;
  coachId?: string;
  title: string;
  phase: string;
  exercises: Exercise[];
  startDate: string;
  targetDate: string;
  completed: boolean;
  adherence: number;
  currentStep: number;
  metadata: Record<string, unknown>;
}

export interface RehabAssessment {
  id: string;
  userId: string;
  type: "mobility" | "flexibility" | "joint" | "movement_screening";
  score: number;
  details: Record<string, unknown>;
  assessedAt: string;
}

export interface RehabPainLog {
  id: string;
  userId: string;
  level: number;
  location: string[];
  description?: string;
  loggedAt: string;
}

export interface RehabProgressResponse {
  dailyPlan: Exercise[];
  weeklyPlan: { date: string; exercises: Exercise[] }[];
  painTrends: { date: string; level: number }[];
  mobilityTrends: { date: string; score: number }[];
  recoveryTrends: { date: string; score: number }[];
  exerciseAdherence: number;
  readinessScore: number;
  confidenceScore: number;
  recommendations: RehabRecommendation[];
}

export interface RehabRecommendation {
  type: string;
  priority: "high" | "medium" | "low";
  text: string;
  reasoning: string;
  confidence: number;
}

export interface ReturnToTrainingEstimate {
  score: number;
  timelineWeeks: number;
  confidence: number;
}

export type RehabPhase = "acute" | "sub-acute" | "recovery" | "strengthening" | "return-to-activity";
