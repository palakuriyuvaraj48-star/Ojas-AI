import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "muscle-gain";

  const standardGrocery = [
    { category: "Proteins", items: [
      { name: "Chicken Breast (1kg)", price: 280, alternative: "Tofu / Paneer" },
      { name: "Liquid Egg Whites (500ml)", price: 120, alternative: "Whole Eggs" },
      { name: "Greek Yogurt (1kg)", price: 180, alternative: "Soy Yogurt" }
    ]},
    { category: "Carbs & Grains", items: [
      { name: "Quinoa (500g)", price: 190, alternative: "Brown Rice" },
      { name: "Rolled Oats (1kg)", price: 140, alternative: "Local Millet" },
      { name: "Sweet Potato (1kg)", price: 60, alternative: "Basmati Rice" }
    ]},
    { category: "Vitamins & Greens", items: [
      { name: "Spinach Bunch", price: 30, alternative: "Local Amaranth" },
      { name: "Mixed Berries (Frozen, 500g)", price: 240, alternative: "Banana / Papaya" }
    ]}
  ];

  return NextResponse.json(standardGrocery);
}
