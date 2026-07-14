import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    risk: {
      overall: "Yellow",
      percentage: 28,
      regions: {
        shoulders: 15,
        back: 32,
        knees: 45,
        hips: 12,
        ankles: 8,
        wrists: 14,
      },
    },
    recommendations: {
      deload: "Reduce squat volume by 20% for 7 days.",
      mobility: ["Ankle dorsiflexion stretch", "Couch stretch"],
      recovery: "Ensure 7.5+ hours of sleep and 3L+ hydration daily.",
    },
  };
  return NextResponse.json(payload);
}
