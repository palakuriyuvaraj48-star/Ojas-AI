import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { computeExperimentWinner } from "@/lib/admin/feature-flags";
import type { Experiment, ExperimentMetric, ExperimentStatus } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "flags:write", { action: "experiment_upsert", module: "feature-flags", resource: "experiment", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const flag = await db.featureFlags.get(id);
    if (!flag || flag.deletedAt) throw new HttpError(404, "Flag not found");

    const metrics: ExperimentMetric[] = arr<any>(body.metrics).map((m) => ({
      variantKey: str(m.variantKey),
      exposure: Number(m.exposure ?? 0),
      conversionRate: Number(m.conversionRate ?? 0),
      retention: Number(m.retention ?? 0),
      engagement: Number(m.engagement ?? 0),
      revenue: Number(m.revenue ?? 0),
      workoutCompletion: Number(m.workoutCompletion ?? 0),
      nutritionCompletion: Number(m.nutritionCompletion ?? 0),
      confidence: Number(m.confidence ?? 0),
    }));

    const exp: Experiment = {
      id: str(body.id) || `exp_${randomToken(8)}`,
      name: str(body.name, "Experiment"),
      status: enumIn<ExperimentStatus>(body.status, ["draft", "running", "paused", "completed"], "running"),
      controlKey: str(body.controlKey, metrics[0]?.variantKey ?? "control"),
      startDate: str(body.startDate) || new Date().toISOString(),
      endDate: body.endDate ? str(body.endDate) : undefined,
      metrics,
      goalMetric: enumIn<any>(body.goalMetric, ["conversionRate", "retention", "engagement", "revenue", "workoutCompletion", "nutritionCompletion"], "conversionRate"),
    };
    const winner = computeExperimentWinner(exp);
    exp.winningVariantKey = winner.winner;

    const updated = await db.featureFlags.update(id, (prev) => {
      const others = prev.experiments.filter((e) => e.id !== exp.id);
      return { ...prev, experiments: [...others, exp], updatedAt: new Date().toISOString() };
    });
    return json({ experiment: updated?.experiments.find((e) => e.id === exp.id), winner });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const expId = searchParams.get("expId") || "";
  return withAudit(req, "flags:write", { action: "experiment_delete", module: "feature-flags", resource: "experiment", resourceId: expId }, async () => {
    assertSafeMutation(req);
    const updated = await db.featureFlags.update(id, (prev) => ({
      ...prev,
      experiments: prev.experiments.filter((e) => e.id !== expId),
      updatedAt: new Date().toISOString(),
    }));
    return json({ success: !!updated });
  });
}
