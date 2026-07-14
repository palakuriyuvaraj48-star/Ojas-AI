"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function RecoveryTimeline() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recovery/timeline?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Recovery Timeline</h2>
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
          <button onClick={() => setPeriod("weekly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "weekly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Weekly</button>
          <button onClick={() => setPeriod("monthly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "monthly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Monthly</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[var(--accent)]" /> Recovery Score</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.recovery}>
                <defs>
                  <linearGradient id="recGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity=".5" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#recGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">Fatigue Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.fatigue}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="fatigue" stroke="#fbbf24" strokeWidth={2.5} fill="rgba(251,191,36,0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm">Key Metrics</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-white/60">Rest Days Taken</span><span className="font-bold text-white">{data.restDaysTaken}</span></div>
            <div className="flex justify-between"><span className="text-white/60">Avg Recovery</span><span className="font-bold text-white">{data.averageRecovery}%</span></div>
          </div>
        </GlassCard>
        <GlassCard className="p-5 space-y-3 lg:col-span-2">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /> Top Risk Factors</h3>
          <div className="space-y-2">
            {data.topRiskFactors.map((risk: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/70">
                <span className="text-yellow-400 font-bold">{idx + 1}.</span> {risk}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
