// Client-side persistence + context hook for the AI Coach.
"use client";

import { useMemo } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { TABLES } from "@/database/schema";
import {
  buildCoachContext,
  generateDailyPlan,
  generateWeeklyReview,
  generateMonthlyReview,
  generateInsights,
} from "./engine";
import { computeRecovery, buildSignals } from "@/lib/recovery";
import {
  CoachContextData,
  CoachMemoryData,
  DailyPlan,
  WeeklyReview,
  MonthlyReview,
  Insight,
  EMPTY_MEMORY,
} from "./types";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

// ---------- memory ----------
export function getMemory(): CoachMemoryData {
  return read<CoachMemoryData>(TABLES.AI_MEMORY, EMPTY_MEMORY);
}
export function saveMemory(m: CoachMemoryData) {
  write(TABLES.AI_MEMORY, m);
}
export function mergeMemory(update: Partial<CoachMemoryData>): CoachMemoryData {
  const cur = getMemory();
  const next: CoachMemoryData = { ...cur, ...update };
  saveMemory(next);
  return next;
}

// ---------- conversations ----------
export interface StoredConversation {
  id: string;
  messages: { id: string; role: "user" | "coach"; text: string; timestamp: string }[];
  updatedAt: string;
}
export function getConversations(): StoredConversation[] {
  return read<StoredConversation[]>(TABLES.AI_CONVERSATIONS, []);
}
export function saveConversation(conv: StoredConversation) {
  const all = getConversations();
  const idx = all.findIndex((c) => c.id === conv.id);
  if (idx >= 0) all[idx] = conv;
  else all.unshift(conv);
  write(TABLES.AI_CONVERSATIONS, all.slice(0, 20));
}

// ---------- recommendations / plans / insights ----------
export function pushRecommendation(rec: any) {
  const all = read<any[]>(TABLES.AI_RECOMMENDATIONS, []);
  all.unshift(rec);
  write(TABLES.AI_RECOMMENDATIONS, all.slice(0, 50));
}
export function pushPlan(plan: any) {
  const all = read<any[]>(TABLES.AI_PLANS, []);
  all.unshift(plan);
  write(TABLES.AI_PLANS, all.slice(0, 30));
}
export function getInsightsStored(): any[] {
  return read<any[]>(TABLES.AI_INSIGHTS, []);
}
export function saveInsights(insights: any[]) {
  write(TABLES.AI_INSIGHTS, insights);
}

// ---------- context hook ----------
export function useCoachContext(): {
  ctx: CoachContextData | null;
  dailyPlan: DailyPlan | null;
  weekly: WeeklyReview | null;
  monthly: MonthlyReview | null;
  insights: Insight[];
  memory: CoachMemoryData;
} {
  const { profile, dailyLog, logsHistory, checkInHistory, macroTargets, calorieTargets, metrics } = useFitness();

  return useMemo(() => {
    if (!profile || !dailyLog) {
      return { ctx: null, dailyPlan: null, weekly: null, monthly: null, insights: [], memory: EMPTY_MEMORY };
    }

    const signals = buildSignals({
      profile,
      dailyLog,
      logsHistory,
      hydrationTarget: macroTargets?.water,
    });
    const result = computeRecovery(signals, { previousScore: 70 });

    const recovery = {
      score: result.score,
      readiness: result.readiness,
      fatigue: result.fatigueLevel,
      confidence: result.confidence,
      recommendationLabel: result.recommendation.label,
      muscleReadiness: result.muscleReadiness.map((m) => ({ muscle: m.muscle, readiness: m.readiness, soreness: m.soreness })),
    };

    const ctx = buildCoachContext({
      profile,
      dailyLog,
      logsHistory,
      checkInHistory,
      macroTargets,
      calorieTargets,
      metrics,
      recovery,
      memory: getMemory(),
    });

    return {
      ctx,
      dailyPlan: generateDailyPlan(ctx),
      weekly: generateWeeklyReview(ctx),
      monthly: generateMonthlyReview(ctx),
      insights: generateInsights(ctx),
      memory: ctx.memory,
    };
  }, [profile, dailyLog, logsHistory, checkInHistory, macroTargets, calorieTargets, metrics]);
}
