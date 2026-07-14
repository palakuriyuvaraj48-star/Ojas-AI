import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import {
  guard, assertSafeMutation, json, requireSession, clearAdminCookie,
} from "@/lib/admin/api";
import { recordAudit, clientIp } from "@/lib/admin/audit";
import type { AdminUser } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUser(u: AdminUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function POST(req: NextRequest) {
  await initStore();
  return guard(async () => {
    assertSafeMutation(req);
    const session = requireSession(req);
    const res = json({ success: true });
    clearAdminCookie(res);
    const user = await db.adminUsers.get(session.userId);
    if (user) {
      recordAudit({
        req, session, action: "logout", module: "auth", resource: "session", resourceId: user.id,
        metadata: { ip: clientIp(req) },
      }).catch(() => undefined);
    }
    return res;
  });
}
