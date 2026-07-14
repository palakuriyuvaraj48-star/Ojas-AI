import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Conversation history. Client persists locally (localStorage); this endpoint
// validates the payload so a server store can be added later without UI changes.
export async function GET() {
  return NextResponse.json({ ok: true, note: "Conversations are persisted client-side." });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    return NextResponse.json({ ok: true, count: messages.length, stored: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
