/**
 * Realistic Indian Hostel & Mess Budget Meal Plans for OJAS AI
 * Designed for Indian students and athletes balancing strict budgets (₹100, ₹150, ₹250/day).
 */

export interface FoodItem {
  item: string;
  cost: number; // in INR (₹)
  protein: number; // in grams
  calories: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface Meal {
  name: string;
  time: string;
  foods: FoodItem[];
  subtotalCost: number;
  subtotalProtein: number;
  subtotalCalories: number;
  notes: string;
}

export interface HostelMealPlan {
  budget: number;
  currency: string;
  title: string;
  description: string;
  targetCalories: number;
  targetProtein: number;
  meals: Meal[];
  dailyTotals: {
    cost: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  notes: string[];
}

export const HOSTEL_MEAL_PLANS: Record<number, HostelMealPlan> = {
  100: {
    budget: 100,
    currency: "₹",
    title: "₹100/Day Ultra-Budget Hostel High-Protein Plan",
    description: "Realistic hostel-optimized meal plan using mess staples, eggs, peanuts, and local bananas.",
    targetCalories: 1750,
    targetProtein: 72,
    meals: [
      {
        name: "🌅 Breakfast (7:30 AM)",
        time: "7:30 AM",
        foods: [
          { item: "2 Boiled Eggs (Mess/Stall)", cost: 12, protein: 12, calories: 140, carbs: 1, fats: 10 },
          { item: "2 Mess Rotis with Dal", cost: 10, protein: 6, calories: 160, carbs: 32, fats: 2 }
        ],
        subtotalCost: 22,
        subtotalProtein: 18,
        subtotalCalories: 300,
        notes: "High biological value morning protein to initiate muscle protein synthesis."
      },
      {
        name: "🍌 Mid-Morning Snack (10:30 AM)",
        time: "10:30 AM",
        foods: [
          { item: "1 Large Banana", cost: 5, protein: 1.2, calories: 105, carbs: 27, fats: 0.3 }
        ],
        subtotalCost: 5,
        subtotalProtein: 1.2,
        subtotalCalories: 105,
        notes: "Quick energy carbohydrates between college lectures."
      },
      {
        name: "🍲 Mess Lunch (1:15 PM)",
        time: "1:15 PM",
        foods: [
          { item: "Thick Yellow Dal (1.5 bowls)", cost: 15, protein: 10, calories: 180, carbs: 28, fats: 2 },
          { item: "Steamed Rice (1.5 cups)", cost: 12, protein: 5, calories: 280, carbs: 60, fats: 1 },
          { item: "Cucumber & Onion Salad", cost: 5, protein: 1, calories: 25, carbs: 5, fats: 0 }
        ],
        subtotalCost: 32,
        subtotalProtein: 16,
        subtotalCalories: 485,
        notes: "Hostel mess staple. Request extra thick dal or pulses for maximum protein."
      },
      {
        name: "🥜 Pre-Workout Energy (4:30 PM)",
        time: "4:30 PM",
        foods: [
          { item: "Roasted Peanuts (35g)", cost: 10, protein: 9, calories: 200, carbs: 6, fats: 17 },
          { item: "Black Coffee / Tea", cost: 6, protein: 0.5, calories: 20, carbs: 4, fats: 0 }
        ],
        subtotalCost: 16,
        subtotalProtein: 9.5,
        subtotalCalories: 220,
        notes: "Cost-effective healthy fats & leucine before training."
      },
      {
        name: "🍗 Mess Dinner & Recovery (8:00 PM)",
        time: "8:00 PM",
        foods: [
          { item: "3 Boiled Eggs (or 100g Soya Chunks)", cost: 18, protein: 18, calories: 210, carbs: 2, fats: 15 },
          { item: "2 Rotis / 1 cup Rice", cost: 7, protein: 6, calories: 160, carbs: 32, fats: 1 }
        ],
        subtotalCost: 25,
        subtotalProtein: 24,
        subtotalCalories: 370,
        notes: "Sustained overnight amino acid delivery for muscle repair."
      }
    ],
    dailyTotals: {
      cost: 100,
      calories: 1480,
      protein: 68.7,
      carbs: 168,
      fats: 45
    },
    notes: [
      "✓ Achieves ~69g protein on only ₹100/day.",
      "✓ Relies on zero fancy supplements: 100% whole foods available anywhere in India.",
      "✓ Works seamlessly with any standard university or college hostel mess.",
      "✓ High fiber from whole wheat rotis and lentils ensures satiety."
    ]
  },

  150: {
    budget: 150,
    currency: "₹",
    title: "₹150/Day Optimized Hostel Athlete Plan",
    description: "Expanded budget featuring fresh paneer/curd, higher egg count, seasonal fruits, and sprouts.",
    targetCalories: 2100,
    targetProtein: 95,
    meals: [
      {
        name: "🌅 Breakfast (7:30 AM)",
        time: "7:30 AM",
        foods: [
          { item: "3 Boiled Eggs", cost: 18, protein: 18, calories: 210, carbs: 1, fats: 15 },
          { item: "2 Mess Rotis + Dal", cost: 12, protein: 6, calories: 160, carbs: 32, fats: 2 },
          { item: "1 Banana", cost: 5, protein: 1.2, calories: 105, carbs: 27, fats: 0.3 }
        ],
        subtotalCost: 35,
        subtotalProtein: 25.2,
        subtotalCalories: 475,
        notes: "Dense breakfast fueling morning lectures and focus."
      },
      {
        name: "🥗 Mid-Morning Sprout Bowl (11:00 AM)",
        time: "11:00 AM",
        foods: [
          { item: "Moong Sprouts (50g dry wt with Lemon/Chaat)", cost: 10, protein: 12, calories: 170, carbs: 30, fats: 1 }
        ],
        subtotalCost: 10,
        subtotalProtein: 12,
        subtotalCalories: 170,
        notes: "Micro-nutrient rich live enzymes, Vitamin C, and clean plant protein."
      },
      {
        name: "🍲 Mess Lunch (1:30 PM)",
        time: "1:30 PM",
        foods: [
          { item: "Paneer Bhurji / Curry (80g)", cost: 30, protein: 14, calories: 220, carbs: 4, fats: 16 },
          { item: "Rice & 2 Rotis", cost: 15, protein: 8, calories: 340, carbs: 70, fats: 2 },
          { item: "Curd (100g)", cost: 10, protein: 3.5, calories: 65, carbs: 5, fats: 3.5 }
        ],
        subtotalCost: 55,
        subtotalProtein: 25.5,
        subtotalCalories: 625,
        notes: "Probiotics from curd improve gut absorption of nutrients."
      },
      {
        name: "🥜 Pre-Workout Energy (4:30 PM)",
        time: "4:30 PM",
        foods: [
          { item: "Roasted Peanuts (40g) + Jaggery", cost: 15, protein: 10, calories: 240, carbs: 15, fats: 18 }
        ],
        subtotalCost: 15,
        subtotalProtein: 10,
        subtotalCalories: 240,
        notes: "Sustained glycogen fueling for heavy strength training."
      },
      {
        name: "🍗 Mess Dinner (8:30 PM)",
        time: "8:30 PM",
        foods: [
          { item: "Chicken Curry (150g) OR 3 Eggs + Soya", cost: 30, protein: 28, calories: 260, carbs: 4, fats: 12 },
          { item: "2 Rotis with Dal", cost: 10, protein: 6, calories: 160, carbs: 32, fats: 2 }
        ],
        subtotalCost: 40,
        subtotalProtein: 34,
        subtotalCalories: 420,
        notes: "High anabolic recovery window post-workout."
      }
    ],
    dailyTotals: {
      cost: 150,
      calories: 1930,
      protein: 106.7,
      carbs: 183,
      fats: 49.8
    },
    notes: [
      "✓ Achieves over 100g protein on ₹150 daily budget.",
      "✓ Includes dairy (curd/paneer) + poultry + legumes for complete amino acid variety.",
      "✓ Provides steady energy without mid-day crashes during college labs."
    ]
  },

  250: {
    budget: 250,
    currency: "₹",
    title: "₹250/Day High-Performance Athlete Diet",
    description: "Premium college/working professional nutrition plan with whey/eggs, chicken breast, nuts, and fresh fruits.",
    targetCalories: 2400,
    targetProtein: 135,
    meals: [
      {
        name: "🌅 Breakfast (7:30 AM)",
        time: "7:30 AM",
        foods: [
          { item: "4 Whole Boiled Eggs", cost: 24, protein: 24, calories: 280, carbs: 2, fats: 20 },
          { item: "Oats with Milk & Banana", cost: 25, protein: 10, calories: 310, carbs: 55, fats: 6 }
        ],
        subtotalCost: 49,
        subtotalProtein: 34,
        subtotalCalories: 590,
        notes: "Complex carbs + high-quality protein."
      },
      {
        name: "🥗 Mid-Morning Snack (11:00 AM)",
        time: "11:00 AM",
        foods: [
          { item: "Sprouts & Roasted Almonds", cost: 25, protein: 10, calories: 210, carbs: 20, fats: 10 }
        ],
        subtotalCost: 25,
        subtotalProtein: 10,
        subtotalCalories: 210,
        notes: "Rich in Vitamin E, magnesium, and healthy fats."
      },
      {
        name: "🍲 Lunch (1:30 PM)",
        time: "1:30 PM",
        foods: [
          { item: "Chicken Breast / Paneer (150g)", cost: 65, protein: 35, calories: 260, carbs: 2, fats: 8 },
          { item: "Rice & 2 Rotis with Dal", cost: 15, protein: 8, calories: 340, carbs: 70, fats: 2 },
          { item: "Curd (150g)", cost: 15, protein: 5, calories: 95, carbs: 7, fats: 5 }
        ],
        subtotalCost: 95,
        subtotalProtein: 48,
        subtotalCalories: 695,
        notes: "High protein meal supporting athletic hypertrophy."
      },
      {
        name: "🥜 Pre-Workout Shake / Snack (4:30 PM)",
        time: "4:30 PM",
        foods: [
          { item: "Peanut Butter (2 tbsp) + 2 Bananas", cost: 25, protein: 9, calories: 320, carbs: 55, fats: 16 }
        ],
        subtotalCost: 25,
        subtotalProtein: 9,
        subtotalCalories: 320,
        notes: "Fast + sustained energy for peak lifting intensity."
      },
      {
        name: "🍗 Dinner & Night Recovery (8:30 PM)",
        time: "8:30 PM",
        foods: [
          { item: "Egg Curry (3 Eggs) + Chicken (100g)", cost: 45, protein: 36, calories: 330, carbs: 5, fats: 18 },
          { item: "2 Multigrain Rotis + Green Veggies", cost: 15, protein: 6, calories: 180, carbs: 35, fats: 2 }
        ],
        subtotalCost: 60,
        subtotalProtein: 42,
        subtotalCalories: 510,
        notes: "Optimal overnight recovery with high protein & micronutrients."
      }
    ],
    dailyTotals: {
      cost: 254,
      calories: 2325,
      protein: 143,
      carbs: 237,
      fats: 62
    },
    notes: [
      "✓ Exceptional 140g+ protein on ₹250/day budget.",
      "✓ Ideal for competitive athletes, powerlifters, and severe athletic overload.",
      "✓ Includes whole eggs, clean poultry, dairy, and wholesome complex carbs."
    ]
  }
};
