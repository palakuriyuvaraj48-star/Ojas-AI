import type { SymmetryState } from "./types";

// Compares left vs right joint angles where the body is (roughly) symmetric.
export class SymmetryTracker {
  private pairs: [string, string][] = [
    ["kneeL", "kneeR"],
    ["hipL", "hipR"],
    ["elbowL", "elbowR"],
    ["shoulderL", "shoulderR"],
  ];
  private leftSum = 0;
  private rightSum = 0;
  private count = 0;

  reset() {
    this.leftSum = 0;
    this.rightSum = 0;
    this.count = 0;
  }

  update(angles: Record<string, number>): SymmetryState {
    let left = 0;
    let right = 0;
    let n = 0;
    for (const [l, r] of this.pairs) {
      if (angles[l] != null && angles[r] != null) {
        left += angles[l];
        right += angles[r];
        n += 1;
      }
    }
    if (n === 0) {
      return { joint: "overall", leftAngle: 0, rightAngle: 0, asymmetryPct: 0, symmetryIndex: 1, flagged: false };
    }
    // Running average for a smoother per-rep index.
    this.leftSum += left / n;
    this.rightSum += right / n;
    this.count += 1;

    const meanL = this.leftSum / this.count;
    const meanR = this.rightSum / this.count;
    const diff = Math.abs(meanL - meanR);
    const denom = (meanL + meanR) / 2 || 1;
    const asymmetryPct = (diff / denom) * 100;
    const symmetryIndex = Math.max(0, 1 - asymmetryPct / 30);
    return {
      joint: "overall",
      leftAngle: Math.round(meanL),
      rightAngle: Math.round(meanR),
      asymmetryPct: Math.round(asymmetryPct * 10) / 10,
      symmetryIndex,
      flagged: asymmetryPct > 12,
    };
  }

  finalize(): SymmetryState {
    const meanL = this.leftSum / (this.count || 1);
    const meanR = this.rightSum / (this.count || 1);
    const diff = Math.abs(meanL - meanR);
    const denom = (meanL + meanR) / 2 || 1;
    const asymmetryPct = (diff / denom) * 100;
    const symmetryIndex = Math.max(0, 1 - asymmetryPct / 30);
    return {
      joint: "overall",
      leftAngle: Math.round(meanL),
      rightAngle: Math.round(meanR),
      asymmetryPct: Math.round(asymmetryPct * 10) / 10,
      symmetryIndex,
      flagged: asymmetryPct > 12,
    };
  }
}
