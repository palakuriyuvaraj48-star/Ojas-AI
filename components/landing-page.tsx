"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  Layers,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  Activity,
  HeartPulse,
  Award,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";
import { applyScenario, createInitialTwin } from "@/lib/digital-twin";
import { adaptPlan, generateInitialPlan, type AdaptedPlan } from "@/lib/adaptive-engine";
import type { ClientProfile } from "@/types/profile";
import { useFitness } from "@/components/providers/fitness-provider";

const defaultProfile: ClientProfile = {
  name: "Anil",
  age: 22,
  gender: "male",
  height: 175,
  weight: 75,
  goal: "fat-loss",
  activityLevel: "moderately-active",
  gymExperience: "intermediate",
  dailyStepGoal: 8000,
  occupation: "Student",
  workoutDaysPerWeek: 5,
  availableWorkoutTime: 60,
  medicalConditions: "None",
  injuries: "None",
  foodPreference: "both",
  allergies: "None",
  budget: "moderate",
  sleepDuration: 7.5,
  stressLevel: "low",
  availableEquipment: ["dumbbell", "bench", "gym equipment"],
  lifestyle: "Hostel student",
  workoutEnvironment: "gym",
  workoutTime: "evening",
};

export function LandingPage() {
  const { profile } = useFitness();
  const [activeScenario, setActiveScenario] = useState<"normal" | "exam" | "travel" | "recovery">("normal");
  const [adapted, setAdapted] = useState<AdaptedPlan | null>(null);

  // Smooth scrolling helper that respects reduced motion preferences
  const scrollTo = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const initial = useMemo(() => {
    const twin = createInitialTwin(defaultProfile, "sih-home-anil");
    return {
      twin,
      plan: generateInitialPlan(defaultProfile, twin),
    };
  }, []);

  const handleScenarioChange = (scenario: "normal" | "exam" | "travel" | "recovery") => {
    setActiveScenario(scenario);
    if (scenario === "normal") {
      setAdapted(null);
      return;
    }

    if (scenario === "exam") {
      const examTwin = applyScenario(initial.twin, { type: "exam", duration: 7 }).updatedTwin;
      const constrainedTwin = applyScenario(examTwin, {
        type: "budget-change",
        metadata: { newBudget: 150 },
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, constrainedTwin, initial.twin));
    } else if (scenario === "travel") {
      const travelTwin = applyScenario(initial.twin, {
        type: "travel",
        duration: 5,
        metadata: { equipmentAvailable: ["bodyweight"] },
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, travelTwin, initial.twin));
    } else if (scenario === "recovery") {
      const recoveryTwin = applyScenario(initial.twin, {
        type: "poor-sleep",
        duration: 3,
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, recoveryTwin, initial.twin));
    }
  };

  const adaptedDuration = adapted?.workoutPlan.durationMinutes ?? 20;
  const startDestination = profile ? "/dashboard" : "/onboarding";

  return (
    <main className="ojas-home min-h-screen overflow-hidden bg-[#07090e] text-white selection:bg-cyan-400 selection:text-slate-950">
      {/* Ambient Radial Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.15),transparent_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-96 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <header className="sticky top-4 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6 shadow-2xl">
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <b className="block text-base tracking-tight text-white">OJAS AI</b>
              <small className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                Adaptive Fitness System
              </small>
            </span>
          </button>

          <nav className="hidden items-center gap-6 text-xs font-semibold tracking-wide text-white/70 lg:flex">
            <a
              href="#problem"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("problem");
              }}
              className="transition hover:text-cyan-300"
            >
              Problem
            </a>
            <a
              href="#solution"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("solution");
              }}
              className="transition hover:text-cyan-300"
            >
              Solution
            </a>
            <a
              href="#core-features"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("core-features");
              }}
              className="transition hover:text-cyan-300"
            >
              3 Core Features
            </a>
            <a
              href="#digital-twin"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("digital-twin");
              }}
              className="transition hover:text-cyan-300"
            >
              Digital Twin
            </a>
            <a
              href="#adaptation-demo"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("adaptation-demo");
              }}
              className="transition hover:text-cyan-300 font-bold text-cyan-300"
            >
              Live Demo
            </a>
            <a
              href="#vision-coach"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("vision-coach");
              }}
              className="transition hover:text-cyan-300"
            >
              Vision Coach
            </a>
            <a
              href="#impact"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("impact");
              }}
              className="transition hover:text-cyan-300"
            >
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={startDestination}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/20"
            >
              <Zap className="h-3.5 w-3.5" />
              Start Ojas
            </Link>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SECTION 1 — HERO */}
        {/* ========================================================================= */}
        <section id="hero" className="scroll-mt-28 grid min-h-[580px] items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold text-cyan-300">
              <BrainCircuit className="h-3.5 w-3.5" />
              SIH ADAPTIVE FITNESS SYSTEM
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Fitness That <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">Adapts</span> to Your Life
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Ojas AI continuously learns your fitness, recovery and lifestyle conditions and dynamically adapts your workout, nutrition and recovery plan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={startDestination}
                className="inline-flex items-center gap-2.5 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300"
              >
                <Zap className="h-4 w-4" />
                Start Your Adaptive Plan
              </Link>
              <button
                onClick={() => scrollTo("adaptation-demo")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/90 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/10"
              >
                See How Ojas Adapts
                <ArrowDown className="h-4 w-4 text-cyan-400" />
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Real-time Digital Twin
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Dynamic AI Decision Engine
              </span>
            </div>

            {/* Core Message Callout */}
            <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-cyan-950/20 p-4 backdrop-blur">
              <p className="text-sm font-extrabold tracking-tight text-white sm:text-base">
                “Your life changes. Your fitness plan should too.”
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Ojas AI continuously adapts your fitness plan to your changing time, lifestyle, recovery, nutrition and progress.
              </p>
            </div>
          </motion.div>

          <HeroTwinCard />
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2 — THE PROBLEM */}
        {/* ========================================================================= */}
        <section id="problem" className="scroll-mt-28 py-16">
          <Eyebrow>THE CORE PROBLEM</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Why Traditional Fitness Plans Fail</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Static fitness plans fail when users&apos; real-life conditions change.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["📚", "Exams", "Less time + less sleep"],
              ["✈️", "Travel", "Different location + no equipment"],
              ["😴", "Poor Recovery", "Reduced sleep and high fatigue"],
              ["💰", "Budget Change", "Food plan becomes unrealistic"],
              ["⏰", "Schedule Change", "Less available workout time"],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-slate-900/50 p-5 backdrop-blur transition hover:border-cyan-400/30 hover:bg-slate-900/80 text-left"
              >
                <span className="text-2xl">{icon}</span>
                <h3 className="mt-3 font-bold text-white group-hover:text-cyan-300">{title}</h3>
                <p className="mt-1.5 text-xs text-white/60">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur">
            <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-red-300">
              The Failure Cycle of Static Plans
            </p>
            <HorizontalFlow
              items={[
                "FIXED PLAN",
                "LIFE CHANGES",
                "PLAN NO LONGER FITS",
                "MISSED WORKOUTS",
                "USER ABANDONS PLAN",
              ]}
              danger
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3 — THE OJAS DIFFERENCE */}
        {/* ========================================================================= */}
        <section id="solution" className="scroll-mt-28 py-16">
          <Eyebrow>THE OJAS DIFFERENCE</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ojas Doesn&apos;t Give You a Fixed Plan
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            It continuously adapts the plan as your life changes.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2 text-left">
            {/* Traditional Side */}
            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white/70">Traditional Fitness App</h3>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-400">
                  STATIC WORKFLOW
                </span>
              </div>
              <VerticalFlow items={["User", "Fixed Plan", "Life Changes", "Plan Fails"]} />
            </div>

            {/* Ojas Side */}
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-cyan-950/40 sm:p-8">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-black text-cyan-300">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  OJAS AI SYSTEM
                </h3>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-bold text-cyan-300">
                  CONTINUOUS ADAPTIVE LOOP
                </span>
              </div>
              <VerticalFlow
                accent
                items={[
                  "User",
                  "Digital Twin",
                  "Personalized Plan",
                  "Life Changes",
                  "AI Detects Changes",
                  "Plan Adapts",
                  "User Continues",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4 — THE 3 CORE OJAS FEATURES */}
        {/* ========================================================================= */}
        <section id="core-features" className="scroll-mt-28 py-16">
          <Eyebrow>CORE INNOVATIONS</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Built to Understand Changing Reality</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Three core technologies driving the Ojas adaptive intelligence.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
            {/* 1. Digital Twin */}
            <article className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/50 p-7 backdrop-blur transition hover:border-cyan-400/30">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">1. 🧬 AI Digital Twin</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  A continuously evolving representation of your fitness, recovery, nutrition, behavior and lifestyle state.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-cyan-200/90">
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Fitness State</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Recovery</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Nutrition</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Behavior</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Lifestyle</span>
                </div>
              </div>
              <button
                onClick={() => scrollTo("digital-twin")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                Explore Digital Twin
                <ArrowDown className="h-4 w-4" />
              </button>
            </article>

            {/* 2. Adaptive Fitness Engine (Featured) */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 p-7 shadow-xl shadow-cyan-950/50 backdrop-blur">
              <div className="absolute right-4 top-4 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
                MAIN INNOVATION
              </div>
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">2. 🔄 Adaptive Fitness Engine</h3>
                <p className="mt-3 text-sm leading-relaxed text-cyan-100/80">
                  Detects changes in circumstances (time, sleep, stress, budget) and dynamically modifies the fitness plan.
                </p>
                <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-black/40 p-4 text-xs font-mono">
                  <div className="flex justify-between text-cyan-200">
                    <span>Time ↓</span>
                    <span>Sleep ↓</span>
                    <span>Stress ↑</span>
                    <span>Budget ↓</span>
                  </div>
                  <div className="mt-2 text-center font-bold text-cyan-400">↓ PLAN ADAPTS DYNAMICALLY</div>
                </div>
              </div>
              <button
                onClick={() => scrollTo("adaptation-demo")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                See Adaptation
                <ArrowDown className="h-4 w-4" />
              </button>
            </article>

            {/* 3. AI Vision Coach */}
            <article className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/50 p-7 backdrop-blur transition hover:border-cyan-400/30">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">3. 🎥 AI Vision Coach</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Uses computer vision to analyze exercise movement, count repetitions, and provide actionable form feedback.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs font-mono">
                  <div className="flex items-center justify-between text-center text-white/70">
                    <span>Camera</span>
                    <span>→</span>
                    <span>Pose</span>
                    <span>→</span>
                    <span>Phase</span>
                    <span>→</span>
                    <span className="font-bold text-cyan-300">Feedback</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => scrollTo("vision-coach")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                See Vision Coach
                <ArrowDown className="h-4 w-4" />
              </button>
            </article>
          </div>

          {/* Compact Supporting Data Row */}
          <div className="mt-8 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Supporting Data Signals</p>
            <p className="text-xs font-medium text-white/70">
              Nutrition • Sleep • Wearables • Progress • Time • Budget • Equipment
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — DIGITAL TWIN SECTION */}
        {/* ========================================================================= */}
        <section id="digital-twin" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🧬 AI DIGITAL TWIN</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your Live Physiological &amp; Lifestyle Representation
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas maintains an evolving representation of the user&apos;s fitness, behavior, recovery, nutrition and lifestyle state.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* 5 Core State Categories */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
              <h3 className="font-bold text-white text-base">5 Evolving State Categories</h3>
              
              <div className="space-y-3 text-xs">
                {[
                  { title: "1. Fitness State", desc: "Muscle activation, strength trends, movement baseline, endurance.", status: "Optimal" },
                  { title: "2. Recovery State", desc: "HRV proxy, sleep debt, muscle fatigue, CNS readiness score.", status: "Active Tracking" },
                  { title: "3. Nutrition State", desc: "Caloric balance, protein targets, practical ₹150–₹250 budget meals.", status: "Hostel Plan" },
                  { title: "4. Behavioral State", desc: "Workout adherence history, completion consistency, habit strength.", status: "84% Adherence" },
                  { title: "5. Lifestyle State", desc: "Exam schedules, work shifts, travel status, equipment availability.", status: "Monitored" },
                ].map((cat) => (
                  <div key={cat.title} className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-cyan-300">{cat.title}</p>
                      <p className="text-white/60 mt-0.5">{cat.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-lg shrink-0 ml-3">
                      {cat.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What Changes Over Time Card */}
            <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/20 via-slate-950 to-black/60 p-6 space-y-5">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-cyan-400" /> What Changes Over Time?
                </h3>
                <p className="text-xs text-white/50 mt-1">Real-time state shifts registered by Ojas telemetry.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-semibold">Workout Consistency</p>
                  <p className="text-emerald-400 font-bold text-base mt-1">62% → 84% ↑</p>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-semibold">Exercise Form Score</p>
                  <p className="text-cyan-300 font-bold text-base mt-1">74 → 88 / 100 ↑</p>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-semibold">Sleep Duration</p>
                  <p className="text-amber-300 font-bold text-base mt-1">7.4h → 5.5h ↓</p>
                </div>
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase font-semibold">Available Time</p>
                  <p className="text-amber-300 font-bold text-base mt-1">60 min → 20 min ↓</p>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-3">
                <p className="text-xs text-cyan-200 leading-relaxed">
                  <strong>Adaptive Synchronization:</strong> When sleep and time drop during exam periods, the Digital Twin immediately alerts the Adaptive Engine to reduce training duration and preserve joint health.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => scrollTo("adaptation-demo")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-cyan-400 px-3.5 py-2 rounded-xl hover:bg-cyan-300 transition shadow-md shadow-cyan-400/20"
                  >
                    See Adaptive Simulation <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href="/twin"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/10 transition"
                  >
                    Open Full Digital Twin <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6 — ADAPTIVE ENGINE SECTION & LIVE DEMO */}
        {/* ========================================================================= */}
        <section id="adaptation-demo" className="scroll-mt-28 py-16 text-left">
          <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-10 shadow-2xl shadow-cyan-950/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Eyebrow>🔄 MAIN INNOVATION DEMONSTRATION</Eyebrow>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  The Plan Changes When Life Changes
                </h2>
              </div>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                ⚡ Real Digital Twin + Adaptive Engine
              </span>
            </div>

            {/* Interactive Scenario Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => handleScenarioChange("exam")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-md ${
                  activeScenario === "exam"
                    ? "bg-cyan-400 text-slate-950 shadow-cyan-400/20 ring-2 ring-cyan-300"
                    : "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/25"
                }`}
              >
                📚 Simulate Exam Period (Main Demo)
              </button>

              <button
                onClick={() => handleScenarioChange("travel")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeScenario === "travel"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                ✈️ Travel / Bodyweight Only
              </button>

              <button
                onClick={() => handleScenarioChange("recovery")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeScenario === "recovery"
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                😴 Poor Sleep / Fatigue
              </button>

              <button
                onClick={() => handleScenarioChange("normal")}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  activeScenario === "normal"
                    ? "bg-white text-slate-950 shadow-md"
                    : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Scenario (Normal Day)
              </button>
            </div>

            {/* Before vs After Parameters Grid */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <StateBox
                title="NORMAL BASELINE (Initial State)"
                badge="60 min · ₹250 Budget"
                values={[
                  ["Available Time", "60 min"],
                  ["Sleep Duration", "7.5 hours"],
                  ["Stress Level", "Low Stress"],
                  ["Daily Food Budget", "₹250 / day"],
                  ["Training Location", "Gym"],
                ]}
              />

              <StateBox
                title={
                  activeScenario === "exam"
                    ? "LIFE CHANGES DETECTED (Exam Period)"
                    : activeScenario === "travel"
                    ? "LIFE CHANGES DETECTED (Travel)"
                    : activeScenario === "recovery"
                    ? "LIFE CHANGES DETECTED (Poor Sleep)"
                    : "LIFE CHANGES (Click a scenario button above)"
                }
                badge={activeScenario === "normal" ? "Waiting for trigger" : "Adapted"}
                accent={activeScenario !== "normal"}
                values={
                  activeScenario === "exam"
                    ? [
                        ["Available Time", "20 min (Compressed)"],
                        ["Sleep Duration", "5.5 hours (Reduced)"],
                        ["Stress Level", "High (Exam Stress)"],
                        ["Daily Food Budget", "₹150 / day (Budget constraint)"],
                        ["Training Location", "Hostel Room"],
                      ]
                    : activeScenario === "travel"
                    ? [
                        ["Available Time", "30 min"],
                        ["Sleep Duration", "6.5 hours"],
                        ["Stress Level", "Moderate"],
                        ["Equipment", "Bodyweight Only"],
                        ["Location", "Hotel Room"],
                      ]
                    : activeScenario === "recovery"
                    ? [
                        ["Available Time", "45 min"],
                        ["Sleep Duration", "4.5 hours (Severe drop)"],
                        ["Stress Level", "High Fatigue"],
                        ["Recovery Score", "28% (Low readiness)"],
                        ["Training Focus", "Active Deload"],
                      ]
                    : [
                        ["Available Time", "60 min → Click 'Simulate Exam'"],
                        ["Sleep Duration", "7.5 h → Click 'Simulate Exam'"],
                        ["Stress Level", "Low → Click 'Simulate Exam'"],
                        ["Daily Food Budget", "₹250 → Click 'Simulate Exam'"],
                        ["Training Location", "Gym → Click 'Simulate Exam'"],
                      ]
                }
              />
            </div>

            {/* Adaptation Live Result Output */}
            {activeScenario !== "normal" && adapted && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    OJAS DETECTS: 4 meaningful changes in Digital Twin $\rightarrow$ Plan adapted in real-time
                  </span>
                  <span className="font-mono text-[11px]">Prototype AI Decision Confidence: 94%</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <AdaptCard label="Workout Duration" before="45 min" after={`${adaptedDuration} min`} />
                  <AdaptCard label="Training Load" before="Moderate / High" after="Adjusted (Lower Volume)" />
                  <AdaptCard label="Nutrition Budget" before="₹250 / day" after="₹150 / day Practical Meal Guide" />
                  <AdaptCard label="Recovery Priority" before="Standard" after="Higher Priority (Active Rest)" />
                </div>

                {/* Explainable AI Section */}
                <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-cyan-300">
                    <ScanLine className="h-5 w-5" />
                    Why Did Ojas Change Your Plan?
                  </h3>
                  <blockquote className="mt-3 rounded-xl border-l-4 border-cyan-400 bg-cyan-400/5 p-4 text-sm leading-relaxed text-white/90">
                    “Your available workout time decreased to 20 minutes, sleep reduced to 5.5 hours, and stress increased. Ojas automatically compressed today&apos;s plan into high-density active recovery to prevent burnout while keeping your daily streak alive.”
                  </blockquote>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">What Changed</p>
                      <p className="mt-1 text-xs text-white/70">Time (20m), sleep (5.5h), high stress, ₹150 budget.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Why It Changed</p>
                      <p className="mt-1 text-xs text-white/70">Prevent nervous system fatigue while preserving joint health.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">What Ojas Recommends</p>
                      <p className="mt-1 text-xs text-white/70">Execute the 20-min session &amp; follow ₹150 hostel grocery options.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — HOW OJAS WORKS */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>CONTINUOUS ADAPTIVE ARCHITECTURE</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">One Continuous Adaptive Loop</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            How Ojas continuously assesses, tracks, adapts, and improves your plan.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            {[
              ["01", "ASSESS", "Baseline onboarding"],
              ["02", "DIGITAL TWIN", "Evolving biometric state"],
              ["03", "PLAN", "Personalized fitness"],
              ["04", "TRACK", "Activity + lifestyle"],
              ["05", "ANALYZE", "Biomechanical engine"],
              ["06", "ADAPT", "Dynamic AI adjustment"],
              ["07", "IMPROVE", "Updated realistic plan ↺"],
            ].map(([step, title, text]) => (
              <div
                key={step}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur"
              >
                <div>
                  <span className="text-xs font-black text-cyan-400">{step}</span>
                  <h3 className="mt-2 text-xs font-bold tracking-wide text-white">{title}</h3>
                  <p className="mt-1 text-[11px] text-white/55">{text}</p>
                </div>
                {step !== "07" && <ArrowRight className="mt-3 hidden h-3.5 w-3.5 text-white/20 lg:block" />}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — VISION COACH SECTION */}
        {/* ========================================================================= */}
        <section id="vision-coach" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🎥 COMPUTER VISION RECOGNITION</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            AI Vision Coach: Real-Time Form &amp; Rep Auditing
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Local edge computer vision pipeline detecting landmarks, joint angles, movement phases, and form errors without cloud video upload.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Vision Pipeline Explanation */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 space-y-6">
              <h3 className="font-bold text-white text-base">Local Vision Processing Pipeline</h3>
              
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <HorizontalFlow
                  items={[
                    "LIVE CAMERA",
                    "BODY LANDMARKS",
                    "JOINT ANGLES",
                    "MOVEMENT PHASE",
                    "REP COUNT",
                    "FORM ANALYSIS",
                    "VOICE FEEDBACK",
                  ]}
                />
              </div>

              <div className="space-y-2.5 text-xs text-white/70">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Zero Zeroes Principle:</strong> Live continuous angle calculation on Squat, Push-up, Bicep Curl &amp; Press.
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Partial Rep Detection:</strong> Automatically flags shallow reversals (&lt; 72% ROM).
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Closed-Loop Sync:</strong> Form score and reps feed directly into the Digital Twin.
                </p>
              </div>

              <div>
                <Link
                  href="/form-coach"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 shadow-lg shadow-cyan-500/20"
                >
                  <Camera className="h-4 w-4" />
                  Open Live Coach Experience
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Realistic Diagnostic Example Card */}
            <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Form Audit Example</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">REP 7 · Complete</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-semibold">Repetition Form Score</p>
                  <p className="text-xl font-black text-cyan-300 mt-0.5">86 / 100</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold">
                  ⚠️ Depth Slightly Shallow
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-amber-300">What is happening:</p>
                  <p className="text-white mt-0.5">Hip crease stopped 2 inches above parallel knee line.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-purple-300">Why it matters:</p>
                  <p className="text-white/80 mt-0.5">Shallow depth shifts load exclusively to the patellar tendon, reducing glute recruitment.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-emerald-300">How to improve:</p>
                  <p className="text-emerald-100 font-medium mt-0.5">Descend 3 inches deeper until reaching the full 90° target before driving up.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — IMPACT */}
        {/* ========================================================================= */}
        <section id="impact" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>PRACTICAL IMPACT</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Designed to Keep Fitness Practical &amp; Sustainable
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Focusing on consistency through realistic adaptability rather than rigid perfectionism.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["🔄", "Better Adaptation", "Plans change seamlessly when real-life circumstances change."],
              ["⏱️", "Lower Friction", "Workouts dynamically scale down to fit available time (20m, 30m, 45m)."],
              ["💰", "Practical Nutrition", "Nutrition plans respect real hostel food budgets and grocery options."],
              ["📈", "Continuous Evolution", "The Digital Twin learns from user consistency over time."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur transition hover:border-cyan-400/30 text-left"
              >
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-4 text-base font-extrabold text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 — FINAL CTA */}
        {/* ========================================================================= */}
        <section id="start" className="scroll-mt-28 my-12 overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-cyan-950/40 px-6 py-16 text-center sm:px-12">
          <h2 className="max-w-3xl mx-auto text-3xl font-black leading-tight sm:text-5xl">
            Your Life Won&apos;t Stay the Same. <br className="hidden sm:block" />
            Your Fitness Plan Shouldn&apos;t Either.
          </h2>
          <p className="mt-4 text-base text-white/70 max-w-xl mx-auto">
            Start with your current reality. Ojas AI continuously adapts from there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={startDestination}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300"
            >
              <Zap className="h-4 w-4" />
              Start Ojas
            </Link>
            <button
              onClick={() => scrollTo("adaptation-demo")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
            >
              Explore the SIH Demo
            </button>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="flex flex-wrap items-center justify-between border-t border-white/10 py-6 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Ojas AI — Adaptive Fitness System for SIH</p>
          <div className="flex gap-4">
            <button onClick={() => scrollTo("hero")} className="hover:text-white transition">Back to top ↑</button>
          </div>
        </footer>
      </div>
    </main>
  );
}

{/* Helper UI Components */}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">{children}</p>;
}

function HeroTwinCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl text-left">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs font-bold text-white/80">Ojas AI Digital Twin Model</span>
        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
          LIVE MODEL ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40">Fitness State</p>
          <p className="mt-1 font-bold text-white">Fat-loss goal</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40">Recovery State</p>
          <p className="mt-1 font-bold text-emerald-300">7.5 h sleep (Good)</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40">Lifestyle</p>
          <p className="mt-1 font-bold text-white">60 min available</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/40">Nutrition Budget</p>
          <p className="mt-1 font-bold text-white">₹250 / day</p>
        </div>
      </div>

      <div className="my-4 flex justify-center">
        <ArrowDown className="h-4 w-4 animate-bounce text-cyan-400" />
      </div>

      <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Today&apos;s Adaptive Recommendation</p>
        <p className="mt-1 text-2xl font-black text-cyan-300">45 min · Moderate Intensity</p>
      </div>
    </div>
  );
}

function HorizontalFlow({ items, danger = false }: { items: string[]; danger?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
      {items.map((item, idx) => (
        <span key={item} className="flex items-center gap-2">
          <span
            className={`rounded-lg px-3 py-1.5 font-bold ${
              danger ? "bg-red-500/15 text-red-200" : "bg-white/10 text-white/80"
            }`}
          >
            {item}
          </span>
          {idx < items.length - 1 && <span className="text-white/30">→</span>}
        </span>
      ))}
    </div>
  );
}

function VerticalFlow({ items, accent = false }: { items: string[]; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 font-mono text-xs">
      {items.map((item, idx) => (
        <div key={item} className="flex flex-col items-center gap-2">
          <span
            className={`rounded-xl px-4 py-2 text-center font-bold transition ${
              accent
                ? "border border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                : "border border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {item}
          </span>
          {idx < items.length - 1 && <ArrowDown className={`h-3.5 w-3.5 ${accent ? "text-cyan-400" : "text-white/30"}`} />}
        </div>
      ))}
    </div>
  );
}

function StateBox({
  title,
  badge,
  values,
  accent = false,
}: {
  title: string;
  badge: string;
  values: string[][];
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        accent ? "border-cyan-400/40 bg-cyan-400/5" : "border-white/10 bg-slate-950/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${accent ? "text-cyan-300" : "text-white/70"}`}>
          {title}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            accent ? "bg-cyan-400/20 text-cyan-300" : "bg-white/10 text-white/50"
          }`}
        >
          {badge}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {values.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/5 bg-white/5 p-2.5">
            <p className="text-[10px] text-white/40">{k}</p>
            <p className={`mt-0.5 font-bold ${accent ? "text-cyan-200" : "text-white"}`}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdaptCard({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="line-through text-white/40">{before}</span>
        <span className="font-bold text-cyan-300">{after}</span>
      </div>
    </div>
  );
}
