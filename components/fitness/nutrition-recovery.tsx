"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export function NutritionRecovery({ dailyLog, macroTargets }: { dailyLog: any; macroTargets: any }) {
  const proteinConsumed = dailyLog?.proteinConsumed || 0;
  const proteinTarget = macroTargets?.protein?.grams || 150;
  const calorieTarget = macroTargets?.calories || 2500;
  const calorieConsumed = dailyLog?.caloriesConsumed || 0;

  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100)) || 0;
  const caloriePercent = Math.min(100, Math.round((calorieConsumed / calorieTarget) * 100)) || 0;

  const recoveryFactors = [
    {
      name: "Protein Intake",
      status: proteinPercent >= 80 ? "optimal" : proteinPercent >= 50 ? "moderate" : "low",
      value: `${proteinConsumed}g / ${proteinTarget}g`,
      percent: proteinPercent,
      recommendation: proteinPercent < 80 ? "Increase protein intake to support muscle repair and glycogen replenishment." : "Adequate protein for recovery.",
    },
    {
      name: "Calorie Consistency",
      status: caloriePercent >= 80 ? "optimal" : caloriePercent >= 50 ? "moderate" : "low",
      value: `${calorieConsumed} / ${calorieTarget} kcal`,
      percent: caloriePercent,
      recommendation: caloriePercent < 70 ? "Calorie intake is below optimal recovery range. Consider adding nutrient-dense foods." : "Calorie intake supports recovery goals.",
    },
    {
      name: "Meal Timing",
      status: "moderate",
      value: "Last meal 3h ago",
      percent: 65,
      recommendation: "Post-workout window may be closing. Aim for protein within 1-2 hours after training.",
    },
    {
      name: "Hydration Status",
      status: "moderate",
      value: "2.1L / 3.2L",
      percent: 66,
      recommendation: "Dehydration impairs recovery. Add 500mL before next meal.",
    },
  ];

  const overallScore = Math.round(recoveryFactors.reduce((sum, f) => sum + f.percent, 0) / recoveryFactors.length);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-semibold text-white text-sm">Nutrition Recovery Score</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative h-32 w-32">
              <svg className="absolute h-full w-full -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-white/10 fill-none" strokeWidth="10" />
                <circle cx="64" cy="64" r="56" className="stroke-emerald-400 fill-none transition-all duration-700" strokeWidth="10" strokeDasharray={352} strokeDashoffset={352 - (352 * overallScore) / 100} strokeLinecap="round" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <span className="text-2xl font-black text-white">{overallScore}%</span>
                <span className="text-[9px] text-white/50 uppercase">Score</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[var(--foreground-muted)] text-center">
            {overallScore >= 75 ? "Nutrition supports optimal recovery." : "Nutrition adjustments needed for better recovery."}
          </p>
        </GlassCard>

        <GlassCard className="p-5 space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-white text-sm">Recovery Factors</h3>
          <div className="space-y-3">
            {recoveryFactors.map((factor, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {factor.status === "optimal" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                    <span className="text-xs font-bold text-white">{factor.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--foreground-muted)]">{factor.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${factor.percent >= 80 ? "bg-emerald-400" : factor.percent >= 50 ? "bg-yellow-400" : "bg-rose-400"}`} style={{ width: `${factor.percent}%` }} />
                </div>
                <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">{factor.recommendation}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
