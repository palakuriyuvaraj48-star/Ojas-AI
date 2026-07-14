export type MealType = "breakfast" | "lunch" | "snack" | "dinner" | "pre-workout" | "post-workout";
export type DietCategory = "non-veg" | "veg" | "vegan" | "eggetarian";
export type NutritionGoal = "fat-loss" | "lean-bulk" | "muscle-gain" | "maintenance";
export type FoodSource = "manual" | "barcode" | "camera" | "voice" | "recipe" | "restaurant";
export type MealSlot = "breakfast" | "mid-morning" | "lunch" | "afternoon" | "dinner" | "pre-bed";
export type MicronutrientStatus = "deficient" | "low" | "optimal" | "excess";

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  water: number;
  sodium: string;
  sugar: number;
}

export interface MacroProgress {
  protein: { current: number; target: number; percent: number };
  carbs: { current: number; target: number; percent: number };
  fat: { current: number; target: number; percent: number };
  fiber: { current: number; target: number; percent: number };
}

export interface MicronutrientEntry {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: MicronutrientStatus;
  percent: number;
}

export interface MealPlanEntry {
  slot: MealSlot;
  title: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cost: number;
  timeMinutes: number;
  alternatives?: string[];
}

export interface MealPlan {
  id: string;
  date: string;
  goal: NutritionGoal;
  diet: DietCategory;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  dailyCost: number;
  weeklyCost: number;
  meals: MealPlanEntry[];
  reasoning: string;
  createdAt: string;
}

export interface FoodEntry {
  id: string;
  name: string;
  source: FoodSource;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  portion?: string;
  confidence?: number;
  loggedAt: string;
}

export interface WaterLog {
  id: string;
  amount: number;
  loggedAt: string;
}

export interface GroceryItem {
  id: string;
  category: string;
  name: string;
  quantity: string;
  price: number;
  alternative?: string;
  checked: boolean;
}

export interface GroceryList {
  id: string;
  date: string;
  items: GroceryItem[];
  totalEstimatedCost: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredientsMatched: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  time: string;
  instructions: string[];
  substitution: string;
  difficulty: "easy" | "medium" | "hard";
  servings: number;
  cuisine?: string;
}

export interface RestaurantMeal {
  id: string;
  restaurant: string;
  dish: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  portion: string;
  healthierAlternative?: string;
  notes: string;
}

export interface NutritionNotification {
  id: string;
  type: "warning" | "info" | "success" | "reminder";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface NutritionAnalytics {
  period: "weekly" | "monthly";
  calorieTrend: { day: string; consumed: number; target: number }[];
  macroTrend: { day: string; protein: number; carbs: number; fat: number }[];
  waterTrend: { day: string; amount: number }[];
  nutritionScore: number;
  mealConsistency: number;
  budgetUsed: number;
  budgetTotal: number;
  topFoods: { name: string; count: number }[];
  deficiencies: MicronutrientEntry[];
  aiInsight: string;
}
