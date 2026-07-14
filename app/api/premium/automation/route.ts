import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    templates: [
      { id: "wt1", name: "CNS Overreaching Deload", trigger: "Sleep < 70%", action: "Reduce Workout Intensity 20%", active: true },
      { id: "wt2", name: "Ankle Mobility Stretching", trigger: "Form Score < 80%", action: "Send mobility flossing reminder", active: false },
      { id: "wt3", name: "Calorie surplus loading", trigger: "Recovery Score > 85%", action: "Increase calories 200 kcal", active: true },
    ],
  };
  return NextResponse.json(payload);
}
