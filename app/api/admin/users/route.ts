import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { hashPassword, randomToken } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, fail, HttpError,
  requirePermission, json,
} from "@/lib/admin/api";
import { ALL_ROLES, ROLE_LABELS, permissionsForRole } from "@/lib/admin/rbac";
import type { AdminUser, AdminRole } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUser(u: AdminUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    const session = requirePermission(req, "users:read");
    const users = await db.adminUsers.list();
    return json({
      users: users.map(publicUser).map((u) => ({ ...u, roleLabel: ROLE_LABELS[u.role as AdminRole] })),
      me: session.userId,
    });
  });
}

export async function POST(req: NextRequest) {
  await initStore();
  return withAudit(req, "users:write", { action: "create_user", module: "users", resource: "admin_user" }, async (session) => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const email = str(body.email).toLowerCase().trim();
    const name = str(body.name);
    const role = enumIn<AdminRole>(body.role, ALL_ROLES, "viewer");
    const password = str(body.password) || randomToken(12);
    if (!email.includes("@")) throw new HttpError(400, "Valid email required");
    const existing = await db.adminUsers.list();
    if (existing.some((u) => u.email.toLowerCase() === email)) throw new HttpError(409, "User already exists");
    const user: AdminUser = {
      id: `adm_${randomToken(8)}`,
      email, name, role,
      avatarColor: "#a78bfa",
      permissions: permissionsForRole(role),
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      active: true,
      passwordHash: hashPassword(password),
    };
    await db.adminUsers.insert(user);
    return json({ user: publicUser(user), temporaryPassword: password }, 201);
  });
}

