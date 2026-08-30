/**
 * Digital Twin Engine: Build, update, and analyze the user's persistent state model.
 */

import {
  DigitalTwin,
  TwinDelta,
  TwinHistory,
  ContextChanges,
  PhysicalState,
  BehavioralState,
  RecoveryState,
  NutritionState,
  LifestyleState,
} from "./types";
import { ClientProfile, DailyLog, WeeklyCheckIn, ActivityLevel } from "@/types/profile";

/**
 * Map profile activity level to lifestyle occupational activity.
 */
function mapActivityLevel(activityLevel: ActivityLevel): "sedentary" | "light" | "moderate" | "active" {
  const mapping: Record<ActivityLevel, "sedentary" | "light" | "moderate" | "active"> = {
    sedentary: "sedentary",
    "lightly-active": "light",
    "moderately-active": "moderate",
    "very-active": "active",
    "extra-active": "active",
  };
  return mapping[activityLevel] || "moderate";
}

/**
 * Create initial Digital Twin from onboarding profile.
 */
export function createInitialTwin(profile: ClientProfile, userId: string): DigitalTwin {
  const now = new Date().toISOString();

  return {
    id: `twin_${userId}_${Date.now()}`,
    userId,
    version: 1,
    timestamp: now,
    state: "initial",

    physical: {
      weight: profile.weight,
      bodyFat: profile.bodyFat,
      measurements: {},
      fitnessLevel: profile.gymExperience,
      strengthTrend: "stable",
      workoutPerformance: {
        avgRepRange: [8, 12],
        avgDuration: 45,
        exercises: [],
      },
    },

    behavioral: {
      workoutConsistency: 50, // assumption for new user
      missedWorkouts: 0,
      preferredWorkoutTime: profile.workoutTime || "morning",
      workoutDaysPerWeekActual: profile.workoutDaysPerWeek,
      exercisePreferences: [],
      adherencePattern: "moderate",
    },

    recovery: {
      sleepDuration: profile.sleepDuration,
      sleepQuality: "average",
      fatigueLevel: 50,
      trainingLoad: 0,
      recoveryScore: 50,
      readiness: "moderate",
      lastRestDay: now,
    },

    nutrition: {
      averageCaloriesConsumed: 0, // will update from logs
      macroAdhererence: {
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      foodPreferences: [profile.foodPreference],
      budget: profile.budget === "budget" ? 150 : profile.budget === "moderate" ? 300 : 500,
      budgetAdherence: 100,
      mealFrequency: 3,
      hydrationLevel: profile.waterIntake || 2.5,
    },

    lifestyle: {
      // Prefer the user's stated availability. The occupation fallback keeps older profiles working.
      availableTime: profile.availableWorkoutTime ?? (profile.occupation?.toLowerCase().includes("student") ? 30 : 60),
      availableEquipment: profile.availableEquipment || [],
      workoutEnvironment: profile.workoutEnvironment || "gym",
      stressLevel: profile.stressLevel,
      lifestyle: profile.lifestyle,
      travelStatus: "home",
      occupationalActivity: mapActivityLevel(profile.activityLevel),
    },

    recentChanges: [],
    lastUpdated: now,
    dataQuality: 40, // low confidence on new user
    notes: ["Initial twin created from onboarding profile"],
  };
}

/**
 * Update Twin with new data from daily logs and checkins.
 * Returns updated twin + delta from previous version.
 */
export function updateTwinFromLogs(
  twin: DigitalTwin,
  recentLogs: DailyLog[],
  recentCheckins: WeeklyCheckIn[]
): { updatedTwin: DigitalTwin; delta: TwinDelta } {
  const now = new Date().toISOString();
  const newTwin: DigitalTwin = JSON.parse(JSON.stringify(twin));
  newTwin.version += 1;
  newTwin.timestamp = now;

  const deltas: Partial<PhysicalState> &
    Partial<BehavioralState> &
    Partial<RecoveryState> &
    Partial<NutritionState> &
    Partial<LifestyleState> = {};
  const changes: string[] = [];

  // Update from recent logs
  if (recentLogs.length > 0) {
    const avgCalories =
      recentLogs.reduce((sum, log) => sum + log.caloriesConsumed, 0) / recentLogs.length;
    const avgProtein =
      recentLogs.reduce((sum, log) => sum + log.proteinConsumed, 0) / recentLogs.length;
    const workoutsCompleted = recentLogs.filter((log) => log.workoutCompleted).length;
    const consistency = Math.round((workoutsCompleted / recentLogs.length) * 100);

    newTwin.nutrition.averageCaloriesConsumed = Math.round(avgCalories);
    newTwin.behavioral.workoutConsistency = consistency;

    if (consistency > 80) {
      newTwin.behavioral.adherencePattern = "high";
      changes.push("Workout consistency improved to high");
    } else if (consistency < 40) {
      newTwin.behavioral.adherencePattern = "low";
      changes.push("Workout consistency dropped to low");
    }

    deltas.averageCaloriesConsumed = avgCalories;
    deltas.workoutConsistency = consistency;
  }

  // Update from checkins
  if (recentCheckins.length > 0) {
    const latestCheckin = recentCheckins[recentCheckins.length - 1];

    // Weight tracking
    const previousWeight = newTwin.physical.weight;
    newTwin.physical.weight = latestCheckin.weight;
    if (latestCheckin.weight < previousWeight) {
      changes.push(`Weight decreased by ${(previousWeight - latestCheckin.weight).toFixed(1)}kg`);
      deltas.weight = latestCheckin.weight;
    }

    // Sleep tracking
    newTwin.recovery.sleepQuality = latestCheckin.sleepQuality;
    if (latestCheckin.sleepQuality === "poor") {
      changes.push("Sleep quality degraded");
    }

    // Recovery tracking
    newTwin.recovery.readiness = latestCheckin.adjustments?.reason?.includes("recovery")
      ? "fatigued"
      : "moderate";
  }

  newTwin.dataQuality = Math.min(100, newTwin.dataQuality + 5); // improve confidence
  newTwin.lastUpdated = now;

  const delta: TwinDelta = {
    fromVersion: twin.version,
    toVersion: newTwin.version,
    significantChanges: changes,
    timestamp: now,
  };

  if (Object.keys(deltas).length > 0) {
    Object.assign(delta, deltas);
  }

  return { updatedTwin: newTwin, delta };
}

/**
 * Apply a scenario (exam, travel, poor sleep, budget change) to the twin.
 * Returns updated twin with changed context + explanation.
 */
export function applyScenario(
  twin: DigitalTwin,
  scenario: {
    type: "exam" | "travel" | "poor-sleep" | "budget-change" | "injury" | "gym-closed";
    duration?: number; // days
    metadata?: Record<string, any>;
  }
): { updatedTwin: DigitalTwin; changes: ContextChanges; explanation: string } {
  const now = new Date().toISOString();
  const newTwin: DigitalTwin = JSON.parse(JSON.stringify(twin));
  newTwin.version += 1;
  newTwin.timestamp = now;

  const contextChange: ContextChanges = { timestamp: now, reason: scenario.type };
  let explanation = "";

  switch (scenario.type) {
    case "exam": {
      // Exam period: reduced time, poor sleep, high stress
      contextChange.availableTimeChange = {
        before: newTwin.lifestyle.availableTime,
        after: 20,
      };
      contextChange.sleepChange = {
        before: newTwin.recovery.sleepDuration,
        after: 5.5,
      };
      contextChange.stressLevelChange = {
        before: newTwin.lifestyle.stressLevel,
        after: "high",
      };

      newTwin.lifestyle.availableTime = 20;
      newTwin.recovery.sleepDuration = 5.5;
      newTwin.recovery.sleepQuality = "poor";
      newTwin.lifestyle.stressLevel = "high";
      newTwin.recovery.recoveryScore = 30;
      newTwin.recovery.readiness = "fatigued";

      explanation =
        "Exam period detected. Available time reduced from 60 to 20 minutes. Sleep duration dropped from 7.5 to 5.5 hours and stress increased to high. Recovery score adjusted accordingly.";
      break;
    }

    case "travel": {
      // Travel: limited equipment, variable time, different food
      contextChange.equipmentChange = {
        before: newTwin.lifestyle.availableEquipment,
        after: ["bodyweight", "hotel-room"],
      };
      contextChange.availableTimeChange = {
        before: newTwin.lifestyle.availableTime,
        after: 25,
      };

      newTwin.lifestyle.availableEquipment = ["bodyweight", "hotel-room"];
      newTwin.lifestyle.availableTime = 25;
      newTwin.lifestyle.workoutEnvironment = "limited";
      newTwin.lifestyle.travelStatus = "travelling";

      explanation =
        "Travel scenario active. Available equipment limited to bodyweight and hotel room. Workout time adjusted to 25 minutes. Nutrition plan will adapt to available food options.";
      break;
    }

    case "poor-sleep": {
      // Poor sleep: reduced recovery, lower readiness
      contextChange.sleepChange = {
        before: newTwin.recovery.sleepDuration,
        after: Math.max(4, newTwin.recovery.sleepDuration - 2),
      };

      newTwin.recovery.sleepDuration -= 2;
      newTwin.recovery.sleepQuality = "poor";
      newTwin.recovery.recoveryScore = Math.max(20, newTwin.recovery.recoveryScore - 30);
      newTwin.recovery.readiness = "fatigued";
      newTwin.behavioral.workoutConsistency = Math.max(30, newTwin.behavioral.workoutConsistency - 15);

      explanation = `Poor sleep detected. Sleep duration reduced to ${newTwin.recovery.sleepDuration}h. Recovery score and workout readiness adjusted downward to account for reduced recovery capacity.`;
      break;
    }

    case "budget-change": {
      // Budget change: nutrition plan must adapt
      const newBudget = scenario.metadata?.newBudget || 150;
      contextChange.budgetChange = {
        before: newTwin.nutrition.budget,
        after: newBudget,
      };

      newTwin.nutrition.budget = newBudget;
      newTwin.nutrition.budgetAdherence = 100; // reset adherence on new budget

      explanation = `Budget changed from ₹${contextChange.budgetChange?.before || newTwin.nutrition.budget}/day to ₹${newBudget}/day. Nutrition plan will adapt to more affordable, accessible food options.`;
      break;
    }

    case "gym-closed": {
      // Gym closed: change environment and equipment
      contextChange.equipmentChange = {
        before: newTwin.lifestyle.availableEquipment,
        after: ["bodyweight"],
      };

      newTwin.lifestyle.availableEquipment = ["bodyweight"];
      newTwin.lifestyle.workoutEnvironment = "home";

      explanation =
        "Gym access unavailable. Workout environment changed to home-only with bodyweight exercises. Workout plan will adapt to equipment-free training.";
      break;
    }

    case "injury": {
      // Injury: restrict certain exercises, focus on recovery
      newTwin.recovery.readiness = "overreaching";
      newTwin.recovery.recoveryScore = 10;
      newTwin.behavioral.workoutConsistency = Math.max(20, newTwin.behavioral.workoutConsistency - 30);

      explanation =
        "Injury detected. Recovery priority increased. Workout plan will focus on rehabilitation and safe movement patterns.";
      break;
    }
  }

  newTwin.recentChanges.push(contextChange);
  newTwin.lastUpdated = now;
  newTwin.state = "adapting"; // flag that adaptation is needed

  return {
    updatedTwin: newTwin,
    changes: contextChange,
    explanation,
  };
}

/**
 * Compare two twins to identify significant changes.
 */
export function compareTwins(previous: DigitalTwin, current: DigitalTwin): TwinDelta {
  const changes: string[] = [];

  // Physical changes
  if (previous.physical.weight !== current.physical.weight) {
    const delta = current.physical.weight - previous.physical.weight;
    changes.push(
      `Weight ${delta > 0 ? "increased" : "decreased"} by ${Math.abs(delta).toFixed(1)}kg`
    );
  }

  // Behavioral changes
  if (previous.behavioral.workoutConsistency !== current.behavioral.workoutConsistency) {
    const delta = current.behavioral.workoutConsistency - previous.behavioral.workoutConsistency;
    changes.push(`Workout consistency ${delta > 0 ? "improved" : "declined"} by ${Math.abs(delta)}%`);
  }

  // Recovery changes
  if (previous.recovery.sleepDuration !== current.recovery.sleepDuration) {
    changes.push(
      `Sleep duration changed from ${previous.recovery.sleepDuration}h to ${current.recovery.sleepDuration}h`
    );
  }

  // Lifestyle changes
  if (previous.lifestyle.availableTime !== current.lifestyle.availableTime) {
    changes.push(
      `Available time changed from ${previous.lifestyle.availableTime}min to ${current.lifestyle.availableTime}min`
    );
  }

  if (previous.lifestyle.stressLevel !== current.lifestyle.stressLevel) {
    changes.push(`Stress level changed from ${previous.lifestyle.stressLevel} to ${current.lifestyle.stressLevel}`);
  }

  return {
    fromVersion: previous.version,
    toVersion: current.version,
    significantChanges: changes,
    timestamp: new Date().toISOString(),
  };
}
