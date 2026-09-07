"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Activity,
  Clock,
  MoonStar,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";
import { userState } from "@/lib/userState";
import { useAdaptiveState } from "@/components/providers/adaptive-state-provider";

type CheckStatus = "pass" | "warn" | "fail";

interface CheckItem {
  label: string;
  status: CheckStatus;
  detail: string;
}

export function DecisionReasoning() {
  const [expanded, setExpanded] = useState(false);
  const { state, recommendation } = useAdaptiveState();
  const recovery = userState.digitalTwin.recovery;
  const context = userState.context;

  const checks: CheckItem[] = [
    {
      label: `Recovery Score: ${recovery.score}/100`,
      status: recovery.score >= 70 ? "pass" : recovery.score >= 50 ? "warn" : "fail",
      detail: recovery.score >= 70 ? "Ready for workout" : recovery.score >= 50 ? "Moderate training safe" : "Recovery priority — protect your foundation",
    },
    {
      label: `Available Time: ${state.availableTime} min`,
      status: state.availableTime >= 30 ? "pass" : "warn",
      detail: state.availableTime >= 30 ? "Sufficient for session" : "Compressed session required",
    },
    {
      label: `Sleep Last Night: ${state.sleepDuration.toFixed(1)}h`,
      status: state.sleepDuration >= 7 ? "pass" : "warn",
      detail: state.sleepDuration >= 7 ? "Good recovery" : "Below optimal — monitor fatigue",
    },
    {
      label: `Training Frequency: 3x this week`,
      status: "pass",
      detail: "On pace for weekly goal",
    },
    {
      label: `Fatigue Level: ${state.energyLevel}`,
      status: state.energyLevel === "energetic" ? "pass" : state.energyLevel === "moderate" ? "warn" : "fail",
      detail: state.energyLevel === "energetic" ? "Full intensity approved" : state.energyLevel === "moderate" ? "Reduce intensity 10%" : "Recovery recommended",
    },
  ];

  const passCount = checks.filter((c) => c.status === "pass").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const failCount = checks.filter((c) => c.status === "fail").length;

  const decisionText = failCount > 0 ? "REST OR RECOVERY" : warnCount > 0 ? "PROCEED WITH CAUTION" : "PROCEED AS PLANNED";
  const decisionColor = failCount > 0 ? "text-amber-400" : warnCount > 0 ? "text-blue-400" : "text-emerald-400";

  return (
    <GlassCard className="p-5 border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-cyan-400" />
          Why Ojas Recommends This
        </h4>
        <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-lg">
          {passCount} pass · {warnCount} warn · {failCount} fail
        </span>
      </div>

      <div className="space-y-2">
        {checks.map((check, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="mt-0.5">
              {check.status === "pass" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {check.status === "warn" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {check.status === "fail" && <XCircle className="h-4 w-4 text-rose-400" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-white">{check.label}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Decision</span>
          <span className={`text-sm font-black ${decisionColor}`}>{decisionText}</span>
        </div>
        <p className="text-xs text-white/70 mt-2 leading-relaxed">
          {recommendation.reasoning || "Recovery and time are sufficient. Fatigue is moderate, so reducing intensity 10% vs planned high intensity balances training stimulus with fatigue management."}
        </p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition"
      >
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {expanded ? "Hide" : "See"} full decision logic
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-white/80">
                <Activity className="h-4 w-4 text-cyan-400" />
                <span className="font-bold">Input: Digital Twin State</span>
              </div>
              <div className="pl-6 space-y-1 text-white/60 font-mono text-[10px]">
                <p>Recovery: {recovery.score}/100</p>
                <p>Available Time: {state.availableTime} min</p>
                <p>Budget: ₹{context.budget.dailyRemaining} remaining</p>
                <p>Fatigue: {state.energyLevel}</p>
                <p>Training Load: {state.trainingLoadYesterday}% yesterday</p>
              </div>

              <div className="flex items-center gap-2 text-white/80 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-bold">Decision Tree</span>
              </div>
              <div className="pl-6 space-y-1 text-white/60 font-mono text-[10px]">
                <p>if (recovery &lt; 60) → reduce load</p>
                <p>if (time &lt; 30) → shorter session</p>
                <p>if (fatigue &gt; 70) → mobility instead</p>
                <p>if (trainingLoad &gt; 4/week) → add recovery day</p>
              </div>

              <div className="flex items-center gap-2 text-white/80 pt-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-bold">Output</span>
              </div>
              <div className="pl-6 text-white/60 font-mono text-[10px]">
                <p>&quot;{recommendation.duration}-min {recommendation.type || 'workout'} ({recommendation.intensity || 'moderate'} intensity)&quot;</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
