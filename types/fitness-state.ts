import { ClientProfile, DailyLog, FitnessGoal, FoodPreference, IndianLifestyleRole } from "./profile";

export type OjasDecisionAction = "TRAIN" | "REDUCE_INTENSITY" | "RECOVER" | "FULL_TRAINING" | "REDUCED_TRAINING" | "MINIMUM_TRAINING" | "SPORT_PRACTICE" | "RECOVERY" | "MOBILITY" | "REST" | "NUTRITION_ACTION" | "SLEEP_PRIORITY";

export interface EnvironmentalContext {
  temperatureC?: number;
  feelsLikeC?: number;
  humidityPct?: number;
  airQualityIndex?: number;
  condition?: "sunny" | "hot" | "humid" | "rainy" | "cool" | "cloudy" | "unavailable";
  timeOfDay?: "morning" | "afternoon" | "evening" | "night";
  isHeatWaveAlert?: boolean;
  statusText: string;
  source: "device_sensor" | "weather_api" | "user_preference" | "fallback";
}

export interface MovementState {
  recentTrainingLoad: number; // 0-100 arbitrary units
  fatigueScore: number; // 0-100
  muscleReadiness: {
    upperBody: "primed" | "recovering" | "fatigued";
    lowerBody: "primed" | "recovering" | "fatigued";
    core: "primed" | "recovering" | "fatigued";
  };
  lastWorkoutCompletedAt?: string;
  weeklyWorkoutsCount: number;
  formScoreAverage: number; // 0-100
}

export interface NutritionState {
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  fiberConsumed: number;
  waterLitersTarget: number;
  waterLitersConsumed: number;
  dailyFoodBudgetINR: number;
  spentSoFarINR: number;
  isHostelMode: boolean;
  foodPreference: FoodPreference;
  mealPacing: "on_track" | "protein_lagging" | "calorie_surplus" | "need_fiber";
}

export interface RecoveryState {
  recoveryScore: number; // 0-100
  sleepHours: number;
  sleepQuality: "poor" | "average" | "good" | "optimal";
  hrvStatus: "elevated" | "stable" | "depressed";
  sorenessLevel: "none" | "mild" | "moderate" | "severe";
  soreMuscles: string[];
  stressLevel: "low" | "medium" | "high";
  readinessZone: "green" | "yellow" | "blue";
}

export interface LifestyleContext {
  role: IndianLifestyleRole;
  availableTimeMinutes: number;
  exerciseLocation: "home" | "gym" | "outdoor" | "college";
  equipmentAvailable: string[];
  travelStatus?: "home" | "hostel" | "travelling" | "exam_week";
}

export interface UnifiedFitnessState {
  userId: string;
  timestamp: string;
  movement: MovementState;
  nutrition: NutritionState;
  recovery: RecoveryState;
  lifestyle: LifestyleContext;
  environment: EnvironmentalContext;
  profile: ClientProfile;
}

export interface DailyPriority {
  icon: string;
  category: "workout" | "nutrition" | "hydration" | "recovery";
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  isDone?: boolean;
}

export interface DailyDecision {
  action: OjasDecisionAction;
  badgeColor: "green" | "yellow" | "blue" | "rose" | "purple";
  headline: string;
  subtitle: string;
  whyReasons: string[];
  basedOn: {
    recoveryScore: number;
    sleepHours: number;
    trainingLoad: string;
    availableTime: number;
    fatigueFocus: string;
    environmentText: string;
    primaryGoal: FitnessGoal;
  };
  priorities: DailyPriority[];
  confidence: "High" | "Moderate estimate" | "Demo estimate";
  suggestedWorkout: {
    title: string;
    durationMinutes: number;
    intensity: "Low" | "Moderate" | "High";
    focus: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      notes: string;
      formCoachSupported?: boolean;
    }[];
    alternativeIndoorWorkout?: string;
  };
  suggestedNutritionAction: {
    headline: string;
    recommendation: string;
    affordableProteinHack: string;
    estimatedCostINR: number;
  };
  recoveryAction: {
    headline: string;
    protocol: string;
    mobilityMinutes: number;
  };
}

export interface IndianFoodItem {
  id: string;
  name: string;
  regionalName?: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Protein Source" | "Street Food" | "Dessert";
  region: "South" | "North" | "East" | "West" | "Pan-India";
  dietType: "veg" | "non-veg" | "eggitarian" | "vegan";
  servingSize: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  estimatedCostINR: number;
  proteinQuality: "high" | "medium" | "low";
  isHostelStaple?: boolean;
  isBudgetFriendly?: boolean;
  ojasTip: string;
}

export interface HostelMessDayMenu {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks?: string[];
}

export interface HostelChoiceRanking {
  rank: 1 | 2 | 3;
  badge: "🥇 Best Choice" | "🥈 Solid Alternative" | "⚠️ Limit / Mind Portions";
  mealCategory: "Breakfast" | "Lunch" | "Dinner";
  selectedItems: string[];
  estimatedMacros: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  reasoning: string;
  ojasHostelTip: string;
}
