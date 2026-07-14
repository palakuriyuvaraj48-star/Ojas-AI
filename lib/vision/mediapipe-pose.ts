// MediaPipe Tasks Vision adapter. Loaded lazily from the official CDN so it
// never breaks the build or requires an npm dependency. If the model or network
// is unavailable the caller falls back to the synthetic engine.

import type { JointName, PoseFrame, PoseLandmark } from "./types";
import { JOINT_NAMES } from "./skeleton";

const MP_VERSION = "0.10.14";
const MP_MODULE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}`;
export const MP_WASM_PATH = `${MP_MODULE_URL}/wasm`;
export const MP_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// MediaPipe BlazePose landmark indices we care about.
const IDX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

interface MpLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface MpModule {
  PoseLandmarker: any;
  FilesetResolver: any;
}

function loadModule(): Promise<MpModule> {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  const w = window as any;
  if (w.__titanMp) return Promise.resolve(w.__titanMp as MpModule);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.type = "module";
    s.textContent = `import * as mp from '${MP_MODULE_URL}'; window.__titanMp = mp;`;
    s.onerror = () => reject(new Error("mp-script-failed"));
    document.body.appendChild(s);
    const start = Date.now();
    const iv = setInterval(() => {
      if (w.__titanMp) {
        clearInterval(iv);
        resolve(w.__titanMp as MpModule);
      } else if (Date.now() - start > 18000) {
        clearInterval(iv);
        reject(new Error("mp-timeout"));
      }
    }, 200);
  });
}

export class MediaPipePoseDetector {
  private landmarker: any = null;
  private module: MpModule | null = null;
  private lastVideoTime = -1;
  private ready = false;

  get isReady() {
    return this.ready;
  }

  async init(modelUrl: string = MP_MODEL_URL, wasmPath: string = MP_WASM_PATH): Promise<boolean> {
    try {
      this.module = await loadModule();
      const fileset = await this.module.FilesetResolver.forVisionTasks(wasmPath);
      this.landmarker = await this.module.PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: modelUrl, delegate: "GPU" },
        runningMode: "VIDEO",
        numPoses: 1,
      });
      this.ready = true;
      return true;
    } catch {
      this.ready = false;
      return false;
    }
  }

  async detect(video: HTMLVideoElement): Promise<PoseFrame | null> {
    if (!this.landmarker || video.readyState < 2) return null;
    const now = performance.now();
    if (video.currentTime === this.lastVideoTime) return null;
    this.lastVideoTime = video.currentTime;
    try {
      const result = this.landmarker.detectForVideo(video, now);
      const lm: MpLandmark[] = result.landmarks?.[0];
      if (!lm) return null;
      return { landmarks: this.toLandmarks(lm), confidence: avgVisibility(lm), timestamp: now, source: "mediapipe" };
    } catch {
      return null;
    }
  }

  private toLandmarks(lm: MpLandmark[]): PoseLandmark[] {
    const get = (i: number) => lm[i] ?? { x: 0.5, y: 0.5, z: 0, visibility: 0 };
    const avg = (a: MpLandmark, b: MpLandmark) => ({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      z: (a.z + b.z) / 2,
      visibility: ((a.visibility ?? 1) + (b.visibility ?? 1)) / 2,
    });
    const ls = get(IDX.leftShoulder);
    const rs = get(IDX.rightShoulder);
    const lh = get(IDX.leftHip);
    const rh = get(IDX.rightHip);
    const neck = avg(ls, rs);
    const pelvis = avg(lh, rh);
    const spine = {
      x: (neck.x + pelvis.x) / 2,
      y: (neck.y + pelvis.y) / 2,
      z: (neck.z + pelvis.z) / 2,
      visibility: (neck.visibility + pelvis.visibility) / 2,
    };
    const map: Record<JointName, MpLandmark> = {
      head: get(IDX.nose),
      neck,
      leftShoulder: ls,
      rightShoulder: rs,
      leftElbow: get(IDX.leftElbow),
      rightElbow: get(IDX.rightElbow),
      leftWrist: get(IDX.leftWrist),
      rightWrist: get(IDX.rightWrist),
      spine,
      pelvis,
      leftHip: lh,
      rightHip: rh,
      leftKnee: get(IDX.leftKnee),
      rightKnee: get(IDX.rightKnee),
      leftAnkle: get(IDX.leftAnkle),
      rightAnkle: get(IDX.rightAnkle),
    };
    return JOINT_NAMES.map((k) => {
      const p = map[k];
      return { x: p.x, y: p.y, z: p.z, visibility: p.visibility ?? 0.9 };
    });
  }

  dispose() {
    try {
      this.landmarker?.close?.();
    } catch {
      /* ignore */
    }
    this.landmarker = null;
    this.ready = false;
  }
}

function avgVisibility(lm: MpLandmark[]): number {
  const total = lm.reduce((a, l) => a + (l.visibility ?? 1), 0);
  return total / lm.length;
}
