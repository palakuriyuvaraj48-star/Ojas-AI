/**
 * Digital Twin Engine V2: Build, evolve, and update the persistent user state model.
 * Executes the closed-loop event architecture: SENSE -> EVENT -> TWIN UPDATE -> DELTA.
 */

import {
  DigitalTwin,
  TwinDelta,
  TwinHistory,
  ContextChanges,
  TwinEvent,
  PhysicalState,
  BehavioralState,
  RecoveryState,
  NutritionState,
  LifestyleState,
  EnvironmentState,
} from "./types";
import { ClientProfile, DailyLog, WeeklyCheckIn, ActivityLevel } from "@/types/profile";
import { SportTwinState } from "@/lib/sports/types";

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
 * Calculate completeness & quality of twin data (0 - 100).
 */
export function computeDataQuality(twin: Partial<DigitalTwin>): number {
  let score = 40; // baseline from onboarding
  if (twin.physical?.workoutPerformance?.exercises?.length) score += 15;
  if ((twin.physical?.workoutPerformance?.recentFormScores?.length ?? 0) >= 3) score += 15;
  if (twin.recovery?.sleepDuration && twin.recovery.sleepDuration > 0) score += 10;
  if (twin.nutrition?.averageCaloriesConsumed && twin.nutrition.averageCaloriesConsumed > 0) score += 10;
  if (twin.sport?.selectedSportId) score += 10;
  return Math.min(100, score);
}

/**
 * Create initial Digital Twin from onboarding profile.
 */
export function createInitialTwin(profile: ClientProfile, userId: string = "ojas_user"): DigitalTwin {
  const now = new Date().toISOString();
  const dailyBudget = profile.dailyFoodBudget || (profile.budget === "budget" ? 100 : profile.budget === "moderate" ? 250 : 450);
  const availableTime = profile.availableWorkoutTime ?? (profile.occupation?.toLowerCase().includes("student") ? 35 : 50);

  const initialTwin: DigitalTwin = {
    id: `twin_${userId}_${Date.now()}`,
    userId,
    version: 1,
    timestamp: now,
    state: "initial",

    physical: {
      weight: profile.weight || 68.5,
      height: profile.height || 174,
      bodyFat: profile.bodyFat || 18,
      measurements: {
        neck: profile.neckCircumference || 36,
        thighs: profile.legCircumference || 56,
      },
      fitnessLevel: profile.gymExperience || "intermediate",
      strengthTrend: "stable",
      mobilityTrend: "stable",
      formQualityScore: 90,
      workoutPerformance: {
        avgRepRange: [8, 12],
        avgDuration: availableTime,
        exercises: [],
        recentFormScores: [90],
      },
    },

    behavioral: {
      workoutConsistency: 85,
      missedWorkouts: 0,
      consecutiveMisses: 0,
      skipReasons: {},
      preferredWorkoutTime: profile.workoutTime || "evening",
      preferredDuration: availableTime,
      workoutDaysPerWeekActual: profile.workoutDaysPerWeek || 4,
      exercisePreferences: [],
      adherencePattern: "moderate",
      frictionPoints: [],
    },

    recovery: {
      sleepDuration: profile.sleepDuration || 7.4,
      sleepQuality: "good",
      fatigueLevel: profile.stressLevel === "high" ? 65 : 35,
      acuteTrainingLoad: 45,
      chronicTrainingLoad: 50,
      acuteChronicRatio: 0.9,
      recoveryScore: profile.stressLevel === "high" ? 55 : 82,
      readiness: profile.stressLevel === "high" ? "moderate" : "fresh",
      muscleSoreness: {
        upperBody: "none",
        lowerBody: "none",
        core: "none",
      },
      lastRestDay: now,
      painDiscomfortReported: false,
    },

    nutrition: {
      calorieTarget: 2250,
      averageCaloriesConsumed: 2150,
      proteinTarget: Math.round((profile.weight || 68.5) * 1.8),
      averageProteinConsumed: 95,
      macroAdherence: {
        protein: 80,
        carbs: 85,
        fat: 80,
      },
      foodPreferences: [profile.foodPreference || "both"],
      budget: dailyBudget,
      budgetAdherence: 95,
      isHostelMode: profile.isHostelMode ?? profile.lifestyleRole === "college-student",
      hydrationLevel: profile.waterIntake || 2.5,
    },

    lifestyle: {
      availableTime,
      availableEquipment: profile.availableEquipment || ["bodyweight", "dumbbells"],
      workoutEnvironment: profile.workoutEnvironment || "home",
      stressLevel: profile.stressLevel || "medium",
      lifestyle: profile.lifestyle || "college-schedule",
      isExamPeriod: false,
      travelStatus: "home",
      occupationalActivity: mapActivityLevel(profile.activityLevel || "moderately-active"),
      workStudyHours: 8,
    },

    environment: {
      temperatureC: 30,
      humidityPct: 58,
      airQualityIndex: 95,
      isHeatWaveAlert: false,
      condition: "hot",
      recommendIndoor: false,
    },

    sport: {
      userMode: profile.userMode || "general-fitness",
      selectedSportId: profile.selectedSport || "cricket",
      sportLevel: profile.sportLevel || "foundation",
      trainingReadinessScore: 78,
      personalBaseline: (profile.sportBaselines as any) || {
        acceleration: 60,
        agility: 55,
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
        agility: 58,
        endurance: 72,
        lower_body_power: 65,
        upper_body_strength: 60,
        core_stability: 64,
        mobility: 78,
        reaction_time: 70,
        rotational_power: 58,
        repeated_effort: 68,
      },
      primaryGapAttribute: "agility",
      lastAssessmentDate: now,
      activeChallenges: [],
    },

    recentChanges: [],
    lastUpdated: now,
    dataQuality: 65,
    notes: ["Initial Digital Twin initialized from user profile."],
  };

  initialTwin.dataQuality = computeDataQuality(initialTwin);
  return initialTwin;
}

/**
 * Apply event to Digital Twin (The Core State Transition Function).
 */
export function applyEventToTwin(twin: DigitalTwin, event: TwinEvent): { updatedTwin: DigitalTwin; delta: TwinDelta } {
  const updated: DigitalTwin = JSON.parse(JSON.stringify(twin));
  updated.version = twin.version + 1;
  const now = event.timestamp || new Date().toISOString();
  updated.lastUpdated = now;

  const significantChanges: string[] = [];

  switch (event.type) {
    case "WORKOUT_COMPLETED": {
      const { durationMinutes = 30, formScore = 90, exerciseCount = 4, exercises = [] } = event.payload || {};
      const loadInc = Math.round((durationMinutes / 45) * 20);
      updated.recovery.acuteTrainingLoad = Math.min(100, updated.recovery.acuteTrainingLoad + loadInc);
      updated.recovery.acuteChronicRatio = Number((updated.recovery.acuteTrainingLoad / (updated.recovery.chronicTrainingLoad || 50)).toFixed(2));
      updated.physical.workoutPerformance.avgDuration = Math.round((updated.physical.workoutPerformance.avgDuration + durationMinutes) / 2);
      
      const scores = [...updated.physical.workoutPerformance.recentFormScores, formScore].slice(-10);
      updated.physical.workoutPerformance.recentFormScores = scores;
      updated.physical.formQualityScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      if (exercises.length) {
        updated.physical.workoutPerformance.exercises = Array.from(new Set([...updated.physical.workoutPerformance.exercises, ...exercises]));
      }

      updated.behavioral.workoutConsistency = Math.min(100, updated.behavioral.workoutConsistency + 3);
      updated.behavioral.consecutiveMisses = 0;
      significantChanges.push(`Completed ${durationMinutes}m workout (Form: ${formScore}%). Acute load updated to ${updated.recovery.acuteTrainingLoad}.`);
      break;
    }

    case "WORKOUT_SKIPPED": {
      const { reason = "time_constraint" } = event.payload || {};
      updated.behavioral.missedWorkouts += 1;
      updated.behavioral.consecutiveMisses += 1;
      updated.behavioral.workoutConsistency = Math.max(0, updated.behavioral.workoutConsistency - 5);
      updated.behavioral.skipReasons[reason] = (updated.behavioral.skipReasons[reason] || 0) + 1;

      if (updated.behavioral.consecutiveMisses >= 3) {
        updated.behavioral.adherencePattern = "at_risk";
        significantChanges.push(`Consecutive misses detected (${updated.behavioral.consecutiveMisses}). Marked as adherence risk.`);
      } else {
        significantChanges.push(`Workout skipped due to ${reason}. Adherence adjusted.`);
      }
      break;
    }

    case "FORM_SCORE_UPDATED":
    case "FORM_DEGRADATION_DETECTED": {
      const { formScore = 80, exercise = "General" } = event.payload || {};
      const prevScores = updated.physical.workoutPerformance.recentFormScores;
      const newScores = [...prevScores, formScore].slice(-10);
      updated.physical.workoutPerformance.recentFormScores = newScores;
      updated.physical.formQualityScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);

      if (newScores.length >= 3) {
        const last3 = newScores.slice(-3);
        const isDeclining = last3[0] > last3[1] && last3[1] > last3[2] && last3[2] < 75;
        if (isDeclining) {
          updated.state = "deloading";
          updated.recovery.fatigueLevel = Math.min(100, updated.recovery.fatigueLevel + 15);
          significantChanges.push(`Movement form degradation trend detected for ${exercise} (${last3.join(" -> ")}). Triggered deload signal.`);
        }
      }
      break;
    }

    case "SLEEP_LOGGED": {
      const { hours = 7, quality = "good" } = event.payload || {};
      const beforeSleep = updated.recovery.sleepDuration;
      updated.recovery.sleepDuration = hours;
      updated.recovery.sleepQuality = quality;

      const sleepFactor = hours >= 7.5 ? 35 : hours >= 6 ? 20 : 5;
      const stressFactor = updated.lifestyle.stressLevel === "high" ? -15 : updated.lifestyle.stressLevel === "low" ? 10 : 0;
      updated.recovery.recoveryScore = Math.max(25, Math.min(98, 50 + sleepFactor + stressFactor - (updated.recovery.fatigueLevel * 0.2)));
      updated.recovery.readiness = updated.recovery.recoveryScore >= 75 ? "fresh" : updated.recovery.recoveryScore >= 50 ? "moderate" : "fatigued";

      updated.recentChanges.push({
        sleepChange: { before: beforeSleep, after: hours },
        timestamp: now,
        reason: "Daily sleep logged",
      });
      significantChanges.push(`Sleep updated to ${hours}h (${quality}). Recovery score calculated at ${Math.round(updated.recovery.recoveryScore)}/100.`);
      break;
    }

    case "STRESS_UPDATED": {
      const { level = "medium" } = event.payload || {};
      const beforeStress = updated.lifestyle.stressLevel;
      updated.lifestyle.stressLevel = level;
      updated.recovery.fatigueLevel = level === "high" ? 75 : level === "medium" ? 45 : 20;
      significantChanges.push(`Stress level changed: ${beforeStress} -> ${level}.`);
      break;
    }

    case "EXAM_MODE_TOGGLED": {
      const { active = true } = event.payload || {};
      const beforeExam = updated.lifestyle.isExamPeriod;
      updated.lifestyle.isExamPeriod = active;
      if (active) {
        updated.lifestyle.availableTime = Math.min(updated.lifestyle.availableTime, 20);
        updated.lifestyle.stressLevel = "high";
        updated.recovery.sleepDuration = Math.min(updated.recovery.sleepDuration, 5.5);
        updated.recovery.sleepQuality = "poor";
        updated.recovery.recoveryScore = 40;
        updated.recovery.readiness = "fatigued";
        updated.state = "recovery_priority";
        significantChanges.push("Exam Mode ACTIVATED: Time constrained to 20m, elevated study stress, recovery prioritized.");
      } else {
        updated.lifestyle.availableTime = 45;
        updated.lifestyle.stressLevel = "medium";
        updated.recovery.sleepDuration = 7.5;
        updated.state = "stable";
        significantChanges.push("Exam Mode DEACTIVATED: Restored normal training capacity.");
      }
      updated.recentChanges.push({
        examChange: { before: beforeExam, after: active },
        timestamp: now,
      });
      break;
    }

    case "BUDGET_CHANGED": {
      const { newDailyBudgetINR = 100 } = event.payload || {};
      const beforeBudget = updated.nutrition.budget;
      updated.nutrition.budget = newDailyBudgetINR;
      updated.recentChanges.push({
        budgetChange: { before: beforeBudget, after: newDailyBudgetINR },
        timestamp: now,
        reason: "Daily budget modified",
      });
      significantChanges.push(`Nutrition daily budget adjusted: ₹${beforeBudget} -> ₹${newDailyBudgetINR}.`);
      break;
    }

    case "TIME_CONSTRAINTS_UPDATED": {
      const { availableMinutes = 30 } = event.payload || {};
      const beforeTime = updated.lifestyle.availableTime;
      updated.lifestyle.availableTime = availableMinutes;
      updated.recentChanges.push({
        availableTimeChange: { before: beforeTime, after: availableMinutes },
        timestamp: now,
      });
      significantChanges.push(`Available workout time adjusted: ${beforeTime}m -> ${availableMinutes}m.`);
      break;
    }

    case "EQUIPMENT_UPDATED": {
      const { availableEquipment = [] } = event.payload || {};
      const beforeEq = updated.lifestyle.availableEquipment;
      updated.lifestyle.availableEquipment = availableEquipment;
      updated.recentChanges.push({
        equipmentChange: { before: beforeEq, after: availableEquipment },
        timestamp: now,
      });
      significantChanges.push(`Equipment updated: ${availableEquipment.join(", ") || "None (Bodyweight)"}.`);
      break;
    }

    case "TRAVEL_UPDATED": {
      const { travelStatus = "home" } = event.payload || {};
      updated.lifestyle.travelStatus = travelStatus;
      if (travelStatus === "travelling") {
        updated.lifestyle.workoutEnvironment = "limited";
        updated.lifestyle.availableEquipment = ["bodyweight"];
        updated.lifestyle.availableTime = Math.min(updated.lifestyle.availableTime, 25);
        significantChanges.push("Travel status active: Configured limited equipment and hotel/travel mode.");
      }
      break;
    }

    case "USER_FEEDBACK_RECEIVED": {
      const { completed = true, difficulty = 5, energy = 5, painDiscomfort = false } = event.payload || {};
      if (painDiscomfort) {
        updated.recovery.painDiscomfortReported = true;
        updated.state = "recovery_priority";
        significantChanges.push("User reported discomfort/pain: Triggered safety recovery protocol.");
      }
      if (difficulty >= 9) {
        updated.recovery.fatigueLevel = Math.min(100, updated.recovery.fatigueLevel + 10);
        significantChanges.push("High RPE (difficulty >= 9) recorded: Increased fatigue factor.");
      }
      break;
    }

    case "PROFILE_UPDATED": {
      const p: Partial<ClientProfile> = event.payload || {};
      if (p.weight) updated.physical.weight = p.weight;
      if (p.bodyFat) updated.physical.bodyFat = p.bodyFat;
      if (p.workoutDaysPerWeek) updated.behavioral.workoutDaysPerWeekActual = p.workoutDaysPerWeek;
      if (p.dailyFoodBudget) updated.nutrition.budget = p.dailyFoodBudget;
      significantChanges.push("User profile synced with Digital Twin.");
      break;
    }
  }

  updated.dataQuality = computeDataQuality(updated);

  const delta: TwinDelta = {
    fromVersion: twin.version,
    toVersion: updated.version,
    physicalDelta: updated.physical,
    behavioralDelta: updated.behavioral,
    recoveryDelta: updated.recovery,
    nutritionDelta: updated.nutrition,
    lifestyleDelta: updated.lifestyle,
    environmentDelta: updated.environment,
    significantChanges,
    timestamp: now,
  };

  return { updatedTwin: updated, delta };
}

/**
 * Apply a synthetic scenario to twin (for SIH demo / what-if simulations).
 */
export function applyScenario(
  twin: DigitalTwin,
  scenario: { type: string; duration?: number; metadata?: any }
): { updatedTwin: DigitalTwin; changes: ContextChanges; explanation: string } {
  let eventType: any = "EXAM_MODE_TOGGLED";
  let payload: any = {};
  let explanation = "";

  if (scenario.type === "exam") {
    eventType = "EXAM_MODE_TOGGLED";
    payload = { active: true };
    explanation = "Exam period simulation: Sleep reduced, stress elevated, available time compressed to 20m.";
  } else if (scenario.type === "budget-change" || scenario.type === "budget") {
    eventType = "BUDGET_CHANGED";
    payload = { newDailyBudgetINR: scenario.metadata?.newBudget || 80 };
    explanation = `Budget constraint simulation: Food budget adjusted to ₹${payload.newDailyBudgetINR}/day.`;
  } else if (scenario.type === "travel") {
    eventType = "TRAVEL_UPDATED";
    payload = { travelStatus: "travelling" };
    explanation = "Travel simulation: Hotel room constraints, bodyweight-only exercises, 20m time limit.";
  } else if (scenario.type === "poor-sleep") {
    eventType = "SLEEP_LOGGED";
    payload = { hours: 4.5, quality: "poor" };
    explanation = "Poor sleep simulation: Acute fatigue spike, recovery score depressed to deload threshold.";
  } else if (scenario.type === "injury-risk" || scenario.type === "form-degradation") {
    eventType = "FORM_DEGRADATION_DETECTED";
    payload = { formScore: 62, exercise: "Squats" };
    explanation = "Movement degradation simulation: Repeated poor form detected by Vision Coach.";
  }

  const { updatedTwin, delta } = applyEventToTwin(twin, {
    id: `sim_${Date.now()}`,
    type: eventType,
    userId: twin.userId,
    timestamp: new Date().toISOString(),
    payload,
  });

  const changes: ContextChanges = {
    timestamp: new Date().toISOString(),
    reason: explanation,
  };

  return { updatedTwin, changes, explanation };
}

/**
 * Compare two twins and extract human-readable deltas.
 */
export function compareTwins(twinA: DigitalTwin, twinB: DigitalTwin): string[] {
  const diffs: string[] = [];
  if (twinA.recovery.sleepDuration !== twinB.recovery.sleepDuration) {
    diffs.push(`Sleep: ${twinA.recovery.sleepDuration}h -> ${twinB.recovery.sleepDuration}h`);
  }
  if (twinA.lifestyle.availableTime !== twinB.lifestyle.availableTime) {
    diffs.push(`Available time: ${twinA.lifestyle.availableTime}m -> ${twinB.lifestyle.availableTime}m`);
  }
  if (twinA.lifestyle.stressLevel !== twinB.lifestyle.stressLevel) {
    diffs.push(`Stress: ${twinA.lifestyle.stressLevel} -> ${twinB.lifestyle.stressLevel}`);
  }
  if (twinA.nutrition.budget !== twinB.nutrition.budget) {
    diffs.push(`Budget: ₹${twinA.nutrition.budget} -> ₹${twinB.nutrition.budget}`);
  }
  if (twinA.recovery.recoveryScore !== twinB.recovery.recoveryScore) {
    diffs.push(`Recovery score: ${Math.round(twinA.recovery.recoveryScore)} -> ${Math.round(twinB.recovery.recoveryScore)}`);
  }
  return diffs;
}

/**
 * Update Twin from daily logs and check-in history.
 */
export function updateTwinFromLogs(
  twin: DigitalTwin,
  recentLogs: DailyLog[],
  recentCheckins: WeeklyCheckIn[]
): { updatedTwin: DigitalTwin; delta: TwinDelta } {
  if (!recentLogs || recentLogs.length === 0) {
    return { updatedTwin: twin, delta: { fromVersion: twin.version, toVersion: twin.version, significantChanges: [], timestamp: new Date().toISOString() } };
  }

  const lastLog = recentLogs[recentLogs.length - 1];
  return applyEventToTwin(twin, {
    id: `log_${Date.now()}`,
    type: "WORKOUT_COMPLETED",
    userId: twin.userId,
    timestamp: new Date().toISOString(),
    payload: {
      durationMinutes: lastLog.workoutDuration || 35,
      formScore: lastLog.formScore || 88,
      exerciseCount: 4,
      exercises: lastLog.workoutName ? [lastLog.workoutName] : [],
    },
  });
}
