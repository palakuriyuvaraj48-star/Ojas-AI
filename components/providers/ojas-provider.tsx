/**
 * Ojas State Provider
 * React context for the canonical Ojas state.
 */

"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import {
  OjasState,
  OjasEvent,
  OjasDecision,
  DecisionHistoryEntry,
} from "@/lib/ojas-state/types";
import {
  loadOjasState,
  saveOjasState,
  createInitialOjasState,
  applyOjasEvent,
  computeDailyDecision,
  getDecisionHistory,
  addDecisionToHistory,
  runWhatIfSimulation,
} from "@/lib/ojas-state";
import { ClientProfile, DailyLog } from "@/types/profile";

interface OjasContextValue {
  state: OjasState;
  decision: OjasDecision;
  decisionHistory: DecisionHistoryEntry[];
  isLoading: boolean;

  // Actions
  initializeState: (profile: ClientProfile, dailyLog?: DailyLog) => void;
  emitEvent: (event: OjasEvent) => void;
  updateProfile: (profile: Partial<ClientProfile>) => void;
  updateDailyLog: (log: Partial<DailyLog>) => void;
  refreshDecision: () => void;
  runWhatIf: (changes: Partial<OjasState>) => OjasDecision;
  resetState: () => void;
}

const OjasContext = createContext<OjasContextValue | null>(null);

export function OjasProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OjasState>(() => loadOjasState());
  const [decision, setDecision] = useState<OjasDecision>(() => computeDailyDecision(loadOjasState()));
  const [decisionHistory, setDecisionHistory] = useState<DecisionHistoryEntry[]>(() => getDecisionHistory());
  const [isLoading, setIsLoading] = useState(true);

  // Persist state changes
  useEffect(() => {
    saveOjasState(state);
  }, [state]);

  // Persist decision history changes
  useEffect(() => {
    if (decisionHistory.length > 0) {
      localStorage.setItem("ojas_decision_history_v1", JSON.stringify(decisionHistory));
    }
  }, [decisionHistory]);

  // Initial load
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const initializeState = useCallback((profile: ClientProfile, dailyLog?: DailyLog) => {
    const newState = createInitialOjasState(profile, dailyLog);
    setState(newState);
    const newDecision = computeDailyDecision(newState);
    setDecision(newDecision);
  }, []);

  const emitEvent = useCallback((event: OjasEvent) => {
    setState((prev) => {
      const newState = applyOjasEvent(prev, event);
      const newDecision = computeDailyDecision(newState);
      setDecision(newDecision);

      // Add to decision history if significant
      if (["WORKOUT_COMPLETED", "WORKOUT_SKIPPED", "RECOVERY", "REST"].includes(newDecision.action)) {
        const entry: DecisionHistoryEntry = {
          date: new Date().toISOString(),
          decision: newDecision.headline,
          reason: newDecision.whyReasons[0] || "Routine decision",
          factors: newDecision.decisionFactors.filter(f => f.impact === "negative").map(f => f.signal),
        };
        setDecisionHistory((prev) => [entry, ...prev].slice(-30));
      }

      return newState;
    });
  }, []);

  const updateProfile = useCallback((profile: Partial<ClientProfile>) => {
    emitEvent({
      id: `evt_${Date.now()}`,
      type: "PROFILE_UPDATED",
      timestamp: new Date().toISOString(),
      payload: profile,
      source: "user_input",
    });
  }, [emitEvent]);

  const updateDailyLog = useCallback((log: Partial<DailyLog>) => {
    setState((prev) => {
      const newState = { ...prev };
      if (log.caloriesConsumed !== undefined) newState.nutrition.caloriesConsumed = log.caloriesConsumed;
      if (log.proteinConsumed !== undefined) newState.nutrition.proteinConsumed = log.proteinConsumed;
      if (log.carbsConsumed !== undefined) newState.nutrition.carbsConsumed = log.carbsConsumed;
      if (log.fatConsumed !== undefined) newState.nutrition.fatConsumed = log.fatConsumed;
      if (log.waterConsumed !== undefined) newState.nutrition.waterConsumedLiters = log.waterConsumed;
      if (log.costIncurred !== undefined) newState.nutrition.spentINR = log.costIncurred;
      return newState;
    });
  }, []);

  const refreshDecision = useCallback(() => {
    setState((prev) => {
      const newDecision = computeDailyDecision(prev);
      setDecision(newDecision);
      return prev;
    });
  }, []);

  const runWhatIf = useCallback((changes: Partial<OjasState>) => {
    return runWhatIfSimulation(state, changes);
  }, [state]);

  const resetState = useCallback(() => {
    const defaultState = loadOjasState();
    setState(defaultState);
    setDecision(computeDailyDecision(defaultState));
  }, []);

  const value = useMemo<OjasContextValue>(() => ({
    state,
    decision,
    decisionHistory,
    isLoading,
    initializeState,
    emitEvent,
    updateProfile,
    updateDailyLog,
    refreshDecision,
    runWhatIf,
    resetState,
  }), [state, decision, decisionHistory, isLoading, initializeState, emitEvent, updateProfile, updateDailyLog, refreshDecision, runWhatIf, resetState]);

  return (
    <OjasContext.Provider value={value}>
      {children}
    </OjasContext.Provider>
  );
}

export function useOjas(): OjasContextValue {
  const context = useContext(OjasContext);
  if (!context) {
    throw new Error("useOjas must be used within an OjasProvider");
  }
  return context;
}

// Convenience hooks for specific state slices
export function useFitnessState() {
  return useOjas().state.fitness;
}

export function useRecoveryState() {
  return useOjas().state.recovery;
}

export function useNutritionState() {
  return useOjas().state.nutrition;
}

export function useLifestyleState() {
  return useOjas().state.lifestyle;
}

export function useSportsState() {
  return useOjas().state.sports;
}

export function useRiskState() {
  return useOjas().state.risk;
}

export function useDailyDecision() {
  return useOjas().decision;
}

export function useDecisionHistory() {
  return useOjas().decisionHistory;
}
