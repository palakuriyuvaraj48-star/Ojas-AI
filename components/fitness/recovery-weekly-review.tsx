"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { Award, TrendingUp, Lightbulb, Target, AlertTriangle } from "lucide-react";

export function RecoveryWeeklyReview() {
  const { loading, review } = useRecovery();
  if (loading || !review) return null;

  return (
    <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--accent)]" /> Weekly Recovery Review
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-white">{review.grade}</span>
          <Badge variant="primary" label={`${review.averageRecovery} avg`} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <p className="text-lg font-black text-white">{review.trainingDays}</p>
          <p className="text-[9px] text-white/50 uppercase">Train Days</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <p className="text-lg font-black text-white">{review.restDaysTaken}</p>
          <p className="text-[9px] text-white/50 uppercase">Rest Days</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
          <p className="text-lg font-black text-white">{review.averageRecovery}</p>
          <p className="text-[9px] text-white/50 uppercase">Avg Rec.</p>
        </div>
      </div>

      <Section icon={TrendingUp} title="Patterns" items={review.patterns} color="text-[var(--accent)]" />
      <Section icon={Lightbulb} title="Improvements" items={review.improvements} color="text-emerald-400" />
      <Section icon={Target} title="Action Items" items={review.actionItems} color="text-cyan-400" />
      <Section icon={AlertTriangle} title="Risk Factors" items={review.riskFactors} color="text-yellow-400" />
    </GlassCard>
  );
}

function Section({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {title}
      </p>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2 text-[11px] text-white/75">
            <span className={color}>•</span>
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}
