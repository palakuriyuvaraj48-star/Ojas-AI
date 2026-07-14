import type { PoseFrame } from "./types";

export interface RepCounterUpdate { reps: number; partialReps: number; completed: boolean; }
export interface RepCounterService { reset(): void; update(pose: PoseFrame, exercise: string): RepCounterUpdate; }
