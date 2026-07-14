"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MessageSquare, Plus, BarChart3, Download, Search, Sparkles, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError, PermissionDenied } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";
import { Chart } from "@/components/ui/chart";
import { AICard } from "@/components/ui/ai-card";

interface Feedback { id: string; type: string; subject: string; description: string; category: string; priority: string;
  severity: string; sentiment: string; status: string; assignee: string; aiSummary?: string; suggestedResponse?: string;
  duplicateOf?: string | null; rating?: number; createdAt: string; submitterName?: string; }

const TYPES = ["bug","feature","rating","review","ticket","suggestion","complaint","crash"];
const STATUSES = ["open","in_progress","pending","resolved","closed","rejected","duplicate"];
const ASSIGNEES = ["support","developer","coach","moderator","unassigned"];

export default function FeedbackPage() {
  const { can } = useAdminAuth();
  const [tab, setTab] = useState("inbox");
  if (!can("feedback:read")) return <PermissionDenied permission="feedback:read" />;
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Feedback Management" subtitle="AI-categorized support, bugs & feature requests" icon={<MessageSquare className="h-5 w-5" />} />
      <Tabs tabs={[
        { id: "inbox", label: "Inbox", icon: <MessageSquare className="h-3.5 w-3.5" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
      ]} activeTab={tab} onChange={setTab} />
      {tab === "inbox" && <InboxTab canWrite={can("feedback:write")} />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

function InboxTab({ canWrite }: { canWrite: boolean }) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", sentiment: "", search: "" });
  const [show, setShow] = useState(false);
  const [detail, setDetail] = useState<Feedback | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ pageSize: "50" });
    if (filters.status) p.set("status", filters.status);
    if (filters.category) p.set("category", filters.category);
    if (filters.priority) p.set("priority", filters.priority);
    if (filters.sentiment) p.set("sentiment", filters.sentiment);
    if (filters.search) p.set("search", filters.search);
    try { const d = await adminFetch<{ items: Feedback[] }>(`/api/admin/feedback?${p}`); setItems(d.items); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-subtle)]" />
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search feedback…" className="w-full rounded-xl border border-[var(--border)] bg-black/20 py-2 pl-9 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 px-2 py-2 text-xs text-[var(--foreground)]">
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 px-2 py-2 text-xs text-[var(--foreground)]">
          <option value="">All categories</option>{["bug","performance","feature_request","payment","workout","nutrition","coach","subscription","ui","other"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 px-2 py-2 text-xs text-[var(--foreground)]">
          <option value="">All priorities</option>{["low","medium","high","urgent"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShow(true)}>New</Button>}
      </div>

      {loading ? <AdminLoading rows={8} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.id} className="flex cursor-pointer flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between bg-black/20 border border-white/5 rounded-xl hover:bg-black/30 transition text-left" onClick={() => setDetail(f)}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{f.subject}</p>
                  {f.duplicateOf && <Badge label="dup" variant="warning" />}
                  {f.rating && <span className="text-[10px] text-[var(--warning)]">★{f.rating}</span>}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--foreground-subtle)]">{f.description}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge label={f.category} variant="neutral" />
                  <Badge label={f.priority} variant={f.priority === "urgent" ? "danger" : f.priority === "high" ? "warning" : "neutral"} />
                  <Badge label={f.sentiment} variant={f.sentiment === "negative" ? "danger" : f.sentiment === "positive" ? "success" : "neutral"} />
                  <StatusBadge status={f.status} />
                </div>
              </div>
              <span className="shrink-0 text-[10px] text-[var(--foreground-subtle)]">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
          {items.length === 0 && <p className="py-10 text-center text-xs text-[var(--foreground-subtle)]">No feedback matches your filters.</p>}
        </div>
      )}

      {show && <FeedbackEditor onClose={() => setShow(false)} onSaved={load} />}
      {detail && <FeedbackDetail item={detail} canWrite={canWrite} onClose={() => setDetail(null)} onSaved={load} />}
    </div>
  );
}

function FeedbackEditor({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ type: "bug", subject: "", description: "", submitterName: "", submitterEmail: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    setSaving(true); setError(null);
    try { await adminFetch("/api/admin/feedback", { method: "POST", body: JSON.stringify(form) }); onSaved(); onClose(); }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };
  return (
    <Modal isOpen onClose={onClose} title="Submit / Log Feedback" size="lg">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Submitter name (optional)" value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <textarea placeholder="Description — AI will categorize, prioritize & detect duplicates" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <input placeholder="Submitter email (optional)" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Submit</Button>
      </div>
    </Modal>
  );
}

function FeedbackDetail({ item, canWrite, onClose, onSaved }: { item: Feedback; canWrite: boolean; onClose: () => void; onSaved: () => void }) {
  const [local, setLocal] = useState(item);
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);

  const patch = async (body: any) => {
    setBusy(true);
    try { const d = await adminFetch<{ item: Feedback }>(`/api/admin/feedback/${local.id}`, { method: "PATCH", body: JSON.stringify(body) }); setLocal(d.item); await onSaved(); }
    catch (e: any) { alert(e?.message); } finally { setBusy(false); }
  };
  const transition = async (body: any) => { setBusy(true); try { const d = await adminFetch<{ item: Feedback }>(`/api/admin/feedback/${local.id}/status`, { method: "POST", body: JSON.stringify(body) }); setLocal(d.item); await onSaved(); } catch (e: any) { alert(e?.message); } finally { setBusy(false); } };
  const respond = async () => { setBusy(true); try { const d = await adminFetch<{ item: Feedback }>(`/api/admin/feedback/${local.id}/respond`, { method: "POST", body: JSON.stringify({ response }) }); setLocal(d.item); setResponse(""); await onSaved(); } catch (e: any) { alert(e?.message); } finally { setBusy(false); } };

  return (
    <Modal isOpen onClose={onClose} title={local.subject} size="lg">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge label={local.category} variant="neutral" />
          <Badge label={local.priority} variant={local.priority === "urgent" ? "danger" : local.priority === "high" ? "warning" : "neutral"} />
          <Badge label={local.severity} variant="neutral" />
          <Badge label={local.sentiment} variant={local.sentiment === "negative" ? "danger" : local.sentiment === "positive" ? "success" : "neutral"} />
          <StatusBadge status={local.status} />
          <Badge label={`→ ${local.assignee}`} variant="primary" />
          {local.duplicateOf && <Badge label="duplicate" variant="warning" />}
        </div>
        <p className="text-xs text-[var(--foreground-muted)] whitespace-pre-wrap">{local.description}</p>

        {(local.aiSummary || local.suggestedResponse) && (
          <div className="space-y-2">
            {local.aiSummary && <AICard type="insight" title="AI Summary" message={local.aiSummary} />}
            {local.suggestedResponse && <AICard type="tip" title="Suggested Response" message={local.suggestedResponse} />}
          </div>
        )}

        {canWrite && (
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={local.status} disabled={busy} onChange={(e) => transition({ status: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={local.assignee} disabled={busy} onChange={(e) => patch({ assignee: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
              {ASSIGNEES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        <div className="rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
          <p className="mb-1.5 text-[11px] font-semibold text-[var(--foreground)]">Reply to user</p>
          <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="Write a response…" className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="premium" loading={busy} onClick={respond} disabled={!response.trim()}>Send & Resolve</Button>
            <Button size="sm" variant="ghost" onClick={() => transition({ status: "resolved" })}>Mark Resolved</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { adminFetch<any>("/api/admin/feedback/analytics").then(setData).catch((e) => setError(e?.message)).finally(() => setLoading(false)); }, []);

  const exportData = async (format: string) => {
    const res = await fetch(`/api/admin/feedback/export?format=${format}`, { credentials: "same-origin" });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `feedback-export.${format}`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <AdminLoading rows={5} />;
  if (error) return <AdminError message={error} />;
  const categoryData = Object.entries(data.byCategory as Record<string, number>).map(([name, value]) => ({ name, value }));
  const sentimentData = Object.entries(data.bySentiment as Record<string, number>).map(([name, value]) => ({ name, value }));
  const trendData = (data.trends as { date: string; count: number }[]).map((t) => ({ name: t.date.slice(5), value: t.count }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={() => exportData("csv")}>Export CSV</Button>
        <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={() => exportData("json")}>Export JSON</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="Total" value={data.total} icon={<MessageSquare className="h-4 w-4" />} accent="var(--accent)" />
        <AdminStatCard label="Open" value={data.byStatus.open ?? 0} icon={<AlertTriangle className="h-4 w-4" />} accent="var(--warning)" />
        <AdminStatCard label="Resolved" value={(data.byStatus.resolved ?? 0) + (data.byStatus.closed ?? 0)} icon={<CheckCircle2 className="h-4 w-4" />} accent="var(--success)" />
        <AdminStatCard label="Satisfaction" value={`${data.satisfactionScore}/5`} icon={<Sparkles className="h-4 w-4" />} accent="var(--accent-secondary)" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">By Category</h3>
          {categoryData.length > 0 ? <Chart type="bar" data={categoryData} height={220} color="#a78bfa" /> : <p className="text-xs text-[var(--foreground-subtle)]">No data.</p>}
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Sentiment</h3>
          {sentimentData.length > 0 ? <Chart type="pie" data={sentimentData} height={220} /> : <p className="text-xs text-[var(--foreground-subtle)]">No data.</p>}
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Submission Trend</h3>
        {trendData.length > 0 ? <Chart type="area" data={trendData} height={240} color="#34d399" /> : <p className="text-xs text-[var(--foreground-subtle)]">No data.</p>}
      </Card>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Avg Resolution" value={`${data.avgResolutionTimeHrs}h`} accent="var(--accent-secondary)" />
        <AdminStatCard label="Negative" value={data.bySentiment.negative ?? 0} accent="var(--danger)" />
        <AdminStatCard label="Feature Requests" value={data.topRequested?.[0]?.count ?? 0} accent="var(--warning)" />
      </div>
    </div>
  );
}
