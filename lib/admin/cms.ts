/**
 * Content Management engine (Feature 134).
 * Handles content versioning, approval-workflow state transitions, slug/SEO
 * helpers, and deterministic AI-assisted summarization + SEO suggestions.
 */
import type { ContentItem, ContentStatus, ContentKind } from "./types";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const STATUS_FLOW: Record<ContentStatus, ContentStatus[]> = {
  draft: ["review", "archived"],
  review: ["approved", "draft", "rejected" as unknown as ContentStatus].filter(Boolean) as ContentStatus[],
  approved: ["published", "review", "archived"],
  published: ["archived", "review"],
  archived: ["draft"],
};

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  if (from === to) return true;
  return STATUS_FLOW[from]?.includes(to) ?? false;
}

export function snapshotVersion(item: ContentItem, changedBy: string, note?: string) {
  return {
    version: item.version,
    body: item.body,
    excerpt: item.excerpt,
    changedBy,
    changedAt: new Date().toISOString(),
    note,
  };
}

function sentences(text: string): string[] {
  return text
    .replace(/[#*>`_]/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

/** Extractive summary: pick the 2 most keyword-dense sentences. */
export function generateAiSummary(body: string, maxSentences = 2): string {
  const opts = sentences(body);
  if (opts.length === 0) return body.slice(0, 160);
  const wordFreq = new Map<string, number>();
  const words = body.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  for (const w of words) wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1);
  const scored = opts
    .map((s) => ({ s, score: (s.toLowerCase().match(/[a-z]{4,}/g) ?? []).reduce((acc, w) => acc + (wordFreq.get(w) ?? 0), 0) }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, maxSentences).map((x) => x.s).join(" ");
}

export function generateAiSeo(title: string, body: string) {
  const summary = generateAiSummary(body, 1);
  const metaTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const metaDescription = summary.slice(0, 155);
  return {
    metaTitle,
    metaDescription,
    slug: slugify(title),
    openGraph: { title, description: metaDescription },
  };
}

export function validateSeo(item: ContentItem): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (!item.seo.metaTitle) warnings.push("Meta title is missing");
  else if (item.seo.metaTitle.length > 60) warnings.push("Meta title exceeds 60 characters");
  if (!item.seo.metaDescription) warnings.push("Meta description is missing");
  else if (item.seo.metaDescription.length > 160) warnings.push("Meta description exceeds 160 characters");
  if (!item.seo.slug) warnings.push("Slug is missing");
  if (item.status === "published" && !item.body.trim()) warnings.push("Published content cannot be empty");
  return { valid: warnings.length === 0, warnings };
}

export const CONTENT_KINDS: { kind: ContentKind; label: string }[] = [
  { kind: "exercise", label: "Exercise" },
  { kind: "workout_program", label: "Workout Program" },
  { kind: "workout_plan", label: "Workout Plan" },
  { kind: "video", label: "Video" },
  { kind: "recipe", label: "Recipe" },
  { kind: "nutrition_plan", label: "Nutrition Plan" },
  { kind: "article", label: "Article" },
  { kind: "challenge", label: "Challenge" },
  { kind: "badge", label: "Badge" },
  { kind: "achievement", label: "Achievement" },
  { kind: "course", label: "Course" },
  { kind: "guide", label: "Guide" },
  { kind: "faq", label: "FAQ" },
  { kind: "translation", label: "Translation" },
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  review: "In Review",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};
