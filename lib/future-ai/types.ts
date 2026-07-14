/**
 * Future AI shared types (Phase 15)
 * Experimental feature set — not medical advice.
 */

export type ConfidenceLevel = "low" | "moderate" | "high" | "very-high";
export type PredictionHorizon = "daily" | "weekly" | "monthly" | "yearly" | "longterm";
export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type PredictionDrift = "stable" | "improving" | "degrading" | "volatile";

export interface PredictionMeta {
  id: string;
  userId: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  timestamp: string;
  horizon: PredictionHorizon;
  modelVersion: string;
  predictionDrift: PredictionDrift;
  explanation?: string;
}

export interface Factor {
  id: string;
  name: string;
  category?: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
}

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ExplainableInsight {
  summary: string;
  primaryFactors: Factor[];
  secondaryFactors: Factor[];
  counterintuitiveNotes?: string[];
  recommendations: string[];
}

// Digital Twin 2.0 specific types
export interface DigitalTwinProfile {
  id: string;
  userId: string;
  overallScore: number;
  physiology: Record<string, number>;
  behavior: Record<string, number>;
  adaptation: Record<string, number>;
  habitFormation: Record<string, number>;
  confidence: number;
  lastSimulatedAt: string;
  modelVersion: string;
  trainingLoad?: number;
}

export interface DigitalTwinPrediction {
  id: string;
  userId: string;
  type: PredictionType;
  horizon: PredictionHorizon;
  value: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  primaryFactors: Factor[];
  secondaryFactors: Factor[];
  explanation: string;
  predictionDrift: PredictionDrift;
  timestamp: string;
  modelVersion: string;
}

export interface DigitalTwinSimulation {
  id: string;
  userId: string;
  name: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  confidence: number;
  createdAt: string;
}

export interface PredictionHistory {
  predictionType: string;
  horizon: PredictionHorizon;
  values: TrendPoint[];
  drift: PredictionDrift;
  modelVersion: string;
}

export interface DigitalTwinDashboardResponse {
  profile: DigitalTwinProfile;
  predictions: DigitalTwinPrediction[];
  simulations: DigitalTwinSimulation[];
  trendData: TrendPoint[];
  history: PredictionHistory[];
}

export interface DigitalTwinPredictionRequest {
  userId: string;
  horizon?: PredictionHorizon;
  types?: PredictionType[];
}

export interface DigitalTwinSimulationRequest {
  userId: string;
  name: string;
  inputs: Record<string, unknown>;
}

export type PredictionType =
  | "recovery"
  | "performance"
  | "plateau"
  | "motivation"
  | "habit"
  | "goal_completion"
  | "training_readiness"
  | "body_transformation"
  | "adaptation_speed"
  | "training_response";
