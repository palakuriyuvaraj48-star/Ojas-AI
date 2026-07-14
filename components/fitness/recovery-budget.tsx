"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { motion } from "framer-motion";
import { Scale, Dumbbell, Moon, Activity, Clock } from "lucide-react";

const ALLOC_META = [
  { key: "training", label: "Training Capacity", icon: Dumbbell, color: "#4d8eff" },
  { key: "sleep", label: "Sleep Repair", icon: Moon, color: "#a78bfa" },
  { key: "stress", label: "Stress Drain", icon: Activity, color: "#fbbf24" },
  { key: "time", label: "Time Available", icon: Clock, color: "#34d399" },
] as const;

export function RecoveryBudget() {
  const { loading, budget } = useRecovery();
  if (loading || !budget) return null;

  return (
    <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Scale className="h-4 w-4 text-[var(--accent)]" /> Recovery Budget
        </h3>
        <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">
          Balance {budget.balance}%
        </span>
      </div>

      <div className="flex items-center justify-center py-2">
        <ProgressRing progress={budget.balance} size={120} strokeWidth={9} color="#4d8eff" showLabel={true} />
      </div>

      <div className="space-y-3">
        {ALLOC_META.map((m, i) => {
          const Icon = m.icon;
          const value = budget.allocations[m.key as keyof typeof budget.allocations];
          return (
            <div key={m.key} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 text-white/70">
                  <Icon className="h-3.5 w-3.5" style={{ color: m.color }} /> {m.label}
                </span>
                <span className="font-bold text-white">{Math.round(value)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5">
        {budget.advice.map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-[10px] text-white/70">
            <span className="text-[var(--accent)] mt-0.5">•</span>
            {a}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
