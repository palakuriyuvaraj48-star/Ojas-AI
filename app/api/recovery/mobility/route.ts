import { NextResponse } from "next/server";
import { generateMobilityPlan } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("target") || "general";
  const timeAvailable = parseInt(searchParams.get("time") || "15", 10);
  const sorenessParam = searchParams.get("soreness");
  const soreness = sorenessParam ? sorenessParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const plan = generateMobilityPlan(target, timeAvailable, soreness);
  return NextResponse.json(plan);
}
