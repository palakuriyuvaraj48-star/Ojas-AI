import { NextResponse } from "next/server";
import { getSessions } from "@/lib/vision/store";
import { computeAnalytics } from "@/lib/vision";

// GET /api/vision/analytics -> aggregated trends across stored sessions.
export async function GET() {
  const sessions = getSessions();
  const analytics = computeAnalytics(sessions);
  return NextResponse.json({ success: true, analytics });
}
