import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, num, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { AlertRule, AlertCondition, AlertChannel, AlertSeverity } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "system:alerts", { action: "update_alert", module: "system", resource: "alert_rule", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.alertRules.get(id);
    if (!existing) throw new HttpError(404, "Alert rule not found");
    const patch: Partial<AlertRule> = { updatedAt: new Date().toISOString() };
    if (body.name) patch.name = str(body.name);
    if (body.condition) patch.condition = enumIn<AlertCondition>(body.condition, ["cpu_high", "memory_high", "db_down", "api_down", "ai_failure", "payment_failure", "storage_limit", "queue_failure", "auth_failure", "notification_failure"], existing.condition);
    if (body.threshold !== undefined) patch.threshold = num(body.threshold, existing.threshold);
    if (body.operator) patch.operator = enumIn<any>(body.operator, ["gt", "lt", "gte", "lte"], existing.operator);
    if (body.channels) patch.channels = arr<AlertChannel>(body.channels);
    if (body.webhookUrl !== undefined) patch.webhookUrl = str(body.webhookUrl) || undefined;
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (body.severity) patch.severity = enumIn<AlertSeverity>(body.severity, ["info", "warning", "critical"], existing.severity);
    const updated = await db.alertRules.update(id, patch);
    return json({ rule: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "system:alerts", { action: "delete_alert", module: "system", resource: "alert_rule", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.alertRules.remove(id);
    if (!ok) throw new HttpError(404, "Alert rule not found");
    return json({ success: true });
  });
}
