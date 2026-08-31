/**
 * Benchmark Test Scenarios for Ojas Adaptive System
 * Validates the decision engine across realistic user situations
 */

import { createInitialTwin, applyScenario } from "../digital-twin/engine";
import { computeAdaptiveDecision, OjasActionType } from "../decision-engine/adaptive-decision-engine";
import { ClientProfile, DailyLog } from "@/types/profile";

export interface BenchmarkScenario {
  id: string;
  name: string;
  description: string;
  profile: ClientProfile;
  dailyLog: DailyLog;
  logsHistory: DailyLog[];
  scenarioType?: string;
  expectedBehavior: {
    action: OjasActionType;
    maxDurationMinutes: number;
    minConfidence: number;
    shouldPrioritizeRecovery: boolean;
  };
}

export interface BenchmarkResult {
  scenarioId: string;
  passed: boolean;
  actualAction: string;
  actualDuration: number;
  actualConfidence: number;
  actualRecoveryPriority: boolean;
  details: {
    actionMatch: boolean;
    durationMatch: boolean;
    confidenceMatch: boolean;
    recoveryMatch: boolean;
  };
}

/**
 * Generate comprehensive test scenarios covering edge cases
 */
export function generateBenchmarkScenarios(): BenchmarkScenario[] {
  const baseProfile: ClientProfile = {
    name: "Test User",
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
    availableWorkoutTime: 35,
    medicalConditions: "None",
    injuries: "None",
    foodPreference: "both",
    allergies: "None",
    budget: "budget",
    dailyFoodBudget: 100,
    sleepDuration: 7.5,
    stressLevel: "medium",
    availableEquipment: ["bodyweight", "dumbbells"],
    lifestyle: "Hostel living",
    lifestyleRole: "college-student",
    foodEnvironment: "hostel-mess",
    workoutEnvironment: "home",
    isHostelMode: true,
    language: "en",
  };

  const baseDailyLog: DailyLog = {
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

  const baseHistory: DailyLog[] = [
    { date: "2026-08-27", caloriesConsumed: 2100, proteinConsumed: 120, carbsConsumed: 240, fatConsumed: 55, waterConsumed: 3.0, stepsCount: 8900, workoutCompleted: true, workoutDuration: 40, workoutName: "Lower Body Squat & Core" },
    { date: "2026-08-28", caloriesConsumed: 2050, proteinConsumed: 115, carbsConsumed: 230, fatConsumed: 50, waterConsumed: 2.8, stepsCount: 7800, workoutCompleted: true, workoutDuration: 35, workoutName: "Upper Body Hypertrophy Pull" },
  ];

  return [
    // SCENARIO 1: Baseline - Normal conditions
    {
      id: "baseline-normal",
      name: "Baseline: Normal Conditions",
      description: "User with adequate sleep, moderate stress, standard equipment, normal budget",
      profile: { ...baseProfile },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 35,
        minConfidence: 70,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 2: Exam Period
    {
      id: "exam-period",
      name: "Exam Period: High Stress, Low Time",
      description: "User in exam week with high stress, reduced available time, sleep deficit",
      profile: { ...baseProfile, stressLevel: "high", availableWorkoutTime: 20, sleepDuration: 5.5 },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "exam",
      expectedBehavior: {
        action: "REDUCED_TRAINING",
        maxDurationMinutes: 25,
        minConfidence: 60,
        shouldPrioritizeRecovery: true,
      },
    },

    // SCENARIO 3: Poor Sleep
    {
      id: "poor-sleep",
      name: "Poor Sleep: Acute Fatigue",
      description: "User slept only 4 hours, recovery score should be depressed",
      profile: { ...baseProfile, sleepDuration: 4.0 },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "poor-sleep",
      expectedBehavior: {
        action: "RECOVERY_SESSION",
        maxDurationMinutes: 20,
        minConfidence: 60,
        shouldPrioritizeRecovery: true,
      },
    },

    // SCENARIO 4: Travel Mode
    {
      id: "travel-mode",
      name: "Travel: Hotel Room Constraints",
      description: "User traveling with no equipment, limited space",
      profile: { ...baseProfile, availableEquipment: ["bodyweight"], workoutEnvironment: "outdoor" },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "travel",
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 30,
        minConfidence: 65,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 5: Budget Cut
    {
      id: "budget-cut",
      name: "Budget Cut: ₹50/day",
      description: "User's food budget reduced to ₹50/day, nutrition should adapt",
      profile: { ...baseProfile, dailyFoodBudget: 50, budget: "budget" },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "budget-change",
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 35,
        minConfidence: 65,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 6: No Equipment
    {
      id: "no-equipment",
      name: "No Equipment: Bodyweight Only",
      description: "User has no equipment available, should adapt exercises",
      profile: { ...baseProfile, availableEquipment: ["bodyweight"] },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "no-equipment",
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 35,
        minConfidence: 65,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 7: Form Degradation
    {
      id: "form-degradation",
      name: "Form Degradation: Vision Coach Alert",
      description: "Vision Coach detected declining form quality",
      profile: { ...baseProfile },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      scenarioType: "form-degradation",
      expectedBehavior: {
        action: "REDUCED_TRAINING",
        maxDurationMinutes: 30,
        minConfidence: 65,
        shouldPrioritizeRecovery: true,
      },
    },

    // SCENARIO 8: High Stress
    {
      id: "high-stress",
      name: "High Stress: Work Pressure",
      description: "User reporting high stress levels without exam context",
      profile: { ...baseProfile, stressLevel: "high" },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "REDUCED_TRAINING",
        maxDurationMinutes: 30,
        minConfidence: 65,
        shouldPrioritizeRecovery: true,
      },
    },

    // SCENARIO 9: Very Low Time
    {
      id: "very-low-time",
      name: "Very Low Time: 15 Minutes",
      description: "User only has 15 minutes available",
      profile: { ...baseProfile, availableWorkoutTime: 15 },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 20,
        minConfidence: 60,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 10: Combined Stressors
    {
      id: "combined-stressors",
      name: "Combined: Poor Sleep + High Stress + Low Budget",
      description: "Multiple stressors simultaneously - should prioritize recovery",
      profile: { 
        ...baseProfile, 
        sleepDuration: 5.0, 
        stressLevel: "high", 
        dailyFoodBudget: 60 
      },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "RECOVERY_SESSION",
        maxDurationMinutes: 25,
        minConfidence: 55,
        shouldPrioritizeRecovery: true,
      },
    },

    // SCENARIO 11: Athlete Mode - Sport Transition
    {
      id: "sport-transition",
      name: "Sport Transition: Football Foundation",
      description: "User transitioning to football with agility gap",
      profile: { 
        ...baseProfile, 
        userMode: "sport-transition",
        selectedSport: "football",
        sportLevel: "foundation",
        sportAttributes: { agility: 45, lower_body_power: 60, endurance: 70 },
      },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 35,
        minConfidence: 65,
        shouldPrioritizeRecovery: false,
      },
    },

    // SCENARIO 12: Hostel Mode with Mess Menu
    {
      id: "hostel-mode",
      name: "Hostel Mode: Mess Menu Constraints",
      description: "User in hostel with mess menu constraints",
      profile: { 
        ...baseProfile, 
        isHostelMode: true, 
        foodEnvironment: "hostel-mess",
        dailyFoodBudget: 80 
      },
      dailyLog: { ...baseDailyLog },
      logsHistory: [...baseHistory],
      expectedBehavior: {
        action: "FULL_TRAINING",
        maxDurationMinutes: 35,
        minConfidence: 65,
        shouldPrioritizeRecovery: false,
      },
    },
  ];
}

/**
 * Run benchmark tests across all scenarios
 */
export async function runBenchmarkSuite(): Promise<{
  results: BenchmarkResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}> {
  const scenarios = generateBenchmarkScenarios();
  const results: BenchmarkResult[] = [];

  for (const scenario of scenarios) {
    const result = await runSingleBenchmark(scenario);
    results.push(result);
  }

  const passed = results.filter(r => r.passed).length;
  const summary = {
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate: Math.round((passed / results.length) * 100),
  };

  return { results, summary };
}

/**
 * Run a single benchmark scenario
 */
async function runSingleBenchmark(scenario: BenchmarkScenario): Promise<BenchmarkResult> {
  try {
    // Create Digital Twin
    let twin = createInitialTwin(scenario.profile, "benchmark_user");

    // Apply scenario if specified
    if (scenario.scenarioType) {
      const scenarioResult = applyScenario(twin, { type: scenario.scenarioType });
      twin = scenarioResult.updatedTwin;
    }

    // Compute adaptive decision
    const decision = computeAdaptiveDecision(
      twin,
      scenario.profile,
      scenario.dailyLog,
      scenario.logsHistory
    );

    // Validate against expected behavior
    const actionMatch = decision.action === scenario.expectedBehavior.action;
    const durationMatch = decision.suggestedWorkout.durationMinutes <= scenario.expectedBehavior.maxDurationMinutes;
    const confidenceMatch = decision.confidenceScore >= scenario.expectedBehavior.minConfidence;
    const recoveryMatch = decision.safetyAssessment.isDeloadMandated === scenario.expectedBehavior.shouldPrioritizeRecovery;

    const passed = actionMatch && durationMatch && confidenceMatch && recoveryMatch;

    return {
      scenarioId: scenario.id,
      passed,
      actualAction: decision.action,
      actualDuration: decision.suggestedWorkout.durationMinutes,
      actualConfidence: decision.confidenceScore,
      actualRecoveryPriority: decision.safetyAssessment.isDeloadMandated,
      details: {
        actionMatch,
        durationMatch,
        confidenceMatch,
        recoveryMatch,
      },
    };
  } catch (error: any) {
    console.error(`Benchmark failed for scenario ${scenario.id}:`, error);
    return {
      scenarioId: scenario.id,
      passed: false,
      actualAction: "ERROR",
      actualDuration: 0,
      actualConfidence: 0,
      actualRecoveryPriority: false,
      details: {
        actionMatch: false,
        durationMatch: false,
        confidenceMatch: false,
        recoveryMatch: false,
      },
    };
  }
}

/**
 * Generate human-readable benchmark report
 */
export function generateBenchmarkReport(results: BenchmarkResult[], summary: any): string {
  let report = "=== OJAS ADAPTIVE SYSTEM BENCHMARK REPORT ===\n\n";
  report += `Total Scenarios: ${summary.total}\n`;
  report += `Passed: ${summary.passed}\n`;
  report += `Failed: ${summary.failed}\n`;
  report += `Pass Rate: ${summary.passRate}%\n\n`;

  report += "--- DETAILED RESULTS ---\n\n";

  for (const result of results) {
    const status = result.passed ? "✓ PASS" : "✗ FAIL";
    report += `${status} - ${result.scenarioId}\n`;
    report += `  Action: ${result.actualAction} (Match: ${result.details.actionMatch})\n`;
    report += `  Duration: ${result.actualDuration}min (Match: ${result.details.durationMatch})\n`;
    report += `  Confidence: ${result.actualConfidence}% (Match: ${result.details.confidenceMatch})\n`;
    report += `  Recovery Priority: ${result.actualRecoveryPriority} (Match: ${result.details.recoveryMatch})\n\n`;
  }

  return report;
}
