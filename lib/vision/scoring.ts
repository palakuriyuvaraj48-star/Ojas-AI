import type { ExerciseDefinition, FormFeedback, FormScore, LiveCoaching } from "./types";
import { scoreRep, type RepScoreInput } from "./form-analysis";

export interface RepResultSummary {
  score: number;
  rom: number; // observed range
  symmetryIndex: number;
  partial: boolean;
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

// Aggregate a set of rep results into a single FormScore with an explanation.
export function buildFormScore(reps: RepResultSummary[], exercise: ExerciseDefinition): FormScore {
  if (reps.length === 0) {
    return {
      total: 0,
      metrics: { stability: 0, consistency: 0, tempo: 0, control: 0, rangeOfMotion: 0 },
      explanation: ["Complete at least one rep to generate a form score."],
    };
  }
  const avg = (sel: (r: RepResultSummary) => number) => reps.reduce((a, r) => a + sel(r), 0) / reps.length;
  const stability = avg((r) => r.symmetryIndex * 100);
  const rangeOfMotion = Math.min(100, (avg((r) => r.rom) / exercise.expectedRom) * 100);
  const control = avg((r) => r.score);
  const consistency = 100 - Math.min(40, stdev(reps.map((r) => r.score)) * 3);
  const tempo = 82; // derived per-rep in live mode; default for set summary

  const metrics = {
    stability: Math.round(stability),
    consistency: Math.round(consistency),
    tempo,
    control: Math.round(control),
    rangeOfMotion: Math.round(rangeOfMotion),
  };
  const total = Math.round(
    metrics.stability * 0.2 +
    metrics.consistency * 0.2 +
    metrics.tempo * 0.2 +
    metrics.control * 0.2 +
    metrics.rangeOfMotion * 0.2
  );

  const explanation = [
    `Stability ${metrics.stability}/100 — left/right balance and torso steadiness.`,
    `Consistency ${metrics.consistency}/100 — how uniform your reps were.`,
    `Tempo ${metrics.tempo}/100 — controlled lowering and lifting.`,
    `Control ${metrics.control}/100 — how well you held the movement path.`,
    `Range of motion ${metrics.rangeOfMotion}/100 — depth vs the target for ${exercise.name}.`,
  ];
  return { total, metrics, explanation };
}

// Build actionable AI coaching from the reps performed this set.
export function buildCoaching(
  reps: RepResultSummary[],
  exercise: ExerciseDefinition,
  feedback: FormFeedback[] = []
): LiveCoaching {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const corrections: string[] = [];

  if (reps.length === 0) {
    return {
      strengths: ["Ready to start — set up in frame and begin."],
      improvements: ["Perform a few reps so we can analyze your technique."],
      corrections: [exercise.cues[0] ?? "Brace your core and move with control."],
      summary: "No reps recorded yet.",
    };
  }

  const avgScore = reps.reduce((a, r) => a + r.score, 0) / reps.length;
  const avgRom = reps.reduce((a, r) => a + r.rom, 0) / reps.length;
  const avgSym = reps.reduce((a, r) => a + r.symmetryIndex, 0) / reps.length;
  const partials = reps.filter((r) => r.partial).length;

  if (avgRom >= exercise.expectedRom * 0.9) strengths.push("Excellent range of motion — you're hitting full depth.");
  else improvements.push("Increase your range of motion to reach the target depth.");

  if (avgSym >= 0.92) strengths.push("Great left/right symmetry.");
  else improvements.push("Work on evening out left and right side movement.");

  if (avgScore >= 85) strengths.push("Strong overall control and technique.");
  else improvements.push("Focus on a smoother, more controlled movement path.");

  if (partials > 0) improvements.push(`${partials} partial rep${partials > 1 ? "s" : ""} detected — aim for full range.`);

  // Pull the standout correction from live feedback, else use exercise cues.
  const danger = feedback.find((f) => f.severity === "danger");
  const warning = feedback.find((f) => f.severity === "warning");
  if (danger?.cue) corrections.push(danger.cue);
  else if (warning?.cue) corrections.push(warning.cue);
  if (exercise.cues[1] && corrections.length < 2) corrections.push(exercise.cues[1]);

  const summary = `You completed ${reps.length} rep${reps.length > 1 ? "s" : ""} of ${exercise.name} with a ${avgScore.toFixed(0)}/100 form score. ${
    strengths[0] ?? "Keep building consistency."
  } ${corrections[0] ?? ""}`;

  return { strengths, improvements, corrections, summary };
}

// Reuse the single-rep scorer for API endpoints.
export function analyzeSingleRep(input: RepScoreInput, exercise: ExerciseDefinition) {
  return scoreRep(input, exercise);
}
