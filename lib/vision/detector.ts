import type { CameraMode, ExerciseDefinition, JointMap, PoseLandmark, TempoPhase } from "./types";
import { computeJointAngles, JOINT_NAMES, type PoseKeyframes } from "./skeleton";
import { SyntheticPoseEngine } from "./pose-engine";
import { MediaPipePoseDetector } from "./mediapipe-pose";

export interface DetectedFrame {
  pose: JointMap;
  angles: Record<string, number>;
  phase: TempoPhase;
  confidence: number;
  source: "mediapipe" | "simulation";
  repProgress: number;
}

// Selects between live MediaPipe detection and the synthetic engine, applies
// smoothing, and always returns a consistent DetectedFrame for the analyzer.
export class PoseDetector {
  private engine: SyntheticPoseEngine;
  private mp = new MediaPipePoseDetector();
  private mode: CameraMode = "simulation";
  private smooth: JointMap | null = null;

  constructor(exercise: ExerciseDefinition, mode: CameraMode = "simulation") {
    this.engine = new SyntheticPoseEngine(exercise);
    this.mode = mode;
  }

  setExercise(exercise: ExerciseDefinition) {
    this.engine.setExercise(exercise);
  }

  setMode(mode: CameraMode) {
    this.mode = mode;
  }

  get currentMode() {
    return this.mode;
  }

  get liveReady() {
    return this.mp.isReady;
  }

  async initLive(): Promise<boolean> {
    this.mode = "live";
    const ok = await this.mp.init();
    if (!ok) this.mode = "simulation";
    return ok;
  }

  setQuality(q: number) {
    this.engine.setQuality(q);
  }

  start() {
    this.engine.start();
  }

  stop() {
    this.engine.stop();
  }

  async detect(video: HTMLVideoElement | null, dt = 33): Promise<DetectedFrame> {
    if (this.mode === "live" && this.mp.isReady && video) {
      const f = await this.mp.detect(video);
      if (f && f.confidence > 0.45) {
        const smoothed = this.smoothLandmarks(f.landmarks);
        const angles = computeJointAngles(smoothed);
        return { pose: smoothed, angles, phase: "lowering", confidence: f.confidence, source: "mediapipe", repProgress: 0.5 };
      }
      // Fall back to synthetic analysis while no clear pose is detected.
    }
    const ef = this.engine.getFrame(dt);
    return { pose: ef.pose, angles: ef.angles, phase: ef.phase, confidence: ef.confidence, source: "simulation", repProgress: ef.repProgress };
  }

  private smoothLandmarks(raw: PoseLandmark[]): JointMap {
    const alpha = 0.5;
    const out = {} as JointMap;
    JOINT_NAMES.forEach((name, i) => {
      const r = raw[i];
      if (!r) return;
      if (!this.smooth) {
        out[name] = { x: r.x, y: r.y, visibility: r.visibility ?? 0.9 };
      } else {
        out[name] = {
          x: this.smooth[name].x * (1 - alpha) + r.x * alpha,
          y: this.smooth[name].y * (1 - alpha) + r.y * alpha,
          visibility: r.visibility ?? 0.9,
        };
      }
    });
    this.smooth = out;
    return out;
  }

  dispose() {
    this.mp.dispose();
  }
}
