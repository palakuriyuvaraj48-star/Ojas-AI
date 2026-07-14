import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { buildIncident } from "@/lib/admin/monitoring";
import type { Incident, IncidentSeverity } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const incidents = await db.incidents.list();
    incidents.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    return json({ incidents });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "system:alerts", { action: "create_incident", module: "system", resource: "incident" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const title = str(body.title).trim();
    if (!title) throw new HttpError(400, "Incident title is required");
    const serviceId = str(body.serviceId);
    const incident = buildIncident({ title, serviceId, severity: enumIn<IncidentSeverity>(body.severity, ["minor", "major", "critical"], "major"), createdBy: session.email });
    await db.incidents.insert(incident);
    return json({ incident }, 201);
  });
}
