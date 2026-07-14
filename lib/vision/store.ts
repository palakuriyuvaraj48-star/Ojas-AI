import type { CameraSessionRecord } from "./types";

// In-memory session store for the API layer (mirrors the client localStorage
// store). Seeded so analytics have data on first load.
let sessions: CameraSessionRecord[] = [
  {
    id: "seed_1",
    exercise: "Squat",
    startedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    endedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    durationMs: 240000,
    sets: 3,
    reps: 27,
    partialReps: 2,
    formScore: 84,
    avgRom: 68,
    avgSymmetry: 0.93,
    bestRepScore: 91,
    notes: "Improved depth across sets.",
    feedback: [],
    source: "simulation",
    hasVideo: false,
  },
  {
    id: "seed_2",
    exercise: "Push-up",
    startedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
    endedAt: new Date(Date.now() - 4 * 864e5).toISOString(),
    durationMs: 180000,
    sets: 3,
    reps: 33,
    partialReps: 1,
    formScore: 88,
    avgRom: 80,
    avgSymmetry: 0.95,
    bestRepScore: 94,
    notes: "",
    feedback: [],
    source: "simulation",
    hasVideo: false,
  },
  {
    id: "seed_3",
    exercise: "Deadlift",
    startedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    endedAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    durationMs: 210000,
    sets: 4,
    reps: 36,
    partialReps: 0,
    formScore: 91,
    avgRom: 66,
    avgSymmetry: 0.97,
    bestRepScore: 96,
    notes: "Strong, consistent lockout.",
    feedback: [],
    source: "simulation",
    hasVideo: false,
  },
];

export function getSessions(): CameraSessionRecord[] {
  return sessions;
}

export function addSession(session: CameraSessionRecord) {
  sessions = [session, ...sessions].slice(0, 200);
  return session;
}

export function removeSession(id: string) {
  sessions = sessions.filter((s) => s.id !== id);
}
