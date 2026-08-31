export type Gender = "male" | "female" | "other";
export type FitnessGoal = "fat-loss" | "lean-bulk" | "muscle-gain" | "maintenance";
export type ActivityLevel = "sedentary" | "lightly-active" | "moderately-active" | "very-active" | "extra-active";
export type GymExperience = "beginner" | "intermediate" | "advanced";
export type FoodPreference = "veg" | "non-veg" | "both" | "vegan" | "eggitarian";
export type Budget = "budget" | "moderate" | "premium";
export type StressLevel = "low" | "medium" | "high";
export type WorkoutEnvironment = "gym" | "home" | "both" | "outdoor" | "college";
export type AIPersonality = "motivational" | "analytical" | "friendly" | "strict";
export type ThemePreference = "system" | "light" | "dark";
export type Language =
  | "en" | "te" | "hi" | "ta" | "kn" | "ml" | "mr" | "bn" | "gu" | "pa" | "or" | "ur" | "as" | "ne"
  | "es" | "fr" | "de" | "pt" | "ar" | "ja" | "ko";

export type IndianLifestyleRole = "college-student" | "working-professional" | "homemaker" | "athlete" | "beginner" | "other";
export type FoodEnvironment = "hostel-mess" | "home-cooked" | "restaurant-tiffin" | "meal-service" | "mixed";

export interface Permissions {
  calendar: boolean;
  health: boolean;
  camera: boolean;
  notification: boolean;
  location: boolean;
}

export interface ClientProfile {
  name?: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  goal: FitnessGoal;
  bodyFat?: number;
  activityLevel: ActivityLevel;
  gymExperience: GymExperience;
  dailyStepGoal: number;
  occupation: string;
  workoutDaysPerWeek: number;
  /** Usual time available for a single workout (minutes). Used by the adaptive planner. */
  availableWorkoutTime?: number;
  medicalConditions: string;
  injuries: string;
  foodPreference: FoodPreference;
  allergies: string;
  budget: Budget;
  dailyFoodBudget?: number; // In INR e.g. 50, 100, 150, 250
  sleepDuration: number;
  stressLevel: StressLevel;
  availableEquipment: string[];
  lifestyle: string;
  lifestyleRole?: IndianLifestyleRole;
  foodEnvironment?: FoodEnvironment;
  neckCircumference?: number;
  legCircumference?: number;
  targetWeight?: number;
  timelineWeeks?: number;
  workoutEnvironment?: WorkoutEnvironment;
  workoutTime?: string;
  wakeTime?: string;
  sleepTime?: string;
  waterIntake?: number;
  language?: Language;
  aiPersonality?: AIPersonality;
  themePreference?: ThemePreference;
  permissions?: Permissions;
  cityOrRegion?: string;
  isHostelMode?: boolean;
  userMode?: "general-fitness" | "sport-transition" | "athlete-performance";
  selectedSport?: string;
  sportLevel?: "foundation" | "development" | "performance" | "advanced";
  sportAttributes?: Record<string, number>;
  sportBaselines?: Record<string, number>;
}

export interface DailyLog {
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  waterConsumed: number;
  stepsCount: number;
  workoutCompleted: boolean;
  workoutDuration: number;
  workoutName?: string;
  workoutIntensity?: string;
  formScore?: number;
  fiberConsumed?: number;
  costIncurred?: number;
  notes?: string;
}

export interface WeeklyCheckIn {
  date: string;
  weight: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  sleepQuality: "poor" | "average" | "good";
  stressLevel: StressLevel;
  adherenceRate: number;
  strengthLevel: "decreased" | "stable" | "increased";
  notes?: string;
  adjustments: {
    calorieDelta: number;
    stepDelta: number;
    volumeDelta: string;
    reason: string;
  };
}

export interface Message {
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  recommendation?: any;
  cards?: any[];
  safety?: boolean;
  language?: Language;
  quickReplies?: string[];
}

export interface UserPreferences {
  theme: ThemePreference;
  units: "metric" | "imperial";
  language: Language;
  voiceEnabled: boolean;
  aiPersonality: AIPersonality;
  lowDataMode?: boolean;
  notifications: {
    workouts: boolean;
    nutrition: boolean;
    recovery: boolean;
    community: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    dataSharing: boolean;
    analyticsOptIn: boolean;
    localCameraOnly: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "email" | "google" | "apple";
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  rememberMe: boolean;
  expiresAt: string;
}
