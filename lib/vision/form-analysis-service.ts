/**
 * Multi-Exercise Form Analysis Service for OJAS AI
 * Supports Barbell Squat, Push-up, Deadlift, Bench Press, and Pull-up.
 */

export interface ExerciseReference {
  id: string;
  name: string;
  category: "squat" | "press" | "hinge" | "pull";
  targetAngles: {
    [jointName: string]: { min: number; max: number; ideal: number; label: string };
  };
  keyPoints: string[];
  description: string;
  commonMistakes: string[];
}

export const EXERCISE_REFERENCES: Record<string, ExerciseReference> = {
  squat: {
    id: "squat",
    name: "Barbell Squat",
    category: "squat",
    targetAngles: {
      kneeAngle: { min: 85, max: 105, ideal: 95, label: "Knee Flexion Depth" },
      hipAngle: { min: 75, max: 95, ideal: 85, label: "Hip Hinge Angle" },
      spineAngle: { min: 15, max: 40, ideal: 25, label: "Torso Incline" },
    },
    keyPoints: ["knee", "hip", "ankle", "torso"],
    description: "Target parallel depth: ~95° knee flexion with neutral spine and chest proud.",
    commonMistakes: [
      "Knees caving inward (valgus collapse)",
      "Excessive forward torso lean",
      "Heels rising off the floor",
      "Shallow squat depth (>110°)"
    ]
  },
  "push-up": {
    id: "push-up",
    name: "Push-up",
    category: "press",
    targetAngles: {
      elbowAngle: { min: 65, max: 90, ideal: 75, label: "Elbow Flexion" },
      shoulderAngle: { min: 75, max: 100, ideal: 85, label: "Shoulder Flare" },
      bodyAlignment: { min: 165, max: 180, ideal: 175, label: "Rigid Plank Line" },
    },
    keyPoints: ["elbow", "shoulder", "hip", "ankle"],
    description: "Full range of motion until chest reaches floor level while maintaining a rigid plank.",
    commonMistakes: [
      "Elbows flaring excessively wide (>95°)",
      "Sagging lower back and hips",
      "Incomplete depth (elbows >95°)",
      "Head jutting forward"
    ]
  },
  deadlift: {
    id: "deadlift",
    name: "Deadlift",
    category: "hinge",
    targetAngles: {
      hipAngle: { min: 35, max: 55, ideal: 45, label: "Hip Hinge Angle" },
      kneeAngle: { min: 70, max: 95, ideal: 82, label: "Knee Flexion" },
      spineAngle: { min: 20, max: 35, ideal: 26, label: "Neutral Spine Angle" },
    },
    keyPoints: ["hip", "knee", "spine", "shoulder"],
    description: "Neutral lumbar spine, tight lats, and aggressive hip drive off the floor.",
    commonMistakes: [
      "Rounded lumbar spine",
      "Bar drifting away from shins",
      "Hips shooting up before the chest",
      "Hyperextending at lockout"
    ]
  },
  "bench-press": {
    id: "bench-press",
    name: "Bench Press",
    category: "press",
    targetAngles: {
      elbowAngle: { min: 70, max: 90, ideal: 78, label: "Elbow Angle at Bottom" },
      shoulderAngle: { min: 70, max: 95, ideal: 80, label: "Arm Flare Angle" },
      wristAngle: { min: 170, max: 180, ideal: 175, label: "Stacked Wrist" },
    },
    keyPoints: ["elbow", "shoulder", "wrist"],
    description: "Retracted scapulae, stable foot drive, and ~45° elbow tuck touching mid-chest.",
    commonMistakes: [
      "Elbows flared out to 90°",
      "Bouncing the bar off the chest",
      "Lifting hips off the bench",
      "Bent wrists"
    ]
  },
  "pull-up": {
    id: "pull-up",
    name: "Pull-up",
    category: "pull",
    targetAngles: {
      elbowAngle: { min: 35, max: 60, ideal: 45, label: "Peak Elbow Flexion" },
      shoulderAngle: { min: 150, max: 180, ideal: 170, label: "Scapula Depression" },
      bodySwing: { min: 0, max: 15, ideal: 5, label: "Body Sway Control" },
    },
    keyPoints: ["elbow", "shoulder", "torso"],
    description: "Dead-hang start to chin clearly clearing the bar with zero kipping momentum.",
    commonMistakes: [
      "Kipping / swinging lower body",
      "Partial range of motion",
      "Shoulder shrug at the top",
      "Failing to reach full dead-hang at bottom"
    ]
  }
};

export interface FormAnalysisResult {
  exerciseId: string;
  exerciseName: string;
  score: number; // 0-100
  issues: string[];
  corrections: string[];
  measuredAngles: Record<string, number>;
  repQuality: "excellent" | "good" | "needs_adjustment" | "poor";
  digitalTwinImpact: string;
}

export class FormAnalysisService {
  analyzeForm(
    currentAngles: Record<string, number>,
    exerciseId: string
  ): FormAnalysisResult {
    const reference = EXERCISE_REFERENCES[exerciseId] || EXERCISE_REFERENCES["squat"];
    let score = 100;
    const issues: string[] = [];
    const corrections: string[] = [];

    for (const [angleKey, target] of Object.entries(reference.targetAngles)) {
      const val = currentAngles[angleKey];
      if (typeof val !== "number") continue;

      if (val < target.min) {
        const deviation = target.min - val;
        const penalty = Math.min(20, Math.round(deviation * 0.8));
        score -= penalty;
        issues.push(`${target.label}: Too steep (${Math.round(val)}°, ideal ~${target.ideal}°)`);
        corrections.push(`Adjust ${target.label.toLowerCase()} closer to target ${target.min}°-${target.max}°`);
      } else if (val > target.max) {
        const deviation = val - target.max;
        const penalty = Math.min(20, Math.round(deviation * 0.8));
        score -= penalty;
        issues.push(`${target.label}: Too shallow (${Math.round(val)}°, ideal ~${target.ideal}°)`);
        corrections.push(`Increase ${target.label.toLowerCase()} range towards ${target.ideal}°`);
      }
    }

    const finalScore = Math.max(10, Math.min(100, score));
    const repQuality =
      finalScore >= 88 ? "excellent" :
      finalScore >= 75 ? "good" :
      finalScore >= 60 ? "needs_adjustment" : "poor";

    const digitalTwinImpact =
      finalScore >= 85
        ? "Form quality verified: Progressive load approved for next workout."
        : finalScore >= 70
        ? "Minor form deviation: Load maintained to enforce technique mastery."
        : "Form breakdown detected: Auto-reducing next workout load by 10% to prevent injury.";

    return {
      exerciseId: reference.id,
      exerciseName: reference.name,
      score: finalScore,
      issues,
      corrections,
      measuredAngles: currentAngles,
      repQuality,
      digitalTwinImpact,
    };
  }
}

export const formAnalysisService = new FormAnalysisService();
