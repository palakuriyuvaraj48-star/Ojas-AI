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
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfChanges, setWhatIfChanges] = useState<string[]>([]);

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
    setShowFeedback(false);
    setFeedbackGiven(false);
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

  const handleWhatIfToggle = (change: string) => {
    setWhatIfChanges((prev) =>
      prev.includes(change) ? prev.filter((c) => c !== change) : [...prev, change]
    );
  };

  const handleFeedback = () => {
    setFeedbackGiven(true);
    setShowFeedback(false);
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

          <nav className="hidden items-center gap-5 text-xs font-semibold tracking-wide text-white/70 xl:flex">
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
              href="#what-decides"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("what-decides");
              }}
              className="transition hover:text-cyan-300 font-bold text-cyan-300"
            >
              How Ojas Decides
            </a>
            <a
              href="#adaptation-demo"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("adaptation-demo");
              }}
              className="transition hover:text-cyan-300"
            >
              Live Demo
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("how-it-works");
              }}
              className="transition hover:text-cyan-300"
            >
              How It Works
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
              href="#sports"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("sports");
              }}
              className="transition hover:text-cyan-300"
            >
              Sports
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
              href="#health-risk"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("health-risk");
              }}
              className="transition hover:text-cyan-300"
            >
              Health &amp; Risk
            </a>
            <a
              href="#india-first"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("india-first");
              }}
              className="transition hover:text-cyan-300"
            >
              India-First
            </a>
            <a
              href="#technology"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("technology");
              }}
              className="transition hover:text-cyan-300"
            >
              Technology
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
              INDIA-FIRST ADAPTIVE HUMAN PERFORMANCE SYSTEM
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-6xl text-white">
              Your body changes. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">Your training should too.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Ojas continuously analyzes your fitness, sports performance, recovery and lifestyle to determine the most suitable and achievable action for you today.
            </p>

            {/* Three Capability Labels */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3">
                <Activity className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-xs font-bold text-cyan-200 uppercase tracking-wider">FIT</p>
                  <p className="text-[10px] text-white/60">Improve everyday fitness</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-400/10 px-4 py-3">
                <Award className="h-5 w-5 text-teal-300" />
                <div>
                  <p className="text-xs font-bold text-teal-200 uppercase tracking-wider">PERFORM</p>
                  <p className="text-[10px] text-white/60">Train smarter for your sport</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">PROTECT</p>
                  <p className="text-[10px] text-white/60">Recognize unhealthy patterns</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={startDestination}
                className="inline-flex items-center gap-2.5 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-400/20 transition hover:bg-cyan-300"
              >
                <Zap className="h-4 w-4" />
                Try Live Adaptive Demo
              </Link>
              <button
                onClick={() => scrollTo("what-decides")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white/90 backdrop-blur transition hover:border-cyan-400/40 hover:bg-white/10"
              >
                See How Ojas Decides
                <ArrowDown className="h-4 w-4 text-cyan-400" />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> SENSE → UNDERSTAND → ANALYZE → DECIDE → ACT → LEARN
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Hostel Mode & Budget Coach
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#adc6ff]" /> Multilingual (EN / తెలుగు / हिंदी)
              </span>
            </div>

            {/* Core Message Callout */}
            <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-cyan-950/20 p-4 backdrop-blur">
              <p className="text-sm font-extrabold tracking-tight text-white sm:text-base">
                "Fixed fitness plans fail when your life changes. Ojas adapts with you."
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Ojas continuously adapts fitness, sports training, recovery and lifestyle recommendations to your current condition and real-world constraints.
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
        {/* SECTION 2.5 — WHAT DOES OJAS DECIDE? */}
        {/* ========================================================================= */}
        <section id="what-decides" className="scroll-mt-28 py-16">
          <Eyebrow>DECISION-FIRST</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">What does Ojas actually decide?</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            See how Ojas analyzes your current state and makes an adaptive decision.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* User State Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Example User State</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Sleep</span>
                  <span className="font-bold text-amber-300">5.2h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Stress</span>
                  <span className="font-bold text-red-400">High</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Training Load</span>
                  <span className="font-bold text-red-400">High</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Available Time</span>
                  <span className="font-bold text-amber-300">20 min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Equipment</span>
                  <span className="font-bold text-amber-300">None</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Sport</span>
                  <span className="font-bold text-white">Cricket</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Previous Session</span>
                  <span className="font-bold text-red-400">Heavy</span>
                </div>
              </div>
            </div>

            {/* Ojas Decision Card */}
            <div className="rounded-3xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-950/30 via-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-black text-cyan-300">OJAS DECISION</h3>
              </div>
              
              <div className="p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-2xl mb-4">
                <p className="text-base font-bold text-white">
                  Reduce today's training load and prioritize recovery.
                </p>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-bold text-white/80 mb-3">New Plan:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white">15 min sport-specific practice</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white">10 min mobility</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white">Recovery priority</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/40 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-white">Sleep recommendation</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <h4 className="text-xs font-bold text-cyan-300 mb-2">Why this decision?</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↓</span>
                    <span className="text-white/70">Sleep</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↑</span>
                    <span className="text-white/70">Stress</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↑</span>
                    <span className="text-white/70">Training Load</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↓</span>
                    <span className="text-white/70">Available Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↓</span>
                    <span className="text-white/70">Equipment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-400">↓</span>
                    <span className="text-white/70">Recovery</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-white/50">
                  <Info className="h-3 w-3" />
                  DEMO SIMULATION
                </span>
              </div>
            </div>
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
        {/* SECTION 4 — THE OJAS INTELLIGENCE SYSTEM */}
        {/* ========================================================================= */}
        <section id="core-features" className="scroll-mt-28 py-16">
          <Eyebrow>THE OJAS INTELLIGENCE SYSTEM</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">How Ojas Thinks</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Three core systems that work together to understand, decide, and adapt.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
            {/* 1. Context Engine */}
            <article className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/50 p-7 backdrop-blur transition hover:border-cyan-400/30">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">01 — Context Engine</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Understands Body + Sport + Lifestyle + Environment
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-cyan-200/90">
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Fitness</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Sports</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Recovery</span>
                  <span className="rounded-lg bg-cyan-400/10 px-2.5 py-1">Lifestyle</span>
                </div>
              </div>
            </article>

            {/* 2. Human Performance Twin (Featured) */}
            <article className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-b from-cyan-950/40 to-slate-900/90 p-7 shadow-xl shadow-cyan-950/50 backdrop-blur">
              <div className="absolute right-4 top-4 rounded-full bg-cyan-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
                CORE
              </div>
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">02 — Human Performance Twin</h3>
                <p className="mt-3 text-sm leading-relaxed text-cyan-100/80">
                  Maintains your evolving user state model
                </p>
                <div className="mt-6 rounded-2xl border border-cyan-400/30 bg-black/40 p-4 text-xs font-mono">
                  <div className="flex justify-between text-cyan-200">
                    <span>Fitness</span>
                    <span>Sports</span>
                    <span>Recovery</span>
                    <span>Behavior</span>
                  </div>
                  <div className="mt-2 text-center font-bold text-cyan-400">→ EVOLVING STATE</div>
                </div>
              </div>
              <button
                onClick={() => scrollTo("digital-twin")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                Explore Twin
                <ArrowDown className="h-4 w-4" />
              </button>
            </article>

            {/* 3. Adaptive Decision Engine */}
            <article className="flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/50 p-7 backdrop-blur transition hover:border-cyan-400/30">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-extrabold text-white">03 — Adaptive Decision Engine</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Determines the best feasible action for today
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs font-mono">
                  <div className="flex items-center justify-between text-center text-white/70">
                    <span>Context</span>
                    <span>→</span>
                    <span>Constraints</span>
                    <span>→</span>
                    <span>Risk</span>
                    <span>→</span>
                    <span className="font-bold text-cyan-300">Decision</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => scrollTo("adaptation-demo")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition hover:text-cyan-200"
              >
                See Decision
                <ArrowDown className="h-4 w-4" />
              </button>
            </article>
          </div>

          {/* Supporting Systems */}
          <div className="mt-8 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Supporting Systems</p>
            <p className="text-xs font-medium text-white/70">
              Vision Coach • Sports Performance • Nutrition • Recovery • Risk & Safety
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5 — DIGITAL TWIN SECTION */}
        {/* ========================================================================= */}
        <section id="digital-twin" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🧬 ADAPTIVE HUMAN PERFORMANCE TWIN</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Your Evolving User State Model
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas maintains a structured, evolving representation of your fitness, sports performance, recovery, nutrition, lifestyle and behavior.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* 6 Core State Categories */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 space-y-4">
              <h3 className="font-bold text-white text-base">6 Evolving State Categories</h3>
              
              <div className="space-y-3 text-xs">
                {[
                  { title: "1. FITNESS", desc: "Strength, endurance, mobility, activity level, fitness trend.", status: "Tracking" },
                  { title: "2. SPORTS", desc: "Sport, skill level, practice, performance, training load.", status: "Sport-Specific" },
                  { title: "3. RECOVERY", desc: "Sleep duration, fatigue, recovery trend, recent workload.", status: "Recovery Tracking" },
                  { title: "4. NUTRITION", desc: "Goals, food availability, budget, nutrition patterns.", status: "Budget-Aware" },
                  { title: "5. LIFESTYLE", desc: "Schedule, study/work, stress, travel, equipment.", status: "Context-Aware" },
                  { title: "6. BEHAVIOUR", desc: "Adherence, missed sessions, preferences, feedback.", status: "Learning" },
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

              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-white/50">
                  <Info className="h-3 w-3" />
                  DEMO SIMULATION
                </span>
              </div>
            </div>
          </div>

          {/* Data Quality & Confidence Indicators */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
              <h4 className="text-xs font-bold text-white mb-3">Digital Twin Completeness</h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Sleep Data", status: "complete" },
                  { label: "Workout History", status: "complete" },
                  { label: "Sports Activity", status: "complete" },
                  { label: "Nutrition Logs", status: "partial" },
                  { label: "Wearable Data", status: "missing" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-white/60">{item.label}</span>
                    <span className={`font-bold ${
                      item.status === "complete" ? "text-emerald-400" :
                      item.status === "partial" ? "text-amber-400" : "text-red-400"
                    }`}>
                      {item.status === "complete" ? "✓" : item.status === "partial" ? "Partial" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Overall Completeness</span>
                  <span className="font-bold text-cyan-300">78%</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
              <h4 className="text-xs font-bold text-white mb-3">Recommendation Confidence</h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60">Plan Confidence</span>
                    <span className="font-bold text-cyan-300">85%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60">Data Quality</span>
                    <span className="font-bold text-amber-300">78%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60">Adaptation Accuracy</span>
                    <span className="font-bold text-emerald-300">92%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-white/40">
                Confidence is calculated from data completeness, consistency, and historical accuracy.
              </p>
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
                {/* Decision Pipeline Flow */}
                <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-cyan-300 mb-4">
                    <ScanLine className="h-4 w-4" />
                    ADAPTIVE DECISION PIPELINE
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono">
                    <span className="rounded-lg bg-emerald-400/20 text-emerald-300 px-2 py-1">NORMAL</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-amber-400/20 text-amber-300 px-2 py-1">CONTEXT CHANGE</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-cyan-400/20 text-cyan-300 px-2 py-1">DIGITAL TWIN UPDATE</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-cyan-400/20 text-cyan-300 px-2 py-1">ANALYSIS</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-cyan-400/20 text-cyan-300 px-2 py-1">CONSTRAINTS</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-red-400/20 text-red-300 px-2 py-1">RISK CHECK</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-cyan-400/20 text-cyan-300 px-2 py-1">OJAS DECISION</span>
                    <span className="text-white/30">→</span>
                    <span className="rounded-lg bg-emerald-400/20 text-emerald-300 px-2 py-1">NEW PLAN</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-bold text-cyan-300">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    OJAS DETECTS: 4 meaningful changes in Digital Twin → Plan adapted in real-time
                  </span>
                  <span className="font-mono text-[11px]">Decision Confidence: 94%</span>
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
                    "Your available workout time decreased to 20 minutes, sleep reduced to 5.5 hours, and stress increased. Ojas automatically compressed today's plan into high-density active recovery to prevent burnout while keeping your daily streak alive."
                  </blockquote>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">What Changed</p>
                      <p className="mt-1 text-xs text-white/70">Time (20m), sleep (5.5h), high stress, ₹150 budget.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">Why It Changed</p>
                      <p className="mt-1 text-xs text-white/70">Prevent fatigue while preserving joint health.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">What Ojas Recommends</p>
                      <p className="mt-1 text-xs text-white/70">Execute the 20-min session & follow ₹150 hostel grocery options.</p>
                    </div>
                  </div>
                </div>

                {/* What If? Simulation */}
                <div className="rounded-2xl border border-purple-400/30 bg-purple-400/5 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-purple-300">
                    <Sliders className="h-5 w-5" />
                    What if my situation changes?
                  </h3>
                  <p className="mt-2 text-xs text-white/60">
                    Simulate hypothetical changes without modifying your real Digital Twin.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { id: "time-15", label: "Only 15 min" },
                      { id: "no-equipment", label: "No equipment" },
                      { id: "poor-sleep", label: "Poor sleep" },
                      { id: "match-tomorrow", label: "Match tomorrow" },
                      { id: "budget-80", label: "₹80 budget" },
                      { id: "travel-mode", label: "Traveling" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleWhatIfToggle(option.id)}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                          whatIfChanges.includes(option.id)
                            ? "bg-purple-400 text-slate-950"
                            : "border border-purple-400/30 bg-purple-400/10 text-purple-200 hover:bg-purple-400/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {whatIfChanges.length > 0 && (
                    <div className="mt-4 p-3 bg-purple-400/10 border border-purple-400/30 rounded-xl">
                      <p className="text-xs text-purple-200">
                        <strong>Hypothetical scenario:</strong> {whatIfChanges.length} change(s) applied. In a real session, Ojas would adapt your plan accordingly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback Mechanism */}
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                    Simulate Workout Feedback
                  </h3>
                  <p className="mt-2 text-xs text-white/60">
                    Show how user feedback updates the Digital Twin for future recommendations.
                  </p>
                  {!feedbackGiven ? (
                    <div className="mt-4 space-y-4">
                      {!showFeedback ? (
                        <button
                          onClick={() => setShowFeedback(true)}
                          className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-300 transition"
                        >
                          Complete Simulated Workout
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-white/50 mb-1">Completed?</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleFeedback}
                                  className="flex-1 rounded-lg bg-emerald-400/20 border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-400/30 transition"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={handleFeedback}
                                  className="flex-1 rounded-lg bg-red-400/20 border border-red-400/30 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-400/30 transition"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-white/50 mb-1">Difficulty (1-10)</p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                  <button
                                    key={n}
                                    onClick={handleFeedback}
                                    className="flex-1 rounded bg-white/10 py-1 text-[10px] font-bold text-white/70 hover:bg-cyan-400/30 transition"
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-white/50 mb-1">Energy (1-10)</p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                  <button
                                    key={n}
                                    onClick={handleFeedback}
                                    className="flex-1 rounded bg-white/10 py-1 text-[10px] font-bold text-white/70 hover:bg-cyan-400/30 transition"
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl">
                        <p className="text-xs text-emerald-200 font-bold">✓ Feedback Received</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <span className="rounded-lg bg-emerald-400/20 text-emerald-300 px-2 py-1">FEEDBACK</span>
                        <span className="text-white/30">→</span>
                        <span className="rounded-lg bg-cyan-400/20 text-cyan-300 px-2 py-1">DIGITAL TWIN UPDATED</span>
                        <span className="text-white/30">→</span>
                        <span className="rounded-lg bg-purple-400/20 text-purple-300 px-2 py-1">NEXT PLAN ADAPTED</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7 — HOW OJAS THINKS (SENSE → UNDERSTAND → ANALYZE → DECIDE → ACT → LEARN) */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>HOW OJAS THINKS</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">The Adaptive Intelligence Loop</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas doesn&apos;t just generate workouts. It continuously understands, decides, and learns.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {[
              ["01", "SENSE", "Collect activity, sport, recovery and lifestyle signals"],
              ["02", "UNDERSTAND", "Update the Digital Twin with new information"],
              ["03", "ANALYZE", "Evaluate performance, recovery and context"],
              ["04", "DECIDE", "Choose the best feasible action for today"],
              ["05", "ACT", "User performs training/recovery/nutrition action"],
              ["06", "LEARN", "Feedback updates the Digital Twin for next time"],
            ].map(([step, title, text], idx) => (
              <div
                key={step}
                className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur"
              >
                <div>
                  <span className="text-xs font-black text-cyan-400">{step}</span>
                  <h3 className="mt-2 text-sm font-bold tracking-wide text-white">{title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{text}</p>
                </div>
                {idx < 5 && (
                  <div className="mt-3 flex items-center gap-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/40 to-transparent" />
                    <ArrowRight className="h-3 w-3 text-cyan-400/60" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-center">
            <p className="text-xs text-cyan-200">
              <strong>Closed-Loop System:</strong> Every action feeds back into the Digital Twin, making future recommendations smarter and more personalized.
            </p>
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
              <h3 className="font-bold text-white text-base">Vision Coach → Digital Twin Integration</h3>
              
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <HorizontalFlow
                  items={[
                    "CAMERA",
                    "POSE",
                    "ANALYSIS",
                    "SIGNAL",
                    "DIGITAL TWIN",
                    "ADAPTATION",
                  ]}
                />
              </div>

              <div className="space-y-2.5 text-xs text-white/70">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Zero Zeroes Principle:</strong> Live continuous angle calculation on Squat, Push-up, Bicep Curl & Press.
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Partial Rep Detection:</strong> Automatically flags shallow reversals (&lt; 72% ROM).
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <strong>Closed-Loop Sync:</strong> Form score and movement quality signals feed into the Digital Twin for adaptive training.
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

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-amber-300">What is happening:</p>
                  <p className="text-white mt-0.5">Hip crease stopped above the knee line during descent phase.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-purple-300">Movement quality signal:</p>
                  <p className="text-white/80 mt-0.5">Shallow depth can alter movement mechanics and change how load is distributed across the involved muscles and joints.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold uppercase text-emerald-300">Training recommendation:</p>
                  <p className="text-emerald-100 font-medium mt-0.5">Focus on achieving fuller range of motion with controlled tempo before adding intensity.</p>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-white/50">
                    <Info className="h-3 w-3" />
                    DEMO SIMULATION — Movement quality example
                  </span>
                </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8 — HEALTH & TRAINING RISK */}
        {/* ========================================================================= */}
        <section id="health-risk" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🛡️ TRAIN SMARTER. RECOVER SMARTER.</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pattern Awareness for Safer Training
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas recognizes patterns that may indicate training stress, recovery concerns, or unhealthy lifestyle trends — and adapts accordingly.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* Training Risk Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Training Risk Signal</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Training Load</span>
                  <span className="font-bold text-red-400">↑ High</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Sleep</span>
                  <span className="font-bold text-red-400">↓ Low</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Fatigue</span>
                  <span className="font-bold text-red-400">↑ Elevated</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Performance</span>
                  <span className="font-bold text-amber-300">↓ Declining</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                <p className="text-xs text-amber-200">
                  <strong>Risk Level: Elevated</strong> — Ojas recommends reducing intensity and prioritizing recovery.
                </p>
              </div>
            </div>

            {/* Recovery Concern Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Recovery Concern</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Sleep Duration</span>
                  <span className="font-bold text-red-400">5.2h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Sleep Quality</span>
                  <span className="font-bold text-red-400">Poor</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Recovery Score</span>
                  <span className="font-bold text-amber-300">42/100</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Readiness</span>
                  <span className="font-bold text-red-400">Fatigued</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                <p className="text-xs text-cyan-200">
                  <strong>Recovery Priority</strong> — Ojas shifts focus to sleep hygiene and active recovery.
                </p>
              </div>
            </div>

            {/* Lifestyle Pattern Card */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Healthier Habit Recommendation</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Inactivity</span>
                  <span className="font-bold text-amber-300">3+ days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Consistency</span>
                  <span className="font-bold text-red-400">45%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Stress Pattern</span>
                  <span className="font-bold text-red-400">Sustained High</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-white/60">Adherence</span>
                  <span className="font-bold text-amber-300">At Risk</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl">
                <p className="text-xs text-emerald-200">
                  <strong>Lifestyle Signal</strong> — Ojas suggests minimum viable movement to rebuild consistency.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/40 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Important Note</p>
            <p className="text-xs font-medium text-white/60">
              Ojas does not diagnose or prevent diseases. It recognizes training and lifestyle patterns to support safer, more sustainable fitness habits.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9 — MINIMUM VIABLE TRAINING */}
        {/* ========================================================================= */}
        <section id="minimum-viable" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>⚡ MINIMUM VIABLE TRAINING</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            When Life Makes the Ideal Impossible
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas finds the smallest meaningful action that can still be completed — keeping you consistent even during the busiest periods.
          </p>

          <div className="mt-10 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
              <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
                <p className="text-[10px] text-white/40 uppercase">Ideal</p>
                <p className="text-white mt-1">60 min</p>
              </div>
              <ArrowDown className="h-4 w-4 text-cyan-400 rotate-[-90deg]" />
              <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
                <p className="text-[10px] text-white/40 uppercase">Reduced</p>
                <p className="text-white mt-1">30 min</p>
              </div>
              <ArrowDown className="h-4 w-4 text-cyan-400 rotate-[-90deg]" />
              <div className="rounded-xl bg-cyan-400/20 border border-cyan-400/30 px-4 py-3 text-center">
                <p className="text-[10px] text-cyan-300 uppercase">Minimum</p>
                <p className="text-cyan-200 mt-1">15 min</p>
              </div>
              <ArrowDown className="h-4 w-4 text-cyan-400 rotate-[-90deg]" />
              <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
                <p className="text-[10px] text-white/40 uppercase">Movement</p>
                <p className="text-white mt-1">5 min</p>
              </div>
              <ArrowDown className="h-4 w-4 text-cyan-400 rotate-[-90deg]" />
              <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
                <p className="text-[10px] text-white/40 uppercase">Recovery</p>
                <p className="text-white mt-1">Rest</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-2xl text-center">
              <p className="text-sm text-cyan-200">
                <strong>Core Principle:</strong> Something is always better than nothing. Ojas ensures you never miss a day completely.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10 — SPORTS PERFORMANCE */}
        {/* ========================================================================= */}
        <section id="sports" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🏅 BUILT FOR PEOPLE WHO TRAIN</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Sport-Specific Adaptive Training</h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas adapts training to your sport, performance goals, and competition schedule.
          </p>

          {/* Sport Selection */}
          <div className="mt-10 flex flex-wrap gap-3">
            {["Cricket", "Football", "Badminton", "Athletics", "Basketball", "More"].map((sport) => (
              <button
                key={sport}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/70 hover:border-cyan-400/40 hover:bg-white/10 transition"
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Sport Example Flow */}
          <div className="mt-10 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Example: Cricket Player</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">SPORT</p>
                <p className="font-bold text-white mt-1">Cricket</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">PERFORMANCE</p>
                <p className="font-bold text-cyan-300 mt-1">Batting Focus</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">TRAINING LOAD</p>
                <p className="font-bold text-red-400 mt-1">High</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">RECOVERY</p>
                <p className="font-bold text-amber-300 mt-1">Moderate</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                <p className="text-[10px] text-white/40 uppercase font-semibold">LIFESTYLE</p>
                <p className="font-bold text-white mt-1">Match Tomorrow</p>
              </div>
              <div className="p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/30 text-center">
                <p className="text-[10px] text-cyan-300 uppercase font-semibold">ADAPTIVE TRAINING</p>
                <p className="font-bold text-cyan-200 mt-1">Skill + Mobility</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-2xl">
              <p className="text-xs text-cyan-200 leading-relaxed">
                <strong>OJAS DECISION:</strong> Match tomorrow + high training load → Reduce heavy training and prioritize skill practice + mobility + recovery.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 11 — FROM MOVEMENT TO ADAPTATION */}
        {/* ========================================================================= */}
        <section id="movement-adaptation" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🎥 FROM MOVEMENT TO ADAPTATION</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Vision Coach: A Sensor for the Ojas System
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Vision Coach is not an isolated feature — it feeds movement quality signals directly into your Digital Twin.
          </p>

          <div className="mt-10 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 p-6 sm:p-8">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 mb-6">
              <HorizontalFlow
                items={[
                  "CAMERA",
                  "POSE",
                  "ANALYSIS",
                  "FORM SIGNAL",
                  "DIGITAL TWIN",
                  "ADAPTATION",
                ]}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-bold text-white text-base mb-4">Movement Quality Trend</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white/60">Form Score Trend</span>
                    <span className="font-bold text-amber-300">91 → 88 → 79</span>
                  </div>
                  <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                    <p className="text-amber-200">
                      <strong>Movement quality declining</strong> — This signal is sent to the Digital Twin.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-4">Adaptive Response</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                    <p className="text-cyan-200">
                      <strong>Ojas considers reducing training intensity/volume</strong> — based on declining movement quality signals.
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white/60">Recommended Action</span>
                    <span className="font-bold text-cyan-300">Reduce Load</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-white/50">
                <Info className="h-3 w-3" />
                DEMO SIMULATION
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 12 — INDIA-FIRST */}
        {/* ========================================================================= */}
        <section id="india-first" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>🇮🇳 FITNESS FOR REAL INDIAN LIFE</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for India&apos;s Unique Constraints
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Ojas understands hostel life, mess food, tight budgets, and limited equipment — because fitness should work for everyone.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Hostel Mode</h3>
              </div>
              <div className="space-y-2 text-xs text-white/70">
                <p>No gym? No problem.</p>
                <p>Ojas creates effective bodyweight workouts for small hostel rooms.</p>
              </div>
              <div className="mt-4 p-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl">
                <p className="text-xs text-emerald-200 font-bold">Equipment: None needed</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Mess Food</h3>
              </div>
              <div className="space-y-2 text-xs text-white/70">
                <p>Limited food choices?</p>
                <p>Ojas works with dal, rice, roti, eggs, and seasonal vegetables.</p>
              </div>
              <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl">
                <p className="text-xs text-amber-200 font-bold">Budget: ₹50-₹150/day</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Time Constraints</h3>
              </div>
              <div className="space-y-2 text-xs text-white/70">
                <p>Exams, classes, work?</p>
                <p>Ojas adapts workouts to 15-20 minutes when time is tight.</p>
              </div>
              <div className="mt-4 p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                <p className="text-xs text-cyan-200 font-bold">Available: 20 min</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Multilingual</h3>
              </div>
              <div className="space-y-2 text-xs text-white/70">
                <p>Fitness in your language.</p>
                <p>English, हिंदी, తెలుగు, and more.</p>
              </div>
              <div className="mt-4 p-3 bg-purple-400/10 border border-purple-400/30 rounded-xl">
                <p className="text-xs text-purple-200 font-bold">13+ Languages</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-slate-900 p-6">
            <h3 className="text-base font-bold text-white mb-4">Example: Hostel Student Scenario</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-semibold">Location</p>
                <p className="font-bold text-white mt-1">Hostel Room</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-semibold">Budget</p>
                <p className="font-bold text-amber-300 mt-1">₹80/day</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/40 uppercase font-semibold">Time</p>
                <p className="font-bold text-cyan-300 mt-1">20 minutes</p>
              </div>
              <div className="p-3 bg-cyan-400/10 rounded-xl border border-cyan-400/30">
                <p className="text-[10px] text-cyan-300 uppercase font-semibold">Ojas Plan</p>
                <p className="font-bold text-cyan-200 mt-1">Bodyweight HIIT</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-white/70">
                <strong>OJAS DECISION:</strong> No equipment + ₹80 budget + 20 min → Bodyweight high-intensity circuit with dal-rice protein focus.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 13 — TECHNOLOGY ARCHITECTURE */}
        {/* ========================================================================= */}
        <section id="technology" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>⚙️ HOW OJAS WORKS — TECHNICAL ARCHITECTURE</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            The Ojas Intelligence System
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            A transparent view of how Ojas processes your data to make adaptive decisions.
          </p>

          <div className="mt-10 rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8">
            <h3 className="text-base font-bold text-white mb-6">Decision Pipeline</h3>
            <div className="space-y-3">
              {[
                { label: "USER INPUTS", desc: "Activity, Sport, Lifestyle, Recovery data" },
                { label: "CONTEXT ENGINE", desc: "Understands body + sport + lifestyle + environment" },
                { label: "DIGITAL TWIN", desc: "Maintains evolving user state model" },
                { label: "PERFORMANCE ANALYSIS", desc: "Evaluates fitness, recovery, training load" },
                { label: "CONSTRAINT ENGINE", desc: "Applies real-world limitations (time, budget, equipment)" },
                { label: "ADAPTIVE DECISION ENGINE", desc: "Determines best achievable action" },
                { label: "SAFETY / RISK", desc: "Checks training risk signals and recovery status" },
                { label: "RECOMMENDATION", desc: "Delivers achievable training/recovery/nutrition plan" },
                { label: "FEEDBACK LOOP", desc: "User result updates the Digital Twin" },
              ].map((step, idx) => (
                <div key={step.label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400/20 text-cyan-300 text-xs font-bold">
                      {idx + 1}
                    </div>
                    {idx < 8 && <div className="h-4 w-px bg-cyan-400/30" />}
                  </div>
                  <div className="flex-1 p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-xs font-bold text-cyan-300">{step.label}</p>
                    <p className="text-[11px] text-white/60 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/50 p-6">
            <h3 className="text-base font-bold text-white mb-4">Vision Coach Pipeline</h3>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <HorizontalFlow
                items={[
                  "CAMERA",
                  "POSE ESTIMATION",
                  "MOVEMENT ANALYSIS",
                  "PERFORMANCE SIGNAL",
                  "DIGITAL TWIN",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 14 — VALIDATION */}
        {/* ========================================================================= */}
        <section id="validation" className="scroll-mt-28 py-16 text-left">
          <Eyebrow>📊 HOW WE VALIDATE OJAS</Eyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Benchmarking Adaptive vs Static Plans
          </h2>
          <p className="mt-3 max-w-2xl text-base text-white/65">
            Our validation methodology compares Ojas adaptive recommendations against traditional static fitness plans.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-base font-bold text-white mb-4">Comparison Framework</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="font-bold text-red-400 mb-2">Static Plan</p>
                    <p className="text-white/70">Fixed workout schedule that doesn&apos;t adapt to changing life conditions.</p>
                  </div>
                  <div className="p-4 bg-cyan-400/10 border border-cyan-400/30 rounded-xl">
                    <p className="font-bold text-cyan-300 mb-2">Ojas Adaptive Plan</p>
                    <p className="text-white/70">Continuously adjusts based on user state, constraints, and feedback.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-4">Metrics We Measure</h3>
                <div className="space-y-2 text-xs">
                  {[
                    "Workout completion rate",
                    "Plan feasibility score",
                    "Adaptation success rate",
                    "User satisfaction",
                    "Training consistency over time",
                    "Recovery-aware training adherence",
                  ].map((metric) => (
                    <div key={metric} className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/5">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span className="text-white/80">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-xs text-white/60">
                <strong>Note:</strong> Real pilot data will be populated once user testing is complete. Currently showing methodology framework.
              </p>
            </div>
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
