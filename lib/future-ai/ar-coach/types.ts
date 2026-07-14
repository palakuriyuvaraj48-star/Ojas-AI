/**
 * AR Workout Assistant — domain types (Feature 147)
 *
 * Experimental feature set — all predictions are estimates and NOT medical advice.
 */

import type { ConfidenceLevel } from "@/lib/future-ai/types";
export type { ConfidenceLevel };

export type ARCoachMode = "beginner" | "form" | "power" | "endurance";

export type JointName =
  | "elbow"
  | "shoulder"
  | "knee"
  | "hip"
  | "spine"
  | "ankle";

export type MovementPhase = "lifting" | "lowering" | "pause" | "transition";

export type MovementClassification =
  | "correct"
  | "partial"
  | "compensated"
  | "incomplete";

export type CueType = "form" | "tempo" | "encouragement" | "warning";

export type CuePriority = "low" | "medium" | "high";

/** A single sampled joint angle at a point in time during a session. */
export interface JointAngleSample {
  /** Frame index / monotonic sample counter. */
  t: number;
  joint: JointName;
  /** Observed joint angle in degrees. */
  angle: number;
  /** Phase of motion this sample belongs to. */
  phase: MovementPhase;
  /** Range of motion observed for the joint so far (degrees). */
  rangeOfMotion: number;
}

/** A coaching cue returned by processing a frame. */
export interface CoachingCue {
  id: string;
  text: string;
  type: CueType;
  priority: CuePriority;
  /** Whether this cue should be spoken aloud via the voice toggle. */
  spoken: boolean;
}

export interface Mistake {
  name: string;
  /** Frequency of occurrence within the session, 0..1. */
  frequency: number;
  severity: "low" | "medium" | "high";
}

export interface ImprovementSuggestion {
  title: string;
  description: string;
  /** Confidence, 0..1. */
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  /** A drill the user can perform to address the issue. */
  drill: string;
}

/**
 * A live or finalized AR coaching session. This is the rich domain object
 * produced by the engine; the persistence layer stores a flattened record.
 */
export interface ARCoachSession {
  id: string;
  userId: string;
  exercise: string;
  mode: ARCoachMode;
  startedAt: string;
  endedAt?: string;
  reps: number;
  sets: number;
  /** Duration in seconds. */
  duration: number;
  /** Live form score, 0..100. */
  formScore: number;
  /** Movement quality, 0..100. */
  movementQuality: number;
  /** Fatigue indicator, 0..100. */
  fatigueIndicator: number;
  commonMistakes: string[];
  improvementSuggestions: string[];
  recordingUrl?: string;
  seed?: number;
  jointAngles: JointAngleSample[];
  metadata: Record<string, unknown>;
}

/** Per-day aggregated analytics for trend charts. */
export interface ARCoachAnalytics {
  id: string;
  userId: string;
  date: string;
  exercise: string;
  movementQuality: number;
  consistency: number;
  fatigueIndicator: number;
  jointStress: number;
  /** Average tempo score, 0..100. */
  tempo: number;
}

/** Request payload to start an AR coaching session. */
export interface ARCoachRequest {
  exercise: string;
  mode: ARCoachMode;
  reducedMotion: boolean;
  userId?: string;
}

/** A single frame submitted for processing. */
export interface ARCoachFrame {
  /** Optional client timestamp (ms). */
  t?: number;
  /** Pose detector confidence, 0..1. */
  confidence?: number;
  /** Optional raw joint angles if a real detector is wired in. */
  rawAngles?: Partial<Record<JointName, number>>;
  /** Hint that the frame is synthetic (default true for the demo). */
  simulated?: boolean;
}

/** Result of processing a single frame. */
export interface ARCoachFrameResult {
  session: ARCoachSession;
  cue: CoachingCue;
  phase: MovementPhase;
  classification: MovementClassification;
  rangeOfMotion: number;
  /** True when this frame completed a rep. */
  repCounted: boolean;
}

export interface ARCoachInsights {
  movementQuality: number;
  consistency: number;
  fatigueIndicator: number;
  commonMistakes: Mistake[];
  improvementSuggestions: ImprovementSuggestion[];
  predictedPlateau?: {
    risk: number;
    note: string;
  };
}

export interface TempoAnalysis {
  liftingMs: number;
  loweringMs: number;
  pauseMs: number;
  /** Composite tempo score, 0..100. */
  tempoScore: number;
  /** Lowering / lifting time ratio (eccentric emphasis). */
  eccentricRatio: number;
}

export interface JointStressResult {
  /** Overall estimated joint loading, 0..100. */
  overall: number;
  perJoint: Partial<Record<JointName, number>>;
}

/** Definition of a supported exercise for the library view. */
export interface ARExerciseDef {
  id: string;
  name: string;
  /** lucide-react icon name used by the library list. */
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  primaryJoint: JointName;
  /** Angle (deg) at the bottom / extended position. */
  extendedAngle: number;
  /** Angle (deg) at the top / flexed position. */
  flexedAngle: number;
  formTips: string[];
  idealPattern: "curl" | "squat" | "press" | "hinge" | "row";
}
