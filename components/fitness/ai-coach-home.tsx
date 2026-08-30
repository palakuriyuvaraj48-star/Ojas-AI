"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { useCoachContext } from "@/lib/coach/storage";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Activity,
  Moon,
  Dumbbell,
  UtensilsCrossed,
  Waves,
  Trophy,
  Flame,
  Award,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  Mic,
  Camera,
  Compass,
  Zap,
} from "lucide-react";

interface AICoachHomeProps {
  setActiveTab: (tab: string) => void;
}

export function AICoachHome({ setActiveTab }: AICoachHomeProps) {
  const { profile, dailyLog, logWater, streak } = useFitness();
  const { ctx, dailyPlan } = useCoachContext();
  const [waterLoggedMessage, setWaterLoggedMessage] = useState(false);
  const [aiHealth, setAiHealth] = useState<{ status: string; model: string; ollama: boolean } | null>(null);
  const [digitalTwinRec, setDigitalTwinRec] = useState<any>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    fetch("/api/ai/health?init=true")
      .then((res) => res.json())
      .then((data) => setAiHealth(data))
      .catch(() => setAiHealth({ status: "unavailable", model: "gemma3:4b", ollama: false }));
  }, []);

  const fetchDigitalTwinRec = async () => {
    if (!profile) return;
    setLoadingRec(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          logs: dailyLog ? [dailyLog] : [],
          recovery: { score: ctx?.recovery?.score ?? 70, fatigue: ctx?.recovery?.fatigue ?? 35 },
          prompt: "Generate today's personalized workout and recovery based on my Digital Twin state.",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDigitalTwinRec(data);
      }
    } catch (e) {
      console.error("[OJAS AI] Error fetching digital twin recommendation:", e);
    } finally {
      setLoadingRec(false);
    }
  };

  if (!profile || !dailyLog || !ctx) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin text-2xl text-[var(--accent)]">🔄</div>
      </div>
    );
  }

  const score = ctx.recovery?.score ?? 70;
  const targetCalories = ctx.calorieTargets?.activeTarget ?? 2000;
  const targetWater = ctx.macroTargets?.water ?? 2.5;
  const targetProtein = ctx.macroTargets?.protein?.grams ?? 120;

  // Handle Quick log water
  const handleQuickWater = () => {
    logWater(0.25);
    setWaterLoggedMessage(true);
    setTimeout(() => setWaterLoggedMessage(false), 2000);
  };

  // Determine personalized advice
  const getGoalLabel = (g: string) => {
    return g.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const advice = {
    workout: {
      title: score >= 65 ? `${getGoalLabel(profile.goal)} Training` : "Mobility & Restoration",
      why: score >= 65 
        ? `Your recovery is at ${score}/100. Muscles are primed for progressive overload, specifically targeting ${profile.gymExperience} volumes.` 
        : `Your recovery is low (${score}/100). High loading today will drive cortisol levels up and delay recovery.`,
      benefit: score >= 65 
        ? "Stimulates muscle protein synthesis and triggers hypertrophy pathways." 
        : "Increases blood flow to sore joints, clearing lactic acid and reducing muscle tension.",
      effort: score >= 65 ? "45–60 mins • High Intensity" : "20–25 mins • Low Intensity",
      confidence: score >= 65 ? 89 : 94,
      alternative: score >= 65 
        ? "30-min HIIT circuit if short on time" 
        : "Full rest + passive hamstring and quad stretches",
      priority: score < 50 ? "critical" : "medium",
    },
    nutrition: {
      title: profile.goal === "fat-loss" ? "Muscle-Preserving Deficit" : "Surplus Protein Loading",
      why: profile.goal === "fat-loss"
        ? `Your goal is ${getGoalLabel(profile.goal)}. A controlled deficit is active, paired with a target of ${targetProtein}g protein to prevent catabolism.`
        : `To drive lean bulk progression, we need a slight caloric surplus (+250 kcal/day) backed by structured amino acid intake.`,
      benefit: profile.goal === "fat-loss"
        ? "Ensures fat loss occurs from adipose tissue rather than skeletal muscle."
        : "Maintains positive nitrogen balance, powering muscle fiber repair.",
      effort: "Easy Prep (30 mins)",
      confidence: 91,
      alternative: "High-protein shake + nuts for a busy day replacement",
      priority: "high",
    },
    recovery: {
      title: score >= 70 ? "Active Performance Maintenance" : "Central Nervous System Recharge",
      why: score >= 70
        ? "Sleep and heart rate variability (HRV) indicate strong nervous system balance. Keep habits stable."
        : `Fatigue index is high (${ctx.recovery?.fatigue ?? 50}/100). Deeper sleep and parasympathetic activation are required.`,
      benefit: score >= 70
        ? "Locks in circadian rhythm, ensuring consistent energy levels."
        : "Lowers heart rate, promotes vascular recovery, and drops systemic stress.",
      effort: "10–15 mins bedtime flow",
      confidence: 88,
      alternative: "15 min deep breathing + magnesium supplement before bed",
      priority: score < 60 ? "high" : "low",
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting */}
      <GlassCard className="p-6 relative overflow-hidden bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-transparent border-white/10">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[#adc6ff] animate-pulse" />
                Hey {profile.name ? profile.name.split(" ")[0] : "Maya"}, {dailyPlan?.greeting || "Coach active"}
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  aiHealth?.ollama && aiHealth?.status === "ready"
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : aiHealth?.status === "model_missing"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    aiHealth?.ollama && aiHealth?.status === "ready"
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-cyan-400"
                  }`}
                />
                {aiHealth?.ollama && aiHealth?.status === "ready"
                  ? `Ollama: ${aiHealth.model}`
                  : "Ojas Intelligence Engine"}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1 max-w-xl">
              {dailyPlan?.motivation || "Consistency is the root of progress. Let's make today count."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 bg-white/5 border border-white/5 rounded-2xl px-4 py-2">
            <Flame className="h-5 w-5 text-orange-400 fill-orange-400" />
            <div>
              <p className="text-xs text-white/50 leading-none">Consistency Streak</p>
              <p className="text-sm font-bold text-white mt-1">{streak} days active</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Main Grid Layout */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        {/* Left Column: Metrics Summary & Personalized suggestions */}
        <div className="space-y-6">
          {/* Today's Summary */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[#adc6ff]" /> Today's Biometric Log Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Calories Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Calorie Budget</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {dailyLog.caloriesConsumed} <span className="text-[11px] font-normal text-white/50">/ {targetCalories} kcal</span>
                </span>
                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-[var(--accent)] h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (dailyLog.caloriesConsumed / targetCalories) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Recovery Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Recovery Score</span>
                <span className="text-lg font-black text-white mt-1 block flex items-center gap-2">
                  {score}%
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    score >= 70 ? "bg-emerald-500/10 text-emerald-400" : score >= 50 ? "bg-yellow-500/10 text-yellow-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {ctx.recovery?.readiness || "Fresh"}
                  </span>
                </span>
                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${score >= 70 ? "bg-emerald-400" : score >= 50 ? "bg-yellow-400" : "bg-rose-400"}`} 
                    style={{ width: `${score}%` }} 
                  />
                </div>
              </div>

              {/* Water Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Hydration Log</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {dailyLog.waterConsumed.toFixed(1)} <span className="text-[11px] font-normal text-white/50">/ {targetWater}L</span>
                </span>
                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(100, (dailyLog.waterConsumed / targetWater) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Steps Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Daily Steps</span>
                <span className="text-lg font-black text-white mt-1 block">
                  {dailyLog.stepsCount.toLocaleString()} <span className="text-[11px] font-normal text-white/50">/ {profile.dailyStepGoal.toLocaleString()}</span>
                </span>
              </div>

              {/* Sleep Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Sleep Duration</span>
                <span className="text-lg font-black text-white mt-1 block flex items-center gap-1.5">
                  {profile.sleepDuration} hrs
                  <Moon className="h-3.5 w-3.5 text-indigo-300" />
                </span>
              </div>

              {/* Workout Completed Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-white/40 block font-semibold uppercase">Workout Status</span>
                <span className={`text-sm font-extrabold mt-2 block ${dailyLog.workoutCompleted ? "text-emerald-400" : "text-amber-400"}`}>
                  {dailyLog.workoutCompleted ? "✅ Completed Today" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* AI Suggestions Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Compass className="h-4.5 w-4.5 text-[#adc6ff]" /> AI Suggestions & Explanations
              </h3>
              <button
                onClick={fetchDigitalTwinRec}
                disabled={loadingRec}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition disabled:opacity-50 shadow-sm"
              >
                <Sparkles className={`h-3.5 w-3.5 ${loadingRec ? "animate-spin" : ""}`} />
                {loadingRec ? "Reasoning with Gemma 3..." : "Personalize via Digital Twin"}
              </button>
            </div>

            {/* Live Digital Twin AI Recommendation Card (Gemma 3 4B) */}
            {digitalTwinRec && digitalTwinRec.recommendation && (
              <GlassCard className="p-5 border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-cyan-950/20 relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Gemma 3 4B · Live Digital Twin Adaptation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                      Personalized from your Digital Twin
                    </span>
                    {digitalTwinRec.knowledge_used && (
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        Fitness Knowledge Applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Adaptation State Pill */}
                {digitalTwinRec.adaptation && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                      State: {digitalTwinRec.adaptation.state}
                    </span>
                    {digitalTwinRec.adaptation.changes_from_normal_plan?.map((change: string, idx: number) => (
                      <span key={idx} className="bg-white/5 text-white/70 px-2 py-0.5 rounded">
                        • {change}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 grid gap-4 sm:grid-cols-3 text-xs">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold uppercase text-cyan-300">Adapted Workout</p>
                    <p className="font-bold text-white mt-1 text-sm">{digitalTwinRec.recommendation.workout}</p>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      {digitalTwinRec.recommendation.duration_minutes} min · {digitalTwinRec.recommendation.intensity}
                    </p>
                    {digitalTwinRec.recommendation.exercises && digitalTwinRec.recommendation.exercises.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                        <p className="text-[9px] font-bold uppercase text-white/40">Exercise Sequence</p>
                        {digitalTwinRec.recommendation.exercises.slice(0, 3).map((ex: string, i: number) => (
                          <p key={i} className="text-[10px] text-white/70 truncate">• {ex}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold uppercase text-purple-300">Nutrition Focus</p>
                    <p className="text-white/80 text-[11px] mt-1 leading-relaxed">
                      {digitalTwinRec.recommendation.nutrition}
                    </p>
                    {digitalTwinRec.recommendation.hydration && (
                      <p className="text-[10px] text-cyan-300/80 mt-2">
                        💧 {digitalTwinRec.recommendation.hydration}
                      </p>
                    )}
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold uppercase text-emerald-300">Recovery Action</p>
                    <p className="text-white/80 text-[11px] mt-1 leading-relaxed">
                      {digitalTwinRec.recommendation.recovery}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-cyan-400/5 border border-cyan-400/15 p-3 text-xs text-white/80">
                  <p className="text-[10px] font-bold uppercase text-cyan-300 mb-1">Why Ojas chose this plan:</p>
                  <p className="italic text-white/70">“{digitalTwinRec.recommendation.reason}”</p>
                </div>
              </GlassCard>
            )}

            {/* Advice Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Workout Advice */}
              <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)] relative">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" /> Training
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      advice.workout.priority === "critical" ? "bg-rose-500/20 text-rose-300" : "bg-white/10 text-white/60"
                    }`}>
                      {advice.workout.priority} priority
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{advice.workout.title}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">{advice.workout.why}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-[10px] text-white/40">
                  <p><strong className="text-white/60 font-semibold">Expected Benefit:</strong> {advice.workout.benefit}</p>
                  <p><strong className="text-white/60 font-semibold">Estimated Effort:</strong> {advice.workout.effort}</p>
                  <p className="flex items-center gap-1.5">
                    <strong className="text-white/60 font-semibold">Confidence:</strong> 
                    <span className="text-[#adc6ff] font-bold">{advice.workout.confidence}%</span>
                  </p>
                  <p><strong className="text-white/60 font-semibold">Alternative:</strong> {advice.workout.alternative}</p>
                </div>
              </GlassCard>

              {/* Nutrition Advice */}
              <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                      <UtensilsCrossed className="h-3 w-3" /> Nutrition
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-white/10 text-white/60 rounded">
                      {advice.nutrition.priority} priority
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{advice.nutrition.title}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">{advice.nutrition.why}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-[10px] text-white/40">
                  <p><strong className="text-white/60 font-semibold">Expected Benefit:</strong> {advice.nutrition.benefit}</p>
                  <p><strong className="text-white/60 font-semibold">Estimated Effort:</strong> {advice.nutrition.effort}</p>
                  <p className="flex items-center gap-1.5">
                    <strong className="text-white/60 font-semibold">Confidence:</strong> 
                    <span className="text-[#adc6ff] font-bold">{advice.nutrition.confidence}%</span>
                  </p>
                  <p><strong className="text-white/60 font-semibold">Alternative:</strong> {advice.nutrition.alternative}</p>
                </div>
              </GlassCard>

              {/* Recovery Advice */}
              <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                      <HeartPulse className="h-3 w-3" /> Recovery
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-white/10 text-white/60 rounded">
                      {advice.recovery.priority} priority
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{advice.recovery.title}</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">{advice.recovery.why}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-[10px] text-white/40">
                  <p><strong className="text-white/60 font-semibold">Expected Benefit:</strong> {advice.recovery.benefit}</p>
                  <p><strong className="text-white/60 font-semibold">Estimated Effort:</strong> {advice.recovery.effort}</p>
                  <p className="flex items-center gap-1.5">
                    <strong className="text-white/60 font-semibold">Confidence:</strong> 
                    <span className="text-[#adc6ff] font-bold">{advice.recovery.confidence}%</span>
                  </p>
                  <p><strong className="text-white/60 font-semibold">Alternative:</strong> {advice.recovery.alternative}</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions, Goals & Motivation */}
        <div className="space-y-6">
          {/* Quick Actions Console */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-white text-sm">Coach Quick Actions</h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              {/* Workout */}
              <button 
                onClick={() => window.location.href = "/workouts"}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group"
              >
                <div className="h-9 w-9 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <Dumbbell className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Start Workout</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Open training hub</p>
                </div>
              </button>

              {/* Log Meal */}
              <button 
                onClick={() => window.location.href = "/nutrition?tab=scanner"}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group"
              >
                <div className="h-9 w-9 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <UtensilsCrossed className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Log Food</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Scan or enter macros</p>
                </div>
              </button>

              {/* Log Recovery */}
              <button 
                onClick={() => window.location.href = "/recovery"}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group"
              >
                <div className="h-9 w-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <HeartPulse className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Recovery Log</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Check Readiness Score</p>
                </div>
              </button>

              {/* Log Water */}
              <button 
                onClick={handleQuickWater}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group relative overflow-hidden"
              >
                <div className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <Waves className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Log Water</p>
                  <p className="text-[9px] text-white/40 mt-0.5">+250ml quick add</p>
                </div>
                {waterLoggedMessage && (
                  <div className="absolute inset-0 bg-blue-600/90 text-white flex items-center justify-center text-[10px] font-black animate-fade-in">
                    🥤 Water Logged!
                  </div>
                )}
              </button>

              {/* Voice Chat */}
              <button 
                onClick={() => setActiveTab("voice")}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group"
              >
                <div className="h-9 w-9 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <Mic className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Voice Assistant</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Hands-free advice</p>
                </div>
              </button>

              {/* Camera Scan */}
              <button 
                onClick={() => window.location.href = "/form-coach"}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-left text-xs font-semibold text-white transition group"
              >
                <div className="h-9 w-9 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition">
                  <Camera className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-bold">Form Coach</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Scan lifting postures</p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setActiveTab("chat")}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] hover:brightness-110 text-[#131315] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15"
            >
              Open AI Chat Coach <ArrowRight className="h-4 w-4" />
            </button>
          </GlassCard>

          {/* Goal Strategy Panel */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-yellow-400" /> Goal Milestones
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/50">Primary Objective</span>
                <span className="font-extrabold text-[#adc6ff]">{getGoalLabel(profile.goal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Target Weight Goal</span>
                <span className="font-bold text-white">{profile.targetWeight ? `${profile.targetWeight} kg` : "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Target Timeline</span>
                <span className="font-bold text-white">{profile.timelineWeeks ? `${profile.timelineWeeks} weeks` : "—"}</span>
              </div>
              
              <div className="border-t border-white/5 pt-3 flex gap-3 text-[10.5px] leading-relaxed text-white/50">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <p>
                  {profile.goal === "fat-loss" && "Preserving lean mass (LBM) is critical. Keep protein high and log your check-ins weekly."}
                  {profile.goal === "muscle-gain" && "Hypertrophy requires high volume progressive overload. Keep caloric targets topped up."}
                  {profile.goal === "lean-bulk" && "Fuel with complex carbohydrates post-workout to maximize skeletal glycogen resynthesis."}
                  {profile.goal === "maintenance" && "Focus on active recovery and metabolic restoration before the next block."}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
