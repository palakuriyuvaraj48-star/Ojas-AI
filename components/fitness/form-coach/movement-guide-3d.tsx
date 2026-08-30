"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCw, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { ExerciseDefinition, MovementPhase } from "@/lib/vision";

interface Props {
  exercise: ExerciseDefinition;
  movementPhase?: MovementPhase;
  className?: string;
}

export function MovementGuide3D({ exercise, movementPhase = "ready", className }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 (start) -> 1 (bottom) -> 0 (return)
  const [manualPhase, setManualPhase] = useState<MovementPhase | null>(null);

  // Automatic reference looping animation
  useEffect(() => {
    if (!isPlaying) return;
    let animFrame: number;
    let startTime = performance.now();
    const duration = 3200; // 3.2s full rep cycle (2s eccentric, 1.2s concentric)

    const animate = (time: number) => {
      const elapsed = (time - startTime) % duration;
      const t = elapsed / duration;
      // Smooth sinusoidal cycle: 0 -> 1 -> 0
      const currentProg = Math.sin(t * Math.PI);
      setProgress(currentProg);
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Determine current active phase for reference
  const currentProg = manualPhase !== null ? (manualPhase === "bottom" ? 1 : manualPhase === "descending" || manualPhase === "ascending" ? 0.5 : 0) : progress;
  const activePhaseLabel = currentProg > 0.8 ? "BOTTOM / TARGET DEPTH" : currentProg > 0.2 ? (progress > 0.5 ? "ASCENDING (DRIVE)" : "DESCENDING (CONTROL)") : "START POSITION";

  // Biomechanical coordinate calculations based on exercise archetype
  const calculateJoints = () => {
    const isSquat = exercise.category === "squat" || exercise.category === "lunge";
    const isPress = exercise.category === "press";
    const isCurl = exercise.id.includes("curl") || exercise.category === "pull";

    // Base torso anchor
    const head = { x: 100, y: 35 - currentProg * (isSquat ? 30 : 0) };
    const neck = { x: 100, y: 55 - currentProg * (isSquat ? 30 : 0) };
    const shoulders = {
      l: { x: 80, y: 65 - currentProg * (isSquat ? 30 : 0) },
      r: { x: 120, y: 65 - currentProg * (isSquat ? 30 : 0) },
    };
    const spine = { x: 100, y: 95 - currentProg * (isSquat ? 30 : 0) };
    const hips = {
      l: { x: 85, y: 125 - currentProg * (isSquat ? 30 : isPress ? 5 : 0) },
      r: { x: 115, y: 125 - currentProg * (isSquat ? 30 : isPress ? 5 : 0) },
    };

    // Knees & Feet
    let knees = {
      l: { x: 82 + currentProg * (isSquat ? 14 : 0), y: 175 - currentProg * (isSquat ? 10 : 0) },
      r: { x: 118 - currentProg * (isSquat ? 14 : 0), y: 175 - currentProg * (isSquat ? 10 : 0) },
    };
    const ankles = {
      l: { x: 80, y: 225 },
      r: { x: 120, y: 225 },
    };

    // Elbows & Wrists
    let elbows = {
      l: { x: 70, y: 95 },
      r: { x: 130, y: 95 },
    };
    let wrists = {
      l: { x: 70, y: 125 },
      r: { x: 130, y: 125 },
    };

    if (isSquat) {
      // Barbell resting on traps
      wrists = { l: { x: 75, y: 60 - currentProg * 30 }, r: { x: 125, y: 60 - currentProg * 30 } };
      elbows = { l: { x: 65, y: 80 - currentProg * 30 }, r: { x: 135, y: 80 - currentProg * 30 } };
    } else if (isPress) {
      // Overhead press or Push-up
      elbows = {
        l: { x: 60 + currentProg * 15, y: 85 + currentProg * 25 },
        r: { x: 140 - currentProg * 15, y: 85 + currentProg * 25 },
      };
      wrists = {
        l: { x: 70, y: 40 + currentProg * 45 },
        r: { x: 130, y: 40 + currentProg * 45 },
      };
    } else if (isCurl) {
      // Bicep curl flexion
      elbows = { l: { x: 75, y: 100 }, r: { x: 125, y: 100 } };
      wrists = {
        l: { x: 75, y: 135 - currentProg * 65 },
        r: { x: 125, y: 135 - currentProg * 65 },
      };
    }

    // Dynamic angles
    const calculatedKneeAngle = Math.round(168 - currentProg * 73);
    const calculatedElbowAngle = isPress ? Math.round(165 - currentProg * 75) : isCurl ? Math.round(160 - currentProg * 115) : 160;

    return { head, neck, shoulders, spine, hips, knees, ankles, elbows, wrists, calculatedKneeAngle, calculatedElbowAngle };
  };

  const model = calculateJoints();

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-slate-950 via-[#070b14] to-slate-950 p-4 text-left shadow-xl ${className ?? ""}`}>
      {/* 3D Reference Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-cyan-400 text-slate-950">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
              3D Reference Model
            </span>
            <h4 className="text-xs font-bold text-white">Ideal Form Guide: {exercise.name}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10 transition text-[10px]"
            title={isPlaying ? "Pause Reference" : "Play Reference"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Wireframe Canvas Container */}
      <div className="relative my-3 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-black/50 border border-white/5">
        {/* Subtle 3D Perspective Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="pointer-events-none absolute bottom-2 inset-x-8 h-12 bg-cyan-500/10 rounded-full blur-xl" />

        <svg viewBox="0 0 200 260" className="h-full w-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
          {/* Head & Neck */}
          <circle cx={model.head.x} cy={model.head.y} r="10" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
          <line x1={model.head.x} y1={model.head.y + 10} x2={model.neck.x} y2={model.neck.y} stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />

          {/* Shoulders & Clavicle */}
          <line x1={model.shoulders.l.x} y1={model.shoulders.l.y} x2={model.shoulders.r.x} y2={model.shoulders.r.y} stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />

          {/* Spine & Pelvis */}
          <line x1={model.neck.x} y1={model.neck.y} x2={model.spine.x} y2={model.spine.y} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <line x1={model.spine.x} y1={model.spine.y} x2={model.hips.l.x} y2={model.hips.l.y} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <line x1={model.spine.x} y1={model.spine.y} x2={model.hips.r.x} y2={model.hips.r.y} stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />

          {/* Arms */}
          <line x1={model.shoulders.l.x} y1={model.shoulders.l.y} x2={model.elbows.l.x} y2={model.elbows.l.y} stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
          <line x1={model.elbows.l.x} y1={model.elbows.l.y} x2={model.wrists.l.x} y2={model.wrists.l.y} stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={model.shoulders.r.x} y1={model.shoulders.r.y} x2={model.elbows.r.x} y2={model.elbows.r.y} stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
          <line x1={model.elbows.r.x} y1={model.elbows.r.y} x2={model.wrists.r.x} y2={model.wrists.r.y} stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />

          {/* Barbell / Equipment if applicable */}
          {exercise.category === "squat" && (
            <line x1={model.shoulders.l.x - 30} y1={model.shoulders.l.y - 5} x2={model.shoulders.r.x + 30} y2={model.shoulders.r.y - 5} stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
          )}

          {/* Legs */}
          <line x1={model.hips.l.x} y1={model.hips.l.y} x2={model.knees.l.x} y2={model.knees.l.y} stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          <line x1={model.knees.l.x} y1={model.knees.l.y} x2={model.ankles.l.x} y2={model.ankles.l.y} stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />
          <line x1={model.hips.r.x} y1={model.hips.r.y} x2={model.knees.r.x} y2={model.knees.r.y} stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
          <line x1={model.knees.r.x} y1={model.knees.r.y} x2={model.ankles.r.x} y2={model.ankles.r.y} stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />

          {/* Joint Nodes */}
          {[model.shoulders.l, model.shoulders.r, model.elbows.l, model.elbows.r, model.wrists.l, model.wrists.r, model.hips.l, model.hips.r, model.knees.l, model.knees.r, model.ankles.l, model.ankles.r].map((pt, idx) => (
            <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
          ))}

          {/* Angle Callout Badge on Primary Joint */}
          <g transform={`translate(${model.knees.r.x + 12}, ${model.knees.r.y})`}>
            <rect x="-4" y="-8" width="48" height="16" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <text x="20" y="3" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">
              {exercise.category === "press" ? `${model.calculatedElbowAngle}°` : `${model.calculatedKneeAngle}°`}
            </text>
          </g>
        </svg>

        {/* Phase Pill Overlay */}
        <div className="absolute top-2 left-2 rounded-lg bg-black/80 border border-white/10 px-2.5 py-1 text-[9px] font-bold text-cyan-300">
          Target Angle: {exercise.repBottomAngle}°
        </div>

        <div className="absolute bottom-2 inset-x-2 text-center">
          <span className="rounded-full bg-cyan-400/20 border border-cyan-400/40 px-3 py-0.5 text-[10px] font-black uppercase text-cyan-200">
            {activePhaseLabel}
          </span>
        </div>
      </div>

      {/* Movement Phase Interactive Steps */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[9px] font-semibold text-white/70">
        {[
          { label: "1. Start", p: "ready", desc: "168° Lockout" },
          { label: "2. Lower", p: "descending", desc: "2s Tempo" },
          { label: "3. Bottom", p: "bottom", desc: `${exercise.repBottomAngle}° Depth` },
          { label: "4. Return", p: "complete", desc: "Drive Up" },
        ].map((st) => (
          <div
            key={st.label}
            className={`p-1.5 rounded-lg border transition ${
              activePhaseLabel.includes(st.label.split(". ")[1].toUpperCase())
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-200 font-bold"
                : "border-white/5 bg-white/5 text-white/50"
            }`}
          >
            <p>{st.label}</p>
            <p className="text-[8px] text-white/40">{st.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
