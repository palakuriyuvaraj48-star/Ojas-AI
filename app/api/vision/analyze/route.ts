import { NextResponse } from "next/server";
import { getExercise, scoreFromAngles, type RepScoreInput } from "@/lib/vision";

// POST /api/vision/analyze
// Stateless form analysis: given the current joint angles (and optional ROM /
// symmetry / tempo context) for an exercise, return a form score + feedback.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exerciseId = body.exerciseId || body.exercise || "squat";
    const exercise = getExercise(exerciseId);
    const angles: Record<string, number> = body.angles ?? {};
    if (!angles || Object.keys(angles).length === 0) {
      return NextResponse.json({ success: false, error: "Missing 'angles' for analysis." }, { status: 400 });
    }
    const input: RepScoreInput = {
      angles,
      rom: body.rom ?? null,
      symmetry: body.symmetry ?? null,
      tempo: body.tempo ?? null,
    };
    const result = scoreFromAngles(angles, exercise);
    return NextResponse.json({
      success: true,
      exercise: exercise.id,
      score: result.score,
      metrics: result.metrics,
      feedback: result.feedback,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Analysis failed." }, { status: 500 });
  }
}

// GET /api/vision/analyze?exerciseId=squat
// Returns the exercise definition's expected ranges for client-side setup.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get("exerciseId") || "squat";
  const exercise = getExercise(exerciseId);
  return NextResponse.json({ success: true, exercise });
}
