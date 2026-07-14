"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { StretchType } from "@/types/recovery";

export function StretchingPlans() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<StretchType>("rest-day");

  const fetchPlan = () => {
    setLoading(true);
    fetch(`/api/recovery/stretching?type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm">Stretch Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "pre-workout", label: "Pre-Workout" },
            { id: "post-workout", label: "Post-Workout" },
            { id: "rest-day", label: "Rest Day" },
            { id: "desk", label: "Desk Routine" },
            { id: "travel", label: "Travel" },
          ].map((t) => (
            <button key={t.id} onClick={() => setType(t.id as StretchType)} className={`rounded-xl border p-2.5 text-center text-[10px] font-bold transition ${type === t.id ? "border-[var(--accent)] bg-[var(--accent-glow)] text-white" : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={fetchPlan} disabled={loading} variant="premium" className="w-full text-xs py-2 justify-center">
          {loading ? "Loading..." : "Load Stretch Plan"}
        </Button>
      </GlassCard>

      {plan ? (
        <GlassCard className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div>
              <h3 className="font-bold text-white text-md">{plan.title}</h3>
              <p className="text-[10px] text-[var(--foreground-muted)]">{plan.duration} min • {plan.type}</p>
            </div>
          </div>
          <div className="space-y-3">
            {plan.exercises.map((ex: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-white text-xs">{ex.name}</p>
                  <span className="text-[9px] text-[var(--accent)] font-mono">{ex.duration}s</span>
                </div>
                <p className="text-[10px] text-[var(--foreground-muted)]">{ex.instructions}</p>
                <p className="text-[9px] text-cyan-400">Target: {ex.targetArea}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 h-64 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs text-[var(--foreground-muted)]">Select a stretch type and load a plan.</p>
        </GlassCard>
      )}
    </div>
  );
}
