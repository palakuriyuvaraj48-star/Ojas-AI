"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  BrainCircuit, 
  Building2, 
  DollarSign, 
  Languages, 
  Camera,
  Layers,
  HeartPulse,
  Flame,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SIHStoryModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Badge button for Judges */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black px-4 py-2 text-xs font-black shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition"
      >
        <Award className="h-4 w-4" />
        SIH 2024 / 2025 Evaluator Guide
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#14151a] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    Smart India Hackathon Innovation Story
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    OJAS — India's First Adaptive AI Fitness OS
                  </h2>
                  <p className="text-xs text-white/60">
                    Category: Student Innovation & Sports Tech • Team Pitch Architecture
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:text-white hover:bg-white/20 transition"
                >
                  ✕
                </button>
              </div>

              {/* 1. Problem Statement */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  1. The Real Indian Problem (Why Ojas?)
                </h4>
                <p className="text-xs text-white/80 leading-relaxed">
                  India’s fitness issue is <strong>NOT a lack of information</strong>. Everyone already has access to workout YouTube videos, generic diet charts, and calorie counting apps.
                </p>
                <p className="text-xs text-white/80 leading-relaxed">
                  The real bottleneck is: <strong className="text-white">People don't know what action is appropriate for their body and situation today.</strong> Real Indian lives involve college exams, hostel mess food, fixed ₹100 budgets, fatigue, and tight 20-minute windows.
                </p>
              </div>

              {/* 2. Core Innovation: The Adaptive Loop */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-black/40 border border-white/10 p-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <BrainCircuit className="h-4 w-4" />
                  2. Core Technical Architecture: The Closed Adaptive Loop
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px]">
                  {[
                    { step: "SENSE", desc: "Camera, Sleep, Diet, Weather", color: "text-cyan-300" },
                    { step: "UNDERSTAND", desc: "Digital Twin & Recovery State", color: "text-blue-300" },
                    { step: "DECIDE", desc: "🟢 Train / 🟡 Reduce / 🔵 Recover", color: "text-emerald-300" },
                    { step: "COACH", desc: "AI Form Coach & Multilingual", color: "text-amber-300" },
                    { step: "MEASURE", desc: "Rep Accuracy & Training Load", color: "text-purple-300" },
                    { step: "ADAPT", desc: "Next Day Rebalances Automatically", color: "text-pink-300" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-white/5 p-2 border border-white/5">
                      <strong className={`block font-black text-xs ${s.color}`}>{s.step}</strong>
                      <span className="text-white/60 leading-tight block mt-1">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. India-First Differentiators */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  3. Key India-First Innovations
                </h4>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Hostel / Mess Living Mode
                    </div>
                    <p className="text-[11px] text-white/70">
                      Solves student mess constraints: input today's mess menu → Ojas ranks 🥇 Best picks and ⚠️ Caution items.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      Budget Fitness Coach (₹50-₹250/day)
                    </div>
                    <p className="text-[11px] text-white/70">
                      High-protein Indian staples (Soya chunks, boiled eggs, sattu, peanuts) optimized for cost-per-gram protein.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5" />
                      Natural Multilingual Interaction
                    </div>
                    <p className="text-[11px] text-white/70">
                      Users talk naturally in Telugu, Hindi, English, preserving colloquial intent without word-for-word translation.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                    <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5" />
                      Smart Form Coach (Computer Vision)
                    </div>
                    <p className="text-[11px] text-white/70">
                      Real-time MediaPipe pose estimation with joint angles, rep counting, and form scoring computed locally for privacy.
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1 sm:col-span-2">
                    <div className="font-bold text-[#adc6ff] flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" />
                      Continuous Sport Transition & Performance Engine
                    </div>
                    <p className="text-[11px] text-white/70">
                      Progresses students from General Fitness → Sport Transition (Cricket, Football, Badminton, Kabaddi) → Athlete Performance with deterministic Gap Analysis, Personal Baselines, and explainable adaptive adjustments.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Judge 3-Minute Demo Walkthrough */}
              <div className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Hero SIH 6-Step Evaluation Flow
                  </h4>
                  <span className="text-[10px] text-amber-300/80 font-semibold">Student → Athlete Loop</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80 font-medium">
                  <span className="rounded bg-white/10 px-2 py-1">1. Student Profile (General Fitness)</span>
                  <span>→</span>
                  <span className="rounded bg-white/10 px-2 py-1">2. Transition Goal (Football / Cricket)</span>
                  <span>→</span>
                  <span className="rounded bg-white/10 px-2 py-1">3. Gap Analysis (Agility Gap Detected)</span>
                  <span>→</span>
                  <span className="rounded bg-white/10 px-2 py-1">4. Sport-Specific Plan & Drills</span>
                  <span>→</span>
                  <span className="rounded bg-white/10 px-2 py-1">5. Form Coach & Vision Feedback</span>
                  <span>→</span>
                  <span className="rounded bg-white/10 px-2 py-1">6. Digital Twin Updates & Plan Adapts</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-[#adc6ff] text-[#131315] font-bold text-xs px-5 py-2.5 hover:bg-white transition"
                >
                  Close & Explore Ojas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
