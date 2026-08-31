/**
 * Digital Twin AI Context Builder
 * Transforms the user's active Digital Twin and deterministic analytics
 * into a compact, structured context for Ollama / Gemma 3 4B.
 */

import { DigitalTwin } from "./types";
import { createInitialTwin, updateTwinFromLogs } from "./engine";
import { ClientProfile, DailyLog, WeeklyCheckIn } from "@/types/profile";

export interface DigitalTwinAIContext {
  goal: {
    primary: string | null;
    target: string | null;
  };
  profile: {
    fitness_level: string | null;
    available_time_minutes: number | null;
    equipment: string[];
    environment: string | null;
  };
  body: {
    weight: number | null;
    height: number | null;
    body_fat: number | null;
  };
  training: {
    recent_workouts: string[];
    training_frequency: number | null;
    performance_trend: string | null;
    volume_trend: string | null;
    consistency_score: number | null;
  };
  recovery: {
    score: number | null;
    fatigue: number | null;
    readiness: string | null;
  };
  sleep: {
    duration_hours: number | null;
    quality: string | null;
    trend: string | null;
  };
  nutrition: {
    calories: number | null;
    protein: number | null;
    hydration: number | null;
    budget_daily: number | null;
  };
  lifestyle: {
    stress: string | null;
    time_available: number | null;
    travel: boolean;
    occupation: string | null;
  };
  wearables: {
    heart_rate: number | null;
    steps: number | null;
    activity: string | null;
  };
}

/**
 * Builds a clean, grounded DigitalTwinAIContext from a DigitalTwin object,
 * optionally augmented with Profile and recent DailyLogs.
 * Omits or sets null for unavailable fields to prevent hallucinations.
 */
export function buildDigitalTwinAIContext(
  twin: DigitalTwin,
  profile?: ClientProfile | null,
  recentLogs?: DailyLog[] | null
): DigitalTwinAIContext {
  const latestLog = recentLogs && recentLogs.length > 0 ? recentLogs[recentLogs.length - 1] : null;

  return {
    goal: {
      primary: profile?.goal || null,
      target: profile?.goal ? `Target: ${profile.goal.replace(/-/g, " ")}` : null,
    },
    profile: {
      fitness_level: twin.physical?.fitnessLevel || profile?.gymExperience || null,
      available_time_minutes: twin.lifestyle?.availableTime ?? profile?.availableWorkoutTime ?? null,
      equipment: twin.lifestyle?.availableEquipment || profile?.availableEquipment || [],
      environment: twin.lifestyle?.workoutEnvironment || profile?.workoutEnvironment || null,
    },
    body: {
      weight: twin.physical?.weight ?? profile?.weight ?? null,
      height: profile?.height ?? null,
      body_fat: twin.physical?.bodyFat ?? profile?.bodyFat ?? null,
    },
    training: {
      recent_workouts: twin.physical?.workoutPerformance?.exercises || (latestLog?.workoutCompleted ? ["Completed logged workout"] : []),
      training_frequency: twin.behavioral?.workoutDaysPerWeekActual ?? profile?.workoutDaysPerWeek ?? null,
      performance_trend: twin.physical?.strengthTrend || null,
      volume_trend: twin.behavioral?.adherencePattern || null,
      consistency_score: twin.behavioral?.workoutConsistency ?? null,
    },
    recovery: {
      score: twin.recovery?.recoveryScore ?? null,
      fatigue: twin.recovery?.fatigueLevel ?? null,
      readiness: twin.recovery?.readiness ?? null,
    },
    sleep: {
      duration_hours: twin.recovery?.sleepDuration ?? profile?.sleepDuration ?? null,
      quality: twin.recovery?.sleepQuality ?? null,
      trend: null,
    },
    nutrition: {
      calories: twin.nutrition?.averageCaloriesConsumed || latestLog?.caloriesConsumed || null,
      protein: latestLog?.proteinConsumed || null,
      hydration: twin.nutrition?.hydrationLevel ?? latestLog?.waterConsumed ?? profile?.waterIntake ?? null,
      budget_daily: twin.nutrition?.budget ?? (profile?.budget === "budget" ? 150 : profile?.budget === "moderate" ? 300 : 500),
    },
    lifestyle: {
      stress: twin.lifestyle?.stressLevel ?? profile?.stressLevel ?? null,
      time_available: twin.lifestyle?.availableTime ?? profile?.availableWorkoutTime ?? null,
      travel: twin.lifestyle?.travelStatus === "travelling",
      occupation: profile?.occupation ?? null,
    },
    wearables: {
      heart_rate: null, // Populated when wearable stream is connected
      steps: latestLog?.stepsCount ?? profile?.dailyStepGoal ?? null,
      activity: twin.lifestyle?.occupationalActivity ?? null,
    },
  };
}

/**
 * Resolves or initializes a user's Digital Twin and returns the AI Context.
 */
export function getDigitalTwinAIContext(
  userId: string,
  options?: {
    twin?: DigitalTwin | null;
    profile?: ClientProfile | null;
    logs?: DailyLog[] | null;
    checkins?: WeeklyCheckIn[] | null;
  }
): { twin: DigitalTwin; aiContext: DigitalTwinAIContext } {
  let twin = options?.twin;

  if (!twin) {
    if (options?.profile) {
      twin = createInitialTwin(options.profile, userId);
      if (options?.logs && options.logs.length > 0) {
        const updated = updateTwinFromLogs(twin, options.logs, options?.checkins || []);
        twin = updated.updatedTwin;
      }
    } else {
      // Fallback default twin baseline if profile is absent
      const fallbackProfile: ClientProfile = {
        name: "Client",
        age: 25,
        gender: "male",
        height: 175,
        weight: 75,
        goal: "fat-loss",
        activityLevel: "moderately-active",
        gymExperience: "intermediate",
        dailyStepGoal: 8000,
        occupation: "General",
        workoutDaysPerWeek: 4,
        availableWorkoutTime: 45,
        medicalConditions: "None",
        injuries: "None",
        foodPreference: "both",
        allergies: "None",
        budget: "moderate",
        sleepDuration: 7.5,
        stressLevel: "low",
        availableEquipment: ["dumbbell", "gym equipment"],
        lifestyle: "Active",
        workoutEnvironment: "gym",
        workoutTime: "morning",
      };
      twin = createInitialTwin(fallbackProfile, userId);
    }
  }

  const aiContext = buildDigitalTwinAIContext(twin, options?.profile, options?.logs);
  return { twin, aiContext };
}
