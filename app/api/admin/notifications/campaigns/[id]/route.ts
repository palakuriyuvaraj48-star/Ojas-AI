import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { estimateRecipients } from "@/lib/admin/notifications";
import type { NotificationCampaign, CampaignStatus, NotificationChannel } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAudience(body: Record<string, unknown>): NotificationCampaign["audience"] {
  const a = (body.audience ?? {}) as Record<string, unknown>;
  return {
    segments: arr<any>(a.segments),
    includeUserIds: arr<string>(a.includeUserIds),
    excludeUserIds: arr<string>(a.excludeUserIds),
    minStreak: typeof a.minStreak === "number" ? a.minStreak : undefined,
    limit: typeof a.limit === "number" ? a.limit : undefined,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const { id } = await params;
    const campaign = await db.notificationCampaigns.get(id);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    return json({ campaign });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:write", { action: "update_campaign", module: "notifications", resource: "campaign", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.notificationCampaigns.get(id);
    if (!existing) throw new HttpError(404, "Campaign not found");
    const patch: Partial<NotificationCampaign> = { updatedAt: new Date().toISOString() };
    if (body.name) patch.name = str(body.name);
    if (body.channel) patch.channel = enumIn<NotificationChannel>(body.channel, ["email", "push", "sms", "in_app", "desktop"], existing.channel);
    if (body.templateId) patch.templateId = str(body.templateId);
    if (body.audience) { patch.audience = parseAudience(body); patch.stats = { ...existing.stats, recipientCount: estimateRecipients(patch.audience) }; }
    if (body.scheduleType) patch.schedule = { ...existing.schedule, type: enumIn<any>(body.scheduleType, ["immediate", "scheduled", "recurring"], existing.schedule.type), sendAt: body.sendAt ? str(body.sendAt) : existing.schedule.sendAt, recurring: body.recurring ? (body.recurring as any) : existing.schedule.recurring };
    if (body.personalization) patch.personalization = body.personalization as Record<string, string>;
    if (body.title !== undefined) patch.title = str(body.title);
    if (body.body !== undefined) patch.body = str(body.body);
    if (body.subject !== undefined) patch.subject = str(body.subject);
    if (body.status) patch.status = enumIn<CampaignStatus>(body.status, ["draft", "scheduled", "sending", "sent", "paused", "failed"], existing.status);
    const updated = await db.notificationCampaigns.update(id, patch);
    return json({ campaign: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:delete", { action: "delete_campaign", module: "notifications", resource: "campaign", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.notificationCampaigns.remove(id);
    if (!ok) throw new HttpError(404, "Campaign not found");
    return json({ success: true });
  });
}
