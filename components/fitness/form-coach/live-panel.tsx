"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle2, AlertTriangle, Mic, MicOff, Play, Square, RotateCcw, Trophy, Timer, HeartPulse, ShieldAlert, Sparkles, Gauge } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/design-system";
import type { FormCoachApi } from "./use-form-coach";

function fmt(ms: number | undefined) {
  if (!ms) return "0.0s";
  return `${(ms / 1000).toFixed(1)}s`;
}

const METRIC_LABELS: { key: keyof FormCoachApi["liveMetrics"]; label: string }[] = [
  { key: "stability", label: "Stability" },
  { key: "consistency", label: "Consistency" },
  { key: "tempo", label: "Tempo" },
  { key: "control", label: "Control" },
  { key: "rangeOfMotion", label: "ROM" },
];

export function LivePanel({ coach }: { coach: FormCoachApi }) {
  const elapsed = `${String(Math.floor(coach.seconds / 60)).padStart(2, "0")}:${String(coach.seconds % 60).padStart(2, "0")}`;
  const score = coach.liveScore;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-3" glow>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#adc6ff]">Live analysis</p>
          <h3 className="mt-1 text-lg font-bold text-white">{coach.exercise.name}</h3>
          <p className="flex items-center gap-1 text-xs text-white/50"><Timer className="h-3.5 w-3.5" />{elapsed} · Set {coach.sets + 1}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!coach.workoutRunning ? (
            <button onClick={coach.startWorkout} className="rounded-xl bg-[#adc6ff] px-4 py-2.5 text-xs font-bold text-[#131315]">
              <Play className="mr-1 inline h-4 w-4" />Start workout
            </button>
          ) : (
            <>
              <button onClick={coach.finishSet} className="rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-white">
                <CheckCircle2 className="mr-1 inline h-4 w-4" />Finish set
              </button>
              <button onClick={coach.stopWorkout} className="rounded-xl bg-rose-500/80 px-4 py-2.5 text-xs font-bold text-white">
                <Square className="mr-1 inline h-4 w-4" />Stop
              </button>
            </>
          )}
          <button onClick={coach.toggleVoice} className="rounded-xl border border-white/10 p-2.5 text-white/70" aria-label="Toggle voice">
            {coach.voiceOn ? <Mic className="h-4 w-4 text-[#adc6ff]" /> : <MicOff className="h-4 w-4" />}
          </button>
        </div>
      </GlassCard>

      {/* Score + metrics */}
      <GlassCard className="flex items-center gap-5">
        <div className="relative">
          <ProgressRing progress={score} size={92} strokeWidth={8} color={score >= 80 ? "#34d399" : score >= 60 ? "#facc15" : "#fb7185"} />
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-xl font-black text-white">{score}</p>
              <p className="text-[8px] uppercase text-white/40">Form</p>
            </div>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
          {METRIC_LABELS.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/5 bg-white/5 p-2">
              <p className="text-[8px] uppercase text-white/40">{m.label}</p>
              <p className="text-sm font-bold text-white">{coach.liveMetrics[m.key]}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Rep counter */}
      <GlassCard className="grid grid-cols-4 gap-2 text-center">
        <Stat icon={<Activity className="h-4 w-4 text-[#adc6ff]" />} label="Reps" value={coach.reps} highlight />
        <Stat icon={<RotateCcw className="h-4 w-4 text-amber-300" />} label="Partial" value={coach.partialReps} />
        <Stat icon={<Trophy className="h-4 w-4 text-emerald-300" />} label="Sets" value={coach.sets} />
        <Stat icon={<Gauge className="h-4 w-4 text-cyan-300" />} label="In set" value={coach.currentSetReps.length} />
      </GlassCard>
      <div className="flex gap-2">
        <button onClick={coach.manualRep} disabled={!coach.workoutRunning} className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-bold text-white disabled:opacity-40">
          + Manual rep
        </button>
        <button onClick={coach.manualPartial} disabled={!coach.workoutRunning} className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-bold text-white disabled:opacity-40">
          + Partial
        </button>
      </div>

      {/* Motion Analysis Confidence Rating */}
      <GlassCard className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-xl">
        <div className="flex items-center gap-2 text-left">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-[10px] font-bold text-white/70 uppercase">Motion Tracking Confidence</p>
            <p className="text-[9px] text-white/40">Real-time MediaPipe joint recognition rating</p>
          </div>
        </div>
        <span className="text-xs font-bold font-mono text-cyan-400">
          {coach.mode === "live" ? `${Math.round((coach.confidence ?? 0.9) * 100)}%` : "100% (Simulated)"}
        </span>
      </GlassCard>

      {/* Tempo / ROM / Symmetry */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="space-y-2">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><Timer className="h-3.5 w-3.5" />Tempo</p>
          <TempoBar label="Lower" ms={coach.lastTempo?.loweringMs} color="#38bdf8" />
          <TempoBar label="Pause" ms={coach.lastTempo?.pauseMs} color="#a78bfa" />
          <TempoBar label="Lift" ms={coach.lastTempo?.liftingMs} color="#34d399" />
        </GlassCard>

        <GlassCard className="space-y-2">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><Activity className="h-3.5 w-3.5" />Range</p>
          {coach.rom ? (
            <>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-white">{coach.rom.observedRange}°</span>
                <span className="text-xs text-white/40">/ {coach.rom.expectedRange}°</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-cyan-400" animate={{ width: `${Math.min(100, coach.rom.completeness * 100)}%` }} />
              </div>
              {coach.rom.shallow && <Badge label="Shallow" variant="warning" />}
              {!coach.rom.shallow && <Badge label="Full depth" variant="success" />}
            </>
          ) : <p className="text-xs text-white/40">Complete a rep to measure range.</p>}
        </GlassCard>

        <GlassCard className="space-y-2">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><HeartPulse className="h-3.5 w-3.5" />Symmetry</p>
          {coach.symmetry ? (
            <>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-white">{Math.round(coach.symmetry.symmetryIndex * 100)}</span>
                <span className="text-xs text-white/40">L {coach.symmetry.leftAngle}° · R {coach.symmetry.rightAngle}°</span>
              </div>
              {coach.symmetry.flagged ? <Badge label={`Asym ${coach.symmetry.asymmetryPct}%`} variant="warning" /> : <Badge label="Balanced" variant="success" />}
            </>
          ) : <p className="text-xs text-white/40">Tracking left vs right…</p>}
        </GlassCard>
      </div>

      {/* Live feedback */}
      <GlassCard className="space-y-2">
        <p className="text-[10px] font-bold uppercase text-white/50">Real-time coaching</p>
        <div className="max-h-32 space-y-1.5 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {coach.feedback.length === 0 && <p className="text-xs text-white/40">Start moving to receive form cues.</p>}
            {coach.feedback.map((f) => (
              <motion.p
                key={f.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-lg border px-2.5 py-1.5 text-xs ${severityClass(f.severity)}`}
              >
                {f.message}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* AI Coaching summary */}
      <AnimatePresence>
        {coach.coaching && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="space-y-3" glow>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Sparkles className="h-4 w-4 animate-pulse text-[#adc6ff]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Coaching</h4>
              </div>
              <CoachingList title="Strengths" items={coach.coaching.strengths} tone="success" />
              <CoachingList title="To improve" items={coach.coaching.improvements} tone="warning" />
              <CoachingList title="Try this" items={coach.coaching.corrections} tone="primary" />
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety */}
      <AnimatePresence>
        {coach.safetyMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="border-amber-400/30 bg-amber-500/10">
              <p className="flex items-start gap-2 text-xs text-amber-100"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{coach.safetyMessage}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={coach.reportPain}
        className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold ${coach.painReported ? "border-rose-400/40 bg-rose-500/10 text-rose-200" : "border-white/10 text-white/60"}`}
      >
        <AlertTriangle className="mr-1 inline h-4 w-4" />{coach.painReported ? "Pain noted — rest advised" : "I feel pain (safety)"}
      </button>
    </div>
  );
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-2">
      <div className="flex justify-center">{icon}</div>
      <motion.p key={value} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`text-xl font-black ${highlight ? "text-[#adc6ff]" : "text-white"}`}>{value}</motion.p>
      <p className="text-[8px] uppercase text-white/40">{label}</p>
    </div>
  );
}

function TempoBar({ label, ms, color }: { label: string; ms?: number; color: string }) {
  const max = 2000;
  const w = ms ? Math.min(100, (ms / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] text-white/50"><span>{label}</span><span>{ms ? fmt(ms) : "—"}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

function CoachingList({ title, items, tone }: { title: string; items: string[]; tone: "success" | "warning" | "primary" }) {
  const color = tone === "success" ? "text-emerald-300" : tone === "warning" ? "text-amber-300" : "text-[#adc6ff]";
  if (!items.length) return null;
  return (
    <div>
      <p className={`text-[10px] font-bold uppercase ${color}`}>{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((it, i) => <li key={i} className="text-xs text-white/75">• {it}</li>)}
      </ul>
    </div>
  );
}

function severityClass(sev: string) {
  if (sev === "danger") return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  if (sev === "warning") return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  if (sev === "success") return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  return "border-white/10 bg-white/5 text-white/70";
}
