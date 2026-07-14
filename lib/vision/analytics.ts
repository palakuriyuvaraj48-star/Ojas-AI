import type { AnalyticsSummary, CameraSessionRecord } from "./types";

function last7Days(): string[] {
  const out: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }
  return out;
}

function stdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length);
}

// Aggregates stored sessions into analytics used by the Progress dashboard and
// the /api/vision/analytics endpoint.
export function computeAnalytics(sessions: CameraSessionRecord[]): AnalyticsSummary {
  const sorted = [...sessions].sort((a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime());
  const days = last7Days();

  const byDay = (sel: (s: CameraSessionRecord) => number) =>
    days.map((day) => {
      const daySessions = sorted.filter(
        (s) => new Date(s.endedAt).toLocaleDateString("en-US", { weekday: "short" }) === day
      );
      const value = daySessions.length ? Math.round(daySessions.reduce((a, s) => a + sel(s), 0) / daySessions.length) : 0;
      return { name: day, value };
    });

  const totalReps = sorted.reduce((a, s) => a + s.reps, 0);
  const avgFormScore = sorted.length ? Math.round(sorted.reduce((a, s) => a + s.formScore, 0) / sorted.length) : 0;
  const bestFormScore = sorted.length ? Math.max(...sorted.map((s) => s.formScore)) : 0;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = sorted.filter((s) => new Date(s.endedAt).getTime() >= weekAgo).length;

  const exerciseMap = new Map<string, { name: string; reps: number; score: number; n: number }>();
  for (const s of sorted) {
    const e = exerciseMap.get(s.exercise) ?? { name: s.exercise, reps: 0, score: 0, n: 0 };
    e.reps += s.reps;
    e.score += s.formScore;
    e.n += 1;
    exerciseMap.set(s.exercise, e);
  }
  const topExercises = [...exerciseMap.values()]
    .map((e) => ({ name: e.name, reps: e.reps, score: e.n ? Math.round(e.score / e.n) : 0 }))
    .sort((a, b) => b.reps - a.reps)
    .slice(0, 5);

  // Consistency trend from per-session form-score stability.
  const consistencyTrend = days.map((day) => {
    const daySessions = sorted.filter(
      (s) => new Date(s.endedAt).toLocaleDateString("en-US", { weekday: "short" }) === day
    );
    if (!daySessions.length) return { name: day, value: 0 };
    const scores = daySessions.map((s) => s.formScore);
    const consistency = 100 - Math.min(40, stdev(scores) * 3);
    return { name: day, value: Math.round(consistency) };
  });

  return {
    totalSessions: sorted.length,
    totalReps,
    avgFormScore,
    bestFormScore,
    sessionsThisWeek,
    formScoreTrend: byDay((s) => s.formScore),
    repQualityTrend: byDay((s) => s.formScore),
    consistencyTrend,
    frequencyTrend: byDay((s) => s.reps),
    topExercises,
  };
}
