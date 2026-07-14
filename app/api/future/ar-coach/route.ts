/**
 * AR Workout Assistant — API route (Feature 147)
 *
 * GET  /api/future/ar-coach?action=sessions&userId=xxx
 * POST /api/future/ar-coach?action=start
 * POST /api/future/ar-coach?action=frame
 * POST /api/future/ar-coach?action=end
 * GET  /api/future/ar-coach?action=analytics&userId=xxx
 *
 * Experimental feature set — all predictions are estimates and NOT medical advice.
 */

import { NextRequest, NextResponse } from "next/server";
import { futureARCoach, generateId } from "@/lib/future-ai/storage";
import type {
  ARCoachAnalyticsRecord,
  ARCoachSessionRecord,
} from "@/database/schema";
import {
  endARSession,
  getActiveSession,
  processFrame,
  startARSession,
} from "@/lib/future-ai/ar-coach/engine";
import type { ARCoachRequest } from "@/lib/future-ai/ar-coach/types";

export const dynamic = "force-dynamic";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function sessionToRecord(session: {
  id: string;
  userId: string;
  exercise: string;
  startedAt: string;
  endedAt?: string;
  reps: number;
  sets: number;
  duration: number;
  formScore: number;
  movementQuality: number;
  fatigueIndicator: number;
  commonMistakes: string[];
  improvementSuggestions: string[];
  recordingUrl?: string;
  metadata: Record<string, unknown>;
}): ARCoachSessionRecord {
  return {
    id: session.id,
    userId: session.userId,
    exercise: session.exercise,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    reps: session.reps,
    formScore: session.formScore,
    movementQuality: session.movementQuality,
    fatigueIndicator: session.fatigueIndicator,
    commonMistakes: session.commonMistakes,
    improvementSuggestions: session.improvementSuggestions,
    hasRecording: Boolean(session.recordingUrl),
    recordingUrl: session.recordingUrl,
    metadata: session.metadata,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId") || "demo-user";

  if (action === "sessions") {
    const sessions = safe(() => futureARCoach.listSessions(userId), []);
    return NextResponse.json({ sessions });
  }

  if (action === "analytics") {
    const analytics = safe(() => futureARCoach.listAnalytics(userId), []);
    return NextResponse.json({ analytics });
  }

  if (action === "active") {
    const sessionId = searchParams.get("sessionId");
    return NextResponse.json({
      session: sessionId ? getActiveSession(sessionId) : null,
    });
  }

  return NextResponse.json(
    { error: "Unknown or missing action" },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const body = await request.json().catch(() => ({}));

  if (action === "start") {
    const req = body as ARCoachRequest;
    if (!req?.exercise) {
      return NextResponse.json(
        { error: "exercise is required" },
        { status: 400 }
      );
    }
    const session = startARSession({
      exercise: req.exercise,
      mode: req.mode ?? "form",
      reducedMotion: Boolean(req.reducedMotion),
      userId: req.userId ?? "demo-user",
    });
    return NextResponse.json({ session });
  }

  if (action === "frame") {
    const { sessionId, frame } = body as {
      sessionId: string;
      frame?: Parameters<typeof processFrame>[1];
    };
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }
    try {
      const result = processFrame(sessionId, frame ?? {});
      return NextResponse.json(result);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 404 }
      );
    }
  }

  if (action === "end") {
    const { sessionId, recordingUrl } = body as {
      sessionId: string;
      recordingUrl?: string;
    };
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }
    try {
      const { session, insights, analytics } = endARSession(sessionId);
      const finalSession = recordingUrl
        ? { ...session, recordingUrl }
        : session;

      // Persist (gracefully degrades when localStorage is unavailable).
      safe(() => {
        futureARCoach.addSession(sessionToRecord(finalSession));
        futureARCoach.addAnalytics(analytics as ARCoachAnalyticsRecord);
      }, undefined);

      return NextResponse.json({ session: finalSession, insights, analytics });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    { error: "Unknown or missing action" },
    { status: 400 }
  );
}
