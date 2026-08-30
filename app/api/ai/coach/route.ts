import { NextResponse } from "next/server";
import { generateFitnessResponse, FitnessContextInput } from "@/lib/ollama";
import { getDigitalTwinAIContext, DigitalTwinAIContext } from "@/lib/digital-twin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Identify and authenticate user context if provided
    const authHeader = request.headers.get("authorization") || request.headers.get("x-user-id");
    const userId = body.userId || (authHeader ? authHeader.replace(/^Bearer\s+/i, "") : "user_active");

    const userPrompt = body.prompt || body.message || "Generate today's optimal workout, nutrition, and recovery recommendation.";

    // 2. Build or extract the Digital Twin AI context
    let digitalTwinContext: DigitalTwinAIContext | undefined = body.digital_twin;

    if (!digitalTwinContext) {
      const { aiContext } = getDigitalTwinAIContext(userId, {
        twin: body.twin,
        profile: body.profile,
        logs: body.logs || body.logsHistory,
        checkins: body.checkins || body.checkInHistory,
      });
      digitalTwinContext = aiContext;
    }

    // Overlay any direct overrides if explicitly provided in the request
    if (body.sleep_hours != null && digitalTwinContext.sleep) {
      digitalTwinContext.sleep.duration_hours = body.sleep_hours;
    }
    if (body.recovery_score != null && digitalTwinContext.recovery) {
      digitalTwinContext.recovery.score = body.recovery_score;
    }
    if (body.fatigue_score != null && digitalTwinContext.recovery) {
      digitalTwinContext.recovery.fatigue = body.fatigue_score;
    }
    if (body.available_time_minutes != null && digitalTwinContext.profile) {
      digitalTwinContext.profile.available_time_minutes = body.available_time_minutes;
    }
    if (body.stress_score != null && digitalTwinContext.lifestyle) {
      digitalTwinContext.lifestyle.stress = String(body.stress_score);
    }
    if (body.goal && digitalTwinContext.goal) {
      digitalTwinContext.goal.primary = body.goal;
    }

    // 3. Assemble the fitness context for Ollama
    const context: FitnessContextInput = {
      goal: digitalTwinContext.goal.primary || body.goal,
      fitness_level: digitalTwinContext.profile.fitness_level || body.fitness_level,
      sleep_hours: digitalTwinContext.sleep.duration_hours ?? body.sleep_hours,
      recovery_score: digitalTwinContext.recovery.score ?? body.recovery_score,
      fatigue_score: digitalTwinContext.recovery.fatigue ?? body.fatigue_score,
      stress_score: digitalTwinContext.lifestyle.stress ?? body.stress_score,
      last_workout: body.last_workout,
      available_time_minutes: digitalTwinContext.profile.available_time_minutes ?? body.available_time_minutes,
      budget_daily: digitalTwinContext.nutrition.budget_daily ?? body.budget_daily,
      equipment: digitalTwinContext.profile.equipment || body.equipment,
      location: digitalTwinContext.profile.environment || body.location,
      injuries: body.injuries,
      food_preference: body.food_preference,
      digital_twin: digitalTwinContext,
    };

    // 4. Generate structured fitness recommendation from Ollama (Gemma 3 4B)
    const result = await generateFitnessResponse(userPrompt, context);

    return NextResponse.json({
      status: result.status,
      model: result.model,
      source: result.source || "digital_twin",
      knowledge_used: result.knowledge_used ?? true,
      recommendation: result.recommendation,
      adaptation: result.adaptation,
      digital_twin: result.digital_twin || {
        recovery_score: digitalTwinContext.recovery.score,
        fatigue_score: digitalTwinContext.recovery.fatigue,
        sleep_hours: digitalTwinContext.sleep.duration_hours,
        consistency_score: digitalTwinContext.training.consistency_score,
        fitness_level: digitalTwinContext.profile.fitness_level,
      },
      metadata: result.metadata,
    });
  } catch (err: any) {
    console.error("[OJAS AI] Error in /api/ai/coach:", err);
    return NextResponse.json(
      {
        status: "error",
        model: process.env.OLLAMA_MODEL || "gemma3:4b",
        source: "fallback",
        message: err?.message || "Failed to process fitness coach request",
        recommendation: {
          workout: "20-Minute Core & Mobility Flow",
          intensity: "Moderate",
          duration_minutes: 20,
          recovery: "Hydrate with 500ml water and perform 5 minutes of static stretching.",
          nutrition: "Consume a balanced post-workout meal with 25g protein.",
          reason: "Default safety routine generated after unexpected request error.",
        },
      },
      { status: 200 }
    );
  }
}
