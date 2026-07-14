/**
 * Admin JSON-file store — the persistence layer for the enterprise admin
 * platform (Features 131–135). Acts as the application database with safe
 * initialization, seeding, and forward migrations. Swap the repository
 * implementation for Postgres/Prisma without changing call sites.
 */
import fs from "fs/promises";
import path from "path";
import { randomToken } from "./crypto";

const DATA_DIR = path.join(process.cwd(), ".data", "admin");
const META_FILE = path.join(DATA_DIR, "_meta.json");

export interface CollectionFile {
  featureFlags: string;
  notificationCampaigns: string;
  notificationTemplates: string;
  notificationLogs: string;
  feedback: string;
  content: string;
  auditLogs: string;
  adminUsers: string;
  alertRules: string;
  incidents: string;
  serviceHealth: string;
  metrics: string;
  aiUsage: string;
  systemSettings: string;
}

export const COLLECTIONS: CollectionFile = {
  featureFlags: "feature-flags.json",
  notificationCampaigns: "notification-campaigns.json",
  notificationTemplates: "notification-templates.json",
  notificationLogs: "notification-logs.json",
  feedback: "feedback.json",
  content: "content.json",
  auditLogs: "audit-logs.json",
  adminUsers: "admin-users.json",
  alertRules: "alert-rules.json",
  incidents: "incidents.json",
  serviceHealth: "service-health.json",
  metrics: "metrics.json",
  aiUsage: "ai-usage.json",
  systemSettings: "system-settings.json",
};

const MIGRATION_VERSION = 3;

// Per-file async mutex to avoid concurrent write races within a process.
const locks = new Map<string, Promise<unknown>>();
function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => undefined));
  return next;
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    throw err;
  }
}

async function writeFile<T>(file: string, data: T): Promise<void> {
  await ensureDir();
  const tmp = path.join(DATA_DIR, `${file}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, path.join(DATA_DIR, file));
}

export class Repository<T extends { id: string }> {
  constructor(private file: string, private seed: T[] = []) {}

  private get all(): Promise<T[]> {
    return readFile<T[]>(this.file, this.seed);
  }

  async list(): Promise<T[]> {
    return withLock(this.file, () => this.all);
  }

  async find(predicate: (item: T) => boolean): Promise<T | undefined> {
    const items = await this.list();
    return items.find(predicate);
  }

  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.list();
    return items.filter(predicate);
  }

  async get(id: string): Promise<T | undefined> {
    const items = await this.list();
    return items.find((i) => i.id === id);
  }

  async insert(item: T): Promise<T> {
    return withLock(this.file, async () => {
      const items = await this.all;
      items.push(item);
      await writeFile(this.file, items);
      return item;
    });
  }

  async update(id: string, patch: Partial<T> | ((item: T) => T)): Promise<T | undefined> {
    return withLock(this.file, async () => {
      const items = await this.all;
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return undefined;
      const next = typeof patch === "function" ? patch(items[idx]) : { ...items[idx], ...patch };
      items[idx] = next;
      await writeFile(this.file, items);
      return next;
    });
  }

  async remove(id: string): Promise<boolean> {
    return withLock(this.file, async () => {
      const items = await this.all;
      const next = items.filter((i) => i.id !== id);
      if (next.length === items.length) return false;
      await writeFile(this.file, next);
      return true;
    });
  }

  async replaceAll(items: T[]): Promise<void> {
    return withLock(this.file, () => writeFile(this.file, items));
  }

  newId(prefix: string): string {
    return `${prefix}_${randomToken(10)}`;
  }
}

// ─── Repository registry ─────────────────────────────────────────────────────

import type {
  FeatureFlag, NotificationCampaign, NotificationTemplate, NotificationLog,
  FeedbackItem, ContentItem, AuditLog, AdminUser, AlertRule, Incident,
  ServiceHealth, SystemMetricSample, AiUsageSnapshot, SystemSettings,
} from "./types";

export const db = {
  featureFlags: new Repository<FeatureFlag>(COLLECTIONS.featureFlags),
  notificationCampaigns: new Repository<NotificationCampaign>(COLLECTIONS.notificationCampaigns),
  notificationTemplates: new Repository<NotificationTemplate>(COLLECTIONS.notificationTemplates),
  notificationLogs: new Repository<NotificationLog>(COLLECTIONS.notificationLogs),
  feedback: new Repository<FeedbackItem>(COLLECTIONS.feedback),
  content: new Repository<ContentItem>(COLLECTIONS.content),
  auditLogs: new Repository<AuditLog>(COLLECTIONS.auditLogs),
  adminUsers: new Repository<AdminUser>(COLLECTIONS.adminUsers),
  alertRules: new Repository<AlertRule>(COLLECTIONS.alertRules),
  incidents: new Repository<Incident>(COLLECTIONS.incidents),
  serviceHealth: new Repository<ServiceHealth>(COLLECTIONS.serviceHealth),
  metrics: new Repository<SystemMetricSample>(COLLECTIONS.metrics),
  aiUsage: new Repository<AiUsageSnapshot>(COLLECTIONS.aiUsage),
  systemSettings: new Repository<SystemSettings>(COLLECTIONS.systemSettings),
};

// ─── Migration / seeding ─────────────────────────────────────────────────────

export interface StoreMeta {
  version: number;
  seededAt: string;
}

let initPromise: Promise<void> | null = null;

async function seedIfEmpty<T extends { id: string }>(
  repo: Repository<T>,
  seed: () => T[],
): Promise<void> {
  const existing = await repo.list();
  if (existing.length === 0) await repo.replaceAll(seed());
}

export async function initStore(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await ensureDir();
    const meta = await readFile<StoreMeta | null>(path.basename(META_FILE), null);
    if (!meta || meta.version < MIGRATION_VERSION) {
      const {
        seedAdminUsers, seedTemplates, seedAlertRules, seedFeatureFlags,
        seedContent, seedServiceHealth, seedFeedback, seedCampaigns,
      } = await import("./seed");
      await seedIfEmpty(db.adminUsers, seedAdminUsers);
      await seedIfEmpty(db.notificationTemplates, seedTemplates);
      await seedIfEmpty(db.alertRules, seedAlertRules);
      await seedIfEmpty(db.featureFlags, seedFeatureFlags);
      await seedIfEmpty(db.content, seedContent);
      await seedIfEmpty(db.serviceHealth, seedServiceHealth);
      await seedIfEmpty(db.feedback, seedFeedback);
      await seedIfEmpty(db.notificationCampaigns, seedCampaigns);
      await writeFile(path.basename(META_FILE), {
        version: MIGRATION_VERSION,
        seededAt: new Date().toISOString(),
      } satisfies StoreMeta);
    }
  })();
  return initPromise;
}

export { DATA_DIR, META_FILE, MIGRATION_VERSION };
