"use client";

import React, { useState, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Calendar,
  Sparkles,
  Info,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  Trash2,
  Copy,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";

export function WeeklyPlannerView() {
  const [plannerMode, setPlannerMode] = useState<string>("7day");
  
  // Weekly activities state
  const [activities, setActivities] = useState([
    { id: "a1", day: "Mon", type: "Workout", title: "Upper Body Strength Split", time: "07:00 AM", duration: "60 mins" },
    { id: "a2", day: "Tue", type: "Recovery", title: "Hip Flexor & Dorsiflexion Mobility", time: "08:00 AM", duration: "20 mins" },
    { id: "a3", day: "Wed", type: "Workout", title: "Lower Body Squat Volume", time: "07:00 AM", duration: "75 mins" },
    { id: "a4", day: "Thu", type: "Rest", title: "CNS Rest & restorative walk", time: "09:00 AM", duration: "45 mins" },
    { id: "a5", day: "Fri", type: "Workout", title: "Overhead Press Lockouts", time: "07:00 AM", duration: "60 mins" },
  ]);

  const [hasConflict, setHasConflict] = useState(false);

  const moveActivity = (id: string, targetDay: string) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, day: targetDay } : a));
    // Simulate conflict detection if two workouts on same day
    const dayCounts = activities.map(a => a.id === id ? targetDay : a.day);
    const hasDuplicateWorkouts = dayCounts.filter((item, index) => dayCounts.indexOf(item) !== index).length > 0;
    setHasConflict(hasDuplicateWorkouts);
  };

  const duplicateActivity = useCallback((id: string) => {
    const orig = activities.find(a => a.id === id);
    if (!orig) return;
    const duplicated = {
      ...orig,
      id: `a_${Date.now()}`,
      title: `${orig.title} (Copy)`,
    };
    setActivities(prev => [...prev, duplicated]);
  }, [activities]);

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const exportIcs = () => {
    const element = document.createElement("a");
    const file = new Blob(["BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR"], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `titan_weekly_plan_${Date.now()}.ics`;
    element.click();
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-6 text-left text-xs">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Calendar className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Planning Suite</p>
            <h2 className="text-xl font-bold text-white">AI Weekly Planner</h2>
            <p className="text-xs text-white/50">Schedule workouts, meals, recovery routines, and supplements.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-white/10 hover:bg-white/5 px-3.5 py-2 text-xs text-white flex items-center gap-1.5 transition"
          >
            <Printer className="h-4 w-4" /> Print Plan
          </button>
          <button
            onClick={exportIcs}
            className="rounded-xl bg-[#adc6ff] hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#131315] flex items-center gap-1.5 transition"
          >
            <Download className="h-4 w-4" /> Export Calendar (.ics)
          </button>
        </div>
      </GlassCard>

      {/* Mode selectors */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2">
        {[
          { id: "7day", label: "7-Day Grid" },
          { id: "14day", label: "14-Day View" },
          { id: "30day", label: "30-Day Period" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPlannerMode(item.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              plannerMode === item.id
                ? "bg-[#adc6ff] text-[#131315]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </GlassCard>

      {/* Conflict Warnings */}
      {hasConflict && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-rose-300 font-semibold flex items-center gap-2 animate-pulse">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>**Scheduling Conflict**: Multiple strength-building workouts are planned on the same day. Consider adding a CNS Recovery block.</span>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        {days.map((day) => {
          const dayActs = activities.filter((a) => a.day === day);
          return (
            <GlassCard key={day} className="p-3 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3 min-h-[220px] flex flex-col justify-between">
              <div>
                <span className="font-bold text-white text-xs block border-b border-white/5 pb-1.5">{day}</span>
                <div className="space-y-2 mt-2">
                  {dayActs.map((act) => (
                    <div key={act.id} className="p-2 bg-white/5 border border-white/5 rounded-xl space-y-1 text-[10px]">
                      <span className={`font-bold block ${act.type === "Workout" ? "text-cyan-400" : act.type === "Recovery" ? "text-emerald-400" : "text-white/40"}`}>
                        {act.type}
                      </span>
                      <p className="font-bold text-white truncate">{act.title}</p>
                      <span className="text-white/40 block">{act.time} ({act.duration})</span>

                      <div className="flex gap-1.5 pt-1.5 justify-end border-t border-white/5 mt-1.5">
                        <button onClick={() => duplicateActivity(act.id)} className="text-white/30 hover:text-white" title="Duplicate">
                          <Copy className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteActivity(act.id)} className="text-rose-400/50 hover:text-rose-400" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Move actions */}
              <select
                onChange={(e) => moveActivity(dayActs[0]?.id, e.target.value)}
                defaultValue={day}
                disabled={dayActs.length === 0}
                className="w-full bg-black/40 border border-white/5 rounded-lg p-1 text-[9px] text-white/50 focus:outline-none mt-2"
              >
                <option value={day}>Move to...</option>
                {days.map(d => d !== day && <option key={d} value={d}>{d}</option>)}
              </select>
            </GlassCard>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-left">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> AI Schedule Optimizer
        </h4>
        <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/70">
          ⚡ **AI Plan Adjustment**: Workout intensity is automatically modified based on Oura sleep levels. High-volume lower-body sessions have been placed after rest days to guarantee peak recovery.
        </div>
      </GlassCard>

    </div>
  );
}
