import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { encryptSecret, decryptSecret } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, json, HttpError, requirePermission,
} from "@/lib/admin/api";
import type { SystemSettings } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    requirePermission(req, "system:read");
    const settings = (await db.systemSettings.list())[0];
    if (!settings) return json({ config: {} });
    let decrypted: Record<string, unknown> = {};
    try {
      decrypted = JSON.parse(decryptSecret(settings.encryptedConfig));
    } catch {
      decrypted = {};
    }
    // Never expose secrets directly; mask values.
    const masked = Object.fromEntries(
      Object.entries(decrypted).map(([k, v]) => [k, typeof v === "string" && /key|secret|token|password/i.test(k) ? "••••••••" : v]),
    );
    return json({ config: masked, updatedAt: settings.updatedAt });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "system:write", { action: "update_config", module: "system", resource: "system_settings" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const config = body.config ?? {};
    if (typeof config !== "object" || config === null) throw new HttpError(400, "config must be an object");
    const encrypted = encryptSecret(JSON.stringify(config));
    const existing = (await db.systemSettings.list())[0];
    let saved: SystemSettings;
    if (existing) {
      saved = (await db.systemSettings.update(existing.id, { encryptedConfig: encrypted, updatedAt: new Date().toISOString(), updatedBy: session.email }))!;
    } else {
      saved = await db.systemSettings.insert({ id: "global", encryptedConfig: encrypted, updatedAt: new Date().toISOString(), updatedBy: session.email });
    }
    return json({ success: true, updatedAt: saved.updatedAt });
  });
}
