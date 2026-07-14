import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, requirePermission, json } from "@/lib/admin/api";
import { computeFeedbackAnalytics } from "@/lib/admin/feedback";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "feedback:read");
    const items = await db.feedback.list();
    const analytics = computeFeedbackAnalytics(items);
    return json(analytics);
  });
}
