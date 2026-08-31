import { NextResponse } from "next/server";
import { buildUnifiedFitnessState, computeOjasDailyDecision } from "@/lib/decision-engine";
import { ClientProfile, DailyLog } from "@/types/profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const availableTime = parseInt(searchParams.get("availableTime") || "35");
  const mood = searchParams.get("mood") || "energetic";
  const isHostel = searchParams.get("isHostel") === "true";

  // Standard Indian athlete demo profile
  const demoProfile: ClientProfile = {
    name: "Anil Kumar",
    age: 22,
    gender: "male",
    height: 174,
    weight: 68.5,
    goal: "fat-loss",
    activityLevel: "moderately-active",
    gymExperience: "intermediate",
    dailyStepGoal: 8500,
    occupation: "College Student",
    workoutDaysPerWeek: 4,
    availableWorkoutTime: availableTime,
    medicalConditions: "None",
    injuries: "None",
    foodPreference: "both",
    allergies: "None",
    budget: "budget",
    dailyFoodBudget: 100,
    sleepDuration: 7.4,
    stressLevel: mood === "tired" ? "high" : "low",
    availableEquipment: ["Bodyweight", "Dumbbells"],
    lifestyle: "Hostel living, busy study schedules",
    lifestyleRole: "college-student",
    foodEnvironment: isHostel ? "hostel-mess" : "home-cooked",
    workoutEnvironment: "home",
    isHostelMode: isHostel,
    language: "en",
  };

  const demoDailyLog: DailyLog = {
    date: new Date().toISOString().split("T")[0],
    caloriesConsumed: 1340,
    proteinConsumed: 78,
    carbsConsumed: 142,
    fatConsumed: 38,
    waterConsumed: 2.25,
    stepsCount: 6240,
    workoutCompleted: false,
    workoutDuration: 0,
    fiberConsumed: 19,
    costIncurred: 55,
  };

  const logsHistory: DailyLog[] = [
    { date: "2026-08-27", caloriesConsumed: 2100, proteinConsumed: 120, carbsConsumed: 240, fatConsumed: 55, waterConsumed: 3.0, stepsCount: 8900, workoutCompleted: true, workoutDuration: 40, workoutName: "Lower Body Squat & Core" },
    { date: "2026-08-28", caloriesConsumed: 2050, proteinConsumed: 115, carbsConsumed: 230, fatConsumed: 50, waterConsumed: 2.8, stepsCount: 7800, workoutCompleted: true, workoutDuration: 35, workoutName: "Upper Body Hypertrophy Pull" },
    { date: "2026-08-29", caloriesConsumed: 1980, proteinConsumed: 105, carbsConsumed: 210, fatConsumed: 48, waterConsumed: 2.5, stepsCount: 8200, workoutCompleted: false, workoutDuration: 0 },
  ];

  const unifiedState = buildUnifiedFitnessState(demoProfile, demoDailyLog, logsHistory, {
    lifestyle: {
      role: demoProfile.lifestyleRole || "college-student",
      availableTimeMinutes: availableTime,
      exerciseLocation: "home",
      equipmentAvailable: demoProfile.availableEquipment,
      travelStatus: "hostel",
    },
  });

  const dailyDecision = computeOjasDailyDecision(unifiedState);

  const responseData = {
    status: "success",
    isPrototypeEstimate: true,
    decision: dailyDecision,
    ojasScores: {
      composite: 88,
      movement: 92,
      nutrition: 84,
      recovery: unifiedState.recovery.recoveryScore,
      consistency: 94,
    },
    state: unifiedState,
    dailySummary: {
      greeting: `Namaste, ${demoProfile.name}`,
      recoveryScore: unifiedState.recovery.recoveryScore,
      recommendationSummary: `Today's Ojas Decision: ${dailyDecision.action} (${dailyDecision.headline})`,
      aiConfidence: dailyDecision.confidence,
    },
    workout: {
      title: dailyDecision.suggestedWorkout.title,
      duration: dailyDecision.suggestedWorkout.durationMinutes,
      intensity: dailyDecision.suggestedWorkout.intensity,
      focus: dailyDecision.suggestedWorkout.focus,
      exercises: dailyDecision.suggestedWorkout.exercises,
      explanation: dailyDecision.whyReasons.join(" "),
    },
    nutrition: {
      calories: unifiedState.nutrition.calorieTarget,
      protein: unifiedState.nutrition.proteinTarget,
      budget: demoProfile.dailyFoodBudget,
      isHostelMode: unifiedState.nutrition.isHostelMode,
      recommendation: dailyDecision.suggestedNutritionAction.recommendation,
      proteinHack: dailyDecision.suggestedNutritionAction.affordableProteinHack,
    },
    recovery: {
      score: unifiedState.recovery.recoveryScore,
      sleepHours: unifiedState.recovery.sleepHours,
      readinessZone: unifiedState.recovery.readinessZone,
      action: dailyDecision.recoveryAction.protocol,
    },
    environment: unifiedState.environment,
    safetyDisclaimer: "This is general adaptive fitness guidance. If you have an injury, medical condition, or feel sudden dizziness, rest and consult a healthcare professional.",
  };

  return NextResponse.json(responseData);
}
