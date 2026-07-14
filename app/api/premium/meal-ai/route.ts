import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    meals: {
      breakfast: { name: "Ragi Malt & Almond Butter Shake", calories: 420, protein: 22, carbs: 45, fat: 12 },
      lunch: { name: "South Indian Paneer Bhurji & Brown Rice", calories: 650, protein: 35, carbs: 68, fat: 18 },
      dinner: { name: "Tofu Palak Paneer & Multigrain Rotis", calories: 510, protein: 30, carbs: 55, fat: 14 },
    },
    weeklyCost: "Estimated weekly grocery: ₹1,800",
    localIngredients: ["Soya chunks as replacement for high-priced tofu", "Sattu flour as protein shakes replacement"],
  };
  return NextResponse.json(payload);
}
