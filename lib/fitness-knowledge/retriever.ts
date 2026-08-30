/**
 * Fitness Knowledge Retriever (RAG)
 * Retrieves situational and query-relevant sports-science principles
 * for Gemma 3 4B prompt injection without bloating context.
 */

import { KnowledgeItem, RetrievedKnowledge } from "./types";
import { FITNESS_KNOWLEDGE_BASE } from "./knowledge-base";

export interface RetrievalContext {
  goal?: string | null;
  fitness_level?: string | null;
  recovery_score?: number | null;
  fatigue_score?: number | null;
  sleep_hours?: number | null;
  time_available?: number | null;
  equipment?: string[] | null;
  stress?: string | null;
  budget?: number | string | null;
  injuries?: string | null;
}

const RED_FLAG_KEYWORDS = [
  "chest pain",
  "heart pain",
  "dizzy",
  "dizziness",
  "faint",
  "fainting",
  "sharp pain",
  "radiating pain",
  "numbness",
  "swelling",
  "torn",
  "fracture",
  "dislocated",
  "severe pain",
  "vomiting",
];

/**
 * Evaluates situational and semantic relevance of knowledge base items
 * against the user prompt and Digital Twin context.
 */
export function retrieveFitnessKnowledge(
  query: string,
  context: RetrievalContext = {}
): RetrievedKnowledge {
  const queryLower = (query || "").toLowerCase();
  const scoredItems: { item: KnowledgeItem; score: number }[] = [];

  // Check for medical safety red flags
  const safetyDetected = RED_FLAG_KEYWORDS.some((rf) => queryLower.includes(rf));

  for (const item of FITNESS_KNOWLEDGE_BASE) {
    let score = 0;

    // Safety priority boost
    if (item.category === "safety" && safetyDetected) {
      score += 100;
    }

    // Keyword matching
    for (const kw of item.keywords) {
      if (queryLower.includes(kw)) {
        score += 15;
      }
    }

    // Digital Twin Situational Triggers
    const triggers = item.triggers;
    if (triggers) {
      // Low recovery trigger
      if (
        triggers.maxRecovery != null &&
        context.recovery_score != null &&
        context.recovery_score <= triggers.maxRecovery
      ) {
        score += 30;
      }

      // High fatigue trigger
      if (
        triggers.minFatigue != null &&
        context.fatigue_score != null &&
        context.fatigue_score >= triggers.minFatigue
      ) {
        score += 30;
      }

      // Time constraint trigger
      if (
        triggers.maxAvailableTime != null &&
        context.time_available != null &&
        context.time_available <= triggers.maxAvailableTime
      ) {
        score += 35;
      }

      // Goal match trigger
      if (triggers.goals && context.goal) {
        const userGoal = context.goal.toLowerCase();
        if (triggers.goals.some((g) => userGoal.includes(g))) {
          score += 25;
        }
      }

      // Equipment match trigger
      if (triggers.equipment && context.equipment) {
        const userEquipStr = context.equipment.join(" ").toLowerCase();
        if (triggers.equipment.some((eq) => userEquipStr.includes(eq))) {
          score += 20;
        }
      }

      // High recovery / progression trigger
      if (
        triggers.minRecovery != null &&
        context.recovery_score != null &&
        context.recovery_score >= triggers.minRecovery &&
        (context.fatigue_score == null || context.fatigue_score < 50)
      ) {
        score += 20;
      }
    }

    if (score > 0) {
      scoredItems.push({ item, score });
    }
  }

  // Sort descending by score and pick top 2-3 most relevant items
  scoredItems.sort((a, b) => b.score - a.score);
  const selectedItems = scoredItems.slice(0, 3).map((s) => s.item);

  // If no specific triggers fired, default to progressive overload and hydration baseline
  if (selectedItems.length === 0) {
    selectedItems.push(
      FITNESS_KNOWLEDGE_BASE[0], // Progressive Overload
      FITNESS_KNOWLEDGE_BASE[8]  // Nutrition & Budget
    );
  }

  // Build compact context summary string for Gemma
  const contextSummary = selectedItems
    .map(
      (item) =>
        `• [${item.title.toUpperCase()}]: ${item.summary}\n  - Key Principles: ${item.principles.join(" ")}`
    )
    .join("\n\n");

  return {
    items: selectedItems,
    contextSummary,
    safetyFlag: safetyDetected,
    safetyWarning: safetyDetected
      ? "User reported potential red-flag symptoms. Provide safe pain-free guidance and strictly advise consulting a healthcare professional."
      : undefined,
  };
}
