import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission, paginate, json } from "@/lib/admin/api";
import type { NotificationDeliveryStatus } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status") as NotificationDeliveryStatus | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(200, parseInt(searchParams.get("pageSize") || "50"));
    let logs = await db.notificationLogs.list();
    if (campaignId) logs = logs.filter((l) => l.campaignId === campaignId);
    if (status) logs = logs.filter((l) => l.status === status);
    logs.sort((a, b) => (b.sentAt ?? b.scheduledAt).localeCompare(a.sentAt ?? a.scheduledAt));
    const result = paginate(logs, page, pageSize);
    return json(result);
  });
}
