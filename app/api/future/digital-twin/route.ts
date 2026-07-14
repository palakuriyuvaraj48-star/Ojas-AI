import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { generateId } from "@/lib/future-ai/storage";
import {
  computeDigitalTwinProfile,
  generatePredictions,
  computeConfidence,
  type DigitalTwinContext,
} from "@/lib/future-ai/digital-twin/engine";
import type {
  DigitalTwinPrediction,
  DigitalTwinSimulation,
  DigitalTwinDashboardResponse,
  DigitalTwinPredictionRequest,
  DigitalTwinSimulationRequest,
  PredictionHorizon,
  PredictionType,
  PredictionDrift,
} from "@/lib/future-ai/types";

export async function GET(request: Request) {
  if (!config.features.futureDigitalTwin20) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "dashboard";
  const horizon = (searchParams.get("horizon") as PredictionHorizon) ?? "weekly";
  const userId = searchParams.get("userId") ?? "demo-user";

  if (action === "predictions") {
    const profile = buildProfile(userId);
    const predictions = generatePredictions(profile, horizon);
    return NextResponse.json({ predictions });
  }

  if (action === "simulations") {
    const simulations = await listSimulations(userId);
    return NextResponse.json({ simulations });
  }

  const profile = buildProfile(userId);
  const predictions = generatePredictions(profile, horizon);
  const simulations = await listSimulations(userId);
  const trendData = buildTrendData(userId, horizon);
  const history = buildHistory(userId, horizon);

  const response: DigitalTwinDashboardResponse = {
    profile,
    predictions,
    simulations,
    trendData,
    history,
  };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  if (!config.features.futureDigitalTwin20) {
    return NextResponse.json({ error: "Feature disabled" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "dashboard";

  if (action !== "simulate") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  let body: DigitalTwinSimulationRequest;
  try {
    body = (await request.json()) as DigitalTwinSimulationRequest;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const userId = body.userId ?? "demo-user";
  const profile = buildProfile(userId);
  const simulation = await runSimulation(userId, profile, body);
  return NextResponse.json({ simulation });
}

/* -------------------------------------------------------------------------- */
/*  Storage helpers (kept local; storage.ts exports generic table helpers)     */
/* -------------------------------------------------------------------------- */

import { futureDigitalTwin } from "@/lib/future-ai/storage";

async function listSimulations(userId: string): Promise<DigitalTwinSimulation[]> {
  return futureDigitalTwin.listSimulations(userId);
}

async function storeSimulation(simulation: DigitalTwinSimulation): Promise<void> {
  futureDigitalTwin.addSimulation(simulation);
}

/* -------------------------------------------------------------------------- */
/*  Synthetic profile / simulation builders                                    */
/* -------------------------------------------------------------------------- */

function buildProfile(userId: string) {
  const ctx: DigitalTwinContext = {
    userId,
    workoutHistory: [
      { date: new Date(Date.now() - 86400000 * 3).toISOString(), duration: 45, type: "strength" },
      { date: new Date(Date.now() - 86400000 * 1).toISOString(), duration: 30, type: "cardio" },
    ],
    nutrition: { calories: 2100, protein: 150, consistency: 0.78 },
    recovery: { score: 72, readiness: "fresh" },
    sleep: { duration: 7.2, quality: 0.75 },
    stress: 4,
    hrv: 62,
    heartRate: 64,
    bodyComp: { bodyFat: 19.4, muscleMass: 48.2, bmi: 22.6 },
    goals: { targetWeight: 74, timelineWeeks: 12 },
    habits: [
      { name: "Morning hydration", streak: 14 },
      { name: "Protein target", streak: 9 },
    ],
    consistency: 0.82,
    mood: 0.75,
    trainingLoad: 68,
    previousInjuries: [],
    environment: {},
    weather: {},
    dailyRoutine: {},
  };

  return computeDigitalTwinProfile(userId, ctx);
}

async function runSimulation(
  userId: string,
  profile: ReturnType<typeof computeDigitalTwinProfile>,
  request: DigitalTwinSimulationRequest
): Promise<DigitalTwinSimulation> {
  const simulation = {
    ...profile,
    ...profile,
  } as any;

  const result = (
    await import("@/lib/future-ai/digital-twin/engine")
  ).simulate(profile, request.inputs);

  await storeSimulation(result);
  return result;
}

function buildTrendData(userId: string, horizon: PredictionHorizon) {
  const points = 6;
  const now = Date.now();
  const data = [];
  const base = 65 + (userId.charCodeAt(0) % 20);
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now - i * (horizon === "daily" ? 86400000 : horizon === "weekly" ? 604800000 : 2592000000));
    data.push({
      date: d.toISOString().slice(0, 10),
      value: Math.round(base + (Math.sin(i * 1.3) * 8) + (userId.charCodeAt((i + 1) % userId.length) % 5)),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      category: "overall",
    });
  }
  return data;
}

function buildHistory(userId: string, horizon: PredictionHorizon) {
  const predictionTypes: PredictionType[] = [
    "recovery",
    "performance",
    "plateau",
    "motivation",
    "habit",
    "goal_completion",
    "training_readiness",
    "body_transformation",
    "adaptation_speed",
    "training_response",
  ];

  const drifts: Array<PredictionDrift> = ["stable", "improving", "degrading", "volatile"];
  const points = 4;

  return predictionTypes.map((type) => {
    const values = [];
    const base = 60 + ((userId.charCodeAt(type.length) % 30));
    for (let i = points - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 2592000000);
      values.push({
        date: d.toISOString().slice(0, 10),
        value: Math.round(base + (Math.sin(i * 1.7 + type.length) * 10)),
        label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        category: type,
      });
    }
    return {
      predictionType: type,
      horizon,
      values,
      drift: drifts[userId.charCodeAt(type.length * 2) % drifts.length],
      modelVersion: "dtwin-2.0.1",
    };
  });
}
