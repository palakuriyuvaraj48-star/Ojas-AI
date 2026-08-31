import { NextResponse } from "next/server";
import { computeAdaptiveDecision } from "@/lib/decision-engine/adaptive-decision-engine";
import { createInitialTwin, applyScenario } from "@/lib/digital-twin/engine";
import { ClientProfile, DailyLog } from "@/types/profile";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      scenarioType, 
      profile, 
      dailyLog, 
      logsHistory,
      scenarioMetadata 
    } = body;

    if (!scenarioType) {
      return NextResponse.json(
        { error: "Scenario type is required" },
        { status: 400 }
      );
    }

    // Use provided profile or create demo profile
    const demoProfile: ClientProfile = profile || {
      name: "Demo User",
      age: 22,
      gender: "male" as const,
      height: 174,
      weight: 68.5,
      goal: "fat-loss" as const,
      activityLevel: "moderately-active" as const,
      gymExperience: "intermediate" as const,
      dailyStepGoal: 8500,
      occupation: "College Student",
      workoutDaysPerWeek: 4,
      availableWorkoutTime: 35,
      medicalConditions: "None",
      injuries: "None",
      foodPreference: "both" as const,
      allergies: "None",
      budget: "budget" as const,
      dailyFoodBudget: 100,
      sleepDuration: 7.5,
      stressLevel: "medium" as const,
      availableEquipment: ["bodyweight", "dumbbells"],
      lifestyle: "Hostel living",
      lifestyleRole: "college-student" as const,
      foodEnvironment: "hostel-mess" as const,
      workoutEnvironment: "home" as const,
      isHostelMode: true,
      language: "en" as const,
    };

    // Create baseline Digital Twin
    const baselineTwin = createInitialTwin(demoProfile, "demo_user");

    // Apply scenario to create simulated twin (does NOT modify baseline)
    const scenarioResult = applyScenario(baselineTwin, { 
      type: scenarioType, 
      metadata: scenarioMetadata 
    });
    const simulatedTwin = scenarioResult.updatedTwin;

    // Demo daily log
    const demoDailyLog: DailyLog = dailyLog || {
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

    // Logs history
    const historyLogs: DailyLog[] = logsHistory || [
      { date: "2026-08-27", caloriesConsumed: 2100, proteinConsumed: 120, carbsConsumed: 240, fatConsumed: 55, waterConsumed: 3.0, stepsCount: 8900, workoutCompleted: true, workoutDuration: 40, workoutName: "Lower Body Squat & Core" },
      { date: "2026-08-28", caloriesConsumed: 2050, proteinConsumed: 115, carbsConsumed: 230, fatConsumed: 50, waterConsumed: 2.8, stepsCount: 7800, workoutCompleted: true, workoutDuration: 35, workoutName: "Upper Body Hypertrophy Pull" },
    ];

    // Compute adaptive decision for simulated state
    const baselineDecision = computeAdaptiveDecision(baselineTwin, demoProfile, demoDailyLog, historyLogs);
    const simulatedDecision = computeAdaptiveDecision(simulatedTwin, demoProfile, demoDailyLog, historyLogs);

    return NextResponse.json({
      status: "success",
      scenario: scenarioType,
      scenarioExplanation: scenarioResult.explanation,
      contextChanges: scenarioResult.changes,
      baseline: {
        twin: {
          state: baselineTwin.state,
          recovery: baselineTwin.recovery,
          lifestyle: baselineTwin.lifestyle,
        },
        decision: {
          action: baselineDecision.action,
          headline: baselineDecision.headline,
          suggestedWorkout: baselineDecision.suggestedWorkout,
        },
      },
      simulated: {
        twin: {
          state: simulatedTwin.state,
          recovery: simulatedTwin.recovery,
          lifestyle: simulatedTwin.lifestyle,
        },
        decision: {
          action: simulatedDecision.action,
          headline: simulatedDecision.headline,
          suggestedWorkout: simulatedDecision.suggestedWorkout,
          whyReasons: simulatedDecision.whyReasons,
        },
      },
      comparison: {
        actionChanged: baselineDecision.action !== simulatedDecision.action,
        durationChanged: baselineDecision.suggestedWorkout.durationMinutes !== simulatedDecision.suggestedWorkout.durationMinutes,
        intensityChanged: baselineDecision.suggestedWorkout.intensity !== simulatedDecision.suggestedWorkout.intensity,
      },
      note: "This is a simulation. Your actual Digital Twin was NOT modified.",
    });
  } catch (error: any) {
    console.error("[API /api/simulation] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run simulation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenario = searchParams.get("scenario") || "exam";

  // Quick demo simulation
  const demoProfile: ClientProfile = {
    name: "Demo User",
    age: 22,
    gender: "male" as const,
    height: 174,
    weight: 68.5,
    goal: "fat-loss" as const,
    activityLevel: "moderately-active" as const,
    gymExperience: "intermediate" as const,
    dailyStepGoal: 8500,
    occupation: "College Student",
    workoutDaysPerWeek: 4,
    availableWorkoutTime: 35,
    medicalConditions: "None",
    injuries: "None",
    foodPreference: "both" as const,
    allergies: "None",
    budget: "budget" as const,
    dailyFoodBudget: 100,
    sleepDuration: 7.5,
    stressLevel: "medium" as const,
    availableEquipment: ["bodyweight", "dumbbells"],
    lifestyle: "Hostel living",
    lifestyleRole: "college-student" as const,
    foodEnvironment: "hostel-mess" as const,
    workoutEnvironment: "home" as const,
    isHostelMode: true,
    language: "en" as const,
  };

  const baselineTwin = createInitialTwin(demoProfile, "demo_user");
  const scenarioResult = applyScenario(baselineTwin, { type: scenario });
  const simulatedTwin = scenarioResult.updatedTwin;

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

  const historyLogs: DailyLog[] = [
    { date: "2026-08-27", caloriesConsumed: 2100, proteinConsumed: 120, carbsConsumed: 240, fatConsumed: 55, waterConsumed: 3.0, stepsCount: 8900, workoutCompleted: true, workoutDuration: 40, workoutName: "Lower Body Squat & Core" },
  ];

  const baselineDecision = computeAdaptiveDecision(baselineTwin, demoProfile, demoDailyLog, historyLogs);
  const simulatedDecision = computeAdaptiveDecision(simulatedTwin, demoProfile, demoDailyLog, historyLogs);

  return NextResponse.json({
    status: "success",
    scenario,
    scenarioExplanation: scenarioResult.explanation,
    baselineDecision: {
      action: baselineDecision.action,
      headline: baselineDecision.headline,
      duration: baselineDecision.suggestedWorkout.durationMinutes,
    },
    simulatedDecision: {
      action: simulatedDecision.action,
      headline: simulatedDecision.headline,
      duration: simulatedDecision.suggestedWorkout.durationMinutes,
      whyReasons: simulatedDecision.whyReasons,
    },
  });
}
