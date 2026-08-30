/**
 * Fitness Knowledge System - Type Definitions
 * Structured representations of sports-science, nutrition, recovery, and safety principles.
 */

export type KnowledgeCategory =
  | "training"
  | "exercise"
  | "fat_loss"
  | "muscle_gain"
  | "recovery"
  | "sleep"
  | "nutrition"
  | "hydration"
  | "lifestyle"
  | "safety";

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  principles: string[];
  keywords: string[];
  evidenceBasis?: string;
  triggers?: {
    minRecovery?: number;
    maxRecovery?: number;
    minFatigue?: number;
    maxAvailableTime?: number;
    goals?: string[];
    equipment?: string[];
    lifestyle?: string[];
  };
}

export interface RetrievedKnowledge {
  items: KnowledgeItem[];
  contextSummary: string;
  safetyFlag: boolean;
  safetyWarning?: string;
}
