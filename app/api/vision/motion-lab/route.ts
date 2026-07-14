import { NextResponse } from "next/server";

export async function GET() {
  const payload = {
    dashboardScores: {
      movement: 87,
      technique: 88,
      consistency: 90,
      mobility: 78,
      stability: 84,
      balance: 92,
      symmetry: 94,
    },
    historyData: [
      { name: "Week 1", Squat: 82, Deadlift: 78, Bench: 80 },
      { name: "Week 2", Squat: 84, Deadlift: 80, Bench: 82 },
      { name: "Week 3", Squat: 85, Deadlift: 83, Bench: 85 },
      { name: "Week 4", Squat: 88, Deadlift: 86, Bench: 86 },
      { name: "Week 5", Squat: 86, Deadlift: 85, Bench: 88 },
      { name: "Week 6", Squat: 91, Deadlift: 92, Bench: 90 },
    ],
    heatmapJoints: {
      shoulders: { status: "Excellent", desc: "Stable shoulder girdle alignment." },
      hips: { status: "Review", desc: "Minor pelvic butt wink at bottom depth." },
      knees: { status: "Attention", desc: "Inward valgus cave under 80% load." },
      ankles: { status: "Attention", desc: "Dorsiflexion restriction limits parallel squats." },
    },
    weeklyReport: {
      period: "July 06 - July 12",
      avgFormScore: 88,
      comment: "Stance widening successfully reduced butt-wink angle. Knees caved slightly on high load reps.",
    },
    monthlyReport: {
      period: "June 2026 - July 2026",
      avgEfficiencyScore: 87,
      comment: "Squat depth range of motion increased by 18% over the past 30 days. Core stiffness has stabilized lateral torso sway.",
    },
  };

  return NextResponse.json(payload);
}
