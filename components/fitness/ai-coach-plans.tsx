"use client";

import React, { useState } from "react";
import { useCoachContext } from "@/lib/coach/storage";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Calendar,
  Clock,
  Dumbbell,
  UtensilsCrossed,
  Moon,
  TrendingUp,
  Award,
  CheckCircle2,
  ChevronRight,
  Sun,
  Activity,
  Sparkles,
} from "lucide-react";

export function AICoachPlans() {
  const { dailyPlan, weekly, monthly } = useCoachContext();
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "weekly" | "monthly">("daily");

  if (!dailyPlan || !weekly || !monthly) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin text-2xl text-[var(--accent)]">🔄</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs selection */}
      <GlassCard className="p-2 border-white/5 flex gap-2 w-full max-w-md mx-auto justify-center bg-black/10">
        {[
          { id: "daily", label: "Daily Planner" },
          { id: "weekly", label: "Weekly Review" },
          { id: "monthly", label: "Monthly Review" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              activeSubTab === tab.id
                ? "bg-[#adc6ff]/15 text-[#adc6ff] border border-white/10"
                : "text-white/40 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </GlassCard>

      {/* Plans Render Container */}
      <div className="transition-all duration-300">
        
        {/* DAILY PLAN VIEW */}
        {activeSubTab === "daily" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Morning & Night Schedules */}
            <div className="space-y-6">
              {/* Morning Plan */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Sun className="h-4.5 w-4.5 text-amber-400" /> Morning Protocol
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                  {dailyPlan.morning.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400/60 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Night Plan */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Moon className="h-4.5 w-4.5 text-indigo-400" /> Night Recharge Checklist
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                  {dailyPlan.night.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400/60 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Workout & Meal plans */}
            <div className="space-y-6">
              {/* Workout advice */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Dumbbell className="h-4.5 w-4.5 text-cyan-400" /> Workout Blueprint
                </h4>
                <div className="bg-white/5 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="font-black text-white text-sm">{dailyPlan.workout.title}</p>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <strong className="text-white">Focus:</strong> {dailyPlan.workout.focus}
                  </p>
                  <p className="text-[11px] text-white/60">
                    <strong className="text-white">Duration:</strong> {dailyPlan.workout.duration} mins
                  </p>
                  <div className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-xl p-3 mt-2 text-[10.5px] leading-relaxed">
                    💡 <strong>Coach Cue:</strong> {dailyPlan.workout.note}
                  </div>
                </div>
              </GlassCard>

              {/* Meal plan */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <UtensilsCrossed className="h-4.5 w-4.5 text-purple-400" /> Nutrition Schedule
                </h4>
                <div className="space-y-3">
                  {dailyPlan.meals.map((meal, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-3 text-xs">
                      <div>
                        <p className="font-bold text-white">{meal.label}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{meal.suggestion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="bg-[#adc6ff]/10 text-[#adc6ff] text-[9px] px-2 py-0.5 rounded font-bold mr-1.5">
                          {meal.protein}g P
                        </span>
                        <span className="font-mono text-white/60">{meal.calories} kcal</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* WEEKLY REVIEW VIEW */}
        {activeSubTab === "weekly" && (
          <div className="space-y-6">
            {/* Completion metrics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <GlassCard className="p-4 text-center">
                <span className="text-[9px] text-white/40 uppercase font-semibold">Workouts Logged</span>
                <span className="text-2xl font-black text-white mt-1 block">{weekly.workoutsCompleted} sessions</span>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <span className="text-[9px] text-white/40 uppercase font-semibold">Average Recovery</span>
                <span className="text-2xl font-black text-white mt-1 block">{weekly.avgRecovery}%</span>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <span className="text-[9px] text-white/40 uppercase font-semibold">Dietary Adherence</span>
                <span className="text-2xl font-black text-white mt-1 block">{weekly.nutritionAdherence}%</span>
              </GlassCard>
            </div>

            {/* Trends and Celebration */}
            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <TrendingUp className="h-4.5 w-4.5 text-[#adc6ff]" /> Weekly Trends & Habits
                </h4>
                <div className="space-y-3 text-xs text-white/70">
                  <div>
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-white/40">Observations</h5>
                    <ul className="list-disc list-inside mt-2 space-y-1 pl-1">
                      {weekly.trends.map((t, idx) => <li key={idx}>{t}</li>)}
                    </ul>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wider text-white/40">Actionable Habits</h5>
                    <ul className="list-disc list-inside mt-2 space-y-1 pl-1">
                      {weekly.habits.map((h, idx) => <li key={idx}>{h}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Progress Celebration */}
              <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="space-y-3">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                    <Award className="h-4.5 w-4.5 text-yellow-400" /> Consistency Celebration
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed font-serif italic pt-1">
                    &quot;{weekly.celebration}&quot;
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-2xl p-3 text-[10px] leading-relaxed">
                  <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Weekly Review compounds. Log your bodyweight weekly under Profile to calibrate metabolic targets.</p>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* MONTHLY REVIEW VIEW */}
        {activeSubTab === "monthly" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Achievements and Improvements */}
            <div className="space-y-6">
              {/* Achievements */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Award className="h-4.5 w-4.5 text-yellow-400" /> Monthly Achievements — {monthly.month}
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                  {monthly.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* Areas to improve */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Activity className="h-4.5 w-4.5 text-cyan-400" /> Areas to Optimize Next Month
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                  {monthly.improve.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <ChevronRight className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Consistency summaries */}
            <div className="space-y-6">
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <TrendingUp className="h-4.5 w-4.5 text-[#adc6ff]" /> Consistency Summary
                </h4>
                <div className="space-y-3 text-xs text-white/70">
                  <p><strong className="text-white">Training Frequency:</strong> {monthly.consistency}</p>
                  <p><strong className="text-white">CNS Stress Rate:</strong> {monthly.recovery}</p>
                </div>
              </GlassCard>

              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
                  <Sparkles className="h-4.5 w-4.5 text-[var(--accent)]" /> Coach Recommendations
                </h4>
                <ul className="space-y-2 text-xs text-white/70">
                  {monthly.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-2 ml-1" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
