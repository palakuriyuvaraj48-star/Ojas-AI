"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FileText, Plus, Search, Sparkles, History, CalendarClock, Eye, Trash2, CheckCircle2, Globe } from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch } from "@/lib/admin/client";
import { AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError, PermissionDenied } from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";

interface Content { id: string; kind: string; title: string; slug: string; body: string; excerpt?: string; status: string;
  categories: string[]; tags: string[]; locale: string; version: number; versions: any[]; seo: any;
  scheduledPublishAt?: string; author: string; createdAt: string; updatedAt: string; aiSummary?: string; aiSeoSuggestions?: any; }

const KINDS = ["exercise","workout_program","workout_plan","video","recipe","nutrition_plan","article","challenge","badge","achievement","course","guide","faq","translation"];

export default function ContentPage() {
  const { can } = useAdminAuth();
  const [tab, setTab] = useState("library");
  if (!can("content:read")) return <PermissionDenied permission="content:read" />;
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Content Management" subtitle="Multi-language CMS with versioning, SEO & AI assist" icon={<FileText className="h-5 w-5" />} />
      <Tabs tabs={[
        { id: "library", label: "Library", icon: <FileText className="h-3.5 w-3.5" /> },
        { id: "seo", label: "SEO Health", icon: <Eye className="h-3.5 w-3.5" /> },
      ]} activeTab={tab} onChange={setTab} />
      {tab === "library" && <LibraryTab canWrite={can("content:write")} canPublish={can("content:publish")} canDelete={can("content:delete")} />}
      {tab === "seo" && <SeoTab />}
    </div>
  );
}

function LibraryTab({ canWrite, canPublish, canDelete }: { canWrite: boolean; canPublish: boolean; canDelete: boolean }) {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ kind: "", status: "", search: "" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Content | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.kind) p.set("kind", filters.kind);
    if (filters.status) p.set("status", filters.status);
    if (filters.search) p.set("search", filters.search);
    try { const d = await adminFetch<{ items: Content[] }>(`/api/admin/content?${p}`); setItems(d.items); }
    catch (e: any) { setError(e?.message); } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} items?`)) return;
    for (const id of selected) await adminFetch(`/api/admin/content/${id}`, { method: "DELETE" }).catch(() => {});
    setSelected(new Set()); await load();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-subtle)]" />
          <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search content…" className="w-full rounded-xl border border-[var(--border)] bg-black/20 py-2 pl-9 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 px-2 py-2 text-xs text-[var(--foreground)]">
          <option value="">All kinds</option>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 px-2 py-2 text-xs text-[var(--foreground)]">
          <option value="">All statuses</option>{["draft","review","approved","published","archived"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {canWrite && <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShow(true); }}>New</Button>}
        {canDelete && selected.size > 0 && <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={bulkDelete}>Delete ({selected.size})</Button>}
      </div>

      {loading ? <AdminLoading rows={8} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
          {items.map((c) => (
            <div key={c.id} className="flex cursor-pointer items-center gap-3 px-4 py-3" onClick={() => { setEditing(c); setShow(true); }}>
              <input type="checkbox" checked={selected.has(c.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(c.id)} className="accent-[var(--accent)]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{c.title}</p>
                  <Badge label={c.kind} variant="neutral" />
                  <Badge label={c.locale} variant="neutral" />
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-0.5 truncate text-[11px] text-[var(--foreground-subtle)]">/{c.slug} · v{c.version} · {c.author}</p>
              </div>
              {c.scheduledPublishAt && <Badge label="scheduled" variant="warning" />}
            </div>
          ))}
          {items.length === 0 && <p className="p-6 text-center text-xs text-[var(--foreground-subtle)]">No content found.</p>}
        </Card>
      )}
      {show && <ContentEditor content={editing} canPublish={canPublish} onClose={() => { setShow(false); setEditing(null); }} onSaved={load} />}
    </div>
  );
}

function ContentEditor({ content, canPublish, onClose, onSaved }: { content: Content | null; canPublish: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: content?.title ?? "", kind: content?.kind ?? "article", body: content?.body ?? "",
    excerpt: content?.excerpt ?? "", locale: content?.locale ?? "en", status: content?.status ?? "draft",
    categories: (content?.categories ?? []).join(", "), tags: (content?.tags ?? []).join(", "),
    slug: content?.seo?.slug ?? "", metaTitle: content?.seo?.metaTitle ?? "", metaDescription: content?.seo?.metaDescription ?? "",
    ogTitle: content?.seo?.openGraph?.title ?? "", ogDescription: content?.seo?.openGraph?.description ?? "",
  });
  const [local, setLocal] = useState<Content | null>(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("content");

  const payload = () => ({
    title: form.title, kind: form.kind, body: form.body, excerpt: form.excerpt, locale: form.locale, status: form.status,
    categories: form.categories.split(",").map((s) => s.trim()).filter(Boolean),
    tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
    seo: { metaTitle: form.metaTitle, metaDescription: form.metaDescription, slug: form.slug, openGraph: { title: form.ogTitle, description: form.ogDescription }, structuredData: undefined },
  });

  const save = async () => {
    setSaving(true); setError(null);
    try {
      if (content) { const d = await adminFetch<{ item: Content }>(`/api/admin/content/${content.id}`, { method: "PATCH", body: JSON.stringify(payload()) }); setLocal(d.item); }
      else { const d = await adminFetch<{ item: Content }>("/api/admin/content", { method: "POST", body: JSON.stringify(payload()) }); setLocal(d.item); }
      onSaved();
    } catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };

  const transition = async (status: string) => {
    if (!content) { setForm({ ...form, status }); return; }
    setSaving(true);
    try { const d = await adminFetch<{ item: Content }>(`/api/admin/content/${content.id}/status`, { method: "POST", body: JSON.stringify({ status }) }); setLocal(d.item); setForm({ ...form, status: d.item.status }); await onSaved(); }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };
  const ai = async (field: "summary" | "seo") => {
    if (!content) return;
    setSaving(true);
    try { const d = await adminFetch<{ item: Content }>(`/api/admin/content/${content.id}/ai`, { method: "POST", body: JSON.stringify({ field }) }); setLocal(d.item); if (field === "seo" && d.item.aiSeoSuggestions) { setForm((f) => ({ ...f, metaTitle: d.item.aiSeoSuggestions.metaTitle, metaDescription: d.item.aiSeoSuggestions.metaDescription, slug: d.item.aiSeoSuggestions.slug })); } }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };
  const restore = async (version: number) => {
    if (!content) return;
    setSaving(true);
    try { const d = await adminFetch<{ item: Content }>(`/api/admin/content/${content.id}/version`, { method: "POST", body: JSON.stringify({ version }) }); setLocal(d.item); setForm({ ...form, body: d.item.body }); await onSaved(); }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };
  const schedule = async () => {
    if (!content) return;
    const at = prompt("Schedule publish at (ISO):", new Date(Date.now() + 86400000).toISOString());
    if (!at) return;
    setSaving(true);
    try { const d = await adminFetch<{ item: Content }>(`/api/admin/content/${content.id}/schedule`, { method: "POST", body: JSON.stringify({ at }) }); setLocal(d.item); await onSaved(); }
    catch (e: any) { setError(e?.message); } finally { setSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={content ? "Edit Content" : "New Content"} size="lg">
      <div className="space-y-3">
        <div className="flex gap-1 rounded-xl bg-black/30 p-1 border border-[var(--border-subtle)]">
          {["content","seo","versions","workflow"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold ${tab === t ? "bg-[var(--accent-glow)] text-[var(--accent)]" : "text-[var(--foreground-muted)]"}`}>{t}</button>
          ))}
        </div>

        {tab === "content" && (
          <div className="space-y-3">
            <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
              <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">{["en","es","fr","de","hi","ja"].map((l) => <option key={l} value={l}>{l}</option>)}</select>
            </div>
            <textarea placeholder="Body (Markdown / rich text)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Categories (comma)" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
              <input placeholder="Tags (comma)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-3">
            <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <input placeholder="Meta Title (<60)" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <textarea placeholder="Meta Description (<160)" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <input placeholder="OG Title" value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <input placeholder="OG Description" value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
            <Button size="sm" variant="outline" icon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => ai("seo")} disabled={!content}>AI SEO Optimize</Button>
            {local?.aiSeoSuggestions && <p className="text-[10px] text-[var(--success)]">AI suggestions applied — review fields above.</p>}
          </div>
        )}

        {tab === "versions" && (
          <div className="space-y-2">
            {!content && <p className="text-xs text-[var(--foreground-subtle)]">Save the content first to track versions.</p>}
            {(local?.versions ?? []).map((v) => (
              <div key={v.version} className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-white/5 p-2.5">
                <div className="text-[11px]"><span className="font-semibold text-[var(--foreground)]">v{v.version}</span> · {v.changedBy} · {new Date(v.changedAt).toLocaleString()}</div>
                <Button size="sm" variant="ghost" onClick={() => restore(v.version)}>Restore</Button>
              </div>
            ))}
            {(local?.versions ?? []).length === 0 && content && <p className="text-xs text-[var(--foreground-subtle)]">No prior versions yet.</p>}
          </div>
        )}

        {tab === "workflow" && (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--foreground-muted)]">Current status: <StatusBadge status={form.status} /></p>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="ghost" onClick={() => transition("review")}>Submit for Review</Button>
              <Button size="sm" variant="ghost" onClick={() => transition("approved")}>Approve</Button>
              {canPublish && <Button size="sm" variant="premium" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => transition("published")}>Publish</Button>}
              <Button size="sm" variant="ghost" onClick={transition.bind(null, "archived") as any}>Archive</Button>
            </div>
            <Button size="sm" variant="outline" icon={<CalendarClock className="h-3.5 w-3.5" />} onClick={schedule}>Schedule Publish</Button>
            {content && <Button size="sm" variant="outline" icon={<Sparkles className="h-3.5 w-3.5" />} onClick={() => ai("summary")}>AI Summary</Button>}
            {local?.aiSummary && <p className="rounded-lg bg-[var(--accent-glow)] p-2.5 text-[11px] text-[var(--foreground)]">{local.aiSummary}</p>}
          </div>
        )}

        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="premium" size="sm" loading={saving} onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}

function SeoTab() {
  const [items, setItems] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch<{ items: Content[] }>("/api/admin/content").then((d) => setItems(d.items)).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <AdminLoading rows={6} />;
  const issues = items.filter((c) => !c.seo.metaTitle || !c.seo.metaDescription || c.seo.metaTitle.length > 60 || c.seo.metaDescription.length > 160);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <AdminStatCard label="Total Content" value={items.length} icon={<FileText className="h-4 w-4" />} accent="var(--accent)" />
      <AdminStatCard label="Published" value={items.filter((c) => c.status === "published").length} icon={<CheckCircle2 className="h-4 w-4" />} accent="var(--success)" />
      <AdminStatCard label="SEO Issues" value={issues.length} icon={<Eye className="h-4 w-4" />} accent="var(--warning)" />
      <Card className="p-5 lg:col-span-3">
        <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">SEO Audit</h3>
        <div className="space-y-2">
          {items.map((c) => {
            const problems: string[] = [];
            if (!c.seo.metaTitle) problems.push("missing meta title");
            if (c.seo.metaTitle.length > 60) problems.push("title > 60 chars");
            if (!c.seo.metaDescription) problems.push("missing description");
            if (c.seo.metaDescription.length > 160) problems.push("description > 160 chars");
            return (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
                <div>
                  <p className="text-xs font-medium text-[var(--foreground)]">{c.title}</p>
                  <p className="text-[10px] text-[var(--foreground-subtle)]">/{c.slug}</p>
                </div>
                <div className="text-right">
                  {problems.length === 0 ? <Badge label="ok" variant="success" /> : <span className="text-[10px] text-[var(--warning)]">{problems.join(", ")}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
