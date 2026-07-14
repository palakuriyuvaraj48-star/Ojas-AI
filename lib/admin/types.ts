/**
 * Enterprise Admin Platform — shared domain types (Features 131–135).
 * These are the canonical data models persisted by lib/admin/store.ts.
 */

// ─────────────────────────────────────────────────────────────────────────────
// RBAC & Sessions
// ─────────────────────────────────────────────────────────────────────────────

export type AdminRole = "super_admin" | "admin" | "moderator" | "viewer";

export type Permission =
  | "flags:read" | "flags:write" | "flags:delete"
  | "notifications:read" | "notifications:write" | "notifications:send" | "notifications:delete"
  | "feedback:read" | "feedback:write" | "feedback:delete"
  | "content:read" | "content:write" | "content:publish" | "content:delete"
  | "system:read" | "system:write" | "system:alerts"
  | "audit:read"
  | "users:read" | "users:write";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarColor: string;
  permissions: Permission[];
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  /** Never serialized to the client. */
  passwordHash?: string;
}

export interface AdminSession {
  userId: string;
  role: AdminRole;
  email: string;
  iat: number;
  exp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logging
// ─────────────────────────────────────────────────────────────────────────────

export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: AdminRole;
  action: string;
  resource: string;
  resourceId?: string;
  module: AdminModule;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  severity: AuditSeverity;
  createdAt: string;
}

export type AdminModule =
  | "auth" | "feature-flags" | "notifications" | "feedback" | "content" | "system" | "audit" | "users";

// ─────────────────────────────────────────────────────────────────────────────
// 131 — FEATURE FLAGS
// ─────────────────────────────────────────────────────────────────────────────

export type FlagType = "boolean" | "string" | "json" | "variant";
export type FlagStatus = "draft" | "active" | "inactive" | "archived";
export type RolloutStrategy =
  | "global" | "percentage" | "beta" | "segment" | "region" | "country"
  | "state" | "language" | "platform" | "version" | "subscription" | "role"
  | "device" | "time" | "user-segment" | "ab";

export type Platform = "android" | "ios" | "web" | "desktop";
export type SubscriptionTier = "free" | "pro" | "elite";
export type UserRole = "user" | "coach" | "admin";

export interface FlagTargeting {
  userIds: string[];
  userGroups: string[];
  premiumOnly: boolean;
  newUsersOnly: boolean;
  returningUsersOnly: boolean;
  coachesOnly: boolean;
  adminsOnly: boolean;
  segments: string[];
}

export interface FlagRollout {
  strategy: RolloutStrategy;
  percentage: number;
  regions: string[];
  countries: string[];
  states: string[];
  languages: string[];
  platforms: Platform[];
  versions: string[];
  subscriptions: SubscriptionTier[];
  roles: UserRole[];
  devices: string[];
  timeWindow?: { start: string; end: string; timezone: string } | null;
  targeting: FlagTargeting;
}

export interface FlagVariant {
  id: string;
  key: string;
  name: string;
  value: string;
  weight: number;
  description?: string;
}

export type ExperimentStatus = "draft" | "running" | "paused" | "completed";
export type ExperimentVariantKey = string;

export interface ExperimentMetric {
  variantKey: ExperimentVariantKey;
  exposure: number;
  conversionRate: number;
  retention: number;
  engagement: number;
  revenue: number;
  workoutCompletion: number;
  nutritionCompletion: number;
  confidence: number;
}

export interface Experiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  controlKey: ExperimentVariantKey;
  startDate: string;
  endDate?: string;
  metrics: ExperimentMetric[];
  winningVariantKey?: ExperimentVariantKey;
  goalMetric: "conversionRate" | "retention" | "engagement" | "revenue" | "workoutCompletion" | "nutritionCompletion";
}

export interface FlagSchedule {
  enabled: boolean;
  action: "enable" | "disable" | "archive";
  at: string;
}

export interface FlagChange {
  id: string;
  at: string;
  actorId: string;
  actorEmail: string;
  action: string;
  note?: string;
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  status: FlagStatus;
  defaultValue: string;
  rollout: FlagRollout;
  variants: FlagVariant[];
  experiments: Experiment[];
  killSwitch: boolean;
  schedule?: FlagSchedule | null;
  tags: string[];
  owner: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  archivedAt?: string;
  deletedAt?: string;
  restoredAt?: string;
  history: FlagChange[];
}

export interface FlagEvaluationContext {
  userId?: string;
  userGroups?: string[];
  segments?: string[];
  isPremium?: boolean;
  isNewUser?: boolean;
  isReturningUser?: boolean;
  isCoach?: boolean;
  isAdmin?: boolean;
  country?: string;
  region?: string;
  state?: string;
  language?: string;
  platform?: Platform;
  appVersion?: string;
  subscription?: SubscriptionTier;
  role?: UserRole;
  device?: string;
  timestamp?: number;
}

export interface FlagEvaluationResult {
  key: string;
  enabled: boolean;
  value: string;
  variant?: FlagVariant;
  reason: string;
  evaluatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 132 — NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationChannel = "email" | "push" | "sms" | "in_app" | "desktop";
export type NotificationCategory =
  | "workout_reminder" | "meal_reminder" | "hydration_reminder" | "sleep_reminder"
  | "recovery_reminder" | "challenge_reminder" | "promotion" | "subscription"
  | "renewal" | "milestone" | "announcement" | "emergency";

export type NotificationTemplateLocale = "en" | "es" | "fr" | "de" | "hi" | "ja";

export interface NotificationTemplate {
  id: string;
  key: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  locale: NotificationTemplateLocale;
  name: string;
  subject?: string;
  title: string;
  body: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type AudienceSegment =
  | "all" | "premium" | "free" | "coaches" | "admins"
  | "inactive" | "active" | "new" | "returning" | "workout_streak" | "challenge_participants";

export interface AudienceTarget {
  segments: AudienceSegment[];
  includeUserIds: string[];
  excludeUserIds: string[];
  minStreak?: number;
  limit?: number;
}

export type CampaignScheduleType = "immediate" | "scheduled" | "recurring";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";

export interface RecurringRule {
  frequency: "daily" | "weekly" | "monthly";
  atHour: number;
  timezone: string;
  endDate?: string;
}

export interface NotificationStats {
  recipientCount: number;
  queued: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
  bounced: number;
  failed: number;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  channel: NotificationChannel;
  templateId: string;
  audience: AudienceTarget;
  schedule: {
    type: CampaignScheduleType;
    sendAt?: string;
    recurring?: RecurringRule | null;
    timezone: string;
  };
  status: CampaignStatus;
  personalization: Record<string, string>;
  subject?: string;
  title: string;
  body: string;
  stats: NotificationStats;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sentAt?: string;
}

export type NotificationDeliveryStatus =
  | "queued" | "sent" | "delivered" | "opened" | "clicked" | "failed" | "bounced" | "unsubscribed";

export interface NotificationLog {
  id: string;
  campaignId: string;
  campaignName: string;
  userId: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  attempts: number;
  scheduledAt: string;
  sentAt?: string;
  lastError?: string;
  locale: NotificationTemplateLocale;
  title: string;
  body: string;
  openedAt?: string;
  clickedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 133 — FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export type FeedbackType =
  | "bug" | "feature" | "rating" | "review" | "ticket" | "suggestion" | "complaint" | "crash";
export type FeedbackCategory =
  | "bug" | "performance" | "feature_request" | "payment" | "workout"
  | "nutrition" | "coach" | "subscription" | "ui" | "other";
export type FeedbackPriority = "low" | "medium" | "high" | "urgent";
export type FeedbackSeverity = "trivial" | "minor" | "major" | "critical";
export type Sentiment = "positive" | "neutral" | "negative";
export type FeedbackStatus =
  | "open" | "in_progress" | "pending" | "resolved" | "closed" | "rejected" | "duplicate";
export type FeedbackAssignee = "support" | "developer" | "coach" | "moderator" | "unassigned";

export interface FeedbackAttachment {
  id: string;
  name: string;
  kind: "screenshot" | "file" | "log" | "voice";
  url?: string;
  size: number;
  mime?: string;
}

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  subject: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  severity: FeedbackSeverity;
  sentiment: Sentiment;
  status: FeedbackStatus;
  assignee: FeedbackAssignee;
  submitterName?: string;
  submitterEmail?: string;
  rating?: number;
  aiSummary?: string;
  suggestedResponse?: string;
  duplicateOf?: string | null;
  tags: string[];
  attachments: FeedbackAttachment[];
  device?: string;
  appVersion?: string;
  platform?: Platform;
  os?: string;
  locale?: NotificationTemplateLocale;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  responseText?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 134 — CONTENT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export type ContentKind =
  | "exercise" | "workout_program" | "workout_plan" | "video" | "recipe"
  | "nutrition_plan" | "article" | "challenge" | "badge" | "achievement"
  | "course" | "guide" | "faq" | "translation";

export type ContentStatus = "draft" | "review" | "approved" | "published" | "archived";

export interface ContentSeo {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  openGraph: { title?: string; description?: string; image?: string };
  structuredData?: Record<string, unknown>;
}

export interface MediaAsset {
  id: string;
  type: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  optimized: boolean;
  width?: number;
  height?: number;
  size: number;
}

export interface ContentVersion {
  version: number;
  body: string;
  excerpt?: string;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  locale: NotificationTemplateLocale;
  status: ContentStatus;
  categories: string[];
  tags: string[];
  seo: ContentSeo;
  media: MediaAsset[];
  version: number;
  versions: ContentVersion[];
  parentId?: string | null;
  translations: Record<string, { title: string; body: string }>;
  scheduledPublishAt?: string | null;
  author: string;
  aiSummary?: string;
  aiSeoSuggestions?: Partial<ContentSeo>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 135 — SYSTEM MONITORING
// ─────────────────────────────────────────────────────────────────────────────

export type ServiceCategory =
  | "core" | "database" | "ai" | "payment" | "notification" | "email" | "search" | "cache" | "auth";
export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

export interface ServiceHealth {
  id: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  latencyMs: number;
  uptimePct: number;
  healthScore: number;
  lastChecked: string;
  message?: string;
  endpoint?: string;
}

export interface SystemMetricSample {
  id: string;
  t: number;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  latencyMs: number;
  requestsPerSec: number;
  errorRate: number;
  activeConnections: number;
}

export type AlertChannel = "email" | "push" | "sms" | "slack" | "discord";
export type AlertCondition =
  | "cpu_high" | "memory_high" | "db_down" | "api_down" | "ai_failure"
  | "payment_failure" | "storage_limit" | "queue_failure" | "auth_failure" | "notification_failure";
export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  threshold: number;
  operator: "gt" | "lt" | "gte" | "lte";
  channels: AlertChannel[];
  webhookUrl?: string;
  enabled: boolean;
  severity: AlertSeverity;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";
export type IncidentSeverity = "minor" | "major" | "critical";

export interface IncidentEvent {
  id: string;
  at: string;
  message: string;
  author: string;
  type: "update" | "root_cause" | "resolved";
}

export interface Incident {
  id: string;
  title: string;
  serviceId: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAt: string;
  resolvedAt?: string;
  rootCause?: string;
  timeline: IncidentEvent[];
  createdBy: string;
}

export interface AiUsageSnapshot {
  id: string;
  t: number;
  tokens: number;
  requests: number;
  latencyMs: number;
  costUsd: number;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  successRate: number;
  failureRate: number;
  modelUsage: Record<string, number>;
}

export interface SystemSettings {
  id: "global";
  encryptedConfig: string;
  updatedAt: string;
  updatedBy: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared API envelopes
// ─────────────────────────────────────────────────────────────────────────────

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
