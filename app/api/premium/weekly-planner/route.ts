import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    plan: [
      { id: "p1", day: "Mon", type: "Workout", title: "Upper Body Strength Split", time: "07:00 AM", duration: "60 mins" },
      { id: "p2", day: "Tue", type: "Recovery", title: "Hip Flexor & Dorsiflexion Mobility", time: "08:00 AM", duration: "20 mins" },
      { id: "p3", day: "Wed", type: "Workout", title: "Lower Body Squat Volume", time: "07:00 AM", duration: "75 mins" },
      { id: "p4", day: "Thu", type: "Rest", title: "CNS Rest & restorative walk", time: "09:00 AM", duration: "45 mins" },
      { id: "p5", day: "Fri", type: "Workout", title: "Overhead Press Lockouts", time: "07:00 AM", duration: "60 mins" },
    ],
  };
  return NextResponse.json(payload);
}
