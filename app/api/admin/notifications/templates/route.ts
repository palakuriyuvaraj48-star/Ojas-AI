import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { NotificationTemplate, NotificationChannel, NotificationCategory, NotificationTemplateLocale } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "notifications:read");
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");
    const category = searchParams.get("category");
    const locale = searchParams.get("locale");
    let templates = await db.notificationTemplates.list();
    if (channel) templates = templates.filter((t) => t.channel === channel);
    if (category) templates = templates.filter((t) => t.category === category);
    if (locale) templates = templates.filter((t) => t.locale === locale);
    return json({ templates, total: templates.length });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "notifications:write", { action: "create_template", module: "notifications", resource: "template" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const key = str(body.key).trim();
    const name = str(body.name).trim();
    if (!key || !name) throw new HttpError(400, "Template key and name are required");
    const template: NotificationTemplate = {
      id: `tpl_${randomToken(8)}`,
      key,
      channel: enumIn<NotificationChannel>(body.channel, ["email", "push", "sms", "in_app", "desktop"], "email"),
      category: enumIn<NotificationCategory>(body.category, ["workout_reminder", "meal_reminder", "hydration_reminder", "sleep_reminder", "recovery_reminder", "challenge_reminder", "promotion", "subscription", "renewal", "milestone", "announcement", "emergency"], "announcement"),
      locale: enumIn<NotificationTemplateLocale>(body.locale, ["en", "es", "fr", "de", "hi", "ja"], "en"),
      name,
      subject: body.subject ? str(body.subject) : undefined,
      title: str(body.title),
      body: str(body.body),
      variables: arr<string>(body.variables),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.email,
    };
    await db.notificationTemplates.insert(template);
    return json({ template }, 201);
  });
}
