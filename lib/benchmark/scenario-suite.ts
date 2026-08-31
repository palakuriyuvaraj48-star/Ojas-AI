/**
 * OJAS V2 Benchmark Suite
 * Automated evaluation of realistic user archetypes to verify constraint satisfaction,
 * safety deloads, explainability, and distinct decision outputs.
 */

import { createInitialTwin } from "@/lib/digital-twin/engine";
import { computeAdaptiveDecision, AdaptiveDecisionResult } from "@/lib/decision-engine/adaptive-decision-engine";
import { ClientProfile } from "@/types/profile";

export interface BenchmarkCase {
  id: string;
  name: string;
  archetype: string;
  profile: ClientProfile;
  overrides?: any;
  assertions: (result: AdaptiveDecisionResult) => { pass: boolean; message: string }[];
}

export const OJAS_BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: "user_a_college_exam",
    name: "User A — College Student in Exam Crunch",
    archetype: "Poor sleep (5.0h) + Exam period + 20 min available",
    profile: {
      name: "Anil Kumar",
      age: 22,
      gender: "male",
      height: 174,
      weight: 68.5,
      goal: "fat-loss",
      activityLevel: "moderately-active",
      gymExperience: "intermediate",
      dailyStepGoal: 8000,
      occupation: "College Student",
      workoutDaysPerWeek: 4,
      availableWorkoutTime: 20,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "budget",
      dailyFoodBudget: 100,
      sleepDuration: 5.0,
      stressLevel: "high",
      availableEquipment: ["bodyweight"],
      lifestyle: "Hostel resident, exam week",
      lifestyleRole: "college-student",
      isHostelMode: true,
    },
    overrides: {
      isExamPeriod: true,
      sleepHours: 5.0,
      availableTime: 20,
      stressLevel: "high",
    },
    assertions: (res) => [
      {
        pass: res.suggestedWorkout.durationMinutes <= 20,
        message: `Duration (${res.suggestedWorkout.durationMinutes}m) respects 20-min exam time limit.`,
      },
      {
        pass: res.action === "MINIMUM_WORKOUT" || res.action === "RECOVERY_SESSION",
        message: `Action (${res.action}) deloaded to Minimum Workout or Recovery for exam stress.`,
      },
      {
        pass: res.whyReasons.some((r) => r.toLowerCase().includes("exam") || r.toLowerCase().includes("stress") || r.toLowerCase().includes("sleep")),
        message: "Decision explanation explicitly cites exam/stress/sleep factors.",
      },
    ],
  },
  {
    id: "user_b_cricket_athlete",
    name: "User B — Cricket Player with Match Preparation",
    archetype: "Good recovery + Match prep + 35 min",
    profile: {
      name: "Rohan Sharma",
      age: 24,
      gender: "male",
      height: 178,
      weight: 73,
      goal: "lean-bulk",
      activityLevel: "very-active",
      gymExperience: "advanced",
      dailyStepGoal: 10000,
      occupation: "Athlete",
      workoutDaysPerWeek: 5,
      availableWorkoutTime: 35,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "moderate",
      dailyFoodBudget: 250,
      sleepDuration: 8.0,
      stressLevel: "low",
      availableEquipment: ["gym", "dumbbells", "barbell"],
      lifestyle: "Club cricket athlete",
      userMode: "sport-transition",
      selectedSport: "cricket",
    },
    overrides: {
      sleepHours: 8.0,
      availableTime: 35,
      stressLevel: "low",
    },
    assertions: (res) => [
      {
        pass: res.suggestedWorkout.durationMinutes <= 35,
        message: `Duration (${res.suggestedWorkout.durationMinutes}m) fits 35-min preparation block.`,
      },
      {
        pass: res.sportsAction?.sport === "cricket",
        message: "Sports performance module produces cricket-specific skill drills.",
      },
      {
        pass: res.confidenceScore >= 75,
        message: `Recommendation confidence (${res.confidenceScore}%) is verified high.`,
      },
    ],
  },
  {
    id: "user_c_hostel_budget",
    name: "User C — Hostel Student on ₹80/day Budget",
    archetype: "₹80 daily budget + Mess dining + Bodyweight only",
    profile: {
      name: "Deepak Verma",
      age: 20,
      gender: "male",
      height: 170,
      weight: 64,
      goal: "muscle-gain",
      activityLevel: "moderately-active",
      gymExperience: "beginner",
      dailyStepGoal: 8500,
      occupation: "Student",
      workoutDaysPerWeek: 4,
      availableWorkoutTime: 30,
      medicalConditions: "",
      injuries: "",
      foodPreference: "veg",
      allergies: "",
      budget: "budget",
      dailyFoodBudget: 80,
      sleepDuration: 7.5,
      stressLevel: "medium",
      availableEquipment: ["bodyweight"],
      lifestyle: "Hostel resident",
      isHostelMode: true,
    },
    overrides: {
      dailyBudgetINR: 80,
      equipment: ["bodyweight"],
      availableTime: 30,
    },
    assertions: (res) => [
      {
        pass: res.suggestedNutrition.dailyBudgetINR <= 80,
        message: `Nutrition plan strictly satisfies ₹80/day boundary (Target: ₹${res.suggestedNutrition.dailyBudgetINR}).`,
      },
      {
        pass: res.suggestedNutrition.practicalMealSuggestions.length >= 3,
        message: "Practical low-cost Indian food combinations provided (Soya, Sattu, Eggs/Chana).",
      },
      {
        pass: res.suggestedWorkout.exercises.every((e) => !e.name.toLowerCase().includes("barbell")),
        message: "Workout respects bodyweight-only constraint without demanding gym gear.",
      },
    ],
  },
  {
    id: "user_d_athlete_overload",
    name: "User D — Athlete with Acute Load Spike & Declining Form",
    archetype: "Load spike (ACWR > 1.5) + Declining form (<70%)",
    profile: {
      name: "Vikram Singh",
      age: 26,
      gender: "male",
      height: 182,
      weight: 80,
      goal: "muscle-gain",
      activityLevel: "extra-active",
      gymExperience: "advanced",
      dailyStepGoal: 12000,
      occupation: "Fitness Enthusiast",
      workoutDaysPerWeek: 6,
      availableWorkoutTime: 60,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "premium",
      dailyFoodBudget: 350,
      sleepDuration: 6.0,
      stressLevel: "high",
      availableEquipment: ["gym"],
      lifestyle: "Heavy training block",
    },
    overrides: {
      sleepHours: 5.5,
      stressLevel: "high",
      acuteTrainingLoad: 88,
      acuteChronicRatio: 1.6,
      formScore: 65,
    },
    assertions: (res) => [
      {
        pass: res.safetyAssessment.riskLevel === "ELEVATED" || res.safetyAssessment.riskLevel === "CRITICAL_DELOAD",
        message: `Safety Engine triggered elevated risk assessment (${res.safetyAssessment.riskLevel}).`,
      },
      {
        pass: res.action === "RECOVERY_SESSION" || res.action === "MINIMUM_WORKOUT" || res.action === "REST",
        message: `System enforced protective recovery/deload action (${res.action}).`,
      },
      {
        pass: res.safetyAssessment.mitigationActions.length > 0,
        message: "Prescribed non-medical training mitigation guidelines.",
      },
    ],
  },
  {
    id: "user_e_traveler",
    name: "User E — Business Traveler (No Gym, 15 Minutes)",
    archetype: "Hotel room + No equipment + 15 min express",
    profile: {
      name: "Siddharth Rao",
      age: 32,
      gender: "male",
      height: 176,
      weight: 76,
      goal: "fat-loss",
      activityLevel: "lightly-active",
      gymExperience: "intermediate",
      dailyStepGoal: 7000,
      occupation: "Consultant",
      workoutDaysPerWeek: 3,
      availableWorkoutTime: 15,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "moderate",
      dailyFoodBudget: 300,
      sleepDuration: 6.5,
      stressLevel: "medium",
      availableEquipment: ["bodyweight"],
      lifestyle: "Frequent travel",
    },
    overrides: {
      travelStatus: "travelling",
      availableTime: 15,
      equipment: ["bodyweight"],
    },
    assertions: (res) => [
      {
        pass: res.suggestedWorkout.durationMinutes <= 15,
        message: `Duration (${res.suggestedWorkout.durationMinutes}m) fits hotel 15-min express window.`,
      },
      {
        pass: res.suggestedWorkout.exercises.every((e) => !e.name.toLowerCase().includes("barbell") && !e.name.toLowerCase().includes("cable")),
        message: "Hotel-room compatible exercises selected (Bodyweight only).",
      },
    ],
  },
  {
    id: "user_f_optimal_baseline",
    name: "User F — Baseline User in Prime State",
    archetype: "8.0h sleep + Full gym + Low stress + 45 min",
    profile: {
      name: "Karan Patel",
      age: 23,
      gender: "male",
      height: 175,
      weight: 70,
      goal: "fat-loss",
      activityLevel: "moderately-active",
      gymExperience: "intermediate",
      dailyStepGoal: 9000,
      occupation: "Engineer",
      workoutDaysPerWeek: 4,
      availableWorkoutTime: 45,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "moderate",
      dailyFoodBudget: 200,
      sleepDuration: 8.0,
      stressLevel: "low",
      availableEquipment: ["barbell", "dumbbells", "cables"],
      lifestyle: "Consistent routine",
    },
    overrides: {
      sleepHours: 8.0,
      stressLevel: "low",
      availableTime: 45,
    },
    assertions: (res) => [
      {
        pass: res.action === "FULL_TRAINING",
        message: `Primary action is FULL_TRAINING progressive overload (${res.action}).`,
      },
      {
        pass: res.suggestedWorkout.intensity === "High",
        message: "High intensity permitted for primed recovery state.",
      },
      {
        pass: res.badge.color === "green",
        message: "Green readiness zone confirmed.",
      },
    ],
  },
];

/**
 * Run all benchmark cases and produce structured results.
 */
export function runBenchmarkSuite(): {
  total: number;
  passed: number;
  failed: number;
  results: {
    caseId: string;
    caseName: string;
    decisionHeadline: string;
    action: string;
    duration: number;
    tests: { pass: boolean; message: string }[];
  }[];
} {
  let passed = 0;
  let total = 0;
  const results = [];

  for (const bCase of OJAS_BENCHMARK_CASES) {
    const twin = createInitialTwin(bCase.profile, bCase.id);
    const decision = computeAdaptiveDecision(twin, bCase.profile, null, [], bCase.overrides);
    const testResults = bCase.assertions(decision);

    const allPassed = testResults.every((t) => t.pass);
    if (allPassed) passed++;
    total++;

    results.push({
      caseId: bCase.id,
      caseName: bCase.name,
      decisionHeadline: decision.headline,
      action: decision.action,
      duration: decision.suggestedWorkout.durationMinutes,
      tests: testResults,
    });
  }

  return {
    total,
    passed,
    failed: total - passed,
    results,
  };
}
