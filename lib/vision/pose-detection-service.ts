import type { PoseFrame } from "./types";

/** Adapter boundary for MediaPipe Tasks Vision, MoveNet, or BlazePose. */
export interface PoseDetectionService {
  initialize(): Promise<void>;
  detect(video: HTMLVideoElement): Promise<PoseFrame | null>;
  dispose(): void;
}
