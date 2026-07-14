"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TrendingUp,
  Info,
  Calendar,
  AlertTriangle,
  Scale,
  Brain,
  Zap,
  Activity,
  Download,
  Flame,
  Award,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";

type ComparisonMode = "week" | "month" | "goal";

export function AnalyticsDashboard() {
  const [comparison, setComparison] = useState<ComparisonMode>("week");
  const [exporting, setExporting] = useState<string | null>(null);

  const weeklyVolume = [
    { name: "Week 1", sets: 48, volume: 22400 },
    { name: "Week 2", sets: 52, volume: 23800 },
    { name: "Week 3", sets: 50, volume: 23100 },
    { name: "Week 4", sets: 54, volume: 24800 },
  ];

  const nutritionData = [
    { name: "Mon", calories: 2100, protein: 165 },
    { name: "Tue", calories: 2050, protein: 160 },
    { name: "Wed", calories: 2200, protein: 170 },
    { name: "Thu", calories: 1980, protein: 155 },
    { name: "Fri", calories: 2000, protein: 162 },
    { name: "Sat", calories: 2300, protein: 175 },
    { name: "Sun", calories: 2150, protein: 168 },
  ];

  const handleExport = (format: string) => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      const element = document.createElement("a");
      const file = new Blob([`Titan BI Analytics Report - Exported as ${format}`], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `titan_analytics_${Date.now()}.${format === "Excel" ? "xlsx" : format.toLowerCase()}`;
      element.click();
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-400">Enterprise BI Dashboard</p>
            <h2 className="text-xl font-bold text-white">Advanced Analytics</h2>
            <p className="text-xs text-white/50">Cross-examine strength volumes, calories, rest day parameters, and habit consistencies.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {["PDF", "CSV", "Excel"].map((format) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="rounded-lg border border-white/10 hover:bg-white/5 px-3 py-1.5 text-xs text-white transition flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> {exporting === format ? "Saving..." : format}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Comparisons selector */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2">
        {[
          { id: "week", label: "Week vs. Week" },
          { id: "month", label: "Month vs. Month" },
          { id: "goal", label: "Goal vs. Actual" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setComparison(item.id as ComparisonMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              comparison === item.id
                ? "bg-cyan-400 text-[#131315]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        {/* Left Column: Volume and Nutrition BI Panels */}
        <div className="space-y-6">
          {/* Strength Volume */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Training Sets &amp; Load Volume Projections</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#adc6ff" radius={[4, 4, 0, 0]} name="Barbell Load Volume (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Calorie Intake Balance */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Daily Calorie Consumption Trend</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nutritionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip />
                  <Area type="monotone" dataKey="calories" stroke="#34d399" fill="rgba(52, 211, 153, 0.08)" name="Consumed (kcal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: BI Summaries & Milestones */}
        <div className="space-y-6 text-xs text-white/70">
          {/* AI Summaries */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5 text-cyan-400" /> AI Executive Summary
            </h4>
            <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/80">
              💡 **BI Insights**: This month your strength improved by 9%, but recovery efficiency declined by 14% due to reduced sleep. Stance widening has successfully reduced butt-wink pelvis caving.
            </div>
          </GlassCard>

          {/* BI Milestones */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3.5 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Metabolic &amp; Habit Milestones</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Best training day</span>
                <span className="font-bold text-white">Tuesday (Progressive peaks)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Worst recovery day</span>
                <span className="font-bold text-rose-300">Sunday (Short sleep index)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Highest deficit day</span>
                <span className="font-bold text-emerald-400">Wednesday (-450 kcal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Longest habit streak</span>
                <span className="font-bold text-emerald-400">18 days (Workouts)</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
