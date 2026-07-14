import { NextRequest, NextResponse } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { signToken, verifyPassword } from "@/lib/admin/crypto";
import {
  guard, assertSafeMutation, rateLimit, setAdminCookie,
  json, requireSession, HttpError, clearAdminCookie, getSession,
} from "@/lib/admin/api";
import { ROLE_LABELS } from "@/lib/admin/rbac";
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
    rateLimit(req, "auth:login", 10, 60_000);
    assertSafeMutation(req);
    const body = await req.json();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    if (!email || !password) throw new HttpError(400, "Email and password are required");

    const users = await db.adminUsers.list();
    const user = users.find((u) => u.email.toLowerCase() === email && u.active);
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, "Invalid credentials");
    }
    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    const res = json({ user: publicUser(user), role: ROLE_LABELS[user.role] });
    setAdminCookie(res, token);
    await db.adminUsers.update(user.id, { lastLoginAt: new Date().toISOString() });
    recordAudit({
      req, session: { userId: user.id, role: user.role, email: user.email, iat: 0, exp: 0 },
      action: "login", module: "auth", resource: "session", resourceId: user.id,
      metadata: { ip: clientIp(req) }, severity: "info",
    }).catch(() => undefined);
    return res;
  });
}
