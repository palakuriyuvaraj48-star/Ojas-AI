import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { slugify, generateAiSummary, generateAiSeo, canTransition } from "@/lib/admin/cms";
import type { ContentItem, ContentKind, ContentStatus, ContentSeo } from "@/lib/admin/types";

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

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "content:read");
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get("kind");
    const status = searchParams.get("status");
    const locale = searchParams.get("locale");
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    let items = await db.content.list();
    if (kind) items = items.filter((i) => i.kind === kind);
    if (status) items = items.filter((i) => i.status === status);
    if (locale) items = items.filter((i) => i.locale === locale);
    if (search) items = items.filter((i) => i.title.toLowerCase().includes(search) || i.body.toLowerCase().includes(search));
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return json({ items, total: items.length });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "content:write", { action: "create_content", module: "content", resource: "content" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const title = str(body.title).trim();
    if (!title) throw new HttpError(400, "Title is required");
    const kind = enumIn<ContentKind>(body.kind, ["exercise", "workout_program", "workout_plan", "video", "recipe", "nutrition_plan", "article", "challenge", "badge", "achievement", "course", "guide", "faq", "translation"], "article");
    const seo = parseSeo(body);
    const slug = seo.slug || slugify(title);
    const item: ContentItem = {
      id: `cnt_${randomToken(10)}`,
      kind,
      title,
      slug,
      body: str(body.body),
      excerpt: body.excerpt ? str(body.excerpt) : generateAiSummary(str(body.body)),
      locale: enumIn<any>(body.locale, ["en", "es", "fr", "de", "hi", "ja"], "en"),
      status: enumIn<ContentStatus>(body.status, ["draft", "review", "approved", "published", "archived"], "draft"),
      categories: arr<string>(body.categories),
      tags: arr<string>(body.tags),
      seo: { ...seo, slug },
      media: arr<any>(body.media).map((m) => ({ id: m.id ?? `med_${randomToken(6)}`, type: m.type, url: str(m.url), thumbnailUrl: m.thumbnailUrl, optimized: !!m.optimized, width: m.width, height: m.height, size: Number(m.size ?? 0) })),
      version: 1,
      versions: [],
      parentId: body.parentId ? str(body.parentId) : null,
      translations: (body.translations as Record<string, { title: string; body: string }>) ?? {},
      author: session.email,
      aiSummary: body.aiSummary ? str(body.aiSummary) : undefined,
      aiSeoSuggestions: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: body.status === "published" ? new Date().toISOString() : undefined,
    };
    await db.content.insert(item);
    return json({ item }, 201);
  });
}
