"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Crown,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  TrendingDown
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const highlights = [
  {
    title: "AI Camera Lens",
    description: "Real-time posture analytics, joint angle calculators, and instant repetition auditing.",
    icon: Camera,
    color: "from-cyan-400 to-[#4d8eff]"
  },
  {
    title: "Food Vision Scanner",
    description: "Snap and analyze. Instant macro diagnostics, glycemic load auditing, and cleaner substitutes.",
    icon: UtensilsCrossed,
    color: "from-emerald-400 to-teal-500"
  },
  {
    title: "Adaptive Physiology OS",
    description: "Calculates BMR/TDEE baselines, adapting your calorie allocations based on weekly bio-marker feedback.",
    icon: BarChart3,
    color: "from-purple-400 to-indigo-500"
  },
];

export function LandingPage() {
  const [selectedUser, setSelectedUser] = useState<"user-a" | "user-b">("user-a");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(173,198,255,0.12),_transparent_32%),linear-gradient(135deg,_#08080a_0%,_#0d0d10_50%,_#131316_100%)] px-4 py-6 text-[#e5e1e4] sm:px-6 lg:px-8 overflow-hidden font-sans">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        
        {/* Apple-Quality Sticky Header */}
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-[rgba(20,19,22,0.8)] px-5 py-3.5 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#131315] shadow-lg shadow-cyan-500/10">
              <Camera className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">AI Coach Lens</p>
              <p className="text-[10px] text-white/50 font-semibold tracking-wider uppercase">Fitness OS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wider text-white/60 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#comparison" className="transition hover:text-white">Case Study</a>
            <a href="#premium" className="transition hover:text-white">Premium</a>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-full border border-[#adc6ff]/30 bg-[#adc6ff]/10 px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#adc6ff] transition hover:bg-[#adc6ff]/20 shadow-inner"
          >
            Launch OS
          </Link>
        </header>

        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-center pt-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[36px] border border-white/10 bg-[rgba(24,23,26,0.55)] p-8 sm:p-10 shadow-[0_45px_110px_rgba(0,0,0,0.45)] backdrop-blur-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#adc6ff]/20 bg-[#adc6ff]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#adc6ff]">
              <Sparkles className="h-4 w-4 animate-pulse" />
              The World&apos;s First AI Fitness Operating System
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl tracking-tight text-white">
              See Better.<br />
              <span className="bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] bg-clip-text text-transparent">Train Smarter.</span><br />
              Transform Faster.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed font-medium">
              We don&apos;t just track your metrics—we coach you. AI Coach Lens watches your posture, audits your nutrition scanner feeds, and adjusts your physiology plans dynamically.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] px-7 py-4 text-sm font-bold text-[#131315] transition hover:brightness-115 hover:scale-[1.02] shadow-xl shadow-cyan-500/10"
              >
                Onboard Fitness OS <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/camera"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold transition hover:bg-white/10 hover:scale-[1.02]"
              >
                <Camera className="h-4 w-4 text-[#adc6ff]" /> Try AI Camera
              </Link>
            </div>
            
            <div className="mt-10 grid gap-4 grid-cols-3 border-t border-white/10 pt-8">
              {[
                ["98.4%", "Pose accuracy"],
                ["94.2%", "Nutrition match"],
                ["12.8k+", "Active members"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/40 font-medium uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Futuristic Visual Mock of OS */}
          <GlassCard className="flex flex-col justify-between gap-5 h-full p-6 border-white/5 bg-[rgba(24,23,26,0.3)]" glow>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Live Neural Stream</span>
              </div>
              <span className="text-[10px] rounded-full bg-[#adc6ff]/10 px-2 py-0.5 text-[#adc6ff] font-bold border border-[#adc6ff]/20">98% CONFIDENCE</span>
            </div>

            {/* Skeleton visual graphic */}
            <div className="relative aspect-video rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-black/40" />
              {/* Dynamic Mock SVG Skeleton */}
              <svg className="absolute inset-0 w-full h-full text-cyan-400 stroke-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                {/* Torso */}
                <line x1="50%" y1="20%" x2="50%" y2="55%" />
                {/* Shoulders */}
                <line x1="38%" y1="28%" x2="62%" y2="28%" />
                {/* Left Arm */}
                <line x1="38%" y1="28%" x2="28%" y2="40%" />
                <line x1="28%" y1="40%" x2="30%" y2="52%" />
                {/* Right Arm */}
                <line x1="62%" y1="28%" x2="72%" y2="40%" />
                <line x1="72%" y1="40%" x2="70%" y2="52%" />
                {/* Hips */}
                <line x1="42%" y1="55%" x2="58%" y2="55%" />
                {/* Left Leg */}
                <line x1="42%" y1="55%" x2="36%" y2="70%" />
                <line x1="36%" y1="70%" x2="42%" y2="90%" />
                {/* Right Leg */}
                <line x1="58%" y1="55%" x2="64%" y2="70%" />
                <line x1="64%" y1="70%" x2="58%" y2="90%" />
                {/* Nodes */}
                <circle cx="50%" cy="20%" r="5" fill="#38bdf8" />
                <circle cx="38%" cy="28%" r="4" fill="#22d3ee" />
                <circle cx="62%" cy="28%" r="4" fill="#22d3ee" />
                <circle cx="28%" cy="40%" r="4" fill="#22d3ee" />
                <circle cx="72%" cy="40%" r="4" fill="#22d3ee" />
                <circle cx="42%" cy="55%" r="4" fill="#22d3ee" />
                <circle cx="58%" cy="55%" r="4" fill="#22d3ee" />
                <circle cx="36%" cy="70%" r="4" fill="#22d3ee" />
                <circle cx="64%" cy="70%" r="4" fill="#22d3ee" />
                <circle cx="42%" cy="90%" r="4" fill="#22d3ee" />
                <circle cx="58%" cy="90%" r="4" fill="#22d3ee" />
              </svg>
              {/* Telemetry overlay labels */}
              <div className="absolute top-3 left-3 bg-black/60 rounded-lg px-2 py-1 text-[9px] font-mono text-cyan-300">
                Hip: 92°
              </div>
              <div className="absolute top-3 right-3 bg-black/60 rounded-lg px-2 py-1 text-[9px] font-mono text-cyan-300">
                Knee: 84°
              </div>
              <div className="absolute bottom-3 left-3 bg-emerald-500/80 rounded-lg px-2.5 py-1 text-[10px] font-bold text-[#131315]">
                ✅ Great depth
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">Squat Form Index</p>
                <p className="mt-1 text-2xl font-bold text-white">93%</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">Active Streak</p>
                <p className="mt-1 text-2xl font-bold text-[#adc6ff]">18 Days</p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Feature Grid */}
        <section id="features" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Startup Architecture Pillars</h2>
            <p className="text-sm text-white/50 mt-2">AI Coach Lens operates across three high-performance computing layers to maximize body recomposition outcomes.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <GlassCard key={item.title} className="flex flex-col gap-4 border-white/5 bg-[rgba(24,23,26,0.45)] hover:border-white/10 transition duration-300">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-[#131315] shadow-lg`}>
                  <item.icon className="h-5.5 w-5.5" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-medium">{item.description}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Comparison Case Study Section */}
        <section id="comparison" className="rounded-[40px] border border-white/10 bg-gradient-to-b from-[rgba(24,23,26,0.85)] to-[rgba(16,15,18,0.95)] p-8 sm:p-12 shadow-[0_50px_120px_rgba(0,0,0,0.5)]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-center">
            
            {/* Story text */}
            <div className="space-y-5">
              <span className="text-xs font-bold text-[#adc6ff] uppercase tracking-widest bg-[#adc6ff]/10 px-3 py-1.5 rounded-full border border-[#adc6ff]/20">Bio-feedback Comparison</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                A Tale of Two Composers
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Meet **User A** and **User B**. Both set out with identical biology parameters to lose body fat and build athletic performance. 
              </p>
              
              {/* Toggles */}
              <div className="flex gap-3 bg-black/45 p-1.5 rounded-2xl border border-white/5">
                <button
                  onClick={() => setSelectedUser("user-a")}
                  className={`flex-1 rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedUser === "user-a"
                      ? "bg-[#adc6ff] text-[#131315] shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <UserCheck className="h-4 w-4" /> User A (Coach Lens)
                </button>
                <button
                  onClick={() => setSelectedUser("user-b")}
                  className={`flex-1 rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    selectedUser === "user-b"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> User B (Traditional)
                </button>
              </div>

              {/* Inspiring Note */}
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-white/60 leading-relaxed">
                💡 **Inspiring Outcome**: After seeing User A&apos;s rapid transformation and posture safety checks, User B loaded AI Coach Lens in Week 4, immediately correcting their squat form and optimizing their diet, matching User A&apos;s trajectory by Week 12.
              </div>
            </div>

            {/* Simulated Case Analytics Card */}
            <AnimatePresence mode="wait">
              {selectedUser === "user-a" ? (
                <motion.div
                  key="user-a"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">User A: Optimized Recomposition</h3>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">Platform: AI Coach Lens Active</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-black/35 p-4 space-y-2">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">Form Accuracy</p>
                      <p className="text-2xl font-black text-white">96%</p>
                      <p className="text-[10px] text-emerald-400">✅ Spine stable, knees aligned</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-black/35 p-4 space-y-2">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">12-Week Bio Delta</p>
                      <p className="text-2xl font-black text-white">-6.5kg Fat / +3.2kg Muscle</p>
                      <p className="text-[10px] text-emerald-400">✅ Successful recomposition</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white/60 uppercase">Biometric Progression</h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1 text-[10px] text-white/50">
                          <span>Muscle Retention Rate</span>
                          <span>98.2%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: "98.2%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[10px] text-white/50">
                          <span>Weekly Target Adherence</span>
                          <span>92.0%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="user-b"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="font-bold text-white text-lg">User B: Traditional Stagnation</h3>
                      <p className="text-xs text-rose-400 font-semibold mt-0.5">Platform: No AI tracking, generic logs</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-rose-400" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/5 bg-black/35 p-4 space-y-2">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">Form Accuracy</p>
                      <p className="text-2xl font-black text-white">42%</p>
                      <p className="text-[10px] text-rose-400">❌ Knee Valgus collapses inward</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-black/35 p-4 space-y-2">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">12-Week Bio Delta</p>
                      <p className="text-2xl font-black text-white">+1.8kg Fat / +0.2kg Muscle</p>
                      <p className="text-[10px] text-rose-400">❌ Metabolic downregulation</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white/60 uppercase">Biometric Progression</h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between mb-1 text-[10px] text-white/50">
                          <span>Muscle Retention Rate</span>
                          <span>38.5%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: "38.5%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[10px] text-white/50">
                          <span>Weekly Target Adherence</span>
                          <span>18.0%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: "18%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Premium Upgrade Segment */}
        <section id="premium" className="text-center max-w-3xl mx-auto py-10 space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#adc6ff]/10 text-[#adc6ff] mx-auto border border-[#adc6ff]/20">
            <Crown className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Unlock the Complete Physiology OS</h2>
          <p className="text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
            Take complete control of your biological transformation with adaptive feedback routines, deep neural pose trackers, and vision-ready food audits.
          </p>
          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#adc6ff] px-8 py-4 text-sm font-extrabold text-[#131315] hover:brightness-110 transition shadow-lg shadow-cyan-500/10"
            >
              Start Your Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-8 pb-4 text-center text-xs text-white/35 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <p>© 2026 AI Coach Lens, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1.5 font-semibold text-white/50">
            <ShieldCheck className="h-4.5 w-4.5 text-[#adc6ff]" /> HIPPA compliant secure database structures
          </div>
        </footer>

      </div>
    </main>
  );
}
