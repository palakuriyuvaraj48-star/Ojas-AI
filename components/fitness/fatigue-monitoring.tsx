"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Activity, Gauge } from "lucide-react";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { estimateFatigue, RecoverySignals } from "@/lib/recovery";

export function FatigueMonitoring({ onRecommendationChange }: { onRecommendationChange?: (rec: string) => void }) {
  const { loading, signals } = useRecovery();
  const [fatigue, setFatigue] = useState(45);
  const [consecutiveDays, setConsecutiveDays] = useState(3);
  const [trainingLoad, setTrainingLoad] = useState(78);
  const [sleepQuality, setSleepQuality] = useState(82);
  const [warning, setWarning] = useState<string | null>(null);

  // Seed the simulator from the real engine signals.
  useEffect(() => {
    if (!loading && signals) {
      setFatigue(Math.round(100 - signals.sleepQuality * 0.3 - (100 - signals.trainingLoad) * 0.3));
      setConsecutiveDays(signals.consecutiveTrainingDays);
      setTrainingLoad(Math.round(signals.trainingLoad));
      setSleepQuality(Math.round(signals.sleepQuality));
    }
  }, [loading, signals]);

  const factorSignals: RecoverySignals = useMemo(
    () => ({
      sleepDuration: signals?.sleepDuration ?? 7.5,
      sleepQuality,
      sleepConsistency: signals?.sleepConsistency ?? 80,
      sleepDebt: signals?.sleepDebt ?? 0,
      trainingLoad,
      consecutiveTrainingDays: consecutiveDays,
      hydrationLiters: signals?.hydrationLiters ?? 2,
      hydrationTargetLiters: signals?.hydrationTargetLiters ?? 2.8,
      nutritionConsistency: signals?.nutritionConsistency ?? 80,
      stressLevel: signals?.stressLevel ?? 35,
      soreness: signals?.soreness ?? [],
    }),
    [signals, sleepQuality, trainingLoad, consecutiveDays]
  );

  const fatigueStatus = estimateFatigue(factorSignals);

  useEffect(() => {
    if (fatigueStatus.fatigueLevel > 75) {
      setWarning("High fatigue risk. Consider reducing today's training intensity by 30%.");
      onRecommendationChange?.("reduce");
    } else if (fatigueStatus.fatigueLevel > 55) {
      setWarning("Moderate fatigue. Proceed with caution and monitor form closely.");
      onRecommendationChange?.("moderate");
    } else {
      setWarning(null);
      onRecommendationChange?.("train");
    }
  }, [fatigueStatus.fatigueLevel, onRecommendationChange]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--accent)]" /> Fatigue Inputs
          </h3>
          <div className="space-y-4 text-xs">
            <Slider label="Systemic Fatigue" value={fatigueStatus.fatigueLevel} onChange={setFatigue} />
            <Slider label="Consecutive Days" value={consecutiveDays} max={7} onChange={setConsecutiveDays} />
            <Slider label="Training Load" value={trainingLoad} onChange={setTrainingLoad} />
            <Slider label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-[var(--accent)]" /> Fatigue Drivers</h3>
          <div className="space-y-2 text-xs">
            {fatigueStatus.factors.map((f) => {
              const pct = Math.min(100, f.impact);
              const color = f.impact > 12 ? "text-rose-400" : f.impact > 6 ? "text-yellow-400" : "text-emerald-400";
              return (
                <div key={f.factor} className="space-y-1">
                  <div className="flex justify-between"><span className="text-white/60">{f.factor}</span><span className={`font-bold ${color}`}>{f.impact}</span></div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className={`h-full ${color.replace("text", "bg")}`} style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4 lg:col-span-1 xl:col-span-1">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            {warning ? <AlertTriangle className="h-4 w-4 text-yellow-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            Status
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{warning || "Fatigue levels are within acceptable range. Training can proceed normally."}</p>
          <div className="text-[10px] text-[var(--foreground-muted)]">
            Confidence: 84% • Updated just now
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, max = 100 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="text-white/60">{label}</span><span className="font-bold text-white">{value}{max === 7 ? "d" : "%"}</span></div>
      <input type="range" min="0" max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full accent-[var(--accent)]" />
    </div>
  );
}
