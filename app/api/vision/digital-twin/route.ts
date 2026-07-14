import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    scores: {
      health: 86,
      fitness: 88,
      strength: 85,
      recovery: 82,
      nutrition: 90,
      consistency: 94,
    },
    forecasts: {
      weightTrend: [
        { name: "Now", value: 78.5 },
        { name: "1 Wk", value: 78.1 },
        { name: "4 Wks", value: 77.0 },
        { name: "8 Wks", value: 75.8 },
        { name: "12 Wks", value: 74.5 },
        { name: "6 Mos", value: 72.0 },
      ],
      bodyFatTrend: [
        { name: "Now", value: 22.4 },
        { name: "1 Wk", value: 22.2 },
        { name: "4 Wks", value: 21.5 },
        { name: "8 Wks", value: 20.6 },
        { name: "12 Wks", value: 19.5 },
        { name: "6 Mos", value: 16.5 },
      ],
    },
    simulations: {
      moreWorkouts: {
        outcomes: "Estimated +12% bench press strength and -1.5% fat in 8 weeks.",
        tradeoff: "Increases fatigue score by 18%. Requires 8+ hours sleep to avoid overreaching.",
        confidence: 85,
      },
      moreSleep: {
        outcomes: "Accelerates recovery index by 25%. Decreases injury probability by 40%.",
        tradeoff: "Requires 30m earlier bedtimes.",
        confidence: 94,
      },
    },
  };

  return NextResponse.json(payload);
}
