// Synthetic pose engine. Drives a biomechanically plausible rep cycle for the
// selected exercise and emits landmark frames + joint angles that the analyzer,
// rep counter and scorer consume. This is the "equivalent" pose source used
// when a live MediaPipe model is unavailable, and always works offline.

import type { ExerciseDefinition, JointMap, JointName, PoseFrame, TempoPhase } from "./types";
import {
  computeJointAngles, getKeyframes, lerpPose, toJointMap, JOINT_NAMES,
} from "./skeleton";

const SEGMENTS = {
  lowering: 1100,
  bottomHold: 350,
  lifting: 1100,
  topHold: 420,
};

export interface EngineFrame {
  pose: JointMap;
  angles: Record<string, number>;
  phase: TempoPhase;
  confidence: number;
  repProgress: number; // 0 top .. 1 bottom
}

export class SyntheticPoseEngine {
  private exercise: ExerciseDefinition;
  private segment: keyof typeof SEGMENTS = "topHold";
  private segElapsed = 0;
  private repIndex = 0;
  private noiseOffsets: Record<string, [number, number]> = {};
  private quality: number;
  private flawMode: boolean;
  private flawActiveThisRep = false;
  private running = false;
  private breathPhase = 0;

  constructor(exercise: ExerciseDefinition, opts?: { quality?: number; flawMode?: boolean }) {
    this.exercise = exercise;
    this.quality = opts?.quality ?? 0.93;
    this.flawMode = opts?.flawMode ?? true;
    for (const n of JOINT_NAMES) this.noiseOffsets[n] = [0, 0];
  }

  setExercise(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.segment = "topHold";
    this.segElapsed = 0;
    this.repIndex = 0;
  }

  setQuality(q: number) {
    this.quality = Math.max(0.4, Math.min(1, q));
  }

  setFlawMode(on: boolean) {
    this.flawMode = on;
  }

  start() {
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  private advance(dt: number) {
    if (!this.running) return;
    this.segElapsed += dt;
    this.breathPhase += dt / 1400;
    const order: (keyof typeof SEGMENTS)[] = ["lowering", "bottomHold", "lifting", "topHold"];
    const idx = order.indexOf(this.segment);
    if (this.segElapsed >= SEGMENTS[this.segment]) {
      this.segElapsed = 0;
      const next = order[(idx + 1) % order.length];
      this.segment = next;
      if (next === "lowering") {
        this.repIndex += 1;
        // Inject a flaw on ~1 in 3 reps for realistic coaching cues.
        this.flawActiveThisRep = this.flawMode && this.repIndex % 3 === 0;
      }
    }
  }

  private currentT(): number {
    if (this.segment === "topHold") return 0;
    if (this.segment === "bottomHold") return 1;
    if (this.segment === "lowering") return easeInOut(this.segElapsed / SEGMENTS.lowering);
    return easeInOut(1 - this.segElapsed / SEGMENTS.lifting);
  }

  private currentPhase(): TempoPhase {
    if (!this.running) return "resting";
    if (this.segment === "lowering") return "lowering";
    if (this.segment === "lifting") return "lifting";
    if (this.segment === "bottomHold" || this.segment === "topHold") return "pause";
    return "resting";
  }

  getFrame(dt = 33): EngineFrame {
    this.advance(dt);
    const kf = getKeyframes(this.exercise.category);
    const t = this.exercise.category === "isometric" ? 0 : this.currentT();

    let pose = lerpPose(kf.top, kf.bottom, t);

    // Smooth breathing / sway noise (scaled by imperfection).
    const imperfection = (1 - this.quality) * 0.05 + 0.006;
    for (const n of JOINT_NAMES) {
      const seed = hash(n);
      const nx = Math.sin(this.breathPhase * (1 + seed) + seed * 6) * imperfection;
      const ny = Math.cos(this.breathPhase * (0.8 + seed) + seed * 3) * imperfection;
      this.noiseOffsets[n][0] = this.noiseOffsets[n][0] * 0.9 + nx * 0.1;
      this.noiseOffsets[n][1] = this.noiseOffsets[n][1] * 0.9 + ny * 0.1;
      pose[n] = [pose[n][0] + this.noiseOffsets[n][0], pose[n][1] + this.noiseOffsets[n][1]];
    }

    // Inject a flaw in the bottom position of flagged reps.
    if (this.flawActiveThisRep && t > 0.55 && this.exercise.category !== "isometric") {
      pose = applyFlaw(pose);
    }

    const jointMap = toJointMap(pose, 0.95 + Math.random() * 0.04);
    const angles = computeJointAngles(jointMap);
    const confidence = 0.9 + Math.random() * 0.08;
    return { pose: jointMap, angles, phase: this.currentPhase(), confidence, repProgress: t };
  }
}

function easeInOut(x: number): number {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return (h % 100) / 100;
}

// Perturb the bottom pose to create detectable technique deviations.
function applyFlaw(pose: Record<JointName, [number, number]>): Record<JointName, [number, number]> {
  const out = { ...pose };
  // Knee valgus: pull the right knee inward.
  out.rightKnee = [out.rightKnee[0] - 0.04, out.rightKnee[1] + 0.01];
  out.rightAnkle = [out.rightAnkle[0] - 0.02, out.rightAnkle[1]];
  // Slight back rounding: drop the head/neck forward.
  out.head = [out.head[0] + 0.03, out.head[1] + 0.02];
  out.neck = [out.neck[0] + 0.02, out.neck[1] + 0.01];
  return out;
}

// Build a single PoseFrame snapshot (used by the API for stateless analysis).
export function snapshotPose(exercise: ExerciseDefinition, progress = 0.5): PoseFrame {
  const kf = getKeyframes(exercise.category);
  const pose = lerpPose(kf.top, kf.bottom, progress);
  const jointMap = toJointMap(pose, 0.97);
  return { landmarks: Object.values(jointMap), confidence: 0.96, timestamp: Date.now(), source: "simulation" };
}
