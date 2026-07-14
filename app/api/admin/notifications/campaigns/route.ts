import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { estimateRecipients } from "@/lib/admin/notifications";
import type {
  NotificationCampaign, NotificationChannel, CampaignScheduleType, AudienceTarget, NotificationTemplateLocale,
} from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAudience(body: Record<string, unknown>): AudienceTarget {
  const a = (body.audience ?? {}) as Record<string, unknown>;
  return {
    segments: arr<any>(a.segments),
    includeUserIds: arr<string>(a.includeUserIds),
    excludeUserIds: arr<string>(a.excludeUserIds),
    minStreak: typeof a.minStreak === "number" ? a.minStreak : undefined,
    limit: typeof a.limit === "number" ? a.limit : undefined,
  };
}

function emptyStats() {
  return { recipientCount: 0, queued: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, failed: 0 };
}

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    let campaigns = await db.notificationCampaigns.list();
    if (status) campaigns = campaigns.filter((c) => c.status === status);
    if (channel) campaigns = campaigns.filter((c) => c.channel === channel);
    campaigns.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return json({ campaigns, total: campaigns.length });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "notifications:write", { action: "create_campaign", module: "notifications", resource: "campaign" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const name = str(body.name).trim();
    if (!name) throw new HttpError(400, "Campaign name is required");
    const channel = enumIn<NotificationChannel>(body.channel, ["email", "push", "sms", "in_app", "desktop"], "email");
    const templateId = str(body.templateId);
    const audience = parseAudience(body);
    const scheduleType = enumIn<CampaignScheduleType>(body.scheduleType, ["immediate", "scheduled", "recurring"], "immediate");
    const recipientCount = estimateRecipients(audience);

    const campaign: NotificationCampaign = {
      id: `cmp_${randomToken(10)}`,
      name,
      channel,
      templateId,
      audience,
      schedule: {
        type: scheduleType,
        sendAt: body.sendAt ? str(body.sendAt) : scheduleType === "immediate" ? new Date().toISOString() : undefined,
        recurring: body.recurring ? (body.recurring as any) : null,
        timezone: str(body.timezone, "UTC"),
      },
      status: scheduleType === "immediate" ? "draft" : scheduleType === "scheduled" ? "scheduled" : "scheduled",
      personalization: (body.personalization as Record<string, string>) ?? {},
      subject: body.subject ? str(body.subject) : undefined,
      title: str(body.title, name),
      body: str(body.body),
      stats: { ...emptyStats(), recipientCount },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.email,
    };
    await db.notificationCampaigns.insert(campaign);
    return json({ campaign }, 201);
  });
}
