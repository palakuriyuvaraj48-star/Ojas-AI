// Barrel for the AI Recovery Engine.
export * from "./types";
export * from "./scoring";
export * from "./budget";
export * from "./sleep";
export * from "./plans";
export * from "./coach";
export { buildSignals } from "./storage";

import { RecoverySignals } from "./types";

// Deterministic default signals for server-side (API) computation when no
// client profile is available. Keeps responses stable instead of random.
export function defaultSignals(): RecoverySignals {
  return {
    sleepDuration: 7.4,
    sleepQuality: 82,
    sleepConsistency: 84,
    sleepDebt: 0.5,
    trainingLoad: 58,
    consecutiveTrainingDays: 3,
    hrv: 68,
    hrvBaseline: 65,
    restingHR: 54,
    restingHRBaseline: 52,
    hydrationLiters: 2.4,
    hydrationTargetLiters: 2.8,
    nutritionConsistency: 84,
    stressLevel: 35,
    soreness: [
      { muscle: "Quads", soreness: 45 },
      { muscle: "Hamstrings", soreness: 40 },
      { muscle: "Chest", soreness: 20 },
      { muscle: "Lats", soreness: 10 },
      { muscle: "Shoulders", soreness: 25 },
      { muscle: "Core", soreness: 8 },
    ],
  };
}
