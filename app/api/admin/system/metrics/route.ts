import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission, json } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const { searchParams } = new URL(req.url);
    const limit = Math.min(500, parseInt(searchParams.get("limit") || "120"));
    const all = await db.metrics.list();
    all.sort((a, b) => a.t - b.t);
    return json({ metrics: all.slice(-limit), total: all.length });
  });
}
