import { NextResponse } from "next/server";
import { generateId } from "@/lib/future-ai/storage";
import { futureHealthRisk } from "@/lib/future-ai/storage";
import {
  computeConfidence,
  defaultSignals,
  deriveInsights,
  generateLongTermProjection,
  getEducationalContent,
  getCategoryFactors,
  runFullAssessment,
} from "@/lib/future-ai/health-risk/engine";
import type {
  HealthRiskCategory,
  HealthRiskAssessment,
  HealthRiskSignals,
  RiskHeatmapPoint,
} from "@/lib/future-ai/health-risk/types";

/**
 * Feature 150 — Health Risk Prediction API.
 *
 * Action map:
 *  GET ?action=assessment&userId=xxx   -> latest assessments (one per category)
 *  GET ?action=history&userId=xxx      -> full assessment history
 *  POST ?action=assess                 -> run a new assessment batch
 *  GET ?action=projections&userId=xxx  -> 3/6/12 month long-term projections
 *  GET ?action=heatmap&userId=xxx      -> risk heatmap points
 *  GET ?action=factors&userId=xxx      -> contributing/protective factor catalog
 *  GET ?action=education               -> educational content
 *
 * Persistence uses localStorage-backed helpers. On the server (route handler)
 * localStorage is unavailable, so we fall back to a process-level store so the
 * endpoints remain functional for demos and tests.
 */

// Process-level fallback store (used when localStorage is unavailable).
const serverStore = new Map<string, HealthRiskAssessment[]>();

function safeList(userId: string): HealthRiskAssessment[] {
  try {
    const items = futureHealthRisk.listAssessments(userId);
    return (items as unknown as HealthRiskAssessment[]) ?? [];
  } catch {
    return serverStore.get(userId) ?? [];
  }
}

function safeAdd(record: HealthRiskAssessment): HealthRiskAssessment {
  try {
    return futureHealthRisk.addAssessment(record) as unknown as HealthRiskAssessment;
  } catch {
    const list = serverStore.get(record.userId) ?? [];
    list.push(record);
    serverStore.set(record.userId, list);
    return record;
  }
}

function latestByCategory(userId: string): HealthRiskAssessment[] {
  const all = safeList(userId);
  const map = new Map<HealthRiskCategory, HealthRiskAssessment>();
  for (const a of all) {
    const existing = map.get(a.category);
    if (!existing || new Date(a.assessedAt).getTime() > new Date(existing.assessedAt).getTime()) {
      map.set(a.category, a);
    }
  }
  return Array.from(map.values());
}

function buildSignalsFromInput(input: Partial<HealthRiskSignals> | undefined): HealthRiskSignals {
  return { ...defaultSignals(), ...(input ?? {}) };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "assessment";
  const userId = searchParams.get("userId") ?? "demo-user";

  switch (action) {
    case "assessment": {
      const latest = latestByCategory(userId);
      return NextResponse.json({ userId, assessments: latest, modelVersion: "titan-hr-1.0.0" });
    }

    case "history": {
      const history = safeList(userId).sort(
        (a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
      );
      return NextResponse.json({ userId, history });
    }

    case "projections": {
      const latest = latestByCategory(userId);
      const trends: Partial<Record<HealthRiskCategory, { riskScore: number; confidence: number }>> = {};
      for (const a of latest) trends[a.category] = { riskScore: a.riskScore, confidence: a.confidence };
      const projections = generateLongTermProjection(userId, trends);
      return NextResponse.json({ userId, projections });
    }

    case "heatmap": {
      const all = safeList(userId);
      const points: RiskHeatmapPoint[] = all.map((a) => ({
        category: a.category,
        date: a.assessedAt,
        riskScore: a.riskScore,
        confidence: a.confidence,
      }));
      return NextResponse.json({ userId, points });
    }

    case "factors": {
      const categories = Object.values(latestByCategory(userId).reduce<Record<string, HealthRiskCategory>>((acc, a) => {
        acc[a.category] = a.category;
        return acc;
      }, {}));
      const factors = categories.map((c) => ({ category: c, factors: getCategoryFactors(c) }));
      return NextResponse.json({ userId, factors });
    }

    case "education": {
      return NextResponse.json({ content: getEducationalContent() });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") ?? "assess";

  if (action !== "assess") {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  let body: { userId?: string; signals?: Partial<HealthRiskSignals> } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userId = body.userId ?? "demo-user";
  const signals = buildSignalsFromInput(body.signals);
  const assessedAt = new Date().toISOString();
  const confidence = computeConfidence(signals);

  const batch = runFullAssessment(userId, signals, assessedAt).map((a) => ({
    ...a,
    id: generateId(),
  }));

  batch.forEach((record) => safeAdd(record));

  const prev = safeList(userId).filter(
    (a) => new Date(a.assessedAt).getTime() < new Date(assessedAt).getTime()
  );
  const latest = latestByCategory(userId);
  const previous = latestByCategory(userId === userId ? userId : userId).filter((a) =>
    prev.some((p) => p.category === a.category)
  );
  const insights = deriveInsights(userId, latest, previous.length ? previous : prev);

  return NextResponse.json({
    userId,
    assessments: batch,
    confidence,
    dataCompleteness: Math.round(
      (Object.keys(signals).filter((k) => (signals as Record<string, unknown>)[k] !== undefined).length /
        Object.keys(defaultSignals()).length) *
        100
    ),
    insights,
    assessedAt,
    modelVersion: "titan-hr-1.0.0",
  });
}
