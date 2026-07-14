"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "framer-motion";
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function NutritionAnalytics() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nutrition/analytics?period=${period}`)
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
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

  if (!analytics) return null;

  const scoreColors = ["bg-emerald-400", "bg-yellow-400", "bg-rose-400", "bg-cyan-400", "bg-[#adc6ff]", "bg-amber-400"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Nutrition Analytics</h2>
        <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
          <button onClick={() => setPeriod("weekly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "weekly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Weekly</button>
          <button onClick={() => setPeriod("monthly")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === "monthly" ? "bg-[var(--accent)] text-white" : "text-white/50 hover:text-white"}`}>Monthly</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><Target className="h-4 w-4 text-[var(--accent)]" /> Nutrition Score</h3>
          <div className="flex items-center justify-center py-4">
            <ProgressRing progress={analytics.nutritionScore} size={160} strokeWidth={10} color="var(--accent)" showLabel={true} className="text-white" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Meal Consistency</span>
              <span className="font-bold text-white">{analytics.mealConsistency}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${analytics.mealConsistency}%` }} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm"><TrendingUp className="h-4 w-4 text-emerald-400 inline mr-2" />Calorie Adherence</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.calories.trend}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="consumed" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-[10px] text-[var(--foreground-muted)]">
            Average: {analytics.calories.averageConsumed} kcal / {analytics.calories.averageTarget} kcal target
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h3 className="font-semibold text-white text-sm">Macros Balance</h3>
          <div className="space-y-3">
            {analytics.nutritionScores.map((s: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{s.label}</span>
                  <span className={`${s.score >= 80 ? "text-emerald-400" : s.score >= 60 ? "text-yellow-400" : "text-rose-400"}`}>{s.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">Top Foods Logged</h3>
          <div className="space-y-2">
            {analytics.topFoods.map((food: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                <span className="text-white font-medium">{food.name}</span>
                <span className="text-[var(--accent)] text-[10px] font-mono">{food.count}x this week</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" /> Deficiencies & Suggestions</h3>
          <div className="space-y-2">
            {analytics.deficiencies.map((def: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">{def.name}</span>
                  <span className={`text-[10px] font-bold ${def.status === "deficient" ? "text-rose-400" : def.status === "low" ? "text-yellow-400" : "text-emerald-400"}`}>{def.status}</span>
                </div>
                <p className="text-[10px] text-[var(--foreground-muted)]">{def.current} / {def.target} {def.unit} ({def.percent}%)</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 border-[var(--border-subtle)]">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-[var(--accent)]" /> AI Nutrition Insight</h3>
        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed mt-2">{analytics.aiInsight}</p>
      </GlassCard>
    </div>
  );
}
