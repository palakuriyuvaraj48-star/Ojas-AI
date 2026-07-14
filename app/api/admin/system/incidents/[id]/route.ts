import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { Incident, IncidentStatus } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "system:alerts", { action: "update_incident", module: "system", resource: "incident", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.incidents.get(id);
    if (!existing) throw new HttpError(404, "Incident not found");
    const patch: Partial<Incident> = {};
    if (body.status) patch.status = enumIn<IncidentStatus>(body.status, ["investigating", "identified", "monitoring", "resolved"], existing.status);
    if (body.rootCause !== undefined) patch.rootCause = str(body.rootCause);
    if (body.status === "resolved") patch.resolvedAt = new Date().toISOString();

    const eventMsg = str(body.message);
    if (eventMsg) {
      const evType = enumIn<any>(body.eventType, ["update", "root_cause", "resolved"], "update");
      patch.timeline = [
        ...existing.timeline,
        { id: `ev_${randomToken(6)}`, at: new Date().toISOString(), message: eventMsg, author: session.email, type: evType },
      ];
    }
    const updated = await db.incidents.update(id, patch);
    return json({ incident: updated });
  });
}
