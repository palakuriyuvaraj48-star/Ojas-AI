import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, json, HttpError, requirePermission,
} from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "feedback:write", { action: "respond_feedback", module: "feedback", resource: "feedback", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<{ response: string }>(req);
    const response = str(body.response).trim();
    if (!response) throw new HttpError(400, "Response text is required");
    const existing = await db.feedback.get(id);
    if (!existing) throw new HttpError(404, "Feedback not found");
    const updated = await db.feedback.update(id, { responseText: response, status: "resolved", resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    return json({ item: updated });
  });
}
