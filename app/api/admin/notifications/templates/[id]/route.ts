import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { NotificationTemplate, NotificationChannel, NotificationCategory, NotificationTemplateLocale } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const { id } = await params;
    const template = await db.notificationTemplates.get(id);
    if (!template) throw new HttpError(404, "Template not found");
    return json({ template });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:write", { action: "update_template", module: "notifications", resource: "template", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.notificationTemplates.get(id);
    if (!existing) throw new HttpError(404, "Template not found");
    const patch: Partial<NotificationTemplate> = { updatedAt: new Date().toISOString() };
    if (body.key) patch.key = str(body.key);
    if (body.name) patch.name = str(body.name);
    if (body.channel) patch.channel = enumIn<NotificationChannel>(body.channel, ["email", "push", "sms", "in_app", "desktop"], existing.channel);
    if (body.category) patch.category = enumIn<NotificationCategory>(body.category, ["workout_reminder", "meal_reminder", "hydration_reminder", "sleep_reminder", "recovery_reminder", "challenge_reminder", "promotion", "subscription", "renewal", "milestone", "announcement", "emergency"], existing.category);
    if (body.locale) patch.locale = enumIn<NotificationTemplateLocale>(body.locale, ["en", "es", "fr", "de", "hi", "ja"], existing.locale);
    if (body.title !== undefined) patch.title = str(body.title);
    if (body.body !== undefined) patch.body = str(body.body);
    if (body.subject !== undefined) patch.subject = str(body.subject);
    if (body.variables) patch.variables = arr<string>(body.variables);
    const updated = await db.notificationTemplates.update(id, patch);
    return json({ template: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "notifications:delete", { action: "delete_template", module: "notifications", resource: "template", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.notificationTemplates.remove(id);
    if (!ok) throw new HttpError(404, "Template not found");
    return json({ success: true });
  });
}
