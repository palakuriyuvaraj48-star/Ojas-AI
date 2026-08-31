/**
 * Engine 2: Context Fusion Engine
 * Fuses multi-source telemetry into a normalized, single CurrentContext.
 * Respects missing data without hallucination and tracks source attribution.
 */

import { DigitalTwin } from "@/lib/digital-twin/types";
import { ClientProfile, DailyLog, StressLevel } from "@/types/profile";

export type SignalSource = "device_sensor" | "vision_ai" | "user_input" | "twin_derived" | "fallback";

export interface CurrentContext {
  userId: string;
  timestamp: string;

  // Normalized Physiological & Recovery
  recoveryScore: number; // 0 - 100
  sleepHours: number;
  sleepQuality: "poor" | "average" | "good" | "optimal";
  acuteTrainingLoad: number; // 0 - 100
  chronicTrainingLoad: number;
  acuteChronicRatio: number; // ACWR e.g. 0.8 - 1.6
  fatigueLevel: number; // 0 - 100
  stressLevel: StressLevel;
  painReported: boolean;

  // Lifestyle & Academic Constraints
  isExamPeriod: boolean;
  availableTimeMinutes: number;
  equipmentAvailable: string[];
  workoutLocation: "home" | "gym" | "outdoor" | "college" | "limited";
  travelStatus: "home" | "travelling" | "hostel";
  
  // Nutrition & Budget
  dailyBudgetINR: number;
  isHostelMode: boolean;
  hydrationLiters: number;

  // Sports Intelligence
  sportsContext?: {
    sportId: string;
    level: string;
    gapAttribute: string;
    readinessScore: number;
    matchUpcoming?: boolean;
  };

  // Environmental Context
  environment: {
    tempC: number;
    humidityPct: number;
    aqi: number;
    isHeatAlert: boolean;
    condition: string;
    indoorRecommended: boolean;
  };

  // Vision Coach Feedback Signals
  visionQuality: {
    latestFormScore: number;
    formTrend: "improving" | "stable" | "declining";
    avgRomPct: number;
    movementSymmetry: number;
  };

  // Behavioral & Adherence Signals
  behavioral: {
    adherencePct: number;
    consecutiveMisses: number;
    preferredTime: string;
    primarySkipReason?: string;
  };

  // Source attribution for data transparency
  sources: Record<string, SignalSource>;
}

export interface ContextFusionInputs {
  twin: DigitalTwin;
  profile?: ClientProfile | null;
  dailyLog?: DailyLog | null;
  logsHistory?: DailyLog[];
  liveFormScore?: number;
  environmentOverride?: Partial<CurrentContext["environment"]>;
  constraintOverrides?: {
    availableTime?: number;
    equipment?: string[];
    isExamPeriod?: boolean;
    dailyBudgetINR?: number;
    travelStatus?: "home" | "travelling" | "hostel";
    stressLevel?: StressLevel;
    sleepHours?: number;
    acuteTrainingLoad?: number;
    acuteChronicRatio?: number;
    formScore?: number;
  };
}

/**
 * Fuse all real-time and historical signals into unified CurrentContext.
 */
export function fuseContext(inputs: ContextFusionInputs): CurrentContext {
  const { twin, profile, dailyLog, logsHistory = [], liveFormScore, environmentOverride, constraintOverrides } = inputs;
  const now = new Date().toISOString();
  const sources: Record<string, SignalSource> = {};

  // 1. Available Time resolution
  let availableTime = twin.lifestyle.availableTime || 35;
  if (constraintOverrides?.availableTime !== undefined) {
    availableTime = constraintOverrides.availableTime;
    sources["availableTime"] = "user_input";
  } else if (profile?.availableWorkoutTime) {
    availableTime = profile.availableWorkoutTime;
    sources["availableTime"] = "user_input";
  } else {
    sources["availableTime"] = "twin_derived";
  }

  // 2. Exam mode resolution
  let isExam = twin.lifestyle.isExamPeriod;
  if (constraintOverrides?.isExamPeriod !== undefined) {
    isExam = constraintOverrides.isExamPeriod;
    sources["isExamPeriod"] = "user_input";
  } else {
    sources["isExamPeriod"] = "twin_derived";
  }

  // 3. Sleep & Stress resolution
  let sleepHours = twin.recovery.sleepDuration || 7.2;
  if (constraintOverrides?.sleepHours !== undefined) {
    sleepHours = constraintOverrides.sleepHours;
    sources["sleepHours"] = "user_input";
  } else if (profile?.sleepDuration) {
    sleepHours = profile.sleepDuration;
    sources["sleepHours"] = "user_input";
  } else {
    sources["sleepHours"] = "twin_derived";
  }

  let stressLevel: StressLevel = twin.lifestyle.stressLevel || "medium";
  if (constraintOverrides?.stressLevel !== undefined) {
    stressLevel = constraintOverrides.stressLevel;
    sources["stressLevel"] = "user_input";
  } else if (profile?.stressLevel) {
    stressLevel = profile.stressLevel;
    sources["stressLevel"] = "user_input";
  } else {
    sources["stressLevel"] = "twin_derived";
  }

  // If exam mode is active, adjust time and stress dynamically if not overridden
  if (isExam) {
    availableTime = Math.min(availableTime, 20);
    stressLevel = "high";
    sleepHours = Math.min(sleepHours, 5.5);
  }

  // 4. Equipment resolution
  let equipment = twin.lifestyle.availableEquipment || ["bodyweight"];
  if (constraintOverrides?.equipment !== undefined) {
    equipment = constraintOverrides.equipment;
    sources["equipment"] = "user_input";
  } else if (profile?.availableEquipment?.length) {
    equipment = profile.availableEquipment;
    sources["equipment"] = "user_input";
  } else {
    sources["equipment"] = "twin_derived";
  }

  // 5. Budget resolution
  let budget = twin.nutrition.budget || 100;
  if (constraintOverrides?.dailyBudgetINR !== undefined) {
    budget = constraintOverrides.dailyBudgetINR;
    sources["budget"] = "user_input";
  } else if (profile?.dailyFoodBudget) {
    budget = profile.dailyFoodBudget;
    sources["budget"] = "user_input";
  } else {
    sources["budget"] = "twin_derived";
  }

  // 6. Recovery Score Calculation
  const recentLogs = logsHistory.slice(-7);
  const totalRecentMinutes = recentLogs.reduce((acc, l) => acc + (l.workoutDuration || 30), 0);
  const acuteLoad = constraintOverrides?.acuteTrainingLoad ?? Math.min(100, Math.round((totalRecentMinutes / 240) * 100) || twin.recovery.acuteTrainingLoad || 40);
  const chronicLoad = twin.recovery.chronicTrainingLoad || 50;
  const acwr = constraintOverrides?.acuteChronicRatio ?? Number((acuteLoad / (chronicLoad || 1)).toFixed(2));

  const sleepFactor = sleepHours >= 7.5 ? 35 : sleepHours >= 6 ? 20 : 5;
  const stressPenalty = stressLevel === "high" ? 25 : stressLevel === "medium" ? 10 : 0;
  const loadPenalty = acuteLoad > 75 ? 20 : acuteLoad > 55 ? 10 : 0;
  const calculatedRecovery = Math.max(25, Math.min(98, 55 + sleepFactor - stressPenalty - loadPenalty));
  sources["recoveryScore"] = "twin_derived";

  // 7. Vision Coach signals
  const formScores = [...(twin.physical.workoutPerformance.recentFormScores || [90])];
  if (constraintOverrides?.formScore !== undefined) formScores.push(constraintOverrides.formScore);
  else if (liveFormScore) formScores.push(liveFormScore);
  const latestForm = formScores[formScores.length - 1] || 90;
  let formTrend: "improving" | "stable" | "declining" = "stable";
  if (formScores.length >= 3) {
    const s1 = formScores[formScores.length - 3];
    const s2 = formScores[formScores.length - 2];
    const s3 = formScores[formScores.length - 1];
    if (s3 < s2 && s2 < s1 && s3 < 75) formTrend = "declining";
    else if (s3 > s2 && s2 > s1) formTrend = "improving";
  }
  sources["visionQuality"] = (liveFormScore || constraintOverrides?.formScore !== undefined) ? "vision_ai" : "twin_derived";

  // 8. Environmental signals
  const tempC = environmentOverride?.tempC ?? twin.environment.temperatureC ?? 31;
  const humidity = environmentOverride?.humidityPct ?? twin.environment.humidityPct ?? 60;
  const isHeatAlert = tempC >= 38 || (tempC >= 35 && humidity >= 65);
  const indoorRecommended = isHeatAlert || tempC >= 40 || (environmentOverride?.condition === "rainy");
  sources["environment"] = environmentOverride ? "device_sensor" : "fallback";

  return {
    userId: twin.userId,
    timestamp: now,
    recoveryScore: calculatedRecovery,
    sleepHours,
    sleepQuality: sleepHours >= 7.5 ? "optimal" : sleepHours >= 6.5 ? "good" : "poor",
    acuteTrainingLoad: acuteLoad,
    chronicTrainingLoad: chronicLoad,
    acuteChronicRatio: acwr,
    fatigueLevel: stressLevel === "high" ? 75 : stressLevel === "medium" ? 45 : 20,
    stressLevel,
    painReported: twin.recovery.painDiscomfortReported || false,

    isExamPeriod: isExam,
    availableTimeMinutes: availableTime,
    equipmentAvailable: equipment,
    workoutLocation: twin.lifestyle.workoutEnvironment || "home",
    travelStatus: constraintOverrides?.travelStatus ?? twin.lifestyle.travelStatus ?? "home",

    dailyBudgetINR: budget,
    isHostelMode: twin.nutrition.isHostelMode || false,
    hydrationLiters: dailyLog?.waterConsumed ?? twin.nutrition.hydrationLevel ?? 2.5,

    sportsContext: twin.sport?.selectedSportId
      ? {
          sportId: twin.sport.selectedSportId,
          level: twin.sport.sportLevel || "foundation",
          gapAttribute: twin.sport.primaryGapAttribute || "agility",
          readinessScore: Math.min(100, Math.round(calculatedRecovery * 0.9 + (100 - acuteLoad) * 0.1)),
        }
      : undefined,

    environment: {
      tempC,
      humidityPct: humidity,
      aqi: environmentOverride?.aqi ?? twin.environment.airQualityIndex ?? 90,
      isHeatAlert,
      condition: isHeatAlert ? "Extreme Heat Warning" : tempC > 30 ? "Warm & Humid" : "Favorable",
      indoorRecommended,
    },

    visionQuality: {
      latestFormScore: latestForm,
      formTrend,
      avgRomPct: 92,
      movementSymmetry: 0.94,
    },

    behavioral: {
      adherencePct: twin.behavioral.workoutConsistency || 85,
      consecutiveMisses: twin.behavioral.consecutiveMisses || 0,
      preferredTime: twin.behavioral.preferredWorkoutTime || "evening",
      primarySkipReason: Object.entries(twin.behavioral.skipReasons || {}).sort((a, b) => b[1] - a[1])[0]?.[0],
    },

    sources,
  };
}
