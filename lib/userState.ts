/**
 * Canonical Single Source of Truth for Ojas AI
 * Reconciled across all pages: Dashboard, Recovery, Twin, Coach, and Progress.
 */

export interface CanonicalUserState {
  profile: {
    name: string;
    age: number;
    weight: number;
    height: number;
    userType: "student" | "athlete" | "officer" | "beginner" | "medical" | "busy";
  };
  goals: {
    primary: "fat-loss" | "muscle-gain" | "athletic-performance" | "consistency";
    targetWeight: number;
    timeline: number;
  };
  digitalTwin: {
    fitness: { score: number; category: string; trend: "↑" | "→" | "↓" };
    nutrition: { score: number; calorieTarget: number; proteinTarget: number };
    recovery: {
      score: number;
      sleepScore: number;
      fatigueScore: number;
      domsScore: number;
      hrvScore: number;
      status: "good" | "fatigued" | "overreached";
    };
    consistency: { score: number; streak: number; adherence: number };
    sport: { active: string; gap: number; gapName: string; level: string };
  };
  context: {
    availableTime: number;
    energyLevel: "moderate" | "energetic" | "tired";
    hostelModeOn: boolean;
    budget: { dailyRemaining: number; spent: number; total: number };
  };
  timestamp: string;
  lastUpdate: string;
}

export const userState: CanonicalUserState = {
  profile: { name: "Anil", age: 22, weight: 68.5, height: 174, userType: "student" },
  goals: { primary: "fat-loss", targetWeight: 68, timeline: 12 },
  digitalTwin: {
    fitness: { score: 92, category: "Hypertrophy Upper Body", trend: "↑" },
    nutrition: { score: 84, calorieTarget: 2135, proteinTarget: 128 },
    recovery: {
      score: 75,
      sleepScore: 72,
      fatigueScore: 42,
      domsScore: 78,
      hrvScore: 68,
      status: "good",
    },
    consistency: { score: 94, streak: 12, adherence: 84 },
    sport: { active: "Football/Soccer", gap: -15, gapName: "Agility & Change of Direction", level: "intermediate" },
  },
  context: {
    availableTime: 50,
    energyLevel: "moderate",
    hostelModeOn: true,
    budget: { dailyRemaining: 100, spent: 150, total: 250 },
  },
  timestamp: "2026-09-06T10:30:00Z",
  lastUpdate: "dashboard",
};
