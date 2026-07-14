import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const diet = searchParams.get("diet") || "non-veg";
  const budget = parseInt(searchParams.get("budget") || "300");
  const goal = searchParams.get("goal") || "muscle-gain";

  const nonVegRestaurants = [
    {
      id: "1",
      restaurant: "FreshMenu",
      dish: "Tandoori Chicken Bowl",
      calories: 580,
      protein: 48,
      carbs: 42,
      fat: 16,
      sodium: "680mg",
      portion: "Regular bowl",
      price: 285,
      healthierAlternative: "Ask for no naan + double vegetables",
      notes: "Grilled, not fried. High-protein, moderate-carb. Good post-workout option.",
    },
    {
      id: "2",
      restaurant: "BELL TACOS",
      dish: "Grilled Chicken Tacos",
      calories: 520,
      protein: 42,
      carbs: 48,
      fat: 16,
      sodium: "920mg",
      portion: "2 soft tacos",
      price: 320,
      healthierAlternative: "Corn tortillas instead of flour",
      notes: "Skip the sour cream. Add extra salsa and guacamole for healthy fats.",
    },
    {
      id: "3",
      restaurant: "McDonald's",
      dish: "Grilled Chicken Artisan",
      calories: 380,
      protein: 36,
      carbs: 32,
      fat: 10,
      sodium: "780mg",
      portion: "1 sandwich",
      price: 220,
      healthierAlternative: "Skip the sugary sauce",
      notes: "Best fast-food protein option. Order as a meal - choose side salad instead of fries.",
    },
  ];

  const vegRestaurants = [
    {
      id: "4",
      restaurant: "Chai Point",
      dish: "Paneer Wrap",
      calories: 480,
      protein: 22,
      carbs: 56,
      fat: 18,
      sodium: "720mg",
      portion: "1 wrap",
      price: 180,
      healthierAlternative: "Pair with protein-rich chai instead of sugary drinks",
      notes: "Paneer provides slow-digesting casein. Good dinner option.",
    },
    {
      id: "5",
      restaurant: "Subway",
      dish: "Veggie Delite Salad",
      calories: 140,
      protein: 8,
      carbs: 18,
      fat: 3,
      sodium: "380mg",
      portion: "6-inch sub as salad",
      price: 150,
      healthierAlternative: "Add egg or chicken for +15g protein",
      notes: "Low calorie. Perfect for fat-loss days. Add healthy fats from avocado.",
    },
    {
      id: "6",
      restaurant: "Domino's",
      dish: "Farmhouse Pizza (thin crust)",
      calories: 420,
      protein: 18,
      carbs: 52,
      fat: 16,
      sodium: "840mg",
      portion: "1 slice (regular pizza)",
      price: 95,
      healthierAlternative: "1 slice instead of 2; pair with side salad",
      notes: "Cheat meal friendly. Consume 1 slice and balance the rest of the day with protein.",
    },
  ];

  const restaurants = diet === "veg" ? vegRestaurants : nonVegRestaurants;

  const budgetFriendly = restaurants.filter((r) => r.price <= budget).sort((a, b) => a.price - b.price);

  return NextResponse.json({
    diet,
    budget,
    goal,
    recommended: budgetFriendly,
    allOptions: restaurants,
    budgetAnalysis: {
      dailyRemaining: budget - budgetFriendly[0]?.price,
      weeklyPotential: (budget - budgetFriendly[0]?.price) * 6,
    },
    smartSwaps: diet === "non-veg"
      ? ["Swap naan for roti to save 120 kcal and 8g fat", "Ask for sauce on the side — saves ~80 kcal", "Choose grilled over tandoori to reduce fat by 25%"]
      : ["Add paneer cubes to veg salads for +15g protein", "Swap white rice for brown or millet", "Choose lentil soup instead of creamy dal makhani"],
  });
}
