import { NextResponse } from "next/server";
import { MUSCLE_GROUPS } from "@/lib/recovery";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const muscle = searchParams.get("muscle") || "";

  const seed = [
    { id: "s1", date: new Date().toISOString().split("T")[0], muscle: "Quads", sorenessLevel: "medium", painScore: 6, recommendedAction: "Light stretching + foam rolling. Avoid heavy squats today." },
    { id: "s2", date: new Date(Date.now() - 86400000).toISOString().split("T")[0], muscle: "Chest", sorenessLevel: "low", painScore: 3, recommendedAction: "Bodyweight push-ups OK. Reduce pressing volume by 30%." },
    { id: "s3", date: new Date(Date.now() - 172800000).toISOString().split("T")[0], muscle: "Lats", sorenessLevel: "none", painScore: 1, recommendedAction: "Fully recovered. Safe for heavy pulldowns." },
  ];

  const logs = muscle ? seed.filter((l) => l.muscle.toLowerCase() === muscle.toLowerCase()) : seed;
  return NextResponse.json({ logs, availableMuscles: MUSCLE_GROUPS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { muscle, sorenessLevel, painScore, notes } = body;
    if (!muscle || !sorenessLevel || painScore === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const recommendedAction =
      painScore >= 8 ? "Full rest for this muscle group. Focus on mobility only."
      : painScore >= 5 ? "Light activity only. Stretching and foam rolling recommended."
      : "Active recovery OK. Reduce intensity by 20%.";
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      muscle,
      sorenessLevel,
      painScore,
      notes,
      recommendedAction,
    };
    return NextResponse.json(newLog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
