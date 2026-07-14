import type { RomState } from "./types";
import type { ExerciseDefinition } from "./types";

// Tracks the range of motion observed across a rep and compares it to the
// exercise's expected range. Avoids claiming precise medical measurements.
export class RomTracker {
  private min = Infinity;
  private max = -Infinity;
  private active = false;

  reset() {
    this.min = Infinity;
    this.max = -Infinity;
    this.active = false;
  }

  startRep() {
    this.min = Infinity;
    this.max = -Infinity;
    this.active = true;
  }

  update(primaryAngle: number) {
    if (!this.active) return;
    this.min = Math.min(this.min, primaryAngle);
    this.max = Math.max(this.max, primaryAngle);
  }

  finalize(exercise: ExerciseDefinition): RomState {
    const observed = this.max === -Infinity ? 0 : Math.abs(this.max - this.min);
    const expected = exercise.expectedRom;
    const completeness = expected > 0 ? Math.min(1, observed / expected) : 1;
    return {
      joint: exercise.primaryJoint,
      minAngle: isFinite(this.min) ? Math.round(this.min) : exercise.repTopAngle,
      maxAngle: isFinite(this.max) ? Math.round(this.max) : exercise.repBottomAngle,
      observedRange: Math.round(observed),
      expectedRange: expected,
      completeness,
      shallow: completeness < 0.7,
    };
  }

  endRep() {
    this.active = false;
  }
}
