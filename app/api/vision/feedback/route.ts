import { NextResponse } from "next/server";
import { getExercise, buildCoaching, type RepResultSummary } from "@/lib/vision";

// POST /api/vision/feedback
// Generates AI-style coaching (strengths, improvements, corrections) for a set
// of completed reps. Deterministic rule engine — no external API required.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exerciseId = body.exerciseId || body.exercise || "squat";
    const exercise = getExercise(exerciseId);
    const reps: RepResultSummary[] = Array.isArray(body.reps) ? body.reps : [];
    const feedback = body.feedback || [];
    const coaching = buildCoaching(reps, exercise, feedback);
    return NextResponse.json({ success: true, exercise: exercise.id, coaching });
  } catch {
    return NextResponse.json({ success: false, error: "Coaching generation failed." }, { status: 500 });
  }
}
