/**
 * Compatibility utilities for Ojas state migration.
 * Converts between canonical OjasDecision and legacy DailyDecision formats.
 */

import { DailyDecision, OjasDecisionAction } from "@/types/fitness-state";
import { OjasDecision } from "@/lib/ojas-state/types";

/**
 * Convert canonical OjasDecision to legacy DailyDecision format.
 * Used for backward compatibility with existing UI components.
 */
export function ojasDecisionToLegacy(decision: OjasDecision): DailyDecision {
  return {
    action: mapOjasActionToLegacy(decision.action),
    badgeColor: decision.badge.color,
    headline: decision.headline,
    subtitle: decision.subtitle,
    whyReasons: decision.whyReasons,
    basedOn: {
      recoveryScore: decision.decisionFactors.find(f => f.signal === "Recovery Score")?.value
        ? parseInt(decision.decisionFactors.find(f => f.signal === "Recovery Score")?.value || "75")
        : 75,
      sleepHours: decision.decisionFactors.find(f => f.signal === "Sleep")?.value
        ? parseFloat(decision.decisionFactors.find(f => f.signal === "Sleep")?.value || "7")
        : 7,
      trainingLoad: decision.decisionFactors.find(f => f.signal === "Training Load")?.value || "Balanced",
      availableTime: decision.workout?.durationMinutes || 35,
      fatigueFocus: "Systemic Low",
      environmentText: "30°C (Moderate)",
      primaryGoal: "fat-loss",
    },
    priorities: [
      {
        icon: "🏋️",
        category: "workout",
        title: decision.headline,
        description: `${decision.workout?.intensity || "Moderate"} intensity • ${decision.workout?.durationMinutes || 35} mins`,
        actionText: "Start Workout",
        actionHref: "/workout",
      },
      {
        icon: "🍛",
        category: "nutrition",
        title: decision.nutrition?.headline || "Nutrition",
        description: decision.nutrition?.recommendation || "Log your meals",
        actionText: "View Nutrition",
        actionHref: "/food",
      },
      {
        icon: "💧",
        category: "hydration",
        title: "Hydration Target",
        description: "Keep a water bottle handy for steady sips.",
        actionText: "Quick Log +250ml",
      },
      {
        icon: "😴",
        category: "recovery",
        title: decision.recovery?.headline || "Recovery",
        description: decision.recovery?.protocol || "Standard recovery protocol",
        actionText: "Recovery Protocols",
        actionHref: "/recovery",
      },
    ],
    confidence: decision.confidenceLabel as DailyDecision["confidence"],
    suggestedWorkout: {
      title: decision.workout?.title || decision.headline,
      durationMinutes: decision.workout?.durationMinutes || 35,
      intensity: decision.workout?.intensity || "Moderate",
      focus: decision.workout?.focus || "General fitness",
      exercises: decision.workout?.exercises.map(e => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        notes: e.notes,
        formCoachSupported: true,
      })) || [],
      alternativeIndoorWorkout: "15-minute Low-Impact Bodyweight Calisthenics",
    },
    suggestedNutritionAction: {
      headline: decision.nutrition?.headline || "Nutrition",
      recommendation: decision.nutrition?.recommendation || "Log your meals",
      affordableProteinHack: decision.nutrition?.affordableProteinHack || "",
      estimatedCostINR: decision.nutrition?.estimatedCostINR || 65,
    },
    recoveryAction: {
      headline: decision.recovery?.headline || "Recovery",
      protocol: decision.recovery?.protocol || "Standard recovery",
      mobilityMinutes: decision.recovery?.mobilityMinutes || 5,
    },
  };
}

function mapOjasActionToLegacy(action: string): OjasDecisionAction {
  switch (action) {
    case "FULL_TRAINING":
      return "TRAIN";
    case "REDUCED_TRAINING":
    case "MINIMUM_TRAINING":
    case "SPORT_PRACTICE":
      return "REDUCE_INTENSITY";
    case "RECOVERY":
    case "REST":
    case "MOBILITY":
    case "SLEEP_PRIORITY":
      return "RECOVER";
    case "NUTRITION_ACTION":
      return "REDUCE_INTENSITY";
    default:
      return "TRAIN";
  }
}
