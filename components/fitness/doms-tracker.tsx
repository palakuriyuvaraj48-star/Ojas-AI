"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, CheckCircle2, AlertTriangle, Flame } from "lucide-react";
import { MUSCLE_GROUPS, SorenessLevel } from "@/lib/recovery";
import { addDOMSLog, getDOMSLogs, DOMSLogRecord } from "@/lib/recovery/storage";

const SORENESS_TO_NUM: Record<SorenessLevel, number> = { none: 10, low: 35, medium: 60, high: 85 };

export function DOMSTracker() {
  const [logs, setLogs] = useState<DOMSLogRecord[]>([]);
  const [muscles, setMuscles] = useState<string[]>(MUSCLE_GROUPS as unknown as string[]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ muscle: "Quads", sorenessLevel: "medium" as SorenessLevel, painScore: 5, notes: "" });

  useEffect(() => {
    setLogs(getDOMSLogs());
    fetch("/api/recovery/doms")
      .then((res) => res.json())
      .then((data) => setMuscles(data.availableMuscles || MUSCLE_GROUPS))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addDOMSLog({
      muscle: form.muscle,
      sorenessLevel: form.sorenessLevel,
      painScore: form.painScore,
      notes: form.notes,
    });
    setLogs((prev) => [created, ...prev]);
    setForm({ ...form, painScore: 5, notes: "" });
  };

  // Latest soreness per muscle -> heat map
  const latest = new Map<string, DOMSLogRecord>();
  for (const l of logs) {
    const prev = latest.get(l.muscle);
    if (!prev || l.date > prev.date) latest.set(l.muscle, l);
  }
  const heatMap = muscles.map((m) => {
    const rec = latest.get(m);
    return { muscle: m, score: rec ? SORENESS_TO_NUM[rec.sorenessLevel] : 12 };
  });

  const avgSoreness = heatMap.length ? Math.round(heatMap.reduce((s, m) => s + m.score, 0) / heatMap.length) : 0;
  const recoveryEstimate = Math.max(10, 100 - avgSoreness);

  const sorenessColor = (level: string) => {
    switch (level) {
      case "high": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-white/60 bg-white/5 border-white/5";
    }
  };
  const heatColor = (score: number) =>
    score >= 70 ? "text-rose-400 bg-rose-500/10" : score >= 40 ? "text-yellow-400 bg-yellow-500/10" : "text-emerald-400 bg-emerald-500/10";

  const modifications = avgSoreness >= 60
    ? ["Swap heavy compounds for machines/isolation", "Cut volume 30-40% on sore muscles", "Add 10 min foam rolling post-session"]
    : avgSoreness >= 40
      ? ["Reduce load 15-20% on limited muscles", "Prioritise a thorough warm-up", "Add post-workout stretching"]
      : ["Train normally — muscles are recovered", "Maintain progressive overload"];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-yellow-400" /> Log Soreness
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">Muscle Group</label>
              <select value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
                {muscles.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">Soreness Level</label>
              <select value={form.sorenessLevel} onChange={(e) => setForm({ ...form, sorenessLevel: e.target.value as SorenessLevel })} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">Pain Score (1-10)</label>
              <input type="range" min="1" max="10" value={form.painScore} onChange={(e) => setForm({ ...form, painScore: parseInt(e.target.value) })} className="w-full accent-[var(--accent)]" />
              <div className="flex justify-between text-[9px] text-white/35 mt-1"><span>1 (Painless)</span><span className="text-white font-bold">{form.painScore}</span><span>10 (Severe)</span></div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none" />
            </div>
            <Button type="submit" variant="premium" className="w-full text-xs py-2 justify-center">Log Soreness</Button>
          </form>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" /> Muscle Heat Map</h3>
            <div className="grid grid-cols-3 gap-2">
              {heatMap.map((m) => (
                <div key={m.muscle} className={`p-2.5 rounded-xl border border-white/5 text-center ${heatColor(m.score)}`}>
                  <p className="text-[9px] font-bold uppercase">{m.muscle}</p>
                  <p className="text-sm font-black mt-0.5">{m.score}%</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[10px] text-white/50">Recovery Estimate</span>
              <span className="text-sm font-black text-white">{recoveryEstimate}%</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-2">
            <h3 className="font-bold text-white text-sm">Suggested Exercise Modifications</h3>
            {modifications.map((mod, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-white/70">
                <span className="text-[var(--accent)] mt-0.5">•</span>{mod}
              </div>
            ))}
          </GlassCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-white text-sm">Soreness History</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl border space-y-2 ${sorenessColor(log.sorenessLevel)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-sm capitalize">{log.muscle}</p>
                    <p className="text-[9px] opacity-70">{log.date} • Pain Score: {log.painScore}/10</p>
                  </div>
                  {log.painScore >= 7 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <p className="text-[10px] leading-relaxed opacity-80">{log.recommendedAction}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
