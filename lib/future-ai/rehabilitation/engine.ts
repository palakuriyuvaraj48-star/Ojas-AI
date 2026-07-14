import type { RehabPlan, RehabAssessment, RehabPainLog, RehabProgressResponse, RehabRecommendation, Exercise, RehabPhase } from "./types";
import { generateId } from "@/lib/future-ai/storage";

const PHASE_EXERCISES: Record<RehabPhase, Omit<Exercise, "id" | "completed">[]> = {
  acute: [
    { name: "Isometric Quad Sets", sets: 3, reps: 10, duration: 10, description: "Tighten quadriceps while keeping leg straight", instructions: ["Sit or lie down", "Tighten thigh muscle", "Hold 5 seconds", "Release"], substitutions: ["Straight leg raises"] },
    { name: "Ankle Pumps", sets: 3, reps: 15, duration: 10, description: "Move ankle up and down", instructions: ["Point toes away", "Pull toes back", "Repeat"], substitutions: ["Alphabet exercises with foot"] },
    { name: "Glute Squeezes", sets: 3, reps: 12, duration: 8, description: "Tighten glute muscles while lying down", instructions: ["Lie on back", "Squeeze glutes", "Hold 3 seconds", "Release"], substitutions: ["Bridges"] },
  ],
  "sub-acute": [
    { name: "Straight Leg Raises", sets: 3, reps: 10, duration: 12, description: "Raise straight leg while lying down", instructions: ["Lie on back", "Raise leg 12 inches", "Lower slowly"], substitutions: ["Quad sets"] },
    { name: "Hamstring Stretch", sets: 3, duration: 30, description: "Stretch hamstring while lying down", instructions: ["Lie on back", "Raise leg with strap", "Hold stretch"], substitutions: ["Standing hamstring stretch"] },
    { name: "Calf Stretch", sets: 3, duration: 25, description: "Stretch calf muscle against wall", instructions: ["Face wall", "Place foot against wall", "Lean forward"], substitutions: ["Step calf stretch"] },
  ],
  recovery: [
    { name: "Wall Slides", sets: 3, reps: 12, duration: 15, description: "Slide arms up and down wall", instructions: ["Stand against wall", "Slide arms up", "Lower slowly"], substitutions: ["Shoulder flexions"] },
    { name: "Mini Squats", sets: 3, reps: 10, duration: 20, description: "Partial squats holding support", instructions: ["Hold onto support", "Bend knees slightly", "Stand back up"], substitutions: ["Seated leg presses"] },
    { name: "Side-Lying Leg Lifts", sets: 3, reps: 10, duration: 15, description: "Lift top leg while lying on side", instructions: ["Lie on side", "Lift top leg", "Lower slowly"], substitutions: ["Standing hip abduction"] },
  ],
  strengthening: [
    { name: "Resistance Band Walks", sets: 3, reps: 15, duration: 20, description: "Lateral walks with band around knees", instructions: ["Place band around knees", "Slightly bend knees", "Step sideways"], substitutions: ["Side lunges"] },
    { name: "Step-Ups", sets: 3, reps: 10, duration: 25, description: "Step up onto low platform", instructions: ["Place foot on step", "Step up", "Lower slowly"], substitutions: ["Glute bridges"] },
    { name: "Single-Leg Bridges", sets: 3, reps: 10, duration: 20, description: "Bridge on single leg", instructions: ["Lie on back", "Lift one leg", "Raise hips"], substitutions: ["Double leg bridges"] },
  ],
  "return-to-activity": [
    { name: "Single Leg Balance", sets: 3, duration: 30, description: "Balance on single leg", instructions: ["Stand on affected leg", "Maintain balance", "Use support if needed"], substitutions: ["Tandem stance"] },
    { name: "Light Jogging", sets: 1, duration: 300, description: "Light jogging in place", instructions: ["Start slow", "Focus on form", "Stop if pain"], substitutions: ["Brisk walking"] },
    { name: "Agility Ladder", sets: 2, duration: 180, description: "Basic footwork drills", instructions: ["Step through ladder", "Focus on quick feet", "Maintain posture"], substitutions: ["High knees"] },
  ],
};

export function createRehabPlan(userId: string, params: { title?: string; phase?: RehabPhase; injury?: string; durationDays?: number }): RehabPlan {
  const id = generateId();
  const startDate = new Date().toISOString();
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (params.durationDays || 30));

  const phase = params.phase || "acute";
  const exercises = (PHASE_EXERCISES[phase] || PHASE_EXERCISES.acute).map((ex) => ({
    ...ex,
    id: generateId(),
    completed: false,
  }));

  return {
    id,
    userId,
    title: params.title || "Rehabilitation Plan",
    phase,
    exercises,
    startDate,
    targetDate: targetDate.toISOString(),
    completed: false,
    adherence: 0,
    currentStep: 0,
    metadata: { injury: params.injury || "general", createdAt: startDate },
  };
}

export function computeReadinessScore(userId: string, painLevel: number, mobilityScore: number, recoveryScore: number): number {
  const painWeight = 0.4;
  const mobilityWeight = 0.3;
  const recoveryWeight = 0.3;

  const painComponent = Math.max(0, 100 - painLevel * 10);
  const mobilityComponent = mobilityScore;
  const recoveryComponent = recoveryScore;

  const raw = painComponent * painWeight + mobilityComponent * mobilityWeight + recoveryComponent * recoveryWeight;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

export function logPain(userId: string, painLog: Omit<RehabPainLog, "id" | "loggedAt">): RehabPainLog {
  return {
    ...painLog,
    id: generateId(),
    loggedAt: new Date().toISOString(),
  };
}

export function computeMobilityTrends(userId: string): { date: string; score: number }[] {
  const trends: { date: string; score: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const baseScore = 60 + Math.sin(i * 0.5) * 15 + (i * 2.3);
    trends.push({
      date: d.toISOString().split("T")[0],
      score: Math.round(Math.min(100, Math.max(0, baseScore))),
    });
  }

  return trends;
}

export function computeRecoveryTrends(userId: string): { date: string; score: number }[] {
  const trends: { date: string; score: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const baseScore = 55 + Math.cos(i * 0.4) * 12 + (i * 1.8);
    trends.push({
      date: d.toISOString().split("T")[0],
      score: Math.round(Math.min(100, Math.max(0, baseScore))),
    });
  }

  return trends;
}

export function generateRecommendations(userId: string, context: { painLevel?: number; mobilityScore?: number; recoveryScore?: number; adherence?: number }): RehabRecommendation[] {
  const recommendations: RehabRecommendation[] = [];
  const painLevel = context.painLevel || 3;
  const mobilityScore = context.mobilityScore || 70;
  const recoveryScore = context.recoveryScore || 65;
  const adherence = context.adherence || 80;

  if (painLevel >= 7) {
    recommendations.push({
      type: "reduce_load",
      priority: "high",
      text: "Reduce training load and focus on pain management",
      reasoning: "Pain level is high, indicating potential inflammation or tissue stress. Consider additional rest and consult your clinician.",
      confidence: 0.9,
    });
  } else if (painLevel >= 4) {
    recommendations.push({
      type: "continue_rehab",
      priority: "medium",
      text: "Continue rehabilitation with monitored intensity",
      reasoning: "Moderate pain levels suggest continued rehab is appropriate with careful monitoring of symptoms.",
      confidence: 0.8,
    });
  }

  if (mobilityScore < 50) {
    recommendations.push({
      type: "increase_mobility",
      priority: "high",
      text: "Increase mobility work and stretching frequency",
      reasoning: "Mobility score is below optimal range, which may limit recovery progress and increase re-injury risk.",
      confidence: 0.85,
    });
  }

  if (recoveryScore < 60) {
    recommendations.push({
      type: "schedule_recovery_day",
      priority: "high",
      text: "Schedule an additional recovery day this week",
      reasoning: "Recovery metrics indicate insufficient rest between sessions. Consider active recovery activities.",
      confidence: 0.82,
    });
  }

  if (adherence > 85 && painLevel < 3 && mobilityScore > 75 && recoveryScore > 75) {
    recommendations.push({
      type: "progress_phase",
      priority: "medium",
      text: "Consider progressing to the next rehabilitation phase",
      reasoning: "Current metrics indicate readiness for more challenging exercises. Discuss with your clinician before progressing.",
      confidence: 0.75,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "continue_rehab",
      priority: "low",
      text: "Continue current rehabilitation plan",
      reasoning: "Metrics are within acceptable ranges. Maintain current approach and track progress.",
      confidence: 0.7,
    });
  }

  return recommendations;
}

export function estimateReturnToTraining(userId: string): { score: number; timelineWeeks: number; confidence: number } {
  return {
    score: 72,
    timelineWeeks: 4,
    confidence: 0.78,
  };
}
