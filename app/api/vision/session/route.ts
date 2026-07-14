import { NextResponse } from "next/server";
import { getSessions, addSession, removeSession } from "@/lib/vision/store";
import type { CameraSessionRecord } from "@/lib/vision";

// GET /api/vision/session -> list of stored form-coach sessions.
export async function GET() {
  return NextResponse.json({ success: true, sessions: getSessions() });
}

// POST /api/vision/session -> store a new session.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const now = new Date().toISOString();
    const record: CameraSessionRecord = {
      id: `srv_${Date.now()}`,
      exercise: body.exercise || "Squat",
      startedAt: body.startedAt || now,
      endedAt: now,
      durationMs: Number(body.durationMs) || 0,
      sets: Number(body.sets) || 1,
      reps: Number(body.reps) || 0,
      partialReps: Number(body.partialReps) || 0,
      formScore: Number(body.formScore) || 0,
      avgRom: Number(body.avgRom) || 0,
      avgSymmetry: Number(body.avgSymmetry) || 1,
      bestRepScore: Number(body.bestRepScore) || 0,
      notes: body.notes || "",
      feedback: body.feedback || [],
      source: body.source || "simulation",
      hasVideo: Boolean(body.hasVideo),
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
    };
    addSession(record);
    return NextResponse.json({ success: true, session: record });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid session payload." }, { status: 400 });
  }
}

// DELETE /api/vision/session -> { id }
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    if (body.id) removeSession(body.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid delete payload." }, { status: 400 });
  }
}
