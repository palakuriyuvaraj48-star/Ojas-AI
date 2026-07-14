/**
 * Seed data for the admin platform. Idempotent generators consumed by
 * lib/admin/store.ts#initStore (seeded only when a collection is empty).
 */
import type {
  AdminUser, NotificationTemplate, AlertRule, FeatureFlag, ContentItem,
  ServiceHealth, FeedbackItem, NotificationCampaign,
} from "./types";
import { hashPassword } from "./crypto";
import { permissionsForRole } from "./rbac";
import { randomToken } from "./crypto";

const now = () => new Date().toISOString();
const COLORS = ["#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#f87171", "#8b5cf6"];

export function seedAdminUsers(): AdminUser[] {
  const make = (
    email: string,
    name: string,
    role: AdminUser["role"],
    password: string,
    color: string,
  ): AdminUser => ({
    id: `adm_${randomToken(8)}`,
    email,
    name,
    role,
    avatarColor: color,
    permissions: permissionsForRole(role),
    mfaEnabled: role === "super_admin",
    createdAt: now(),
    updatedAt: now(),
    active: true,
    passwordHash: hashPassword(password),
  });
  return [
    make("admin@titancorp.ai", "Aria Vance", "super_admin", "Titan@Admin2026", COLORS[0]),
    make("ops@titancorp.ai", "Marcus Lee", "admin", "Titan@Ops2026", COLORS[1]),
    make("support@titancorp.ai", "Priya Nair", "moderator", "Titan@Mod2026", COLORS[2]),
    make("viewer@titancorp.ai", "Sam Rivera", "viewer", "Titan@View2026", COLORS[3]),
  ];
}

export function seedTemplates(): NotificationTemplate[] {
  const base = (over: Partial<NotificationTemplate>): NotificationTemplate => ({
    id: `tpl_${randomToken(8)}`,
    key: "",
    channel: "email",
    category: "workout_reminder",
    locale: "en",
    name: "",
    subject: "",
    title: "",
    body: "",
    variables: ["user_name", "goal"],
    createdAt: now(),
    updatedAt: now(),
    createdBy: "system",
    ...over,
  });
  return [
    base({ key: "workout_reminder", name: "Workout Reminder", channel: "push", category: "workout_reminder",
      title: "Time to train, {{user_name}}", body: "Your {{goal}} session is ready. Let's hit it 💪", variables: ["user_name", "goal"] }),
    base({ key: "meal_reminder", name: "Meal Reminder", channel: "push", category: "meal_reminder",
      title: "Fuel up, {{user_name}}", body: "Log your next meal to stay on track with {{goal}}.", variables: ["user_name", "goal"] }),
    base({ key: "hydration_reminder", name: "Hydration Reminder", channel: "in_app", category: "hydration_reminder",
      title: "Hydrate", body: "You're {{water_gap}}L behind your hydration goal today.", variables: ["user_name", "water_gap"] }),
    base({ key: "sleep_reminder", name: "Sleep Reminder", channel: "push", category: "sleep_reminder",
      title: "Wind down soon", body: "Aim for 7.5h sleep to maximize recovery, {{user_name}}.", variables: ["user_name"] }),
    base({ key: "recovery_reminder", name: "Recovery Reminder", channel: "in_app", category: "recovery_reminder",
      title: "Recovery check", body: "Your readiness is {{readiness}}. Consider a light mobility session.", variables: ["user_name", "readiness"] }),
    base({ key: "challenge_reminder", name: "Challenge Reminder", channel: "email", category: "challenge_reminder",
      subject: "Your challenge needs you", title: "Challenge progress", body: "{{user_name}}, you're {{progress}}% through the {{challenge}} challenge!", variables: ["user_name", "progress", "challenge"] }),
    base({ key: "promotion", name: "Promotion", channel: "email", category: "promotion",
      subject: "Unlock Elite", title: "Special offer inside", body: "{{user_name}}, upgrade to Elite and save 30% this week.", variables: ["user_name"] }),
    base({ key: "subscription", name: "Subscription", channel: "email", category: "subscription",
      subject: "Your Titan subscription", title: "Receipt", body: "Thanks {{user_name}}! Your {{plan}} plan is active.", variables: ["user_name", "plan"] }),
    base({ key: "renewal", name: "Renewal", channel: "email", category: "renewal",
      subject: "Renewal reminder", title: "Renew soon", body: "{{user_name}}, your subscription renews on {{date}}.", variables: ["user_name", "date"] }),
    base({ key: "milestone", name: "Milestone", channel: "push", category: "milestone",
      title: "Milestone unlocked!", body: "{{user_name}}, you just hit {{milestone}} 🎉", variables: ["user_name", "milestone"] }),
    base({ key: "announcement", name: "Announcement", channel: "in_app", category: "announcement",
      title: "Product update", body: "{{user_name}}, check out the latest Titan features.", variables: ["user_name"] }),
    base({ key: "emergency", name: "Emergency Alert", channel: "push", category: "emergency",
      title: "Important notice", body: "{{message}}", variables: ["message"] }),
  ];
}

export function seedAlertRules(): AlertRule[] {
  const mk = (over: Partial<AlertRule>): AlertRule => ({
    id: `alert_${randomToken(8)}`,
    name: "",
    condition: "cpu_high",
    threshold: 85,
    operator: "gt",
    channels: ["email"],
    enabled: true,
    severity: "warning",
    createdAt: now(),
    updatedAt: now(),
    ...over,
  });
  return [
    mk({ name: "High CPU", condition: "cpu_high", threshold: 85, channels: ["email", "slack"], severity: "warning" }),
    mk({ name: "High Memory", condition: "memory_high", threshold: 90, channels: ["email", "slack"], severity: "warning" }),
    mk({ name: "Database Down", condition: "db_down", threshold: 1, operator: "gte", channels: ["email", "sms", "slack", "discord"], severity: "critical" }),
    mk({ name: "API Down", condition: "api_down", threshold: 1, operator: "gte", channels: ["email", "slack"], severity: "critical" }),
    mk({ name: "AI Failure Spike", condition: "ai_failure", threshold: 10, operator: "gte", channels: ["email", "slack"], severity: "critical" }),
    mk({ name: "Payment Failure", condition: "payment_failure", threshold: 5, operator: "gte", channels: ["email", "sms"], severity: "critical" }),
    mk({ name: "Storage Limit", condition: "storage_limit", threshold: 90, channels: ["email"], severity: "warning" }),
    mk({ name: "Queue Failure", condition: "queue_failure", threshold: 5, operator: "gte", channels: ["email", "slack"], severity: "warning" }),
    mk({ name: "Auth Failure", condition: "auth_failure", threshold: 20, operator: "gte", channels: ["email", "slack"], severity: "warning" }),
    mk({ name: "Notification Failure", condition: "notification_failure", threshold: 15, operator: "gte", channels: ["email"], severity: "warning" }),
  ];
}

export function seedFeatureFlags(): FeatureFlag[] {
  const id = (k: string) => `flag_${k}_${randomToken(6)}`;
  const mk = (over: Partial<FeatureFlag> & { key: string }): FeatureFlag => {
    const { key, ...rest } = over;
    return {
      id: id(key),
      key,
      name: key,
      description: "",
      type: "boolean",
      status: "active",
      defaultValue: "false",
      rollout: {
        strategy: "percentage", percentage: 0,
        regions: [], countries: [], states: [], languages: [], platforms: [], versions: [],
        subscriptions: [], roles: [], devices: [], timeWindow: null,
        targeting: { userIds: [], userGroups: [], premiumOnly: false, newUsersOnly: false, returningUsersOnly: false, coachesOnly: false, adminsOnly: false, segments: [] },
      },
      variants: [], experiments: [], killSwitch: false, schedule: null, tags: [], owner: "platform",
      createdAt: now(), updatedAt: now(), createdBy: "system", history: [],
      ...rest,
    };
  };
  return [
    mk({ key: "voice_coach", name: "Biomechanical Voice Coach", description: "Real-time voice form coaching audio.",
      status: "active", defaultValue: "true", rollout: { ...emptyRollout(), strategy: "global", percentage: 100 }, tags: ["vision"] }),
    mk({ key: "pose_model_beta", name: "MediaPipe Pose Model (Beta)", description: "Next-gen pose estimation rollout.",
      status: "active", defaultValue: "false", rollout: { ...emptyRollout(), strategy: "beta", percentage: 25, targeting: { ...emptyTargeting(), segments: ["beta_testers"] } }, tags: ["vision", "beta"] }),
    mk({ key: "indian_meal_optimizer", name: "Indian Meal Scanning Optimizer", description: "Region-tuned food recognition for Indian cuisine.",
      status: "active", defaultValue: "true", rollout: { ...emptyRollout(), strategy: "country", percentage: 100, countries: ["IN"] }, tags: ["nutrition"] }),
    mk({ key: "new_onboarding_v2", name: "Onboarding V2", description: "A/B test of the new onboarding flow.",
      status: "active", type: "variant", defaultValue: "control",
      rollout: { ...emptyRollout(), strategy: "ab", percentage: 50 },
      variants: [
        { id: "v_control", key: "control", name: "Control", value: "control", weight: 50 },
        { id: "v_v2", key: "variant_b", name: "Variant B", value: "variant_b", weight: 50 },
      ],
      experiments: [{ id: "exp_1", name: "Onboarding V2 Experiment", status: "running", controlKey: "control",
        startDate: now(), goalMetric: "conversionRate",
        metrics: [
          { variantKey: "control", exposure: 4200, conversionRate: 0.31, retention: 0.62, engagement: 0.54, revenue: 1820, workoutCompletion: 0.48, nutritionCompletion: 0.41, confidence: 0.91 },
          { variantKey: "variant_b", exposure: 4185, conversionRate: 0.38, retention: 0.69, engagement: 0.61, revenue: 2210, workoutCompletion: 0.55, nutritionCompletion: 0.49, confidence: 0.95 },
        ], winningVariantKey: "variant_b" }],
      tags: ["growth"] }),
    mk({ key: "premium_automation", name: "Premium Automation Engine", description: "Automated weekly planning & wearables sync.",
      status: "active", defaultValue: "true", rollout: { ...emptyRollout(), strategy: "subscription", percentage: 100, subscriptions: ["pro", "elite"] }, tags: ["premium"] }),
  ];
}

export function seedContent(): ContentItem[] {
  const mk = (over: Partial<ContentItem> & { title: string; kind: ContentItem["kind"] }): ContentItem => {
    const { kind, title, slug, ...rest } = over;
    return {
      id: `cnt_${randomToken(8)}`,
      kind, title, slug: slug || "", body: "", excerpt: "", locale: "en", status: "published",
      categories: [], tags: [],
      seo: { metaTitle: "", metaDescription: "", slug: "", openGraph: {} },
      media: [], version: 1, versions: [], parentId: null, translations: {},
      author: "system", createdAt: now(), updatedAt: now(), publishedAt: now(),
      ...rest,
    };
  };
  return [
    mk({ title: "10 Principles of Hypertrophy", kind: "article", slug: "hypertrophy-principles",
      excerpt: "Science-backed principles to maximize muscle growth.",
      body: "## Progressive Overload\nThe foundation of hypertrophy is consistently increasing training stimulus...",
      categories: ["training"], tags: ["strength", "muscle"],
      seo: { metaTitle: "10 Principles of Hypertrophy", metaDescription: "Science-backed muscle growth principles.", slug: "hypertrophy-principles", openGraph: {} } }),
    mk({ title: "High-Protein Indian Meal Plan", kind: "nutrition_plan", slug: "indian-high-protein",
      excerpt: "A vegetarian-friendly high protein plan.",
      body: "## Day 1\n- Breakfast: Moong dal chilla with paneer...",
      categories: ["nutrition"], tags: ["indian", "vegetarian"], status: "published" }),
    mk({ title: "30-Day Core Challenge", kind: "challenge", slug: "core-30",
      excerpt: "Build a bulletproof core in 30 days.",
      body: "## Week 1\nFoundational stability work...",
      categories: ["challenge"], tags: ["core"], status: "approved" }),
    mk({ title: "Barbell Back Squat", kind: "exercise", slug: "barbell-back-squat",
      excerpt: "The king of lower-body movements.",
      body: "## Setup\nPosition the bar on your upper traps...",
      categories: ["exercises"], tags: ["legs", "compound"], status: "published" }),
  ];
}

export function seedServiceHealth(): ServiceHealth[] {
  const mk = (over: Partial<ServiceHealth>): ServiceHealth => ({
    id: `svc_${randomToken(6)}`, name: "", category: "core", status: "operational",
    latencyMs: 40, uptimePct: 99.98, healthScore: 98, lastChecked: now(), ...over,
  });
  return [
    mk({ name: "API Gateway", category: "core", endpoint: "/api" }),
    mk({ name: "Primary Database", category: "database", endpoint: "/api/admin/system" }),
    mk({ name: "AI Engine (Gemini)", category: "ai", endpoint: "/api/coach/chat", latencyMs: 142 }),
    mk({ name: "Payments (Stripe)", category: "payment", latencyMs: 210 }),
    mk({ name: "Notification Service", category: "notification", latencyMs: 65 }),
    mk({ name: "Email Service", category: "email", latencyMs: 120 }),
    mk({ name: "Search (Algolia)", category: "search", latencyMs: 38 }),
    mk({ name: "Redis Cache", category: "cache", latencyMs: 4 }),
    mk({ name: "Auth Service", category: "auth", latencyMs: 22 }),
  ];
}

export function seedFeedback(): FeedbackItem[] {
  const mk = (over: Partial<FeedbackItem> & { subject: string; type: FeedbackItem["type"] }): FeedbackItem => {
    const { type, subject, ...rest } = over;
    return {
      id: `fb_${randomToken(8)}`, type, subject, description: "", category: "bug", priority: "medium",
      severity: "minor", sentiment: "neutral", status: "open", assignee: "unassigned",
      tags: [], attachments: [], createdAt: now(), updatedAt: now(),
      ...rest,
    };
  };
  return [
    mk({ subject: "Water tracker resets on reload", type: "bug", description: "Water logs disappear after page refresh.",
      category: "bug", priority: "high", severity: "major", sentiment: "negative", status: "in_progress", assignee: "developer",
      device: "iPhone 15", appVersion: "1.4.2", platform: "ios", os: "iOS 18", aiSummary: "Hydration entries not persisted across reload." }),
    mk({ subject: "Add Apple Health sync", type: "feature", description: "Please integrate Apple Health for automatic step import.",
      category: "feature_request", priority: "medium", severity: "trivial", sentiment: "positive", status: "open", assignee: "unassigned",
      aiSummary: "Feature request: Apple Health integration." }),
    mk({ subject: "Love the new coach!", type: "review", description: "The AI coach is incredibly helpful and motivating.",
      category: "other", priority: "low", severity: "trivial", sentiment: "positive", status: "resolved", rating: 5,
      assignee: "moderator", aiSummary: "Positive review of AI coach." }),
  ];
}

export function seedCampaigns(): NotificationCampaign[] {
  const id = `cmp_${randomToken(8)}`;
  return [{
    id, name: "Weekly Workout Nudge", channel: "push", templateId: "workout_reminder",
    audience: { segments: ["active"] }, schedule: { type: "recurring", timezone: "UTC", recurring: { frequency: "weekly", atHour: 9, timezone: "UTC" } },
    status: "scheduled", personalization: {}, subject: "Time to train", title: "Time to train, {{user_name}}",
    body: "Your session is ready.",
    stats: { recipientCount: 12480, queued: 12480, sent: 11890, delivered: 11540, opened: 6120, clicked: 1480, converted: 320, unsubscribed: 42, bounced: 18, failed: 350 },
    createdAt: now(), updatedAt: now(), createdBy: "system",
  }];
}

// helpers
function emptyTargeting() {
  return { userIds: [], userGroups: [], premiumOnly: false, newUsersOnly: false, returningUsersOnly: false, coachesOnly: false, adminsOnly: false, segments: [] };
}
function emptyRollout() {
  return { strategy: "percentage" as const, percentage: 0, regions: [], countries: [], states: [], languages: [], platforms: [], versions: [], subscriptions: [], roles: [], devices: [], timeWindow: null, targeting: emptyTargeting() };
}
