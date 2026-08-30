/**
 * Ojas AI - Ollama Gemma 3 4B Fitness Intelligence Service
 * Handles life-cycle management, background Ollama process launching,
 * Fitness Knowledge RAG integration, deterministic state classification,
 * structured JSON inference, response validation, and sports-science fallbacks.
 */

import { spawn } from "child_process";
import { OJAS_SYSTEM_PROMPT, OJAS_JSON_INSTRUCTION } from "./system-prompt";
import { DigitalTwinAIContext } from "@/lib/digital-twin/ai-context";
import { retrieveFitnessKnowledge, RetrievedKnowledge } from "@/lib/fitness-knowledge";

export type AiServiceStatus = "ready" | "starting" | "model_missing" | "unavailable" | "degraded";

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeoutSeconds: number;
}

export interface OllamaHealthStatus {
  ollama: boolean;
  model: string;
  model_available: boolean;
  knowledge_base?: boolean;
  digital_twin?: boolean;
  status: AiServiceStatus;
  message?: string;
  available_models?: string[];
  last_checked?: string;
}

export interface FitnessContextInput {
  goal?: string;
  fitness_level?: string;
  sleep_hours?: number;
  recovery_score?: number;
  fatigue_score?: number;
  stress_score?: number | string;
  last_workout?: string;
  available_time_minutes?: number;
  budget_daily?: number | string;
  equipment?: string[];
  location?: string;
  injuries?: string;
  food_preference?: string;
  message?: string;
  digital_twin?: DigitalTwinAIContext;
  [key: string]: any;
}

export type AdaptiveFitnessState =
  | "NORMAL"
  | "LOW_RECOVERY"
  | "HIGH_FATIGUE"
  | "LOW_SLEEP"
  | "HIGH_STRESS"
  | "TIME_LIMITED"
  | "PROGRESSION_READY"
  | "RECOVERY_PRIORITY";

export interface StructuredFitnessRecommendation {
  status: "success" | "fallback";
  model: string;
  source?: "digital_twin" | "baseline";
  knowledge_used?: boolean;
  recommendation: {
    title?: string;
    workout: string;
    intensity: string;
    duration_minutes: number;
    exercises?: string[];
    recovery: string;
    nutrition: string;
    hydration?: string;
    reason: string;
    alternatives?: string[];
    priority?: string;
  };
  adaptation?: {
    state: AdaptiveFitnessState;
    changes_from_normal_plan: string[];
  };
  digital_twin?: {
    recovery_score: number | null;
    fatigue_score: number | null;
    sleep_hours: number | null;
    consistency_score?: number | null;
    fitness_level?: string | null;
  };
  metadata?: {
    latency_ms?: number;
    fallback_used?: boolean;
    timestamp?: string;
  };
}

export function getOllamaConfig(): OllamaConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    model: process.env.OLLAMA_MODEL || "gemma3:4b",
    timeoutSeconds: Number(process.env.OLLAMA_TIMEOUT || "120"),
  };
}

let cachedHealth: OllamaHealthStatus | null = null;
let lastHealthCheckTime = 0;
let isInitializing = false;
let isWarmedUp = false;

/**
 * Checks whether Ollama is reachable and lists its models.
 */
export async function checkOllamaHealth(forceFresh = false): Promise<OllamaHealthStatus> {
  const now = Date.now();
  if (!forceFresh && cachedHealth && now - lastHealthCheckTime < 10000) {
    return cachedHealth;
  }

  const config = getOllamaConfig();
  const baseStatus: OllamaHealthStatus = {
    ollama: false,
    model: config.model,
    model_available: false,
    knowledge_base: true,
    digital_twin: true,
    status: "unavailable",
    available_models: [],
    last_checked: new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${config.baseUrl}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      baseStatus.status = "unavailable";
      baseStatus.message = `Ollama responded with status ${res.status}`;
      cachedHealth = baseStatus;
      lastHealthCheckTime = now;
      return baseStatus;
    }

    const data = await res.json();
    baseStatus.ollama = true;

    const modelsList: string[] = Array.isArray(data?.models)
      ? data.models.map((m: any) => (m.name || m.model || "").toLowerCase())
      : [];

    baseStatus.available_models = modelsList;

    const target = config.model.toLowerCase();
    const hasTarget = modelsList.some(
      (m) => m === target || m.startsWith(`${target}:`) || m === target.split(":")[0]
    );

    baseStatus.model_available = hasTarget;
    baseStatus.status = hasTarget ? "ready" : "model_missing";
    baseStatus.message = hasTarget
      ? `Model ${config.model} is ready.`
      : `Model ${config.model} is missing in Ollama. Available: [${modelsList.join(", ")}]`;

    cachedHealth = baseStatus;
    lastHealthCheckTime = now;
    return baseStatus;
  } catch (err: any) {
    baseStatus.ollama = false;
    baseStatus.model_available = false;
    baseStatus.status = "unavailable";
    baseStatus.message = `Cannot connect to Ollama at ${config.baseUrl} (${err.message})`;
    cachedHealth = baseStatus;
    lastHealthCheckTime = now;
    return baseStatus;
  }
}

/**
 * Returns true if the target model is installed.
 */
export async function isModelAvailable(modelName?: string): Promise<boolean> {
  const health = await checkOllamaHealth();
  if (!health.ollama) return false;
  if (!modelName) return health.model_available;

  const target = modelName.toLowerCase();
  return (
    health.available_models?.some(
      (m) => m === target || m.startsWith(`${target}:`) || m === target.split(":")[0]
    ) || false
  );
}

/**
 * Automatically launches `ollama serve` on Windows if Ollama is installed but not running.
 */
export async function startOllamaIfNeeded(): Promise<boolean> {
  const initialHealth = await checkOllamaHealth(true);
  if (initialHealth.ollama) {
    return true;
  }

  console.log("[OJAS AI] Ollama is not reachable on 127.0.0.1:11434. Checking local installation...");

  try {
    const defaultWinPath = "C:\\Users\\yuvar\\AppData\\Local\\Programs\\Ollama\\ollama.exe";
    const binary = process.env.OLLAMA_BINARY || (process.platform === "win32" ? defaultWinPath : "ollama");

    const subprocess = spawn(binary, ["serve"], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });

    subprocess.unref();
    console.log("[OJAS AI] Started background Ollama server process.");
    return await waitForOllama(8000);
  } catch (err) {
    console.warn("[OJAS AI] Could not auto-launch Ollama process:", err);
    return false;
  }
}

/**
 * Polls Ollama until it responds or times out.
 */
export async function waitForOllama(timeoutMs = 8000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const health = await checkOllamaHealth(true);
    if (health.ollama) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

/**
 * Performs a lightweight warm-up generation to initialize VRAM/memory.
 */
export async function warmUpModel(): Promise<boolean> {
  const config = getOllamaConfig();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        prompt: "Respond with OK",
        stream: false,
        options: { num_predict: 5, temperature: 0.1 },
      }),
    });
    clearTimeout(timeout);

    if (res.ok) {
      isWarmedUp = true;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Initializes the full Ollama service lifecycle.
 */
export async function initializeOllamaService(): Promise<OllamaHealthStatus> {
  if (isInitializing) {
    return checkOllamaHealth();
  }

  isInitializing = true;
  console.log("[OJAS AI] Initializing AI service...");

  let health = await checkOllamaHealth(true);

  if (!health.ollama) {
    console.log("[OJAS AI] Ollama is not running. Attempting auto-start...");
    const started = await startOllamaIfNeeded();
    if (started) {
      health = await checkOllamaHealth(true);
    }
  }

  const config = getOllamaConfig();

  if (health.ollama) {
    if (health.model_available) {
      console.log(`[OJAS AI] Model ${config.model} available. Warming up...`);
      await warmUpModel();
      health.status = "ready";
    } else {
      health.status = "model_missing";
    }
  } else {
    health.status = "unavailable";
  }

  isInitializing = false;
  return health;
}

/**
 * Evaluates deterministic fitness state and records explicit adaptations.
 */
export function classifyAdaptiveState(context: FitnessContextInput): {
  state: AdaptiveFitnessState;
  changes: string[];
} {
  const recovery = context.recovery_score ?? context.digital_twin?.recovery?.score ?? 70;
  const fatigue = context.fatigue_score ?? context.digital_twin?.recovery?.fatigue ?? 30;
  const sleep = context.sleep_hours ?? context.digital_twin?.sleep?.duration_hours ?? 7.5;
  const time = context.available_time_minutes ?? context.digital_twin?.lifestyle?.time_available ?? 45;
  const stress = String(context.stress_score ?? context.digital_twin?.lifestyle?.stress ?? "low").toLowerCase();

  const changes: string[] = [];
  let state: AdaptiveFitnessState = "NORMAL";

  if (recovery < 45 || fatigue > 75) {
    state = "RECOVERY_PRIORITY";
    changes.push("Reduced intensity to Active Recovery / Deload");
    changes.push("Substituted heavy axial loading with joint decompression and mobility");
  } else if (sleep < 6.0) {
    state = "LOW_SLEEP";
    changes.push("Scaled back working sets by 30% due to sleep deficit (<6h)");
    changes.push("Prioritized parasympathetic cooldown and early bedtime");
  } else if (time <= 25) {
    state = "TIME_LIMITED";
    changes.push(`Compressed workout structure to fit strict ${time}-minute window`);
    changes.push("Utilized high-density supersets and compound mechanical pairings");
  } else if (stress === "high") {
    state = "HIGH_STRESS";
    changes.push("Moderated nervous system stress with steady-state movement and breathing work");
  } else if (recovery >= 75 && fatigue <= 35) {
    state = "PROGRESSION_READY";
    changes.push("Maintained progressive overload targets (1-2 RIR) to exploit high readiness");
  } else {
    state = "NORMAL";
    changes.push("Preserved standard periodized training load");
  }

  return { state, changes };
}

/**
 * Builds structured user fitness state context into a clean JSON block for Gemma 3 4B.
 */
function buildContextBlock(ctx: FitnessContextInput): string {
  if (ctx.digital_twin) {
    return JSON.stringify(ctx.digital_twin, null, 2);
  }

  const structured = {
    goal: ctx.goal || null,
    fitness_level: ctx.fitness_level || null,
    available_time_minutes: ctx.available_time_minutes ?? null,
    sleep_hours: ctx.sleep_hours ?? null,
    recovery_score: ctx.recovery_score ?? null,
    fatigue_score: ctx.fatigue_score ?? null,
    stress_score: ctx.stress_score ?? null,
    daily_budget_inr: ctx.budget_daily ?? null,
    equipment: ctx.equipment && ctx.equipment.length > 0 ? ctx.equipment : ["bodyweight"],
    workout_environment: ctx.location || null,
    injuries: ctx.injuries && ctx.injuries !== "None" ? ctx.injuries : null,
    food_preference: ctx.food_preference || null,
    last_workout: ctx.last_workout || null,
  };

  return JSON.stringify(structured, null, 2);
}

/**
 * Deterministic sports science fallback recommendation if Ollama is unavailable.
 */
export function getDeterministicFallback(
  context: FitnessContextInput = {},
  prompt?: string
): StructuredFitnessRecommendation {
  const config = getOllamaConfig();
  const time = context.available_time_minutes ?? context.digital_twin?.lifestyle?.time_available ?? 30;
  const sleep = context.sleep_hours ?? context.digital_twin?.sleep?.duration_hours ?? 7;
  const recovery = context.recovery_score ?? context.digital_twin?.recovery?.score ?? 70;
  const fatigue = context.fatigue_score ?? context.digital_twin?.recovery?.fatigue ?? 30;
  const goal = context.goal || context.digital_twin?.goal?.primary || "fat-loss";

  const { state, changes } = classifyAdaptiveState(context);

  let title = "Adaptive Daily Session";
  let intensity = "Moderate";
  let workoutName = `${time}-Minute Adaptive Functional Session`;
  let exercises = [
    "Dumbbell Goblet Squat - 3 sets x 10 reps (2 RIR)",
    "Dumbbell Romanian Deadlift - 3 sets x 10 reps (2 RIR)",
    "Incline Pushups / DB Floor Press - 3 sets x 12 reps",
    "Plank / Core Hold - 3 sets x 45s",
  ];
  let recoveryAdvice = "Standard post-workout hydration and 10 minutes of light mobility.";
  let nutritionAdvice = "Prioritize whole proteins (1.8g/kg) and complex carbs fitting your daily targets.";
  let hydrationAdvice = "Consume 500ml water post-workout plus electrolyte balance.";
  let reason = "Generated via Ojas deterministic sports-science engine matching your current recovery baseline.";

  if (state === "RECOVERY_PRIORITY" || state === "LOW_SLEEP") {
    title = "Restorative Mobility & Decompression";
    intensity = "Deload / Active Recovery";
    workoutName = `${Math.min(time, 20)}-Minute Mobility & Joint Decompression`;
    exercises = [
      "Cat-Cow & Thoracic Extensions - 2 sets x 10 reps",
      "90/90 Hip Mobility Flow - 2 sets x 8 reps/side",
      "Dead Bug Core Stability - 3 sets x 10 reps/side",
      "Diaphragmatic Box Breathing - 5 minutes",
    ];
    recoveryAdvice = "High priority on sleep optimization, parasympathetic breathing, and restorative foam rolling.";
    reason = "Low recovery score and elevated fatigue detected. Scaled down training volume to prevent central nervous system burnout.";
  } else if (state === "TIME_LIMITED") {
    title = "High-Density Express Circuit";
    intensity = "High Density";
    workoutName = `${time}-Minute High-Density Bodyweight & DB Circuit`;
    exercises = [
      "DB Thrusters / Squat to Press - 3 sets x 10 reps",
      "DB Bent-Over Alternating Rows - 3 sets x 12 reps",
      "Bodyweight Walking Lunges - 3 sets x 12 reps/leg",
      "Mountain Climbers - 3 sets x 30s",
    ];
    reason = `Strict ${time}-minute schedule detected. High-density paired sets maximize metabolic stimulus in minimal time.`;
  } else if (goal.includes("bulk") || goal.includes("muscle")) {
    title = "Progressive Hypertrophy Split";
    intensity = "High";
    workoutName = `${time}-Minute Hypertrophy Split`;
    exercises = [
      "DB Romanian Deadlifts - 4 sets x 8-10 reps (1-2 RIR)",
      "DB Flat Bench Press - 4 sets x 8-10 reps (1-2 RIR)",
      "Chest Supported Rows - 3 sets x 10-12 reps",
      "Overhead Tricep Extension - 3 sets x 12-15 reps",
    ];
    nutritionAdvice = "Maintain a slight caloric surplus (+250-350 kcal) with 2g/kg protein.";
    reason = "Optimal readiness detected. Training focuses on progressive overload in hypertrophy rep ranges.";
  }

  return {
    status: "fallback",
    model: `${config.model} (fallback-engine)`,
    source: context.digital_twin ? "digital_twin" : "baseline",
    knowledge_used: true,
    recommendation: {
      title,
      workout: workoutName,
      intensity,
      duration_minutes: time,
      exercises,
      recovery: recoveryAdvice,
      nutrition: nutritionAdvice,
      hydration: hydrationAdvice,
      reason,
      alternatives: [
        "Bodyweight circuit at home",
        "15-minute quick mobility flow",
        "Brisk 25-minute zone 2 walk",
      ],
      priority: recovery < 40 ? "Critical" : "Medium",
    },
    adaptation: {
      state,
      changes_from_normal_plan: changes,
    },
    digital_twin: {
      recovery_score: recovery,
      fatigue_score: fatigue,
      sleep_hours: sleep,
      consistency_score: context.digital_twin?.training?.consistency_score ?? null,
      fitness_level: context.digital_twin?.profile?.fitness_level ?? context.fitness_level ?? null,
    },
    metadata: {
      fallback_used: true,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Validates and sanitizes structured model output.
 */
export function validateFitnessRecommendation(
  rawJson: any,
  context: FitnessContextInput,
  retrievedKnowledge: RetrievedKnowledge
): StructuredFitnessRecommendation["recommendation"] | null {
  if (!rawJson || typeof rawJson !== "object") return null;

  const targetTime = context.available_time_minutes ?? context.digital_twin?.lifestyle?.time_available ?? 30;

  // Enforce required fields
  const workout = typeof rawJson.workout === "string" && rawJson.workout.trim().length > 0
    ? rawJson.workout.trim()
    : `${targetTime}-Minute Adaptive Workout`;

  const intensity = typeof rawJson.intensity === "string" ? rawJson.intensity : "Moderate";
  
  // Enforce duration does not exceed available time by more than 5 minutes
  let duration = Number(rawJson.duration_minutes || targetTime);
  if (isNaN(duration) || duration <= 0) duration = targetTime;
  if (duration > targetTime + 5) duration = targetTime;

  const reason = typeof rawJson.reason === "string" && rawJson.reason.trim().length > 0
    ? rawJson.reason.trim()
    : "Adapted based on your active Digital Twin metrics.";

  const recovery = typeof rawJson.recovery === "string" && rawJson.recovery.trim().length > 0
    ? rawJson.recovery.trim()
    : "Hydrate with 500ml water and perform 5 minutes of mobility.";

  const nutrition = typeof rawJson.nutrition === "string" && rawJson.nutrition.trim().length > 0
    ? rawJson.nutrition.trim()
    : "Prioritize lean protein and micronutrient balance fitting your daily budget.";

  const hydration = typeof rawJson.hydration === "string" && rawJson.hydration.trim().length > 0
    ? rawJson.hydration.trim()
    : "Aim for 2.5-3.0L total fluid intake today.";

  const title = typeof rawJson.title === "string" ? rawJson.title : workout;

  const exercises = Array.isArray(rawJson.exercises) && rawJson.exercises.length > 0
    ? rawJson.exercises.filter((e: any) => typeof e === "string")
    : ["Compound movement pairing - 3 sets", "Core & stability circuit - 3 sets"];

  const alternatives = Array.isArray(rawJson.alternatives)
    ? rawJson.alternatives.filter((a: any) => typeof a === "string")
    : ["15-min mobility flow", "Zone-2 walk"];

  // Medical red flag safety injection
  let finalReason = reason;
  let finalRecovery = recovery;
  if (retrievedKnowledge.safetyFlag) {
    finalReason = `⚠️ Safety Note: You reported potential red-flag symptoms. High-intensity loading has been suspended. Please consult a medical professional for evaluation.`;
    finalRecovery = `Rest, avoid aggravating positions, and schedule a medical check-up if pain or dizziness persists.`;
  }

  return {
    title,
    workout,
    intensity,
    duration_minutes: duration,
    exercises,
    recovery: finalRecovery,
    nutrition,
    hydration,
    reason: finalReason,
    alternatives,
    priority: rawJson.priority || (context.recovery_score != null && context.recovery_score < 40 ? "Critical" : "Medium"),
  };
}

/**
 * Generates a structured fitness recommendation from Ollama (Gemma 3 4B)
 * integrating Digital Twin state, Fitness Knowledge RAG, and response validation.
 */
export async function generateFitnessResponse(
  userPrompt: string,
  context: FitnessContextInput = {}
): Promise<StructuredFitnessRecommendation> {
  const startTime = Date.now();
  const config = getOllamaConfig();

  const health = await checkOllamaHealth();
  if (!health.ollama || !health.model_available) {
    return getDeterministicFallback(context, userPrompt);
  }

  // 1. Retrieve sports-science knowledge principles (RAG)
  const retrievedKnowledge = retrieveFitnessKnowledge(userPrompt, {
    goal: context.goal || context.digital_twin?.goal?.primary,
    fitness_level: context.fitness_level || context.digital_twin?.profile?.fitness_level,
    recovery_score: context.recovery_score ?? context.digital_twin?.recovery?.score,
    fatigue_score: context.fatigue_score ?? context.digital_twin?.recovery?.fatigue,
    sleep_hours: context.sleep_hours ?? context.digital_twin?.sleep?.duration_hours,
    time_available: context.available_time_minutes ?? context.digital_twin?.lifestyle?.time_available,
    equipment: context.equipment || context.digital_twin?.profile?.equipment,
    stress: String(context.stress_score ?? context.digital_twin?.lifestyle?.stress ?? ""),
    budget: context.budget_daily ?? context.digital_twin?.nutrition?.budget_daily,
    injuries: context.injuries,
  });

  // 2. Classify deterministic adaptive state
  const { state, changes } = classifyAdaptiveState(context);

  // 3. Assemble predictable prompt structure
  const contextJson = buildContextBlock(context);
  const fullPrompt = `${OJAS_SYSTEM_PROMPT}

DIGITAL TWIN STATE:
${contextJson}

FITNESS KNOWLEDGE & EVIDENCE BASE (RAG):
${retrievedKnowledge.contextSummary}

DETERMINISTIC ADAPTATION ANALYSIS:
- Classified State: ${state}
- Recommended Adjustments: ${changes.join("; ")}

USER REQUEST:
${userPrompt || "Generate today's optimal personalized workout, nutrition, and recovery recommendation."}

${OJAS_JSON_INSTRUCTION}`;

  try {
    const controller = new AbortController();
    const timeoutMs = (config.timeoutSeconds || 120) * 1000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${config.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        prompt: fullPrompt,
        format: "json",
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 650,
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[OJAS AI] Ollama generate failed with status ${response.status}`);
      return getDeterministicFallback(context, userPrompt);
    }

    const data = await response.json();
    const rawText = data?.response || "";

    // Safe JSON parse
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Unable to parse model JSON output");
      }
    }

    // 4. Validate output through validation layer
    const validatedRec = validateFitnessRecommendation(parsed, context, retrievedKnowledge);
    if (!validatedRec) {
      console.warn("[OJAS AI] Model output failed schema validation. Using fallback.");
      return getDeterministicFallback(context, userPrompt);
    }

    return {
      status: "success",
      model: config.model,
      source: context.digital_twin ? "digital_twin" : "baseline",
      knowledge_used: true,
      recommendation: validatedRec,
      adaptation: {
        state,
        changes_from_normal_plan: changes,
      },
      digital_twin: {
        recovery_score: context.digital_twin?.recovery?.score ?? context.recovery_score ?? null,
        fatigue_score: context.digital_twin?.recovery?.fatigue ?? context.fatigue_score ?? null,
        sleep_hours: context.digital_twin?.sleep?.duration_hours ?? context.sleep_hours ?? null,
        consistency_score: context.digital_twin?.training?.consistency_score ?? null,
        fitness_level: context.digital_twin?.profile?.fitness_level ?? context.fitness_level ?? null,
      },
      metadata: {
        latency_ms: Date.now() - startTime,
        fallback_used: false,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.warn("[OJAS AI] Error during Ollama generation, using fallback:", err);
    return getDeterministicFallback(context, userPrompt);
  }
}
