"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "framer-motion";
import { Apple, Waves, Info, TrendingUp, ShoppingCart, Utensils, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function NutritionDashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { profile, dailyLog, calorieTargets, macroTargets, logFood, logWater } = useFitness();

  if (!profile || !calorieTargets || !macroTargets) return null;

  const calRemaining = calorieTargets.activeTarget - dailyLog.caloriesConsumed;
  const calPercent = Math.min(100, Math.round((dailyLog.caloriesConsumed / calorieTargets.activeTarget) * 100)) || 0;
  const protPercent = Math.min(100, Math.round((dailyLog.proteinConsumed / macroTargets.protein.grams) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((dailyLog.carbsConsumed / macroTargets.carbs.grams) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((dailyLog.fatConsumed / macroTargets.fat.grams) * 100)) || 0;
  const waterPercent = Math.min(100, Math.round((dailyLog.waterConsumed / macroTargets.water) * 100)) || 0;

  const weekData = [
    { day: "Mon", consumed: 2150, target: 2350 },
    { day: "Tue", consumed: 2280, target: 2350 },
    { day: "Wed", consumed: 2040, target: 2350 },
    { day: "Thu", consumed: 2410, target: 2350 },
    { day: "Fri", consumed: 2300, target: 2350 },
    { day: "Sat", consumed: 2450, target: 2350 },
    { day: "Sun", consumed: dailyLog.caloriesConsumed, target: calorieTargets.activeTarget },
  ];

  const micronutrients = [
    { label: "Magnesium", current: 220, target: 400, unit: "mg", status: "deficient" as const, percent: 55 },
    { label: "Iron", current: 14, target: 18, unit: "mg", status: "low" as const, percent: 78 },
    { label: "Sodium", current: 1850, target: 2300, unit: "mg", status: "optimal" as const, percent: 81 },
    { label: "Vitamin D", current: 320, target: 600, unit: "IU", status: "low" as const, percent: 53 },
    { label: "Vitamin C", current: 85, target: 90, unit: "mg", status: "optimal" as const, percent: 94 },
    { label: "Potassium", current: 2800, target: 3500, unit: "mg", status: "low" as const, percent: 80 },
    { label: "Calcium", current: 900, target: 1200, unit: "mg", status: "low" as const, percent: 75 },
    { label: "Fiber", current: 18, target: 28, unit: "g", status: "deficient" as const, percent: 64 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <GlassCard className="p-6 md:p-8 border-[var(--border-subtle)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[var(--accent)]/5 rounded-full blur-3xl" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">Today&apos;s Calorie Rhythm</span>
                <h2 className="text-4xl font-black text-white">{dailyLog.caloriesConsumed}</h2>
                <p className="text-xs text-[var(--foreground-muted)]">
                  kcal logged out of {calorieTargets.activeTarget} target ({calPercent}%)
                </p>
                <p className={`text-sm font-bold ${calRemaining >= 0 ? "text-[var(--accent)]" : "text-rose-400"} mt-2`}>
                  {calRemaining >= 0 ? `🎯 ${calRemaining} kcal remaining` : `⚠️ ${Math.abs(calRemaining)} kcal surplus`}
                </p>
              </div>

              <div className="relative flex h-36 w-36 items-center justify-center shrink-0">
                <svg className="absolute h-full w-full -rotate-90">
                  <circle cx="72" cy="72" r="62" className="stroke-white/10 fill-none" strokeWidth="9" />
                  <circle cx="72" cy="72" r="62" className="stroke-[var(--accent)] fill-none transition-all duration-500" strokeWidth="9" strokeDasharray={390} strokeDashoffset={390 - (390 * calPercent) / 100} strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <p className="text-2xl font-black text-white">{calPercent}%</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Logged</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Macronutrient Weights</h3>
              <span className="text-[10px] text-[var(--foreground-muted)]">Daily Targets</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Protein", current: dailyLog.proteinConsumed, target: macroTargets.protein.grams, pct: protPercent, color: "bg-emerald-400" },
                { label: "Carbohydrates", current: dailyLog.carbsConsumed, target: macroTargets.carbs.grams, pct: carbPercent, color: "bg-yellow-400" },
                { label: "Fats", current: dailyLog.fatConsumed, target: macroTargets.fat.grams, pct: fatPercent, color: "bg-rose-400" },
              ].map((m, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">{m.label}</span>
                    <span className="text-[var(--foreground-muted)]">{m.current}g / {m.target}g ({m.pct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all duration-300`} style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-5 space-y-4 text-xs">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--accent)]" /> Micronutrient Status
            </h3>
            <div className="space-y-2.5">
              {micronutrients.map((mic, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span>{mic.label}</span>
                  <div className="text-right">
                    <p className="text-white font-bold">{mic.current}{mic.unit} / {mic.target}{mic.unit}</p>
                    <p className={`text-[9px] font-bold ${mic.status === "deficient" || mic.status === "low" ? "text-yellow-400" : "text-emerald-400"}`}>
                      {mic.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Hydration Tracker</span>
                <h4 className="text-xl font-black text-white mt-1">
                  {dailyLog.waterConsumed.toFixed(2)}L / {macroTargets.water}L
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Waves className="h-4 w-4" />
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${waterPercent}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-center text-white/50">
              <button onClick={() => logWater(0.25)} className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg py-1.5 font-bold transition">
                +250ml cup
              </button>
              <button onClick={() => logWater(0.5)} className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg py-1.5 font-bold transition">
                +500ml bottle
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--accent)]" /> Weekly Calorie Trend
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="calFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity=".5" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 200", "dataMax + 200"]} />
              <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="consumed" stroke="var(--accent)" strokeWidth={2.5} fill="url(#calFill)" />
              <Area type="monotone" dataKey="target" stroke="rgba(255,255,255,.2)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Target Calculations Explanation */}
      <GlassCard className="p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Info className="h-4.5 w-4.5 text-[var(--accent)]" />
          <h3 className="font-bold text-white text-sm">AI target calculation explanation</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-2 text-xs text-white/70 leading-relaxed">
          <div className="space-y-2">
            <p className="font-bold text-[#adc6ff]">1. Energy Target (Calories)</p>
            <p>
              Your baseline **BMR** is calculated using the **Mifflin-St Jeor formula** based on your stats ({profile.weight}kg, {profile.height}cm, {profile.age}y):
            </p>
            <div className="p-2.5 rounded-xl bg-black/30 font-mono text-[10px] text-white/90">
              BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age (y) {profile.gender === "male" ? "+ 5" : "- 161"} = {Math.round(profile.gender === "male" ? (10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5) : (10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161))} kcal
            </div>
            <p>
              This is scaled by your activity level (**{profile.activityLevel.replace("-", " ")}**) to find your **TDEE** (Maintenance: {calorieTargets.maintenance} kcal).
              Finally, we apply a goal offset for **{profile.goal.replace("-", " ")}** to yield **{calorieTargets.activeTarget} kcal**.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#adc6ff]">2. Macronutrients &amp; Water</p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li>
                <strong className="text-white">Protein</strong>: Set at {profile.goal === "fat-loss" ? "2.3g per kg of LBM" : "2.0g per kg of body weight"} ({macroTargets.protein.grams}g) to support muscle retention and synthesis.
              </li>
              <li>
                <strong className="text-white">Fats</strong>: Programmed at 25% of energy target ({macroTargets.fat.grams}g) to sustain healthy lipid profiles and hormone regulation.
              </li>
              <li>
                <strong className="text-white">Carbohydrates</strong>: Calculated from remaining calories ({macroTargets.carbs.grams}g) to fuel anaerobic glycolysis and glycogen reserves.
              </li>
              <li>
                <strong className="text-white">Water</strong>: Estimated at 35mL per kg of body weight ({macroTargets.water}L) to ensure cellular hydration and recovery.
              </li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
