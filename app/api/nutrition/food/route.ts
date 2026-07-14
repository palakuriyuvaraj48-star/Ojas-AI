import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  const FOODS_DB = [
    { id: "f1", name: "Scrambled Eggs with Spinach", cal: 320, p: 24, c: 8, f: 18, fiber: 2, sugar: 1, sodium: "320mg", category: "Breakfast" },
    { id: "f2", name: "Grilled Salmon bowl with Rice", cal: 620, p: 44, c: 55, f: 22, fiber: 3, sugar: 2, sodium: "480mg", category: "Lunch" },
    { id: "f3", name: "Tandoori Chicken Tikka Bowl", cal: 480, p: 42, c: 28, f: 14, fiber: 4, sugar: 3, sodium: "720mg", category: "Dinner" },
    { id: "f4", name: "Paneer Makhani with Butter Naan", cal: 820, p: 22, c: 88, f: 44, fiber: 5, sugar: 8, sodium: "980mg", category: "Dinner" },
    { id: "f5", name: "Avocado Chicken Quinoa Salad", cal: 510, p: 35, c: 32, f: 22, fiber: 8, sugar: 3, sodium: "420mg", category: "Lunch" },
    { id: "f6", name: "Greek Yogurt with Berries", cal: 240, p: 18, c: 28, f: 6, fiber: 3, sugar: 15, sodium: "80mg", category: "Snack" },
    { id: "f7", name: "Oatmeal with Banana", cal: 380, p: 12, c: 62, f: 8, fiber: 6, sugar: 12, sodium: "150mg", category: "Breakfast" },
    { id: "f8", name: "Chicken Breast (grilled)", cal: 280, p: 52, c: 0, f: 6, fiber: 0, sugar: 0, sodium: "380mg", category: "Protein" },
    { id: "f9", name: "Lentil Dal Tadka", cal: 340, p: 18, c: 48, f: 6, fiber: 10, sugar: 4, sodium: "520mg", category: "Lunch" },
    { id: "f10", name: "Protein Whey Shake", cal: 160, p: 30, c: 8, f: 2, fiber: 0, sugar: 2, sodium: "120mg", category: "Snack" },
  ];

  let results = FOODS_DB;
  if (query) {
    results = results.filter((f) => f.name.toLowerCase().includes(query));
  }

  return NextResponse.json(results);
}
