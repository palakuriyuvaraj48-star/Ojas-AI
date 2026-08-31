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
import { SportTwinState } from "@/lib/sports/types";

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
      availableTime: profile.availableWorkoutTime ?? (profile.occupation?.toLowerCase().includes("student") ? 30 : 60),
      availableEquipment: profile.availableEquipment || [],
      workoutEnvironment: profile.workoutEnvironment || "gym",
      stressLevel: profile.stressLevel,
      lifestyle: profile.lifestyle,
      travelStatus: "home",
      occupationalActivity: mapActivityLevel(profile.activityLevel),
    },

    sport: {
      userMode: profile.userMode || "general-fitness",
      selectedSportId: profile.selectedSport || "football",
      sportLevel: profile.sportLevel || "foundation",
      trainingReadinessScore: 74,
      personalBaseline: (profile.sportBaselines as any) || {
        acceleration: 60,
        agility: 54,
        endurance: 70,
        lower_body_power: 62,
        upper_body_strength: 58,
        core_stability: 60,
        mobility: 75,
        reaction_time: 68,
        rotational_power: 55,
        repeated_effort: 64,
      },
      currentAttributes: (profile.sportAttributes as any) || {
        acceleration: 64,
        agility: 59,
        endurance: 72,
        lower_body_power: 65,
        upper_body_strength: 60,
        core_stability: 64,
        mobility: 80,
        reaction_time: 72,
        rotational_power: 58,
        repeated_effort: 68,
      },
      primaryGapAttribute: "agility",
      lastAssessmentDate: now,
      activeChallenges: [],
    },

    recentChanges: [],
    lastUpdated: now,
    dataQuality: 40,
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

    // Track consistency change
    if (Math.abs(consistency - twin.behavioral.workoutConsistency) > 10) {
      changes.push(
        `Workout consistency changed from ${twin.behavioral.workoutConsistency}% to ${consistency}%`
      );
      deltas.workoutConsistency = consistency;
    }

    // Update training load (sum of workout durations in last 7 days)
    const totalDuration = recentLogs.reduce((sum, log) => sum + (log.workoutDuration || 0), 0);
    newTwin.recovery.trainingLoad = totalDuration;
  }

  // Update from checkins
  if (recentCheckins.length > 0) {
    const latestCheckin = recentCheckins[0];

    if (latestCheckin.weight !== twin.physical.weight) {
      changes.push(`Weight changed from ${twin.physical.weight}kg to ${latestCheckin.weight}kg`);
      newTwin.physical.weight = latestCheckin.weight;
      deltas.weight = latestCheckin.weight;
    }

    if (latestCheckin.stressLevel !== twin.lifestyle.stressLevel) {
      changes.push(
        `Stress level changed from ${twin.lifestyle.stressLevel} to ${latestCheckin.stressLevel}`
      );
      newTwin.lifestyle.stressLevel = latestCheckin.stressLevel;
      deltas.stressLevel = latestCheckin.stressLevel;
    }

    if (latestCheckin.strengthLevel) {
      const strengthMapping: Record<string, "decreasing" | "stable" | "increasing"> = {
        decreased: "decreasing",
        stable: "stable",
        increased: "increasing",
      };
      newTwin.physical.strengthTrend = strengthMapping[latestCheckin.strengthLevel] || "stable";
    }
  }

  newTwin.dataQuality = Math.min(100, newTwin.dataQuality + 5); // confidence improves with data
  newTwin.lastUpdated = now;

  const delta: TwinDelta = {
    fromVersion: twin.version,
    toVersion: newTwin.version,
    physicalDelta: deltas as any,
    behavioralDelta: deltas as any,
    recoveryDelta: deltas as any,
    nutritionDelta: deltas as any,
    lifestyleDelta: deltas as any,
    significantChanges: changes,
    timestamp: now,
  };

  return { updatedTwin: newTwin, delta };
}

/**
 * Apply a contextual scenario to the Digital Twin.
 * Used for live what-if simulation and stress testing.
 */
export function applyScenarioToTwin(
  twin: DigitalTwin,
  scenario: {
    type: "exam" | "travel" | "poor-sleep" | "budget-change" | "gym-closed" | "injury";
    duration?: string | number;
    metadata?: Record<string, any>;
    [key: string]: any;
  }
): {
  updatedTwin: DigitalTwin;
  changes: ContextChanges;
  explanation: string;
} {
  const now = new Date().toISOString();
  const newTwin: DigitalTwin = JSON.parse(JSON.stringify(twin));
  newTwin.version += 1;

  const contextChange: ContextChanges = {
    timestamp: now,
    reason: scenario.type,
  };

  let explanation = "";

  switch (scenario.type) {
    case "exam": {
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
      const newBudget = scenario.metadata?.newBudget || 150;
      contextChange.budgetChange = {
        before: newTwin.nutrition.budget,
        after: newBudget,
      };

      newTwin.nutrition.budget = newBudget;
      newTwin.nutrition.budgetAdherence = 100;

      explanation = `Budget changed from ₹${contextChange.budgetChange?.before || newTwin.nutrition.budget}/day to ₹${newBudget}/day. Nutrition plan will adapt to more affordable, accessible food options.`;
      break;
    }

    case "gym-closed": {
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
  newTwin.state = "adapting";

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

  if (previous.physical.weight !== current.physical.weight) {
    const delta = current.physical.weight - previous.physical.weight;
    changes.push(
      `Weight ${delta > 0 ? "increased" : "decreased"} by ${Math.abs(delta).toFixed(1)}kg`
    );
  }

  if (previous.behavioral.workoutConsistency !== current.behavioral.workoutConsistency) {
    const delta = current.behavioral.workoutConsistency - previous.behavioral.workoutConsistency;
    changes.push(`Workout consistency ${delta > 0 ? "improved" : "declined"} by ${Math.abs(delta)}%`);
  }

  if (previous.recovery.sleepDuration !== current.recovery.sleepDuration) {
    changes.push(
      `Sleep duration changed from ${previous.recovery.sleepDuration}h to ${current.recovery.sleepDuration}h`
    );
  }

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
