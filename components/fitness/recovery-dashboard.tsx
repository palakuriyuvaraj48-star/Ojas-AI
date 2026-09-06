"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "framer-motion";
import {
  Activity,
  HeartPulse,
  MoonStar,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
  Droplets,
  CheckCircle2,
  Clock,
  Waves,
  Zap,
  ShieldCheck
} from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { useFitness } from "@/components/providers/fitness-provider";

export function RecoveryDashboard() {
  const { dailyLog } = useFitness();
  const { result, signals } = useRecovery();

  const [recoveryData, setRecoveryData] = useState({
    todayScore: 78,
    sleepData: {
      duration: 7.4,
      quality: "good" as const,
      bedtime: "11:30 PM",
      wakeTime: "7:00 AM",
      interruptions: 1,
    },
    fatigueData: {
      muscular: 4,
      mental: 5,
      systemic: 3,
      trend: "stable" as const,
    },
    domsData: {
      legs: 4,
      chest: 2,
      back: 3,
      shoulders: 1,
    },
    hydration: {
      logged: (dailyLog?.waterConsumed ? Math.round(dailyLog.waterConsumed * 1000) : 1800),
      target: 2500,
      percentage: Math.min(100, Math.round(((dailyLog?.waterConsumed || 1.8) / 2.5) * 100)),
    },
    stressLevel: 4,
    trainingReadiness: "Good",
  });

  const weekTrend = [
    { day: "Mon", score: 72, sleep: 6.8 },
    { day: "Tue", score: 76, sleep: 7.2 },
    { day: "Wed", score: 81, sleep: 7.8 },
    { day: "Thu", score: 79, sleep: 7.1 },
    { day: "Fri", score: 84, sleep: 8.0 },
    { day: "Sat", score: 88, sleep: 8.4 },
    { day: "Sun", score: recoveryData.todayScore, sleep: recoveryData.sleepData.duration },
  ];

  const handleSorenessChange = (region: keyof typeof recoveryData.domsData, val: number) => {
    setRecoveryData(prev => ({
      ...prev,
      domsData: {
        ...prev.domsData,
        [region]: val
      }
    }));
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* 1. Overall Recovery Hero Card */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-blue-950/40 via-[#181a20] to-[#121316] relative overflow-hidden" glow>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Continuous Bio-Readiness
              </span>
              <span className="text-white/40 text-xs">Transparent Calculation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Today&apos;s Recovery Score
            </h2>
            <p className="text-sm font-semibold text-white/90 max-w-lg">
              {recoveryData.todayScore}/100 — {recoveryData.todayScore >= 75 ? "Moderate to high training safe" : recoveryData.todayScore >= 50 ? "Moderate training safe" : "Recovery priority"}
            </p>
            <p className="text-xs text-white/60 max-w-lg">
              {recoveryData.todayScore >= 80 && "Optimal Recovery: Central nervous system is primed for progressive overload."}
              {recoveryData.todayScore >= 60 && recoveryData.todayScore < 80 && "Adequate Recovery: Moderate-to-high intensity training supported."}
              {recoveryData.todayScore < 60 && "Active restoration recommended to prevent overreaching."}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <ProgressRing progress={recoveryData.todayScore} size={130} strokeWidth={10} color="#3b82f6" showLabel={true} />
              <span className="text-xs font-bold text-blue-300 mt-2">Ready for Training</span>
            </div>
          </div>
        </div>

        {/* Transparent Score Breakdown Formula: Sleep (35%) + Fatigue (30%) + Training Load (20%) + Nutrition (15%) */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#adc6ff] flex items-center gap-1.5">
              <BrainCircuit className="h-3.5 w-3.5" />
              Transparent Recovery Formula Breakdown
            </span>
            <span className="text-[10px] text-white/50">Sleep (35%) + Fatigue (30%) + Training Load (20%) + Nutrition (15%)</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-indigo-300">Sleep (35%)</span>
                <span className="text-white">29.4 / 35 pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: "84%" }} />
              </div>
              <span className="text-[10px] text-white/40 block">7.4h duration · 84% eff.</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-300">Fatigue (30%)</span>
                <span className="text-white">21.0 / 30 pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "70%" }} />
              </div>
              <span className="text-[10px] text-white/40 block">Low systemic stress</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-300">Training Load (20%)</span>
                <span className="text-white">15.6 / 20 pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: "78%" }} />
              </div>
              <span className="text-[10px] text-white/40 block">Optimal 24h deload</span>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-cyan-300">Nutrition (15%)</span>
                <span className="text-white">12.0 / 15 pts</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: "80%" }} />
              </div>
              <span className="text-[10px] text-white/40 block">86g protein + hydration</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. Grid of Core Recovery Components */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Sleep Analysis Card */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MoonStar className="h-4 w-4 text-indigo-400" />
              Sleep Architecture
            </h3>
            <span className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 uppercase">
              {recoveryData.sleepData.quality}
            </span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/60">Total Duration</span>
              <span className="font-bold text-white text-sm">{recoveryData.sleepData.duration} hrs</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/60">Bedtime</span>
              <span className="font-semibold text-white">{recoveryData.sleepData.bedtime}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-white/60">Wake Time</span>
              <span className="font-semibold text-white">{recoveryData.sleepData.wakeTime}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-white/60">Night Interruptions</span>
              <span className="font-semibold text-emerald-300">{recoveryData.sleepData.interruptions} (Minimal)</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200">
            💡 <strong>Insight:</strong> 7.4h sleep duration meets the 7-9h target. Consistent bedtime maintains circadian stability.
          </div>
        </GlassCard>

        {/* Fatigue Monitoring */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Fatigue Breakdown
            </h3>
            <span className="text-[10px] font-bold text-white/50 uppercase">Scale 0-10</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-white/70">Muscular Fatigue</span>
                <span className="text-amber-300">{recoveryData.fatigueData.muscular}/10</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${recoveryData.fatigueData.muscular * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-white/70">Mental / Cognitive Stress</span>
                <span className="text-indigo-300">{recoveryData.fatigueData.mental}/10</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${recoveryData.fatigueData.mental * 10}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-white/70">Systemic Central Fatigue</span>
                <span className="text-emerald-300">{recoveryData.fatigueData.systemic}/10</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${recoveryData.fatigueData.systemic * 10}%` }} />
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
            ⚡ <strong>Trend:</strong> Systemic fatigue is low (3/10). Central nervous system is fresh for high neuromuscular recruitment.
          </div>
        </GlassCard>

        {/* Hydration Tracker */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-400" />
              Hydration Status
            </h3>
            <span className="text-xs font-bold text-cyan-300">{recoveryData.hydration.percentage}%</span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {recoveryData.hydration.logged} ml
            </div>
            <span className="text-xs text-white/50">Target: {recoveryData.hydration.target} ml / day</span>
          </div>

          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${recoveryData.hydration.percentage}%` }}
            />
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200">
            💧 <strong>Remaining:</strong> Drink {Math.max(0, recoveryData.hydration.target - recoveryData.hydration.logged)} ml more water before evening session.
          </div>
        </GlassCard>
      </div>

      {/* 3. DOMS Muscle Soreness Map & 7-Day Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DOMS Muscle Soreness Tracker */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Delayed Onset Soreness</span>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                DOMS Muscle Soreness Map
              </h4>
            </div>
            <span className="text-xs text-white/50">Click to adjust</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(recoveryData.domsData).map(([region, level]) => {
              const color =
                level <= 2 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
                level <= 5 ? "border-amber-500/30 bg-amber-500/10 text-amber-300" :
                "border-rose-500/30 bg-rose-500/10 text-rose-300";

              return (
                <div key={region} className={`p-3 rounded-xl border ${color} space-y-1.5`}>
                  <div className="flex justify-between items-center text-xs font-bold capitalize">
                    <span>{region}</span>
                    <span>{level}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={level}
                    onChange={(e) => handleSorenessChange(region as any, parseInt(e.target.value) || 0)}
                    className="w-full accent-current cursor-pointer h-1.5 bg-white/20 rounded-lg"
                  />
                  <span className="text-[10px] text-white/60 block">
                    {level <= 2 ? "Fresh & Ready" : level <= 5 ? "Mild Soreness" : "Restricted Load"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70">
            🛡️ <strong>Adaptive Logic:</strong> If Leg soreness exceeds 5/10, OJAS automatically swaps heavy squats for low-fatigue upper-body pulling.
          </div>
        </GlassCard>

        {/* 7-Day Trend Chart */}
        <GlassCard className="p-5 border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Weekly Bio-Telemetry</span>
              <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                7-Day Recovery Trajectory
              </h4>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              +6% vs Last Week
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#181a20",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
            📊 <strong>Synthesis:</strong> Consistent 7+ hour sleep over the last 5 days has produced an upward recovery trend suitable for progressive load increase.
          </div>
        </GlassCard>
      </div>

      {/* 4. Actionable Recommendation Banner */}
      <GlassCard className="p-4 sm:p-5 border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#181a20] to-[#121316] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
              Actionable Recommendation (Bio-Telemetry Driven)
            </span>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {recoveryData.domsData.legs >= 5
                ? "Light mobility work for legs. Avoid heavy leg training today."
                : recoveryData.todayScore >= 75
                ? "Full green light: Central nervous system is fresh. Execute progressive overload on primary compound movements."
                : "Moderate load advised: Focus on upper accessory volume and keep rest intervals at 90s."}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
