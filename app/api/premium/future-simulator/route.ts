import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    predictions: {
      "30days": { weight: 77.2, fat: 21.8, muscle: 0.4 },
      "90days": { weight: 75.5, fat: 20.2, muscle: 1.1 },
      "6months": { weight: 72.8, fat: 17.5, muscle: 1.9 },
      "12months": { weight: 70.0, fat: 15.0, muscle: 3.2 },
    },
    drivers: "Your projected fat loss is mainly driven by your current calorie deficit, workout consistency, and sleep quality.",
    confidence: 89,
  };
  return NextResponse.json(payload);
}
