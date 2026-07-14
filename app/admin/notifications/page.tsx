"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bell, Plus, Send, FileText, BarChart3, Inbox, Calendar, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError, PermissionDenied } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";

interface Campaign { id: string; name: string; channel: string; status: string; title: string; body: string;
  audience: { segments: string[] }; schedule: { type: string; sendAt?: string; recurring?: any }; stats: any; createdAt: string; }
interface Template { id: string; key: string; name: string; channel: string; category: string; locale: string; title: string; body: string; subject?: string; variables: string[]; }
interface Log { id: string; campaignName: string; userId: string; channel: string; status: string; title: string; sentAt?: string; }

const CHANNELS = ["email", "push", "sms", "in_app", "desktop"];
const CATEGORIES = ["workout_reminder","meal_reminder","hydration_reminder","sleep_reminder","recovery_reminder","challenge_reminder","promotion","subscription","renewal","milestone","announcement","emergency"];
const SEGMENTS = ["all","premium","free","coaches","admins","inactive","active","new","returning","workout_streak","challenge_participants"];

export default function NotificationsPage() {
  const { can } = useAdminAuth();
  const [tab, setTab] = useState("campaigns");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!can("notifications:read")) return <PermissionDenied permission="notifications:read" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Notification Center" subtitle="Campaigns, templates, analytics & delivery queue" icon={<Bell className="h-5 w-5" />} />
      <Tabs tabs={[
        { id: "campaigns", label: "Campaigns", icon: <Send className="h-3.5 w-3.5" /> },
        { id: "templates", label: "Templates", icon: <FileText className="h-3.5 w-3.5" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
        { id: "queue", label: "Queue", icon: <Inbox className="h-3.5 w-3.5" /> },
        { id: "calendar", label: "Calendar", icon: <Calendar className="h-3.5 w-3.5" /> },
      ]} activeTab={tab} onChange={setTab} />

      {tab === "campaigns" && <CampaignsTab canWrite={can("notifications:write")} canSend={can("notifications:send")} />}
      {tab === "templates" && <TemplatesTab canWrite={can("notifications:write")} />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "queue" && <QueueTab />}
      {tab === "calendar" && <CalendarTab />}
    </div>
  );
}

function CampaignsTab({ canWrite, canSend }: { canWrite: boolean; canSend: boolean }) {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminFetch<{ campaigns: Campaign[] }>("/api/admin/notifications/campaigns"); setItems(d.campaigns); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const send = async (id: string) => {
    if (!confirm("Dispatch this campaign now?")) return;
    try { await adminFetch(`/api/admin/notifications/campaigns/${id}/send`, { method: "POST" }); await load(); }
    catch (e: any) { alert(e?.message); }
  };
  const retry = async (id: string) => {
    try { await adminFetch(`/api/admin/notifications/campaigns/${id}/retry`, { method: "POST" }); await load(); }
    catch (e: any) { alert(e?.message); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete campaign?")) return;
    try { await adminFetch(`/api/admin/notifications/campaigns/${id}`, { method: "DELETE" }); await load(); }
    catch (e: any) { alert(e?.message); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShow(true); }}>New Campaign</Button>}
      </div>
      {loading ? <AdminLoading rows={5} /> : error ? <AdminError message={error} onRetry={load} /> : (
        items.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">{c.name}</p>
                <Badge label={c.channel} variant="primary" />
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-0.5 truncate text-[11px] text-[var(--foreground-subtle)]">{c.title}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--foreground-muted)]">
                <span>👥 {(c.audience.segments.join(", ") || "none")}</span>
                <span>📨 {c.stats.recipientCount.toLocaleString()} recipients</span>
                <span>✅ {c.stats.delivered.toLocaleString()} delivered</span>
                <span>📖 {c.stats.opened.toLocaleString()} opened</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {canSend && c.status !== "sent" && <Button size="sm" variant="premium" icon={<Send className="h-3.5 w-3.5" />} onClick={() => send(c.id)}>Send</Button>}
              {canSend && c.status === "sent" && c.stats.failed > 0 && <Button size="sm" variant="outline" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => retry(c.id)}>Retry</Button>}
              {canWrite && <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setShow(true); }}>Edit</Button>}
              {canWrite && <button onClick={() => remove(c.id)} className="rounded-lg p-2 text-[var(--foreground-subtle)] hover:text-[var(--danger)]"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </Card>
        ))
      )}
      {show && <CampaignEditor campaign={editing} onClose={() => { setShow(false); setEditing(null); }} onSaved={load} />}
    </div>
  );
}

function CampaignEditor({ campaign, onClose, onSaved }: { campaign: Campaign | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: campaign?.name ?? "", channel: campaign?.channel ?? "push", title: campaign?.title ?? "",
    body: campaign?.body ?? "Hi {{user_name}}, ", scheduleType: campaign?.schedule?.type ?? "immediate",
    segments: (campaign?.audience?.segments ?? []).join(", "), sendAt: campaign?.schedule?.sendAt?.slice(0, 16) ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    const payload = {
      name: form.name, channel: form.channel, title: form.title, body: form.body,
      scheduleType: form.scheduleType, sendAt: form.sendAt ? new Date(form.sendAt).toISOString() : undefined,
      audience: { segments: form.segments.split(",").map((s) => s.trim()).filter(Boolean) },
    };
    try {
      if (campaign) await adminFetch(`/api/admin/notifications/campaigns/${campaign.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await adminFetch("/api/admin/notifications/campaigns", { method: "POST", body: JSON.stringify(payload) });
      onSaved(); onClose();
    } catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={campaign ? "Edit Campaign" : "New Campaign"} size="lg">
      <div className="space-y-3">
        <input placeholder="Campaign name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.scheduleType} onChange={(e) => setForm({ ...form, scheduleType: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            <option value="immediate">Immediate</option><option value="scheduled">Scheduled</option><option value="recurring">Recurring</option>
          </select>
        </div>
        <input placeholder="Title (use {{user_name}})" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <textarea placeholder="Body (supports {{variables}})" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <input placeholder="Audience segments (comma)" value={form.segments} onChange={(e) => setForm({ ...form, segments: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {form.scheduleType !== "immediate" && (
          <input type="datetime-local" value={form.sendAt} onChange={(e) => setForm({ ...form, sendAt: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        )}
        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Save Campaign</Button>
      </div>
    </Modal>
  );
}

function TemplatesTab({ canWrite }: { canWrite: boolean }) {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminFetch<{ templates: Template[] }>("/api/admin/notifications/templates"); setItems(d.templates); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => { if (!confirm("Delete template?")) return; try { await adminFetch(`/api/admin/notifications/templates/${id}`, { method: "DELETE" }); await load(); } catch (e: any) { alert(e?.message); } };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShow(true); }}>New Template</Button>}
      </div>
      {loading ? <AdminLoading rows={4} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                <Badge label={t.channel} variant="primary" />
              </div>
              <p className="mt-0.5 text-[10px] text-[var(--foreground-subtle)]">{t.category} · {t.locale} · {t.key}</p>
              <p className="mt-2 text-[11px] text-[var(--foreground-muted)] line-clamp-2">{t.body}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(t.variables ?? []).map((v) => <Badge key={v} label={v} variant="neutral" />)}
              </div>
              {canWrite && <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setShow(true); }}>Edit</Button>
                <button onClick={() => remove(t.id)} className="rounded-lg p-2 text-[var(--foreground-subtle)] hover:text-[var(--danger)]"><Trash2 className="h-4 w-4" /></button>
              </div>}
            </Card>
          ))}
        </div>
      )}
      {show && <TemplateEditor template={editing} onClose={() => { setShow(false); setEditing(null); }} onSaved={load} />}
    </div>
  );
}

function TemplateEditor({ template, onClose, onSaved }: { template: Template | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    key: template?.key ?? "", name: template?.name ?? "", channel: template?.channel ?? "push", category: template?.category ?? "announcement",
    locale: template?.locale ?? "en", title: template?.title ?? "", body: template?.body ?? "", subject: template?.subject ?? "",
    variables: (template?.variables ?? ["user_name"]).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    try {
      if (template) await adminFetch(`/api/admin/notifications/templates/${template.id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await adminFetch("/api/admin/notifications/templates", { method: "POST", body: JSON.stringify({ ...form, variables: form.variables.split(",").map((s) => s.trim()).filter(Boolean) }) });
      onSaved(); onClose();
    } catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={template ? "Edit Template" : "New Template"} size="lg">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Key" value={form.key} disabled={!!template} onChange={(e) => setForm({ ...form, key: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50" />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {["en","es","fr","de","hi","ja"].map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {form.channel === "email" && <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />}
        <textarea placeholder="Body ({{user_name}})" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <input placeholder="Variables (comma)" value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Save Template</Button>
      </div>
    </Modal>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    adminFetch<any>("/api/admin/notifications/analytics").then(setData).catch((e) => setError(e?.message)).finally(() => setLoading(false));
  }, []);
  if (loading) return <AdminLoading rows={4} />;
  if (error) return <AdminError message={error} />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="Campaigns" value={data.totalCampaigns} icon={<Bell className="h-4 w-4" />} accent="var(--accent)" />
        <AdminStatCard label="Delivery Rate" value={`${data.deliveryRate}%`} icon={<Send className="h-4 w-4" />} accent="var(--success)" />
        <AdminStatCard label="Open Rate" value={`${data.openRate}%`} icon={<Inbox className="h-4 w-4" />} accent="var(--accent-secondary)" />
        <AdminStatCard label="Conversion" value={`${data.conversionRate}%`} icon={<BarChart3 className="h-4 w-4" />} accent="var(--warning)" />
      </div>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Performance by Channel</h3>
        <div className="space-y-2">
          {Object.entries(data.byChannel as Record<string, any>).map(([ch, s]: any) => (
            <div key={ch} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
              <span className="text-xs font-medium text-[var(--foreground)]">{ch}</span>
              <div className="flex gap-3 text-[10px] text-[var(--foreground-muted)]">
                <span>Sent {s.sent}</span><span>Delivered {s.delivered}</span><span>Opened {s.opened}</span><span>Clicked {s.clicked}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminStatCard label="Unsubscribe" value={`${data.unsubscribeRate}%`} accent="var(--danger)" />
        <AdminStatCard label="Bounce" value={`${data.bounceRate}%`} accent="var(--warning)" />
        <AdminStatCard label="Scheduled" value={data.scheduledCampaigns} accent="var(--accent-secondary)" />
        <AdminStatCard label="Sent" value={data.sentCampaigns} accent="var(--success)" />
      </div>
    </div>
  );
}

function QueueTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try { const p = new URLSearchParams({ pageSize: "40" }); if (status) p.set("status", status); const d = await adminFetch<{ items: Log[] }>(`/api/admin/notifications/queue?${p}`); setLogs(d.items); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { load(); }, [load]);
  return (
    <div className="space-y-3">
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[var(--border)] bg-black/35 px-3 py-2 text-xs text-[var(--foreground)]">
        <option value="">All statuses</option>
        <option value="queued">Queued</option><option value="sent">Sent</option><option value="delivered">Delivered</option>
        <option value="opened">Opened</option><option value="clicked">Clicked</option><option value="failed">Failed</option><option value="bounced">Bounced</option>
      </select>
      {loading ? <AdminLoading rows={6} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-4 py-2.5 text-[11px]">
              <div className="min-w-0">
                <p className="truncate text-[var(--foreground)]"><span className="font-semibold">{l.campaignName}</span> → {l.userId}</p>
                <p className="truncate text-[var(--foreground-subtle)]">{l.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={l.channel} variant="neutral" />
                <StatusBadge status={l.status} />
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="p-6 text-center text-xs text-[var(--foreground-subtle)]">Queue is empty.</p>}
        </Card>
      )}
    </div>
  );
}

function CalendarTab() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch<{ campaigns: Campaign[] }>("/api/admin/notifications/campaigns").then((d) => setItems(d.campaigns.filter((c) => c.status === "scheduled" || c.schedule.type === "recurring"))).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <AdminLoading rows={4} />;
  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Scheduled & Recurring</h3>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-[var(--foreground-subtle)]">No scheduled campaigns.</p>}
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
            <div>
              <p className="text-xs font-medium text-[var(--foreground)]">{c.name}</p>
              <p className="text-[10px] text-[var(--foreground-subtle)]">{c.schedule.type} {c.schedule.sendAt ? `· ${new Date(c.schedule.sendAt).toLocaleString()}` : ""}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
