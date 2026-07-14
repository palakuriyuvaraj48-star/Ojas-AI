import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "muscle-gain";
  const diet = searchParams.get("diet") || "non-veg";
  const budget = parseInt(searchParams.get("budget") || "300");

  // Simulated AI Dietitian meal generation
  const nonVegMeals = [
    { name: "Breakfast", title: "Masala Egg Scramble with Rye Toast", cal: 340, p: 26, c: 14, f: 18, cost: 45 },
    { name: "Lunch", title: "Spiced Tandoori Chicken Tikka with Quinoa", cal: 580, p: 48, c: 42, f: 16, cost: 110 },
    { name: "Snack", title: "Greek Yogurt with Mixed Berries & Almonds", cal: 240, p: 18, c: 22, f: 8, cost: 35 },
    { name: "Dinner", title: "Baked Salmon Fillet with Asparagus & Basmati", cal: 640, p: 45, c: 55, f: 22, cost: 90 }
  ];

  const vegMeals = [
    { name: "Breakfast", title: "Spiced Tofu Bhurji with Whole Wheat Toast", cal: 310, p: 22, c: 24, f: 12, cost: 35 },
    { name: "Lunch", title: "Lentil Dal Tadka with Brown Rice & Spinach Salad", cal: 540, p: 28, c: 75, f: 10, cost: 50 },
    { name: "Snack", title: "Roasted Chickpeas & Cucumber Whey Shake", cal: 260, p: 25, c: 20, f: 6, cost: 40 },
    { name: "Dinner", title: "Paneer Tikka Skewers with Mint Chutney & Quinoa", cal: 610, p: 32, c: 45, f: 28, cost: 85 }
  ];

  let meals = diet === "veg" ? vegMeals : nonVegMeals;

  // Adapt based on target (fat-loss vs muscle-gain)
  if (target === "fat-loss") {
    meals = meals.map((m) => ({
      ...m,
      cal: Math.round(m.cal * 0.85),
      c: Math.round(m.c * 0.7),
      f: Math.round(m.f * 0.8)
    }));
  }

  const totalCost = meals.reduce((sum, m) => sum + m.cost, 0);

  const plan = {
    title: `${target.toUpperCase().replace("-", " ")} ${diet.toUpperCase()} Plan`,
    totalCalories: meals.reduce((sum, m) => sum + m.cal, 0),
    protein: meals.reduce((sum, m) => sum + m.p, 0),
    carbs: meals.reduce((sum, m) => sum + m.c, 0),
    fat: meals.reduce((sum, m) => sum + m.f, 0),
    meals,
    dailyCost: totalCost,
    weeklyCost: totalCost * 7,
    reasoning: `High protein plan compiled for ${target} objectives. Formulated to meet standard ${diet} guidelines on a budget of ₹${budget}/day.`
  };

  return NextResponse.json(plan);
}
