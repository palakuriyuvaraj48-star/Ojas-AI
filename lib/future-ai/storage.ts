/**
 * Future AI localStorage storage utilities (Phase 15)
 */

import { FUTURE_AI_TABLES, type DigitalTwinProfileRecord } from "@/database/schema";
import type {
  ARCoachAnalyticsRecord,
  ARCoachSessionRecord,
  DigitalTwinPredictionRecord,
  DigitalTwinSimulationRecord,
  HealthRiskAssessmentRecord,
  RehabAssessmentRecord,
  RehabPainLogRecord,
  RehabPlanRecord,
  SmartGymDeviceRecord,
  SmartGymWorkoutRecord,
} from "@/database/schema";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getFutureTable<T>(table: string): T[] {
  try {
    const raw = localStorage.getItem(table);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setFutureTable<T>(table: string, data: T[]): void {
  localStorage.setItem(table, JSON.stringify(data));
}

export function futureGet<T>(table: string, predicate: (x: T) => boolean): T | undefined {
  return getFutureTable<T>(table).find(predicate);
}

export function futureList<T>(table: string, predicate?: (x: T) => boolean): T[] {
  const all = getFutureTable<T>(table);
  return predicate ? all.filter(predicate) : all;
}

export function futureAdd<T>(table: string, item: T): T {
  const list = getFutureTable<T>(table);
  list.push(item);
  setFutureTable(table, list);
  return item;
}

export function futureUpdate<T>(table: string, id: string, updater: (x: T) => T): T | null {
  const list = getFutureTable<T>(table);
  const idx = list.findIndex((x: any) => x.id === id);
  if (idx === -1) return null;
  list[idx] = updater(list[idx]);
  setFutureTable(table, list);
  return list[idx];
}

export function futureDelete(table: string, id: string): boolean {
  const list = getFutureTable(table);
  const next = list.filter((x: any) => x.id !== id);
  if (next.length === list.length) return false;
  setFutureTable(table, next);
  return true;
}

// Typed accessors for Future AI tables
export const futureDigitalTwin = {
  getProfile: (userId: string) =>
    futureGet<DigitalTwinProfileRecord>(FUTURE_AI_TABLES.DIGITAL_TWIN_PROFILE, (x) => x.userId === userId),
  listPredictions: (userId: string) =>
    futureList<DigitalTwinPredictionRecord>(
      FUTURE_AI_TABLES.DIGITAL_TWIN_PREDICTIONS,
      (x) => x.userId === userId
    ),
  addPrediction: (record: DigitalTwinPredictionRecord) =>
    futureAdd<DigitalTwinPredictionRecord>(FUTURE_AI_TABLES.DIGITAL_TWIN_PREDICTIONS, record),
  listSimulations: (userId: string) =>
    futureList<DigitalTwinSimulationRecord>(
      FUTURE_AI_TABLES.DIGITAL_TWIN_SIMULATIONS,
      (x) => x.userId === userId
    ),
  addSimulation: (record: DigitalTwinSimulationRecord) =>
    futureAdd<DigitalTwinSimulationRecord>(FUTURE_AI_TABLES.DIGITAL_TWIN_SIMULATIONS, record),
};

export const futureARCoach = {
  listSessions: (userId: string) =>
    futureList<ARCoachSessionRecord>(FUTURE_AI_TABLES.AR_COACH_SESSIONS, (x) => x.userId === userId),
  addSession: (record: ARCoachSessionRecord) =>
    futureAdd<ARCoachSessionRecord>(FUTURE_AI_TABLES.AR_COACH_SESSIONS, record),
  listAnalytics: (userId: string) =>
    futureList<ARCoachAnalyticsRecord>(FUTURE_AI_TABLES.AR_COACH_ANALYTICS, (x) => x.userId === userId),
  addAnalytics: (record: ARCoachAnalyticsRecord) =>
    futureAdd<ARCoachAnalyticsRecord>(FUTURE_AI_TABLES.AR_COACH_ANALYTICS, record),
};

export const futureSmartGym = {
  listDevices: (userId: string) =>
    futureList<SmartGymDeviceRecord>(FUTURE_AI_TABLES.SMART_GYM_DEVICES, (x) => x.userId === userId),
  addDevice: (record: SmartGymDeviceRecord) =>
    futureAdd<SmartGymDeviceRecord>(FUTURE_AI_TABLES.SMART_GYM_DEVICES, record),
  listWorkouts: (userId: string) =>
    futureList<SmartGymWorkoutRecord>(FUTURE_AI_TABLES.SMART_GYM_WORKOUTS, (x) => x.userId === userId),
  addWorkout: (record: SmartGymWorkoutRecord) =>
    futureAdd<SmartGymWorkoutRecord>(FUTURE_AI_TABLES.SMART_GYM_WORKOUTS, record),
};

export const futureRehab = {
  listPlans: (userId: string) =>
    futureList<RehabPlanRecord>(FUTURE_AI_TABLES.REHAB_PLANS, (x) => x.userId === userId),
  addPlan: (record: RehabPlanRecord) =>
    futureAdd<RehabPlanRecord>(FUTURE_AI_TABLES.REHAB_PLANS, record),
  listAssessments: (userId: string) =>
    futureList<RehabAssessmentRecord>(FUTURE_AI_TABLES.REHAB_ASSESSMENTS, (x) => x.userId === userId),
  addAssessment: (record: RehabAssessmentRecord) =>
    futureAdd<RehabAssessmentRecord>(FUTURE_AI_TABLES.REHAB_ASSESSMENTS, record),
  listPainLogs: (userId: string) =>
    futureList<RehabPainLogRecord>(FUTURE_AI_TABLES.REHAB_PAIN_LOGS, (x) => x.userId === userId),
  addPainLog: (record: RehabPainLogRecord) =>
    futureAdd<RehabPainLogRecord>(FUTURE_AI_TABLES.REHAB_PAIN_LOGS, record),
};

export const futureHealthRisk = {
  listAssessments: (userId: string) =>
    futureList<HealthRiskAssessmentRecord>(FUTURE_AI_TABLES.HEALTH_RISK_ASSESSMENTS, (x) => x.userId === userId),
  addAssessment: (record: HealthRiskAssessmentRecord) =>
    futureAdd<HealthRiskAssessmentRecord>(FUTURE_AI_TABLES.HEALTH_RISK_ASSESSMENTS, record),
};
