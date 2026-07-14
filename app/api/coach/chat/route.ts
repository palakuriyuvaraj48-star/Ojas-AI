import { NextResponse } from "next/server";
import {
  buildCoachContext,
  parseIntent,
  generateCoachReply,
  extractMemory,
  CoachContextData,
  CoachMemoryData,
} from "@/lib/coach";
import { routePrompt, COACH_SYSTEM_PROMPT, PROMPT_TEMPLATES } from "@/lib/coach/prompts";

export const runtime = "nodejs";

function buildContextFromBody(body: any): { ctx: CoachContextData; memory: CoachMemoryData } {
  const memory = (body.memory as CoachMemoryData) ?? {
    favoriteWorkouts: [],
    mealPreferences: [],
    gymSchedule: "",
    travelHabits: "",
    equipment: [],
    goals: [],
    motivationStyle: "",
    notes: [],
  };
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
  return { ctx, memory };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message: string = body.message || "";
    const { ctx, memory } = buildContextFromBody(body);

    const parsed = parseIntent(message, ctx);
    const reply = generateCoachReply(message, ctx, parsed);

    // memory extraction
    const memUpdate = extractMemory(message, { ...ctx, memory });
    let memoryUpdated = false;
    if (memUpdate && body.onClientSave !== false) {
      memoryUpdated = true;
    }

    // Attach the routed prompt template for transparency / downstream LLM use.
    const prompt = routePrompt(parsed.intent);

    const payload = {
      reply: reply.text,
      intent: parsed.intent,
      sentiment: parsed.sentiment,
      recommendation: reply.recommendation ?? null,
      cards: reply.cards ?? null,
      safety: reply.safety ?? false,
      memoryUpdated,
      memory: memUpdate ?? null,
      promptTemplate: PROMPT_TEMPLATES[Object.keys(PROMPT_TEMPLATES).find((k) => PROMPT_TEMPLATES[k] === prompt) || "workout"] ?? prompt,
      systemPrompt: COACH_SYSTEM_PROMPT,
    };

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
