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
  return withAudit(req, "content:write", { action: "schedule_publish", module: "content", resource: "content", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<{ at?: string }>(req);
    const existing = await db.content.get(id);
    if (!existing) throw new HttpError(404, "Content not found");
    const at = body.at ? str(body.at) : undefined;
    if (!at) throw new HttpError(400, "Schedule time (at) is required");
    const patch: Record<string, unknown> = {
      scheduledPublishAt: at,
      status: existing.status === "draft" ? "approved" : existing.status,
      updatedAt: new Date().toISOString(),
    };
    const updated = await db.content.update(id, patch as any);
    return json({ item: updated });
  });
}
