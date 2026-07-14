import { NextResponse } from "next/server";
import { buildCoachContext, parseIntent, generateCoachReply } from "@/lib/coach";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message: string = body.message || "";
    const memory = body.memory ?? {};
    const ctx = buildCoachContext({
      profile: body.profile,
      dailyLog: body.dailyLog,
      logsHistory: body.logsHistory ?? [],
      checkInHistory: body.checkInHistory ?? [],
      macroTargets: body.macroTargets,
      calorieTargets: body.calorieTargets,
      metrics: body.metrics,
      recovery: body.recovery,
      memory,
    });
    const parsed = parseIntent(message, ctx);
    const reply = generateCoachReply(message, ctx, parsed);
    const text = reply.text;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // stream word-by-word for a natural typing feel
        const words = text.split(/(\s+)/);
        for (const w of words) {
          controller.enqueue(encoder.encode(w));
          await new Promise((r) => setTimeout(r, 18));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Intent": parsed.intent,
      },
    });
  } catch {
    return new Response("Sorry, something went wrong.", { status: 400 });
  }
}
