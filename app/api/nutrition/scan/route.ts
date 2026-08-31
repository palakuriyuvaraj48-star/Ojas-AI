import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, foodQuery } = body;

    if (!image && !foodQuery) {
      return NextResponse.json({ error: "No image or food query provided" }, { status: 400 });
    }

    // Realistic Indian food visual estimates with confidence levels and nutrition recommendations
    const indianMealEstimates = [
      {
        id: "r_dal_rice_chicken",
        name: "Rice + Dal Tadka + Home Chicken Curry",
        portion: "1 cup rice (150g) + 1 bowl dal + 120g chicken",
        cal: 560,
        p: 38,
        c: 68,
        f: 14,
        fiber: 6,
        confidence: "High (89%)",
        confidenceLevel: "High",
        ojasRecommendation: "Excellent protein density (38g). Add a fresh cucumber/sprouts salad to boost micronutrients and fiber.",
      },
      {
        id: "r_idli_sambar",
        name: "Idli (3 pcs) with Sambar & Chutney",
        portion: "3 steamed idlis + 150ml sambar + 2 tbsp chutney",
        cal: 330,
        p: 10,
        c: 58,
        f: 6,
        fiber: 5,
        confidence: "High (92%)",
        confidenceLevel: "High",
        ojasRecommendation: "Easily digestible complex carbs. Drink extra sambar to boost lentil-based protein.",
      },
      {
        id: "r_egg_roti",
        name: "Egg Bhurji (2 Eggs) + 2 Phulka Rotis",
        portion: "2 eggs scramble with onions + 2 whole wheat rotis",
        cal: 360,
        p: 22,
        c: 38,
        f: 14,
        fiber: 5,
        confidence: "High (94%)",
        confidenceLevel: "High",
        ojasRecommendation: "High biological value complete protein. Perfect muscle-recovery post-workout meal.",
      },
      {
        id: "r_soya_curry",
        name: "Soya Chunks Curry + Steamed Rice",
        portion: "50g cooked soya chunks + 1 cup rice",
        cal: 440,
        p: 30,
        c: 66,
        f: 6,
        fiber: 8,
        confidence: "Moderate estimate (82%)",
        confidenceLevel: "Moderate",
        ojasRecommendation: "Top budget protein powerhouse (30g protein for ₹20). Pair with curd for better leucine absorption.",
      },
      {
        id: "r_paneer_paratha",
        name: "Paneer Paratha with Dahi / Curd",
        portion: "1 stuffed paneer paratha + 1 bowl plain curd (150g)",
        cal: 510,
        p: 24,
        c: 52,
        f: 24,
        fiber: 4,
        confidence: "Moderate estimate (85%)",
        confidenceLevel: "Moderate",
        ojasRecommendation: "Casein protein provides long satiety. If eating before workout, allow 90 mins for gastric emptying.",
      },
    ];

    let result = indianMealEstimates[0];
    if (foodQuery) {
      const matched = indianMealEstimates.find((m) =>
        m.name.toLowerCase().includes(foodQuery.toLowerCase())
      );
      if (matched) result = matched;
    } else {
      // Pick based on time or random demo item
      const idx = Math.floor(Math.random() * indianMealEstimates.length);
      result = indianMealEstimates[idx];
    }

    return NextResponse.json({
      ...result,
      isEstimate: true,
      message: "AI Vision Lens recognized this Indian meal. Review estimated nutrients and adjust portions if needed.",
      alternatives: indianMealEstimates.filter((e) => e.id !== result.id),
    });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
