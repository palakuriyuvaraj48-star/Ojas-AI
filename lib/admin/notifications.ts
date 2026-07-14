/**
 * Notification engine (Feature 132).
 * Provides audience expansion (segments → recipients), variable personalization,
 * delivery simulation (with realistic status distribution), and analytics
 * aggregation. In production the dispatch would call real email/push/SMS
 * providers; here the simulation is deterministic and fully observable.
 */
import crypto from "crypto";
import type {
  AudienceSegment, AudienceTarget, NotificationCampaign, NotificationLog,
  NotificationStats, NotificationTemplateLocale, NotificationChannel,
} from "./types";

export const SEGMENT_SIZES: Record<AudienceSegment, number> = {
  all: 482_300,
  premium: 96_400,
  free: 385_900,
  coaches: 1_240,
  admins: 38,
  inactive: 152_000,
  active: 330_300,
  new: 8_900,
  returning: 64_500,
  workout_streak: 41_200,
  challenge_participants: 27_800,
};

const FIRST = ["Aria", "Marcus", "Priya", "Sam", "Lena", "Noah", "Mia", "Kai", "Zoe", "Leo", "Ivy", "Ravi", "Sara", "Tom"];
const LOCALES: NotificationTemplateLocale[] = ["en", "es", "fr", "de", "hi", "ja"];

function hashInt(seed: string): number {
  return parseInt(crypto.createHash("sha256").update(seed).digest("hex").slice(0, 8), 16);
}

export function estimateRecipients(audience: AudienceTarget): number {
  const explicit = audience.includeUserIds.length;
  let seg = 0;
  if (audience.segments.length === 0) seg = 0;
  else if (audience.segments.includes("all")) seg = SEGMENT_SIZES.all;
  else seg = audience.segments.reduce((s, seg) => s + (SEGMENT_SIZES[seg] ?? 0), 0);
  if (audience.segments.includes("all")) seg = SEGMENT_SIZES.all;
  // de-dupe overlapping segments crudely
  const total = Math.max(explicit, seg) - audience.excludeUserIds.length;
  return Math.max(0, Math.min(total, audience.limit ?? total));
}

export interface Recipient {
  userId: string;
  name: string;
  locale: NotificationTemplateLocale;
}

export function expandAudience(audience: AudienceTarget, max = 500): Recipient[] {
  const count = Math.min(estimateRecipients(audience), max);
  const recipients: Recipient[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `recipient::${audience.segments.join(",")}::${i}`;
    const h = hashInt(seed);
    const name = FIRST[h % FIRST.length];
    const locale = LOCALES[(h >> 3) % LOCALES.length];
    recipients.push({ userId: `usr_${(h % 1_000_000).toString(36)}_${i}`, name, locale });
  }
  return recipients;
}

const DEFAULT_VARS: Record<string, string> = {
  user_name: "Athlete",
  goal: "lean-bulk",
  plan: "Elite",
  challenge: "Core 30",
  progress: "62",
  milestone: "100 workouts",
  water_gap: "0.6",
  readiness: "Optimal",
  message: "Service maintenance scheduled.",
  date: "Aug 1, 2026",
};

export function renderTemplate(text: string, personalization: Record<string, string> = {}): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    personalization[key] ?? DEFAULT_VARS[key] ?? `{{${key}}}`,
  );
}

export function channelLabel(channel: NotificationChannel): string {
  return channel.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Simulate delivery of a campaign, returning logs and aggregated stats. */
export function simulateDispatch(
  campaign: NotificationCampaign,
  recipients: Recipient[],
): { logs: NotificationLog[]; stats: NotificationStats } {
  const logs: NotificationLog[] = [];
  const stats: NotificationStats = {
    recipientCount: recipients.length, queued: recipients.length,
    sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0,
    unsubscribed: 0, bounced: 0, failed: 0,
  };
  const nowIso = new Date().toISOString();
  for (const r of recipients) {
    const h = hashInt(`${campaign.id}:${r.userId}`);
    const failed = h % 50 === 0;
    const bounced = !failed && h % 73 === 0;
    const delivered = !failed && !bounced;
    const opened = delivered && h % 3 !== 0;
    const clicked = opened && h % 5 === 0;
    const converted = clicked && h % 11 === 0;
    const unsub = delivered && h % 97 === 0;

    const status: NotificationLog["status"] = failed
      ? "failed"
      : bounced
        ? "bounced"
        : unsub
          ? "unsubscribed"
          : converted
            ? "clicked"
            : clicked
              ? "clicked"
              : opened
                ? "opened"
                : delivered
                  ? "delivered"
                  : "sent";

    if (failed) stats.failed++;
    if (bounced) stats.bounced++;
    if (delivered) stats.delivered++;
    if (opened) stats.opened++;
    if (clicked) stats.clicked++;
    if (converted) stats.converted++;
    if (unsub) stats.unsubscribed++;
    if (delivered || failed || bounced) stats.sent++;

    logs.push({
      id: `log_${crypto.randomBytes(6).toString("hex")}`,
      campaignId: campaign.id,
      campaignName: campaign.name,
      userId: r.userId,
      channel: campaign.channel,
      status,
      attempts: failed ? 1 : 1,
      scheduledAt: campaign.schedule.sendAt ?? nowIso,
      sentAt: delivered || failed || bounced ? nowIso : undefined,
      lastError: failed ? "Provider 503 (simulated)" : bounced ? "Invalid address (simulated)" : undefined,
      locale: r.locale,
      title: renderTemplate(campaign.title, { user_name: r.name, ...campaign.personalization }),
      body: renderTemplate(campaign.body, { user_name: r.name, ...campaign.personalization }),
      openedAt: opened ? nowIso : undefined,
      clickedAt: clicked ? nowIso : undefined,
    });
  }
  return { logs, stats };
}

export function aggregateStats(logs: NotificationLog[]): NotificationStats {
  const stats: NotificationStats = {
    recipientCount: logs.length, queued: logs.filter((l) => l.status === "queued").length,
    sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, unsubscribed: 0, bounced: 0, failed: 0,
  };
  for (const l of logs) {
    if (["sent", "delivered", "opened", "clicked", "unsubscribed", "bounced"].includes(l.status)) stats.sent++;
    if (l.status === "delivered") stats.delivered++;
    if (l.status === "opened" || l.status === "clicked") stats.opened++;
    if (l.status === "clicked") stats.clicked++;
    if (l.status === "unsubscribed") stats.unsubscribed++;
    if (l.status === "bounced") stats.bounced++;
    if (l.status === "failed") stats.failed++;
  }
  stats.converted = stats.clicked; // conversion approximated by click-through
  return stats;
}

export function rateOf(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}
