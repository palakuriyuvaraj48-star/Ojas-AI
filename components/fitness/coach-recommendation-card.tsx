"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Clock, ShieldCheck, Repeat, Gauge } from "lucide-react";
import { CoachRecommendation } from "@/lib/coach";

const CAT_ICON: Record<string, any> = {
  workout: TrendingUp,
  nutrition: Lightbulb,
  recovery: ShieldCheck,
  habit: Repeat,
  motivation: Gauge,
  plan: TrendingUp,
  insight: Lightbulb,
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "neutral",
  medium: "primary",
  high: "warning",
  critical: "danger",
} as any;

export function CoachRecommendationCard({ rec, index = 0 }: { rec: CoachRecommendation; index?: number }) {
  if (!rec) return null;
  const Icon = CAT_ICON[rec.category] || Lightbulb;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="p-4 space-y-3 border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-bold">{rec.category}</p>
              <h4 className="text-sm font-bold text-white leading-tight">{rec.title}</h4>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={(PRIORITY_COLOR[rec.priority] as any) || "primary"} label={`${rec.priority}`} />
            <span className="text-[9px] text-[var(--foreground-muted)]">Confidence {rec.confidence}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="rounded-xl bg-white/5 p-2 space-y-0.5">
            <p className="text-[var(--foreground-muted)] font-bold uppercase tracking-wide">Why</p>
            <p className="text-white/80 leading-snug">{rec.why}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2 space-y-0.5">
            <p className="text-[var(--foreground-muted)] font-bold uppercase tracking-wide">Benefit</p>
            <p className="text-white/80 leading-snug">{rec.expectedBenefit}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-2 space-y-0.5 flex items-start gap-1.5">
            <Clock className="h-3 w-3 mt-0.5 text-[var(--accent)]" />
            <div>
              <p className="text-[var(--foreground-muted)] font-bold uppercase tracking-wide">Effort</p>
              <p className="text-white/80 leading-snug">{rec.estimatedEffort}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-2 space-y-0.5">
            <p className="text-[var(--foreground-muted)] font-bold uppercase tracking-wide">Alternative</p>
            <p className="text-white/80 leading-snug">{rec.alternative}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
