import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, num, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { AlertRule, AlertCondition, AlertChannel, AlertSeverity } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const rules = await db.alertRules.list();
    return json({ rules });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "system:alerts", { action: "create_alert", module: "system", resource: "alert_rule" }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const name = str(body.name).trim();
    if (!name) throw new HttpError(400, "Alert name is required");
    const rule: AlertRule = {
      id: `alert_${randomToken(8)}`,
      name,
      condition: enumIn<AlertCondition>(body.condition, ["cpu_high", "memory_high", "db_down", "api_down", "ai_failure", "payment_failure", "storage_limit", "queue_failure", "auth_failure", "notification_failure"], "cpu_high"),
      threshold: num(body.threshold, 80),
      operator: enumIn<any>(body.operator, ["gt", "lt", "gte", "lte"], "gt"),
      channels: arr<AlertChannel>(body.channels).length ? arr<AlertChannel>(body.channels) : ["email"],
      webhookUrl: body.webhookUrl ? str(body.webhookUrl) : undefined,
      enabled: body.enabled !== false,
      severity: enumIn<AlertSeverity>(body.severity, ["info", "warning", "critical"], "warning"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.alertRules.insert(rule);
    return json({ rule }, 201);
  });
}
