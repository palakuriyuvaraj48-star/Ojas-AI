import { NextRequest } from "next/server";
import { initStore, db } from "@/lib/admin/store";
import { guard, json, getSession } from "@/lib/admin/api";
import { ROLE_LABELS } from "@/lib/admin/rbac";
import type { AdminUser } from "@/lib/admin/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicUser(u: AdminUser) {
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function GET(req: NextRequest) {
  await initStore();
  return guard(async () => {
    const session = getSession(req);
    if (!session) return json({ user: null }, 200);
    const user = await db.adminUsers.get(session.userId);
    if (!user || !user.active) return json({ user: null }, 200);
    return json({ user: publicUser(user), role: ROLE_LABELS[user.role] });
  });
}
