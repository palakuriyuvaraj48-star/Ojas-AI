"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HeartPulse, Activity, AlertTriangle } from "lucide-react";

export function RestDayPlanner({ recoveryScore = 70, fatigue = 40 }: { recoveryScore?: number; fatigue?: number }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recovery/rest-day?score=${recoveryScore}&fatigue=${fatigue}`)
      .then((res) => res.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [recoveryScore, fatigue]);

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5 flex items-center justify-center">
        <p className="text-xs text-[var(--foreground-muted)]">Calculating optimal rest strategy...</p>
      </div>
    );
  }

  if (!plan) return null;

  const level = "moderate";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard className="p-6 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Rest Day Recommendation</span>
            <h4 className="text-2xl font-black text-white mt-1 capitalize">{plan.recommendation.replace("-", " ")}</h4>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <HeartPulse className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center justify-center py-2">
          <ProgressRing progress={plan.confidence} size={120} strokeWidth={8} color="#34d399" showLabel={true} />
        </div>
        <div className="text-[10px] text-[var(--foreground-muted)]">
          Duration: <span className="text-white font-bold">{plan.duration} min</span> • Confidence: {plan.confidence}%
        </div>
      </GlassCard>

      <div className="space-y-4">
        <GlassCard className="p-5 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" /> Why This Recommendation
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{plan.reasoning}</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">Expected Benefit</h3>
          <p className="text-xs text-white/70 leading-relaxed">{plan.expectedBenefit}</p>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">Alternatives</h3>
          <div className="flex flex-wrap gap-2">
            {plan.alternatives.map((alt: string, idx: number) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-white/70 capitalize">
                {alt.replace("-", " ")}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
