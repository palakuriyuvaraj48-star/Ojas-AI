import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ingredients = searchParams.get("ingredients")?.toLowerCase() || "";

  // Curated AI Recipe list based on matching inputs
  const recipeList = [
    {
      title: "Quick Egg & Rice Bhurji Bowl",
      ingredientsMatched: ["eggs", "rice"],
      cal: 420,
      p: 22,
      c: 45,
      f: 12,
      time: "10 mins",
      instructions: [
        "Heat 1 tsp oil in a pan, add chopped onions and green chilies.",
        "Scramble 2 eggs in the pan with salt and turmeric.",
        "Stir in 1 cup cooked rice and toss together for 3 minutes.",
        "Garnish with coriander and serve hot."
      ],
      substitution: "Swap white rice for millet or brown rice for higher fiber."
    },
    {
      title: "Greek Yogurt Oatmeal Bowl",
      ingredientsMatched: ["yogurt", "oats"],
      cal: 380,
      p: 24,
      c: 50,
      f: 6,
      time: "5 mins",
      instructions: [
        "Mix 1/2 cup rolled oats with 1/2 cup hot water.",
        "Stir in 150g greek yogurt and sweeten with honey.",
        "Top with chia seeds, banana slices, or sliced almonds."
      ],
      substitution: "Use soy yogurt for a vegan alternative."
    }
  ];

  let results = recipeList;
  if (ingredients) {
    const ingArr = ingredients.split(",");
    results = results.filter((r) =>
      r.ingredientsMatched.some((im) => ingArr.some((i) => i.trim().includes(im)))
    );
  }

  // Fallback if no matching ingredients found
  if (results.length === 0) {
    results = [recipeList[0]];
  }

  return NextResponse.json(results);
}
