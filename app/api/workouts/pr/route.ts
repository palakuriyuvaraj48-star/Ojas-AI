import { NextResponse } from "next/server";

let personalRecords = [
  { id: "pr_squat", exercise: "Barbell Back Squat", weight: 140, date: "July 05, 2026", type: "1RM" },
  { id: "pr_bench", exercise: "Barbell Bench Press", weight: 105, date: "July 02, 2026", type: "1RM" },
  { id: "pr_pullup", exercise: "Weighted Pull-Up", weight: 35, date: "June 28, 2026", type: "Max Weight" }
];

export async function GET() {
  return NextResponse.json(personalRecords);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPr = {
      id: `pr_${Date.now()}`,
      exercise: body.exercise || "Custom Lift",
      weight: parseInt(body.weight) || 50,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      type: body.type || "1RM"
    };
    personalRecords.unshift(newPr);
    return NextResponse.json({ success: true, pr: newPr });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
  }
}
