"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  Play,
  Square,
  RotateCcw,
  Trophy,
  Timer,
  HeartPulse,
  ShieldAlert,
  Sparkles,
  Gauge,
  HelpCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Info,
  ScanLine,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/design-system";
import type { FormCoachApi, RepSummary } from "./use-form-coach";

function fmt(ms: number | undefined) {
  if (!ms) return "0.0s";
  return `${(ms / 1000).toFixed(1)}s`;
}

const METRIC_LABELS: { key: keyof FormCoachApi["liveMetrics"]; label: string; desc: string }[] = [
  { key: "stability", label: "Stability", desc: "Torso & joint steady state" },
  { key: "consistency", label: "Consistency", desc: "Repetition-to-repetition match" },
  { key: "tempo", label: "Tempo", desc: "Lowering vs lifting ratio" },
  { key: "control", label: "Control", desc: "Smooth acceleration profile" },
  { key: "rangeOfMotion", label: "ROM", desc: "Target joint depth reached" },
];

export function LivePanel({ coach }: { coach: FormCoachApi }) {
  const elapsed = `${String(Math.floor(coach.seconds / 60)).padStart(2, "0")}:${String(
    coach.seconds % 60
  ).padStart(2, "0")}`;
  const score = coach.liveScore;
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const phaseColors: Record<string, { bg: string; text: string; border: string }> = {
    ready: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/30" },
    descending: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
    bottom: { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
    ascending: { bg: "bg-cyan-500/15", text: "text-cyan-300", border: "border-cyan-500/30" },
    complete: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
  };

  const currentPhaseStyle = phaseColors[coach.movementPhase] || phaseColors.ready;

  return (
    <div className="space-y-4 text-left">
      {/* Controls & Header */}
      <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-5" glow>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#adc6ff]">
              Live Vision Intelligence
            </p>
          </div>
          <h3 className="mt-1 text-lg font-bold text-white">{coach.exercise.name}</h3>
          <p className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {elapsed}
            </span>
            <span>·</span>
            <span className="font-semibold text-cyan-300">Set {coach.sets + 1}</span>
            <span>·</span>
            <span>Target: {coach.targetRepsPerSet} reps</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!coach.workoutRunning ? (
            <button
              onClick={coach.startWorkout}
              className="rounded-xl bg-[#adc6ff] px-4 py-2.5 text-xs font-bold text-[#131315] hover:brightness-110 transition shadow-md shadow-cyan-500/20"
            >
              <Play className="mr-1.5 inline h-4 w-4 fill-current" />
              Start workout
            </button>
          ) : (
            <>
              <button
                onClick={coach.finishSet}
                className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition"
              >
                <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-emerald-400" />
                Finish set
              </button>
              <button
                onClick={() => {
                  coach.stopWorkout();
                  setShowSummaryModal(true);
                }}
                className="rounded-xl bg-rose-500/80 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition"
              >
                <Square className="mr-1.5 inline h-4 w-4 fill-current" />
                End workout
              </button>
            </>
          )}
          <button
            onClick={coach.toggleVoice}
            className={`rounded-xl border p-2.5 transition ${
              coach.voiceOn ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/40"
            }`}
            aria-label="Toggle voice coach"
          >
            {coach.voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>
        </div>
      </GlassCard>

      {/* Movement Phase & Rest Indicator */}
      <div className="grid gap-3 sm:grid-cols-2">
        <GlassCard className={`p-3.5 border ${currentPhaseStyle.border} ${currentPhaseStyle.bg} flex items-center justify-between`}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Current Movement Phase</p>
            <p className={`text-sm font-black uppercase mt-0.5 ${currentPhaseStyle.text}`}>
              {coach.movementPhase}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${currentPhaseStyle.border} ${currentPhaseStyle.text}`}>
            Phase Active
          </span>
        </GlassCard>

        {coach.inRest ? (
          <GlassCard className="p-3.5 border border-amber-500/30 bg-amber-500/15 flex items-center justify-between animate-pulse">
            <div>
              <p className="text-[9px] font-bold uppercase text-amber-300/70">Set Rest Interval</p>
              <p className="text-sm font-black text-amber-300">{coach.restSeconds}s Remaining</p>
            </div>
            <button
              onClick={() => coach.finishSet()}
              className="text-[10px] font-bold text-amber-200 bg-amber-500/30 border border-amber-400/40 px-2.5 py-1 rounded-lg"
            >
              Skip Rest
            </button>
          </GlassCard>
        ) : (
          <GlassCard className="p-3.5 border border-white/5 bg-white/5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase text-white/40">Tracking Fidelity</p>
              <p className="text-sm font-bold text-white">
                {coach.mode === "live" ? "Live Vision Stream" : "Kinematic Simulator"}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {Math.round((coach.confidence || 0.95) * 100)}% Confidence
            </span>
          </GlassCard>
        )}
      </div>

      {/* Live Form Comparison (Expected vs User Movement) */}
      <GlassCard className="p-4 border-white/10 bg-black/30 space-y-2.5">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <ScanLine className="h-3.5 w-3.5" />
            Live Form Comparison (Expected vs Detected)
          </p>
          <span className="text-[10px] text-white/40">Real-Time Biomechanics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Expected */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[9px] font-bold uppercase text-emerald-300">Expected Form Target</span>
            <p className="text-white/80 font-medium">
              Depth: <strong>{coach.exercise.repBottomAngle}°</strong> ({coach.exercise.primaryJoint})
            </p>
            <p className="text-[10px] text-white/50">Tempo: 2.0s eccentric / 1.0s concentric</p>
          </div>

          {/* User Current */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[9px] font-bold uppercase text-cyan-300">User Current Detected</span>
            <p className="text-white font-medium">
              Observed Depth: <strong>{Math.round(coach.rom?.observedRange ?? coach.frame?.angles[coach.exercise.primaryJoint] ?? 160)}°</strong>
            </p>
            <p className="text-[10px] text-cyan-200">
              {coach.partialReps > 0 ? "⚠️ Go slightly deeper to reach target" : "✓ Alignment within tolerance"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Live Form Score + 5 Metric Gauges */}
      <GlassCard className="p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0 text-center">
          <ProgressRing
            progress={score}
            size={100}
            strokeWidth={9}
            color={score >= 80 ? "#34d399" : score >= 60 ? "#facc15" : "#fb7185"}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <p className="text-2xl font-black text-white">{score}</p>
              <p className="text-[8px] uppercase tracking-wider text-white/50 font-bold">Estimated Form</p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
          {METRIC_LABELS.map((m) => (
            <div key={m.key} className="rounded-xl border border-white/5 bg-black/20 p-2.5">
              <div className="flex justify-between items-center">
                <p className="text-[9px] uppercase font-bold text-white/40">{m.label}</p>
                <span className="text-xs font-bold font-mono text-cyan-300">
                  {coach.liveMetrics[m.key] || 85}
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  style={{ width: `${coach.liveMetrics[m.key] || 85}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Rep Count Stats */}
      <GlassCard className="grid grid-cols-4 gap-2 text-center p-4">
        <Stat
          icon={<Activity className="h-4 w-4 text-[#adc6ff]" />}
          label="Total Reps"
          value={coach.reps}
          highlight
        />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          label="Good Reps"
          value={coach.goodReps || coach.reps}
        />
        <Stat
          icon={<RotateCcw className="h-4 w-4 text-amber-300" />}
          label="Partial"
          value={coach.partialReps}
        />
        <Stat
          icon={<Trophy className="h-4 w-4 text-purple-300" />}
          label="Sets"
          value={coach.sets}
        />
      </GlassCard>

      {/* Manual Rep Adjustment Buttons for Testing */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={coach.manualRep}
          disabled={!coach.workoutRunning}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 font-bold text-white hover:bg-white/10 disabled:opacity-40 transition"
        >
          + Good Rep (Manual)
        </button>
        <button
          onClick={coach.manualPartial}
          disabled={!coach.workoutRunning}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 font-bold text-amber-200 hover:bg-white/10 disabled:opacity-40 transition"
        >
          + Partial Rep (Manual)
        </button>
      </div>

      {/* Structured "WHAT IS WRONG / WHY / HOW" Diagnostic Card */}
      <GlassCard className="p-5 border-cyan-400/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-black/40 space-y-3" glow>
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Real-Time Biomechanical Feedback
            </h4>
          </div>
          <span className="text-[10px] text-white/40 font-mono">Live Joint Angle Audit</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <p className="text-[10px] font-bold uppercase text-amber-300">What is happening:</p>
            <p className="text-white font-medium mt-0.5">{coach.primaryFeedback.what || "Aligning posture..."}</p>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <p className="text-[10px] font-bold uppercase text-purple-300">Why it matters for this exercise:</p>
            <p className="text-white/80 mt-0.5 leading-relaxed">{coach.primaryFeedback.why || "Proper joint excursion ensures optimal motor unit recruitment."}</p>
          </div>

          <div className="rounded-xl bg-black/40 border border-white/5 p-3">
            <p className="text-[10px] font-bold uppercase text-emerald-300">How to correct:</p>
            <p className="text-emerald-100 font-medium mt-0.5">{coach.primaryFeedback.how || "Maintain consistent tempo and full range of motion."}</p>
          </div>
        </div>
      </GlassCard>

      {/* Repetition History Timeline */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            Repetition Timeline ({coach.currentSetReps.length} in current set)
          </h4>
          <span className="text-[10px] text-white/40">Click any rep for breakdown</span>
        </div>

        {coach.currentSetReps.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-4">
            No repetitions logged in this set yet. Begin moving to record reps.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {coach.currentSetReps.map((rep, idx) => (
              <button
                key={idx}
                onClick={() => coach.setSelectedRep(rep)}
                className={`shrink-0 rounded-xl border p-2.5 text-left transition ${
                  coach.selectedRep?.index === rep.index
                    ? "border-cyan-400 bg-cyan-500/20 text-white"
                    : rep.partial
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span className="font-bold">Rep {rep.index}</span>
                  <span
                    className={`font-black ${
                      rep.score >= 80 ? "text-emerald-400" : rep.score >= 60 ? "text-amber-300" : "text-rose-400"
                    }`}
                  >
                    {rep.score}
                  </span>
                </div>
                <p className="text-[9px] text-white/50 mt-1 truncate max-w-[80px]">
                  {rep.partial ? "⚠ Partial" : "✓ Complete"}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Selected Rep Detail View */}
        {coach.selectedRep && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-cyan-400/30 bg-black/40 p-3.5 space-y-2 text-xs"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-bold text-white">
                Detailed Audit: Repetition {coach.selectedRep.index}
              </span>
              <span className="text-[10px] font-bold text-cyan-300">
                Form Score: {coach.selectedRep.score} / 100
              </span>
            </div>
            <p className="text-white/70">
              <strong className="text-white">Issue:</strong> {coach.selectedRep.issue || "Good alignment"}
            </p>
            <p className="text-white/70">
              <strong className="text-white">Why:</strong> {coach.selectedRep.why || "Cadence within target parameters."}
            </p>
            <p className="text-emerald-300">
              <strong className="text-white">Correction:</strong> {coach.selectedRep.how || "Continue through full movement cycle."}
            </p>
          </motion.div>
        )}
      </GlassCard>

      {/* Safety Message */}
      <AnimatePresence>
        {coach.safetyMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="border-amber-400/30 bg-amber-500/10 p-4">
              <p className="flex items-start gap-2 text-xs text-amber-100 leading-relaxed">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                {coach.safetyMessage}
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={coach.reportPain}
        className={`w-full rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
          coach.painReported
            ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
        }`}
      >
        <AlertTriangle className="mr-1.5 inline h-4 w-4 text-rose-400" />
        {coach.painReported ? "Pain Reported (Safety Protocol Active)" : "Report Movement Discomfort / Pain"}
      </button>

      {/* Post-Workout Summary Dialog / Modal */}
      {(showSummaryModal || coach.workoutCompleteSummary) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md grid place-items-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-3xl border border-cyan-400/30 bg-slate-950 p-6 shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Award className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Workout Summary</h3>
                  <p className="text-xs text-white/50">{coach.exercise.name} · Vision Session Complete</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  coach.setWorkoutCompleteSummary(null);
                }}
                className="text-white/40 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-white/40">Total Reps</span>
                <p className="text-xl font-black text-cyan-300 mt-0.5">{coach.reps}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-white/40">Good Reps</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{coach.goodReps || coach.reps}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-white/40">Partial Reps</span>
                <p className="text-xl font-black text-amber-300 mt-0.5">{coach.partialReps}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                <span className="text-[9px] text-white/40">Average Form</span>
                <p className="font-bold text-white mt-0.5">{coach.liveScore} / 100</p>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                <span className="text-[9px] text-white/40">Consistency</span>
                <p className="font-bold text-white mt-0.5">{coach.liveMetrics.consistency}%</p>
              </div>
              <div className="p-2.5 bg-black/40 border border-white/5 rounded-xl">
                <span className="text-[9px] text-white/40">Average ROM</span>
                <p className="font-bold text-white mt-0.5">{coach.rom?.observedRange || coach.exercise.expectedRom}°</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-1 text-xs">
              <p className="text-[10px] font-bold uppercase text-cyan-300">What to improve next session:</p>
              <p className="text-white/80 leading-relaxed">
                {coach.partialReps > 0
                  ? `You logged ${coach.partialReps} partial reps. Focus on reaching consistent depth at the bottom of the movement.`
                  : "Excellent consistency and tempo control throughout. You are ready to progress volume."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={async () => {
                  await coach.persistSession();
                  setShowSummaryModal(false);
                  coach.setWorkoutCompleteSummary(null);
                }}
                className="flex-1 rounded-xl bg-[#adc6ff] py-3 text-xs font-bold text-[#131315] hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                Sync Workout to Digital Twin
              </button>
              <a
                href="/twin"
                className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/10 py-3 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                View Updated Digital Twin
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
      <div className="flex justify-center">{icon}</div>
      <motion.p
        key={value}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        className={`text-xl font-black mt-1 ${highlight ? "text-[#adc6ff]" : "text-white"}`}
      >
        {value}
      </motion.p>
      <p className="text-[8px] uppercase tracking-wider text-white/40 font-semibold">{label}</p>
    </div>
  );
}
