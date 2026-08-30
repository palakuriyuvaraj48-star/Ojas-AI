// Shared types for the Smart Form Coach computer-vision pipeline.
// Keeping the original lightweight types and extending them with the full
// domain model used by the analyzer, rep counter, scoring, and storage layers.

export type CameraFacingMode = "user" | "environment";

export interface CameraPreferences {
  deviceId?: string;
  facingMode: CameraFacingMode;
  width: number;
  height: number;
  frameRate: number;
  mirrored: boolean;
}

export interface PoseLandmark {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  z?: number;
  visibility: number; // 0..1
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  confidence: number;
  timestamp: number;
  source: "mediapipe" | "simulation";
}

export interface ExerciseResult {
  exercise: string;
  confidence: number;
}

export interface FormResult {
  score: number;
  feedback: string[];
  jointAngles: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Joint / skeleton model
// ---------------------------------------------------------------------------

export type JointName =
  | "head"
  | "neck"
  | "leftShoulder"
  | "rightShoulder"
  | "leftElbow"
  | "rightElbow"
  | "leftWrist"
  | "rightWrist"
  | "spine"
  | "pelvis"
  | "leftHip"
  | "rightHip"
  | "leftKnee"
  | "rightKnee"
  | "leftAnkle"
  | "rightAnkle";

export type JointMap = Record<JointName, PoseLandmark>;

export type ExerciseCategory =
  | "squat"
  | "press"
  | "pull"
  | "hinge"
  | "lunge"
  | "isometric";

// ---------------------------------------------------------------------------
// Live analysis outputs
// ---------------------------------------------------------------------------

export type TempoPhase = "lowering" | "pause" | "lifting" | "resting";

export interface TempoRep {
  loweringMs: number;
  pauseMs: number;
  liftingMs: number;
  totalMs: number;
}

export interface TempoState {
  phase: TempoPhase;
  phaseElapsedMs: number;
  lastRep?: TempoRep;
}

export interface RomState {
  joint: string;
  minAngle: number;
  maxAngle: number;
  observedRange: number;
  expectedRange: number;
  // 0..1 — how complete the movement appears vs the expected range
  completeness: number;
  shallow: boolean;
}

export interface SymmetryState {
  joint: string;
  leftAngle: number;
  rightAngle: number;
  asymmetryPct: number;
  // 0..1 — 1 = perfectly symmetric
  symmetryIndex: number;
  flagged: boolean;
}

export interface QualityMetrics {
  stability: number; // 0..100
  consistency: number; // 0..100
  tempo: number; // 0..100
  control: number; // 0..100
  rangeOfMotion: number; // 0..100
}

export type FeedbackSeverity = "info" | "success" | "warning" | "danger";

export type MovementPhase = "ready" | "descending" | "bottom" | "ascending" | "complete";

export interface FormFeedback {
  id: string;
  severity: FeedbackSeverity;
  message: string;
  joint?: JointName;
  cue?: string;
  what?: string;
  why?: string;
  how?: string;
}

export interface FormScore {
  total: number; // 0..100
  metrics: QualityMetrics;
  explanation: string[];
}

// ---------------------------------------------------------------------------
// Reps / sets
// ---------------------------------------------------------------------------

export interface RepRecord {
  index: number;
  loweringMs: number;
  liftingMs: number;
  pauseMs: number;
  maxFlexion: number; // deepest angle reached
  rom: number; // range for this rep
  symmetryIndex: number;
  partial: boolean;
  score: number;
  issue?: string;
  why?: string;
  how?: string;
  metrics?: QualityMetrics;
}

export interface RepCounterUpdate { reps: number; partialReps: number; completed: boolean; rep?: RepRecord; }

export interface SetRecord {
  setNumber: number;
  exercise: string;
  reps: number;
  partialReps: number;
  durationMs: number;
  avgScore: number;
  avgRom: number;
  avgSymmetry: number;
  tempoStartMs: number;
  tempoEndMs: number;
}

export interface LiveCoaching {
  strengths: string[];
  improvements: string[];
  corrections: string[]; // 1-2 actionable cues
  summary: string;
}

// ---------------------------------------------------------------------------
// Exercise definitions
// ---------------------------------------------------------------------------

export interface JointRule {
  joint: string;
  // expected angle at the bottom (most flexed) position
  bottomAngle: number;
  // expected angle at the top (extended) position
  topAngle: number;
  // acceptable tolerance in degrees
  tolerance: number;
  // which end is "good form" (for warning when outside)
  label: string;
}

export interface ExerciseTutorial {
  demoVideoUrl: string;
  instructions: string[];
  commonMistakes: string[];
  coachingCues: string[];
  setup: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: string;
  primaryJoint: string; // joint whose angle drives the rep
  // rep counting thresholds on the primary joint angle
  repTopAngle: number;
  repBottomAngle: number;
  expectedRom: number; // expected range of motion in degrees
  group: "lower" | "upper" | "core";
  rules: JointRule[];
  cues: string[];
  tutorial: ExerciseTutorial;
}

// ---------------------------------------------------------------------------
// Sessions / persistence
// ---------------------------------------------------------------------------

export interface AiFeedbackRecord {
  id: string;
  setNumber: number;
  exercise: string;
  strengths: string[];
  improvements: string[];
  corrections: string[];
  summary: string;
  createdAt: string;
}

export interface CameraSessionRecord {
  id: string;
  exercise: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  sets: number;
  reps: number;
  partialReps: number;
  formScore: number;
  avgRom: number;
  avgSymmetry: number;
  bestRepScore: number;
  notes: string;
  feedback: AiFeedbackRecord[];
  source: "mediapipe" | "simulation";
  hasVideo: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface RepHistoryRecord {
  id: string;
  sessionId: string;
  exercise: string;
  setNumber: number;
  repIndex: number;
  score: number;
  rom: number;
  symmetryIndex: number;
  partial: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalReps: number;
  avgFormScore: number;
  bestFormScore: number;
  sessionsThisWeek: number;
  formScoreTrend: { name: string; value: number }[];
  repQualityTrend: { name: string; value: number }[];
  consistencyTrend: { name: string; value: number }[];
  frequencyTrend: { name: string; value: number }[];
  topExercises: { name: string; reps: number; score: number }[];
}

export interface VisionSessionInput {
  exercise: string;
  durationMs: number;
  sets: number;
  reps: number;
  partialReps: number;
  formScore: number;
  avgRom: number;
  avgSymmetry: number;
  bestRepScore: number;
  notes?: string;
  feedback?: Omit<AiFeedbackRecord, "id" | "createdAt">[];
  source?: "mediapipe" | "simulation";
  hasVideo?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export type CameraMode = "simulation" | "live";
