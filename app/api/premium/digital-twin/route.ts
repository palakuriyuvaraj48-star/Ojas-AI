import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    scores: {
      fitnessAge: 24,
      recoveryCapacity: 85,
      adaptability: 82,
      fatigueTolerance: 78,
      recoverySpeed: 88,
      consistency: 94,
    },
    predictions: {
      recoveryTomorrow: 88,
      fatigueTomorrow: 32,
      plateauProb: 15,
      dropoutRisk: 4,
    },
  };
  return NextResponse.json(payload);
}
