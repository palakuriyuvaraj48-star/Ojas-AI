import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { slugify, generateAiSummary, snapshotVersion } from "@/lib/admin/cms";
import { randomToken } from "@/lib/admin/crypto";
import type { ContentItem, ContentStatus, ContentSeo } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseSeo(body: Record<string, unknown>): ContentSeo {
  const s = (body.seo ?? {}) as Record<string, unknown>;
  const og = (s.openGraph ?? {}) as Record<string, unknown>;
  return {
    metaTitle: str(s.metaTitle),
    metaDescription: str(s.metaDescription),
    slug: str(s.slug),
    openGraph: { title: str(og.title), description: str(og.description), image: str(og.image) },
    structuredData: (s.structuredData as Record<string, unknown>) ?? undefined,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "content:read");
    const { id } = await params;
    const item = await db.content.get(id);
    if (!item) throw new HttpError(404, "Content not found");
    return json({ item });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "content:write", { action: "update_content", module: "content", resource: "content", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.content.get(id);
    if (!existing) throw new HttpError(404, "Content not found");
    const patch: Partial<ContentItem> = { updatedAt: new Date().toISOString() };
    if (body.title) patch.title = str(body.title);
    if (body.body !== undefined) patch.body = str(body.body);
    if (body.excerpt !== undefined) patch.excerpt = str(body.excerpt);
    if (body.locale) patch.locale = enumIn<any>(body.locale, ["en", "es", "fr", "de", "hi", "ja"], existing.locale);
    if (body.categories) patch.categories = arr<string>(body.categories);
    if (body.tags) patch.tags = arr<string>(body.tags);
    if (body.translations) patch.translations = body.translations as Record<string, { title: string; body: string }>;
    if (body.media) patch.media = arr<any>(body.media).map((m) => ({ id: m.id ?? `med_${randomToken(6)}`, type: m.type, url: str(m.url), thumbnailUrl: m.thumbnailUrl, optimized: !!m.optimized, width: m.width, height: m.height, size: Number(m.size ?? 0) }));
    if (body.parentId !== undefined) patch.parentId = body.parentId ? str(body.parentId) : null;
    if (body.seo || body.slug) {
      const seo = parseSeo(body);
      patch.seo = { ...existing.seo, ...seo, slug: seo.slug || existing.seo.slug || slugify(patch.title ?? existing.title) };
    }
    const updated = await db.content.update(id, (prev) => ({
      ...prev,
      ...patch,
      version: prev.version + 1,
      versions: [...prev.versions, snapshotVersion(prev, session.email, "Content updated")],
    }));
    return json({ item: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "content:delete", { action: "delete_content", module: "content", resource: "content", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.content.remove(id);
    if (!ok) throw new HttpError(404, "Content not found");
    return json({ success: true });
  });
}
