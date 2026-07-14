import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, num, bool, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { FeatureFlag, FlagType, FlagStatus, FlagRollout, RolloutStrategy } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseRollout(body: Record<string, unknown>): FlagRollout {
  const r = (body.rollout ?? {}) as Record<string, unknown>;
  const t = (r.targeting ?? {}) as Record<string, unknown>;
  return {
    strategy: enumIn<RolloutStrategy>(r.strategy, ["global", "percentage", "beta", "segment", "region", "country", "state", "language", "platform", "version", "subscription", "role", "device", "time", "user-segment", "ab"], "percentage"),
    percentage: num(r.percentage, 0),
    regions: arr<string>(r.regions), countries: arr<string>(r.countries), states: arr<string>(r.states),
    languages: arr<string>(r.languages), platforms: arr<any>(r.platforms), versions: arr<string>(r.versions),
    subscriptions: arr<any>(r.subscriptions), roles: arr<any>(r.roles), devices: arr<string>(r.devices),
    timeWindow: (r.timeWindow as any) ?? null,
    targeting: {
      userIds: arr<string>(t.userIds), userGroups: arr<string>(t.userGroups),
      premiumOnly: bool(t.premiumOnly), newUsersOnly: bool(t.newUsersOnly), returningUsersOnly: bool(t.returningUsersOnly),
      coachesOnly: bool(t.coachesOnly), adminsOnly: bool(t.adminsOnly), segments: arr<string>(t.segments),
    },
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "flags:read");
    const { id } = await params;
    const flag = await db.featureFlags.get(id);
    if (!flag || flag.deletedAt) throw new HttpError(404, "Flag not found");
    return json({ flag });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "flags:write", { action: "update_flag", module: "feature-flags", resource: "feature_flag", resourceId: id }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.featureFlags.get(id);
    if (!existing || existing.deletedAt) throw new HttpError(404, "Flag not found");

    const patch: Partial<FeatureFlag> = {
      updatedAt: new Date().toISOString(),
      name: str(body.name) || existing.name,
      description: body.description !== undefined ? str(body.description) : existing.description,
      type: body.type ? enumIn<FlagType>(body.type, ["boolean", "string", "json", "variant"], existing.type) : existing.type,
      status: body.status ? enumIn<FlagStatus>(body.status, ["draft", "active", "inactive", "archived"], existing.status) : existing.status,
      defaultValue: body.defaultValue !== undefined ? str(body.defaultValue, existing.defaultValue) : existing.defaultValue,
      rollout: body.rollout ? parseRollout(body) : existing.rollout,
      killSwitch: body.killSwitch !== undefined ? bool(body.killSwitch) : existing.killSwitch,
      tags: body.tags ? arr<string>(body.tags) : existing.tags,
      owner: body.owner ? str(body.owner) : existing.owner,
      schedule: body.schedule !== undefined ? (body.schedule as any) : existing.schedule,
      variants: body.variants ? arr<any>(body.variants).map((v) => ({ id: v.id ?? `var_${randomToken(6)}`, key: str(v.key), name: str(v.name), value: str(v.value), weight: num(v.weight, 0), description: str(v.description) })) : existing.variants,
    };
    const updated = await db.featureFlags.update(id, (prev) => ({
      ...prev,
      ...patch,
      history: [...prev.history, { id: `ch_${randomToken(6)}`, at: new Date().toISOString(), actorId: session.userId, actorEmail: session.email, action: "updated", note: "Flag configuration updated" }],
    }));
    return json({ flag: updated });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "flags:delete", { action: "delete_flag", module: "feature-flags", resource: "feature_flag", resourceId: id }, async () => {
    assertSafeMutation(req);
    const existing = await db.featureFlags.get(id);
    if (!existing) throw new HttpError(404, "Flag not found");
    await db.featureFlags.update(id, (prev) => ({
      ...prev,
      deletedAt: new Date().toISOString(),
      status: "archived",
      history: [...prev.history, { id: `ch_${randomToken(6)}`, at: new Date().toISOString(), actorId: "system", actorEmail: "system", action: "deleted", note: "Flag soft-deleted" }],
    }));
    return json({ success: true });
  });
}
