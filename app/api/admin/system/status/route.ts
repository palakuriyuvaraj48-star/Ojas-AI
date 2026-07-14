import { NextRequest } from "next/server";
import { initStore } from "@/lib/admin/store";
import { guard, requirePermission, json } from "@/lib/admin/api";
import { checkServices, computeHealthScore } from "@/lib/admin/monitoring";
import { db } from "@/lib/admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public-ish status page (still behind system:read for simplicity).
export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const services = await checkServices();
    const open = (await db.incidents.list()).filter((i) => i.status !== "resolved");
    const latest = (await db.metrics.list()).slice(-1)[0];
    const score = computeHealthScore(services, latest);
    return json({
      status: score >= 90 ? "operational" : score >= 70 ? "degraded" : "major_outage",
      healthScore: score,
      services: services.map((s) => ({ name: s.name, category: s.category, status: s.status, latencyMs: s.latencyMs, uptimePct: s.uptimePct })),
      activeIncidents: open,
      generatedAt: Date.now(),
    });
  });
}
