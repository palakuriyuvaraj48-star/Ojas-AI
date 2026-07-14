"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { getRecoveryLogs } from "@/lib/recovery/storage";

export function RecoveryHistory() {
  const logs = getRecoveryLogs();

  const history = logs.length
    ? logs.slice().reverse().slice(0, 14)
    : [
        { id: "1", date: "2024-07-12", recoveryScore: 82, readiness: "fresh", sleepDuration: 7.5, sleepQuality: 82, fatigueLevel: 28, trainingLoad: 75, aiRecommendation: "Train moderately. Focus on compound lifts.", userNotes: "Felt good today." },
        { id: "2", date: "2024-07-11", recoveryScore: 74, readiness: "moderate", sleepDuration: 7.0, sleepQuality: 78, fatigueLevel: 38, trainingLoad: 80, aiRecommendation: "Moderate training. Reduce leg volume by 20%.", userNotes: "Sore quads from yesterday." },
        { id: "3", date: "2024-07-10", recoveryScore: 68, readiness: "fatigued", sleepDuration: 6.5, sleepQuality: 70, fatigueLevel: 48, trainingLoad: 85, aiRecommendation: "Light training or mobility only.", userNotes: "Poor sleep, high stress." },
        { id: "4", date: "2024-07-09", recoveryScore: 85, readiness: "fresh", sleepDuration: 8.0, sleepQuality: 88, fatigueLevel: 22, trainingLoad: 60, aiRecommendation: "Train hard. Optimal recovery window.", userNotes: "" },
      ];

  const readinessColor = (r: string) => {
    switch (r) {
      case "fresh": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "moderate": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "fatigued": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      default: return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Recovery History</h3>
        <span className="text-[10px] text-[var(--foreground-muted)]">Last {history.length} entries</span>
      </div>
      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-white text-xs">{entry.date}</p>
                <p className="text-[10px] text-[var(--foreground-muted)]">Score: {entry.recoveryScore}% • Fatigue: {entry.fatigueLevel}%</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${readinessColor(entry.readiness)}`}>{entry.readiness}</span>
            </div>
            <p className="text-[10px] text-white/60">{entry.aiRecommendation}</p>
            {entry.userNotes && <p className="text-[9px] text-[var(--foreground-muted)] italic">Note: {entry.userNotes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
