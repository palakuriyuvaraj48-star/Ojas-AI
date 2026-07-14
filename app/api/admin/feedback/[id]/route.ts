import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { FeedbackItem, FeedbackStatus, FeedbackAssignee } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "feedback:read");
    const { id } = await params;
    const item = await db.feedback.get(id);
    if (!item) throw new HttpError(404, "Feedback not found");
    return json({ item });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "feedback:write", { action: "update_feedback", module: "feedback", resource: "feedback", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.feedback.get(id);
    if (!existing) throw new HttpError(404, "Feedback not found");
    const patch: Partial<FeedbackItem> = { updatedAt: new Date().toISOString() };
    if (body.subject) patch.subject = str(body.subject);
    if (body.description) patch.description = str(body.description);
    if (body.category) patch.category = enumIn<any>(body.category, ["bug", "performance", "feature_request", "payment", "workout", "nutrition", "coach", "subscription", "ui", "other"], existing.category);
    if (body.priority) patch.priority = enumIn<any>(body.priority, ["low", "medium", "high", "urgent"], existing.priority);
    if (body.severity) patch.severity = enumIn<any>(body.severity, ["trivial", "minor", "major", "critical"], existing.severity);
    if (body.sentiment) patch.sentiment = enumIn<any>(body.sentiment, ["positive", "neutral", "negative"], existing.sentiment);
    if (body.status) patch.status = enumIn<FeedbackStatus>(body.status, ["open", "in_progress", "pending", "resolved", "closed", "rejected", "duplicate"], existing.status);
    if (body.assignee) patch.assignee = enumIn<FeedbackAssignee>(body.assignee, ["support", "developer", "coach", "moderator", "unassigned"], existing.assignee);
    if (body.tags) patch.tags = arr<string>(body.tags);
    if (body.responseText !== undefined) patch.responseText = str(body.responseText);
    const updated = await db.feedback.update(id, patch);
    return json({ item: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "feedback:delete", { action: "delete_feedback", module: "feedback", resource: "feedback", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.feedback.remove(id);
    if (!ok) throw new HttpError(404, "Feedback not found");
    return json({ success: true });
  });
}
