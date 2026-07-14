import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    scores: {
      healthScore: 86,
      fitnessScore: 88,
      readinessScore: 82,
      nutritionScore: 90,
      habitScore: 94,
    },
    weightTrend: [
      { name: "Mon", weight: 78.5, fat: 22.4 },
      { name: "Tue", weight: 78.2, fat: 22.3 },
      { name: "Wed", weight: 78.3, fat: 22.3 },
      { name: "Thu", weight: 78.0, fat: 22.1 },
      { name: "Fri", weight: 77.8, fat: 22.0 },
      { name: "Sat", weight: 77.9, fat: 22.0 },
      { name: "Sun", weight: 77.5, fat: 21.8 },
    ],
    measurements: {
      chest: { before: 104, after: 105.2, unit: "cm" },
      waist: { before: 88, after: 86.5, unit: "cm" },
      arms: { before: 36.5, after: 37.2, unit: "cm" },
      thighs: { before: 58.2, after: 59.0, unit: "cm" },
    },
    strengthData: [
      { lift: "Squat", pr: 140, oneRepMax: 146 },
      { lift: "Deadlift", pr: 185, oneRepMax: 194 },
      { lift: "Bench Press", pr: 105, oneRepMax: 110 },
      { lift: "Overhead Press", pr: 65, oneRepMax: 68 },
    ],
    nutritionTrend: [
      { name: "Mon", calories: 2100, protein: 165 },
      { name: "Tue", calories: 2050, protein: 160 },
      { name: "Wed", calories: 2200, protein: 170 },
      { name: "Thu", calories: 1980, protein: 155 },
      { name: "Fri", calories: 2000, protein: 162 },
      { name: "Sat", calories: 2300, protein: 175 },
      { name: "Sun", calories: 2150, protein: 168 },
    ],
    weeklyReport: {
      wins: [
        "Consistent 3s eccentric squats performed.",
        "Met protein target (165g+) all 7 days.",
        "Left/right bench lockout symmetry reached 94%.",
      ],
      improvements: [
        "Ankle dorsiflexion remains limited.",
        "Average sleep was 6.8 hrs (Target: 7.5 hrs).",
      ],
      priorities: [
        "Focus on 92° parallel squat depth drills.",
        "Ensure 7.5+ hrs sleep to offset quadriceps fatigue.",
      ],
    },
  };

  return NextResponse.json(payload);
}
