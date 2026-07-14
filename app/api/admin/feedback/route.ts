import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { classifyFeedback, detectDuplicate } from "@/lib/admin/feedback";
import type {
  FeedbackItem, FeedbackType, FeedbackStatus, FeedbackAssignee, FeedbackAttachment,
} from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "feedback:read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const sentiment = searchParams.get("sentiment");
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "20"));

    let items = await db.feedback.list();
    if (status) items = items.filter((i) => i.status === status);
    if (category) items = items.filter((i) => i.category === category);
    if (priority) items = items.filter((i) => i.priority === priority);
    if (sentiment) items = items.filter((i) => i.sentiment === sentiment);
    if (search) items = items.filter((i) => i.subject.toLowerCase().includes(search) || i.description.toLowerCase().includes(search));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return json({ items: items.slice(start, start + pageSize), total: items.length, page, pageSize });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "feedback:write", { action: "submit_feedback", module: "feedback", resource: "feedback" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const type = enumIn<FeedbackType>(body.type, ["bug", "feature", "rating", "review", "ticket", "suggestion", "complaint", "crash"], "bug");
    const subject = str(body.subject).trim();
    const description = str(body.description).trim();
    if (!subject) throw new HttpError(400, "Subject is required");

    const classification = classifyFeedback({ type, subject, description });
    const existing = await db.feedback.list();
    const duplicateOf = detectDuplicate({ subject, description }, existing);

    const attachments: FeedbackAttachment[] = arr<any>(body.attachments).map((a) => ({
      id: a.id ?? `att_${randomToken(6)}`,
      name: str(a.name),
      kind: enumIn<any>(a.kind, ["screenshot", "file", "log", "voice"], "file"),
      url: a.url,
      size: Number(a.size ?? 0),
      mime: a.mime,
    }));

    const item: FeedbackItem = {
      id: `fb_${randomToken(10)}`,
      type,
      subject,
      description,
      category: classification.category,
      priority: classification.priority,
      severity: classification.severity,
      sentiment: classification.sentiment,
      status: duplicateOf ? "duplicate" : "open",
      assignee: classification.assignee,
      submitterName: body.submitterName ? str(body.submitterName) : undefined,
      submitterEmail: body.submitterEmail ? str(body.submitterEmail) : undefined,
      rating: typeof body.rating === "number" ? body.rating : undefined,
      aiSummary: classification.aiSummary,
      suggestedResponse: classification.suggestedResponse,
      duplicateOf,
      tags: arr<string>(body.tags),
      attachments,
      device: body.device ? str(body.device) : undefined,
      appVersion: body.appVersion ? str(body.appVersion) : undefined,
      platform: body.platform ? (body.platform as any) : undefined,
      os: body.os ? str(body.os) : undefined,
      locale: body.locale ? enumIn<any>(body.locale, ["en", "es", "fr", "de", "hi", "ja"], "en") : "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.feedback.insert(item);
    return json({ item }, 201);
  });
}
