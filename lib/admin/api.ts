/**
 * Shared API infrastructure for the admin platform:
 *  - session resolution from the httpOnly admin cookie
 *  - RBAC permission guard (throws 401/403 NextResponse)
 *  - audit-log wrapper
 *  - in-memory sliding-window rate limiting (per IP + route)
 *  - CSRF / origin protection for state-changing requests
 *  - input validation helpers and JSON response envelopes
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./crypto";
import type { SignedToken } from "./crypto";
import { hasPermission } from "./rbac";
import type { Permission } from "./types";
import { recordAudit } from "./audit";
import type { AdminModule, AuditSeverity } from "./types";

export const ADMIN_COOKIE = "titan_admin_sid";

export function getSession(req: NextRequest): SignedToken | null {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, unknown>) {
    super(message);
  }
}

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, details }, { status });
}

/** Resolve session or throw 401. */
export function requireSession(req: NextRequest): SignedToken {
  const session = getSession(req);
  if (!session) throw new HttpError(401, "Authentication required");
  return session;
}

/** Resolve session and assert the required permission; throws 401/403. */
export function requirePermission(req: NextRequest, permission: Permission): SignedToken {
  const session = requireSession(req);
  if (!hasPermission(session.role as any, permission)) {
    throw new HttpError(403, `Missing permission: ${permission}`);
  }
  return session;
}

/** Wrap a handler so HttpError / unexpected errors return proper JSON. */
export async function guard(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status, err.details);
    const message = err instanceof Error ? err.message : "Internal server error";
    // eslint-disable-next-line no-console
    console.error("[admin-api]", message, err);
    return fail(message, 500);
  }
}

export interface AuditOptions {
  action: string;
  module: AdminModule;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

/** Run a handler with a resolved session, then asynchronously record an audit entry. */
export async function withAudit(
  req: NextRequest,
  permission: Permission,
  audit: AuditOptions,
  fn: (session: SignedToken) => Promise<NextResponse>,
): Promise<NextResponse> {
  return guard(async () => {
    const session = requirePermission(req, permission);
    const res = await fn(session);
    recordAudit({ req, session, ...audit }).catch(() => undefined);
    return res;
  });
}

// ─── Rate limiting (in-memory sliding window) ───────────────────────────────

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, key: string, limit = 60, windowMs = 60_000): void {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const id = `${ip}:${key}`;
  const now = Date.now();
  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new HttpError(429, "Rate limit exceeded. Try again shortly.");
  }
}

// ─── CSRF / origin protection for mutations ─────────────────────────────────

export function assertSafeMutation(req: NextRequest): void {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  // SameSite cookie + custom header defends against cross-site requests.
  if (req.headers.get("x-requested-with") !== "titan-admin") {
    throw new HttpError(403, "Invalid request origin (CSRF protection)");
  }
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) throw new HttpError(403, "Cross-origin request blocked");
    } catch {
      throw new HttpError(403, "Malformed origin header");
    }
  }
}

// ─── Validation utilities ───────────────────────────────────────────────────

export function parseBody<T>(req: NextRequest): Promise<T> {
  return req.json() as Promise<T>;
}

export function str(input: unknown, fallback = ""): string {
  return typeof input === "string" ? input : fallback;
}

export function num(input: unknown, fallback = 0): number {
  const n = typeof input === "string" ? parseFloat(input) : typeof input === "number" ? input : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function bool(input: unknown): boolean {
  return input === true || input === "true";
}

export function arr<T>(input: unknown): T[] {
  return Array.isArray(input) ? (input as T[]) : [];
}

export function enumIn<T extends string>(input: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(input as T) ? (input as T) : fallback;
}

export function validateShape<T>(
  shape: Record<string, (v: unknown) => boolean>,
  body: Record<string, unknown>,
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  for (const [key, check] of Object.entries(shape)) {
    if (!check(body[key])) errors[key] = `${key} is invalid`;
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const start = Math.max(0, (page - 1) * pageSize);
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

export function setAdminCookie(res: NextResponse, token: string): void {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearAdminCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
