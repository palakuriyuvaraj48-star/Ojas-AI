import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "weekly";

  const weeklyData = [
    { day: "Mon", consumed: 2100, target: 2350, protein: 155, carbs: 230, fat: 72 },
    { day: "Tue", consumed: 2280, target: 2350, protein: 168, carbs: 245, fat: 78 },
    { day: "Wed", consumed: 2040, target: 2350, protein: 142, carbs: 210, fat: 68 },
    { day: "Thu", consumed: 2410, target: 2350, protein: 172, carbs: 260, fat: 82 },
    { day: "Fri", consumed: 2300, target: 2350, protein: 160, carbs: 240, fat: 75 },
    { day: "Sat", consumed: 2450, target: 2350, protein: 175, carbs: 255, fat: 80 },
    { day: "Sun", consumed: 2120, target: 2350, protein: 148, carbs: 220, fat: 70 },
  ];

  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      day: d.toLocaleDateString([], { month: "short", day: "numeric" }),
      consumed: 2000 + Math.floor(Math.random() * 600),
      target: 2350,
      protein: 140 + Math.floor(Math.random() * 50),
      carbs: 200 + Math.floor(Math.random() * 80),
      fat: 65 + Math.floor(Math.random() * 25),
    };
  });

  const scores = [
    { label: "Protein Adequacy", score: 82, color: "bg-emerald-400" },
    { label: "Carbohydrate Balance", score: 76, color: "bg-yellow-400" },
    { label: "Fat Distribution", score: 88, color: "bg-[#adc6ff]" },
    { label: "Hydration", score: 65, color: "bg-cyan-400" },
    { label: "Fiber Intake", score: 58, color: "bg-amber-400" },
    { label: "Micronutrient Diversity", score: 71, color: "bg-violet-400" },
  ];

  const aiInsight =
    "Your protein intake is consistently strong this week. However, fiber intake dropped 23% compared to last week — add a serving of lentils or spinach to your lunch to hit your 28g daily target. Hydration needs improvement on training days (you lose ~750mL per session).";

  return NextResponse.json({
    period,
    calories: {
      trend: period === "weekly" ? weeklyData.map((d) => ({ day: d.day, consumed: d.consumed, target: d.target })) : monthlyData.map((d) => ({ day: d.day, consumed: d.consumed, target: d.target })),
      averageConsumed: 2300,
      averageTarget: 2350,
      adherenceRate: 82,
    },
    macros: {
      trend: period === "weekly" ? weeklyData.map((d) => ({ day: d.day, protein: d.protein, carbs: d.carbs, fat: d.fat })) : monthlyData.map((d) => ({ day: d.day, protein: d.protein, carbs: d.carbs, fat: d.fat })),
      avgProtein: 160,
      avgCarbs: 230,
      avgFat: 75,
    },
    water: {
      trend: period === "weekly" ? weeklyData.map((d) => ({ day: d.day, amount: 2.1 + Math.random() * 1.5 })) : monthlyData.map((d) => ({ day: d.day, amount: 2.0 + Math.random() * 1.8 })),
      average: 2.4,
      target: 3.2,
    },
    nutritionScores: scores,
    nutritionScore: 73,
    mealConsistency: 86,
    budget: { used: 1240, total: 1750 },
    topFoods: [
      { name: "Grilled Chicken Breast", count: 8 },
      { name: "Brown Rice", count: 6 },
      { name: "Spinach Salad", count: 5 },
      { name: "Greek Yogurt", count: 5 },
      { name: "Eggs", count: 4 },
    ],
    deficiencies: [
      { name: "Vitamin D", current: 320, target: 600, unit: "IU", status: "low", percent: 53 },
      { name: "Magnesium", current: 220, target: 400, unit: "mg", status: "deficient", percent: 55 },
      { name: "Fiber", current: 18, target: 28, unit: "g", status: "low", percent: 64 },
      { name: "Vitamin C", current: 85, target: 90, unit: "mg", status: "optimal", percent: 94 },
    ],
    aiInsight,
  });
}
