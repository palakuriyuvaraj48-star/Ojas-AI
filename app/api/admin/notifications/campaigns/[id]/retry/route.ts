import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { NotificationLog } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:send", { action: "retry_failed", module: "notifications", resource: "campaign", resourceId: id }, async () => {
    assertSafeMutation(req);
    const campaign = await db.notificationCampaigns.get(id);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    const logs = await db.notificationLogs.list();
    const failed = logs.filter((l) => l.campaignId === id && (l.status === "failed" || l.status === "bounced"));
    let retried = 0;
    for (const log of failed) {
      const success = Math.random() > 0.3;
      await db.notificationLogs.update(log.id, {
        status: success ? "delivered" : "failed",
        attempts: log.attempts + 1,
        sentAt: success ? new Date().toISOString() : log.sentAt,
        lastError: success ? undefined : "Retry failed (simulated)",
      });
      if (success) retried++;
    }
    // Refresh campaign stats
    const allLogs = (await db.notificationLogs.list()).filter((l) => l.campaignId === id);
    const stats = { ...campaign.stats };
    stats.failed = allLogs.filter((l) => l.status === "failed").length;
    stats.bounced = allLogs.filter((l) => l.status === "bounced").length;
    stats.delivered = allLogs.filter((l) => l.status === "delivered").length;
    stats.sent = allLogs.filter((l) => ["sent", "delivered", "opened", "clicked", "unsubscribed", "bounced"].includes(l.status)).length;
    await db.notificationCampaigns.update(id, { stats, updatedAt: new Date().toISOString() });
    return json({ retried, remainingFailed: stats.failed });
  });
}
