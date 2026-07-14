import { NextResponse } from "next/server";

// Simulated memory store for workout logs
let workoutLogs = [
  {
    id: "log_1",
    title: "Hypertrophy Upper Body Pull",
    date: "July 10, 2026",
    duration: 45,
    calories: 340,
    exercisesCompleted: 4,
    volumeLogged: 3420 // kg
  },
  {
    id: "log_2",
    title: "Lower Body Conditioning Split",
    date: "July 08, 2026",
    duration: 40,
    calories: 290,
    exercisesCompleted: 3,
    volumeLogged: 2980 // kg
  }
];

export async function GET() {
  return NextResponse.json(workoutLogs);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLog = {
      id: `log_${Date.now()}`,
      title: body.title || "Custom Workout Session",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      duration: parseInt(body.duration) || 30,
      calories: parseInt(body.calories) || 200,
      exercisesCompleted: parseInt(body.exercisesCompleted) || 3,
      volumeLogged: parseInt(body.volumeLogged) || 1200
    };
    workoutLogs.unshift(newLog);
    return NextResponse.json({ success: true, log: newLog });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
