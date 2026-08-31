"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Moon, Sun, Activity, TrendingUp, AlertTriangle, Save } from "lucide-react";
import { analyzeSleep, RecoverySignals } from "@/lib/recovery";
import { getSleepLogs, saveSleepLog, SleepLogRecord } from "@/lib/recovery/storage";

export function SleepAnalysis() {
  const [sleepData, setSleepData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ duration: "7.5", quality: "82", bedtime: "22:30", wakeTime: "06:45" });
  const [saved, setSaved] = useState<SleepLogRecord | null>(null);

  const applyFromLog = useCallback((log: SleepLogRecord) => {
    const signals: RecoverySignals = {
      sleepDuration: log.duration,
      sleepQuality: log.quality,
      sleepConsistency: log.consistency,
      sleepDebt: log.sleepDebt,
      trainingLoad: 50,
      consecutiveTrainingDays: 3,
      hydrationLiters: 2,
      hydrationTargetLiters: 2.8,
      nutritionConsistency: 80,
      stressLevel: 40,
      soreness: [],
    };
    const a = analyzeSleep(signals);
    setSleepData({
      duration: `${Math.floor(a.durationHours)}h ${Math.round((a.durationHours % 1) * 60)}m`,
      quality: a.quality,
      sleepDebt: `${a.sleepDebt.toFixed(1)}h`,
      weeklyAverage: `${Math.floor(a.weeklyAverageHours)}h ${Math.round((a.weeklyAverageHours % 1) * 60)}m`,
      consistency: a.consistency,
      deepSleep: `${Math.floor(a.deepSleepHours)}h ${Math.round((a.deepSleepHours % 1) * 60)}m`,
      remSleep: `${Math.floor(a.remSleepHours)}h ${Math.round((a.remSleepHours % 1) * 60)}m`,
      bedtime: a.bedtime,
      wakeTime: a.wakeTime,
      aiInsight: a.aiInsight,
      weeklyTrend: a.weeklyTrend,
      recommendations: a.recommendations,
    });
  }, []);

  useEffect(() => {
    const existing = getSleepLogs();
    if (existing.length) {
      setSaved(existing[existing.length - 1]);
      applyFromLog(existing[existing.length - 1]);
      setLoading(false);
      return;
    }
    fetch("/api/recovery/sleep?action=today")
      .then((res) => res.json())
      .then((data) => {
        setSleepData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [applyFromLog]);

  const handleSave = () => {
    const duration = parseFloat(form.duration) || 7.5;
    const quality = parseInt(form.quality) || 80;
    const debt = Math.max(0, 7.5 - duration);
    const consistency = 85;
    const log: Omit<SleepLogRecord, "id"> = {
      date: new Date().toISOString().split("T")[0],
      duration,
      quality,
      sleepDebt: debt,
      deepSleep: Math.round(duration * 0.18 * 10) / 10,
      remSleep: Math.round(duration * 0.22 * 10) / 10,
      consistency,
      bedtime: form.bedtime,
      wakeTime: form.wakeTime,
      aiInsight: "",
    };
    const savedLog = saveSleepLog(log);
    setSaved(savedLog);
    applyFromLog(savedLog);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
      </div>
    );
  }

  if (!sleepData) return null;

  return (
    <div className="space-y-6">
      {saved && (
        <GlassCard className="p-4 border-emerald-400/20 bg-emerald-400/5 text-[10px] text-emerald-300">
          Showing your logged sleep for {saved.date}. Edit and save to update your recovery analysis.
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-[var(--accent)]" />
            <h3 className="font-semibold text-white text-sm">Sleep Duration</h3>
          </div>
          <div className="text-center py-4">
            <h4 className="text-4xl font-black text-white">{sleepData.duration}</h4>
            <p className="text-xs text-[var(--foreground-muted)] mt-1">Target: 7.5 - 8h</p>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${Math.min(100, (parseFloat(sleepData.duration) / 8) * 100)}%` }} />
          </div>
          <div className="text-[10px] text-[var(--foreground-muted)] space-y-1">
            <div className="flex justify-between"><span>Bedtime</span><span className="text-white">{sleepData.bedtime}</span></div>
            <div className="flex justify-between"><span>Wake Time</span><span className="text-white">{sleepData.wakeTime}</span></div>
            <div className="flex justify-between"><span>Consistency</span><span className="text-emerald-400">{sleepData.consistency}%</span></div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Sleep Architecture</h3>
          </div>
          <div className="space-y-3 text-xs">
            <Row label="Deep Sleep" value={sleepData.deepSleep} />
            <Row label="REM Sleep" value={sleepData.remSleep} />
            <Row label="Sleep Debt" value={sleepData.sleepDebt} highlight={!sleepData.sleepDebt.includes("-")} />
            <Row label="Weekly Avg" value={sleepData.weeklyAverage} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Quality Score</h3>
          </div>
          <div className="flex items-center justify-center py-2">
            <div className="relative h-32 w-32">
              <svg className="absolute h-full w-full -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-white/10 fill-none" strokeWidth="10" />
                <circle cx="64" cy="64" r="56" className="stroke-emerald-400 fill-none transition-all duration-700" strokeWidth="10" strokeDasharray={352} strokeDashoffset={352 - (352 * sleepData.quality) / 100} strokeLinecap="round" />
              </svg>
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <span className="text-2xl font-black text-white">{sleepData.quality}%</span>
                <span className="text-[9px] text-white/50 uppercase">Quality</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold text-center">Trend: {sleepData.weeklyTrend}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-5 border-[var(--border-subtle)]">
        <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--accent)]" /> AI Sleep Insight
        </h3>
        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{sleepData.aiInsight}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sleepData.recommendations.slice(0, 4).map((rec: string, idx: number) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-white/70">{rec}</div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
        <h3 className="font-bold text-white text-sm flex items-center gap-2"><Save className="h-4 w-4 text-[var(--accent)]" /> Log Last Night&apos;s Sleep</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Input label="Duration (h)" type="number" step="0.1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <Input label="Quality (%)" type="number" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} />
          <Input label="Bedtime" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} />
          <Input label="Wake Time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} />
        </div>
        <Button onClick={handleSave} variant="premium" className="w-full text-xs py-2 justify-center">Save Sleep Log</Button>
      </GlassCard>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/5">
      <span className="text-white/60">{label}</span>
      <span className={`font-bold ${highlight ? "text-yellow-400" : "text-white"}`}>{value}</span>
    </div>
  );
}
