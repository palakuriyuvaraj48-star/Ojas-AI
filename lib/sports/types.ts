/**
 * Ojas AI Sports Performance & Transition System Types
 */

export type UserMode = "general-fitness" | "sport-transition" | "athlete-performance";

export type SportProgressionLevel = "foundation" | "development" | "performance" | "advanced";

export type SportAttributeKey = 
  | "acceleration"
  | "agility"
  | "endurance"
  | "lower_body_power"
  | "upper_body_strength"
  | "core_stability"
  | "mobility"
  | "reaction_time"
  | "rotational_power"
  | "repeated_effort";

export interface SportAttributeDefinition {
  id: SportAttributeKey;
  name: string;
  unit: string;
  description: string;
  testName: string;
  testProtocol: string;
}

export interface SportRequirementTarget {
  attributeId: SportAttributeKey;
  foundationTarget: number; // 0-100 normalized score
  developmentTarget: number;
  performanceTarget: number;
  advancedTarget: number;
  weightInSport: number; // 1-5 importance weighting
  rationale: string;
}

export interface SportDrill {
  name: string;
  targetAttribute: SportAttributeKey;
  durationMinutes: number;
  description: string;
  coachingCue: string;
  equipment: string;
}

export interface SportProfile {
  id: string;
  name: string;
  category: "field" | "court" | "combat_contact" | "track_running" | "racket";
  icon: string; // emoji or lucide icon name
  tagline: string;
  overview: string;
  primaryEnergySystem: "Aerobic" | "Anaerobic Alactic" | "Anaerobic Lactic" | "Mixed Hybrid";
  keyInjuryRisks: string[];
  requiredAttributes: SportRequirementTarget[];
  recommendedTests: {
    attributeId: SportAttributeKey;
    testName: string;
    description: string;
  }[];
  signatureDrills: SportDrill[];
  recoveryConsiderations: {
    criticalMuscleGroups: string[];
    hydrationFocus: string;
    restDayRecommendation: string;
  };
}

export interface AttributeScore {
  attributeId: SportAttributeKey;
  name: string;
  currentScore: number; // 0-100
  baselineScore: number; // User's historical personal baseline
  targetScore: number; // Sport benchmark target for selected level
  gap: number; // target - current (positive means deficiency)
  changeFromBaseline: number; // current - baseline
  unit: string;
}

export interface SportGapAnalysis {
  sportId: string;
  sportName: string;
  currentLevel: SportProgressionLevel;
  targetLevel: SportProgressionLevel;
  readinessScore: number; // 0-100 overall readiness
  primaryDevelopmentArea: {
    attributeId: SportAttributeKey;
    name: string;
    gap: number;
    explanation: string;
    recommendedAction: string;
  };
  attributeScores: AttributeScore[];
  whyThisPlan: {
    headline: string;
    reasons: string[];
    adaptiveAdjustment: string;
  };
}

export interface SportChallenge {
  id: string;
  title: string;
  description: string;
  targetAttribute: SportAttributeKey;
  targetMetric: string;
  durationDays: number;
  progressPct: number;
  status: "active" | "completed" | "upcoming";
  xpReward: number;
}

export interface SportDiscoveryAnswer {
  interests: string[];
  preferredPace: "explosive_bursts" | "continuous_stamina" | "tactical_agility" | "strength_power";
  environment: "outdoor_turf" | "indoor_court" | "track" | "any";
  teamOrSolo: "team" | "solo" | "both";
  availableTimeMinutes: number;
  physicalStrengths: SportAttributeKey[];
}

export interface SportDiscoveryRecommendation {
  sportId: string;
  sportName: string;
  icon: string;
  fitScore: number; // 0-100 percentage fit
  whyFitReasons: string[];
  startingLevel: SportProgressionLevel;
}

export interface ReturnToActivityStatus {
  isActive: boolean;
  affectedArea: string; // e.g. "Right Ankle", "Lower Back", "Shoulder"
  reportedDiscomfort: "none" | "mild" | "moderate" | "high";
  currentPhase: "Rest & Mobility" | "Low-Load Conditioning" | "Gradual Return" | "Full Readiness";
  progressPercentage: number;
  allowedExercises: string[];
  restrictedExercises: string[];
  safetyNotice: string;
}

export interface SportTwinState {
  userMode: UserMode;
  selectedSportId?: string;
  sportLevel: SportProgressionLevel;
  trainingReadinessScore: number;
  personalBaseline: Record<SportAttributeKey, number>;
  currentAttributes: Record<SportAttributeKey, number>;
  primaryGapAttribute?: SportAttributeKey;
  lastAssessmentDate: string;
  activeChallenges: SportChallenge[];
  returnToActivity?: ReturnToActivityStatus;
}
