import { NextResponse } from "next/server";
import { computeRecovery, defaultSignals, estimateFatigue, recoveryCoachReply } from "@/lib/recovery";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message?.toLowerCase() || "";

    const signals = defaultSignals();
    const result = computeRecovery(signals, { previousScore: 72 });
    const fatigue = estimateFatigue(signals);
    const reply = recoveryCoachReply(message, { result, signals, fatigue });

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
