/**
 * Canonical Ojas State Management
 * Single source of truth for the entire application.
 */

import {
  OjasState,
  OjasEvent,
  OjasEventType,
  OjasDecision,
  OjasAction,
  DecisionHistoryEntry,
  FitnessState,
  SportsState,
  RecoveryState,
  NutritionState,
  LifestyleState,
  BehaviourState,
  TrainingState,
  EnvironmentState,
  RiskState,
  Constraints,
  PerformanceTrends,
  PerformanceTrend,
  RecoveryState as RecoveryStateType,
  TrainingRiskLevel,
  AdherenceLevel,
} from "./types";
import { ClientProfile, DailyLog } from "@/types/profile";

const OJAS_STATE_KEY = "ojas_canonical_state_v1";
const OJAS_DECISION_HISTORY_KEY = "ojas_decision_history_v1";

function getDefaultState(userId: string = "ojas_user"): OjasState {
  return {
    userId,
    timestamp: new Date().toISOString(),
    version: 1,

    fitness: {
      strength: 60,
      endurance: 55,
      mobility: 65,
      activityLevel: 50,
      trend: "stable",
      weeklyWorkouts: 3,
    },

    sports: {
      sport: "general-fitness",
      skillLevel: 50,
      performanceScore: 60,
      trainingLoad: 45,
      trend: "stable",
    },

    recovery: {
      sleepHours: 7.5,
      sleepQuality: "good",
      fatigueLevel: 35,
      sorenessLevel: "none",
      recoveryScore: 75,
      readiness: "fresh",
      status: "recovered",
      hrvStatus: "stable",
      painReported: false,
    },

    nutrition: {
      calorieTarget: 2200,
      caloriesConsumed: 0,
      proteinTarget: 140,
      proteinConsumed: 0,
      carbsConsumed: 0,
      fatConsumed: 0,
      fiberConsumed: 18,
      waterTargetLiters: 3.0,
      waterConsumedLiters: 0,
      dailyBudgetINR: 150,
      spentINR: 0,
      isHostelMode: false,
      foodPreference: "both",
      mealPacing: "on_track",
    },

    lifestyle: {
      availableTimeMinutes: 45,
      exerciseLocation: "gym",
      equipmentAvailable: ["dumbbell", "bench"],
      travelStatus: "home",
      stressLevel: "medium",
      isExamPeriod: false,
      workStudyHours: 8,
      schedule: "normal",
    },

    behaviour: {
      adherencePercentage: 75,
      missedSessions: 2,
      consecutiveMisses: 0,
      skipReasons: {},
      feedbackHistory: [],
      adherenceLevel: "moderate",
    },

    training: {
      recentLoad: 45,
      acuteLoad: 50,
      chronicLoad: 55,
      acuteChronicRatio: 0.9,
      muscleReadiness: {
        upperBody: "primed",
        lowerBody: "primed",
        core: "primed",
      },
      formScoreAverage: 85,
      formTrend: "stable",
    },

    environment: {
      temperatureC: 32,
      humidityPct: 60,
      condition: "hot",
      indoorRecommended: false,
      timeOfDay: getTimeOfDay(),
    },

    risk: {
      trainingRisk: "low",
      recoveryConcern: false,
      overreachingSignal: false,
      formDegradation: false,
      painReported: false,
      riskFactors: [],
    },

    constraints: {
      hard: {
        availableTimeMinutes: 45,
        equipment: ["dumbbell", "bench"],
        budgetINR: 150,
        location: "gym",
        injuries: [],
        unavailableActivities: [],
      },
      soft: {},
    },

    trends: {
      fitness: "stable",
      sports: "stable",
      recovery: "stable",
      nutrition: "stable",
      adherence: "stable",
      weeklyScores: [70, 72, 75, 73, 76, 78, 75],
    },

    dataQuality: 65,
  };
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function loadOjasState(): OjasState {
  if (typeof window === "undefined") return getDefaultState();

  try {
    const stored = localStorage.getItem(OJAS_STATE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as OjasState;
      return {
        ...getDefaultState(),
        ...parsed,
        environment: {
          ...parsed.environment,
          timeOfDay: getTimeOfDay(),
        },
      };
    }
  } catch {
    // Fall through to default
  }

  return getDefaultState();
}

export function saveOjasState(state: OjasState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(OJAS_STATE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function createInitialOjasState(
  profile: ClientProfile,
  dailyLog?: DailyLog
): OjasState {
  const state = getDefaultState(profile.name || "ojas_user");

  // Apply profile data
  state.fitness.weeklyWorkouts = profile.workoutDaysPerWeek || 3;
  state.recovery.sleepHours = profile.sleepDuration || 7.5;
  state.recovery.sleepQuality = profile.sleepDuration >= 7.5 ? "optimal" : profile.sleepDuration >= 6.5 ? "good" : "poor";
  state.recovery.fatigueLevel = profile.stressLevel === "high" ? 65 : profile.stressLevel === "medium" ? 40 : 20;
  state.recovery.readiness = state.recovery.fatigueLevel > 60 ? "fatigued" : state.recovery.fatigueLevel > 40 ? "moderate" : "fresh";

  state.nutrition.dailyBudgetINR = profile.dailyFoodBudget || (profile.budget === "budget" ? 80 : profile.budget === "moderate" ? 150 : 250);
  state.nutrition.isHostelMode = profile.isHostelMode ?? profile.lifestyleRole === "college-student";
  state.nutrition.foodPreference = profile.foodPreference || "both";

  state.lifestyle.availableTimeMinutes = profile.availableWorkoutTime || 45;
  state.lifestyle.equipmentAvailable = profile.availableEquipment || ["bodyweight"];
  state.lifestyle.stressLevel = profile.stressLevel || "medium";
  state.lifestyle.exerciseLocation = profile.workoutEnvironment === "home" ? "home" : profile.workoutEnvironment === "outdoor" ? "outdoor" : "gym";

  state.sports.sport = profile.selectedSport || "general-fitness";
  state.sports.sport = profile.userMode === "athlete-performance" ? profile.selectedSport || "general-fitness" : "general-fitness";

  // Calculate initial recovery score
  state.recovery.recoveryScore = calculateRecoveryScore(state);

  // Update derived state
  updateDerivedState(state);

  // Apply daily log if provided
  if (dailyLog) {
    state.nutrition.caloriesConsumed = dailyLog.caloriesConsumed || 0;
    state.nutrition.proteinConsumed = dailyLog.proteinConsumed || 0;
    state.nutrition.carbsConsumed = dailyLog.carbsConsumed || 0;
    state.nutrition.fatConsumed = dailyLog.fatConsumed || 0;
    state.nutrition.waterConsumedLiters = dailyLog.waterConsumed || 0;
    state.nutrition.spentINR = dailyLog.costIncurred || 0;
  }

  state.constraints.hard.availableTimeMinutes = state.lifestyle.availableTimeMinutes;
  state.constraints.hard.equipment = state.lifestyle.equipmentAvailable;
  state.constraints.hard.budgetINR = state.nutrition.dailyBudgetINR;
  state.constraints.hard.location = state.lifestyle.exerciseLocation;

  return state;
}

export function calculateRecoveryScore(state: OjasState): number {
  const { recovery, training, lifestyle } = state;

  // Sleep factor (0-40 points)
  const sleepFactor = Math.min(40, (recovery.sleepHours / 8) * 40);

  // Training load factor (0-30 points, inverse)
  const loadFactor = Math.max(0, 30 - (training.recentLoad / 100) * 30);

  // Stress factor (0-20 points, inverse)
  const stressFactor = lifestyle.stressLevel === "low" ? 20 : lifestyle.stressLevel === "medium" ? 12 : 5;

  // Hydration factor (0-10 points)
  const hydrationFactor = state.nutrition.waterConsumedLiters >= 2.5 ? 10 : state.nutrition.waterConsumedLiters >= 1.5 ? 6 : 3;

  const raw = sleepFactor + loadFactor + stressFactor + hydrationFactor;
  return Math.max(25, Math.min(98, Math.round(raw)));
}

export function applyOjasEvent(state: OjasState, event: OjasEvent): OjasState {
  const updated = { ...state, version: state.version + 1, timestamp: new Date().toISOString(), lastEvent: event.type, lastEventTimestamp: event.timestamp };

  switch (event.type) {
    case "WORKOUT_COMPLETED": {
      const duration = (event.payload.durationMinutes as number) || 30;
      const formScore = (event.payload.formScore as number) || 85;

      updated.training.recentLoad = Math.min(100, updated.training.recentLoad + Math.round((duration / 45) * 15));
      updated.training.acuteLoad = updated.training.recentLoad;
      updated.training.muscleReadiness = event.payload.muscleReadiness as TrainingState["muscleReadiness"] || updated.training.muscleReadiness;
      updated.training.formScoreAverage = Math.round((updated.training.formScoreAverage + formScore) / 2);
      updated.fitness.weeklyWorkouts = Math.min(7, updated.fitness.weeklyWorkouts + 1);
      updated.behaviour.consecutiveMisses = 0;
      updated.behaviour.adherencePercentage = Math.min(100, updated.behaviour.adherencePercentage + 3);
      break;
    }

    case "WORKOUT_SKIPPED": {
      const reason = (event.payload.reason as string) || "unknown";
      updated.behaviour.missedSessions += 1;
      updated.behaviour.consecutiveMisses += 1;
      updated.behaviour.skipReasons[reason] = (updated.behaviour.skipReasons[reason] || 0) + 1;
      updated.behaviour.adherencePercentage = Math.max(0, updated.behaviour.adherencePercentage - 5);
      break;
    }

    case "SLEEP_CHANGED": {
      updated.recovery.sleepHours = (event.payload.hours as number) || 7;
      updated.recovery.sleepQuality = updated.recovery.sleepHours >= 7.5 ? "optimal" : updated.recovery.sleepHours >= 6.5 ? "good" : updated.recovery.sleepHours >= 5 ? "average" : "poor";
      break;
    }

    case "STRESS_CHANGED": {
      updated.lifestyle.stressLevel = (event.payload.level as "low" | "medium" | "high") || "medium";
      updated.recovery.fatigueLevel = updated.lifestyle.stressLevel === "high" ? 70 : updated.lifestyle.stressLevel === "medium" ? 45 : 20;
      break;
    }

    case "TIME_CONSTRAINT_CHANGED": {
      updated.lifestyle.availableTimeMinutes = (event.payload.minutes as number) || 30;
      updated.constraints.hard.availableTimeMinutes = updated.lifestyle.availableTimeMinutes;
      break;
    }

    case "VISION_ANALYSIS_COMPLETED": {
      const formScore = (event.payload.formScore as number) || 85;
      const prevScores = [...(event.payload.previousScores as number[] || []), formScore].slice(-5);
      updated.training.formScoreAverage = Math.round(prevScores.reduce((a, b) => a + b, 0) / prevScores.length);

      if (prevScores.length >= 3) {
        const last3 = prevScores.slice(-3);
        updated.training.formTrend = last3[0] > last3[1] && last3[1] > last3[2] ? "declining" : last3[0] < last3[1] && last3[1] < last3[2] ? "improving" : "stable";
        updated.risk.formDegradation = updated.training.formTrend === "declining" && last3[last3.length - 1] < 75;
      }
      break;
    }

    case "EXAM_PERIOD_TOGGLED": {
      const active = (event.payload.active as boolean) ?? false;
      updated.lifestyle.isExamPeriod = active;
      if (active) {
        updated.lifestyle.availableTimeMinutes = Math.min(updated.lifestyle.availableTimeMinutes, 20);
        updated.lifestyle.stressLevel = "high";
        updated.recovery.sleepHours = Math.min(updated.recovery.sleepHours, 5.5);
        updated.recovery.fatigueLevel = Math.min(100, updated.recovery.fatigueLevel + 20);
      }
      break;
    }

    case "TRAVEL_DETECTED": {
      updated.lifestyle.travelStatus = "travelling";
      updated.lifestyle.equipmentAvailable = ["bodyweight"];
      updated.lifestyle.exerciseLocation = "limited";
      updated.constraints.hard.equipment = ["bodyweight"];
      break;
    }

    case "EQUIPMENT_CHANGED": {
      updated.lifestyle.equipmentAvailable = (event.payload.equipment as string[]) || ["bodyweight"];
      updated.constraints.hard.equipment = updated.lifestyle.equipmentAvailable;
      break;
    }

    case "BUDGET_CHANGED": {
      updated.nutrition.dailyBudgetINR = (event.payload.budget as number) || 150;
      updated.constraints.hard.budgetINR = updated.nutrition.dailyBudgetINR;
      break;
    }

    case "USER_FEEDBACK_RECEIVED": {
      const feedback = {
        date: new Date().toISOString(),
        completed: (event.payload.completed as boolean) ?? true,
        difficulty: event.payload.difficulty as number,
        energy: event.payload.energy as number,
        discomfort: event.payload.discomfort as boolean,
      };
      updated.behaviour.feedbackHistory = [...updated.behaviour.feedbackHistory, feedback].slice(-20);

      if (feedback.discomfort) {
        updated.risk.painReported = true;
        updated.recovery.painReported = true;
      }
      if (feedback.difficulty && feedback.difficulty >= 9) {
        updated.recovery.fatigueLevel = Math.min(100, updated.recovery.fatigueLevel + 10);
      }
      break;
    }

    case "PAIN_REPORTED": {
      updated.risk.painReported = true;
      updated.recovery.painReported = true;
      break;
    }

    case "SPORTS_PRACTICE_COMPLETED": {
      updated.sports.performanceScore = Math.min(100, (updated.sports.performanceScore || 50) + 2);
      updated.sports.trainingLoad = Math.min(100, updated.sports.trainingLoad + 5);
      break;
    }

    case "COMPETITION_APPROACHING": {
      const daysUntil = (event.payload.daysUntil as number) || 7;
      updated.sports.competitionContext = {
        hasCompetition: true,
        daysUntil,
        competitionType: event.payload.competitionType as string,
      };
      break;
    }

    case "PROFILE_UPDATED": {
      const p = event.payload as Partial<ClientProfile>;
      if (p.sleepDuration) updated.recovery.sleepHours = p.sleepDuration;
      if (p.stressLevel) updated.lifestyle.stressLevel = p.stressLevel;
      if (p.availableWorkoutTime) {
        updated.lifestyle.availableTimeMinutes = p.availableWorkoutTime;
        updated.constraints.hard.availableTimeMinutes = p.availableWorkoutTime;
      }
      if (p.availableEquipment) {
        updated.lifestyle.equipmentAvailable = p.availableEquipment;
        updated.constraints.hard.equipment = p.availableEquipment;
      }
      break;
    }
  }

  // Recalculate derived state
  updated.recovery.recoveryScore = calculateRecoveryScore(updated);
  updateDerivedState(updated);

  return updated;
}

function updateDerivedState(state: OjasState): void {
  // Update recovery state label
  state.recovery.status = state.recovery.recoveryScore >= 70 ? "recovered" : state.recovery.recoveryScore >= 45 ? "moderate" : "poor";
  state.recovery.readiness = state.recovery.recoveryScore >= 75 ? "fresh" : state.recovery.recoveryScore >= 55 ? "moderate" : state.recovery.recoveryScore >= 35 ? "fatigued" : "overreaching";

  // Update risk state
  const riskFactors: string[] = [];
  if (state.recovery.recoveryScore < 40) riskFactors.push("Low recovery score");
  if (state.training.recentLoad > 75) riskFactors.push("High training load");
  if (state.recovery.sleepHours < 5.5) riskFactors.push("Insufficient sleep");
  if (state.risk.formDegradation) riskFactors.push("Declining form quality");
  if (state.risk.painReported) riskFactors.push("Pain reported");
  if (state.training.acuteChronicRatio > 1.3) riskFactors.push("ACWR spike");

  state.risk.riskFactors = riskFactors;
  state.risk.trainingRisk = riskFactors.length >= 3 ? "elevated" : riskFactors.length >= 1 ? "moderate" : "low";
  state.risk.recoveryConcern = state.recovery.recoveryScore < 50;
  state.risk.overreachingSignal = state.training.recentLoad > 70 && state.recovery.recoveryScore < 45;

  // Update adherence level
  state.behaviour.adherenceLevel = state.behaviour.adherencePercentage >= 80 ? "high" : state.behaviour.adherencePercentage >= 60 ? "moderate" : state.behaviour.adherencePercentage >= 40 ? "low" : "at_risk";

  // Update data quality
  let quality = 40;
  if (state.recovery.sleepHours > 0) quality += 15;
  if (state.fitness.weeklyWorkouts > 0) quality += 15;
  if (state.nutrition.caloriesConsumed > 0) quality += 10;
  if (state.behaviour.feedbackHistory.length > 0) quality += 10;
  if (state.training.formScoreAverage > 0) quality += 10;
  state.dataQuality = Math.min(100, quality);
}

export function computeDailyDecision(state: OjasState): OjasDecision {
  const { fitness, sports, recovery, nutrition, lifestyle, training, risk, constraints } = state;

  const whyReasons: string[] = [];
  const decisionFactors: { signal: string; value: string; impact: "positive" | "negative" | "neutral" }[] = [];

  // Analyze key signals
  decisionFactors.push({ signal: "Sleep", value: `${recovery.sleepHours}h`, impact: recovery.sleepHours >= 7 ? "positive" : recovery.sleepHours >= 5.5 ? "neutral" : "negative" });
  decisionFactors.push({ signal: "Recovery Score", value: `${recovery.recoveryScore}/100`, impact: recovery.recoveryScore >= 65 ? "positive" : recovery.recoveryScore >= 45 ? "neutral" : "negative" });
  decisionFactors.push({ signal: "Training Load", value: `${training.recentLoad}/100`, impact: training.recentLoad <= 60 ? "positive" : training.recentLoad <= 80 ? "neutral" : "negative" });
  decisionFactors.push({ signal: "Available Time", value: `${lifestyle.availableTimeMinutes}min`, impact: lifestyle.availableTimeMinutes >= 30 ? "positive" : lifestyle.availableTimeMinutes >= 15 ? "neutral" : "negative" });
  decisionFactors.push({ signal: "Stress", value: lifestyle.stressLevel, impact: lifestyle.stressLevel === "low" ? "positive" : lifestyle.stressLevel === "medium" ? "neutral" : "negative" });

  // Priority: Safety > Recovery > Constraints > Goal > Preferences
  let action: OjasAction = "FULL_TRAINING";
  let badgeLabel = "FULL TRAINING";
  let badgeColor: OjasDecision["badge"]["color"] = "green";
  let headline = "";
  let subtitle = "";
  let workoutDuration = Math.min(45, constraints.hard.availableTimeMinutes);
  let workoutIntensity: "Low" | "Moderate" | "High" = "Moderate";

  if (risk.painReported) {
    action = "REST";
    badgeLabel = "REST";
    badgeColor = "rose";
    headline = "Rest & Recovery Recommended";
    subtitle = "Pain reported. High mechanical load restricted.";
    whyReasons.push("Pain or discomfort reported: Rest is recommended to avoid injury.");
  } else if (recovery.recoveryScore < 40 || recovery.sleepHours < 5) {
    action = "RECOVERY";
    badgeLabel = "RECOVERY";
    badgeColor = "blue";
    headline = `${Math.min(20, constraints.hard.availableTimeMinutes)}-Min Active Recovery`;
    subtitle = "Poor recovery detected. Prioritizing restoration.";
    whyReasons.push(`Recovery score is ${recovery.recoveryScore}/100 (below 40).`);
    whyReasons.push(`Sleep: ${recovery.sleepHours}h (below optimal).`);
    workoutDuration = Math.min(20, constraints.hard.availableTimeMinutes);
    workoutIntensity = "Low";
  } else if (lifestyle.isExamPeriod && lifestyle.availableTimeMinutes <= 20) {
    action = "MINIMUM_TRAINING";
    badgeLabel = "MINIMUM VIABLE";
    badgeColor = "yellow";
    headline = `${Math.min(15, constraints.hard.availableTimeMinutes)}-Min Express Session`;
    subtitle = "Exam period: Compressed session maintains consistency.";
    whyReasons.push("Exam period active: Time compressed to minimum viable workout.");
    workoutDuration = Math.min(15, constraints.hard.availableTimeMinutes);
    workoutIntensity = "Moderate";
  } else if (recovery.recoveryScore < 60 || lifestyle.availableTimeMinutes < 25) {
    action = "REDUCED_TRAINING";
    badgeLabel = "REDUCED";
    badgeColor = "yellow";
    headline = `${constraints.hard.availableTimeMinutes}-Min Efficient Session`;
    subtitle = "Moderate recovery or time constraint detected.";
    whyReasons.push(recovery.recoveryScore < 60 ? `Recovery score: ${recovery.recoveryScore}/100 (moderate).` : "");
    whyReasons.push(lifestyle.availableTimeMinutes < 25 ? `Limited time: ${lifestyle.availableTimeMinutes}min available.` : "");
    workoutDuration = constraints.hard.availableTimeMinutes;
    workoutIntensity = "Moderate";
  } else if (sports.competitionContext?.hasCompetition && sports.competitionContext.daysUntil && sports.competitionContext.daysUntil <= 1) {
    action = "SPORT_PRACTICE";
    badgeLabel = "SPORT PRACTICE";
    badgeColor = "purple";
    headline = "Pre-Competition: Technical Practice";
    subtitle = "Match tomorrow: Focus on skill and mobility, not heavy load.";
    whyReasons.push("Competition tomorrow: Reduced heavy training, prioritize skill practice.");
    workoutDuration = Math.min(25, constraints.hard.availableTimeMinutes);
    workoutIntensity = "Low";
  } else {
    action = "FULL_TRAINING";
    badgeLabel = "FULL TRAINING";
    badgeColor = "green";
    headline = `${constraints.hard.availableTimeMinutes}-Min Progressive Session`;
    subtitle = "Good recovery and full availability detected.";
    whyReasons.push(`Recovery score: ${recovery.recoveryScore}/100 (good).`);
    whyReasons.push(`Available time: ${lifestyle.availableTimeMinutes}min.`);
    workoutDuration = Math.min(50, constraints.hard.availableTimeMinutes);
    workoutIntensity = "High";
  }

  // Build exercises based on action
  const exercises = buildExercises(action, workoutDuration, constraints.hard.equipment, training.muscleReadiness);

  // Build nutrition suggestion
  const nutritionAction = buildNutritionSuggestion(nutrition, lifestyle);

  // Build recovery action
  const recoveryAction = {
    headline: action === "RECOVERY" || action === "REST" ? "Active Recovery Protocol" : "Post-Workout Recovery",
    protocol: action === "RECOVERY" || action === "REST"
      ? "10min mobility flow + breathing exercises + 500ml water"
      : "5min cooldown + 500ml water + protein within 30min",
    mobilityMinutes: action === "RECOVERY" || action === "REST" ? 15 : 5,
  };

  // Calculate confidence
  const confidence = Math.min(95, Math.round(50 + (state.dataQuality * 0.3) + (state.behaviour.feedbackHistory.length > 3 ? 10 : 0)));
  const confidenceLabel = confidence >= 80 ? "High (Data Verified)" : confidence >= 60 ? "Moderate (Estimated)" : "Heuristic Baseline";

  return {
    action,
    badge: { label: badgeLabel, color: badgeColor },
    headline,
    subtitle,
    confidence,
    confidenceLabel,
    workout: {
      title: headline,
      durationMinutes: workoutDuration,
      intensity: workoutIntensity,
      focus: getWorkoutFocus(action, fitness),
      exercises,
    },
    sports: sports.sport && sports.sport !== "general-fitness" ? {
      sport: sports.sport,
      skillFocus: `${sports.sport} specific skills`,
      drills: getSportsDrills(sports.sport),
      durationMinutes: 15,
    } : undefined,
    recovery: recoveryAction,
    nutrition: nutritionAction,
    whyReasons: whyReasons.filter(Boolean),
    decisionFactors,
    timestamp: new Date().toISOString(),
  };
}

function buildExercises(
  action: OjasAction,
  duration: number,
  equipment: string[],
  muscleReadiness: TrainingState["muscleReadiness"]
): { name: string; sets: number; reps: string; notes: string }[] {
  const isGym = equipment.some(e => e.toLowerCase().includes("gym") || e.toLowerCase().includes("barbell"));
  const hasDumbbells = equipment.some(e => e.toLowerCase().includes("dumbbell"));
  const isBodyweight = equipment.length === 1 && equipment[0].toLowerCase().includes("bodyweight");

  if (action === "RECOVERY" || action === "REST") {
    return [
      { name: "Cat-Cow Stretch", sets: 2, reps: "10 reps", notes: "Slow, rhythmic breathing" },
      { name: "World's Greatest Stretch", sets: 2, reps: "5/side", notes: "Open hips and thoracic spine" },
      { name: "Deep Squat Hold", sets: 3, reps: "30 sec", notes: "Decompress hips and ankles" },
    ];
  }

  if (action === "MINIMUM_TRAINING") {
    return [
      { name: "Burpees or Jumping Jacks", sets: 3, reps: "15 reps", notes: "Full body warm-up" },
      { name: isBodyweight ? "Bodyweight Squats" : "Goblet Squats", sets: 3, reps: "12 reps", notes: "Controlled tempo" },
      { name: "Push-ups", sets: 3, reps: "10-12 reps", notes: "Full range of motion" },
    ];
  }

  if (action === "REDUCED_TRAINING") {
    return [
      { name: isBodyweight ? "Bodyweight Squats" : "Dumbbell Squats", sets: 3, reps: "12 reps", notes: "Controlled 3s descent" },
      { name: "Push-ups (Standard/Incline)", sets: 3, reps: "10-15 reps", notes: "Full elbow extension" },
      { name: hasDumbbells ? "Dumbbell Rows" : "Inverted Rows", sets: 3, reps: "12 reps", notes: "Squeeze scapula" },
      { name: "Plank", sets: 3, reps: "40 sec", notes: "Core tight, no hip sag" },
    ];
  }

  // Full training
  if (muscleReadiness.lowerBody === "fatigued") {
    return [
      { name: "Push-ups", sets: 4, reps: "10-12 reps", notes: "Elbows at 45 degrees" },
      { name: hasDumbbells ? "Dumbbell Rows" : "Pull-ups", sets: 4, reps: "10-12 reps", notes: "Drive elbows to hips" },
      { name: "Overhead Press", sets: 3, reps: "10-12 reps", notes: "Neutral spine" },
      { name: "Plank with Shoulder Taps", sets: 3, reps: "16 taps", notes: "Resist hip sway" },
    ];
  }

  return [
    { name: isGym ? "Barbell Squats" : isBodyweight ? "Bodyweight Squats" : "Goblet Squats", sets: 4, reps: "10-12 reps", notes: "Full depth, drive knees out" },
    { name: "Push-ups", sets: 3, reps: "10-15 reps", notes: "Full range of motion" },
    { name: hasDumbbells ? "Romanian Deadlifts" : "Single-Leg RDL", sets: 3, reps: "12 reps", notes: "Hinge at hips" },
    { name: "Mountain Climbers", sets: 3, reps: "20 reps", notes: "Controlled pace" },
  ];
}

function getWorkoutFocus(action: OjasAction, fitness: FitnessState): string {
  switch (action) {
    case "RECOVERY":
    case "REST":
      return "Joint Mobility & Nervous System Decompression";
    case "MINIMUM_TRAINING":
      return "High-Density Full Body Circuit";
    case "REDUCED_TRAINING":
      return "Efficient Compound Movements";
    case "SPORT_PRACTICE":
      return "Technical Skill & Movement Quality";
    case "FULL_TRAINING":
    default:
      return `${fitness.trend === "improving" ? "Progressive Overload" : "Balanced Conditioning"}`;
  }
}

function getSportsDrills(sport: string): string[] {
  const drills: Record<string, string[]> = {
    cricket: ["Batting Shadow Practice", "Fielding Throws", "Wicket Keeping Stance"],
    football: ["Cone Dribbling", "Passing Accuracy", "Agility Ladder"],
    badminton: ["Shadow Footwork", "Smash Practice", "Net Play"],
    athletics: ["Sprint Starts", "Block Clearance", "Running Form"],
    basketball: ["Dribbling Drills", "Shooting Form", "Defensive Slides"],
  };
  return drills[sport.toLowerCase()] || ["Sport-Specific Warm-Up", "Technical Drills", "Cool-Down"];
}

function buildNutritionSuggestion(nutrition: NutritionState, lifestyle: LifestyleState): OjasDecision["nutrition"] {
  const remaining = nutrition.proteinTarget - nutrition.proteinConsumed;
  const budget = nutrition.dailyBudgetINR;

  if (nutrition.isHostelMode) {
    return {
      headline: "Hostel/Mess Protein Strategy",
      recommendation: `Target ${nutrition.proteinTarget}g protein. Take extra dal/egg curry at mess.`,
      affordableProteinHack: budget <= 80
        ? "Boiled Eggs (₹21 for 3 = 18g protein) + Soya Chunks (₹15 for 50g = 26g protein)"
        : "Double Dal Serving + Egg Curry + Curd (₹30 total, 35g protein)",
      estimatedCostINR: budget <= 80 ? 45 : 60,
    };
  }

  return {
    headline: "High-Protein Distribution",
    recommendation: `Target ${nutrition.proteinTarget}g protein across 3-4 meals. ${remaining > 0 ? `${remaining}g remaining.` : "Target reached!"}`,
    affordableProteinHack: budget <= 100
        ? "Egg Bhurji + Roti (₹30, 22g protein)"
        : "Chicken/Paneer + Dal + Roti (₹60, 35g protein)",
    estimatedCostINR: budget <= 100 ? 50 : 75,
  };
}

export function getDecisionHistory(): DecisionHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(OJAS_DECISION_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored) as DecisionHistoryEntry[];
    }
  } catch {
    // Fall through
  }

  return [];
}

export function addDecisionToHistory(entry: DecisionHistoryEntry): void {
  if (typeof window === "undefined") return;

  try {
    const history = getDecisionHistory();
    const updated = [entry, ...history].slice(-30);
    localStorage.setItem(OJAS_DECISION_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Storage full
  }
}

export function runWhatIfSimulation(
  baseState: OjasState,
  changes: Partial<OjasState>
): OjasDecision {
  const simulatedState: OjasState = {
    ...baseState,
    ...changes,
    recovery: { ...baseState.recovery, ...(changes.recovery || {}) },
    lifestyle: { ...baseState.lifestyle, ...(changes.lifestyle || {}) },
    training: { ...baseState.training, ...(changes.training || {}) },
    risk: { ...baseState.risk, ...(changes.risk || {}) },
    constraints: {
      ...baseState.constraints,
      hard: { ...baseState.constraints.hard, ...(changes.constraints?.hard || {}) },
      soft: { ...baseState.constraints.soft, ...(changes.constraints?.soft || {}) },
    },
  };

  // Recalculate derived state
  simulatedState.recovery.recoveryScore = calculateRecoveryScore(simulatedState);
  updateDerivedState(simulatedState);

  return computeDailyDecision(simulatedState);
}
