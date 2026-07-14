/**
 * AR Workout Assistant — simulation engine (Feature 147)
 *
 * Pure TypeScript. Synthesizes pose tracking, rep counting, joint angles,
 * form scoring and analytics. No camera or ML is required — the engine
 * produces a deterministic, seeded simulation so the UI is fully functional.
 *
 * Experimental feature set — all predictions are estimates and NOT medical advice.
 */

import { generateId } from "@/lib/future-ai/storage";
import type {
  ARCoachAnalytics,
  ARCoachFrame,
  ARCoachFrameResult,
  ARCoachInsights,
  ARCoachRequest,
  ARCoachSession,
  ARExerciseDef,
  CoachingCue,
  ConfidenceLevel,
  JointAngleSample,
  JointName,
  JointStressResult,
  Mistake,
  MovementClassification,
  MovementPhase,
  TempoAnalysis,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Exercise library                                                          */
/* -------------------------------------------------------------------------- */

export const AR_COACH_EXERCISES: ARExerciseDef[] = [
  {
    id: "bicep-curl",
    name: "Bicep Curl",
    icon: "Dumbbell",
    difficulty: "beginner",
    primaryJoint: "elbow",
    extendedAngle: 170,
    flexedAngle: 45,
    formTips: [
      "Keep elbows pinned to your ribs",
      "Avoid swinging the torso",
      "Control the lowering phase",
    ],
    idealPattern: "curl",
  },
  {
    id: "squat",
    name: "Bodyweight Squat",
    icon: "PersonStanding",
    difficulty: "beginner",
    primaryJoint: "knee",
    extendedAngle: 175,
    flexedAngle: 85,
    formTips: [
      "Track knees over toes",
      "Keep chest lifted and core braced",
      "Reach full depth without rounding the back",
    ],
    idealPattern: "squat",
  },
  {
    id: "push-up",
    name: "Push-Up",
    icon: "Armchair",
    difficulty: "intermediate",
    primaryJoint: "elbow",
    extendedAngle: 165,
    flexedAngle: 70,
    formTips: [
      "Maintain a straight plank line",
      "Lower chest to just above the floor",
      "Keep elbows at ~45° from the body",
    ],
    idealPattern: "press",
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    icon: "ArrowUp",
    difficulty: "intermediate",
    primaryJoint: "shoulder",
    extendedAngle: 30,
    flexedAngle: 170,
    formTips: [
      "Keep ribs down and avoid arching",
      "Press straight overhead",
      "Do not shrug the shoulders at the top",
    ],
    idealPattern: "press",
  },
  {
    id: "deadlift",
    name: "Deadlift",
    icon: "Weight",
    difficulty: "advanced",
    primaryJoint: "hip",
    extendedAngle: 165,
    flexedAngle: 60,
    formTips: [
      "Hinge at the hips, not the spine",
      "Keep the bar close to the body",
      "Brace the core before lifting",
    ],
    idealPattern: "hinge",
  },
  {
    id: "lunge",
    name: "Reverse Lunge",
    icon: "Footprints",
    difficulty: "intermediate",
    primaryJoint: "knee",
    extendedAngle: 175,
    flexedAngle: 90,
    formTips: [
      "Step back with control",
      "Front knee stays over the ankle",
      "Drive through the front heel",
    ],
    idealPattern: "squat",
  },
];

export function getExerciseDef(id: string): ARExerciseDef {
  return AR_COACH_EXERCISES.find((e) => e.id === id) ?? AR_COACH_EXERCISES[0];
}

/* -------------------------------------------------------------------------- */
/*  Seeded RNG (deterministic so sessions are reproducible)                   */
/* -------------------------------------------------------------------------- */

function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function confidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.85) return "very-high";
  if (score >= 0.7) return "high";
  if (score >= 0.5) return "moderate";
  return "low";
}

/* -------------------------------------------------------------------------- */
/*  Active session store (in-memory; persists via storage on end)            */
/* -------------------------------------------------------------------------- */

interface ActiveSession extends ARCoachSession {
  frameIndex: number;
  /** Normalized position within the current rep cycle, 0..1. */
  cycle: number;
  /** Frames per rep at the current intensity. */
  framesPerRep: number;
  /** Cumulative ROM samples per completed rep, for consistency. */
  repRomHistory: number[];
  /** Filtered live form score for smoothing. */
  liveForm: number;
  /** Running tempo accumulators (ms). */
  tempoLifting: number;
  tempoLowering: number;
  tempoPause: number;
  /** Per-joint peak angles observed. */
  peakAngles: Partial<Record<JointName, number>>;
  rng: () => number;
  seed: number;
}

const activeSessions = new Map<string, ActiveSession>();

/* -------------------------------------------------------------------------- */
/*  startARSession                                                            */
/* -------------------------------------------------------------------------- */

export function startARSession(request: ARCoachRequest): ARCoachSession {
  const id = generateId();
  const seed = Math.floor(Math.random() * 1_000_000) + 1;
  const def = getExerciseDef(request.exercise);

  const baseFramesPerRep =
    request.mode === "power" ? 26 : request.mode === "endurance" ? 40 : 32;

  const session: ActiveSession = {
    id,
    userId: request.userId ?? "demo-user",
    exercise: def.id,
    mode: request.mode,
    startedAt: new Date().toISOString(),
    reps: 0,
    sets: 1,
    duration: 0,
    formScore: 72,
    movementQuality: 70,
    fatigueIndicator: 8,
    commonMistakes: [],
    improvementSuggestions: [],
    jointAngles: [],
    metadata: {
      reducedMotion: request.reducedMotion,
      exerciseName: def.name,
      primaryJoint: def.primaryJoint,
      idealPattern: def.idealPattern,
      framesPerRep: baseFramesPerRep,
      mode: request.mode,
    },
    frameIndex: 0,
    cycle: 0,
    framesPerRep: baseFramesPerRep,
    repRomHistory: [],
    liveForm: 72,
    tempoLifting: 0,
    tempoLowering: 0,
    tempoPause: 0,
    peakAngles: {},
    rng: makeRng(seed),
    seed,
  };

  activeSessions.set(id, session);
  return toPublic(session);
}

/* -------------------------------------------------------------------------- */
/*  processFrame                                                              */
/* -------------------------------------------------------------------------- */

export function processFrame(
  sessionId: string,
  frame: ARCoachFrame = {}
): ARCoachFrameResult {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`AR session ${sessionId} not found or already ended`);
  }

  const def = getExerciseDef(session.exercise);
  session.frameIndex += 1;

  // Advance the rep cycle. As fatigue builds, reps slow down slightly.
  const fatigueSlow = 1 + (session.fatigueIndicator / 100) * 0.25;
  const step = 1 / (session.framesPerRep * fatigueSlow);
  const prevCycle = session.cycle;
  session.cycle += step;
  let repCounted = false;
  if (session.cycle >= 1) {
    session.cycle -= 1;
    session.reps += 1;
    repCounted = true;
  }

  // Fatigue accumulates with each rep and over time.
  session.fatigueIndicator = clamp(
    session.fatigueIndicator + 1.4 + session.rng() * 0.6,
    0,
    100
  );

  // Synthetic primary joint angle: cosine sweep from extended -> flexed.
  const lift = 0.5 - 0.5 * Math.cos(2 * Math.PI * session.cycle); // 0..1
  const noise = (session.rng() - 0.5) * (4 + session.fatigueIndicator * 0.18);
  const romLoss = (session.fatigueIndicator / 100) * 0.12;
  const span = (def.flexedAngle - def.extendedAngle) * (1 - romLoss);
  let angle = def.extendedAngle + span * lift + noise;
  angle = clamp(angle, Math.min(def.flexedAngle, def.extendedAngle) - 6, Math.max(def.flexedAngle, def.extendedAngle) + 6);

  // Phase detection from the local derivative of the cycle.
  let phase: MovementPhase;
  if (session.cycle < 0.04 || session.cycle > 0.96) phase = "pause";
  else if (session.cycle < 0.5) phase = "lifting";
  else if (session.cycle < 0.96) phase = "lowering";
  else phase = "transition";

  // Tempo accumulation.
  if (phase === "lifting") session.tempoLifting += 1000 / 30;
  else if (phase === "lowering") session.tempoLowering += 1000 / 30;
  else session.tempoPause += 1000 / 30;

  // Movement classification for this rep sample.
  let classification: MovementClassification = "correct";
  const rom = Math.abs(def.flexedAngle - def.extendedAngle);
  if (rom > 0 && Math.abs(angle - def.extendedAngle) < rom * 0.08) {
    classification = "incomplete";
  } else if (noise > 6 && session.fatigueIndicator > 55) {
    classification = "compensated";
  } else if (romLoss > 0.06) {
    classification = "partial";
  }

  // Track peak angle and per-rep ROM.
  const peak = session.peakAngles[def.primaryJoint] ?? -Infinity;
  session.peakAngles[def.primaryJoint] = Math.max(peak, angle);
  const observedRom = Math.abs(
    (session.peakAngles[def.primaryJoint] ?? angle) - angle
  );

  // Update joint angle history (keep last ~240 samples).
  const sample: JointAngleSample = {
    t: session.frameIndex,
    joint: def.primaryJoint,
    angle: Math.round(angle * 10) / 10,
    phase,
    rangeOfMotion: Math.round(clamp(observedRom, 0, rom) * 10) / 10,
  };
  session.jointAngles.push(sample);
  if (session.jointAngles.length > 240) session.jointAngles.shift();

  // Form score: penalize noise, fatigue and lost range of motion.
  const formPenalty =
    Math.abs(noise) * 1.1 +
    session.fatigueIndicator * 0.18 +
    romLoss * 220 +
    (classification === "compensated" ? 6 : 0) +
    (classification === "incomplete" ? 9 : 0);
  const targetForm = clamp(92 - formPenalty, 25, 98);
  // Exponential smoothing for a stable dial.
  session.liveForm = session.liveForm * 0.85 + targetForm * 0.15;
  session.formScore = Math.round(session.liveForm);

  // Per-rep ROM capture for consistency at end().
  if (repCounted) {
    session.repRomHistory.push(clamp(observedRom, 0, rom));
  }

  // Movement quality follows form but lags fatigue.
  session.movementQuality = Math.round(
    clamp(session.liveForm - session.fatigueIndicator * 0.25, 20, 98)
  );

  // Duration estimate (~33ms per frame).
  session.duration = Math.round((session.frameIndex * 1000) / 30);

  const cue = buildCue(session, phase, classification, repCounted);

  return {
    session: toPublic(session),
    cue,
    phase,
    classification,
    rangeOfMotion: sample.rangeOfMotion,
    repCounted,
  };
}

/* -------------------------------------------------------------------------- */
/*  Coaching cues                                                             */
/* -------------------------------------------------------------------------- */

function buildCue(
  session: ActiveSession,
  phase: MovementPhase,
  classification: MovementClassification,
  repCounted: boolean
): CoachingCue {
  const def = getExerciseDef(session.exercise);
  const rng = session.rng;
  let text = "";
  let type: CoachingCue["type"] = "encouragement";
  let priority: CoachingCue["priority"] = "low";

  if (classification === "compensated") {
    text = `Ease the weight — I'm seeing torso compensation on the ${def.name}.`;
    type = "warning";
    priority = "high";
  } else if (classification === "incomplete") {
    text = `Finish the rep — drive through the top of the ${def.name}.`;
    type = "form";
    priority = "medium";
  } else if (session.fatigueIndicator > 70 && rng() > 0.5) {
    text = "Fatigue is climbing. Shorten the lowering phase to stay controlled.";
    type = "tempo";
    priority = "medium";
  } else if (phase === "lifting" && rng() > 0.7) {
    text = "Explode through the lift — keep the brace tight.";
    type = "encouragement";
    priority = "low";
  } else if (phase === "lowering") {
    text = "Slow eccentric — three counts on the way down.";
    type = "tempo";
    priority = "low";
  } else if (repCounted && rng() > 0.4) {
    const reps = session.reps;
    text = `Rep ${reps} locked in. Smooth and consistent.`;
    type = "encouragement";
    priority = "low";
  } else {
    text = `Good ${phase} phase — keep ${def.primaryJoint} tracking clean.`;
    type = "form";
    priority = "low";
  }

  return {
    id: generateId(),
    text,
    type,
    priority,
    spoken: type === "warning" || priority === "high",
  };
}

/* -------------------------------------------------------------------------- */
/*  endARSession                                                              */
/* -------------------------------------------------------------------------- */

export function endARSession(sessionId: string): {
  session: ARCoachSession;
  insights: ARCoachInsights;
  analytics: ARCoachAnalytics;
} {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`AR session ${sessionId} not found or already ended`);
  }

  session.endedAt = new Date().toISOString();
  session.duration = Math.max(
    session.duration,
    Math.round((session.frameIndex * 1000) / 30)
  );

  const insights = generateInsights(toPublic(session));
  const analytics = buildAnalytics(session, insights);

  // Persist common mistakes / suggestions onto the session record.
  session.commonMistakes = insights.commonMistakes.map((m) => m.name);
  session.improvementSuggestions = insights.improvementSuggestions.map(
    (s) => s.title
  );

  activeSessions.delete(sessionId);

  return {
    session: toPublic(session),
    insights,
    analytics,
  };
}

/* -------------------------------------------------------------------------- */
/*  generateInsights                                                         */
/* -------------------------------------------------------------------------- */

export function generateInsights(session: ARCoachSession): ARCoachInsights {
  const def = getExerciseDef(session.exercise);
  const rng = makeRng((session.seed ?? 7) + session.reps);

  const consistency = computeConsistency(session);
  const movementQuality = Math.round(session.movementQuality);
  const fatigueIndicator = Math.round(session.fatigueIndicator);

  // Mistake library keyed by exercise archetype.
  const mistakePool: Record<string, Mistake[]> = {
    curl: [
      { name: "Elbow drift", frequency: 0.42, severity: "medium" },
      { name: "Torso swing", frequency: 0.3, severity: "high" },
      { name: "Incomplete extension", frequency: 0.22, severity: "low" },
    ],
    squat: [
      { name: "Knee valgus", frequency: 0.38, severity: "high" },
      { name: "Heel lift", frequency: 0.24, severity: "medium" },
      { name: "Forward torso lean", frequency: 0.3, severity: "medium" },
    ],
    press: [
      { name: "Shoulder shrug", frequency: 0.34, severity: "medium" },
      { name: "Excessive arch", frequency: 0.28, severity: "high" },
      { name: "Uneven press", frequency: 0.2, severity: "low" },
    ],
    hinge: [
      { name: "Rounded spine", frequency: 0.4, severity: "high" },
      { name: "Bar drift", frequency: 0.26, severity: "medium" },
      { name: "Knee dominance", frequency: 0.22, severity: "low" },
    ],
    row: [
      { name: "Momentum use", frequency: 0.3, severity: "medium" },
      { name: "Shrugging", frequency: 0.24, severity: "low" },
      { name: "Limited retraction", frequency: 0.26, severity: "medium" },
    ],
  };

  const pool = mistakePool[def.idealPattern] ?? mistakePool.curl;
  const commonMistakes: Mistake[] = pool
    .map((m) => ({
      ...m,
      frequency: clamp(
        m.frequency * (0.6 + (fatigueIndicator / 100) * 0.7) + rng() * 0.05,
        0,
        1
      ),
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3);

  const suggestionDefs: {
    match: (m: string) => boolean;
    build: (conf: number) => ImprovementSuggestion;
  }[] = [
    {
      match: (m) => /drift|swing|momentum/i.test(m),
      build: (c) => ({
        title: "Slow tempo drill",
        description:
          "Perform 3 sets of 5 reps at half speed to reduce momentum and anchor the working joint.",
        confidence: c,
        confidenceLevel: confidenceLevel(c),
        drill: "3×5 @ 3s eccentric",
      }),
    },
    {
      match: (m) => /spine|arch|round/i.test(m),
      build: (c) => ({
        title: "Brace & hinge drill",
        description:
          "Practice the brace with a broomstick along the spine before loading the movement.",
        confidence: c,
        confidenceLevel: confidenceLevel(c),
        drill: "Broomstick brace ×10",
      }),
    },
    {
      match: (m) => /knee|heel|valgus/i.test(m),
      build: (c) => ({
        title: "Footing & stance drill",
        description:
          "Drive through the mid-foot and spread the floor to stabilize the knee path.",
        confidence: c,
        confidenceLevel: confidenceLevel(c),
        drill: "Wall sit 3×30s",
      }),
    },
  ];

  const improvementSuggestions: ImprovementSuggestion[] = [];
  for (const m of commonMistakes) {
    const sug = suggestionDefs.find((s) => s.match(m.name));
    if (sug) {
      const conf = clamp(0.55 + (1 - m.frequency) * 0.35 + rng() * 0.1, 0, 0.98);
      improvementSuggestions.push(sug.build(Math.round(conf * 100) / 100));
    }
  }
  while (improvementSuggestions.length < 2) {
    const conf = clamp(0.6 + rng() * 0.3, 0, 0.98);
    improvementSuggestions.push({
      title: "Mobility prep",
      description: "Add 5 minutes of targeted mobility before this movement.",
      confidence: Math.round(conf * 100) / 100,
      confidenceLevel: confidenceLevel(conf),
      drill: "Dynamic warm-up 5min",
    });
  }

  // Predicted plateau: high consistency + high quality but stalled progress.
  const plateauRisk = clamp(
    (consistency / 100) * 0.5 +
      (movementQuality / 100) * 0.3 +
      (session.reps > 24 ? 0.2 : 0),
    0,
    1
  );

  return {
    movementQuality,
    consistency,
    fatigueIndicator,
    commonMistakes,
    improvementSuggestions,
    predictedPlateau:
      plateauRisk > 0.6
        ? {
            risk: Math.round(plateauRisk * 100),
            note: "Quality is high and consistent — consider adding load or tempo variation to keep adapting.",
          }
        : {
            risk: Math.round(plateauRisk * 100),
            note: "Keep stacking clean reps; progressive overload still has headroom.",
          },
  };
}

/* -------------------------------------------------------------------------- */
/*  detectTempo                                                               */
/* -------------------------------------------------------------------------- */

export function detectTempo(anglesOverTime: number[]): TempoAnalysis {
  if (anglesOverTime.length < 4) {
    return { liftingMs: 0, loweringMs: 0, pauseMs: 0, tempoScore: 0, eccentricRatio: 1 };
  }

  let liftingMs = 0;
  let loweringMs = 0;
  let pauseMs = 0;
  for (let i = 1; i < anglesOverTime.length; i++) {
    const delta = anglesOverTime[i] - anglesOverTime[i - 1];
    if (Math.abs(delta) < 0.4) pauseMs += 1000 / 30;
    else if (delta > 0) liftingMs += 1000 / 30;
    else loweringMs += 1000 / 30;
  }

  const total = liftingMs + loweringMs + pauseMs || 1;
  const eccentricRatio = liftingMs > 0 ? loweringMs / liftingMs : 1;

  // Ideal: controlled ~2x eccentric vs concentric, with small pauses.
  const idealRatio = 2;
  const ratioScore = clamp(100 - Math.abs(eccentricRatio - idealRatio) * 35, 0, 100);
  const balance = clamp(100 - Math.abs(liftingMs / total - 0.45) * 200, 0, 100);
  const tempoScore = Math.round(ratioScore * 0.6 + balance * 0.4);

  return {
    liftingMs: Math.round(liftingMs),
    loweringMs: Math.round(loweringMs),
    pauseMs: Math.round(pauseMs),
    tempoScore,
    eccentricRatio: Math.round(eccentricRatio * 100) / 100,
  };
}

/* -------------------------------------------------------------------------- */
/*  computeJointStress                                                        */
/* -------------------------------------------------------------------------- */

export function computeJointStress(
  angles: JointAngleSample[],
  reps: number
): JointStressResult {
  const perJoint: Partial<Record<JointName, number>> = {};
  const groups: Record<string, number[]> = {};

  for (const s of angles) {
    (groups[s.joint] ??= []).push(s.angle);
  }

  let weighted = 0;
  let weightSum = 0;
  for (const joint of Object.keys(groups) as JointName[]) {
    const series = groups[joint];
    const peak = Math.max(...series);
    const rom = Math.max(...series) - Math.min(...series);
    // Loading grows with peak flexion and cumulative reps.
    const load = clamp(
      (peak / 180) * 60 + (rom / 180) * 25 + Math.min(reps, 40) * 0.4,
      0,
      100
    );
    perJoint[joint] = Math.round(load);
    const w = joint === "knee" || joint === "spine" ? 1.3 : 1;
    weighted += load * w;
    weightSum += w;
  }

  const overall = weightSum > 0 ? Math.round(weighted / weightSum) : 0;
  return { overall, perJoint };
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function computeConsistency(session: ARCoachSession): number {
  const angles = session.jointAngles;
  if (angles.length < 6) return Math.round(clamp(session.formScore - 6, 0, 100));
  const series = angles.map((a) => a.angle);
  const mean = series.reduce((s, v) => s + v, 0) / series.length;
  const variance =
    series.reduce((s, v) => s + (v - mean) ** 2, 0) / series.length;
  const cv = Math.sqrt(variance) / (Math.abs(mean) || 1);
  // Lower coefficient of variation -> higher consistency.
  return Math.round(clamp(100 - cv * 220, 0, 100));
}

function buildAnalytics(
  session: ActiveSession,
  insights: ARCoachInsights
): ARCoachAnalytics {
  const def = getExerciseDef(session.exercise);
  const angles = session.jointAngles;
  const tempo = detectTempo(angles.map((a) => a.angle));
  const stress = computeJointStress(angles, session.reps);

  return {
    id: generateId(),
    userId: session.userId,
    date: new Date().toISOString().slice(0, 10),
    exercise: def.id,
    movementQuality: insights.movementQuality,
    consistency: insights.consistency,
    fatigueIndicator: insights.fatigueIndicator,
    jointStress: stress.overall,
    tempo: tempo.tempoScore,
  };
}

function toPublic(session: ActiveSession): ARCoachSession {
  const { frameIndex, cycle, framesPerRep, repRomHistory, liveForm, tempoLifting, tempoLowering, tempoPause, peakAngles, rng, seed, ...rest } = session;
  void frameIndex;
  void cycle;
  void framesPerRep;
  void repRomHistory;
  void liveForm;
  void tempoLifting;
  void tempoLowering;
  void tempoPause;
  void peakAngles;
  void rng;
  void seed;
  return { ...rest };
}

export function getActiveSession(sessionId: string): ARCoachSession | null {
  const s = activeSessions.get(sessionId);
  return s ? toPublic(s) : null;
}
