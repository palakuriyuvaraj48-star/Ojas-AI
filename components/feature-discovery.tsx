"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export type DiscoveryFeature = {
  title: string;
  description: string;
  href?: string;
  icon: LucideIcon;
  status?: "Available" | "Experimental" | "Demo";
  onOpen?: () => void;
};

export function FeatureDiscoverySection({ eyebrow, title, description, features }: { eyebrow: string; title: string; description: string; features: DiscoveryFeature[] }) {
  return (
    <section aria-labelledby={`${eyebrow}-title`} className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--accent)]">{eyebrow}</p>
        <h2 id={`${eyebrow}-title`} className="mt-1 text-xl font-bold text-[var(--foreground)]">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--foreground-muted)]">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => <FeatureDiscoveryCard key={feature.title} feature={feature} />)}
      </div>
    </section>
  );
}

function FeatureDiscoveryCard({ feature }: { feature: DiscoveryFeature }) {
  const Icon = feature.icon;
  const contents = <>
    <div className="flex items-start justify-between gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]"><Icon className="h-4 w-4" /></span>{feature.status && <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-[var(--foreground-muted)]">{feature.status}</span>}</div>
    <div className="mt-4"><h3 className="text-sm font-bold text-[var(--foreground)]">{feature.title}</h3><p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">{feature.description}</p></div>
    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)]">Open feature <ArrowUpRight className="h-3.5 w-3.5" /></span>
  </>;
  const className = "flex min-h-48 flex-col p-5 transition hover:border-[var(--accent)]/35 focus-within:ring-2 focus-within:ring-[var(--accent)]";
  if (feature.onOpen) return <GlassCard className={className}><button type="button" onClick={feature.onOpen} className="text-left focus:outline-none">{contents}</button></GlassCard>;
  return <GlassCard className={className}><Link href={feature.href || "/features"} className="flex h-full flex-col rounded-md focus:outline-none">{contents}</Link></GlassCard>;
}
