"use client";

import React, { useEffect, useState } from "react";
import { Users, UserPlus, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, AdminLoading, AdminError, PermissionDenied, ConfirmDialog, StatusBadge } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ROLE_LABELS, ALL_ROLES } from "@/lib/admin/rbac";

interface AdminUserRow {
  id: string; email: string; name: string; role: keyof typeof ROLE_LABELS;
  active: boolean; avatarColor: string; lastLoginAt?: string; roleLabel?: string;
}

export default function UsersPage() {
  const { user, can, refresh } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "viewer", password: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ users: AdminUserRow[] }>("/api/admin/users");
      setUsers(data.users);
    } catch (e: any) { setError(e?.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (can("users:read")) load(); }, [can]);

  if (!can("users:read")) return <PermissionDenied permission="users:read" />;

  const createUser = async () => {
    setCreating(true);
    try {
      await adminFetch("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      setShowCreate(false);
      setForm({ name: "", email: "", role: "viewer", password: "" });
      await load();
    } catch (e: any) { setError(e?.message); }
    finally { setCreating(false);
      await refresh();
    }
  };

  const setRole = async (id: string, role: string) => {
    try { await adminFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ role }) }); await load(); await refresh(); }
    catch (e: any) { setError(e?.message); }
  };
  const toggleActive = async (id: string, active: boolean) => {
    try { await adminFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ active }) }); await load(); }
    catch (e: any) { setError(e?.message); }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Users"
        subtitle="RBAC-managed operators with audited access"
        icon={<Users className="h-5 w-5" />}
        actions={can("users:write") ? <Button variant="premium" size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>Add User</Button> : undefined}
      />
      {loading ? <AdminLoading rows={5} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: u.avatarColor }}>
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--foreground)]">{u.name}</p>
                  <p className="text-[10px] text-[var(--foreground-subtle)]">{u.email}</p>
                </div>
                {!u.active && <Badge label="disabled" variant="danger" />}
                {u.id === user?.id && <Badge label="you" variant="primary" />}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={u.role}
                  disabled={!can("users:write") || u.id === user?.id}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-black/35 px-2 py-1.5 text-[11px] text-[var(--foreground)] disabled:opacity-50"
                >
                  {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                {can("users:write") && u.id !== user?.id && (
                  <button onClick={() => toggleActive(u.id, !u.active)} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-[11px] text-[var(--foreground-muted)] hover:bg-white/10">
                    {u.active ? "Disable" : "Enable"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Admin User">
        <div className="space-y-3">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          <input placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {ALL_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <Button variant="premium" size="md" loading={creating} onClick={createUser} className="w-full">Create User</Button>
        </div>
      </Modal>
    </div>
  );
}
