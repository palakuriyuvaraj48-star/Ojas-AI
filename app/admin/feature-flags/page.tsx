"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Flag, Plus, Search, History, FlaskConical, SlidersHorizontal, Zap, ShieldOff,
  Archive, Trash2, RotateCcw, Power, PowerOff, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useAdminAuth } from "@/providers/admin-auth-provider";
import { adminFetch, AdminApiError } from "@/lib/admin/client";
import {
  AdminPageHeader, AdminStatCard, StatusBadge, AdminLoading, AdminError,
  PermissionDenied, Toggle, ConfirmDialog,
} from "@/components/admin/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/tabs";

interface Flag {
  id: string; key: string; name: string; description: string; type: string; status: string;
  defaultValue: string; killSwitch: boolean; tags: string[]; owner: string;
  rollout: { strategy: string; percentage: number; targeting: any; countries: string[]; platforms: string[] };
  variants: any[]; experiments: any[]; history: any[]; createdAt: string; updatedAt: string;
  deletedAt?: string; archivedAt?: string;
}

const STRATEGIES = ["global", "percentage", "beta", "segment", "region", "country", "state", "language", "platform", "version", "subscription", "role", "device", "time", "user-segment", "ab"];

export default function FeatureFlagsPage() {
  const { can } = useAdminAuth();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("flags");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Flag | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Flag | null>(null);
  const [confirm, setConfirm] = useState<{ id: string; action: string; label: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ flags: Flag[] }>("/api/admin/feature-flags?includeArchived=true");
      setFlags(data.flags);
    } catch (e: any) { setError(e?.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (can("flags:read")) load(); }, [can, load]);

  if (!can("flags:read")) return <PermissionDenied permission="flags:read" />;

  const filtered = flags.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase()));

  const runAction = async (id: string, action: string) => {
    try {
      await adminFetch(`/api/admin/feature-flags/${id}/action`, { method: "POST", body: JSON.stringify({ action }) });
      await load();
      setDetail(null);
    } catch (e: any) { setError(e?.message); }
  };

  const stats = {
    total: flags.filter((f) => !f.status.includes("archived") && !f.deletedAt).length,
    active: flags.filter((f) => f.status === "active").length,
    archived: flags.filter((f) => f.status === "archived" || f.deletedAt).length,
    experiments: flags.reduce((s, f) => s + f.experiments.length, 0),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Feature Flags"
        subtitle="LaunchDarkly-style rollouts, A/B testing & kill switches"
        icon={<Flag className="h-5 w-5" />}
        actions={can("flags:write") && (
          <Button variant="premium" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShowCreate(true); }}>New Flag</Button>
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminStatCard label="Total Flags" value={stats.total} icon={<Flag className="h-4 w-4" />} accent="var(--accent)" />
        <AdminStatCard label="Active" value={stats.active} icon={<Power className="h-4 w-4" />} accent="var(--success)" />
        <AdminStatCard label="Archived" value={stats.archived} icon={<Archive className="h-4 w-4" />} accent="var(--warning)" />
        <AdminStatCard label="Experiments" value={stats.experiments} icon={<FlaskConical className="h-4 w-4" />} accent="var(--accent-secondary)" />
      </div>

      <Tabs tabs={[
        { id: "flags", label: "Flags", icon: <Flag className="h-3.5 w-3.5" /> },
        { id: "experiments", label: "A/B Experiments", icon: <FlaskConical className="h-3.5 w-3.5" /> },
        { id: "history", label: "Rollout History", icon: <History className="h-3.5 w-3.5" /> },
        { id: "evaluator", label: "Evaluator", icon: <SlidersHorizontal className="h-3.5 w-3.5" /> },
      ]} activeTab={tab} onChange={setTab} />

      {loading ? <AdminLoading rows={6} /> : error ? <AdminError message={error} onRetry={load} /> : (
        <>
          {tab === "flags" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-subtle)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flags…" className="w-full rounded-xl border border-[var(--border)] bg-black/20 py-2.5 pl-9 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
              {filtered.map((f) => (
                <Card key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1" onClick={() => setDetail(f)} role="button">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">{f.name}</p>
                      <code className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[var(--foreground-muted)]">{f.key}</code>
                      {f.killSwitch && <Badge label="kill" variant="danger" />}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[var(--foreground-subtle)]">{f.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                      <StatusBadge status={f.status} />
                      <Badge label={f.rollout.strategy} variant="neutral" />
                      <span className="text-[var(--foreground-subtle)]">{f.rollout.percentage}% rollout</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Toggle checked={f.status === "active"} onChange={(v) => runAction(f.id, v ? "enable" : "disable")} label="active" />
                    <Button variant="ghost" size="sm" onClick={() => setDetail(f)}>View</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === "experiments" && <ExperimentsTab flags={flags} canEdit={can("flags:write")} onChanged={load} />}
          {tab === "history" && <HistoryTab flags={flags} />}
          {tab === "evaluator" && <EvaluatorTab />}
        </>
      )}

      {(showCreate || editing) && (
        <FlagEditor flag={editing} onClose={() => { setShowCreate(false); setEditing(null); }} onSaved={async () => { await load(); setShowCreate(false); setEditing(null); }} />
      )}

      {detail && <FlagDetail flag={detail} canWrite={can("flags:write")} onClose={() => setDetail(null)} onAction={runAction} onEdit={(f) => { setEditing(f); setDetail(null); setShowCreate(true); }} />}

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.label ?? "Confirm"}?`}
        description="This action is recorded in the audit log."
        confirmLabel={confirm?.label ?? "Confirm"}
        danger={["archive", "delete", "kill", "rollback"].includes(confirm?.action ?? "")}
        onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm) runAction(confirm.id, confirm.action); setConfirm(null); }}
      />
    </div>
  );
}

// ─── Experiments ──────────────────────────────────────────────────────────────
function ExperimentsTab({ flags, canEdit, onChanged }: { flags: Flag[]; canEdit: boolean; onChanged: () => void }) {
  const withExp = flags.filter((f) => f.experiments.length > 0);
  if (withExp.length === 0) return <p className="text-xs text-[var(--foreground-subtle)]">No experiments yet. Add an experiment from a flag's detail view.</p>;
  return (
    <div className="space-y-4">
      {withExp.map((f) => (
        <Card key={f.id} className="p-4">
          <p className="mb-2 text-sm font-semibold text-[var(--foreground)]">{f.name} <code className="text-[10px] text-[var(--foreground-muted)]">{f.key}</code></p>
          {f.experiments.map((exp) => (
            <div key={exp.id} className="overflow-x-auto">
              <div className="mb-1 flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-[var(--accent-secondary)]" />
                <span className="text-xs font-medium text-[var(--foreground)]">{exp.name}</span>
                <StatusBadge status={exp.status} />
                {exp.winningVariantKey && <Badge label={`winner: ${exp.winningVariantKey}`} variant="success" />}
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[var(--foreground-subtle)]">
                    <th className="text-left p-1.5">Variant</th><th>Exposure</th><th>Conv.</th><th>Retention</th><th>Engagement</th><th>Revenue</th><th>Workout</th><th>Nutrition</th>
                  </tr>
                </thead>
                <tbody>
                  {exp.metrics.map((m: any) => (
                    <tr key={m.variantKey} className={`border-t border-[var(--border-subtle)] ${m.variantKey === exp.winningVariantKey ? "bg-[var(--success-subtle)]" : ""}`}>
                      <td className="p-1.5 font-medium text-[var(--foreground)]">{m.variantKey}</td>
                      <td className="text-center text-[var(--foreground-muted)]">{m.exposure.toLocaleString()}</td>
                      <td className="text-center text-[var(--foreground-muted)]">{(m.conversionRate * 100).toFixed(0)}%</td>
                      <td className="text-center text-[var(--foreground-muted)]">{(m.retention * 100).toFixed(0)}%</td>
                      <td className="text-center text-[var(--foreground-muted)]">{(m.engagement * 100).toFixed(0)}%</td>
                      <td className="text-center text-[var(--foreground-muted)]">${m.revenue.toLocaleString()}</td>
                      <td className="text-center text-[var(--foreground-muted)]">{(m.workoutCompletion * 100).toFixed(0)}%</td>
                      <td className="text-center text-[var(--foreground-muted)]">{(m.nutritionCompletion * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// ─── History ─────────────────────────────────────────────────────────────────
function HistoryTab({ flags }: { flags: Flag[] }) {
  const all = flags.flatMap((f) => (f.history ?? []).map((h) => ({ ...h, flag: f.name }))).sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Card className="divide-y divide-[var(--border-subtle)] overflow-hidden">
      {all.length === 0 && <p className="p-6 text-center text-xs text-[var(--foreground-subtle)]">No rollout history.</p>}
      {all.map((h) => (
        <div key={h.id} className="flex items-center justify-between px-4 py-2.5 text-[11px]">
          <div>
            <span className="font-semibold text-[var(--foreground)]">{h.flag}</span>{" "}
            <span className="text-[var(--accent)]">{h.action}</span>
            {h.note && <span className="text-[var(--foreground-subtle)]"> — {h.note}</span>}
          </div>
          <span className="text-[var(--foreground-subtle)]">{new Date(h.at).toLocaleString()}</span>
        </div>
      ))}
    </Card>
  );
}

// ─── Evaluator ───────────────────────────────────────────────────────────────
function EvaluatorTab() {
  const [ctx, setCtx] = useState({ userId: "demo_user_1", country: "US", language: "en", platform: "web", subscription: "pro", isPremium: true, isAdmin: false, isCoach: false });
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminFetch<{ results: any[] }>("/api/admin/feature-flags/evaluate", { method: "POST", body: JSON.stringify(ctx) });
      setResults(data.results);
    } catch (e: any) { setError(e?.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-bold text-[var(--foreground)]">Test Context</h3>
        {(["userId", "country", "language", "platform", "subscription"] as const).map((k) => (
          <input key={k} placeholder={k} value={(ctx as any)[k]} onChange={(e) => setCtx({ ...ctx, [k]: e.target.value })}
            className="w-full rounded-lg border border-[var(--border)] bg-black/20 p-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        ))}
        <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]"><input type="checkbox" checked={ctx.isPremium} onChange={(e) => setCtx({ ...ctx, isPremium: e.target.checked })} /> Premium</label>
        <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]"><input type="checkbox" checked={ctx.isAdmin} onChange={(e) => setCtx({ ...ctx, isAdmin: e.target.checked })} /> Admin</label>
        <label className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]"><input type="checkbox" checked={ctx.isCoach} onChange={(e) => setCtx({ ...ctx, isCoach: e.target.checked })} /> Coach</label>
        <Button variant="premium" size="sm" loading={loading} onClick={evaluate} className="w-full">Evaluate</Button>
      </Card>
      <Card className="overflow-hidden p-0">
        {error && <p className="p-4 text-xs text-[var(--danger)]">{error}</p>}
        {!results && !error && <p className="p-6 text-center text-xs text-[var(--foreground-subtle)]">Configure a context and evaluate rollouts.</p>}
        {results && (
          <div className="divide-y divide-[var(--border-subtle)]">
            {results.map((r) => (
              <div key={r.key} className="flex items-center justify-between px-4 py-2.5 text-[11px]">
                <div>
                  <code className="text-[var(--foreground)]">{r.key}</code>
                  <span className="ml-2 text-[var(--foreground-subtle)]">{r.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.enabled ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> : <AlertTriangle className="h-4 w-4 text-[var(--foreground-subtle)]" />}
                  <span className="text-[var(--foreground-muted)]">{r.value}</span>
                  {r.variant && <Badge label={r.variant.key} variant="primary" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Flag editor ─────────────────────────────────────────────────────────────
function FlagEditor({ flag, onClose, onSaved }: { flag: Flag | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    key: flag?.key ?? "", name: flag?.name ?? "", description: flag?.description ?? "",
    type: flag?.type ?? "boolean", status: flag?.status ?? "draft",
    defaultValue: flag?.defaultValue ?? "false",
    strategy: flag?.rollout?.strategy ?? "percentage", percentage: flag?.rollout?.percentage ?? 0,
    premiumOnly: flag?.rollout?.targeting?.premiumOnly ?? false,
    newUsersOnly: flag?.rollout?.targeting?.newUsersOnly ?? false,
    coachesOnly: flag?.rollout?.targeting?.coachesOnly ?? false,
    adminsOnly: flag?.rollout?.targeting?.adminsOnly ?? false,
    segments: flag?.rollout?.targeting?.segments?.join(", ") ?? "",
    countries: (flag?.rollout?.countries ?? []).join(", "),
    platforms: (flag?.rollout?.platforms ?? []).join(", "),
    killSwitch: flag?.killSwitch ?? false,
    tags: (flag?.tags ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true); setError(null);
    const payload = {
      key: form.key, name: form.name, description: form.description, type: form.type, status: form.status,
      defaultValue: form.defaultValue, killSwitch: form.killSwitch, tags: form.tags.split(",").map((s: string) => s.trim()).filter(Boolean),
      rollout: {
        strategy: form.strategy, percentage: Number(form.percentage),
        targeting: {
          userIds: [], userGroups: [], premiumOnly: form.premiumOnly, newUsersOnly: form.newUsersOnly,
          returningUsersOnly: false, coachesOnly: form.coachesOnly, adminsOnly: form.adminsOnly,
          segments: form.segments.split(",").map((s: string) => s.trim()).filter(Boolean),
        },
        regions: [], countries: form.countries.split(",").map((s: string) => s.trim()).filter(Boolean), states: [], languages: [],
        platforms: form.platforms.split(",").map((s: string) => s.trim()).filter(Boolean), versions: [], subscriptions: [], roles: [], devices: [], timeWindow: null,
      },
    };
    try {
      if (flag) await adminFetch(`/api/admin/feature-flags/${flag.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await adminFetch("/api/admin/feature-flags", { method: "POST", body: JSON.stringify(payload) });
      onSaved();
    } catch (e: any) { setError(e?.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={flag ? "Edit Flag" : "New Feature Flag"} size="lg">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Key (snake_case)" value={form.key} disabled={!!flag} onChange={(e) => setForm({ ...form, key: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50" />
          <input placeholder="Display name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" rows={2} />
        <div className="grid gap-3 sm:grid-cols-3">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            <option value="boolean">Boolean</option><option value="string">String</option><option value="json">JSON</option><option value="variant">Variant</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            <option value="draft">Draft</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="archived">Archived</option>
          </select>
          <input placeholder="Default value" value={form.defaultValue} onChange={(e) => setForm({ ...form, defaultValue: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Rollout Strategy</label>
          <select value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-black/35 p-2.5 text-xs text-[var(--foreground)]">
            {STRATEGIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Percentage Rollout</label>
            <span className="text-xs font-bold text-[var(--accent)]">{form.percentage}%</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input placeholder="Segments (comma)" value={form.segments} onChange={(e) => setForm({ ...form, segments: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
          <input placeholder="Countries (comma)" value={form.countries} onChange={(e) => setForm({ ...form, countries: e.target.value })} className="rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        </div>
        <input placeholder="Platforms (comma: android,ios,web,desktop)" value={form.platforms} onChange={(e) => setForm({ ...form, platforms: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        <div className="flex flex-wrap gap-3 text-[11px] text-[var(--foreground-muted)]">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.premiumOnly} onChange={(e) => setForm({ ...form, premiumOnly: e.target.checked })} /> Premium only</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.newUsersOnly} onChange={(e) => setForm({ ...form, newUsersOnly: e.target.checked })} /> New users</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.coachesOnly} onChange={(e) => setForm({ ...form, coachesOnly: e.target.checked })} /> Coaches</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.adminsOnly} onChange={(e) => setForm({ ...form, adminsOnly: e.target.checked })} /> Admins</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={form.killSwitch} onChange={(e) => setForm({ ...form, killSwitch: e.target.checked })} /> Kill switch</label>
        </div>
        <input placeholder="Tags (comma)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]" />
        {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
        <Button variant="premium" size="md" loading={saving} onClick={save} className="w-full">Save Flag</Button>
      </div>
    </Modal>
  );
}

// ─── Flag detail ─────────────────────────────────────────────────────────────
function FlagDetail({ flag, canWrite, onClose, onAction, onEdit }: { flag: Flag; canWrite: boolean; onClose: () => void; onAction: (id: string, action: string) => void; onEdit: (f: Flag) => void }) {
  return (
    <Modal isOpen onClose={onClose} title={flag.name} size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={flag.status} />
          <Badge label={flag.type} variant="neutral" />
          <Badge label={flag.rollout.strategy} variant="neutral" />
          {flag.killSwitch && <Badge label="kill switch" variant="danger" />}
        </div>
        <p className="text-xs text-[var(--foreground-muted)]">{flag.description}</p>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3 text-[11px]">
          <p className="font-semibold text-[var(--foreground)] mb-1">Rollout Configuration</p>
          <p className="text-[var(--foreground-muted)]">Percentage: <span className="text-[var(--foreground)]">{flag.rollout.percentage}%</span></p>
          <p className="text-[var(--foreground-muted)]">Targeting segments: <span className="text-[var(--foreground)]">{(flag.rollout.targeting?.segments ?? []).join(", ") || "—"}</span></p>
          <p className="text-[var(--foreground-muted)]">Countries: <span className="text-[var(--foreground)]">{(flag.rollout.countries ?? []).join(", ") || "—"}</span></p>
        </div>
        {flag.experiments.length > 0 && (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-white/5 p-3">
            <p className="mb-1 text-[11px] font-semibold text-[var(--foreground)]">Experiments</p>
            {flag.experiments.map((e) => (
              <p key={e.id} className="text-[11px] text-[var(--foreground-muted)]">{e.name} — {e.status} {e.winningVariantKey && <span className="text-[var(--success)]">· winner: {e.winningVariantKey}</span>}</p>
            ))}
          </div>
        )}
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="glass" icon={<Power className="h-3.5 w-3.5" />} onClick={() => onAction(flag.id, "enable")}>Enable</Button>
            <Button size="sm" variant="ghost" icon={<PowerOff className="h-3.5 w-3.5" />} onClick={() => onAction(flag.id, "disable")}>Disable</Button>
            <Button size="sm" variant="ghost" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={() => onAction(flag.id, "rollback")}>Rollback</Button>
            <Button size="sm" variant="danger" icon={<ShieldOff className="h-3.5 w-3.5" />} onClick={() => onAction(flag.id, "kill")}>Kill</Button>
            <Button size="sm" variant="ghost" icon={<Archive className="h-3.5 w-3.5" />} onClick={() => onAction(flag.id, "archive")}>Archive</Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(flag)}>Edit</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
