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
  };
  goals: {
    primary: string;
    targetWeight: number;
    timeline: number;
  };
  digitalTwin: {
    fitness: { score: number; category: string };
    nutrition: { score: number; calorieTarget: number };
    recovery: { score: number; status: "good" | "fatigued" | "overreached" };
    consistency: { score: number; streak: number };
    sport: { active: string; gap: number; gapName: string };
  };
  timestamp: string;
}

export const userState: CanonicalUserState = {
  profile: { name: "Anil", age: 22, weight: 68.5, height: 174 },
  goals: { primary: "fat-loss", targetWeight: 68, timeline: 12 },
  digitalTwin: {
    fitness: { score: 92, category: "Hypertrophy Upper Body" },
    nutrition: { score: 84, calorieTarget: 2135 },
    recovery: { score: 75, status: "good" },
    consistency: { score: 94, streak: 12 },
    sport: { active: "Football/Soccer", gap: -15, gapName: "Agility & Change of Direction" }
  },
  timestamp: "2026-09-06T10:30:00Z"
};
