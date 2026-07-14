"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ScrollText, Search } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, StatusBadge, AdminLoading, AdminError, PermissionDenied } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AuditEntry {
  id: string; actorEmail: string; actorRole: string; action: string;
  resource: string; resourceId?: string; module: string; severity: string; createdAt: string;
}

export default function AuditPage() {
  const { user, can } = useAdminAuth();
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (severity) params.set("severity", severity);
      if (search) params.set("actor", search);
      const data = await adminFetch<{ items: AuditEntry[]; total: number }>(`/api/admin/audit?${params}`);
      setItems(data.items);
      setTotal(data.total);
    } catch (e: any) {
      setError(e?.message);
    } finally {
      setLoading(false);
    }
  }, [page, severity, search]);

  useEffect(() => { load(); }, [load]);

  if (!can("audit:read")) return <PermissionDenied permission="audit:read" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Audit Logs" subtitle="Every administrative action is recorded here" icon={<ScrollText className="h-5 w-5" />} />
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-subtle)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor email…"
            className="w-full rounded-xl border border-[var(--border)] bg-black/20 py-2 pl-9 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-xl border border-[var(--border)] bg-black/35 px-3 py-2 text-xs text-[var(--foreground)]">
          <option value="">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? <AdminLoading rows={8} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
          {items.length === 0 && <p className="p-6 text-center text-xs text-[var(--foreground-subtle)]">No audit entries.</p>}
          {items.map((a) => (
            <div key={a.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs text-[var(--foreground)]">
                  <span className="font-semibold">{a.actorEmail}</span>
                  <span className="text-[var(--foreground-subtle)]"> · {a.actorRole}</span>{" "}
                  <span className="text-[var(--accent)]">{a.action}</span> {a.resource}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--foreground-subtle)]">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={a.module} variant="neutral" />
                <Badge label={a.severity} variant={a.severity === "critical" ? "danger" : a.severity === "warning" ? "warning" : "neutral"} />
              </div>
            </div>
          ))}
        </Card>
      )}
      <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-40">Prev</button>
          <button disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
