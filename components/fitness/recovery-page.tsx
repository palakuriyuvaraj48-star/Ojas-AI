"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion } from "framer-motion";
import {
  Activity,
  HeartPulse,
  MoonStar,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
  Droplets,
  CheckCircle2,
  Clock,
  Waves,
  Zap,
  ShieldCheck,
  ArrowRight,
  BedDouble,
  StretchHorizontal,
  UtensilsCrossed,
  BatteryMedium,
} from "lucide-react";
import { userState } from "@/lib/userState";

export function RecoveryPage() {
  const recovery = userState.digitalTwin.recovery;
  const context = userState.context;

  const weekTrend = [
    { day: "Mon", score: 65, sleep: 6.8 },
    { day: "Tue", score: 52, sleep: 6.2 },
    { day: "Wed", score: 48, sleep: 5.1 },
    { day: "Thu", score: 71, sleep: 7.0 },
    { day: "Fri", score: 78, sleep: 7.4 },
    { day: "Sat", score: 82, sleep: 7.8 },
    { day: "Sun", score: recovery.score, sleep: 7.4 },
  ];

  const scoreFactors = [
    {
      label: "Sleep Duration",
      current: "7.4h",
      target: "8h",
      score: 92,
      visual: "██████░",
      source: "",
    },
    {
      label: "Sleep Quality",
      current: "Good",
      target: "",
      score: 85,
      visual: "██████░",
      source: "(detected from HRV)",
    },
    {
      label: "Fatigue Level",
      current: "Moderate",
      target: "",
      score: 58,
      visual: "████░░",
      source: "(self-reported)",
    },
    {
      label: "DOMS (Muscle Soreness)",
      current: "Mild",
      target: "",
      score: 78,
      visual: "███████░",
      source: "(form-based detection)",
    },
    {
      label: "HRV (Readiness)",
      current: `${recovery.hrvScore}`,
      target: "",
      score: recovery.hrvScore,
      visual: "███████░",
      source: "(wearable data)",
    },
  ];

  const getStatusColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getStatusBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500/10 border-emerald-500/30";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/30";
    return "bg-rose-500/10 border-rose-500/30";
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* CARD 1: Header + Context */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-blue-950/40 via-[#181a20] to-[#121316] relative overflow-hidden" glow>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Continuous Bio-Readiness
              </span>
              <span className="text-white/40 text-xs">Transparent Calculation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recovery: How Your Rest Shapes Your Next Workout
            </h2>
            <p className="text-sm font-semibold text-white/90 max-w-lg">
              Recovery is NOT separate from training. It&apos;s the INPUT for your next adaptation.
            </p>
            <p className="text-xs text-white/60 max-w-lg">
              Calculated from: Sleep 35% + Fatigue 30% + Training Load 20% + Nutrition 15%. Recovery is not laziness — it&apos;s where adaptation happens.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <ProgressRing progress={recovery.score} size={130} strokeWidth={10} color="#3b82f6" showLabel={true} />
              <span className="text-xs font-bold text-blue-300 mt-2">Ready for Training</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* CARD 2: Weekly Recovery Story (Day-by-day narrative) */}
      <GlassCard className="p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Weekly Recovery Story</span>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              7-Day Recovery Timeline
            </h4>
          </div>
          <span className="text-xs text-white/50">Day-by-day narrative</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekTrend.map((day, idx) => {
            const statusConfig = getStatusConfig(day.score);
            return (
              <div
                key={day.day}
                className={`p-3 rounded-xl border ${statusConfig.bg} space-y-2`}
              >
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{day.day}</span>
                  <span className={getStatusColor(day.score)}>{day.score}</span>
                </div>
                <div className="text-[10px] text-white/60">{statusConfig.status}</div>
                <div className="text-[10px] text-white/50 leading-relaxed">{statusConfig.reason}</div>
                <div className="text-[10px] font-semibold text-white/70">{statusConfig.decision}</div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* CARD 3: Recovery Score Breakdown (Granular components) */}
      <GlassCard className="p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Granular Components</span>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              Recovery Score Breakdown
            </h4>
          </div>
        </div>

        <div className="space-y-3">
          {scoreFactors.map((factor) => (
            <div key={factor.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white">{factor.label}</span>
                  {factor.source && <span className="text-[10px] text-white/40 ml-1">{factor.source}</span>}
                </div>
                <span className="text-xs font-bold text-white">{factor.current}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${factor.score}%` }} />
                </div>
                <span className="text-xs font-bold text-blue-300 w-12 text-right">{factor.score}/100</span>
              </div>
              <div className="text-[10px] font-mono text-white/40 tracking-wider">{factor.visual}</div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300">Total Score</span>
            <span className="text-lg font-black text-white">{recovery.score}/100</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            Calculation: (7.4h sleep + Good quality + Moderate fatigue + Mild DOMS + Good HRV) / 5
          </p>
          <p className="text-[10px] text-amber-300">
            Lowest Factor: Fatigue ({recovery.fatigueScore}/100) — Your bottleneck. Today&apos;s plan prioritizes recovery.
          </p>
        </div>
      </GlassCard>

      {/* CARD 4: How This Shaped Today's Plan */}
      <GlassCard className="p-5 border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 space-y-4">
        <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          How This Shaped Your Plan
        </h4>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white/80 uppercase">Yesterday</h5>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs text-white/70">
              <p>Recovery Score: {recovery.score}/100 (Stable)</p>
              <p>Last workout: 45-min leg day</p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white/80 uppercase">System Decision</h5>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1 text-xs text-white/80">
              <p>✓ Strength ready (recovery &gt; 70)</p>
              <p>✓ Could do {context.availableTime}-min workout</p>
              <p className="text-amber-300">✗ Sleep trending down (↓ 0.5h from 3-day avg)</p>
              <p className="text-amber-300">→ Reduce intensity 10% as precaution</p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white/80 uppercase">Today&apos;s Recommendation</h5>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs text-white/80">
              <p className="font-bold text-emerald-300">{context.availableTime} min at Moderate-High intensity</p>
              <p>(instead of High, as precaution)</p>
              <p className="text-[10px] text-white/60">Why: Protect long-term consistency. Over-training today = injury next week.</p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/70">
            <strong className="text-cyan-300">Tomorrow:</strong> Recovery should improve to 82/100 → 45-min heavy workout approved.
          </p>
        </div>
      </GlassCard>

      {/* CARD 5: Recovery Actions for Today */}
      <GlassCard className="p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">Action Items</span>
            <h4 className="text-base font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Recovery Actions for Today
            </h4>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ActionItem
            priority={1}
            icon={<BedDouble className="h-4 w-4 text-indigo-400" />}
            title="Sleep"
            target="7.5h (you&apos;ve been getting 7.0-7.4h)"
            actions={["Dim lights by 10pm", "Magnesium supplement"]}
            cta="Log tonight&apos;s sleep goal"
          />
          <ActionItem
            priority={2}
            icon={<StretchHorizontal className="h-4 w-4 text-teal-400" />}
            title="Active Recovery (if you have time)"
            actions={["Mobility flow (10 min)", "Stretching (5 min)"]}
            cta="Start Mobility Routine"
          />
          <ActionItem
            priority={3}
            icon={<UtensilsCrossed className="h-4 w-4 text-orange-400" />}
            title="Nutrition for Recovery"
            targets={["Protein: 120g", "Carbs: 250g", "Water: 2.5L"]}
            cta="Log your meals"
          />
          <ActionItem
            priority={4}
            icon={<BatteryMedium className="h-4 w-4 text-amber-400" />}
            title="Manage Fatigue"
            actions={["Rate your fatigue", "This updates tomorrow&apos;s plan"]}
            cta={"[😌 Fresh] [😐 Moderate] [😴 Tired]"}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function getStatusConfig(score: number) {
  if (score >= 75)
    return {
      status: "✅ Approved heavy day",
      reason: "Good sleep + low fatigue",
      decision: "Approved for heavy leg day",
      bg: "border-emerald-500/30 bg-emerald-500/10",
    };
  if (score >= 60)
    return {
      status: "✅ Back to normal",
      reason: "Rest day worked, sleep improved",
      decision: "Back to normal training",
      bg: "border-emerald-500/30 bg-emerald-500/10",
    };
  if (score >= 50)
    return {
      status: "⚠️ Recommended rest day",
      reason: "Sleep dropped + fatigue up",
      decision: "Recommended rest day",
      bg: "border-amber-500/30 bg-amber-500/10",
    };
  return {
    status: "🚨 THIS triggered change",
    reason: "Exam stress + poor sleep",
    decision: "OJAS shifted to mobility instead",
    bg: "border-rose-500/30 bg-rose-500/10",
  };
}

function ActionItem({
  priority,
  icon,
  title,
  target,
  actions,
  targets,
  cta,
}: {
  priority: number;
  icon: React.ReactNode;
  title: string;
  target?: string;
  actions?: string[];
  targets?: string[];
  cta: string;
}) {
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">
          {priority}
        </div>
        {icon}
        <h5 className="text-sm font-bold text-white">{title}</h5>
      </div>
      {target && <p className="text-xs text-white/70">{target}</p>}
      {actions && (
        <ul className="space-y-1 text-xs text-white/60">
          {actions.map((a) => (
            <li key={a} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {a}
            </li>
          ))}
        </ul>
      )}
      {targets && (
        <ul className="space-y-1 text-xs text-white/60">
          {targets.map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              {t}
            </li>
          ))}
        </ul>
      )}
      <button className="text-xs font-bold text-cyan-300 hover:text-cyan-200 transition flex items-center gap-1">
        {cta} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
