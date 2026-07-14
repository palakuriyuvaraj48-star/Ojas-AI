import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, assertSafeMutation, parseBody, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { evaluateFlags } from "@/lib/admin/feature-flags";
import type { FlagEvaluationContext } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "flags:read");
    const body = await parseBody<FlagEvaluationContext & { keys?: string[] }>(req);
    const ctx: FlagEvaluationContext = {
      userId: body.userId,
      userGroups: body.userGroups,
      segments: body.segments,
      isPremium: body.isPremium,
      isNewUser: body.isNewUser,
      isReturningUser: body.isReturningUser,
      isCoach: body.isCoach,
      isAdmin: body.isAdmin,
      country: body.country,
      region: body.region,
      state: body.state,
      language: body.language,
      platform: body.platform,
      appVersion: body.appVersion,
      subscription: body.subscription,
      role: body.role,
      device: body.device,
      timestamp: body.timestamp,
    };
    let flags = (await db.featureFlags.list()).filter((f) => !f.deletedAt && f.status !== "archived");
    if (body.keys?.length) flags = flags.filter((f) => body.keys!.includes(f.key));
    const results = evaluateFlags(flags, ctx);
    return json({ results, evaluatedAt: Date.now() });
  });
}
