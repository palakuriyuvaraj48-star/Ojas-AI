import { NextResponse } from "next/server";
import { getExercise, buildCoaching, type RepResultSummary } from "@/lib/vision";
import { applyEventToTwin, createInitialTwin } from "@/lib/digital-twin/engine";
import { ClientProfile } from "@/types/profile";

// POST /api/vision/feedback
// Generates AI-style coaching (strengths, improvements, corrections) for a set
// of completed reps. Deterministic rule engine — no external API required.
// ALSO updates Digital Twin with form score signals for adaptive decision making.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const exerciseId = body.exerciseId || body.exercise || "squat";
    const exercise = getExercise(exerciseId);
    const reps: RepResultSummary[] = Array.isArray(body.reps) ? body.reps : [];
    const feedback = body.feedback || [];
    const coaching = buildCoaching(reps, exercise, feedback);

    // Calculate form score from reps
    const formScores = reps.map(r => r.score || 85);
    const avgFormScore = formScores.length > 0 
      ? Math.round(formScores.reduce((a, b) => a + b, 0) / formScores.length) 
      : 85;

    // Update Digital Twin with form score if twin provided
    let twinUpdate = null;
    if (body.twin) {
      const { updatedTwin, delta } = applyEventToTwin(body.twin, {
        id: `vision_form_${Date.now()}`,
        type: "FORM_SCORE_UPDATED",
        userId: body.twin.userId,
        timestamp: new Date().toISOString(),
        payload: {
          formScore: avgFormScore,
          exercise: exerciseId,
        },
      });
      twinUpdate = { updatedTwin, delta };
    }

    return NextResponse.json({ 
      success: true, 
      exercise: exercise.id, 
      coaching,
      formScore: avgFormScore,
      twinUpdate,
    });
  } catch (error: any) {
    console.error("[API /api/vision/feedback] Error:", error);
    return NextResponse.json({ success: false, error: "Coaching generation failed." }, { status: 500 });
  }
}
