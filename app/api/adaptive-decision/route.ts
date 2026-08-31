import { NextResponse } from "next/server";
import { computeAdaptiveDecision } from "@/lib/decision-engine/adaptive-decision-engine";
import { createInitialTwin, applyScenario } from "@/lib/digital-twin/engine";
import { ClientProfile, DailyLog } from "@/types/profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenario = searchParams.get("scenario");
  const availableTime = parseInt(searchParams.get("availableTime") || "35");
  const sleepHours = parseFloat(searchParams.get("sleepHours") || "7.5");
  const stressLevel = searchParams.get("stressLevel") || "medium";
  const isExamPeriod = searchParams.get("isExamPeriod") === "true";
  const budget = parseInt(searchParams.get("budget") || "100");
  const equipment = searchParams.get("equipment")?.split(",") || ["bodyweight", "dumbbells"];

  // Demo profile
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
    dailyFoodBudget: budget,
    sleepDuration: sleepHours,
    stressLevel: stressLevel as any,
    availableEquipment: equipment,
    lifestyle: "Hostel living, busy study schedules",
    lifestyleRole: "college-student",
    foodEnvironment: "hostel-mess",
    workoutEnvironment: "home",
    isHostelMode: true,
    language: "en",
  };

  // Create initial Digital Twin
  let twin = createInitialTwin(demoProfile, "demo_user");

  // Apply scenario if provided
  if (scenario) {
    const scenarioResult = applyScenario(twin, { type: scenario });
    twin = scenarioResult.updatedTwin;
  }

  // Apply exam mode if specified
  if (isExamPeriod) {
    const examResult = applyScenario(twin, { type: "exam" });
    twin = examResult.updatedTwin;
  }

  // Demo daily log
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

  // Logs history for training load calculation
  const logsHistory: DailyLog[] = [
    { date: "2026-08-27", caloriesConsumed: 2100, proteinConsumed: 120, carbsConsumed: 240, fatConsumed: 55, waterConsumed: 3.0, stepsCount: 8900, workoutCompleted: true, workoutDuration: 40, workoutName: "Lower Body Squat & Core" },
    { date: "2026-08-28", caloriesConsumed: 2050, proteinConsumed: 115, carbsConsumed: 230, fatConsumed: 50, waterConsumed: 2.8, stepsCount: 7800, workoutCompleted: true, workoutDuration: 35, workoutName: "Upper Body Hypertrophy Pull" },
    { date: "2026-08-29", caloriesConsumed: 1980, proteinConsumed: 105, carbsConsumed: 210, fatConsumed: 48, waterConsumed: 2.5, stepsCount: 8200, workoutCompleted: false, workoutDuration: 0 },
  ];

  // Compute adaptive decision
  const decision = computeAdaptiveDecision(twin, demoProfile, demoDailyLog, logsHistory);

  return NextResponse.json({
    status: "success",
    scenario: scenario || "baseline",
    twin: {
      state: twin.state,
      recovery: twin.recovery,
      lifestyle: twin.lifestyle,
      behavioral: twin.behavioral,
      dataQuality: twin.dataQuality,
    },
    decision,
    safetyDisclaimer: "This is general adaptive fitness guidance. If you have an injury, medical condition, or feel sudden dizziness, rest and consult a healthcare professional.",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      profile, 
      dailyLog, 
      logsHistory, 
      twin, 
      overrides 
    } = body;

    // Compute adaptive decision with provided data
    const decision = computeAdaptiveDecision(
      twin,
      profile,
      dailyLog,
      logsHistory || [],
      overrides
    );

    return NextResponse.json({
      status: "success",
      decision,
    });
  } catch (error: any) {
    console.error("[API /api/adaptive-decision] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compute adaptive decision" },
      { status: 500 }
    );
  }
}
