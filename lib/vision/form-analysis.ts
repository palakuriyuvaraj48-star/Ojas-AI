import type {
  ExerciseDefinition, FormFeedback, QualityMetrics, RomState, SymmetryState, TempoRep,
} from "./types";

// Maps a rule's joint to supportive coaching language.
const MESSAGES: Record<string, { good: string; bad: string; warn: string }> = {
  knee: { good: "Knees are tracking well over the toes.", bad: "Avoid knees collapsing inward — keep them aligned.", warn: "Keep the knees out and tracking the toes." },
  hip: { good: "Strong, controlled hip drive.", bad: "Hinge deeper through the hips for full range.", warn: "Push the hips back a touch more." },
  torso: { good: "Your back is staying neutral.", bad: "Keep your back more neutral — avoid rounding.", warn: "Brace your core and keep the chest up." },
  elbow: { good: "Clean elbow extension.", bad: "Control the elbow path and lockout.", warn: "Tighten the elbow position." },
  shoulder: { good: "Shoulders are controlled and stable.", bad: "Keep the shoulder blades set and steady.", warn: "Set the scapula and stay tight." },
  spine: { good: "Core is braced — no sagging.", bad: "Don't let the hips sag; keep a straight line.", warn: "Glue the ribs to the hips and squeeze the glutes." },
  ankle: { good: "Stable base through the feet.", bad: "Keep the heels grounded.", warn: "Press through the mid-foot." },
};

function messageFor(joint: string): { good: string; bad: string; warn: string } {
  const key = Object.keys(MESSAGES).find((k) => joint.startsWith(k)) ?? "torso";
  return MESSAGES[key];
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export interface RuleEvaluation {
  avg: number; // 0..1 adherence
  feedback: FormFeedback[];
  deepest: Record<string, number>;
}

let feedbackSeq = 0;
function fbId() {
  feedbackSeq += 1;
  return `fb_${feedbackSeq}`;
}

export function evaluateRules(angles: Record<string, number>, exercise: ExerciseDefinition): RuleEvaluation {
  let sum = 0;
  const feedback: FormFeedback[] = [];
  const deepest: Record<string, number> = {};
  for (const rule of exercise.rules) {
    const value = angles[rule.joint];
    if (value == null) continue;
    const dev = Math.abs(value - rule.bottomAngle);
    const score = clamp01(1 - dev / (rule.tolerance * 2));
    sum += score;
    deepest[rule.joint] = value;
    const msg = messageFor(rule.joint);
    if (score < 0.45) {
      feedback.push({ id: fbId(), severity: "danger", message: msg.bad, joint: asJoint(rule.joint), cue: exercise.cues[0] });
    } else if (score < 0.8) {
      feedback.push({ id: fbId(), severity: "warning", message: msg.warn, joint: asJoint(rule.joint), cue: exercise.cues[1] ?? exercise.cues[0] });
    } else if (feedback.length < 1) {
      feedback.push({ id: fbId(), severity: "success", message: msg.good });
    }
  }
  return { avg: exercise.rules.length ? sum / exercise.rules.length : 1, feedback, deepest };
}

function asJoint(name: string): FormFeedback["joint"] {
  const map: Record<string, FormFeedback["joint"]> = {
    kneeL: "leftKnee", kneeR: "rightKnee", kneeAngle: "leftKnee",
    hipL: "leftHip", hipR: "rightHip", hipAngle: "leftHip",
    elbowL: "leftElbow", elbowR: "rightElbow", elbowAngle: "leftElbow",
    shoulderL: "leftShoulder", shoulderR: "rightShoulder", shoulderAngle: "leftShoulder",
    torso: "spine", spine: "spine", ankleL: "leftAnkle", ankleR: "rightAnkle",
  };
  return map[name];
}

// Live feedback for the current frame (does not require a completed rep).
export function liveFeedback(angles: Record<string, number>, exercise: ExerciseDefinition): FormFeedback[] {
  return evaluateRules(angles, exercise).feedback;
}

export interface RepScoreInput {
  angles: Record<string, number>;
  rom?: RomState | null;
  symmetry?: SymmetryState | null;
  tempo?: TempoRep | null;
}

export interface RepScore {
  metrics: QualityMetrics;
  score: number;
  feedback: FormFeedback[];
}

export function scoreRep(input: RepScoreInput, exercise: ExerciseDefinition): RepScore {
  const { angles, rom, symmetry, tempo } = input;
  const evalRes = evaluateRules(angles, exercise);

  const romScore = rom ? rom.completeness * 100 : deriveRomScore(angles, exercise);
  const control = evalRes.avg * 100;

  const torsoRule = exercise.rules.find((r) => r.joint === "torso");
  const torsoDev = torsoRule ? clamp01(Math.abs((angles.torso ?? 0) - torsoRule.bottomAngle) / (torsoRule.tolerance * 2)) : 0;
  const sym = symmetry ? symmetry.symmetryIndex : 1;
  const stability = 100 * (0.7 * sym + 0.3 * (1 - torsoDev));

  const tempoScore = tempo ? tempoScoreFrom(tempo) : 82;

  const metrics: QualityMetrics = {
    stability: Math.round(stability),
    consistency: Math.round(control),
    tempo: Math.round(tempoScore),
    control: Math.round(control),
    rangeOfMotion: Math.round(romScore),
  };

  const total = Math.round(
    metrics.stability * 0.2 +
    metrics.consistency * 0.2 +
    metrics.tempo * 0.2 +
    metrics.control * 0.2 +
    metrics.rangeOfMotion * 0.2
  );

  return { metrics, score: total, feedback: evalRes.feedback };
}

function deriveRomScore(angles: Record<string, number>, exercise: ExerciseDefinition): number {
  const v = angles[exercise.primaryJoint];
  if (v == null) return 70;
  const range = Math.abs(exercise.repTopAngle - v);
  return Math.min(100, Math.round((range / exercise.expectedRom) * 100));
}

function tempoScoreFrom(tempo: TempoRep): number {
  const lowering = tempo.loweringMs || 1;
  const lifting = tempo.liftingMs || 1;
  const ratio = Math.min(lowering, lifting) / Math.max(lowering, lifting);
  let score = ratio * 100;
  // Penalize very fast reps (under ~450ms per phase).
  const fast = Math.min(lowering, lifting);
  if (fast < 450) score -= (450 - fast) * 0.1;
  return Math.max(0, Math.min(100, score));
}

export function scoreFromAngles(angles: Record<string, number>, exercise: ExerciseDefinition): RepScore {
  return scoreRep({ angles }, exercise);
}
