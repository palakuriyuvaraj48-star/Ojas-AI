"use client";

import { useMemo } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import {
  buildSignals,
  getTimeline,
  getTodayRecovery,
  ContextInput,
} from "./storage";
import { computeRecovery, estimateFatigue } from "./index";
import {
  computeRecoveryBudget,
  explainDecision,
  generateWeeklyReview,
  RecoveryBudget,
  DecisionExplanation,
  WeeklyReview,
  HistoryPoint,
} from "./index";
import { RecoveryResult, RecoverySignals } from "./types";

export interface RecoverySnapshot {
  loading: boolean;
  signals: RecoverySignals | null;
  result: RecoveryResult | null;
  fatigue: ReturnType<typeof estimateFatigue> | null;
  timeline: HistoryPoint[];
  decision: DecisionExplanation | null;
  budget: RecoveryBudget | null;
  review: WeeklyReview | null;
  freeTimeMinutes: number;
}

const DEFAULT_FREE_TIME = 90;

export function useRecovery(): RecoverySnapshot {
  const { profile, dailyLog, logsHistory, macroTargets } = useFitness();

  return useMemo(() => {
    if (!profile || !dailyLog) {
      return {
        loading: true,
        signals: null,
        result: null,
        fatigue: null,
        timeline: [],
        decision: null,
        budget: null,
        review: null,
        freeTimeMinutes: DEFAULT_FREE_TIME,
      };
    }

    const ctx: ContextInput = {
      profile,
      dailyLog,
      logsHistory,
      hydrationTarget: macroTargets?.water,
    };

    const signals = buildSignals(ctx);
    const { result } = getTodayRecovery(ctx);
    const fatigue = estimateFatigue(signals);
    const timeline = getTimeline(7);

    // Build yesterday's signals from the timeline (deterministic) for the decision engine.
    const prevPoint = timeline.length >= 2 ? timeline[timeline.length - 2] : undefined;
    const prevSignals: RecoverySignals | undefined = prevPoint
      ? {
          ...signals,
          sleepDuration: prevPoint.sleep ?? signals.sleepDuration,
          sleepQuality: signals.sleepQuality,
          trainingLoad: prevPoint.trainingLoad,
          sleepDebt: Math.max(0, 7.5 - (prevPoint.sleep ?? 7.5)),
        }
      : undefined;
    const prevResult = prevSignals ? computeRecovery(prevSignals) : undefined;
    const decision = explainDecision(
      result,
      signals,
      prevSignals && prevResult ? { result: prevResult, signals: prevSignals } : undefined
    );

    const budget = computeRecoveryBudget(result, signals, DEFAULT_FREE_TIME);
    const review = generateWeeklyReview(timeline as HistoryPoint[]);

    return {
      loading: false,
      signals,
      result,
      fatigue,
      timeline: timeline as HistoryPoint[],
      decision,
      budget,
      review,
      freeTimeMinutes: DEFAULT_FREE_TIME,
    };
  }, [profile, dailyLog, logsHistory, macroTargets]);
}
