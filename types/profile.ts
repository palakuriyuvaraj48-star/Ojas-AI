export type Gender = "male" | "female" | "other";
export type FitnessGoal = "fat-loss" | "lean-bulk" | "muscle-gain" | "maintenance";
export type ActivityLevel = "sedentary" | "lightly-active" | "moderately-active" | "very-active" | "extra-active";
export type GymExperience = "beginner" | "intermediate" | "advanced";
export type FoodPreference = "veg" | "non-veg" | "both";
export type Budget = "budget" | "moderate" | "premium";
export type StressLevel = "low" | "medium" | "high";
export type WorkoutEnvironment = "gym" | "home" | "both";
export type AIPersonality = "motivational" | "analytical" | "friendly" | "strict";
export type ThemePreference = "system" | "light" | "dark";
export type Language = "en" | "es" | "fr" | "de" | "hi" | "ja";

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
  medicalConditions: string;
  injuries: string;
  foodPreference: FoodPreference;
  allergies: string;
  budget: Budget;
  sleepDuration: number;
  stressLevel: StressLevel;
  availableEquipment: string[];
  lifestyle: string;
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
  fiberConsumed?: number;
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
}

export interface UserPreferences {
  theme: ThemePreference;
  units: "metric" | "imperial";
  language: Language;
  voiceEnabled: boolean;
  aiPersonality: AIPersonality;
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
