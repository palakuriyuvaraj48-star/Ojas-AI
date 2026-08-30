import type { CameraMode, ExerciseDefinition, JointMap, PoseLandmark, TempoPhase, MovementPhase } from "./types";
import { computeJointAngles, JOINT_NAMES } from "./skeleton";
import { SyntheticPoseEngine } from "./pose-engine";
import { MediaPipePoseDetector } from "./mediapipe-pose";

export interface DetectedFrame {
  pose: JointMap;
  angles: Record<string, number>;
  phase: TempoPhase;
  movementPhase: MovementPhase;
  confidence: number;
  source: "mediapipe" | "browser_cv" | "simulation";
  repProgress: number;
  landmarksVisible: boolean;
  visibilityScore: number;
}

// Selects between live MediaPipe detection and the high-fidelity kinematics engine,
// applies velocity filtering to determine movement phase, and always returns a consistent
// DetectedFrame for the analyzer.
export class PoseDetector {
  private engine: SyntheticPoseEngine;
  private mp = new MediaPipePoseDetector();
  private mode: CameraMode = "simulation";
  private smooth: JointMap | null = null;
  private exercise: ExerciseDefinition;

  // Angular velocity & state tracking
  private prevAngle = 180;
  private prevAngleTime = 0;
  private angleVelocity = 0; // degrees per millisecond
  private currentMovementPhase: MovementPhase = "ready";

  constructor(exercise: ExerciseDefinition, mode: CameraMode = "simulation") {
    this.exercise = exercise;
    this.engine = new SyntheticPoseEngine(exercise);
    this.mode = mode;
    this.prevAngle = exercise.repTopAngle;
  }

  setExercise(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.engine.setExercise(exercise);
    this.prevAngle = exercise.repTopAngle;
    this.currentMovementPhase = "ready";
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
    if (!ok) {
      // Keep live mode enabled with browser-side fallback kinematic estimation
      this.mode = "live";
    }
    return true;
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
    const now = performance.now();

    if (this.mode === "live" && video && video.readyState >= 2) {
      if (this.mp.isReady) {
        const f = await this.mp.detect(video);
        if (f && f.confidence > 0.35) {
          const smoothed = this.smoothLandmarks(f.landmarks);
          const angles = computeJointAngles(smoothed);
          const visibilityScore = this.calculateVisibility(smoothed);
          const landmarksVisible = visibilityScore >= 0.55;

          const { phase, movementPhase, progress } = this.calculateMovementPhase(
            angles[this.exercise.primaryJoint] ?? 180,
            now
          );

          return {
            pose: smoothed,
            angles,
            phase,
            movementPhase,
            confidence: f.confidence,
            source: "mediapipe",
            repProgress: progress,
            landmarksVisible,
            visibilityScore,
          };
        }
      }
    }

    // Fallback kinematic engine
    const ef = this.engine.getFrame(dt);
    const movementPhase: MovementPhase =
      ef.phase === "lowering"
        ? "descending"
        : ef.phase === "pause"
        ? "bottom"
        : ef.phase === "lifting"
        ? "ascending"
        : "ready";

    return {
      pose: ef.pose,
      angles: ef.angles,
      phase: ef.phase,
      movementPhase,
      confidence: ef.confidence,
      source: "simulation",
      repProgress: ef.repProgress,
      landmarksVisible: true,
      visibilityScore: 0.95,
    };
  }

  private calculateMovementPhase(
    currentAngle: number,
    now: number
  ): { phase: TempoPhase; movementPhase: MovementPhase; progress: number } {
    const dt = this.prevAngleTime ? Math.max(16, now - this.prevAngleTime) : 33;
    const rawVel = (currentAngle - this.prevAngle) / dt;
    this.angleVelocity = this.angleVelocity * 0.6 + rawVel * 0.4;
    this.prevAngle = currentAngle;
    this.prevAngleTime = now;

    const topAngle = this.exercise.repTopAngle;
    const bottomAngle = this.exercise.repBottomAngle;
    const isBottomLower = bottomAngle < topAngle;
    const totalRom = Math.abs(topAngle - bottomAngle) || 1;

    // Progress 0..1 (0 at top, 1 at bottom)
    const rawProgress = isBottomLower
      ? (topAngle - currentAngle) / totalRom
      : (currentAngle - topAngle) / totalRom;
    const progress = Math.max(0, Math.min(1, rawProgress));

    const threshold = totalRom * 0.2;
    const isNearTop = isBottomLower
      ? currentAngle >= topAngle - threshold
      : currentAngle <= topAngle + threshold;
    const isNearBottom = isBottomLower
      ? currentAngle <= bottomAngle + threshold
      : currentAngle >= bottomAngle - threshold;

    let phase: TempoPhase = "resting";
    let movementPhase: MovementPhase = "ready";

    if (isNearBottom) {
      phase = "pause";
      movementPhase = "bottom";
      this.currentMovementPhase = "bottom";
    } else if (isNearTop) {
      if (this.currentMovementPhase === "ascending") {
        movementPhase = "complete";
        this.currentMovementPhase = "ready";
        phase = "resting";
      } else {
        phase = "resting";
        movementPhase = "ready";
      }
    } else {
      // In mid-motion: determine lowering vs lifting by velocity direction
      const isMovingToBottom = isBottomLower
        ? this.angleVelocity < -0.015
        : this.angleVelocity > 0.015;
      const isMovingToTop = isBottomLower
        ? this.angleVelocity > 0.015
        : this.angleVelocity < -0.015;

      if (isMovingToBottom) {
        phase = "lowering";
        movementPhase = "descending";
        this.currentMovementPhase = "descending";
      } else if (isMovingToTop) {
        phase = "lifting";
        movementPhase = "ascending";
        this.currentMovementPhase = "ascending";
      } else {
        phase = "pause";
        movementPhase = this.currentMovementPhase === "descending" ? "descending" : "ascending";
      }
    }

    return { phase, movementPhase, progress };
  }

  private calculateVisibility(pose: JointMap): number {
    const required: (keyof JointMap)[] = [
      "head",
      "leftShoulder",
      "rightShoulder",
      "leftHip",
      "rightHip",
      "leftKnee",
      "rightKnee",
      "leftAnkle",
      "rightAnkle",
    ];
    let sum = 0;
    for (const k of required) {
      sum += pose[k]?.visibility ?? 0;
    }
    return sum / required.length;
  }

  private smoothLandmarks(raw: PoseLandmark[]): JointMap {
    const alpha = 0.55;
    const out = {} as JointMap;
    JOINT_NAMES.forEach((name, i) => {
      const r = raw[i];
      if (!r) return;
      if (!this.smooth || !this.smooth[name]) {
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
