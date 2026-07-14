/**
 * Feature Flag engine (Feature 131).
 * Implements the evaluation logic used both by the admin UI preview and the
 * public evaluation endpoint: rollout strategies, percentage bucketing,
 * segmentation, kill switch, scheduled state, and A/B variant assignment.
 */
import crypto from "crypto";
import type {
  FeatureFlag, FlagEvaluationContext, FlagEvaluationResult, FlagVariant, Experiment,
} from "./types";

/** Deterministic 0–99 bucket for a (userId, key) pair (stable across calls). */
export function bucketFor(userId: string | undefined, key: string): number {
  const seed = `${userId ?? "anonymous"}::${key}`;
  const h = crypto.createHash("sha256").update(seed).digest("hex");
  const n = parseInt(h.slice(0, 8), 16);
  return n % 100;
}

function matchesTargeting(flag: FeatureFlag, ctx: FlagEvaluationContext): boolean {
  const t = flag.rollout.targeting;
  if (t.userIds.length && ctx.userId && t.userIds.includes(ctx.userId)) return true;
  if (t.adminsOnly && !ctx.isAdmin) return false;
  if (t.coachesOnly && !ctx.isCoach) return false;
  if (t.premiumOnly && !ctx.isPremium) return false;
  if (t.newUsersOnly && !ctx.isNewUser) return false;
  if (t.returningUsersOnly && !ctx.isReturningUser) return false;
  if (t.userGroups.length && (ctx.userGroups ?? []).some((g) => t.userGroups.includes(g))) return true;
  if (t.segments.length && (ctx.segments ?? []).some((s) => t.segments.includes(s))) return true;
  return false;
}

function matchesDimensions(flag: FeatureFlag, ctx: FlagEvaluationContext): boolean {
  const r = flag.rollout;
  if (r.regions.length && ctx.region && !r.regions.includes(ctx.region)) return false;
  if (r.countries.length && ctx.country && !r.countries.includes(ctx.country)) return false;
  if (r.states.length && ctx.state && !r.states.includes(ctx.state)) return false;
  if (r.languages.length && ctx.language && !r.languages.includes(ctx.language)) return false;
  if (r.platforms.length && ctx.platform && !r.platforms.includes(ctx.platform)) return false;
  if (r.versions.length && ctx.appVersion && !r.versions.includes(ctx.appVersion)) return false;
  if (r.subscriptions.length && ctx.subscription && !r.subscriptions.includes(ctx.subscription)) return false;
  if (r.roles.length && ctx.role && !r.roles.includes(ctx.role)) return false;
  if (r.devices.length && ctx.device && !r.devices.includes(ctx.device)) return false;
  return true;
}

function withinTimeWindow(flag: FeatureFlag, ts: number): boolean {
  const w = flag.rollout.timeWindow;
  if (!w) return true;
  const start = new Date(w.start).getTime();
  const end = new Date(w.end).getTime();
  return ts >= start && ts <= end;
}

function pickVariant(variants: FlagVariant[], userId: string | undefined, key: string): FlagVariant | undefined {
  if (variants.length === 0) return undefined;
  const total = variants.reduce((s, v) => s + Math.max(0, v.weight), 0);
  if (total <= 0) return variants[0];
  const roll = (bucketFor(userId, `variant::${key}`) / 100) * total;
  let acc = 0;
  for (const v of variants) {
    acc += Math.max(0, v.weight);
    if (roll < acc) return v;
  }
  return variants[variants.length - 1];
}

export function evaluateFlag(flag: FeatureFlag, ctx: FlagEvaluationContext): FlagEvaluationResult {
  const ts = ctx.timestamp ?? Date.now();
  const base: Omit<FlagEvaluationResult, "enabled" | "value" | "variant" | "reason"> = {
    key: flag.key,
    evaluatedAt: ts,
  };

  if (flag.killSwitch) {
    return { ...base, enabled: false, value: flag.defaultValue, reason: "kill_switch" };
  }
  if (flag.status === "inactive" || flag.status === "archived") {
    return { ...base, enabled: false, value: flag.defaultValue, reason: `flag_${flag.status}` };
  }
  if (flag.status === "draft") {
    return { ...base, enabled: false, value: flag.defaultValue, reason: "draft" };
  }

  const r = flag.rollout;
  let enabled = false;
  let reason = "default";

  switch (r.strategy) {
    case "global":
      enabled = r.percentage >= 100;
      reason = enabled ? "global_rollout" : "global_rollout_off";
      break;
    case "beta":
      enabled = ctx.isAdmin || ctx.isCoach || (ctx.segments ?? []).includes("beta_testers") || bucketFor(ctx.userId, flag.key) < r.percentage;
      reason = "beta_rollout";
      break;
    case "percentage":
      enabled = bucketFor(ctx.userId, flag.key) < r.percentage;
      reason = "percentage_rollout";
      break;
    case "ab":
      enabled = bucketFor(ctx.userId, flag.key) < r.percentage;
      reason = "ab_rollout";
      break;
    case "segment":
    case "user-segment":
      enabled = matchesTargeting(flag, ctx);
      reason = "segment_targeting";
      break;
    case "time":
      enabled = withinTimeWindow(flag, ts);
      reason = "time_based";
      break;
    default:
      // region / country / state / language / platform / version / subscription / role / device
      enabled = matchesDimensions(flag, ctx) && (r.percentage >= 100 || bucketFor(ctx.userId, flag.key) < r.percentage);
      reason = `${r.strategy}_rollout`;
  }

  if (enabled && !matchesDimensions(flag, ctx) && r.strategy !== "global") {
    // For non-global strategies, dimension filters still gate inclusion.
    enabled = r.strategy === "segment" || r.strategy === "user-segment" ? enabled : false;
  }

  const variant = flag.type === "variant" && enabled ? pickVariant(flag.variants, ctx.userId, flag.key) : undefined;
  const value = variant ? variant.value : enabled ? "true" : flag.defaultValue;

  return { ...base, enabled, value, variant, reason };
}

export function evaluateFlags(flags: FeatureFlag[], ctx: FlagEvaluationContext): FlagEvaluationResult[] {
  return flags.map((f) => evaluateFlag(f, ctx));
}

/** Determine the winning variant of an experiment using the configured goal metric. */
export function computeExperimentWinner(exp: Experiment): { winner?: string; liftPct: number } {
  if (exp.metrics.length < 2) return { liftPct: 0 };
  const control = exp.metrics.find((m) => m.variantKey === exp.controlKey);
  const candidates = exp.metrics.filter((m) => m.variantKey !== exp.controlKey);
  if (!control) return { liftPct: 0 };
  let best: (typeof candidates)[number] | undefined;
  let bestVal = -Infinity;
  for (const c of candidates) {
    const val = (c as any)[exp.goalMetric] ?? 0;
    if (val > bestVal) { bestVal = val; best = c; }
  }
  if (!best) return { liftPct: 0 };
  const controlVal = (control as any)[exp.goalMetric] ?? 0;
  const liftPct = controlVal > 0 ? ((bestVal - controlVal) / controlVal) * 100 : 0;
  return { winner: best.variantKey, liftPct };
}

/** Apply a scheduled state change if its time has arrived (called by a scheduler/tick). */
export function isScheduleDue(flag: FeatureFlag, ts = Date.now()): boolean {
  if (!flag.schedule?.enabled) return false;
  return new Date(flag.schedule.at).getTime() <= ts;
}
