import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import { evaluateFlags } from "@/lib/admin/feature-flags";
import type { FeatureFlag, FlagStatus } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "enable" | "disable" | "archive" | "restore" | "kill" | "rollback" | "schedule" | "unschedule";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "flags:write", { action: "flag_action", module: "feature-flags", resource: "feature_flag", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<{ action: Action; schedule?: any; note?: string }>(req);
    const action = str(body.action) as Action;
    const flag = await db.featureFlags.get(id);
    if (!flag || flag.deletedAt) throw new HttpError(404, "Flag not found");

    const apply = (patch: Partial<FeatureFlag>, actionLabel: string, note?: string) =>
      db.featureFlags.update(id, (prev) => ({
        ...prev,
        ...patch,
        history: [...prev.history, { id: `ch_${randomToken(6)}`, at: new Date().toISOString(), actorId: session.userId, actorEmail: session.email, action: actionLabel, note: note ?? body.note }],
      }));

    let updated;
    switch (action) {
      case "enable":
        updated = await apply({ status: "active", archivedAt: undefined }, "enabled", "Flag enabled");
        break;
      case "disable":
        updated = await apply({ status: "inactive" }, "disabled", "Flag disabled");
        break;
      case "archive":
        updated = await apply({ status: "archived", archivedAt: new Date().toISOString() }, "archived", "Flag archived");
        break;
      case "restore":
        updated = await apply({ status: "active", archivedAt: undefined, deletedAt: undefined, restoredAt: new Date().toISOString() }, "restored", "Flag restored");
        break;
      case "kill":
        updated = await apply({ killSwitch: true, status: "inactive" }, "kill_switch", "Emergency kill switch engaged");
        break;
      case "rollback":
        updated = await apply({ killSwitch: false, status: "active", rollout: { ...flag.rollout, percentage: 0, strategy: "percentage" } }, "rollback", "Emergency rollback to 0% rollout");
        break;
      case "schedule":
        updated = await apply({ schedule: body.schedule }, "scheduled", "Scheduled state change configured");
        break;
      case "unschedule":
        updated = await apply({ schedule: null }, "unscheduled", "Schedule cleared");
        break;
      default:
        throw new HttpError(400, `Unknown action: ${action}`);
    }
    return json({ flag: updated });
  });
}

// Public evaluation endpoint (read-only).
export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "flags:read");
    const { searchParams } = new URL(req.url);
    const ctx = {
      userId: searchParams.get("userId") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      region: searchParams.get("region") ?? undefined,
      language: searchParams.get("language") ?? undefined,
      platform: (searchParams.get("platform") as any) ?? undefined,
      subscription: (searchParams.get("subscription") as any) ?? undefined,
      role: (searchParams.get("role") as any) ?? undefined,
      isPremium: searchParams.get("isPremium") === "true",
      isAdmin: searchParams.get("isAdmin") === "true",
      isCoach: searchParams.get("isCoach") === "true",
    };
    const flags = (await db.featureFlags.list()).filter((f) => !f.deletedAt && f.status !== "archived");
    const results = evaluateFlags(flags, ctx);
    return json({ results, evaluatedAt: Date.now() });
  });
}
