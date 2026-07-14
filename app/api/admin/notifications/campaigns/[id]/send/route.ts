import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { expandAudience, simulateDispatch, renderTemplate } from "@/lib/admin/notifications";
import type { NotificationCampaign, NotificationLog } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LOGS_STORED = 1000;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:send", { action: "send_campaign", module: "notifications", resource: "campaign", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const campaign = await db.notificationCampaigns.get(id);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (campaign.status === "sending") throw new HttpError(409, "Campaign is already sending");

    const recipients = expandAudience(campaign.audience, 5000);
    const { logs, stats } = simulateDispatch(campaign, recipients);
    const stored: NotificationLog[] = logs.slice(0, MAX_LOGS_STORED);
    for (const log of stored) await db.notificationLogs.insert(log);

    const updated = await db.notificationCampaigns.update(id, {
      status: "sent",
      sentAt: new Date().toISOString(),
      stats: { ...stats, recipientCount: recipients.length },
      updatedAt: new Date().toISOString(),
    });
    return json({ campaign: updated, dispatched: recipients.length, storedLogs: stored.length });
  });
}
