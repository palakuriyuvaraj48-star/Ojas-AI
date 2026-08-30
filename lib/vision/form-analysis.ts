import type {
  ExerciseDefinition,
  FormFeedback,
  QualityMetrics,
  RomState,
  SymmetryState,
  TempoRep,
  JointName,
} from "./types";

export interface FormIssue {
  what: string;
  why: string;
  how: string;
  severity: "danger" | "warning" | "success" | "info";
  cue: string;
  joint?: JointName;
}

// Biomechanically grounded diagnostic rules with "What / Why / How" guidance.
const EXERCISE_SPECIFIC_RULES: Record<string, (angles: Record<string, number>, exercise: ExerciseDefinition) => FormIssue[]> = {
  squat: (angles, _ex) => {
    const issues: FormIssue[] = [];
    const kneeL = angles.kneeL ?? 180;
    const kneeR = angles.kneeR ?? 180;
    const kneeDiff = Math.abs(kneeL - kneeR);
    const torso = angles.torso ?? 0;
    const kneeAngle = angles.kneeAngle ?? 180;

    // 1. Knee Valgus / Asymmetry
    if (kneeDiff > 18) {
      issues.push({
        what: "Knees are moving inward unevenly (asymmetric knee valgus).",
        why: "Inward knee collapse places uneven stress on the patellofemoral joint and reduces glute engagement.",
        how: "Actively screw your feet into the floor and drive your knees outward in line with your toes.",
        severity: "danger",
        cue: "Drive your knees out over your toes",
        joint: kneeL < kneeR ? "leftKnee" : "rightKnee",
      });
    }

    // 2. Torso Lean
    if (torso > 38) {
      issues.push({
        what: "Excessive forward torso lean detected.",
        why: "Shifts mechanical load from the quadriceps onto the lumbar spine and lower back.",
        how: "Keep your chest proud, brace your core, and think of sitting between your heels rather than bending forward.",
        severity: "warning",
        cue: "Keep your chest proud and core braced",
        joint: "spine",
      });
    }

    // 3. Depth Check
    if (kneeAngle > 115) {
      issues.push({
        what: "Squat depth is above target parallel.",
        why: "Stopping too high misses full quad and glute activation through the complete strength curve.",
        how: "Lower your hips until your thighs are at least parallel with the floor while keeping your heels grounded.",
        severity: "warning",
        cue: "Descend until thighs reach parallel",
        joint: "leftKnee",
      });
    }

    return issues;
  },

  "push-up": (angles, _ex) => {
    const issues: FormIssue[] = [];
    const torso = angles.torso ?? 0;
    const elbowAngle = angles.elbowAngle ?? 160;
    const elbowDiff = Math.abs((angles.elbowL ?? 160) - (angles.elbowR ?? 160));

    // 1. Hip Sagging / Piking
    if (torso > 20) {
      issues.push({
        what: "Hips are sagging or piking out of alignment.",
        why: "Breaks the rigid plank leverage and places unnecessary shear force on the lower back.",
        how: "Squeeze your glutes, lock your abdominal wall, and maintain a straight line from ears to heels.",
        severity: "danger",
        cue: "Squeeze glutes and maintain rigid plank",
        joint: "spine",
      });
    }

    // 2. Incomplete Elbow Bend / Depth
    if (elbowAngle > 95) {
      issues.push({
        what: "Incomplete range of motion at the bottom.",
        why: "Reduces pectoral and triceps hypertrophy stimulus and limits chest stretch under tension.",
        how: "Lower your chest until your upper arms are parallel to the torso (roughly 90° elbow bend).",
        severity: "warning",
        cue: "Lower chest all the way to target depth",
        joint: "leftElbow",
      });
    }

    // 3. Asymmetric Arm Drive
    if (elbowDiff > 16) {
      issues.push({
        what: "Uneven pressing between left and right arms.",
        why: "Compensatory pressing can lead to left-right muscular imbalances over time.",
        how: "Distribute your bodyweight evenly across both palms and press simultaneously.",
        severity: "warning",
        cue: "Press evenly through both palms",
        joint: (angles.elbowL ?? 160) < (angles.elbowR ?? 160) ? "leftElbow" : "rightElbow",
      });
    }

    return issues;
  },

  "bicep-curl": (angles, _ex) => {
    const issues: FormIssue[] = [];
    const shoulderAngle = angles.shoulderAngle ?? 90;
    const elbowAngle = angles.elbowAngle ?? 160;

    // 1. Elbow Drift / Shoulder Compensation
    if (shoulderAngle > 35) {
      issues.push({
        what: "Excessive elbow drift and shoulder swing.",
        why: "Transfers tension away from the biceps brachii onto the anterior deltoids.",
        how: "Pin your elbows to the sides of your ribcage throughout the entire curling motion.",
        severity: "warning",
        cue: "Pin elbows to your ribs",
        joint: "leftShoulder",
      });
    }

    // 2. Incomplete Extension
    if (elbowAngle < 140) {
      issues.push({
        what: "Incomplete elbow extension at the bottom.",
        why: "Shortens the muscle length under tension, missing out on loaded stretch stimulus.",
        how: "Lower the weight all the way down until your arms are fully straight before starting the next rep.",
        severity: "warning",
        cue: "Fully extend arms at the bottom",
        joint: "leftElbow",
      });
    }

    return issues;
  },

  "overhead-press": (angles, _ex) => {
    const issues: FormIssue[] = [];
    const torso = angles.torso ?? 0;
    const elbowAngle = angles.elbowAngle ?? 160;

    // 1. Lumbar Arching
    if (torso > 18) {
      issues.push({
        what: "Excessive lower-back arching (lumbar hyperextension).",
        why: "Places compressive spinal loading and compensates for limited shoulder mobility.",
        how: "Tuck your pelvis, squeeze your glutes, and pull your ribcage down to lock your spine.",
        severity: "danger",
        cue: "Lock ribs down and squeeze glutes",
        joint: "spine",
      });
    }

    // 2. Incomplete Lockout
    if (elbowAngle < 155) {
      issues.push({
        what: "Incomplete overhead lockout.",
        why: "Reduces peak deltoid and trapezius contraction at the top of the lift.",
        how: "Press directly overhead until your arms are straight and biceps are aligned next to your ears.",
        severity: "warning",
        cue: "Press straight overhead to full lockout",
        joint: "leftElbow",
      });
    }

    return issues;
  },

  lunge: (angles, _ex) => {
    const issues: FormIssue[] = [];
    const kneeAngle = angles.kneeAngle ?? 180;
    const torso = angles.torso ?? 0;

    if (kneeAngle > 110) {
      issues.push({
        what: "Shallow lunge depth.",
        why: "Fails to fully load the quad and glute complex through full joint excursion.",
        how: "Lower your back knee until it gently hovers an inch above the floor with both knees near 90°.",
        severity: "warning",
        cue: "Drop back knee smoothly toward floor",
        joint: "leftKnee",
      });
    }

    if (torso > 25) {
      issues.push({
        what: "Torso collapsing forward over front thigh.",
        why: "Shifts center of mass forward, overloading the front patellar tendon.",
        how: "Maintain an upright, tall posture and look straight ahead.",
        severity: "warning",
        cue: "Keep your chest tall and eyes forward",
        joint: "spine",
      });
    }

    return issues;
  },
};

let feedbackSeq = 0;
function fbId() {
  feedbackSeq += 1;
  return `fb_${feedbackSeq}`;
}

export function evaluateRules(
  angles: Record<string, number>,
  exercise: ExerciseDefinition
): { avg: number; feedback: FormFeedback[]; deepest: Record<string, number> } {
  const category = exercise.category || "squat";
  const customChecker =
    EXERCISE_SPECIFIC_RULES[exercise.id] ||
    EXERCISE_SPECIFIC_RULES[category] ||
    EXERCISE_SPECIFIC_RULES.squat;

  const detectedIssues = customChecker(angles, exercise);
  const feedback: FormFeedback[] = [];

  for (const issue of detectedIssues) {
    feedback.push({
      id: fbId(),
      severity: issue.severity,
      message: `${issue.what} ${issue.how}`,
      joint: issue.joint,
      cue: issue.cue,
      what: issue.what,
      why: issue.why,
      how: issue.how,
    });
  }

  if (feedback.length === 0) {
    feedback.push({
      id: fbId(),
      severity: "success",
      message: "Excellent biomechanical alignment and controlled cadence.",
      cue: exercise.cues[0] ?? "Maintain this rhythm",
      what: "Form is aligned",
      why: "Optimal muscle fiber recruitment and minimal joint shear.",
      how: "Continue through full range of motion.",
    });
  }

  const avgScore = Math.max(0.4, 1.0 - detectedIssues.length * 0.18);
  return { avg: avgScore, feedback, deepest: angles };
}

// Live feedback for the current frame
export function liveFeedback(
  angles: Record<string, number>,
  exercise: ExerciseDefinition
): FormFeedback[] {
  return evaluateRules(angles, exercise).feedback;
}

export interface RepScoreInput {
  angles: Record<string, number>;
  rom?: RomState | null;
  symmetry?: SymmetryState | null;
  tempo?: TempoRep | null;
  partial?: boolean;
}

export interface RepScore {
  metrics: QualityMetrics;
  score: number;
  feedback: FormFeedback[];
  issue?: string;
  why?: string;
  how?: string;
}

export function scoreRep(input: RepScoreInput, exercise: ExerciseDefinition): RepScore {
  const { angles, rom, symmetry, tempo, partial } = input;
  const evalRes = evaluateRules(angles, exercise);

  const romScore = partial
    ? Math.min(65, rom ? Math.round(rom.completeness * 70) : 55)
    : rom
    ? Math.round(rom.completeness * 100)
    : deriveRomScore(angles, exercise);

  const controlScore = Math.round(evalRes.avg * 100);
  const torsoRule = exercise.rules.find((r) => r.joint === "torso");
  const torsoDev = torsoRule
    ? Math.max(0, Math.min(1, Math.abs((angles.torso ?? 0) - torsoRule.bottomAngle) / (torsoRule.tolerance * 2)))
    : 0;
  const sym = symmetry ? symmetry.symmetryIndex : 1;
  const stabilityScore = Math.round(100 * (0.7 * sym + 0.3 * (1 - torsoDev)));
  const tempoScore = tempo ? tempoScoreFrom(tempo) : 84;

  const metrics: QualityMetrics = {
    stability: Math.max(40, Math.min(100, stabilityScore)),
    consistency: Math.max(40, Math.min(100, controlScore)),
    tempo: Math.max(40, Math.min(100, tempoScore)),
    control: Math.max(40, Math.min(100, controlScore)),
    rangeOfMotion: Math.max(30, Math.min(100, romScore)),
  };

  let total = Math.round(
    metrics.stability * 0.2 +
      metrics.consistency * 0.2 +
      metrics.tempo * 0.2 +
      metrics.control * 0.2 +
      metrics.rangeOfMotion * 0.2
  );

  if (partial) {
    total = Math.min(65, total);
  }

  const primaryIssue = evalRes.feedback[0];

  return {
    metrics,
    score: total,
    feedback: evalRes.feedback,
    issue: primaryIssue?.what,
    why: primaryIssue?.why,
    how: primaryIssue?.how,
  };
}

function deriveRomScore(angles: Record<string, number>, exercise: ExerciseDefinition): number {
  const v = angles[exercise.primaryJoint];
  if (v == null) return 75;
  const range = Math.abs(exercise.repTopAngle - v);
  return Math.min(100, Math.round((range / exercise.expectedRom) * 100));
}

function tempoScoreFrom(tempo: TempoRep): number {
  const lowering = tempo.loweringMs || 1500;
  const lifting = tempo.liftingMs || 1000;
  let score = 90;

  // Ideal eccentric: 1200ms - 3500ms
  if (lowering < 600) score -= 25; // Rushed descent
  else if (lowering < 1000) score -= 10;
  else if (lowering > 4500) score -= 10;

  // Ideal concentric: 600ms - 2500ms
  if (lifting < 400) score -= 20; // Ballistic bounce
  else if (lifting > 3500) score -= 10;

  return Math.max(40, Math.min(100, Math.round(score)));
}

export function scoreFromAngles(angles: Record<string, number>, exercise: ExerciseDefinition): RepScore {
  return scoreRep({ angles }, exercise);
}
