/**
 * Audit logging service. Every administrative action is recorded with actor,
 * resource, IP, user-agent, and a severity. Consumed by the API guard layer
 * and surfaced in the /admin audit log viewer.
 */
import { db } from "./store";
import type { AdminModule, AuditLog, AuditSeverity } from "./types";
import { randomToken } from "./crypto";
import type { SignedToken } from "./crypto";
import type { NextRequest } from "next/server";

export interface AuditInput {
  req: NextRequest;
  session: SignedToken;
  action: string;
  module: AdminModule;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

export async function recordAudit(input: AuditInput): Promise<void> {
  const entry: AuditLog = {
    id: `audit_${randomToken(10)}`,
    actorId: input.session.userId,
    actorEmail: input.session.email,
    actorRole: input.session.role as AuditLog["actorRole"],
    action: input.action,
    resource: input.resource,
    resourceId: input.resourceId,
    module: input.module,
    changes: input.changes,
    metadata: input.metadata,
    ip: clientIp(input.req),
    userAgent: input.req.headers.get("user-agent") || "unknown",
    severity: input.severity ?? "info",
    createdAt: new Date().toISOString(),
  };
  await db.auditLogs.insert(entry);
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
