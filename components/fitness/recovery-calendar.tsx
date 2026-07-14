"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { getTimeline } from "@/lib/recovery/storage";

export function RecoveryCalendar() {
  const timeline = getTimeline(14);

  // Extend to a fixed 14-day grid anchored on today.
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const date = d.toISOString().split("T")[0];
    const match = timeline.find((t) => t.date === date);
    const isToday = i === 13;
    const restDay = match ? match.restDay : i % 4 === 3;
    const recoveryScore = match ? match.score : Math.round(70 + ((i * 5) % 25));
    return {
      date,
      day: d.toLocaleDateString([], { weekday: "short" }),
      dateNum: d.getDate(),
      isToday,
      isWorkout: !restDay,
      isRest: restDay,
      recoveryScore,
      type: restDay ? "rest" : "workout",
    };
  });

  return (
    <div className="space-y-6">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" /> Training &amp; Recovery Calendar
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`relative p-2.5 rounded-2xl border text-center space-y-1 ${
                day.isToday ? "border-[var(--accent)] bg-[var(--accent-glow)]" : "border-white/5 bg-white/5"
              }`}
            >
              <p className="text-[9px] text-white/50 font-bold uppercase">{day.day}</p>
              <p className={`text-lg font-black ${day.isToday ? "text-[var(--accent)]" : "text-white"}`}>{day.dateNum}</p>
              <div className={`h-1.5 rounded-full ${day.type === "workout" ? "bg-emerald-400" : "bg-yellow-400"}`} />
              <p className="text-[8px] text-white/40">{day.recoveryScore}%</p>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-emerald-400" /><span className="text-xs text-white/70">Training Day</span></div>
          <p className="text-[10px] text-[var(--foreground-muted)]">High-intensity lifting with progressive overload focus.</p>
        </GlassCard>
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-cyan-400" /><span className="text-xs text-white/70">Mobility / Active Recovery</span></div>
          <p className="text-[10px] text-[var(--foreground-muted)]">Low-load movement to promote blood flow and reduce DOMS.</p>
        </GlassCard>
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-yellow-400" /><span className="text-xs text-white/70">Rest Day</span></div>
          <p className="text-[10px] text-[var(--foreground-muted)]">Full rest or light activity. Prioritize sleep and nutrition.</p>
        </GlassCard>
      </div>
    </div>
  );
}
