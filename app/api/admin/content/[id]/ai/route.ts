import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { generateAiSummary, generateAiSeo } from "@/lib/admin/cms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "content:write", { action: "ai_generate", module: "content", resource: "content", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<{ field?: "summary" | "seo" | "both" }>(req);
    const existing = await db.content.get(id);
    if (!existing) throw new HttpError(404, "Content not found");
    const field = body.field ?? "both";
    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (field === "summary" || field === "both") patch.aiSummary = generateAiSummary(existing.body);
    if (field === "seo" || field === "both") {
      const seo = generateAiSeo(existing.title, existing.body);
      patch.aiSeoSuggestions = {
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        slug: seo.slug,
        openGraph: seo.openGraph,
      };
    }
    const updated = await db.content.update(id, patch as any);
    return json({ item: updated });
  });
}
