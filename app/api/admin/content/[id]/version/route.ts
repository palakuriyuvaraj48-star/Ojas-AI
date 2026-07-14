import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, num, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { snapshotVersion } from "@/lib/admin/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "content:write", { action: "restore_version", module: "content", resource: "content", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<{ version: number; note?: string }>(req);
    const existing = await db.content.get(id);
    if (!existing) throw new HttpError(404, "Content not found");
    const target = existing.versions.find((v) => v.version === body.version);
    if (!target) throw new HttpError(404, "Version not found");
    const updated = await db.content.update(id, (prev) => ({
      ...prev,
      versions: [...prev.versions, snapshotVersion(prev, session.email, `Restored from v${body.version}`)],
      version: prev.version + 1,
      body: target.body,
      excerpt: target.excerpt ?? prev.excerpt,
      updatedAt: new Date().toISOString(),
    }));
    return json({ item: updated });
  });
}
