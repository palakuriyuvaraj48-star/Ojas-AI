import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { canTransition } from "@/lib/admin/cms";
import { hasPermission } from "@/lib/admin/rbac";
import type { ContentStatus } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "content:write", { action: "transition_content", module: "content", resource: "content", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<{ status: ContentStatus; note?: string }>(req);
    const to = enumIn<ContentStatus>(body.status, ["draft", "review", "approved", "published", "archived"], "draft");
    const existing = await db.content.get(id);
    if (!existing) throw new HttpError(404, "Content not found");
    if (!canTransition(existing.status, to)) throw new HttpError(400, `Invalid transition: ${existing.status} → ${to}`);
    if (to === "published" && !hasPermission(session.role as any, "content:publish")) {
      throw new HttpError(403, "Missing permission: content:publish");
    }
    const patch: Record<string, unknown> = {
      status: to,
      updatedAt: new Date().toISOString(),
      publishedAt: to === "published" ? (existing.publishedAt ?? new Date().toISOString()) : existing.publishedAt,
      archivedAt: to === "archived" ? new Date().toISOString() : existing.archivedAt,
    };
    const updated = await db.content.update(id, patch as any);
    return json({ item: updated });
  });
}
