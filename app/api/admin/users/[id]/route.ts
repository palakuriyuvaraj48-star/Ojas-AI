import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { hashPassword } from "@/lib/admin/crypto";
import {
  guard, withAudit, assertSafeMutation, parseBody, str, enumIn, HttpError, requirePermission, json,
} from "@/lib/admin/api";
import { ALL_ROLES, permissionsForRole } from "@/lib/admin/rbac";
import type { AdminUser, AdminRole } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUser(u: AdminUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "users:write", { action: "update_user", module: "users", resource: "admin_user", resourceId: id }, async () => {
    assertSafeMutation(req);
    const body = await parseBody<Record<string, unknown>>(req);
    const existing = await db.adminUsers.get(id);
    if (!existing) throw new HttpError(404, "User not found");
    const patch: Partial<AdminUser> = { updatedAt: new Date().toISOString() };
    if (body.role) {
      const r = enumIn<AdminRole>(body.role, ALL_ROLES, existing.role);
      patch.role = r;
      patch.permissions = permissionsForRole(r);
    }
    if (typeof body.active === "boolean") patch.active = body.active;
    if (str(body.password)) patch.passwordHash = hashPassword(str(body.password));
    const updated = await db.adminUsers.update(id, patch);
    return json({ user: updated ? publicUser(updated) : null });
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initStore();
  const { id } = await params;
  return withAudit(req, "users:write", { action: "delete_user", module: "users", resource: "admin_user", resourceId: id }, async () => {
    assertSafeMutation(req);
    const ok = await db.adminUsers.remove(id);
    if (!ok) throw new HttpError(404, "User not found");
    return json({ success: true });
  });
}
