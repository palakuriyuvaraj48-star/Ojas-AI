import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission, json } from "@/lib/admin/api";
import { rateOf } from "@/lib/admin/notifications";
import type { NotificationCampaign, NotificationChannel, NotificationStats } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function empty(): NotificationStats {
  return { recipientCount: 0, queued: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, failed: 0 };
}

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const campaigns = await db.notificationCampaigns.list();
    const totals = campaigns.reduce((acc, c) => {
      (Object.keys(acc) as (keyof NotificationStats)[]).forEach((k) => { acc[k] += (c.stats[k] ?? 0); });
      return acc;
    }, empty());

    const byChannel: Record<string, NotificationStats> = {};
    for (const c of campaigns) {
      const ch = c.channel as NotificationChannel;
      byChannel[ch] = byChannel[ch] ?? empty();
      (Object.keys(byChannel[ch]) as (keyof NotificationStats)[]).forEach((k) => { byChannel[ch][k] += (c.stats[k] ?? 0); });
    }

    const sentCampaigns = campaigns.filter((c) => c.status === "sent").length;
    const analytics = {
      totals,
      byChannel,
      deliveryRate: rateOf(totals.delivered, totals.sent),
      openRate: rateOf(totals.opened, totals.delivered),
      clickRate: rateOf(totals.clicked, totals.delivered),
      conversionRate: rateOf(totals.converted, totals.delivered),
      unsubscribeRate: rateOf(totals.unsubscribed, totals.sent),
      bounceRate: rateOf(totals.bounced, totals.sent),
      totalCampaigns: campaigns.length,
      sentCampaigns,
      scheduledCampaigns: campaigns.filter((c) => c.status === "scheduled").length,
    };
    return json(analytics);
  });
}
