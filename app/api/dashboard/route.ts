import { NextResponse } from "next/server";
import { computeAdaptiveDecision } from "@/lib/decision-engine/adaptive-decision-engine";
import { createInitialTwin } from "@/lib/digital-twin/engine";
import { ClientProfile, DailyLog } from "@/types/profile";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const availableTime = parseInt(searchParams.get("availableTime") || "35");
  const mood = searchParams.get("mood") || "energetic";
  const isHostel = searchParams.get("isHostel") === "true";
  const scenario = searchParams.get("scenario");

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

  // Create Digital Twin
  let twin = createInitialTwin(demoProfile, "demo_user");

  // Apply scenario if provided (for demo/testing)
  if (scenario) {
    const { applyScenario } = await import("@/lib/digital-twin/engine");
    const scenarioResult = applyScenario(twin, { type: scenario });
    twin = scenarioResult.updatedTwin;
  }

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

  // Use the new Adaptive Decision Engine
  const adaptiveDecision = computeAdaptiveDecision(twin, demoProfile, demoDailyLog, logsHistory);

  // Map Adaptive Decision to legacy format for backward compatibility
  const responseData = {
    status: "success",
    isPrototypeEstimate: true,
    decision: {
      action: adaptiveDecision.action as any,
      badgeColor: adaptiveDecision.badge.color,
      headline: adaptiveDecision.headline,
      subtitle: adaptiveDecision.subtitle,
      whyReasons: adaptiveDecision.whyReasons,
      basedOn: {
        recoveryScore: adaptiveDecision.decisionFactors.find(f => f.signal === "Recovery Score")?.observedValue as number || 75,
        sleepHours: adaptiveDecision.decisionFactors.find(f => f.signal === "Sleep Duration")?.observedValue as number || 7.5,
        trainingLoad: adaptiveDecision.safetyAssessment.riskLevel === "ELEVATED" ? "Elevated" : "Balanced",
        availableTime: adaptiveDecision.decisionFactors.find(f => f.signal === "Available Time")?.observedValue as number || 35,
        fatigueFocus: "Systemic Low",
        environmentText: `${twin.environment.temperatureC || 30}°C (${twin.environment.condition || "Moderate"})`,
        primaryGoal: demoProfile.goal,
      },
      priorities: [
        {
          icon: "🏋️",
          category: "workout",
          title: adaptiveDecision.suggestedWorkout.title,
          description: `${adaptiveDecision.suggestedWorkout.intensity} intensity • ${adaptiveDecision.suggestedWorkout.durationMinutes} mins`,
          actionText: "Start Workout",
          actionHref: "/workout",
        },
        {
          icon: "🍛",
          category: "nutrition",
          title: adaptiveDecision.suggestedNutrition.headline,
          description: `Target ${adaptiveDecision.suggestedNutrition.targetProteinGrams}g protein`,
          actionText: "View Nutrition",
          actionHref: "/food",
        },
        {
          icon: "💧",
          category: "hydration",
          title: `${demoProfile.waterIntake || 3}L Hydration Target`,
          description: "Keep a water bottle handy for steady sips",
        },
        {
          icon: "😴",
          category: "recovery",
          title: `${Math.round(demoProfile.sleepDuration)}h Sleep Target`,
          description: `Aim for bedtime at ${demoProfile.sleepTime || "10:30 PM"}`,
          actionText: "Recovery Protocols",
          actionHref: "/recovery",
        },
      ],
      confidence: adaptiveDecision.confidenceScore >= 80 ? "High" : "Moderate estimate",
      suggestedWorkout: adaptiveDecision.suggestedWorkout,
      suggestedNutritionAction: {
        headline: adaptiveDecision.suggestedNutrition.headline,
        recommendation: adaptiveDecision.suggestedNutrition.recommendation,
        affordableProteinHack: adaptiveDecision.suggestedNutrition.practicalMealSuggestions[0]?.name || "Eggs + Dal",
        estimatedCostINR: adaptiveDecision.suggestedNutrition.dailyBudgetINR,
      },
      recoveryAction: {
        headline: adaptiveDecision.safetyAssessment.isDeloadMandated ? "Active Recovery" : "Post-Workout Mobility",
        protocol: adaptiveDecision.safetyAssessment.mitigationActions.join(", ") || "5 min dynamic stretch",
        mobilityMinutes: 5,
      },
    },
    ojasScores: {
      composite: Math.round((twin.dataQuality + adaptiveDecision.confidenceScore) / 2),
      movement: twin.physical.formQualityScore,
      nutrition: twin.nutrition.macroAdherence.protein,
      recovery: Math.round(twin.recovery.recoveryScore),
      consistency: twin.behavioral.workoutConsistency,
    },
    twin: {
      state: twin.state,
      dataQuality: twin.dataQuality,
      recovery: twin.recovery,
      lifestyle: twin.lifestyle,
    },
    adaptiveDecision: {
      action: adaptiveDecision.action,
      badge: adaptiveDecision.badge,
      confidenceScore: adaptiveDecision.confidenceScore,
      twinCompleteness: adaptiveDecision.twinCompleteness,
      decisionFactors: adaptiveDecision.decisionFactors,
      safetyAssessment: adaptiveDecision.safetyAssessment,
      environmentalAdvice: adaptiveDecision.environmentalAdvice,
    },
    dailySummary: {
      greeting: `Namaste, ${demoProfile.name}`,
      recoveryScore: Math.round(twin.recovery.recoveryScore),
      recommendationSummary: `Today's Ojas Decision: ${adaptiveDecision.action} (${adaptiveDecision.headline})`,
      aiConfidence: adaptiveDecision.confidenceScore >= 80 ? "High" : "Moderate",
    },
    workout: {
      title: adaptiveDecision.suggestedWorkout.title,
      duration: adaptiveDecision.suggestedWorkout.durationMinutes,
      intensity: adaptiveDecision.suggestedWorkout.intensity,
      focus: adaptiveDecision.suggestedWorkout.focus,
      exercises: adaptiveDecision.suggestedWorkout.exercises,
      explanation: adaptiveDecision.whyReasons.join(" "),
    },
    nutrition: {
      calories: adaptiveDecision.suggestedNutrition.targetCalories,
      protein: adaptiveDecision.suggestedNutrition.targetProteinGrams,
      budget: adaptiveDecision.suggestedNutrition.dailyBudgetINR,
      isHostelMode: twin.nutrition.isHostelMode,
      recommendation: adaptiveDecision.suggestedNutrition.recommendation,
      proteinHack: adaptiveDecision.suggestedNutrition.practicalMealSuggestions[0]?.name || "",
    },
    recovery: {
      score: Math.round(twin.recovery.recoveryScore),
      sleepHours: twin.recovery.sleepDuration,
      readinessZone: twin.recovery.readiness,
      action: adaptiveDecision.safetyAssessment.mitigationActions[0] || "Standard recovery",
    },
    environment: twin.environment,
    safetyDisclaimer: "This is general adaptive fitness guidance. If you have an injury, medical condition, or feel sudden dizziness, rest and consult a healthcare professional.",
  };

  return NextResponse.json(responseData);
}
