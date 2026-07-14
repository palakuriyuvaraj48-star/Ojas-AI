/**
 * Feedback AI engine (Feature 133).
 * A deterministic, explainable classifier that auto-categorizes feedback,
 * assigns priority/severity/sentiment, detects duplicates, and suggests
 * responses + assignees. In production the same interface would front an LLM;
 * the heuristic implementation is fully deterministic and offline-safe.
 */
import type {
  FeedbackItem, FeedbackCategory, FeedbackPriority, FeedbackSeverity,
  Sentiment, FeedbackAssignee, FeedbackType,
} from "./types";

const KEYWORDS: Record<FeedbackCategory, string[]> = {
  bug: ["broken", "crash", "error", "bug", "fails", "not working", "glitch", "freeze", "stuck"],
  performance: ["slow", "lag", "latency", "freezes", "performance", "hangs", "loading", "spinning"],
  feature_request: ["feature", "add", "suggest", "would be nice", "please add", "wish", "ability to", "option to"],
  payment: ["payment", "charge", "billing", "invoice", "refund", "subscription", "price", "card", "pay"],
  workout: ["workout", "exercise", "reps", "sets", "gym", "training", "lift", "routine"],
  nutrition: ["meal", "food", "calorie", "diet", "recipe", "nutrition", "protein", "water", "eat"],
  coach: ["coach", "trainer", "advice", "guidance", "ai coach", "recommendation"],
  subscription: ["plan", "upgrade", "downgrade", "cancel", "renew", "trial", "elite", "pro"],
  ui: ["ui", "design", "layout", "button", "screen", "dark mode", "theme", "interface", "ux"],
  other: [],
};

const NEGATIVE = ["hate", "terrible", "awful", "broken", "worst", "angry", "frustrated", "useless", "disappointed", "bad", "annoying"];
const POSITIVE = ["love", "great", "amazing", "awesome", "excellent", "best", "thanks", "thank you", "helpful", "fantastic", "perfect"];

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

export interface Classification {
  category: FeedbackCategory;
  priority: FeedbackPriority;
  severity: FeedbackSeverity;
  sentiment: Sentiment;
  assignee: FeedbackAssignee;
  aiSummary: string;
  suggestedResponse: string;
}

export function classifyFeedback(input: { type: FeedbackType; subject: string; description: string }): Classification {
  const text = `${input.subject} ${input.description}`.toLowerCase();
  const tokens = tokenize(text);

  let category: FeedbackCategory = "other";
  let bestScore = 0;
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const score = words.reduce((s, w) => s + (tokens.includes(w) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; category = cat as FeedbackCategory; }
  }
  if (input.type === "bug" || input.type === "crash") category = "bug";
  if (input.type === "feature" || input.type === "suggestion") category = category === "other" ? "feature_request" : category;

  const neg = NEGATIVE.filter((w) => tokens.includes(w)).length;
  const pos = POSITIVE.filter((w) => tokens.includes(w)).length;
  const sentiment: Sentiment = pos > neg ? "positive" : neg > pos ? "negative" : "neutral";

  let priority: FeedbackPriority = "medium";
  let severity: FeedbackSeverity = "minor";
  if (category === "bug" || category === "payment") { priority = "high"; severity = "major"; }
  if (input.type === "crash") { priority = "urgent"; severity = "critical"; }
  if (input.type === "rating" || input.type === "review") priority = "low";
  if (sentiment === "negative") { if (priority === "low") priority = "medium"; }
  if (text.includes("urgent") || text.includes("asap") || text.includes("critical")) { priority = "urgent"; severity = "critical"; }

  const assignee: FeedbackAssignee =
    category === "bug" || category === "performance" ? "developer"
      : category === "payment" || category === "subscription" ? "support"
        : category === "coach" ? "coach"
          : category === "ui" || input.type === "complaint" ? "moderator"
            : "support";

  const aiSummary = buildSummary(input.subject, input.description, category, sentiment);
  const suggestedResponse = buildResponse(category, sentiment, input.subject);

  return { category, priority, severity, sentiment, assignee, aiSummary, suggestedResponse };
}

function buildSummary(subject: string, description: string, category: FeedbackCategory, sentiment: Sentiment): string {
  const snippet = description.trim().split(/\s+/).slice(0, 18).join(" ");
  return `[${category.replace("_", " ")} · ${sentiment}] ${subject}. ${snippet}${description.length > snippet.length ? "…" : ""}`;
}

function buildResponse(category: FeedbackCategory, sentiment: Sentiment, subject: string): string {
  const greet = sentiment === "negative" ? "We're sorry to hear about this issue" : "Thank you for reaching out";
  const body: Record<FeedbackCategory, string> = {
    bug: "Our engineering team is investigating and will prioritize a fix. We'll notify you once resolved.",
    performance: "Thanks for the detail — we're profiling this and will ship a performance improvement soon.",
    feature_request: "We've logged your idea with our product team for roadmap consideration.",
    payment: "A billing specialist will review your account and follow up within 24 hours.",
    workout: "Your training feedback has been shared with the coaching team.",
    nutrition: "Thanks! Our nutrition team will use this to improve meal planning.",
    coach: "Your coach has been notified and will respond with tailored guidance.",
    subscription: "Our support team will help with your plan right away.",
    ui: "We've passed this UX note to our design team.",
    other: "We've received your message and assigned it to the right team.",
  };
  return `${greet} regarding "${subject}". ${body[category]}`;
}

export function detectDuplicate(item: Pick<FeedbackItem, "subject" | "description">, existing: FeedbackItem[]): string | null {
  const aTokens = new Set(tokenize(`${item.subject} ${item.description}`));
  if (aTokens.size === 0) return null;
  let bestId: string | null = null;
  let bestScore = 0.55; // Jaccard threshold
  for (const e of existing) {
    if (e.status === "duplicate") continue;
    const bTokens = tokenize(`${e.subject} ${e.description}`);
    if (bTokens.length === 0) continue;
    const intersection = [...aTokens].filter((t) => bTokens.includes(t)).length;
    const union = new Set([...aTokens, ...bTokens]).size;
    const jaccard = intersection / union;
    if (jaccard > bestScore) { bestScore = jaccard; bestId = e.id; }
  }
  return bestId;
}

export interface FeedbackAnalytics {
  total: number;
  byCategory: Record<FeedbackCategory, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySentiment: Record<Sentiment, number>;
  avgResponseTimeHrs: number;
  avgResolutionTimeHrs: number;
  satisfactionScore: number;
  topRequested: { category: FeedbackCategory; count: number }[];
  trends: { date: string; count: number }[];
}

export function computeFeedbackAnalytics(items: FeedbackItem[]): FeedbackAnalytics {
  const byCategory = {} as Record<FeedbackCategory, number>;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const bySentiment: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  const requested: Record<string, number> = {};

  for (const it of items) {
    byCategory[it.category] = (byCategory[it.category] ?? 0) + 1;
    byStatus[it.status] = (byStatus[it.status] ?? 0) + 1;
    byPriority[it.priority] = (byPriority[it.priority] ?? 0) + 1;
    bySentiment[it.sentiment] = (bySentiment[it.sentiment] ?? 0) + 1;
    if (it.category === "feature_request" || it.type === "feature" || it.type === "suggestion") {
      requested[it.category] = (requested[it.category] ?? 0) + 1;
    }
  }

  const resolutionTimes: number[] = [];
  let satisfactionSum = 0;
  let satisfactionCount = 0;
  for (const it of items) {
    if (it.rating) { satisfactionSum += it.rating; satisfactionCount++; }
    if (it.resolvedAt) {
      const created = new Date(it.createdAt).getTime();
      const resolved = new Date(it.resolvedAt).getTime();
      resolutionTimes.push((resolved - created) / 3_600_000);
    }
  }
  const satisfactionScore = satisfactionCount ? Number((satisfactionSum / satisfactionCount).toFixed(2)) : 0;

  const trendsMap = new Map<string, number>();
  for (const it of items) {
    const d = it.createdAt.slice(0, 10);
    trendsMap.set(d, (trendsMap.get(d) ?? 0) + 1);
  }
  const trends = [...trendsMap.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    total: items.length,
    byCategory,
    byStatus,
    byPriority,
    bySentiment,
    avgResponseTimeHrs: 0,
    avgResolutionTimeHrs: resolutionTimes.length ? Number((resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)) : 0,
    satisfactionScore,
    topRequested: Object.entries(requested).map(([category, count]) => ({ category: category as FeedbackCategory, count })).sort((a, b) => b.count - a.count),
    trends,
  };
}
