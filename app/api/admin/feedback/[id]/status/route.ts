import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { FeedbackStatus, FeedbackAssignee } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "feedback:write", { action: "transition_feedback", module: "feedback", resource: "feedback", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<{ status?: FeedbackStatus; assignee?: FeedbackAssignee; note?: string }>(req);
    const existing = await db.feedback.get(id);
    if (!existing) throw new HttpError(404, "Feedback not found");
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (body.status) patch.status = enumIn<FeedbackStatus>(body.status, ["open", "in_progress", "pending", "resolved", "closed", "rejected", "duplicate"], existing.status);
    if (body.assignee) patch.assignee = enumIn<FeedbackAssignee>(body.assignee, ["support", "developer", "coach", "moderator", "unassigned"], existing.assignee);
    if (body.status === "resolved" || body.status === "closed") patch.resolvedAt = new Date().toISOString();
    const updated = await db.feedback.update(id, patch as any);
    return json({ item: updated });
  });
}
