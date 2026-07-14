import { NextResponse } from "next/server";
import { generateRestDayPlan, defaultSignals } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recoveryScore = parseInt(searchParams.get("score") || "70", 10);
  const fatigue = parseInt(searchParams.get("fatigue") || "40", 10);
  const hrvParam = searchParams.get("hrv");
  const hrv = hrvParam ? parseInt(hrvParam, 10) : defaultSignals().hrv;

  const plan = generateRestDayPlan(recoveryScore, fatigue, hrv);
  return NextResponse.json(plan);
}
