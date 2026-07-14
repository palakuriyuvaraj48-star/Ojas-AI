import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message?.toLowerCase() || "";

    let reply = "🥗 Consistency creates compound dietary adjustments. Keep meals balanced with adequate protein and hydration.";

    if (message.includes("leg day")) {
      reply = "🍗 Post-leg-day requires rapid protein synthesis and glycogen replenishment. I recommend a high-protein bowl containing 40g+ protein (e.g. salmon or grilled chicken) paired with complex carbs like sweet potatoes and 500ml water.";
    } else if (message.includes("eggs and rice")) {
      reply = "🍳 Perfect! You have the foundation for a 'Quick Egg & Rice Bhurji Bowl'. Scramble 2 eggs, toss in 1 cup cooked rice, add turmeric/chili powder, and enjoy 420 kcal, 22g protein, and 45g carbs.";
    } else if (message.includes("300")) {
      reply = "💰 ₹300 Weekly Budget Plan generated: \n- Breakfast: Tofu/Egg bhurji with roti (₹35)\n- Lunch: Lentil dal with brown rice & salad (₹50)\n- Snack: Roasted chickpeas (₹25)\n- Dinner: Paneer/Egg bhurji with basmati (₹65).\nTotal daily budget: ₹175, leaving ₹125/day for grocery reserves.";
    } else if (message.includes("vegetarian") || message.includes("veg")) {
      reply = "🌱 High-protein vegetarian recommendations:\n- Paneer Tikka Skewers (32g protein)\n- Lentil Dal Tadka with Quinoa (28g protein)\n- Greek Yogurt/Soy shake with chia seeds (25g protein).";
    } else if (message.includes("pizza")) {
      reply = "🍕 Yes, you can fit pizza into today's calorie limit! Since you have 850 kcal remaining, 2 slices of thin-crust vegetable pizza (approx 520 kcal) fits. Retain 30g protein target for the rest of your meals today.";
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
