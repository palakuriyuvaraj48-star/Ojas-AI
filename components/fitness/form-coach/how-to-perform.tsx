"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Activity,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { ExerciseDefinition, MovementPhase } from "@/lib/vision";
import { MovementGuide3D } from "./movement-guide-3d";

interface Props {
  exercise: ExerciseDefinition;
  movementPhase?: MovementPhase;
  liveAngles?: Record<string, number>;
}

export function HowToPerform({ exercise, movementPhase = "ready", liveAngles = {} }: Props) {
  const tutorial = exercise.tutorial || {
    setup: "Stand in an athletic stance with core braced.",
    instructions: [
      "Set your starting position with stable alignment.",
      "Initiate the movement with controlled cadence.",
      "Reach the full target joint range of motion.",
      "Return smoothly to the starting position.",
    ],
    commonMistakes: ["Rushing the movement", "Incomplete range of motion", "Poor joint alignment"],
    coachingCues: ["Maintain steady breathing", "Control the tempo", "Stay braced throughout"],
  };

  // Phase progression definitions based on exercise archetype
  const getPhaseSteps = () => {
    if (exercise.id.includes("curl") || exercise.category === "pull") {
      return [
        { id: "ready", label: "1. Start", desc: "Arms fully extended at sides (160°)", icon: "🧍" },
        { id: "ascending", label: "2. Curl Up", desc: "Drive forearms up, elbows pinned", icon: "⬆️" },
        { id: "bottom", label: "3. Peak Squeeze", desc: "Maximum contraction at top (45°)", icon: "💪" },
        { id: "descending", label: "4. Lower Down", desc: "2-second controlled negative", icon: "⬇️" },
        { id: "complete", label: "5. Rep Done", desc: "Full return before next rep", icon: "✓" },
      ];
    }
    if (exercise.category === "press") {
      return [
        { id: "ready", label: "1. Start", desc: "Joints stacked & core rigid", icon: "🧍" },
        { id: "descending", label: "2. Lower", desc: "Controlled descent, elbows ~45°", icon: "⬇️" },
        { id: "bottom", label: "3. Target Depth", desc: `Reach ${exercise.repBottomAngle}° elbow bend`, icon: "🎯" },
        { id: "ascending", label: "4. Press Up", desc: "Drive smoothly through palms", icon: "⬆️" },
        { id: "complete", label: "5. Lockout", desc: "Full extension under control", icon: "✓" },
      ];
    }
    // Default (Squat, Lunge, Lower)
    return [
      { id: "ready", label: "1. Start", desc: "Feet shoulder-width, chest proud", icon: "🧍" },
      { id: "descending", label: "2. Lower", desc: "Hips back, knees tracking toes", icon: "⬇️" },
      { id: "bottom", label: "3. Bottom Depth", desc: `Thighs parallel (${exercise.repBottomAngle}° knee)`, icon: "🏋️" },
      { id: "ascending", label: "4. Rise Up", desc: "Drive through midfoot & glutes", icon: "⬆️" },
      { id: "complete", label: "5. Stand Tall", desc: "Full hip extension at top", icon: "✓" },
    ];
  };

  const steps = getPhaseSteps();

  return (
    <div className="space-y-4 text-left">
      {/* 3D Reference Movement Guide Model */}
      <MovementGuide3D exercise={exercise} movementPhase={movementPhase} />

      {/* Exercise Instruction Header Card */}
      <GlassCard className="p-5 border-cyan-400/20 bg-slate-950/80 space-y-4" glow>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              Instructional Guide
            </span>
            <h3 className="text-lg font-black text-white mt-0.5">{exercise.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-white/80">{exercise.equipment}</span>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-1 rounded-lg">
              Target ROM: {exercise.expectedRom}°
            </span>
          </div>
        </div>

        {/* Visual Movement Step Sequence */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
            Movement Phase Sequence
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {steps.map((step) => {
              const isActive = movementPhase === step.id;
              return (
                <div
                  key={step.id}
                  className={`rounded-xl p-2.5 border transition text-left ${
                    isActive
                      ? "border-cyan-400 bg-cyan-500/20 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300"
                      : "border-white/5 bg-black/40 text-white/60"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span>{step.icon}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <p className={`font-bold text-xs mt-1.5 ${isActive ? "text-white" : "text-white/80"}`}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-white/50 mt-0.5 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Form Breakdown */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <p className="text-[10px] font-bold uppercase text-cyan-300">1. Setup &amp; Start Position</p>
            <p className="text-white/80 leading-relaxed">{tutorial.setup}</p>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <p className="text-[10px] font-bold uppercase text-cyan-300">2. Movement Execution</p>
            <ol className="list-decimal list-inside space-y-1 text-white/80">
              {tutorial.instructions.map((ins, i) => (
                <li key={i} className="leading-relaxed">{ins}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Key Form Checks Checklist */}
        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Key Form Checks (AI Audit Criteria)
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2 text-[11px] text-white/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Full body visible in frame
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Stable stance &amp; foot planting
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Controlled 2s lowering tempo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Reach {exercise.repBottomAngle}° depth target
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Symmetric left/right drive
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Neutral spine bracing
            </span>
          </div>
        </div>

        {/* Common Mistakes & Fixes */}
        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Common Mistakes &amp; Fixes
          </p>
          <div className="space-y-1.5">
            {tutorial.commonMistakes.map((mistake, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">✕</span>
                <div>
                  <span className="font-semibold text-amber-200">{mistake}</span>
                  <p className="text-[10px] text-white/60 mt-0.5">
                    Fix: {tutorial.coachingCues[idx] || "Focus on controlled cadence and full joint range."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

export default HowToPerform;
