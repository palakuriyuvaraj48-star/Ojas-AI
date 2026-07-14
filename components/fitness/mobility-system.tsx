"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Activity, Clock, Target } from "lucide-react";
import { saveMobilitySession } from "@/lib/recovery/storage";

export function MobilitySystem() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("general");
  const [time, setTime] = useState(15);

  const fetchPlan = () => {
    setLoading(true);
    fetch(`/api/recovery/mobility?target=${target}&time=${time}`)
      .then((res) => res.json())
      .then((data) => {
        saveMobilitySession(data);
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--accent)] animate-pulse" /> Mobility Settings
        </h3>
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Target Area</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
              <option value="general">General Full Body</option>
              <option value="legs">Legs Recovery</option>
              <option value="upper">Upper Body</option>
              <option value="back">Spine & Back</option>
              <option value="desk">Desk Mobility</option>
              <option value="travel">Travel Routine</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Time Available</label>
            <select value={time} onChange={(e) => setTime(parseInt(e.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
        <Button onClick={fetchPlan} disabled={loading} variant="premium" className="w-full text-xs py-2 justify-center">
          {loading ? "Generating..." : "Generate Mobility Plan"}
        </Button>
      </GlassCard>

      <div className="space-y-4">
        {plan ? (
          <GlassCard className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div>
                <h3 className="font-bold text-white text-md">{plan.title}</h3>
                <p className="text-[10px] text-[var(--foreground-muted)] capitalize">{plan.difficulty} • {plan.duration} min • {plan.targetMuscles.join(", ")}</p>
              </div>
              <div className="text-right">
                <Badge variant="primary" label={plan.focus} />
              </div>
            </div>
            <p className="text-xs text-[var(--foreground-muted)] italic">{plan.aiNote}</p>
            <div className="space-y-3">
              {plan.exercises.map((ex: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white text-xs">{ex.name}</p>
                    <span className="text-[9px] text-[var(--accent)] font-mono">{ex.duration}s • {ex.sets} sets</span>
                  </div>
                  <p className="text-[10px] text-[var(--foreground-muted)]">{ex.instructions}</p>
                  {ex.hold && <p className="text-[9px] text-emerald-400">Hold: {ex.hold}</p>}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 h-64 flex flex-col items-center justify-center text-center space-y-2">
            <Activity className="h-10 w-10 text-white/20 animate-pulse" />
            <p className="text-xs text-[var(--foreground-muted)]">Configure target and generate your personalized mobility plan.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
