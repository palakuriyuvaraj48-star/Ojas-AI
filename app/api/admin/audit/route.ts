import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission, paginate, json } from "@/lib/admin/api";
import type { AuditLog, AuditSeverity, AdminModule } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "audit:read");
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(searchParams.get("pageSize") || "25"));
    const moduleFilter = searchParams.get("module");
    const severity = searchParams.get("severity") as AuditSeverity | null;
    const actor = searchParams.get("actor");

    let items = await db.auditLogs.list();
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (moduleFilter) items = items.filter((i) => i.module === moduleFilter);
    if (severity) items = items.filter((i) => i.severity === severity);
    if (actor) items = items.filter((i) => i.actorEmail.toLowerCase().includes(actor.toLowerCase()));
    const result = paginate(items, page, pageSize);
    return json(result);
  });
}
