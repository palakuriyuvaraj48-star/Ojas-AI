"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DashboardState,
  WorkoutRecommendation,
  adaptiveDecisionEngine,
} from "@/lib/engine/adaptive-decision-engine";

export function useDashboardState(initialOverrides?: Partial<DashboardState>) {
  const [state, setState] = useState<DashboardState>({
    availableTime: 35,
    energyLevel: "energetic",
    sleepDuration: 7.5,
    stressLevel: "low",
    hostelMode: true,
    recovery: 82,
    trainingLoadYesterday: 60,
    currentGoal: "strength",
    lastWorkoutIntensity: 75,
    isExamPeriod: false,
    ...initialOverrides,
  });

  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const simulateExamPeriod = useCallback(() => {
    setState((prev) => ({
      ...prev,
      availableTime: 15,
      sleepDuration: 4.8,
      stressLevel: "high",
      energyLevel: "tired",
      recovery: 42,
      isExamPeriod: true,
      trainingLoadYesterday: 85,
    }));
  }, []);

  const simulateOptimalCondition = useCallback(() => {
    setState((prev) => ({
      ...prev,
      availableTime: 50,
      sleepDuration: 8.2,
      stressLevel: "low",
      energyLevel: "energetic",
      recovery: 92,
      isExamPeriod: false,
      trainingLoadYesterday: 45,
    }));
  }, []);

  const simulateHostelSprint = useCallback(() => {
    setState((prev) => ({
      ...prev,
      availableTime: 25,
      hostelMode: true,
      energyLevel: "moderate",
      recovery: 72,
      isExamPeriod: false,
    }));
  }, []);

  const recommendation: WorkoutRecommendation = useMemo(() => {
    return adaptiveDecisionEngine.decide(state);
  }, [state]);

  return {
    state,
    updateState,
    recommendation,
    simulateExamPeriod,
    simulateOptimalCondition,
    simulateHostelSprint,
  };
}
