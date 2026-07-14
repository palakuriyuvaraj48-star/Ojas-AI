"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function RecoveryAnalytics() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recovery/timeline?period=${period}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Recovery Analytics</h2>
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
          <button onClick={() => setPeriod("weekly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "weekly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Weekly</button>
          <button onClick={() => setPeriod("monthly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "monthly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Monthly</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Target className="h-4 w-4 text-[var(--accent)]" /> Avg Recovery</h3>
          <div className="flex items-center justify-center py-4">
            <ProgressRing progress={data.averageRecovery} size={140} strokeWidth={10} color="var(--accent)" showLabel={true} />
          </div>
          <div className="text-center text-[10px] text-[var(--foreground-muted)]">Rest Days: {data.restDaysTaken}</div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-white text-sm"><TrendingUp className="h-4 w-4 text-emerald-400 inline mr-2" />Recovery Trend</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recovery}>
                <defs>
                  <linearGradient id="aGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity=".5" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#aGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /> Top Risk Factors</h3>
          <div className="space-y-2">
            {data.topRiskFactors.map((risk: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/70">{idx + 1}. {risk}</div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--accent)]" /> AI Insight</h3>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{data.aiInsight}</p>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-white/50 uppercase">Weekly Review</h4>
            {data.weeklyReview.patterns.map((p: string, idx: number) => (
              <p key={idx} className="text-[10px] text-white/60 leading-relaxed">Pattern: {p}</p>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
