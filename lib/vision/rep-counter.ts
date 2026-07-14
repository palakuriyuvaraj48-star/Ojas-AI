import type { ExerciseDefinition, RepRecord, RepCounterUpdate, TempoPhase } from "./types";

// Hysteresis-based rep counter driven by the primary joint angle. Robust to
// either orientation (knee flexing OR elbow extending) and handles pauses and
// partial reps.

export class RepCounter {
  private exercise: ExerciseDefinition;
  private reps = 0;
  private partialReps = 0;
  private bottomIsLower: boolean;
  private band: number;
  private state: "top" | "bottom" | "mid" = "top";
  private bottomReached = false;
  private extreme = 0;
  private repStartTs = 0;
  private lastTs = 0;
  private lastPhase: TempoPhase = "resting";
  private durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
  private lastAngle = 180;
  private stillSince = 0;

  constructor(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.bottomIsLower = exercise.repBottomAngle < exercise.repTopAngle;
    this.band = Math.max(8, Math.abs(exercise.repTopAngle - exercise.repBottomAngle) * 0.18);
    this.extreme = exercise.repTopAngle;
  }

  reset() {
    this.reps = 0;
    this.partialReps = 0;
    this.state = "top";
    this.bottomReached = false;
    this.extreme = this.exercise.repTopAngle;
    this.durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
  }

  setExercise(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.bottomIsLower = exercise.repBottomAngle < exercise.repTopAngle;
    this.band = Math.max(8, Math.abs(exercise.repTopAngle - exercise.repBottomAngle) * 0.18);
    this.reset();
  }

  private atBottom(angle: number): boolean {
    return this.bottomIsLower
      ? angle <= this.exercise.repBottomAngle + this.band
      : angle >= this.exercise.repBottomAngle - this.band;
  }

  private atTop(angle: number): boolean {
    return this.bottomIsLower
      ? angle >= this.exercise.repTopAngle - this.band
      : angle <= this.exercise.repTopAngle + this.band;
  }

  update(angle: number, phase: TempoPhase, timestamp: number): RepCounterUpdate {
    if (this.lastTs === 0) {
      this.lastTs = timestamp;
      this.lastPhase = phase;
      this.repStartTs = timestamp;
      this.extreme = angle;
      this.stillSince = timestamp;
    }
    const dt = timestamp - this.lastTs;

    // Accumulate phase durations for the active rep.
    if (this.lastPhase === "lowering") this.durations.loweringMs += dt;
    else if (this.lastPhase === "lifting") this.durations.liftingMs += dt;
    else if (this.lastPhase === "pause") this.durations.pauseMs += dt;

    // Track the extreme (deepest) angle reached this rep.
    this.extreme = this.bottomIsLower
      ? Math.min(this.extreme, angle)
      : Math.max(this.extreme, angle);

    let completed = false;
    let rep: RepRecord | undefined;

    if (this.atBottom(angle) && this.state !== "bottom") {
      this.state = "bottom";
      this.bottomReached = true;
    } else if (this.atTop(angle) && this.state !== "top") {
      if (this.bottomReached) {
        completed = true;
        rep = this.buildRep();
        this.reps += 1;
      } else if (this.state === "mid") {
        this.partialReps += 1;
      }
      this.state = "top";
      this.bottomReached = false;
      this.repStartTs = timestamp;
      this.durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
      this.extreme = angle;
    } else if (!this.atBottom(angle) && !this.atTop(angle)) {
      this.state = "mid";
    }

    this.lastTs = timestamp;
    this.lastPhase = phase;
    this.lastAngle = angle;
    if (Math.abs(angle - this.lastAngle) < 1.5) {
      if (timestamp - this.stillSince > 1000 && this.state === "mid") {
        // pause while mid-range — no rep impact, just time
      }
      this.stillSince = timestamp;
    } else {
      this.stillSince = timestamp;
    }

    return { reps: this.reps, partialReps: this.partialReps, completed, rep };
  }

  private buildRep(): RepRecord {
    const index = this.reps + 1;
    const maxFlexion = this.extreme;
    const rom = Math.abs(this.exercise.repTopAngle - maxFlexion);
    // A rep below 60% of the expected ROM is flagged partial.
    const partial = rom < this.exercise.expectedRom * 0.6;
    return {
      index,
      loweringMs: Math.round(this.durations.loweringMs),
      liftingMs: Math.round(this.durations.liftingMs),
      pauseMs: Math.round(this.durations.pauseMs),
      maxFlexion: Math.round(maxFlexion),
      rom: Math.round(rom),
      symmetryIndex: 1,
      partial,
      score: 0,
    };
  }

  getCounts(): { reps: number; partialReps: number } {
    return { reps: this.reps, partialReps: this.partialReps };
  }
}
