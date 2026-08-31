"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Dumbbell,
  Apple,
  Waves,
  Moon,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Play
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { DailyDecision, OjasDecisionAction } from "@/types/fitness-state";
import { useTranslation } from "@/lib/i18n";

interface DailyDecisionCardProps {
  decision: DailyDecision;
  onStartPlan?: () => void;
  onQuickLogWater?: () => void;
  onNavigate?: (path: string) => void;
}

export function DailyDecisionCard({
  decision,
  onStartPlan,
  onQuickLogWater,
  onNavigate,
}: DailyDecisionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { t } = useTranslation();

  const getActionBadge = (action: OjasDecisionAction) => {
    switch (action) {
      case "TRAIN":
      case "FULL_TRAINING":
        return {
          icon: "🟢",
          label: t("dashboard_train_badge", "TRAIN"),
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
          glow: "from-emerald-500/20 to-teal-500/5",
        };
      case "REDUCE_INTENSITY":
      case "REDUCED_TRAINING":
      case "MINIMUM_TRAINING":
      case "SPORT_PRACTICE":
        return {
          icon: "🟡",
          label: t("dashboard_reduce_badge", "REDUCE INTENSITY"),
          bg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
          glow: "from-amber-500/20 to-yellow-500/5",
        };
      case "RECOVER":
      case "RECOVERY":
      case "REST":
      case "SLEEP_PRIORITY":
        return {
          icon: "🔵",
          label: t("dashboard_recover_badge", "RECOVER"),
          bg: "bg-blue-500/15 border-blue-500/30 text-blue-300",
          glow: "from-blue-500/20 to-indigo-500/5",
        };
      case "MOBILITY":
        return {
          icon: "🟣",
          label: "MOBILITY",
          bg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
          glow: "from-purple-500/20 to-indigo-500/5",
        };
      case "NUTRITION_ACTION":
        return {
          icon: "🍎",
          label: "NUTRITION",
          bg: "bg-orange-500/15 border-orange-500/30 text-orange-300",
          glow: "from-orange-500/20 to-yellow-500/5",
        };
      default:
        return {
          icon: "🟢",
          label: t("dashboard_train_badge", "TRAIN"),
          bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
          glow: "from-emerald-500/20 to-teal-500/5",
        };
    }
  };

  const badge = getActionBadge(decision.action);

  // Handle both string and number confidence formats
  const confidenceDisplay = typeof decision.confidence === "number"
    ? `${decision.confidence}%`
    : decision.confidence;

  return (
    <GlassCard className="relative overflow-hidden p-6 border-white/15 bg-gradient-to-b from-[#181a20] to-[#121316] shadow-2xl" glow>
      {/* Top Ambient Glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${badge.glow} blur-3xl -z-10 opacity-70 pointer-events-none`} />

      {/* Header section: What should I do today? */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#adc6ff] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#adc6ff]" />
              {t("dashboard_decision_engine", "Ojas Decision Engine")}
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/60 font-medium">
              {confidenceDisplay}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t("dashboard_what_to_do_today", "What should I do today?")}
          </h2>
        </div>

        {/* Action Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold ${badge.bg} backdrop-blur-md`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </div>
        </div>
      </div>

      {/* Hero Decision Recommendation */}
      <div className="my-5 rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#adc6ff]/20 text-[#adc6ff] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                {decision.suggestedWorkout.intensity} • {decision.suggestedWorkout.durationMinutes} {t("common_mins", "Mins")}
              </span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Adaptive Time Split
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {decision.headline}
            </h3>
            <p className="text-xs sm:text-sm text-white/70">
              {decision.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <HelpCircle className="h-4 w-4 text-[#adc6ff]" />
              {t("dashboard_why_title", "Why Ojas recommends this")}
              {showExplanation ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={onStartPlan || (() => onNavigate?.("/workout"))}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] px-5 py-2.5 text-xs font-bold text-[#131315] shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Play className="h-4 w-4 fill-current" />
              {t("dashboard_start_plan", "START TODAY'S PLAN")}
            </button>
          </div>
        </div>

        {/* Explainability Accordion: "Why Ojas recommends this" */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-white/10 space-y-3"
            >
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {decision.whyReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-lg bg-black/20 p-2.5 border border-white/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-white/80">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Based On Telemetry bar */}
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5 flex flex-wrap gap-4 text-[11px] text-white/60">
                <span className="font-semibold text-white/90">Based on:</span>
                <span>Recovery: <strong className="text-white">{decision.basedOn.recoveryScore}%</strong></span>
                <span>Sleep: <strong className="text-white">{decision.basedOn.sleepHours}h</strong></span>
                <span>Training Load: <strong className="text-white">{decision.basedOn.trainingLoad}</strong></span>
                <span>Environment: <strong className="text-white">{decision.basedOn.environmentText}</strong></span>
                <span>Goal: <strong className="text-white">{decision.basedOn.primaryGoal}</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Today's 4 Core Priorities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">
            {t("dashboard_what_to_do_today", "Daily Priorities")}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Priority 1: Workout */}
          <div 
            onClick={() => onNavigate?.("/workout")}
            className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:bg-white/[0.05] hover:border-[#adc6ff]/40 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-[#adc6ff] tracking-wider">
                {t("dashboard_priority_workout", "Priority 1: Workout")}
              </span>
              <Dumbbell className="h-4 w-4 text-[#adc6ff]" />
            </div>
            <p className="text-xs font-semibold text-white line-clamp-2">
              {decision.priorities?.find((p) => p.category === "workout")?.description || decision.headline}
            </p>
            <span className="mt-2 text-[10px] text-white/40 flex items-center gap-1 group-hover:text-[#adc6ff] transition">
              {t("common_view_details", "View Details")} <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Priority 2: Nutrition */}
          <div 
            onClick={() => onNavigate?.("/food")}
            className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:bg-white/[0.05] hover:border-emerald-400/40 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                {t("dashboard_priority_nutrition", "Priority 2: Nutrition")}
              </span>
              <Apple className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white line-clamp-2">
              {decision.priorities?.find((p) => p.category === "nutrition")?.description || "Hit target protein and stay on track with calorie budget."}
            </p>
            <span className="mt-2 text-[10px] text-white/40 flex items-center gap-1 group-hover:text-emerald-400 transition">
              {t("common_view_details", "View Details")} <ArrowRight className="h-3 w-3" />
            </span>
          </div>

          {/* Priority 3: Hydration */}
          <div 
            onClick={onQuickLogWater}
            className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:bg-white/[0.05] hover:border-cyan-400/40 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">
                {t("dashboard_priority_hydration", "Priority 3: Hydration")}
              </span>
              <Waves className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="text-xs font-semibold text-white line-clamp-2">
              {decision.priorities?.find((p) => p.category === "hydration")?.description || "Drink 3.5L of water today."}
            </p>
            <span className="mt-2 text-[10px] text-cyan-400/70 font-medium flex items-center gap-1">
              +250ml Quick Log
            </span>
          </div>

          {/* Priority 4: Recovery / Sleep */}
          <div 
            onClick={() => onNavigate?.("/recovery")}
            className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-3.5 hover:bg-white/[0.05] hover:border-indigo-400/40 cursor-pointer transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">
                {t("dashboard_priority_recovery", "Priority 4: Sleep")}
              </span>
              <Moon className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-xs font-semibold text-white line-clamp-2">
              {decision.priorities?.find((p) => p.category === "recovery")?.description || "Aim for 7.5 hours of uninterrupted sleep."}
            </p>
            <span className="mt-2 text-[10px] text-white/40 flex items-center gap-1 group-hover:text-indigo-400 transition">
              {t("common_view_details", "View Details")} <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
