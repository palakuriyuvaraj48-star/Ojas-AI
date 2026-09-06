import { describe, it, expect } from "vitest";
import { adaptiveDecisionEngine } from "@/lib/engine/adaptive-decision-engine";
import { DashboardState } from "@/lib/engine/adaptive-decision-engine";

describe("Dashboard Adaptation", () => {
  const baseState: DashboardState = {
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
  };

  it("should recommend recovery when sleep is low", () => {
    const state: DashboardState = {
      ...baseState,
      sleepDuration: 4.5,
      recovery: 40,
    };

    const recommendation = adaptiveDecisionEngine.decide(state);
    expect(recommendation.type).toBe("recovery");
    expect(recommendation.reasoning).toContain("recovery");
  });

  it("should recommend minimal training when time is limited (<=15m)", () => {
    const state: DashboardState = {
      ...baseState,
      availableTime: 15,
      recovery: 85,
      sleepDuration: 7.5,
    };

    const recommendation = adaptiveDecisionEngine.decide(state);
    expect(recommendation.type).toBe("minimal");
    expect(recommendation.duration).toBeLessThanOrEqual(15);
  });

  it("should recommend progressive overload in optimal conditions", () => {
    const state: DashboardState = {
      ...baseState,
      availableTime: 50,
      energyLevel: "energetic",
      sleepDuration: 8.2,
      stressLevel: "low",
      recovery: 92,
      isExamPeriod: false,
    };

    const recommendation = adaptiveDecisionEngine.decide(state);
    expect(recommendation.type).toBe("strength");
    expect(recommendation.intensity).toBe("high");
    expect(recommendation.confidence).toBeGreaterThan(90);
  });

  it("should update recommendation when inputs change (exam simulation)", () => {
    const normalState: DashboardState = {
      ...baseState,
      availableTime: 50,
      sleepDuration: 7.5,
      stressLevel: "low",
      energyLevel: "energetic",
      recovery: 85,
    };

    const rec1 = adaptiveDecisionEngine.decide(normalState);

    const examState: DashboardState = {
      ...baseState,
      availableTime: 15,
      sleepDuration: 5.2,
      stressLevel: "high",
      energyLevel: "tired",
      recovery: 42,
      isExamPeriod: true,
    };

    const rec2 = adaptiveDecisionEngine.decide(examState);

    // Recovery takes priority over time constraints when recovery score is critical
    expect(rec1.duration).toBeGreaterThan(rec2.duration);
    expect(rec2.type).toBe("recovery");
    expect(rec2.reasoning).toMatch(/recovery|sleep|restoration/i);
  });

  it("should recommend reduced training for 25m window without fatigue", () => {
    const state: DashboardState = {
      ...baseState,
      availableTime: 25,
      recovery: 80,
    };

    const recommendation = adaptiveDecisionEngine.decide(state);
    expect(recommendation.type).toBe("reduced");
    expect(recommendation.duration).toBeLessThanOrEqual(25);
  });

  it("should apply hostel-specific exercises when hostelMode is ON", () => {
    const state: DashboardState = {
      ...baseState,
      availableTime: 15,
      hostelMode: true,
    };

    const recommendation = adaptiveDecisionEngine.decide(state);
    expect(recommendation.type).toBe("minimal");
    const exerciseNotes = recommendation.exercises.map((e) => e.notes).join(" ");
    expect(exerciseNotes).toMatch(/no equipment|bodyweight|bed edge/i);
  });
});
