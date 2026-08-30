import { NextResponse } from "next/server";
import { checkOllamaHealth, initializeOllamaService } from "@/lib/ollama";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shouldInit = searchParams.get("init") === "true";

    const health = shouldInit
      ? await initializeOllamaService()
      : await checkOllamaHealth();

    return NextResponse.json({
      ollama: health.ollama,
      model: health.model,
      model_available: health.model_available,
      knowledge_base: true,
      digital_twin: true,
      status: health.status,
      message: health.message,
      available_models: health.available_models,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ollama: false,
        model: process.env.OLLAMA_MODEL || "gemma3:4b",
        model_available: false,
        knowledge_base: true,
        digital_twin: true,
        status: "unavailable",
        message: err?.message || "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
