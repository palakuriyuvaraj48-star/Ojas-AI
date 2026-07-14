"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, HeartPulse, MoonStar, ShieldAlert, TrendingUp, AlertTriangle, Sparkles, BrainCircuit } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { RecoveryDecisionEngine } from "@/components/fitness/recovery-decision-engine";
import { RecoveryBudget } from "@/components/fitness/recovery-budget";
import { RecoveryWeeklyReview } from "@/components/fitness/recovery-weekly-review";

export function RecoveryDashboard() {
  const { loading, result, signals, timeline } = useRecovery();

  if (loading || !result || !signals) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  const readinessColor =
    result.readiness === "fresh" ? "text-emerald-400" :
    result.readiness === "moderate" ? "text-yellow-400" :
    result.readiness === "fatigued" ? "text-orange-400" : "text-rose-400";

  const trendColor =
    result.trend === "improving" ? "text-emerald-400" :
    result.trend === "declining" ? "text-rose-400" : "text-white/60";

  const chartData = timeline.map((t) => ({ day: t.day, score: t.score }));

  return (
    <div className="space-y-6">
      {/* Top row: Score / Sleep+Readiness / Fatigue */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[var(--accent)]/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Recovery Score</span>
              <h4 className="text-3xl font-black text-white mt-1">{result.score}</h4>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${readinessColor} bg-white/5`}>
              {result.readiness}
            </div>
          </div>
          <div className="flex items-center justify-center py-2">
            <ProgressRing progress={result.score} size={140} strokeWidth={10} color="var(--accent)" showLabel={true} />
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">
            <strong className="text-white">Confidence:</strong> {result.confidence}% • Trend: <span className={trendColor}>{result.trend}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <MoonStar className="h-4 w-4 text-[var(--accent)]" /> Sleep &amp; Readiness
          </h3>
          <div className="space-y-3 text-xs">
            <Row label="Sleep Duration" value={`${signals.sleepDuration.toFixed(1)}h`} />
            <Row label="Sleep Quality" value={`${Math.round(signals.sleepQuality)}%`} />
            <Row label="Sleep Consistency" value={`${Math.round(signals.sleepConsistency)}%`} />
            <Row label="Hydration" value={`${signals.hydrationLiters.toFixed(1)}/${signals.hydrationTargetLiters.toFixed(1)}L`} />
            <Row label="Training Load" value={`${Math.round(signals.trainingLoad)}%`} />
            <Row label="Consecutive Days" value={`${signals.consecutiveTrainingDays}`} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" /> Fatigue Level
          </h3>
          <div className="flex items-center justify-center py-2">
            <ProgressRing progress={result.fatigueLevel} size={120} strokeWidth={8} color={result.fatigueLevel > 60 ? "#fbbf24" : "var(--accent)"} showLabel={true} />
          </div>
          <p className="text-[10px] text-[var(--foreground-muted)] text-center">
            {result.fatigueLevel > 60 ? "High fatigue detected. Consider reducing intensity." : "Moderate fatigue. Training can proceed with caution."}
          </p>
        </GlassCard>
      </div>

      {/* Today's recommendation */}
      <GlassCard className="p-5 border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[var(--accent)]" /> Today&apos;s Recommendation
          </h3>
          <Badge variant="primary" label={result.recommendation.label} />
        </div>
        <div className="p-4 rounded-2xl bg-[var(--accent-glow)] border border-[var(--accent)]/20 text-xs text-white/80 leading-relaxed">
          {result.recommendation.explanation}
          <div className="mt-2 text-[10px] text-[var(--foreground-muted)]">
            {result.recommendation.primaryAction} • Confidence: {result.recommendation.confidence}%
          </div>
        </div>
      </GlassCard>

      {/* AI Recovery Summary */}
      <GlassCard className="p-5 border-[var(--border-subtle)]">
        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" /> AI Recovery Summary
        </h3>
        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{result.explanation}</p>
      </GlassCard>

      {/* Muscle heat map + trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--accent)]" /> Muscle Readiness Heat Map
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {result.muscleReadiness.map((m, idx) => {
              const c = m.readiness >= 80 ? "text-emerald-400 bg-emerald-500/10" :
                m.readiness >= 60 ? "text-yellow-400 bg-yellow-500/10" : "text-rose-400 bg-rose-500/10";
              return (
                <div key={idx} className={`p-2.5 rounded-xl border border-white/5 text-center ${c}`}>
                  <p className="text-[9px] font-bold uppercase">{m.muscle}</p>
                  <p className="text-sm font-black mt-0.5">{m.readiness}%</p>
                  <p className="text-[8px] capitalize opacity-70">{m.soreness}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" /> Weekly Recovery Trend
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="recFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity=".5" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#recFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Unique differentiators */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecoveryDecisionEngine />
        <RecoveryBudget />
        <RecoveryWeeklyReview />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-[var(--foreground-muted)]">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
