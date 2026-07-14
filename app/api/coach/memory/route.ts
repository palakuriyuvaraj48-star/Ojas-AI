import { NextResponse } from "next/server";
import { CoachMemoryData, EMPTY_MEMORY } from "@/lib/coach";

export const runtime = "nodejs";

// AI Memory sync. The client is the source of truth (localStorage);
// this endpoint validates/echoes so a future server store can be dropped in.
export async function GET() {
  return NextResponse.json({ memory: EMPTY_MEMORY });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const memory = (body.memory as CoachMemoryData) ?? EMPTY_MEMORY;
    return NextResponse.json({ ok: true, memory, stored: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
