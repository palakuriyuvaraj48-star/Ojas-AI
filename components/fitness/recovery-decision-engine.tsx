"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { motion } from "framer-motion";
import { GitCompareArrows, ArrowUpRight, ArrowDownRight, Minus, Sparkles } from "lucide-react";

export function RecoveryDecisionEngine() {
  const { loading, decision } = useRecovery();
  if (loading || !decision) return null;

  return (
    <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-[var(--accent)]" /> Recovery Decision Engine
        </h3>
        <Badge variant={decision.changed ? "warning" : "success"} label={decision.changed ? "Changed" : "Stable"} />
      </div>

      <div className="flex items-center gap-3 text-xs">
        {decision.yesterdayDecision && (
          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white/60">
            Yesterday: {decision.yesterdayDecision}
          </span>
        )}
        <span className="text-[var(--foreground-muted)]">→</span>
        <span className="px-3 py-1.5 rounded-xl bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-[var(--accent)] font-bold">
          Today: {decision.todayDecision}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/80 leading-relaxed">
        {decision.summary}
      </div>

      {decision.deltas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Signal Changes (recovery points)</p>
          {decision.deltas.slice(0, 5).map((d, i) => {
            const Icon = d.direction === "improved" ? ArrowUpRight : d.direction === "worsened" ? ArrowDownRight : Minus;
            const color = d.direction === "improved" ? "text-emerald-400" : d.direction === "worsened" ? "text-rose-400" : "text-white/40";
            return (
              <motion.div
                key={d.factor}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <span className="text-[11px] text-white/80">{d.factor}</span>
                </div>
                <span className={`text-[11px] font-bold ${color}`}>
                  {d.change > 0 ? "+" : ""}{d.change}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-[9px] text-[var(--foreground-muted)] flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> General guidance, not a medical diagnosis.
      </p>
    </GlassCard>
  );
}
