"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { adaptiveDecisionEngine, type DashboardState } from "@/lib/engine/adaptive-decision-engine";

type AdaptiveStateContextValue = {
  state: DashboardState;
  updateState: (updates: Partial<DashboardState>) => void;
  simulateExamPeriod: () => void;
  simulateOptimalCondition: () => void;
  simulateHostelSprint: () => void;
};

const defaults: DashboardState = {
  availableTime: 35, energyLevel: "energetic", sleepDuration: 7.4,
  stressLevel: "low", hostelMode: true, recovery: 75, trainingLoadYesterday: 60,
  currentGoal: "strength", lastWorkoutIntensity: 75, isExamPeriod: false,
};
const AdaptiveStateContext = createContext<AdaptiveStateContextValue | null>(null);

export function AdaptiveStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DashboardState>(defaults);
  const updateState = useCallback((updates: Partial<DashboardState>) => setState(prev => ({ ...prev, ...updates })), []);
  const simulateExamPeriod = useCallback(() => updateState({ availableTime: 15, sleepDuration: 4.8, stressLevel: "high", energyLevel: "tired", recovery: 42, trainingLoadYesterday: 85, isExamPeriod: true }), [updateState]);
  const simulateOptimalCondition = useCallback(() => updateState({ availableTime: 50, sleepDuration: 8.2, stressLevel: "low", energyLevel: "energetic", recovery: 92, trainingLoadYesterday: 45, isExamPeriod: false }), [updateState]);
  const simulateHostelSprint = useCallback(() => updateState({ availableTime: 15, hostelMode: true, isExamPeriod: false, energyLevel: "energetic", recovery: 85, sleepDuration: 7.2 }), [updateState]);
  const value = useMemo(() => ({ state, updateState, simulateExamPeriod, simulateOptimalCondition, simulateHostelSprint }), [state, updateState, simulateExamPeriod, simulateOptimalCondition, simulateHostelSprint]);
  return <AdaptiveStateContext.Provider value={value}>{children}</AdaptiveStateContext.Provider>;
}

export function useAdaptiveState() {
  const context = useContext(AdaptiveStateContext);
  if (!context) throw new Error("useAdaptiveState must be used inside AdaptiveStateProvider");
  return { ...context, recommendation: adaptiveDecisionEngine.decide(context.state) };
}
