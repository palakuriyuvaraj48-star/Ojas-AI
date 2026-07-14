import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    weeklyVolume: [
      { name: "Week 1", sets: 48, volume: 22400 },
      { name: "Week 2", sets: 52, volume: 23800 },
      { name: "Week 3", sets: 50, volume: 23100 },
      { name: "Week 4", sets: 54, volume: 24800 },
    ],
    milestones: {
      bestDay: "Tuesday",
      worstRecovery: "Sunday",
      highestDeficit: "Wednesday",
      longestStreak: "18 days",
    },
    summary: "This month your strength improved by 9%, but recovery declined due to reduced sleep.",
  };
  return NextResponse.json(payload);
}
