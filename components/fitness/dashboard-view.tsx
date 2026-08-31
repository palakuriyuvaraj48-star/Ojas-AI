"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { useOjas, useDailyDecision, useRecoveryState, useRiskState } from "@/components/providers/ojas-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { DailyDecisionCard } from "@/components/fitness/daily-decision-card";
import { OjasScoreSummary } from "@/components/fitness/ojas-score-summary";
import { SportJourneyCard } from "@/components/fitness/sport-journey-card";
import { ojasDecisionToLegacy } from "@/lib/ojas-state/compatibility";
import { useTranslation } from "@/lib/i18n";

export function DashboardView() {
  const {
    profile,
    dailyLog,
    logsHistory,
    calorieTargets,
    macroTargets,
    streak,
    logFood,
    logWater,
  } = useFitness();

  const { state: ojasState, decision: ojasDecision, initializeState, emitEvent } = useOjas();
  const recoveryState = useRecoveryState();
  const riskState = useRiskState();

  const { t } = useTranslation();

  const [availableTime, setAvailableTime] = useState<number>(profile?.availableWorkoutTime || 35);
  const [energyState, setEnergyState] = useState<"energetic" | "moderate" | "tired">("energetic");
  const [isHostelMode, setIsHostelMode] = useState<boolean>(profile?.isHostelMode ?? (profile?.lifestyleRole === "college-student"));

  const [foodInput, setFoodInput] = useState({ name: "", cal: "", prot: "", carb: "", fat: "" });
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSuccessAlert, setLogSuccessAlert] = useState<string | null>(null);

  // Initialize Ojas state when profile changes
  useEffect(() => {
    if (profile && !ojasState.lastEvent) {
      initializeState(profile, dailyLog);
    }
  }, [profile, dailyLog, initializeState, ojasState.lastEvent]);

  // Emit events when context changes
  useEffect(() => {
    if (profile && ojasState.lastEvent) {
      emitEvent({
        id: `evt_time_${Date.now()}`,
        type: "TIME_CONSTRAINT_CHANGED",
        timestamp: new Date().toISOString(),
        payload: { minutes: availableTime },
        source: "user_input",
      });
    }
  }, [availableTime]);

  useEffect(() => {
    if (profile && ojasState.lastEvent) {
      emitEvent({
        id: `evt_stress_${Date.now()}`,
        type: "STRESS_CHANGED",
        timestamp: new Date().toISOString(),
        payload: { level: energyState === "tired" ? "high" : energyState === "moderate" ? "medium" : "low" },
        source: "user_input",
      });
    }
  }, [energyState]);

  useEffect(() => {
    if (profile && ojasState.lastEvent) {
      emitEvent({
        id: `evt_hostel_${Date.now()}`,
        type: "PROFILE_UPDATED",
        timestamp: new Date().toISOString(),
        payload: { isHostelMode },
        source: "user_input",
      });
    }
  }, [isHostelMode]);

  if (!profile || !calorieTargets || !macroTargets) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin text-2xl text-[var(--accent)]">🔄</div>
      </div>
    );
  }

  const calRemaining = Math.max(0, calorieTargets.activeTarget - dailyLog.caloriesConsumed);
  const calPercent = Math.min(100, Math.round((dailyLog.caloriesConsumed / calorieTargets.activeTarget) * 100)) || 0;
  const protPercent = Math.min(100, Math.round((dailyLog.proteinConsumed / macroTargets.protein.grams) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((dailyLog.carbsConsumed / macroTargets.carbs.grams) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((dailyLog.fatConsumed / macroTargets.fat.grams) * 100)) || 0;

  // 7-day trend chart data - uses canonical Ojas state
  const weekData = [
    { day: "Mon", score: 78, recovery: 78, protein: 110 },
    { day: "Tue", score: 82, recovery: 82, protein: 125 },
    { day: "Wed", score: 80, recovery: 80, protein: 115 },
    { day: "Thu", score: 89, recovery: 89, protein: 130 },
    { day: "Fri", score: 86, recovery: 86, protein: 120 },
    { day: "Sat", score: 92, recovery: 92, protein: 140 },
    { day: "Sun", score: 88, recovery: ojasState.recovery.recoveryScore, protein: dailyLog.proteinConsumed },
  ];

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

  const handleStartWorkout = () => {
    window.location.href = "/workout";
  };

  const handleQuickWater = () => {
    logWater(0.25);
    setLogSuccessAlert(`+250ml (${t("dashboard_priority_hydration", "Hydration")})`);
    setTimeout(() => setLogSuccessAlert(null), 2500);
  };

  return (
    <div className="space-y-6 text-left">
      {logSuccessAlert && (
        <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {logSuccessAlert}
        </div>
      )}

      {/* Quick Indian Context Modifiers Bar */}
      <GlassCard className="p-4 border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-4">
          {/* Available Time Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#adc6ff]" />
              {t("dashboard_available_time", "Time Available")}:
            </span>
            <div className="flex gap-1">
              {[15, 25, 35, 50].map((tVal) => (
                <button
                  key={tVal}
                  onClick={() => setAvailableTime(tVal)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    availableTime === tVal
                      ? "bg-[#adc6ff] text-[#131315]"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {tVal}m
                </button>
              ))}
            </div>
          </div>

          {/* Energy / Fatigue Status */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/60 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              {t("dashboard_energy_state", "Energy")}:
            </span>
            <div className="flex gap-1">
              {(["energetic", "moderate", "tired"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setEnergyState(m)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                    energyState === m
                      ? "bg-amber-400/30 text-amber-300 border border-amber-400/40"
                      : "bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hostel Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHostelMode(!isHostelMode)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
              isHostelMode
                ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                : "bg-white/5 text-white/60 border-white/10 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            {t("dashboard_hostel_mode", "Hostel Mode")}: {isHostelMode ? "ON" : "OFF"}
          </button>
        </div>
      </GlassCard>

      {/* HERO SECTION 1: OJAS DAILY DECISION */}
      <DailyDecisionCard
        decision={ojasDecisionToLegacy(ojasDecision)}
        onStartPlan={handleStartWorkout}
        onQuickLogWater={handleQuickWater}
        onNavigate={(href) => {
          window.location.href = href;
        }}
      />

      {/* HERO SECTION 2: MY FITNESS & SPORT JOURNEY */}
      <SportJourneyCard />

      {/* HERO SECTION 3: SIMPLIFIED OJAS SCORE SUMMARY */}
      <OjasScoreSummary
        movementScore={92}
        nutritionScore={84}
        recoveryScore={ojasState.recovery.recoveryScore}
        consistencyScore={94}
        onNavigate={(tab) => {
          window.location.href = tab;
        }}
      />

      {/* Daily Progress & Indian Macro Tracker */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Caloric & Macronutrient Balance */}
        <GlassCard className="lg:col-span-2 p-5 space-y-4 border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Apple className="h-4 w-4 text-emerald-400" />
                {t("nav_nutrition", "Nutrition")} (₹{profile.dailyFoodBudget || 100}/day)
              </h3>
              <p className="text-[11px] text-white/50">
                {dailyLog.caloriesConsumed} / {calorieTargets.activeTarget} kcal ({calRemaining} kcal remaining)
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/food?tab=hostel"
                className="flex items-center gap-1 rounded-lg bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-400/25 transition"
              >
                <Building2 className="h-3 w-3" />
                {t("nutrition_mess_menu", "Mess Menu")}
              </Link>
              <Link
                href="/food?tab=budget"
                className="flex items-center gap-1 rounded-lg bg-emerald-400/15 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 text-[11px] font-bold hover:bg-emerald-400/25 transition"
              >
                <DollarSign className="h-3 w-3" />
                {t("nutrition_budget_coach", "Budget Coach")}
              </Link>
              <Button
                size="sm"
                onClick={() => setShowLogModal(true)}
                className="bg-[#adc6ff] hover:bg-white text-[#131315] font-bold text-xs h-7"
              >
                <Plus className="h-3 w-3" /> {t("nutrition_log_meal", "Log Food")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Calories */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/50 block">{t("nutrition_calories", "Calories")}</span>
              <div className="text-base font-bold text-white">{dailyLog.caloriesConsumed}</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${calPercent}%` }} />
              </div>
              <span className="text-[10px] text-white/40 block">Target: {calorieTargets.activeTarget}</span>
            </div>

            {/* Protein */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">{t("nutrition_protein_target", "Protein")}</span>
              <div className="text-base font-bold text-emerald-300">{dailyLog.proteinConsumed}g</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${protPercent}%` }} />
              </div>
              <span className="text-[10px] text-white/40 block">Target: {macroTargets.protein.grams}g</span>
            </div>

            {/* Carbs */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/50 block">{t("nutrition_carbs", "Carbs")}</span>
              <div className="text-base font-bold text-white">{dailyLog.carbsConsumed}g</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${carbPercent}%` }} />
              </div>
              <span className="text-[10px] text-white/40 block">Target: {macroTargets.carbs.grams}g</span>
            </div>

            {/* Fat */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/50 block">{t("nutrition_fats", "Fats")}</span>
              <div className="text-base font-bold text-white">{dailyLog.fatConsumed}g</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${fatPercent}%` }} />
              </div>
              <span className="text-[10px] text-white/40 block">Target: {macroTargets.fat.grams}g</span>
            </div>
          </div>

          {/* Ojas Indian Protein Tip */}
          <div className="rounded-xl bg-black/30 p-3 border border-white/5 flex items-start gap-2.5 text-xs text-white/80">
            <Sparkles className="h-4 w-4 text-[#adc6ff] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">{t("dashboard_decision_engine", "Ojas Pacing Advice")}: </strong>
              {ojasDecision.nutrition?.recommendation || "Log your meals to get personalized nutrition guidance."}
            </div>
          </div>
        </GlassCard>

        {/* Hydration & Recovery Snapshot */}
        <GlassCard className="p-5 space-y-4 border-white/10 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-blue-400" />
              {t("dashboard_priority_hydration", "Hydration")} & {t("dashboard_recovery", "Readiness")}
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/50 block">{t("dashboard_priority_hydration", "Water Intake")}</span>
                <div className="text-lg font-bold text-blue-300">{dailyLog.waterConsumed} L / {macroTargets.water} L</div>
              </div>
              <button
                onClick={handleQuickWater}
                className="rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-bold transition"
              >
                +250ml
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t("recovery_sleep_target", "Sleep Quality")}</span>
                <span className="font-bold text-white">{profile.sleepDuration}h (Optimal)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t("recovery_doms_status", "DOMS / Soreness")}</span>
                <span className="font-bold text-amber-300">Mild</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">{t("dashboard_consistency", "Workout Consistency")}</span>
                <span className="font-bold text-emerald-300">{streak} {t("common_streak", "Day Streak")} 🔥</span>
              </div>
            </div>
          </div>

          <Link
            href="/form-coach"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 p-2.5 text-xs font-bold text-[#adc6ff] border border-white/10 transition"
          >
            <Camera className="h-3.5 w-3.5" />
            {t("form_coach_title", "Launch AI Form Coach")}
          </Link>
        </GlassCard>
      </div>

      {/* Weekly Adaptation Trajectory */}
      <GlassCard className="p-5 space-y-4 border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#adc6ff]" />
              {t("progress_title", "7-Day Adaptive State Trajectory")}
            </h3>
            <p className="text-[11px] text-white/50">Tracking recovery response and daily protein targets</p>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("common_success", "Adaptive sync active")}
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4d8eff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4d8eff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#181a20", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }}
              />
              <Area type="monotone" dataKey="score" stroke="#4d8eff" strokeWidth={2} fillOpacity={1} fill="url(#scoreGrad)" name="Ojas Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Safety & Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-[11px] text-white/50">
        <ShieldCheck className="h-4 w-4 text-[#adc6ff] shrink-0 mt-0.5" />
        <p>
          <strong>Safety & Health Notice:</strong> Ojas is an adaptive AI fitness operating system providing lifestyle and exercise guidance, not medical diagnosis or prescription. If you have an underlying condition, injury, or experience pain, pause immediately and consult a certified healthcare professional.
        </p>
      </div>

      {/* Quick Food Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#181a20] border border-white/15 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{t("nutrition_log_meal", "Log Meal")}</h3>
                <button onClick={() => setShowLogModal(false)} className="text-white/50 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleFoodSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-white/60 block mb-1">Meal Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. 2 Rotis + Dal + Curd"
                    value={foodInput.name}
                    onChange={(e) => setFoodInput({ ...foodInput, name: e.target.value })}
                    className="bg-black/30 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/60 block mb-1">{t("nutrition_calories", "Calories")} (kcal)</label>
                    <Input
                      type="number"
                      required
                      placeholder="350"
                      value={foodInput.cal}
                      onChange={(e) => setFoodInput({ ...foodInput, cal: e.target.value })}
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400 block mb-1">{t("nutrition_protein_target", "Protein")} (g)</label>
                    <Input
                      type="number"
                      required
                      placeholder="18"
                      value={foodInput.prot}
                      onChange={(e) => setFoodInput({ ...foodInput, prot: e.target.value })}
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/60 block mb-1">{t("nutrition_carbs", "Carbs")} (g)</label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={foodInput.carb}
                      onChange={(e) => setFoodInput({ ...foodInput, carb: e.target.value })}
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/60 block mb-1">{t("nutrition_fats", "Fats")} (g)</label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={foodInput.fat}
                      onChange={(e) => setFoodInput({ ...foodInput, fat: e.target.value })}
                      className="bg-black/30 border-white/10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#adc6ff] text-[#131315] font-bold text-xs mt-2">
                  {t("common_save", "Save to Daily Log")}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
