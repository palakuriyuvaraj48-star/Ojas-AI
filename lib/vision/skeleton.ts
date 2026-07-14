// 2D skeletal model + keyframe poses for the Smart Form Coach.
// The synthetic detector drives these poses so the analyzer, rep counter and
// scorer all operate on mathematically consistent joint angles. The same angle
// math is reused for real MediaPipe landmarks.

import type { JointName, JointMap, PoseLandmark } from "./types";

export const JOINT_NAMES: JointName[] = [
  "head", "neck", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
  "leftWrist", "rightWrist", "spine", "pelvis", "leftHip", "rightHip",
  "leftKnee", "rightKnee", "leftAnkle", "rightAnkle",
];

// Default standing pose (normalized 0..1, y down).
const STANDING: Record<JointName, [number, number]> = {
  head: [0.5, 0.08],
  neck: [0.5, 0.16],
  leftShoulder: [0.42, 0.20],
  rightShoulder: [0.58, 0.20],
  leftElbow: [0.40, 0.36],
  rightElbow: [0.60, 0.36],
  leftWrist: [0.39, 0.52],
  rightWrist: [0.61, 0.52],
  spine: [0.5, 0.34],
  pelvis: [0.5, 0.50],
  leftHip: [0.44, 0.52],
  rightHip: [0.56, 0.52],
  leftKnee: [0.44, 0.74],
  rightKnee: [0.56, 0.74],
  leftAnkle: [0.44, 0.95],
  rightAnkle: [0.56, 0.95],
};

type Coords = Partial<Record<JointName, [number, number]>>;

function merge(base: Coords, override: Coords): Record<JointName, [number, number]> {
  const out = { ...STANDING } as Record<JointName, [number, number]>;
  for (const name of JOINT_NAMES) {
    if (override[name]) out[name] = override[name] as [number, number];
    else if (base[name]) out[name] = base[name] as [number, number];
  }
  return out;
}

// ---- Archetype keyframe poses ---------------------------------------------

const SQUAT_TOP = merge(STANDING, {});
const SQUAT_BOTTOM: Coords = {
  head: [0.5, 0.26], neck: [0.5, 0.34], spine: [0.5, 0.50],
  leftShoulder: [0.41, 0.38], rightShoulder: [0.59, 0.38],
  leftElbow: [0.36, 0.50], rightElbow: [0.64, 0.50],
  leftWrist: [0.40, 0.60], rightWrist: [0.60, 0.60],
  pelvis: [0.5, 0.66], leftHip: [0.43, 0.67], rightHip: [0.57, 0.67],
  leftKnee: [0.38, 0.74], rightKnee: [0.62, 0.74],
  leftAnkle: [0.42, 0.95], rightAnkle: [0.58, 0.95],
};

const HINGE_TOP = merge(STANDING, {});
const HINGE_BOTTOM: Coords = {
  head: [0.54, 0.24], neck: [0.52, 0.30], spine: [0.5, 0.45],
  leftShoulder: [0.50, 0.33], rightShoulder: [0.55, 0.33],
  leftElbow: [0.50, 0.50], rightElbow: [0.56, 0.52],
  leftWrist: [0.50, 0.66], rightWrist: [0.56, 0.68],
  pelvis: [0.5, 0.52], leftHip: [0.45, 0.53], rightHip: [0.55, 0.53],
  leftKnee: [0.45, 0.70], rightKnee: [0.55, 0.70],
  leftAnkle: [0.45, 0.95], rightAnkle: [0.55, 0.95],
};

const LUNGE_TOP = merge(STANDING, {});
const LUNGE_BOTTOM: Coords = {
  head: [0.5, 0.26], neck: [0.5, 0.34], spine: [0.5, 0.49],
  leftShoulder: [0.42, 0.38], rightShoulder: [0.58, 0.38],
  leftElbow: [0.40, 0.52], rightElbow: [0.60, 0.52],
  leftWrist: [0.42, 0.64], rightWrist: [0.58, 0.64],
  pelvis: [0.5, 0.62], leftHip: [0.44, 0.63], rightHip: [0.56, 0.63],
  leftKnee: [0.40, 0.86], rightKnee: [0.62, 0.78],
  leftAnkle: [0.40, 0.95], rightAnkle: [0.70, 0.95],
};

const PUSHUP_TOP: Coords = {
  head: [0.5, 0.30], neck: [0.5, 0.36], spine: [0.5, 0.52], pelvis: [0.5, 0.64],
  leftShoulder: [0.40, 0.37], rightShoulder: [0.60, 0.37],
  leftElbow: [0.40, 0.55], rightElbow: [0.60, 0.55],
  leftWrist: [0.40, 0.74], rightWrist: [0.60, 0.74],
  leftHip: [0.45, 0.65], rightHip: [0.55, 0.65],
  leftKnee: [0.45, 0.90], rightKnee: [0.55, 0.90],
  leftAnkle: [0.45, 0.98], rightAnkle: [0.55, 0.98],
};
const PUSHUP_BOTTOM: Coords = {
  head: [0.5, 0.40], neck: [0.5, 0.46], spine: [0.5, 0.62], pelvis: [0.5, 0.74],
  leftShoulder: [0.40, 0.47], rightShoulder: [0.60, 0.47],
  leftElbow: [0.34, 0.58], rightElbow: [0.66, 0.58],
  leftWrist: [0.34, 0.74], rightWrist: [0.66, 0.74],
  leftHip: [0.45, 0.75], rightHip: [0.55, 0.75],
  leftKnee: [0.45, 0.90], rightKnee: [0.55, 0.90],
  leftAnkle: [0.45, 0.98], rightAnkle: [0.55, 0.98],
};

const PRESS_TOP: Coords = {
  head: [0.5, 0.10], neck: [0.5, 0.18], spine: [0.5, 0.34], pelvis: [0.5, 0.50],
  leftShoulder: [0.42, 0.22], rightShoulder: [0.58, 0.22],
  leftElbow: [0.42, 0.08], rightElbow: [0.58, 0.08],
  leftWrist: [0.42, 0.0], rightWrist: [0.58, 0.0],
  leftHip: [0.44, 0.52], rightHip: [0.56, 0.52],
  leftKnee: [0.44, 0.74], rightKnee: [0.56, 0.74],
  leftAnkle: [0.44, 0.95], rightAnkle: [0.56, 0.95],
};
const PRESS_BOTTOM: Coords = {
  head: [0.5, 0.10], neck: [0.5, 0.18], spine: [0.5, 0.34], pelvis: [0.5, 0.50],
  leftShoulder: [0.42, 0.22], rightShoulder: [0.58, 0.22],
  leftElbow: [0.36, 0.30], rightElbow: [0.64, 0.30],
  leftWrist: [0.40, 0.20], rightWrist: [0.60, 0.20],
  leftHip: [0.44, 0.52], rightHip: [0.56, 0.52],
  leftKnee: [0.44, 0.74], rightKnee: [0.56, 0.74],
  leftAnkle: [0.44, 0.95], rightAnkle: [0.56, 0.95],
};

const CURL_TOP = merge(STANDING, {
  leftElbow: [0.40, 0.36], rightElbow: [0.60, 0.36],
  leftWrist: [0.39, 0.52], rightWrist: [0.61, 0.52],
});
const CURL_BOTTOM: Coords = {
  leftShoulder: [0.42, 0.20], rightShoulder: [0.58, 0.20],
  leftElbow: [0.38, 0.32], rightElbow: [0.62, 0.32],
  leftWrist: [0.43, 0.22], rightWrist: [0.57, 0.22],
};

const PUSHDOWN_TOP: Coords = {
  leftShoulder: [0.42, 0.20], rightShoulder: [0.58, 0.20],
  leftElbow: [0.37, 0.26], rightElbow: [0.63, 0.26],
  leftWrist: [0.43, 0.16], rightWrist: [0.57, 0.16],
};
const PUSHDOWN_BOTTOM: Coords = {
  leftShoulder: [0.42, 0.20], rightShoulder: [0.58, 0.20],
  leftElbow: [0.42, 0.34], rightElbow: [0.58, 0.34],
  leftWrist: [0.42, 0.52], rightWrist: [0.58, 0.52],
};

const ROW_TOP: Coords = {
  leftShoulder: [0.42, 0.20], rightShoulder: [0.58, 0.20],
  leftElbow: [0.42, 0.40], rightElbow: [0.58, 0.40],
  leftWrist: [0.42, 0.58], rightWrist: [0.58, 0.58],
};
const ROW_BOTTOM: Coords = {
  leftShoulder: [0.42, 0.20], rightShoulder: [0.58, 0.20],
  leftElbow: [0.37, 0.38], rightElbow: [0.63, 0.38],
  leftWrist: [0.40, 0.30], rightWrist: [0.60, 0.30],
};

const PLANK: Coords = {
  head: [0.5, 0.34], neck: [0.5, 0.40], spine: [0.5, 0.56], pelvis: [0.5, 0.70],
  leftShoulder: [0.42, 0.41], rightShoulder: [0.58, 0.41],
  leftElbow: [0.40, 0.58], rightElbow: [0.60, 0.58],
  leftWrist: [0.40, 0.72], rightWrist: [0.60, 0.72],
  leftHip: [0.45, 0.71], rightHip: [0.55, 0.71],
  leftKnee: [0.45, 0.90], rightKnee: [0.55, 0.90],
  leftAnkle: [0.45, 0.98], rightAnkle: [0.55, 0.98],
};

export interface PoseKeyframes {
  top: Coords;
  bottom: Coords;
}

const KEYFRAMES: Record<string, PoseKeyframes> = {
  squat: { top: SQUAT_TOP, bottom: SQUAT_BOTTOM },
  hinge: { top: HINGE_TOP, bottom: HINGE_BOTTOM },
  lunge: { top: LUNGE_TOP, bottom: LUNGE_BOTTOM },
  pushup: { top: PUSHUP_TOP, bottom: PUSHUP_BOTTOM },
  press: { top: PRESS_TOP, bottom: PRESS_BOTTOM },
  curl: { top: CURL_TOP, bottom: CURL_BOTTOM },
  pushdown: { top: PUSHDOWN_TOP, bottom: PUSHDOWN_BOTTOM },
  row: { top: ROW_TOP, bottom: ROW_BOTTOM },
  plank: { top: PLANK, bottom: PLANK },
};

export function getKeyframes(archetype: string): PoseKeyframes {
  return KEYFRAMES[archetype] ?? KEYFRAMES.squat;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPose(a: Coords, b: Coords, t: number): Record<JointName, [number, number]> {
  const out = {} as Record<JointName, [number, number]>;
  for (const name of JOINT_NAMES) {
    const av = a[name] ?? STANDING[name];
    const bv = b[name] ?? STANDING[name];
    out[name] = [lerp(av[0], bv[0], t), lerp(av[1], bv[1], t)];
  }
  return out;
}

export function toJointMap(coords: Coords, visibility = 0.98): JointMap {
  const out = {} as JointMap;
  for (const name of JOINT_NAMES) {
    const [x, y] = coords[name] ?? STANDING[name];
    out[name] = { x, y, visibility } as PoseLandmark;
  }
  return out;
}

// ---- Geometry helpers ------------------------------------------------------

export function vec(a: [number, number], b: [number, number]): [number, number] {
  return [b[0] - a[0], b[1] - a[1]];
}

export function angleAtVertex(a: [number, number], b: [number, number], c: [number, number]): number {
  const v1 = vec(b, a);
  const v2 = vec(b, c);
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  if (m1 === 0 || m2 === 0) return 180;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Angle of a vector relative to straight down (0 = vertical, 90 = horizontal).
export function angleFromVertical(a: [number, number], b: [number, number]): number {
  const [dx, dy] = vec(a, b);
  const len = Math.hypot(dx, dy) || 1;
  const cos = Math.min(1, Math.max(-1, dy / len));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function computeJointAngles(j: JointMap): Record<string, number> {
  const p = (n: JointName): [number, number] => [j[n].x, j[n].y];
  const kneeL = angleAtVertex(p("leftHip"), p("leftKnee"), p("leftAnkle"));
  const kneeR = angleAtVertex(p("rightHip"), p("rightKnee"), p("rightAnkle"));
  const hipL = angleAtVertex(p("leftShoulder"), p("leftHip"), p("leftKnee"));
  const hipR = angleAtVertex(p("rightShoulder"), p("rightHip"), p("rightKnee"));
  const elbowL = angleAtVertex(p("leftShoulder"), p("leftElbow"), p("leftWrist"));
  const elbowR = angleAtVertex(p("rightShoulder"), p("rightElbow"), p("rightWrist"));
  const shoulderL = angleAtVertex(p("neck"), p("leftShoulder"), p("leftElbow"));
  const shoulderR = angleAtVertex(p("neck"), p("rightShoulder"), p("rightElbow"));
  const torso = angleFromVertical(p("pelvis"), p("neck"));
  const spine = angleAtVertex(p("neck"), p("spine"), p("pelvis"));
  const ankleL = angleAtVertex(p("leftKnee"), p("leftAnkle"), [p("leftAnkle")[0], p("leftAnkle")[1] + 0.1]);
  const ankleR = angleAtVertex(p("rightKnee"), p("rightAnkle"), [p("rightAnkle")[0], p("rightAnkle")[1] + 0.1]);
  return {
    kneeL, kneeR, kneeAngle: (kneeL + kneeR) / 2,
    hipL, hipR, hipAngle: (hipL + hipR) / 2,
    elbowL, elbowR, elbowAngle: (elbowL + elbowR) / 2,
    shoulderL, shoulderR, shoulderAngle: (shoulderL + shoulderR) / 2,
    torso, spine, ankleL, ankleR,
  };
}
