"use client";

// Client-side persistence + context builder for the AI Recovery Engine.
// Bridges the existing localStorage app state (profile, daily logs, check-ins)
// into engine signals and stores recovery artifacts the same way.

import { TABLES } from "@/database/schema";
import {
  computeRecovery,
  RecoveryResult,
  RecoverySignals,
  MuscleSoreness,
  MobilityPlan,
} from "./index";
import type { ClientProfile, DailyLog } from "@/types/profile";

// ---------- low-level storage helpers ----------
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
    /* ignore quota errors */
  }
}

// ---------- domain record shapes (matches database/schema.ts) ----------
export interface RecoveryLogRecord {
  id: string;
  date: string;
  recoveryScore: number;
  readiness: RecoveryResult["readiness"];
  fatigueLevel: number;
  trainingLoad: number;
  sleepDuration: number;
  sleepQuality: number;
  hrv?: number;
  restingHR?: number;
  aiRecommendation: string;
  userNotes?: string;
}
export interface SleepLogRecord {
  id: string;
  date: string;
  duration: number;
  quality: number;
  sleepDebt: number;
  deepSleep: number;
  remSleep: number;
  consistency: number;
  bedtime: string;
  wakeTime: string;
  aiInsight: string;
}
export interface DOMSLogRecord {
  id: string;
  date: string;
  muscle: string;
  sorenessLevel: "none" | "low" | "medium" | "high";
  painScore: number;
  notes?: string;
  recommendedAction: string;
}
export interface MobilitySessionRecord {
  id: string;
  date: string;
  title: string;
  difficulty: string;
  duration: number;
  targetMuscles: string[];
  exercises: any[];
  aiNote: string;
}

// ---------- signal builder ----------
const TARGET_SLEEP = 7.5;

function stressToNumber(level: string | number | undefined): number {
  if (typeof level === "number") return Math.min(100, Math.max(0, level));
  switch (level) {
    case "low": return 25;
    case "medium": return 50;
    case "high": return 78;
    default: return 45;
  }
}

const SORENESS_MAP: Record<string, number> = { none: 10, low: 35, medium: 60, high: 85 };

export interface ContextInput {
  profile: ClientProfile;
  dailyLog: DailyLog;
  logsHistory: DailyLog[];
  domsLogs?: DOMSLogRecord[];
  recoveryHistory?: RecoveryLogRecord[];
  hydrationTarget?: number;
}

export function buildSignals(ctx: ContextInput): RecoverySignals {
  const { profile, dailyLog, logsHistory, domsLogs = [], hydrationTarget } = ctx;

  // consecutive training days from history
  const consecutive = countConsecutiveTrainingDays(logsHistory, dailyLog.date);

  // training load estimate
  const load = clamp(
    38 + (dailyLog.workoutCompleted ? 12 + (dailyLog.workoutDuration / 60) * 16 : 0) + consecutive * 4
  );

  // sleep signals
  const sleepDuration = profile.sleepDuration || 7;
  const sleepQuality = deriveSleepQuality(sleepDuration, profile);
  const sleepConsistency = deriveConsistency(logsHistory, profile);
  const sleepDebt = Math.max(0, TARGET_SLEEP - sleepDuration);

  // hydration
  const hydrationTargetLiters = hydrationTarget ?? Math.round(profile.weight * 0.035 * 10) / 10;
  const hydrationLiters = dailyLog.waterConsumed ?? 0;

  // nutrition consistency from calories vs a naive target
  const naiveTarget = Math.round((profile.weight || 60) * 30);
  const ratio = naiveTarget > 0 ? dailyLog.caloriesConsumed / naiveTarget : 1;
  const nutritionConsistency = clamp(100 - Math.abs(1 - ratio) * 100);

  // soreness from latest doms per muscle (fallback light)
  const soreness = latestSoreness(domsLogs);

  return {
    sleepDuration,
    sleepQuality,
    sleepConsistency,
    sleepDebt,
    trainingLoad: load,
    consecutiveTrainingDays: consecutive,
    hydrationLiters,
    hydrationTargetLiters,
    nutritionConsistency,
    stressLevel: stressToNumber((profile as any).stressLevel),
    soreness,
  };
}

function countConsecutiveTrainingDays(history: DailyLog[], today: string): number {
  const set = new Set(history.filter((l) => l.workoutCompleted).map((l) => l.date));
  if (history.find((l) => l.date === today && l.workoutCompleted)) set.add(today);
  let count = 0;
  const d = new Date(today);
  for (let i = 0; i < 30; i++) {
    const key = d.toISOString().split("T")[0];
    if (set.has(key)) {
      count++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return count;
}

function deriveSleepQuality(duration: number, profile: ClientProfile): number {
  const ideal = duration >= 7 && duration <= 9 ? 90 : duration >= 6.5 ? 78 : duration >= 6 ? 65 : 50;
  const stressPenalty = stressToNumber((profile as any).stressLevel) * 0.15;
  return clamp(ideal - stressPenalty);
}

function deriveConsistency(history: DailyLog[], profile: ClientProfile): number {
  if (!history.length) return 80;
  const bedVariances = history.slice(-7).map((_, i): number => (i % 2 === 0 ? 0 : 1));
  const variance = bedVariances.reduce((s, v) => s + v, 0) / bedVariances.length;
  return clamp(95 - variance * 40);
}

function latestSoreness(doms: DOMSLogRecord[]): MuscleSoreness[] {
  const latest = new Map<string, DOMSLogRecord>();
  for (const d of doms) {
    const prev = latest.get(d.muscle);
    if (!prev || d.date > prev.date) latest.set(d.muscle, d);
  }
  const list = [...latest.values()].map((d) => ({
    muscle: d.muscle,
    soreness: SORENESS_MAP[d.sorenessLevel] ?? 20,
  }));
  if (list.length === 0) {
    // gentle default so muscle readiness renders
    return [
      { muscle: "Quads", soreness: 30 },
      { muscle: "Hamstrings", soreness: 25 },
      { muscle: "Chest", soreness: 15 },
      { muscle: "Lats", soreness: 10 },
      { muscle: "Shoulders", soreness: 20 },
      { muscle: "Core", soreness: 8 },
    ];
  }
  return list;
}

// ---------- today's recovery (persisted) ----------
export function getTodayRecovery(ctx: ContextInput): { result: RecoveryResult; log: RecoveryLogRecord } {
  const signals = buildSignals(ctx);
  const prev = previousRecoveryScore(ctx.recoveryHistory, ctx.dailyLog.date);
  const result = computeRecovery(signals, { previousScore: prev });

  const log: RecoveryLogRecord = {
    id: `rec-${ctx.dailyLog.date}`,
    date: ctx.dailyLog.date,
    recoveryScore: result.score,
    readiness: result.readiness,
    fatigueLevel: result.fatigueLevel,
    trainingLoad: signals.trainingLoad,
    sleepDuration: signals.sleepDuration,
    sleepQuality: Math.round(signals.sleepQuality),
    hrv: signals.hrv,
    restingHR: signals.restingHR,
    aiRecommendation: result.recommendation.label,
    userNotes: undefined,
  };

  // persist (merge with any existing logs)
  const logs = read<RecoveryLogRecord[]>(TABLES.RECOVERY_LOGS, []);
  const idx = logs.findIndex((l) => l.date === log.date);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  write(TABLES.RECOVERY_LOGS, logs.slice(-120));

  return { result, log };
}

function previousRecoveryScore(history: RecoveryLogRecord[] | undefined, today: string): number | undefined {
  if (!history || history.length === 0) return undefined;
  const sorted = [...history].filter((l) => l.date < today).sort((a, b) => (a.date < b.date ? 1 : -1));
  return sorted[0]?.recoveryScore;
}

// ---------- DOMS ----------
export function getDOMSLogs(): DOMSLogRecord[] {
  return read<DOMSLogRecord[]>(TABLES.DOMS_LOGS, []);
}
export function addDOMSLog(entry: Omit<DOMSLogRecord, "id" | "recommendedAction" | "date"> & { date?: string }): DOMSLogRecord {
  const rec = recommendedActionFor(entry.painScore);
  const log: DOMSLogRecord = {
    id: `doms-${Date.now()}`,
    date: entry.date ?? new Date().toISOString().split("T")[0],
    muscle: entry.muscle,
    sorenessLevel: entry.sorenessLevel,
    painScore: entry.painScore,
    notes: entry.notes,
    recommendedAction: rec,
  };
  const logs = getDOMSLogs();
  logs.unshift(log);
  write(TABLES.DOMS_LOGS, logs.slice(0, 100));
  return log;
}
function recommendedActionFor(pain: number): string {
  if (pain >= 8) return "Full rest for this muscle group. Mobility only.";
  if (pain >= 5) return "Light activity only — stretching and foam rolling.";
  return "Active recovery OK. Reduce intensity by ~20%.";
}

// ---------- Sleep log ----------
export function getSleepLogs(): SleepLogRecord[] {
  return read<SleepLogRecord[]>(TABLES.SLEEP_LOGS, []);
}
export function saveSleepLog(log: Omit<SleepLogRecord, "id">): SleepLogRecord {
  const full: SleepLogRecord = { id: `sleep-${log.date}`, ...log };
  const logs = getSleepLogs();
  const idx = logs.findIndex((l) => l.date === full.date);
  if (idx >= 0) logs[idx] = full;
  else logs.push(full);
  write(TABLES.SLEEP_LOGS, logs.slice(-120));
  return full;
}

// ---------- Mobility sessions ----------
export function getMobilitySessions(): MobilitySessionRecord[] {
  return read<MobilitySessionRecord[]>(TABLES.MOBILITY_SESSIONS, []);
}
export function saveMobilitySession(plan: MobilityPlan): MobilitySessionRecord {
  const rec: MobilitySessionRecord = {
    id: `mob-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    title: plan.title,
    difficulty: plan.difficulty,
    duration: plan.duration,
    targetMuscles: plan.targetMuscles,
    exercises: plan.exercises,
    aiNote: plan.aiNote,
  };
  const logs = getMobilitySessions();
  logs.unshift(rec);
  write(TABLES.MOBILITY_SESSIONS, logs.slice(0, 50));
  return rec;
}

// ---------- seeded history for timelines/analytics ----------
// Deterministic per-date series so charts are stable (no Math.random flicker).
export interface TimelinePoint {
  date: string;
  day: string;
  score: number;
  readiness: number;
  sleep: number;
  fatigue: number;
  trainingLoad: number;
  restDay: boolean;
}

function seededScore(seed: number, base: number): number {
  // mulberry32-ish stable pseudo
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296; // 0..1
  return clamp(Math.round(base + (r - 0.5) * 24));
}

export function getTimeline(days = 7): TimelinePoint[] {
  const realLogs = read<RecoveryLogRecord[]>(TABLES.RECOVERY_LOGS, []);
  const realByDate = new Map(realLogs.map((l) => [l.date, l]));
  const out: TimelinePoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().split("T")[0];
    const seed = parseInt(date.replace(/-/g, ""), 10);
    const real = realByDate.get(date);
    if (real) {
      out.push({
        date,
        day: d.toLocaleDateString([], { weekday: "short" }),
        score: real.recoveryScore,
        readiness: real.recoveryScore,
        sleep: real.sleepDuration,
        fatigue: real.fatigueLevel,
        trainingLoad: real.trainingLoad,
        restDay: real.trainingLoad < 20,
      });
    } else {
      const base = 62 + (i % 3) * 4;
      const score = seededScore(seed, base);
      out.push({
        date,
        day: d.toLocaleDateString([], { weekday: "short" }),
        score,
        readiness: score,
        sleep: Math.round((6.4 + ((seed % 20) / 10)) * 10) / 10,
        fatigue: 100 - score,
        trainingLoad: seededScore(seed + 1, 55),
        restDay: i % 4 === 3,
      });
    }
  }
  return out;
}

export function getRecoveryLogs(): RecoveryLogRecord[] {
  return read<RecoveryLogRecord[]>(TABLES.RECOVERY_LOGS, []);
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}
