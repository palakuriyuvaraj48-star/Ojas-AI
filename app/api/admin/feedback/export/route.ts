import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  await initStore();
  try {
    requirePermission(req, "feedback:read");
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv";
    const items = await db.feedback.list();
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const headers = ["id", "type", "subject", "category", "priority", "severity", "sentiment", "status", "assignee", "submitter", "rating", "createdAt", "aiSummary"];
    const rows = items.map((i) => headers.map((h) => csvEscape((i as any)[h])).join(","));

    if (format === "json") {
      return new Response(JSON.stringify(items, null, 2), { status: 200, headers: { "content-type": "application/json", "content-disposition": "attachment; filename=feedback.json" } });
    }
    const csv = [headers.join(","), ...rows].join("\n");
    return new Response(csv, {
      status: 200,
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=feedback-export.csv" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "Internal Server Error" }), {
      status: e.status || 500,
      headers: { "content-type": "application/json" },
    });
  }
}
