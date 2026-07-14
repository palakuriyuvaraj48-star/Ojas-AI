"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, Droplets, Thermometer, CloudRain, Sun } from "lucide-react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function WaterTracker({ dailyLog, logWater, calorieTargets }: { dailyLog: any; logWater: (l: number) => void; calorieTargets: any }) {
  const [waterData, setWaterData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState({ temp: "28°C", humidity: "65%", condition: "Sunny" });

  useEffect(() => {
    fetch("/api/nutrition/water")
      .then((res) => res.json())
      .then((data) => {
        setWaterData(data.logs);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (!calorieTargets) return null;

  const target = calorieTargets.water || 3.2;
  const consumed = dailyLog.waterConsumed || 0;
  const percent = Math.min(100, Math.round((consumed / target) * 100)) || 0;

  const weeklyData = [
    { day: "Mon", amount: 2.4 },
    { day: "Tue", amount: 3.1 },
    { day: "Wed", amount: 2.8 },
    { day: "Thu", amount: 3.0 },
    { day: "Fri", amount: 2.6 },
    { day: "Sat", amount: 3.2 },
    { day: "Sun", amount: consumed },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <GlassCard className="p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Hydration Target</span>
              <h4 className="text-2xl font-black text-white mt-1">
                {consumed.toFixed(2)}L / {target}L
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Waves className="h-6 w-6" />
            </div>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="relative h-40 w-40">
              <svg className="absolute h-full w-full -rotate-90">
                <circle cx="80" cy="80" r="70" className="stroke-white/10 fill-none" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" className="stroke-cyan-400 fill-none transition-all duration-700" strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * percent) / 100} strokeLinecap="round" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <Droplets className="h-6 w-6 text-cyan-400 mb-1" />
                <span className="text-2xl font-black text-white">{percent}%</span>
                <span className="text-[9px] text-white/50 uppercase tracking-widest">Hydrated</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[0.25, 0.5, 1.0].map((lit) => (
              <button key={lit} onClick={() => logWater(lit)} className="rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 py-2 text-center text-[10px] font-bold text-white/80 transition">
                +{lit}L
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Dynamic Hydration Goal</h4>
            </div>
            <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">
              Based on your weight (64.2kg), activity level, and today&apos;s conditions ({weather.temp}, {weather.humidity} humidity), your adjusted intake goal is <strong className="text-white">{target}L</strong>.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-200">
              Tip: Add +500mL before and after workouts. Your 4-day training week means you need extra fluids on workout days.
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-white">Weekly Hydration Trend</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="waterFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity=".5" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(value: any) => [`${value}L`]} />
                  <Area type="monotone" dataKey="amount" stroke="#22d3ee" strokeWidth={2.5} fill="url(#waterFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
