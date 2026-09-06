"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { useOjas, useRecoveryState, useRiskState } from "@/components/providers/ojas-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Apple,
  Plus,
  Camera,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  Waves,
  AlertTriangle,
  HeartPulse,
  Activity,
  Flame,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  Play
} from "lucide-react";
import Link from "next/link";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import { DecisionLogicDiagram } from "@/components/fitness/decision-logic-diagram";
import { OjasScoreSummary } from "@/components/fitness/ojas-score-summary";
import { SportJourneyCard } from "@/components/fitness/sport-journey-card";
import { useTranslation } from "@/lib/i18n";

export function DashboardView() {
  const {
    profile,
    dailyLog,
    calorieTargets,
    macroTargets,
    logFood,
    logWater,
  } = useFitness();

  const { state: ojasState, initializeState, emitEvent } = useOjas();
  const recoveryState = useRecoveryState();
  const riskState = useRiskState();
  const { t } = useTranslation();

  // Integrated live dashboard state & adaptive decision engine
  const {
    state: dashState,
    updateState: updateDashState,
    recommendation,
    simulateExamPeriod,
    simulateOptimalCondition,
    simulateHostelSprint,
  } = useDashboardState({
    availableTime: profile?.availableWorkoutTime || 35,
    hostelMode: profile?.isHostelMode ?? (profile?.lifestyleRole === "college-student"),
  });

  const [showReasoning, setShowReasoning] = useState(false);
  const [foodInput, setFoodInput] = useState({ name: "", cal: "", prot: "", carb: "", fat: "" });
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSuccessAlert, setLogSuccessAlert] = useState<string | null>(null);

  // Initialize canonical Ojas state
  useEffect(() => {
    if (profile && !ojasState.lastEvent) {
      initializeState(profile, dailyLog);
    }
  }, [profile, dailyLog, initializeState, ojasState.lastEvent]);

  // Synchronize events with Ojas state whenever user modifies inputs
  const handleTimeSelect = (minutes: number) => {
    updateDashState({ availableTime: minutes, isExamPeriod: false });
    if (ojasState.lastEvent) {
      emitEvent({
        id: `evt_time_${Date.now()}`,
        type: "TIME_CONSTRAINT_CHANGED",
        timestamp: new Date().toISOString(),
        payload: { minutes },
        source: "user_input",
      });
    }
  };

  const handleEnergySelect = (energy: "energetic" | "moderate" | "tired") => {
    updateDashState({ energyLevel: energy });
    if (ojasState.lastEvent) {
      emitEvent({
        id: `evt_stress_${Date.now()}`,
        type: "STRESS_CHANGED",
        timestamp: new Date().toISOString(),
        payload: { level: energy === "tired" ? "high" : energy === "moderate" ? "medium" : "low" },
        source: "user_input",
      });
    }
  };

  const handleStressSelect = (stress: "low" | "medium" | "high") => {
    updateDashState({ stressLevel: stress });
  };

  const handleHostelToggle = () => {
    const next = !dashState.hostelMode;
    updateDashState({ hostelMode: next });
    if (ojasState.lastEvent) {
      emitEvent({
        id: `evt_hostel_${Date.now()}`,
        type: "PROFILE_UPDATED",
        timestamp: new Date().toISOString(),
        payload: { isHostelMode: next },
        source: "user_input",
      });
    }
  };

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(foodInput.cal) || 0;
    const p = parseInt(foodInput.prot) || 0;
    const carb = parseInt(foodInput.carb) || 0;
    const f = parseInt(foodInput.fat) || 0;
    logFood(c, p, carb, f);
    setLogSuccessAlert(`${t("common_success", "Logged")} ${foodInput.name || "Meal"} (${p}g protein, ${c} kcal)`);
    setFoodInput({ name: "", cal: "", prot: "", carb: "", fat: "" });
    setShowLogModal(false);
    setTimeout(() => setLogSuccessAlert(null), 3000);
  };

  const handleQuickWater = () => {
    logWater(0.25);
    setLogSuccessAlert(`+250ml (${t("dashboard_priority_hydration", "Hydration")})`);
    setTimeout(() => setLogSuccessAlert(null), 2500);
  };

  const intensityBadgeColor = {
    low: "bg-blue-500/15 border-blue-500/30 text-blue-300",
    moderate: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    high: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  }[recommendation.intensity];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {logSuccessAlert && (
        <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {logSuccessAlert}
        </div>
      )}

      {/* QUICK INDIAN CONTEXT & REAL-TIME CONTROLS BAR */}
      <GlassCard className="p-4 sm:p-5 border-white/10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-gradient-to-r from-[#181a20] to-[#121316]">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Available Time Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#adc6ff]" />
              {t("dashboard_available_time", "Time")}:
            </span>
            <div className="flex gap-1">
              {[15, 25, 35, 50].map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => handleTimeSelect(tVal)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                    dashState.availableTime === tVal
                      ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-blue-500/20 scale-105"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {tVal}m
                </button>
              ))}
            </div>
          </div>

          {/* Energy Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              {t("dashboard_energy_state", "Energy")}:
            </span>
            <div className="flex gap-1">
              {(["energetic", "moderate", "tired"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => handleEnergySelect(m)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold capitalize transition ${
                    dashState.energyLevel === m
                      ? "bg-amber-400/30 text-amber-300 border border-amber-400/40 shadow-sm"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Stress Level */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-rose-400" />
              Stress:
            </span>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStressSelect(s)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold capitalize transition ${
                    dashState.stressLevel === s
                      ? "bg-rose-400/30 text-rose-300 border border-rose-400/40"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Hostel Mode Toggle */}
          <button
            onClick={handleHostelToggle}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
              dashState.hostelMode
                ? "bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm"
                : "bg-white/5 text-white/60 border-white/10 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {t("dashboard_hostel_mode", "Hostel Mode")}: {dashState.hostelMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* SIMULATION PRESETS */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto pt-2 xl:pt-0 border-t xl:border-t-0 border-white/10">
          <button
            onClick={simulateExamPeriod}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
              dashState.isExamPeriod
                ? "bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-md shadow-purple-500/20"
                : "bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Simulate Exam Period
          </button>

          <button
            onClick={simulateOptimalCondition}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 transition"
          >
            <Flame className="h-3.5 w-3.5" />
            Optimal Overload
          </button>
        </div>
      </GlassCard>

      {/* HERO SECTION: REAL-TIME WHAT SHOULD I DO TODAY CARD */}
      <GlassCard className="relative overflow-hidden p-6 border-white/15 bg-gradient-to-b from-[#181a20] to-[#121316] shadow-2xl" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#adc6ff] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#adc6ff]" />
                Adaptive Decision Engine
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/60 font-medium">
                {recommendation.confidence}% Confidence
              </span>
              {dashState.isExamPeriod && (
                <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[9px] font-bold">
                  Exam Period Active
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t("dashboard_what_to_do_today", "What should I do today?")}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold ${intensityBadgeColor} backdrop-blur-md`}>
              <span>{recommendation.intensity.toUpperCase()} INTENSITY</span>
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Output */}
        <motion.div
          key={`${recommendation.title}-${recommendation.duration}-${dashState.recovery}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="my-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#adc6ff]/20 text-[#adc6ff] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  {recommendation.duration} Mins Split
                </span>
                <span className="text-white/40 text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recommendation.adaptationFactor}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {recommendation.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/70">
                <strong>Focus:</strong> {recommendation.focus}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/workout"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] px-5 py-3 text-xs font-extrabold text-[#131315] shadow-lg shadow-blue-500/20 hover:scale-105 transition"
              >
                <Play className="h-4 w-4 fill-current" />
                START TODAY&apos;S PLAN
              </Link>
            </div>
          </div>

          {/* Planned Exercises Split */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-3 border-t border-white/10">
            {recommendation.exercises.map((ex, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-white">
                  <span className="truncate">{ex.name}</span>
                  <span className="text-[#adc6ff] shrink-0 ml-1">{ex.sets} sets</span>
                </div>
                <div className="text-[10px] text-white/60">{ex.reps}</div>
                <div className="text-[9px] text-white/40 truncate">{ex.notes}</div>
              </div>
            ))}
          </div>

          {/* Reasoning Accordion */}
          <div
            onClick={() => setShowReasoning(!showReasoning)}
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 cursor-pointer transition space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#adc6ff]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Why this recommendation?
              </span>
              {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            {showReasoning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs text-white/80 leading-relaxed pt-1"
              >
                {recommendation.reasoning}
              </motion.div>
            )}
          </div>

          {/* Alternatives */}
          {recommendation.alternatives.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-bold text-white/40">Alternatives:</span>
              {recommendation.alternatives.map((alt, i) => (
                <span key={i} className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] text-white/70">
                  {alt}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* COMPOSITE STATUS GAUGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50 block">Sleep Duration</span>
            <div className={`text-lg sm:text-xl font-extrabold ${dashState.sleepDuration >= 7 ? "text-emerald-400" : "text-amber-400"}`}>
              {dashState.sleepDuration.toFixed(1)}h
            </div>
            <span className="text-[10px] text-white/40">{dashState.sleepDuration >= 7 ? "Optimal" : "Restricted"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50 block">Recovery Score</span>
            <div className={`text-lg sm:text-xl font-extrabold ${dashState.recovery >= 75 ? "text-emerald-400" : dashState.recovery >= 50 ? "text-amber-400" : "text-rose-400"}`}>
              {dashState.recovery}/100
            </div>
            <span className="text-[10px] text-white/40">{dashState.recovery >= 75 ? "Fresh" : dashState.recovery >= 50 ? "Moderate" : "Overreaching"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50 block">Available Time</span>
            <div className="text-lg sm:text-xl font-extrabold text-[#adc6ff]">
              {dashState.availableTime}m
            </div>
            <span className="text-[10px] text-white/40">Adaptive Split</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-white/50 block">Energy Level</span>
            <div className={`text-lg sm:text-xl font-extrabold capitalize ${dashState.energyLevel === "energetic" ? "text-emerald-400" : dashState.energyLevel === "moderate" ? "text-amber-400" : "text-rose-400"}`}>
              {dashState.energyLevel}
            </div>
            <span className="text-[10px] text-white/40">Auto-Regulated</span>
          </div>
        </div>
      </GlassCard>

      {/* DECISION LOGIC DIAGRAM VISUALIZATION */}
      <DecisionLogicDiagram />

      {/* SPORT & FITNESS JOURNEY */}
      <SportJourneyCard />

      {/* OJAS SCORE SUMMARY */}
      <OjasScoreSummary
        movementScore={92}
        nutritionScore={84}
        recoveryScore={dashState.recovery}
        consistencyScore={94}
        onNavigate={(tab) => {
          window.location.href = tab;
        }}
      />
    </div>
  );
}
