import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    scores: {
      fitness: 88,
      health: 86,
      performance: 89,
      consistency: 94,
      recovery: 82,
      nutrition: 90,
      goalProgress: 75,
    },
    weightTrends: {
      daily: 78.5,
      weeklyAvg: 78.1,
      monthlyAvg: 77.2,
      yearlyAvg: 82.5,
      rollingAvg: 77.9,
      rateOfChange: "-0.4 kg/wk",
      timelineWeeks: 8.2,
    },
    measurements: {
      chest: { before: 104, after: 105.2, unit: "cm" },
      waist: { before: 88, after: 86.5, unit: "cm" },
      hips: { before: 98, after: 97.2, unit: "cm" },
      shoulders: { before: 118, after: 119.5, unit: "cm" },
      arms: { before: 36.5, after: 37.2, unit: "cm" },
      forearms: { before: 29.5, after: 29.9, unit: "cm" },
      neck: { before: 38.5, after: 38.5, unit: "cm" },
      thighs: { before: 58.2, after: 59.0, unit: "cm" },
      calves: { before: 37.5, after: 37.8, unit: "cm" },
      bodyFat: { before: 22.4, after: 21.2, unit: "%" },
      leanBodyMass: { before: 60.9, after: 61.8, unit: "kg" },
    },
    strengthIndex: {
      squat1RM: 146,
      deadlift1RM: 194,
      bench1RM: 110,
      press1RM: 68,
      weeklyVolume: "24,800 kg",
      monthlyVolume: "98,200 kg",
    },
    calories: {
      burned: 2450,
      consumed: 2100,
      balance: -350,
      avgIntake: 2080,
    },
    recovery: {
      readiness: 85,
      sleepHrs: 7.2,
      fatigueRate: 35,
      hrv: 72,
    },
    habits: {
      workoutStreak: 18,
      nutritionStreak: 12,
      hydrationStreak: 24,
      sleepStreak: 8,
      meditationStreak: 5,
      stretchingStreak: 10,
    },
    reports: {
      daily: "Hydration met. Volume matching targets. Sleep fell short by 30 mins.",
      weekly: {
        wins: [
          "Wide stance squat depth reached parallel (92°).",
          "Met protein target (165g+) all 7 days.",
          "Left/right bench lockout symmetry reached 94%.",
        ],
        improvements: [
          "Ankle dorsiflexion remains restricted.",
          "Average sleep fell short by 40 minutes.",
        ],
      },
    },
  };

  return NextResponse.json(payload);
}
