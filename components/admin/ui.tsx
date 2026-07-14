"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Modal } from "@/components/ui/modal";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { AdminUserInfo } from "@/providers/admin-auth-provider";

// ─── Page header ─────────────────────────────────────────────────────────────
export function AdminPageHeader({
  title, subtitle, icon, actions,
}: { title: string; subtitle?: string; icon?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-glow)] text-[var(--accent)]">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
export function AdminStatCard({
  label, value, delta, icon, accent = "var(--accent)", hint,
}: { label: string; value: string | number; delta?: string; icon?: React.ReactNode; accent?: string; hint?: string }) {
  return (
    <Card className="relative overflow-hidden" padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--foreground)]">{value}</p>
          {delta && <p className="mt-1 text-[10px] font-semibold text-emerald-400">{delta}</p>}
          {hint && <p className="mt-1 text-[10px] text-[var(--foreground-subtle)]">{hint}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Status / variant badge ──────────────────────────────────────────────────
const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "neutral"> = {
  active: "success", published: "success", operational: "success", resolved: "success", open: "primary",
  inactive: "neutral", draft: "neutral", archived: "neutral", scheduled: "warning", paused: "warning",
  degraded: "warning", investigating: "warning", pending: "warning", review: "warning", approved: "warning",
  down: "danger", failed: "danger", critical: "danger", rejected: "danger", closed: "danger", major: "danger",
  sent: "primary", sending: "primary", running: "primary", identified: "warning", monitoring: "success",
};

export function StatusBadge({ status }: { status: string }) {
  const v = STATUS_VARIANT[status] ?? "neutral";
  return <Badge label={status.replace(/_/g, " ")} variant={v} />;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-white/15"} ${disabled ? "opacity-50" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-[#131315] transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

// ─── Permission gate ─────────────────────────────────────────────────────────
export function PermissionGate({
  user, permission, children, fallback,
}: { user: AdminUserInfo | null; permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const allowed = !!user?.permissions.includes(permission) || user?.role === "super_admin";
  if (!allowed) return <>{fallback ?? null}</>;
  return <>{children}</>;
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({
  open, title, description, confirmLabel = "Confirm", onConfirm, onClose, danger,
}: {
  open: boolean; title: string; description?: string; confirmLabel?: string;
  onConfirm: () => void; onClose: () => void; danger?: boolean;
}) {
  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      {description && <p className="text-xs text-[var(--foreground-muted)] mb-4">{description}</p>}
      <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "premium"} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────
export function AdminLoading({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return <ErrorState message={message} onRetry={onRetry} />;
}

export function AdminEmpty({ icon, title, description, action }: { icon?: any; title: string; description?: string; action?: { label: string; onClick: () => void } }) {
  return <EmptyState icon={icon} title={title} description={description} action={action} />;
}

// ─── Locked overlay for insufficient permissions ──────────────────────────────
export function PermissionDenied({ permission }: { permission: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--danger-subtle)] text-[var(--danger)]">
        <Lock className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--foreground)]">Access restricted</h3>
      <p className="mt-1 text-xs text-[var(--foreground-muted)] max-w-xs">
        You need the <code className="rounded bg-white/10 px-1">{permission}</code> permission to view this section.
      </p>
    </div>
  );
}

export { Card, Button, Modal, motion };
