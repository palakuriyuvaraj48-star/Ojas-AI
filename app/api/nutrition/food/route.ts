import { NextResponse } from "next/server";
import { searchIndianFoods, INDIAN_FOODS_DATABASE } from "@/lib/nutrition/indian-food-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  if (query) {
    const results = searchIndianFoods(query, 25).map((f) => ({
      id: f.id,
      name: f.name,
      regionalName: f.regionalName,
      cal: f.calories,
      p: f.proteinGrams,
      c: f.carbsGrams,
      f: f.fatGrams,
      fiber: f.fiberGrams,
      cost: f.estimatedCostINR,
      category: f.category,
      region: f.region,
      ojasTip: f.ojasTip,
      isBudgetFriendly: f.isBudgetFriendly,
      isHostelStaple: f.isHostelStaple,
    }));
    return NextResponse.json(results);
  }

  // Return curated Indian staples by default
  const defaultFoods = INDIAN_FOODS_DATABASE.slice(0, 20).map((f) => ({
    id: f.id,
    name: f.name,
    regionalName: f.regionalName,
    cal: f.calories,
    p: f.proteinGrams,
    c: f.carbsGrams,
    f: f.fatGrams,
    fiber: f.fiberGrams,
    cost: f.estimatedCostINR,
    category: f.category,
    region: f.region,
    ojasTip: f.ojasTip,
    isBudgetFriendly: f.isBudgetFriendly,
    isHostelStaple: f.isHostelStaple,
  }));

  return NextResponse.json(defaultFoods);
}
