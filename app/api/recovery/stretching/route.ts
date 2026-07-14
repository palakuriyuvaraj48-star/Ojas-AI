import { NextResponse } from "next/server";
import { generateStretchingPlan } from "@/lib/recovery";
import type { StretchType } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "rest-day") as StretchType;
  const plan = generateStretchingPlan(type);
  return NextResponse.json(plan);
}
