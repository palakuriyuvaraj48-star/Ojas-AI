"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Activity, Server, Bell, AlertTriangle, Cpu, MemoryStick, Zap, DollarSign, Plus, Trash2, ShieldCheck, Settings, Radio } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError, PermissionDenied, Toggle } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Chart } from "@/components/ui/chart";
import { ProgressRing } from "@/components/ui/design-system";

interface Overview { healthScore: number; metric: any; services: any[]; alerts: { rules: any[]; triggered: any[] }; ai: any; }

export default function SystemPage() {
  const { can } = useAdminAuth();
  const [tab, setTab] = useState("overview");
  if (!can("system:read")) return <PermissionDenied permission="system:read" />;
  return (
    <div className="space-y-6">
      <AdminPageHeader title="System Monitoring" subtitle="Live infrastructure, alerts, incidents & AI usage" icon={<Activity className="h-5 w-5" />} />
      <Tabs tabs={[
        { id: "overview", label: "Overview", icon: <Activity className="h-3.5 w-3.5" /> },
        { id: "services", label: "Services", icon: <Server className="h-3.5 w-3.5" /> },
        { id: "alerts", label: "Alerts", icon: <Bell className="h-3.5 w-3.5" /> },
        { id: "incidents", label: "Incidents", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
        { id: "ai", label: "AI Usage", icon: <Zap className="h-3.5 w-3.5" /> },
        { id: "settings", label: "Config", icon: <Settings className="h-3.5 w-3.5" /> },
      ]} activeTab={tab} onChange={setTab} />
      {tab === "overview" && <OverviewTab />}
      {tab === "services" && <ServicesTab />}
      {tab === "alerts" && <AlertsTab canWrite={can("system:alerts")} />}
      {tab === "incidents" && <IncidentsTab canWrite={can("system:alerts")} />}
      {tab === "ai" && <AiUsageTab />}
      {tab === "settings" && <SettingsTab canWrite={can("system:write")} />}
    </div>
  );
}

function OverviewTab() {
  const [data, setData] = useState<Overview | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);

  const refresh = useCallback(async () => {
    try { const [o, m] = await Promise.all([adminFetch<Overview>("/api/admin/system/overview"), adminFetch<{ metrics: any[] }>("/api/admin/system/metrics?limit=60")]); setData(o); setHistory(m.metrics.map((x) => ({ name: new Date(x.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }), cpu: x.cpu, memory: x.memory, latency: x.latencyMs, requests: x.requestsPerSec }))); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (!auto) return; const id = setInterval(refresh, 5000); return () => clearInterval(id); }, [auto, refresh]);

  if (loading) return <AdminLoading rows={5} />;
  if (error) return <AdminError message={error} onRetry={refresh} />;
  if (!data) return null;
  const m = data.metric;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-[var(--foreground-muted)]">Auto-refresh every 5s</p>
        <Toggle checked={auto} onChange={setAuto} label="auto" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-4">
          <ProgressRing progress={data.healthScore} size={84} color={data.healthScore >= 90 ? "#34d399" : data.healthScore >= 70 ? "#fbbf24" : "#f87171"} />
          <p className="mt-2 text-xs font-semibold text-[var(--foreground)]">Health {data.healthScore}</p>
        </Card>
        <AdminStatCard label="CPU" value={`${m.cpu}%`} icon={<Cpu className="h-4 w-4" />} accent={m.cpu > 80 ? "var(--danger)" : "var(--accent)"} />
        <AdminStatCard label="Memory" value={`${m.memory}%`} icon={<MemoryStick className="h-4 w-4" />} accent={m.memory > 85 ? "var(--danger)" : "var(--accent-secondary)"} />
        <AdminStatCard label="API Latency" value={`${m.latencyMs}ms`} icon={<Radio className="h-4 w-4" />} accent="var(--success)" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">CPU / Memory %</h3>
          <Chart type="area" data={history} height={220} color="#a78bfa" />
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Requests / sec & Latency</h3>
          <Chart type="line" data={history} height={220} color="#34d399" />
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminStatCard label="Error Rate" value={`${m.errorRate}%`} accent={m.errorRate > 2 ? "var(--danger)" : "var(--success)"} />
        <AdminStatCard label="Active Conns" value={m.activeConnections} accent="var(--accent-secondary)" />
        <AdminStatCard label="Services Up" value={`${data.services.filter((s) => s.status === "operational").length}/${data.services.length}`} accent="var(--success)" />
        <AdminStatCard label="Triggered Alerts" value={data.alerts.triggered.length} accent={data.alerts.triggered.length ? "var(--danger)" : "var(--success)"} />
      </div>
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { const [s, st] = await Promise.all([adminFetch<any>("/api/admin/system/overview"), adminFetch<any>("/api/admin/system/status")]); setServices(s.services); setStatus(st); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <AdminLoading rows={6} />;
  if (error) return <AdminError message={error} onRetry={load} />;
  return (
    <div className="space-y-3">
      {status && <Card className="flex items-center justify-between p-4"><div className="flex items-center gap-2"><Server className="h-4 w-4 text-[var(--accent)]" /><span className="text-sm font-semibold text-[var(--foreground)]">Status: {status.status}</span></div><ProgressRing progress={status.healthScore} size={48} /></Card>}
      {services.map((s) => (
        <Card key={s.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">{s.name}</p>
              <Badge label={s.category} variant="neutral" />
            </div>
            <p className="mt-0.5 text-[10px] text-[var(--foreground-subtle)]">{s.uptimePct}% uptime · score {s.healthScore}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--foreground-muted)]">{s.latencyMs}ms</span>
            <StatusBadge status={s.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function AlertsTab({ canWrite }: { canWrite: boolean }) {
  const [rules, setRules] = useState<any[]>([]);
  const [triggered, setTriggered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminFetch<Overview>("/api/admin/system/overview"); setRules(d.alerts.rules); setTriggered(d.alerts.triggered); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string, enabled: boolean) => { await adminFetch(`/api/admin/system/alerts/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) }); load(); };
  const remove = async (id: string) => { if (!confirm("Delete alert?")) return; await adminFetch(`/api/admin/system/alerts/${id}`, { method: "DELETE" }); load(); };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShow(true)}>New Alert</Button>}
      </div>
      {triggered.length > 0 && (
        <Card className="border-[var(--danger)]/30 bg-[var(--danger-subtle)] p-3">
          <p className="mb-1 text-xs font-bold text-[var(--danger)]">Active alerts ({triggered.length})</p>
          {triggered.map((t, i) => <p key={i} className="text-[11px] text-[var(--foreground)]">{t.rule.name}: {t.rule.condition} = {t.value} (threshold {t.rule.threshold})</p>)}
        </Card>
      )}
      {loading ? <AdminLoading rows={5} /> : error ? <AdminError message={error} onRetry={load} /> : (
        rules.map((r) => (
          <Card key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">{r.name}</p>
                <Badge label={r.severity} variant={r.severity === "critical" ? "danger" : "warning"} />
              </div>
              <p className="mt-0.5 text-[10px] text-[var(--foreground-subtle)]">{r.condition} {r.operator} {r.threshold} → {r.channels.join(", ")}</p>
            </div>
            <Toggle checked={r.enabled} onChange={(v) => toggle(r.id, v)} label="enabled" />
          </Card>
        ))
      )}
      {show && <AlertEditor onClose={() => setShow(false)} onSaved={load} />}
    </div>
  );
}

function AlertEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", condition: "cpu_high", threshold: 85, operator: "gt", severity: "warning", channels: "email", webhookUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    setSaving(true); setError(null);
    try { await adminFetch("/api/admin/system/alerts", { method: "POST", body: JSON.stringify({ ...form, channels: form.channels.split(",").map((s) => s.trim()).filter(Boolean) }) }); onSaved(); onClose(); }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };
  return (
    <Modal isOpen onClose={onClose} title="New Alert Rule" size="lg">
      <div className="space-y-3">
        <input placeholder="Alert name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {["cpu_high","memory_high","db_down","api_down","ai_failure","payment_failure","storage_limit","queue_failure","auth_failure","notification_failure"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            <option value="gt">greater than</option><option value="gte">≥</option><option value="lt">less than</option><option value="lte">≤</option>
          </select>
        </div>
        <input type="number" placeholder="Threshold" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
          <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
        </select>
        <input placeholder="Channels (comma: email,push,sms,slack,discord)" value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <input placeholder="Webhook URL (optional)" value={form.webhookUrl} onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Create Alert</Button>
      </div>
    </Modal>
  );
}

function IncidentsTab({ canWrite }: { canWrite: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminFetch<{ incidents: any[] }>("/api/admin/system/incidents"); setItems(d.incidents); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShow(true)}>New Incident</Button>}
      </div>
      {loading ? <AdminLoading rows={5} /> : error ? <AdminError message={error} onRetry={load} /> : (
        items.map((inc) => (
          <Card key={inc.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div onClick={() => setDetail(inc)} className="cursor-pointer">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">{inc.title}</p>
                <Badge label={inc.severity} variant={inc.severity === "critical" ? "danger" : "warning"} />
                <StatusBadge status={inc.status} />
              </div>
              <p className="mt-0.5 text-[10px] text-[var(--foreground-subtle)]">Started {new Date(inc.startedAt).toLocaleString()} · {inc.timeline.length} updates</p>
            </div>
          </Card>
        ))
      )}
      {show && <IncidentEditor onClose={() => setShow(false)} onSaved={load} />}
      {detail && <IncidentDetail incident={detail} canWrite={canWrite} onClose={() => setDetail(null)} onSaved={load} />}
    </div>
  );
}

function IncidentEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: "", serviceId: "svc_api", severity: "major" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try { await adminFetch("/api/admin/system/incidents", { method: "POST", body: JSON.stringify(form) }); onSaved(); onClose(); }
    catch (e: any) { alert(e?.message); } finally { setSaving(false); }
  };
  return (
    <Modal isOpen onClose={onClose} title="New Incident">
      <div className="space-y-3">
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
          <option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option>
        </select>
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Open Incident</Button>
      </div>
    </Modal>
  );
}

function IncidentDetail({ incident, canWrite, onClose, onSaved }: { incident: any; canWrite: boolean; onClose: () => void; onSaved: () => void }) {
  const [local, setLocal] = useState(incident);
  const [msg, setMsg] = useState("");
  const [rootCause, setRootCause] = useState(incident.rootCause ?? "");
  const update = async (body: any) => { const d = await adminFetch<{ incident: any }>(`/api/admin/system/incidents/${local.id}`, { method: "PATCH", body: JSON.stringify(body) }); setLocal(d.incident); await onSaved(); };
  return (
    <Modal isOpen onClose={onClose} title={local.title} size="lg">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge label={local.severity} variant={local.severity === "critical" ? "danger" : "warning"} />
          <StatusBadge status={local.status} />
        </div>
        {canWrite && (
          <div className="space-y-2">
            <textarea placeholder="Post update…" value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { if (msg) { update({ message: msg, eventType: "update" }); setMsg(""); } }}>Add Update</Button>
              <Button size="sm" variant="ghost" onClick={() => update({ status: "resolved" })}>Resolve</Button>
            </div>
            <input placeholder="Root cause analysis" value={rootCause} onChange={(e) => setRootCause(e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <Button size="sm" variant="outline" onClick={() => update({ rootCause })}>Save Root Cause</Button>
          </div>
        )}
        <div className="space-y-1.5">
          {local.timeline.map((t: any) => (
            <div key={t.id} className="rounded-lg border border-[var(--border-subtle)] bg-white/5 p-2.5 text-[11px]">
              <p className="text-[var(--foreground)]">{t.message}</p>
              <p className="text-[10px] text-[var(--foreground-subtle)]">{t.author} · {new Date(t.at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function AiUsageTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { adminFetch<any>("/api/admin/system/ai-usage?limit=60").then(setData).catch((e) => setError(e?.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <AdminLoading rows={5} />;
  if (error) return <AdminError message={error} />;
  const usage = (data.usage as any[]).map((u) => ({ name: new Date(u.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), tokens: u.tokens, requests: u.requests, latency: u.latencyMs, cost: u.costUsd }));
  const modelData = data.latest ? Object.entries(data.latest.modelUsage as Record<string, number>).map(([name, value]) => ({ name, value })) : [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="Tokens" value={data.totals.tokens.toLocaleString()} icon={<Zap className="h-4 w-4" />} accent="var(--accent)" />
        <AdminStatCard label="Requests" value={data.totals.requests.toLocaleString()} icon={<Radio className="h-4 w-4" />} accent="var(--accent-secondary)" />
        <AdminStatCard label="Cost" value={`$${data.totals.cost.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} accent="var(--warning)" />
        <AdminStatCard label="Success Rate" value={`${data.latest?.successRate ?? 0}%`} icon={<ShieldCheck className="h-4 w-4" />} accent="var(--success)" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Tokens / Requests</h3><Chart type="area" data={usage} height={220} color="#a78bfa" /></Card>
        <Card className="p-5"><h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Model Usage</h3>{modelData.length ? <Chart type="pie" data={modelData} height={220} /> : <p className="text-xs text-[var(--foreground-subtle)]">No data.</p>}</Card>
      </div>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Live Snapshot</h3>
        {data.latest && (
          <div className="grid grid-cols-2 gap-3 text-[11px] sm:grid-cols-4">
            <div><p className="text-[var(--foreground-subtle)]">Latency</p><p className="font-semibold text-[var(--foreground)]">{data.latest.latencyMs}ms</p></div>
            <div><p className="text-[var(--foreground-subtle)]">Failure Rate</p><p className="font-semibold text-[var(--foreground)]">{data.latest.failureRate}%</p></div>
            <div><p className="text-[var(--foreground-subtle)]">Rate Limit</p><p className="font-semibold text-[var(--foreground)]">{data.latest.rateLimitRemaining}/{data.latest.rateLimitTotal}</p></div>
            <div><p className="text-[var(--foreground-subtle)]">Cost</p><p className="font-semibold text-[var(--foreground)]">${data.latest.costUsd}</p></div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SettingsTab({ canWrite }: { canWrite: boolean }) {
  const [config, setConfig] = useState<Record<string, string>>({ stripe_secret_key: "", gemini_api_key: "", sendgrid_key: "", slack_webhook: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { adminFetch<{ config: Record<string, string> }>("/api/admin/system/settings").then((d) => setConfig((c) => ({ ...c, ...d.config }))).catch(() => {}).finally(() => setLoading(false)); }, []);
  const save = async () => { setSaving(true); try { await adminFetch("/api/admin/system/settings", { method: "POST", body: JSON.stringify({ config }) }); } catch (e: any) { alert(e?.message); } finally { setSaving(false); } };
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--success)]" /><h3 className="text-sm font-bold text-[var(--foreground)]">Encrypted Configuration</h3></div>
      <p className="text-[10px] text-[var(--foreground-subtle)]">Values are encrypted at rest with AES-256-GCM. Masked in the UI.</p>
      {loading ? <AdminLoading rows={3} /> : (
        <div className="space-y-2">
          {Object.keys(config).map((k) => (
            <input key={k} placeholder={k} value={(config as any)[k]} onChange={(e) => setConfig({ ...config, [k]: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          ))}
          {canWrite && <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Save Encrypted</Button>}
        </div>
      )}
    </Card>
  );
}
