import type { TempoPhase, TempoRep } from "./types";

// Tracks tempo phase durations and produces a per-rep TempoRep when finalized.
export class TempoTracker {
  private current: TempoPhase = "resting";
  private phaseStart = 0;
  private accum: Omit<TempoRep, "totalMs"> = { loweringMs: 0, pauseMs: 0, liftingMs: 0 };
  private repActive = false;

  reset() {
    this.accum = { loweringMs: 0, pauseMs: 0, liftingMs: 0 };
    this.repActive = false;
    this.current = "resting";
  }

  update(phase: TempoPhase, timestamp: number) {
    if (this.phaseStart === 0) {
      this.phaseStart = timestamp;
      this.current = phase;
      return;
    }
    const dt = timestamp - this.phaseStart;
    if (phase === "lowering" || phase === "lifting" || phase === "pause") {
      this.repActive = true;
      if (phase === "lowering") this.accum.loweringMs += dt;
      else if (phase === "lifting") this.accum.liftingMs += dt;
      else this.accum.pauseMs += dt;
      this.current = phase;
      this.phaseStart = timestamp;
    } else if (phase === "resting") {
      this.phaseStart = timestamp;
    }
  }

  finalizeRep(): TempoRep | undefined {
    if (!this.repActive && this.accum.loweringMs + this.accum.liftingMs === 0) return undefined;
    const rep: TempoRep = {
      loweringMs: Math.round(this.accum.loweringMs),
      liftingMs: Math.round(this.accum.liftingMs),
      pauseMs: Math.round(this.accum.pauseMs),
      totalMs: Math.round(this.accum.loweringMs + this.accum.liftingMs + this.accum.pauseMs),
    };
    this.accum = { loweringMs: 0, pauseMs: 0, liftingMs: 0 };
    this.repActive = false;
    return rep;
  }

  get phase() {
    return this.current;
  }
}
