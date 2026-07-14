import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, num, bool, arr, enumIn, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { FeatureFlag, FlagType, FlagStatus, RolloutStrategy, FlagRollout } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function emptyRollout(): FlagRollout {
  return {
    strategy: "percentage", percentage: 0, regions: [], countries: [], states: [], languages: [], platforms: [],
    versions: [], subscriptions: [], roles: [], devices: [], timeWindow: null,
    targeting: { userIds: [], userGroups: [], premiumOnly: false, newUsersOnly: false, returningUsersOnly: false, coachesOnly: false, adminsOnly: false, segments: [] },
  };
}

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

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "flags:read");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase() ?? "";
    const tag = searchParams.get("tag");
    const includeArchived = searchParams.get("includeArchived") === "true";
    let flags = await db.featureFlags.list();
    if (!includeArchived) flags = flags.filter((f) => !f.deletedAt);
    if (status) flags = flags.filter((f) => f.status === status);
    if (tag) flags = flags.filter((f) => f.tags.includes(tag));
    if (search) flags = flags.filter((f) => f.name.toLowerCase().includes(search) || f.key.toLowerCase().includes(search) || f.description.toLowerCase().includes(search));
    flags.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return json({ flags, total: flags.length });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "flags:write", { action: "create_flag", module: "feature-flags", resource: "feature_flag" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const key = str(body.key).trim();
    const name = str(body.name).trim() || key;
    if (!key) throw new HttpError(400, "Flag key is required");
    if (!/^[a-z0-9_]+$/.test(key)) throw new HttpError(400, "Key must be lowercase alphanumeric with underscores");
    const existing = await db.featureFlags.list();
    if (existing.some((f) => f.key === key && !f.deletedAt)) throw new HttpError(409, "A flag with this key already exists");
    const type = enumIn<FlagType>(body.type, ["boolean", "string", "json", "variant"], "boolean");
    const flag: FeatureFlag = {
      id: `flag_${randomToken(10)}`,
      key, name,
      description: str(body.description),
      type,
      status: enumIn<FlagStatus>(body.status, ["draft", "active", "inactive", "archived"], "draft"),
      defaultValue: str(body.defaultValue, "false"),
      rollout: parseRollout(body),
      variants: arr<any>(body.variants).map((v) => ({ id: v.id ?? `var_${randomToken(6)}`, key: str(v.key), name: str(v.name), value: str(v.value), weight: num(v.weight, 0), description: str(v.description) })),
      experiments: [],
      killSwitch: bool(body.killSwitch),
      schedule: null,
      tags: arr<string>(body.tags),
      owner: str(body.owner, session.email),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.email,
      history: [{ id: `ch_${randomToken(6)}`, at: new Date().toISOString(), actorId: session.userId, actorEmail: session.email, action: "created", note: "Flag created" }],
    };
    await db.featureFlags.insert(flag);
    return json({ flag }, 201);
  });
}
