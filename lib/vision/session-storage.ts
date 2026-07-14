import type {
  AiFeedbackRecord, CameraSessionRecord, RepHistoryRecord, VisionSessionInput,
} from "./types";
import { TABLES } from "@/database/schema";

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

const uid = () => `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export function getSessions(): CameraSessionRecord[] {
  return read<CameraSessionRecord[]>(TABLES.FORM_SESSIONS, []);
}

export function getSession(id: string): CameraSessionRecord | undefined {
  return getSessions().find((s) => s.id === id);
}

export function saveSession(input: VisionSessionInput): CameraSessionRecord {
  const now = new Date().toISOString();
  const record: CameraSessionRecord = {
    id: uid(),
    exercise: input.exercise,
    startedAt: now,
    endedAt: now,
    durationMs: input.durationMs,
    sets: input.sets,
    reps: input.reps,
    partialReps: input.partialReps,
    formScore: input.formScore,
    avgRom: input.avgRom,
    avgSymmetry: input.avgSymmetry,
    bestRepScore: input.bestRepScore,
    notes: input.notes ?? "",
    feedback: (input.feedback ?? []).map((f) => ({ ...f, id: uid(), createdAt: now })),
    source: input.source ?? "simulation",
    hasVideo: input.hasVideo ?? false,
    videoUrl: input.videoUrl,
    thumbnailUrl: input.thumbnailUrl,
  };
  const all = getSessions();
  all.unshift(record);
  write(TABLES.FORM_SESSIONS, all);
  return record;
}

export function deleteSession(id: string) {
  write(TABLES.FORM_SESSIONS, getSessions().filter((s) => s.id !== id));
}

export function saveRepHistory(sessionId: string, reps: Omit<RepHistoryRecord, "id" | "sessionId" | "createdAt">[]) {
  const existing = read<RepHistoryRecord[]>(TABLES.REP_HISTORY, []);
  const now = new Date().toISOString();
  const withIds = reps.map((r) => ({ ...r, id: uid(), sessionId, createdAt: now }));
  write(TABLES.REP_HISTORY, [...withIds, ...existing].slice(0, 2000));
}

export function getRepHistory(sessionId?: string): RepHistoryRecord[] {
  const all = read<RepHistoryRecord[]>(TABLES.REP_HISTORY, []);
  return sessionId ? all.filter((r) => r.sessionId === sessionId) : all;
}

export function saveFeedback(feedback: Omit<AiFeedbackRecord, "id" | "createdAt">) {
  const all = read<AiFeedbackRecord[]>(TABLES.AI_FEEDBACK, []);
  all.unshift({ ...feedback, id: uid(), createdAt: new Date().toISOString() });
  write(TABLES.AI_FEEDBACK, all.slice(0, 500));
}

export function getFeedback(): AiFeedbackRecord[] {
  return read<AiFeedbackRecord[]>(TABLES.AI_FEEDBACK, []);
}
