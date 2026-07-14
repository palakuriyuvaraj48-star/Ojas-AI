import type { ExerciseResult, PoseFrame, JointMap } from "./types";
import { computeJointAngles, JOINT_NAMES } from "./skeleton";

export interface ExerciseDetectionService {
  detect(pose: PoseFrame): ExerciseResult;
}

export class DefaultExerciseDetector implements ExerciseDetectionService {
  detect(frame: PoseFrame): ExerciseResult {
    if (!frame.landmarks || frame.confidence < 0.4) {
      return { exercise: "unknown", confidence: 0 };
    }

    // Convert landmark array to JointMap using JOINT_NAMES ordering
    const joints = {} as JointMap;
    JOINT_NAMES.forEach((name, idx) => {
      const lm = frame.landmarks[idx];
      if (lm) {
        joints[name] = { x: lm.x, y: lm.y, visibility: lm.visibility ?? 0.9 };
      }
    });

    const angles = computeJointAngles(joints);

    const kneeAngle = angles.kneeAngle ?? 180;
    const hipAngle = angles.hipAngle ?? 180;
    const elbowAngle = angles.elbowAngle ?? 180;
    const shoulderAngle = angles.shoulderAngle ?? 180;
    const torso = angles.torso ?? 0;

    // 1. Plank & Push-up (Horizontal Torso)
    if (torso > 65) {
      if (elbowAngle < 110) {
        return { exercise: "push-up", confidence: 0.85 };
      }
      return { exercise: "plank", confidence: 0.8 };
    }

    // 2. Biceps Curl (Low shoulder elevation, flexing elbows)
    if (elbowAngle < 115 && shoulderAngle < 45 && torso < 25) {
      return { exercise: "biceps-curl", confidence: 0.9 };
    }

    // 3. Shoulder Press (High shoulder elevation, flexing elbows overhead)
    if (elbowAngle < 125 && shoulderAngle > 90) {
      return { exercise: "shoulder-press", confidence: 0.88 };
    }

    // 4. Squat (Flexed knees & hips, vertical torso)
    if (kneeAngle < 125 && hipAngle < 120) {
      return { exercise: "squat", confidence: 0.92 };
    }

    // 5. Lunge (Split stance flexion)
    if (kneeAngle < 135 && hipAngle > 135) {
      return { exercise: "lunge", confidence: 0.75 };
    }

    // 6. Pull-up
    if (shoulderAngle > 140 && elbowAngle < 130) {
      return { exercise: "pull-up", confidence: 0.82 };
    }

    // Default fallback to Squat
    return { exercise: "squat", confidence: 0.5 };
  }
}
