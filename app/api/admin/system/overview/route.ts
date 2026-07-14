import { NextRequest } from "next/server";
import { initStore } from "@/lib/admin/store";
import { guard, requirePermission, json } from "@/lib/admin/api";
import {
  collectMetricSample, checkServices, evaluateAlerts, computeHealthScore, collectAiUsage,
} from "@/lib/admin/monitoring";
import { db } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const sample = await collectMetricSample();
    const services = await checkServices();
    const rules = await db.alertRules.list();
    const triggered = evaluateAlerts(rules, sample, services);
    const ai = await collectAiUsage();
    const healthScore = computeHealthScore(services, sample);
    return json({
      healthScore,
      metric: sample,
      services,
      alerts: { rules, triggered },
      ai,
      generatedAt: Date.now(),
    });
  });
}
