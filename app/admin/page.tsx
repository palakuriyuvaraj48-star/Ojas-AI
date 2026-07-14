"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flag, Bell, MessageSquare, FileText, Activity, ArrowRight, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import {
  AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";

interface OverviewData {
  flags: { total: number; active: number };
  notifications: { totalCampaigns: number; sentCampaigns: number; deliveryRate: number };
  feedback: { total: number; open: number };
  content: { total: number; published: number };
  system: { healthScore: number; services: { name: string; status: string; latencyMs: number }[] };
  audit: { items: { id: string; actorEmail: string; action: string; resource: string; createdAt: string; module: string }[] };
}

export default function AdminOverview() {
  const { can } = useAdminAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      adminFetch<{ total: number }>("/api/admin/feature-flags?includeArchived=true").catch(() => null),
      adminFetch<any>("/api/admin/notifications/analytics").catch(() => null),
      adminFetch<any>("/api/admin/feedback/analytics").catch(() => null),
      adminFetch<{ total: number; items?: any[] }>("/api/admin/content").catch(() => null),
      adminFetch<any>("/api/admin/system/overview").catch(() => null),
      adminFetch<{ items: any[] }>("/api/admin/audit?pageSize=6").catch(() => null),
    ]).then(([flags, notif, fb, content, sys, audit]) => {
      if (!active) return;
      setData({
        flags: { total: flags?.total ?? 0, active: flags?.total ?? 0 },
        notifications: { totalCampaigns: notif?.totalCampaigns ?? 0, sentCampaigns: notif?.sentCampaigns ?? 0, deliveryRate: notif?.deliveryRate ?? 0 },
        feedback: { total: fb?.total ?? 0, open: fb?.byStatus?.open ?? 0 },
        content: { total: content?.total ?? 0, published: content?.items?.filter((c: any) => c.status === "published").length ?? 0 },
        system: { healthScore: sys?.healthScore ?? 0, services: (sys?.services ?? []).slice(0, 5) },
        audit: { items: audit?.items ?? [] },
      });
    }).catch((e) => setError(e?.message));
    return () => { active = false; };
  }, []);

  if (error) return <AdminError message={error} />;
  if (!data) return <AdminLoading rows={6} />;

  const modules = [
    { href: "/admin/feature-flags", label: "Feature Flags", icon: <Flag className="h-5 w-5" />, desc: "LaunchDarkly-style rollouts & A/B tests", permission: "flags:read" },
    { href: "/admin/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, desc: "Campaigns, templates & analytics", permission: "notifications:read" },
    { href: "/admin/feedback", label: "Feedback", icon: <MessageSquare className="h-5 w-5" />, desc: "AI-triaged tickets & insights", permission: "feedback:read" },
    { href: "/admin/content", label: "Content", icon: <FileText className="h-5 w-5" />, desc: "CMS, versioning & SEO", permission: "content:read" },
    { href: "/admin/system", label: "System", icon: <Activity className="h-5 w-5" />, desc: "Monitoring, alerts & incidents", permission: "system:read" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Enterprise Control Center"
        subtitle="Unified operations across flags, messaging, feedback, content and infrastructure"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="Feature Flags" value={data.flags.total} icon={<Flag className="h-4 w-4" />} accent="var(--accent)" />
        <AdminStatCard label="Campaigns" value={data.notifications.totalCampaigns} delta={`${data.notifications.deliveryRate}% delivery`} icon={<Bell className="h-4 w-4" />} accent="var(--accent-secondary)" />
        <AdminStatCard label="Open Feedback" value={data.feedback.open} icon={<MessageSquare className="h-4 w-4" />} accent="var(--warning)" />
        <AdminStatCard label="System Health" value={`${data.system.healthScore}`} icon={<Activity className="h-4 w-4" />} accent={data.system.healthScore >= 90 ? "var(--success)" : "var(--warning)"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Modules</h3>
          <div className="space-y-2">
            {modules.filter((m) => !m.permission || can(m.permission)).map((m) => (
              <Link key={m.href} href={m.href} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-glow)] text-[var(--accent)]">{m.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--foreground)]">{m.label}</p>
                    <p className="text-[10px] text-[var(--foreground-subtle)]">{m.desc}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--foreground-subtle)]" />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Service Health</h3>
          <div className="space-y-2">
            {data.system.services.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
                <span className="text-xs text-[var(--foreground)]">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--foreground-subtle)]">{s.latencyMs}ms</span>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Audit Activity</h3>
          {can("audit:read") && <Link href="/admin/audit" className="text-[10px] font-semibold text-[var(--accent)]">View all</Link>}
        </div>
        <div className="space-y-1.5">
          {data.audit.items.length === 0 && <p className="text-xs text-[var(--foreground-subtle)]">No recent activity.</p>}
          {data.audit.items.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[11px]">
              <span className="text-[var(--foreground-muted)]">
                <span className="font-semibold text-[var(--foreground)]">{a.actorEmail}</span> {a.action} {a.resource}
              </span>
              <span className="text-[var(--foreground-subtle)]">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
