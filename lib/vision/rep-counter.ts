import type { ExerciseDefinition, RepRecord, RepCounterUpdate, TempoPhase } from "./types";

// Hysteresis-driven 5-phase movement state machine.
// Accurately counts full reps vs partial reps and measures joint excursion.
export class RepCounter {
  private exercise: ExerciseDefinition;
  private reps = 0;
  private partialReps = 0;
  private bottomIsLower: boolean;
  private expectedRom: number;
  private topTolerance: number;
  private bottomTolerance: number;

  private state: "top" | "descending" | "bottom" | "ascending" = "top";
  private extremeAngle = 180;
  private repStartTs = 0;
  private lastTs = 0;
  private lastPhase: TempoPhase = "resting";
  private durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
  private lastRepCompletedTs = 0;

  constructor(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.bottomIsLower = exercise.repBottomAngle < exercise.repTopAngle;
    this.expectedRom = Math.abs(exercise.repTopAngle - exercise.repBottomAngle) || 70;
    this.topTolerance = Math.max(10, this.expectedRom * 0.18);
    this.bottomTolerance = Math.max(12, this.expectedRom * 0.22);
    this.extremeAngle = exercise.repTopAngle;
  }

  reset() {
    this.reps = 0;
    this.partialReps = 0;
    this.state = "top";
    this.extremeAngle = this.exercise.repTopAngle;
    this.durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
    this.repStartTs = 0;
    this.lastTs = 0;
    this.lastRepCompletedTs = 0;
  }

  setExercise(exercise: ExerciseDefinition) {
    this.exercise = exercise;
    this.bottomIsLower = exercise.repBottomAngle < exercise.repTopAngle;
    this.expectedRom = Math.abs(exercise.repTopAngle - exercise.repBottomAngle) || 70;
    this.topTolerance = Math.max(10, this.expectedRom * 0.18);
    this.bottomTolerance = Math.max(12, this.expectedRom * 0.22);
    this.reset();
  }

  private isAtTop(angle: number): boolean {
    return this.bottomIsLower
      ? angle >= this.exercise.repTopAngle - this.topTolerance
      : angle <= this.exercise.repTopAngle + this.topTolerance;
  }

  private isAtBottom(angle: number): boolean {
    return this.bottomIsLower
      ? angle <= this.exercise.repBottomAngle + this.bottomTolerance
      : angle >= this.exercise.repBottomAngle - this.bottomTolerance;
  }

  update(angle: number, phase: TempoPhase, timestamp: number): RepCounterUpdate {
    if (this.lastTs === 0) {
      this.lastTs = timestamp;
      this.repStartTs = timestamp;
      this.lastPhase = phase;
      this.extremeAngle = angle;
    }

    const dt = Math.max(10, Math.min(100, timestamp - this.lastTs));

    // Accumulate phase duration
    if (this.lastPhase === "lowering") this.durations.loweringMs += dt;
    else if (this.lastPhase === "lifting") this.durations.liftingMs += dt;
    else if (this.lastPhase === "pause") this.durations.pauseMs += dt;

    // Track extreme angle (deepest flexion)
    this.extremeAngle = this.bottomIsLower
      ? Math.min(this.extremeAngle, angle)
      : Math.max(this.extremeAngle, angle);

    let completed = false;
    let rep: RepRecord | undefined;

    // Movement State Machine Transitions
    switch (this.state) {
      case "top": {
        if (!this.isAtTop(angle)) {
          this.state = "descending";
          this.durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
          this.extremeAngle = angle;
          this.repStartTs = timestamp;
        }
        break;
      }

      case "descending": {
        if (this.isAtBottom(angle)) {
          this.state = "bottom";
        } else if (this.isAtTop(angle)) {
          // Reversed before bottom: test if partial or noise
          const achievedRom = Math.abs(this.exercise.repTopAngle - this.extremeAngle);
          const romRatio = achievedRom / this.expectedRom;

          if (romRatio >= 0.35 && timestamp - this.lastRepCompletedTs > 600) {
            // Valid partial repetition
            this.partialReps += 1;
            completed = true;
            rep = this.buildRep(true, achievedRom);
            this.lastRepCompletedTs = timestamp;
          }
          this.state = "top";
          this.extremeAngle = angle;
        }
        break;
      }

      case "bottom": {
        if (!this.isAtBottom(angle)) {
          this.state = "ascending";
        }
        break;
      }

      case "ascending": {
        if (this.isAtTop(angle)) {
          const achievedRom = Math.abs(this.exercise.repTopAngle - this.extremeAngle);
          const romRatio = achievedRom / this.expectedRom;

          if (timestamp - this.lastRepCompletedTs > 600) {
            if (romRatio >= 0.72) {
              // Full good rep
              this.reps += 1;
              completed = true;
              rep = this.buildRep(false, achievedRom);
              this.lastRepCompletedTs = timestamp;
            } else if (romRatio >= 0.35) {
              // Partial rep
              this.partialReps += 1;
              completed = true;
              rep = this.buildRep(true, achievedRom);
              this.lastRepCompletedTs = timestamp;
            }
          }

          this.state = "top";
          this.extremeAngle = angle;
          this.durations = { loweringMs: 0, liftingMs: 0, pauseMs: 0 };
        } else if (this.isAtBottom(angle)) {
          this.state = "bottom";
        }
        break;
      }
    }

    this.lastTs = timestamp;
    this.lastPhase = phase;

    return {
      reps: this.reps,
      partialReps: this.partialReps,
      completed,
      rep,
    };
  }

  private buildRep(partial: boolean, achievedRom: number): RepRecord {
    const index = this.reps + this.partialReps;
    const rom = Math.round(achievedRom);
    const loweringMs = Math.max(200, Math.round(this.durations.loweringMs));
    const liftingMs = Math.max(200, Math.round(this.durations.liftingMs));
    const pauseMs = Math.round(this.durations.pauseMs);

    return {
      index,
      loweringMs,
      liftingMs,
      pauseMs,
      maxFlexion: Math.round(this.extremeAngle),
      rom,
      symmetryIndex: 1,
      partial,
      score: partial ? 62 : 90,
      issue: partial ? "Range of motion below target" : "Good depth",
      why: partial
        ? "Movement reversed before reaching full target depth."
        : "Complete range achieved with stable cadence.",
      how: partial
        ? `Descend lower to reach the target ${this.exercise.expectedRom}° range.`
        : "Maintain this controlled tempo on subsequent reps.",
    };
  }

  getCounts(): { reps: number; partialReps: number } {
    return { reps: this.reps, partialReps: this.partialReps };
  }
}
