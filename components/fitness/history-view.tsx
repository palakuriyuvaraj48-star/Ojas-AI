"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, Dumbbell, UtensilsCrossed, Settings, Trash2, Calendar, Award } from "lucide-react";

export function HistoryView() {
  const { resetData } = useFitness();
  const [filterMode, setFilterMode] = useState<"all" | "workout" | "food">("all");

  const staticLogs = [
    { type: "workout", title: "Upper Body Hypertrophy", detail: "45 min • Completed 4 exercises • Avg HR: 142 bpm", date: "Today, 10:15 AM", cal: 240 },
    { type: "food", title: "Tandoori Chicken Tikka Bowl", detail: "Logged +480 kcal • 42g Protein • 28g Carbs • 14g Fat", date: "Today, 01:22 PM", cal: 480 },
    { type: "workout", title: "Full Body Recomposition", detail: "35 min • Completed 3 exercises • RPE 8.0", date: "Yesterday, 06:40 PM", cal: 180 },
    { type: "food", title: "Greek Yogurt with Mixed Berries", detail: "Logged +220 kcal • 18g Protein • 12g Carbs", date: "Yesterday, 08:10 AM", cal: 220 },
    { type: "food", title: "Moong Dal Cheela", detail: "Logged +380 kcal • 18g Protein • 52g Carbs", date: "July 7, 2026, 09:00 AM", cal: 380 },
  ];

  const filteredLogs = staticLogs.filter(log => {
    if (filterMode === "workout") return log.type === "workout";
    if (filterMode === "food") return log.type === "food";
    return true;
  });

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all local storage metrics history? This resets your profile.")) {
      resetData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions header */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#adc6ff]" /> Training & Food Ledger
          </h3>
          <p className="text-xs text-white/50">Ledger of verified biomechanical form checks and macro logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
            {["all", "workout", "food"].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filterMode === mode ? "bg-[#adc6ff]/15 text-[#adc6ff]" : "text-white/50 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleClearHistory}
            className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 border border-rose-500/25 transition shrink-0"
            title="Reset All Data"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </GlassCard>

      {/* History Timeline */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-[#adc6ff]" /> Log Timeline
          </h4>

          <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6 text-xs">
            {filteredLogs.map((log, idx) => (
              <div key={idx} className="relative space-y-1 text-left">
                {/* Connector dots */}
                <div className={`absolute -left-[22.5px] top-1.5 h-3.5 w-3.5 rounded-full border border-black flex items-center justify-center ${
                  log.type === "workout" ? "bg-cyan-400" : "bg-[#adc6ff]"
                }`} />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {log.type === "workout" ? <Dumbbell className="h-3.5 w-3.5 text-cyan-400" /> : <UtensilsCrossed className="h-3.5 w-3.5 text-[#adc6ff]" />}
                    {log.title}
                  </span>
                  <span className="text-[10px] text-white/40">{log.date}</span>
                </div>
                <p className="text-white/50 text-[10px]">{log.detail}</p>
                <span className="inline-block text-[9px] bg-white/5 border border-white/5 rounded px-2 py-0.5 mt-1 font-mono">
                  {log.type === "workout" ? `-${log.cal} kcal burned` : `+${log.cal} kcal consumed`}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right Summary Dashboard stats */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-yellow-400" /> Compliance Scoring
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Weekly calorie compliance</span>
                <span className="font-bold text-emerald-400">92% (Optimal)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/50">Protein target adherence</span>
                <span className="font-bold text-emerald-400">96% (High)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Weekly workout streak rate</span>
                <span className="font-bold text-cyan-400">4 / 4 sessions hit</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-rose-500/10 bg-rose-500/5 text-xs text-rose-300/80 leading-relaxed flex items-start gap-2">
            <Settings className="h-4.5 w-4.5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-bold text-rose-200">Delete / Reset Notice</p>
              <p className="mt-0.5 text-[10px] leading-relaxed">
                Clearing history removes profiles, weekly logs, and target calibrations from your device local storage sandbox.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
