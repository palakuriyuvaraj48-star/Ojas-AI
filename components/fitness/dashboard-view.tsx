"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, HeartPulse, Waves, Compass, Award, Apple, BellRing, CalendarDays, 
  Sparkles, CheckCircle2, CloudRain, Calendar, Smile, Zap, Crown, Trophy, 
  ArrowRight, MessageSquare, Plus, RefreshCw, Volume2, Mic, Camera, Scan, 
  MapPin, Dumbbell, Shield, HelpCircle, Heart, Moon, Play, ToggleLeft, AlertTriangle, ShoppingCart
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";

export function DashboardView() {
  const {
    profile,
    dailyLog,
    calorieTargets,
    macroTargets,
    streak,
    logFood,
    logWater,
    logSteps,
  } = useFitness();

  const [foodInput, setFoodInput] = useState({ cal: "", prot: "", carb: "", fat: "" });
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAltWorkout, setShowAltWorkout] = useState(false);
  const [showVoiceListening, setShowVoiceListening] = useState(false);

  // Feature 1 & 10 States
  const [availableTime, setAvailableTime] = useState<number>(45);
  const [moodState, setMoodState] = useState<string>("energetic");

  // AI Backend Engine Fetch States
  const [aiData, setAiData] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);

  // Floating AI Assistant States
  const [chatOpen, setChatOpen] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState<string>("");
  const [assistantReply, setAssistantReply] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  // Fetch from the AI Dashboard Engine API
  useEffect(() => {
    let active = true;
    setIsAiLoading(true);
    fetch(`/api/dashboard?availableTime=${availableTime}&mood=${moodState}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setAiData(data);
          setIsAiLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard AI data", err);
        if (active) {
          setIsAiLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [availableTime, moodState]);

  if (!profile || !calorieTargets || !macroTargets) return null;

  const calRemaining = calorieTargets.activeTarget - dailyLog.caloriesConsumed;
  const calPercent = Math.min(100, Math.round((dailyLog.caloriesConsumed / calorieTargets.activeTarget) * 100)) || 0;
  
  const protPercent = Math.min(100, Math.round((dailyLog.proteinConsumed / macroTargets.protein.grams) * 100)) || 0;
  const carbPercent = Math.min(100, Math.round((dailyLog.carbsConsumed / macroTargets.carbs.grams) * 100)) || 0;
  const fatPercent = Math.min(100, Math.round((dailyLog.fatConsumed / macroTargets.fat.grams) * 100)) || 0;
  const waterPercent = Math.min(100, Math.round((dailyLog.waterConsumed / macroTargets.water) * 100)) || 0;
  const stepsPercent = Math.min(100, Math.round((dailyLog.stepsCount / profile.dailyStepGoal) * 100)) || 0;

  // Chart Data
  const weekData = [
    { day: "Mon", score: 72, calories: 2140, recovery: 78, sleep: 7.2 },
    { day: "Tue", score: 81, calories: 2260, recovery: 82, sleep: 7.8 },
    { day: "Wed", score: 76, calories: 2050, recovery: 80, sleep: 7.5 },
    { day: "Thu", score: 88, calories: 2310, recovery: 89, sleep: 8.0 },
    { day: "Fri", score: 84, calories: 2200, recovery: 86, sleep: 7.9 },
    { day: "Sat", score: 91, calories: 2440, recovery: 92, sleep: 8.3 },
    { day: "Sun", score: 86, calories: 2180, recovery: 90, sleep: 7.6 }
  ];

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(foodInput.cal) || 0;
    const p = parseInt(foodInput.prot) || 0;
    const carb = parseInt(foodInput.carb) || 0;
    const f = parseInt(foodInput.fat) || 0;
    logFood(c, p, carb, f);
    setFoodInput({ cal: "", prot: "", carb: "", fat: "" });
    setShowLogModal(false);
  };

  const quickLogFood = (c: number, p: number, carb: number, f: number) => {
    logFood(c, p, carb, f);
  };

  const handleStartWorkout = () => {
    alert(`🚀 Initializing workout session: ${aiData?.workout?.title || "Hypertrophy Upper Body Pull"}`);
  };

  const handleAssistantAsk = async (question: string) => {
    setAssistantMessage(question);
    setIsTyping(true);
    setAssistantReply("");
    
    // Simulate AI thinking and reply
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsTyping(false);
    if (question.includes("tired")) {
      setAssistantReply("🧘‍♂️ I've detected high physical fatigue markers. I recommend reducing today's workload to 60% of your 1RM, focusing on lat stretch range, or swapping to our deep mobility routine.");
    } else if (question.includes("eat")) {
      setAssistantReply("🥗 Since your protein target is 165g and you have logged 45g so far, I recommend a high-protein post-workout Salmon bowl (44g protein) or Greek yogurt with a scoop of whey.");
    } else if (question.includes("minutes")) {
      setAssistantReply("⚡ Time compression active! Let's switch to our HIIT Full Body Shock Split (20m duration, high-intensity intervals) which fits your window and maintains stimulus.");
    } else if (question.includes("hurts")) {
      setAssistantReply("⚠️ Lower back tension noticed. Avoid heavy compressive forces like deadlifts or squats. Let's prioritize hip hinge mobility and core stabilization exercises.");
    } else {
      setAssistantReply("💪 Consistency creates compound physiological results. Focus on deep breathing and core bracing during today's routine.");
    }
  };

  // Section Skeletons
  const renderSkeletons = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <GlassCard key={i} className="animate-pulse space-y-4 p-5 min-h-[180px] flex flex-col justify-between border-[var(--border-subtle)]">
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-1/4"></div>
            <div className="h-6 bg-white/10 rounded w-1/2"></div>
          </div>
          <div className="h-3 bg-white/10 rounded w-full border-t border-white/5 pt-2"></div>
          <div className="h-8 bg-white/10 rounded w-full mt-2"></div>
        </GlassCard>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 relative pb-12">
      {/* SECTION 1: Daily AI Brief Hero Card */}
      <GlassCard className="p-6 md:p-8 border-[var(--border-subtle)] relative overflow-hidden group text-left" glow>
        <div className="absolute top-0 right-0 h-40 w-40 bg-[var(--accent)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent)]/10 transition duration-700" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--accent)] animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">AI Coach Brief</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Good Morning, {profile.name || "Yuvaraj"}.
            </h1>
            
            {isAiLoading ? (
              <div className="space-y-2 py-2">
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-[var(--foreground-muted)] leading-relaxed">
                <p>
                  💤 {aiData?.dailySummary?.sleepSummary} | 📈 Recovery: <span className="text-emerald-400 font-bold">{aiData?.dailySummary?.recoverySummary}</span>
                </p>
                <p>
                  📅 Available workout window: <span className="text-white font-semibold">{aiData?.dailySummary?.timeSummary}</span>
                </p>
                <p className="text-white font-medium border-l-2 border-[var(--accent)] pl-3 mt-3 bg-white/5 py-2 rounded-r-xl">
                  👉 Recommended Routine: <span className="text-[var(--accent)] font-bold">{aiData?.workout?.title}</span>
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col justify-between bg-black/25 border border-white/5 rounded-2xl p-5 md:w-64">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-white/50 uppercase">Coach Confidence</span>
              <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-glow)] px-2 py-0.5 rounded">
                {aiData?.dailySummary?.aiConfidence}%
              </span>
            </div>
            <p className="text-[10px] text-white/70 leading-normal mb-2">
              <strong>Reason:</strong> {aiData?.dailySummary?.reasoning}
            </p>
            <p className="text-[9px] text-[var(--foreground-muted)] border-t border-white/5 pt-2">
              <strong>Benefit:</strong> {aiData?.dailySummary?.benefits}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Primary Grid Layout */}
      {isAiLoading ? renderSkeletons() : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* SECTION 2: Energy Score Widget */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Energy Level</span>
                <h4 className="text-3xl font-black text-white mt-1">
                  {aiData?.energyScore?.score}
                  <span className="text-xs text-[var(--foreground-muted)] font-normal">/100</span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-400">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${aiData?.energyScore?.score}%` }} 
                />
              </div>
              <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">
                <strong>Factors:</strong> Sleep (+15), Recovery (+20), Nutrition (+10), Hydration (+5). 
                {aiData?.energyScore?.explanation}
              </p>
              <span className="text-[9px] text-yellow-400 font-bold block mt-1">
                ⚡ Rec: {aiData?.energyScore?.recommendation} (Trend: {aiData?.energyScore?.trend})
              </span>
            </div>
          </GlassCard>

          {/* SECTION 3: Recovery Score Card */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Recovery Strain</span>
                <h4 className="text-3xl font-black text-white mt-1">
                  {aiData?.recoveryScore?.score}%
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black ml-2 uppercase">
                    {aiData?.recoveryScore?.readiness}
                  </span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <HeartPulse className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 mt-3 text-[10px] text-[var(--foreground-muted)]">
              <div className="grid grid-cols-2 gap-2 border-b border-white/5 pb-2">
                <div>Muscle Fatigue: <span className="text-white font-bold">{aiData?.recoveryScore?.fatigue}</span></div>
                <div>HRV: <span className="text-white font-bold">{aiData?.recoveryScore?.hrv}</span></div>
              </div>
              <p className="leading-normal">
                Sleep quality reached {aiData?.recoveryScore?.sleepQuality}. Nervous system balance indicates premium muscle building window.
              </p>
              <span className="text-[9px] text-emerald-400 font-bold block">
                🎯 Optimal training load: {aiData?.recoveryScore?.intensityRecommended}
              </span>
            </div>
          </GlassCard>

          {/* SECTION 4: Today's Workout Details */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent)]/10 transition duration-500" />
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Today's Workout</span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {showAltWorkout ? aiData?.workout?.alternative : aiData?.workout?.title}
                  </h4>
                </div>
                <div className="p-2 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
                  <Dumbbell className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="flex gap-4 text-[10px] text-white/80">
                <span>⏱️ {aiData?.workout?.duration} mins</span>
                <span>🔥 {aiData?.workout?.calories} kcal</span>
                <span>💪 {aiData?.workout?.difficulty}</span>
              </div>

              <div className="text-[10px] space-y-1">
                <p className="text-[var(--foreground-muted)] truncate">
                  <strong>Equipment:</strong> {aiData?.workout?.equipment?.join(", ")}
                </p>
                <p className="text-[var(--foreground-muted)] truncate">
                  <strong>Muscles:</strong> {aiData?.workout?.targetMuscles?.join(", ")}
                </p>
                <p className="text-[9px] text-[var(--accent)] italic">
                  <strong>AI Vikram Note:</strong> {aiData?.workout?.explanation}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleStartWorkout} variant="premium" className="flex-1 text-xs py-2 gap-1.5 justify-center">
                <Play className="h-3.5 w-3.5 fill-current" /> Start Routine
              </Button>
              <button 
                onClick={() => setShowAltWorkout(!showAltWorkout)}
                className="px-3 rounded-xl border border-white/10 hover:bg-white/5 text-[10px] font-bold text-[var(--foreground-muted)] hover:text-white transition shrink-0"
              >
                {showAltWorkout ? "Show Base" : "Alt Split"}
              </button>
            </div>
          </GlassCard>

          {/* SECTION 5: Nutrition Card */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Nutrition Targets</span>
                <h4 className="text-xl font-bold text-white mt-1">
                  {dailyLog.caloriesConsumed} <span className="text-xs text-[var(--foreground-muted)] font-normal">/ {calorieTargets.activeTarget} kcal</span>
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Apple className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 mt-3 text-[10px]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-lg p-1.5">
                  <span className="text-white/40 block text-[9px] uppercase">Protein</span>
                  <span className="font-bold text-white">{dailyLog.proteinConsumed}g/{macroTargets.protein.grams}g</span>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <span className="text-white/40 block text-[9px] uppercase">Carbs</span>
                  <span className="font-bold text-white">{dailyLog.carbsConsumed}g/{macroTargets.carbs.grams}g</span>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <span className="text-white/40 block text-[9px] uppercase">Fat</span>
                  <span className="font-bold text-white">{dailyLog.fatConsumed}g/{macroTargets.fat.grams}g</span>
                </div>
              </div>
              <div className="border-t border-white/5 pt-2 text-[9px] text-[var(--foreground-muted)] leading-tight">
                <p className="text-white font-medium flex items-center gap-1">🍽️ Suggested: {aiData?.nutrition?.mealSuggestions?.[0]?.text}</p>
                <p className="mt-1 text-emerald-400 flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> Grocery: {aiData?.nutrition?.shoppingReminder}</p>
              </div>
            </div>
          </GlassCard>

          {/* SECTION 6: Sleep Analytics */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Circadian Sleep</span>
                <h4 className="text-2xl font-black text-white mt-1">{aiData?.sleep?.duration}</h4>
              </div>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Moon className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 mt-3 text-[10px] text-[var(--foreground-muted)]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Quality: <strong className="text-white">{aiData?.sleep?.quality}</strong></span>
                <span>Debt: <strong className="text-rose-400">{aiData?.sleep?.sleepDebt}</strong></span>
              </div>
              <p className="leading-relaxed">
                Weekly sleep consistency is {aiData?.sleep?.weeklyTrend}. 
              </p>
              <span className="text-[9px] text-indigo-400 block font-semibold">
                💤 Rec: {aiData?.sleep?.recommendation}
              </span>
            </div>
          </GlassCard>

          {/* SECTION 7: Hydration Card */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Hydration Target</span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {dailyLog.waterConsumed.toFixed(2)}L 
                  <span className="text-xs text-[var(--foreground-muted)] font-normal">/ {macroTargets.water}L</span>
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Waves className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3 mt-3">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300" 
                  style={{ width: `${waterPercent}%` }} 
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.25, 0.5, 1.0].map((lit) => (
                  <button
                    key={lit}
                    onClick={() => logWater(lit)}
                    className="rounded-lg border border-white/5 bg-white/5 py-1.5 text-[10px] font-bold text-white/80 hover:bg-white/10 transition"
                  >
                    +{lit}L
                  </button>
                ))}
              </div>
              <span className="text-[8px] text-cyan-300 text-center block">
                💧 AI Reminder: Hydration levels impact joint elasticity during eccentric extensions.
              </span>
            </div>
          </GlassCard>

          {/* SECTION 8: Weather Adaptability */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Weather Telemetry</span>
                <h4 className="text-xl font-bold text-white mt-1">
                  {aiData?.weather?.summary}, {aiData?.weather?.temp}
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <CloudRain className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 mt-4 text-[10px] text-[var(--foreground-muted)]">
              <div>Humidity: <strong className="text-white">{aiData?.weather?.humidity}</strong></div>
              <p className="leading-relaxed text-white/70">
                🌧️ {aiData?.weather?.rainWarning}
              </p>
              <span className="text-[9px] text-yellow-400 font-bold block border-t border-white/5 pt-2">
                🏃‍♂️ {aiData?.weather?.outdoorSuggestion}
              </span>
            </div>
          </GlassCard>

          {/* SECTION 9: Calendar Sync */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-[#adc6ff]/5 rounded-full blur-2xl group-hover:bg-[#adc6ff]/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">Calendar Schedules</span>
                <h4 className="text-base font-bold text-white mt-1">
                  {aiData?.calendar?.totalEvents} Events Synced
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-[#adc6ff]/10 text-[#adc6ff]">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-2 mt-3 text-[10px] text-[var(--foreground-muted)]">
              <div className="bg-white/5 rounded-lg p-2 font-mono text-[9px] leading-tight">
                <strong>Workout Windows:</strong>
                <p className="text-white mt-0.5">{aiData?.calendar?.availableWindow}</p>
              </div>
              <p className="leading-normal">
                ⚠️ Conflicts: <span className="text-emerald-400 font-bold">{aiData?.calendar?.conflicts}</span>
              </p>
            </div>
          </GlassCard>

          {/* SECTION 10: AI Recommendation Card */}
          <GlassCard className="p-5 flex flex-col justify-between min-h-[220px] border-[var(--border-subtle)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--accent)]/10 transition duration-500" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">AI Custom Recommendation</span>
                <h4 className="text-xs font-bold text-white mt-1.5">
                  Timeline Constraints Active
                </h4>
              </div>
              <div className="p-2 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="space-y-1.5 mt-3 text-[10px] text-[var(--foreground-muted)]">
              <p className="text-white font-bold leading-tight">
                Recommended Routine: {aiData?.workout?.title}
              </p>
              <p className="leading-relaxed">
                <strong>Reasoning:</strong> Optimized for {availableTime}m workout split constraints and {moodState} emotional mindset.
              </p>
              <p className="text-[9px] text-[var(--accent)]">
                <strong>Alternative:</strong> {aiData?.workout?.alternative}
              </p>
            </div>
          </GlassCard>

        </div>
      )}

      {/* SECTION 12: Goals Progress & SECTION 13: Progress Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Goals Progress */}
        <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-yellow-400" /> Physiological Goals
          </h3>
          <div className="space-y-3.5">
            {[
              { title: "Body Weight Target (66.0 kg)", current: 64.2, target: 66, pct: 60, color: "bg-[var(--accent)]" },
              { title: "Lean Muscle Target (56.5 kg LBM)", current: 55, target: 56.5, pct: 45, color: "bg-emerald-400" },
              { title: "Fat Loss Target (18.0%)", current: 22.4, target: 18, pct: 30, color: "bg-rose-400" },
              { title: "Strength Metric Target (Bench Press 100 kg)", current: 85, target: 100, pct: 50, color: "bg-yellow-400" }
            ].map((goal, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{goal.title}</span>
                  <span className="text-[var(--foreground-muted)]">{goal.current} / {goal.target} ({goal.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full ${goal.color} rounded-full transition-all duration-500`} style={{ width: `${goal.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Consistency Area Chart */}
        <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-[var(--accent)]" /> Physiological Consistency
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-black">
              +14% This Week
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity=".5"/>
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#scoreFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* SECTION 11: Motivation Quote & Context Overrides */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="space-y-4 text-left border-[var(--border-subtle)]" glow>
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--accent)] animate-pulse" /> AI Life Context Engine
            </h3>
            <span className="text-[8px] text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded font-black uppercase">Google Calendar Connected</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/60">Today's Available Time</span>
              <div className="flex bg-black/35 rounded-xl p-1 border border-white/5">
                {[20, 45, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAvailableTime(t)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                      availableTime === t ? "bg-[var(--accent)] text-[#131315]" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#adc6ff]/20 bg-[#adc6ff]/5 p-3 text-xs flex gap-2.5 items-start">
              <AlertTriangle className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold text-white">Adaptive Context Adjustment:</p>
                <p className="text-[10px] text-white/50 leading-relaxed mt-0.5">
                  {availableTime === 20 && "⚠️ Limited time alert ↓ Training economy enabled. Reduced workout to 20m high-intensity intervals. Skipping chest accessories."}
                  {availableTime === 45 && "✓ Standard window ↓ Target lifting split enabled. Fully aligned to weekly volume progression."}
                  {availableTime === 60 && "🔥 Expanded window ↓ Added extra recovery mobility work & optional hypertrophy accessories (+120 XP)."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-center text-white/45 font-mono">
              <div className="bg-white/5 border border-white/5 rounded-xl p-2">
                <span>Today's Recovery</span>
                <span className="block font-bold text-white text-xs mt-0.5">86% Optimal</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-2">
                <span>Weather Adapt</span>
                <span className="block font-bold text-cyan-300 text-xs mt-0.5">Indoor Gym</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Emotion Aware AI */}
        <GlassCard className="space-y-4 text-left border-[var(--border-subtle)]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <Smile className="h-4 w-4 text-yellow-400" /> Biometric Emotion Check-In
            </h3>
            <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-black uppercase">Coach Vikram Sync</span>
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider block">Select Current Mindset</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "energetic", label: "Energetic (High Focus)" },
                { id: "tired", label: "Tired / Exhausted" },
                { id: "stressed", label: "Stressed / Busy" },
                { id: "low-motivation", label: "Low Motivation" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMoodState(m.id)}
                  className={`rounded-xl border p-2 text-center text-[10px] font-bold transition ${
                    moodState === m.id
                      ? "border-[var(--accent)] bg-[var(--accent-glow)] text-white"
                      : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs">
              <p className="font-bold text-white uppercase text-[9px] tracking-wider text-white/40">Active Coaching Style Override:</p>
              <p className="text-[10px] text-white/60 mt-1 leading-relaxed">
                {moodState === "energetic" && "🦁 Competitive Mode Active: Coach Vikram using high-performance, metric-focused & intense language."}
                {moodState === "tired" && "🧘‍♂️ Recovery Mode Active: Coach Vikram using gentle, supportive language, prioritizing mobility over loading."}
                {moodState === "stressed" && "⚡ Efficiency Mode Active: Coach Vikram using direct, concise cues to optimize duration."}
                {moodState === "low-motivation" && "🌱 Motivation Mode Active: Supportive cues with positive reinforcement and visual milestone logs."}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* SECTION 14: Recent Activity Feed & Activity logs */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Trophy className="h-4.5 w-4.5 text-yellow-400" /> Recent Accomplishments & Activity Feed
          </h3>
          <div className="space-y-3 font-mono text-[10px] leading-relaxed text-[var(--foreground-muted)]">
            <div className="border-l-2 border-[var(--accent)] pl-3">
              <span className="text-white block font-bold">Today</span>
              <p>Logged Breakfast Meal: Scrambled eggs with spinach (+320 kcal, 24g protein)</p>
            </div>
            <div className="border-l-2 border-white/10 pl-3">
              <span className="text-white/40 block font-bold">Yesterday</span>
              <p>Completed 45m Chest hypertrophy routine (+380 kcal volume load)</p>
            </div>
            <div className="border-l-2 border-white/10 pl-3">
              <span className="text-white/40 block font-bold">2 days ago</span>
              <p>Unlocked 'Consistent Lifter' Badge (Completed 4 schedules per week target)</p>
            </div>
          </div>
        </GlassCard>

        {/* SECTION 15: Quick Actions Console */}
        <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Zap className="h-4.5 w-4.5 text-[var(--accent)] animate-pulse" /> Telemetry Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Start Lift", icon: Dumbbell, onClick: handleStartWorkout, color: "text-[var(--accent)]" },
              { label: "AI Coach", icon: Sparkles, onClick: () => handleAssistantAsk("Coach encouragement quote please"), color: "text-amber-400" },
              { label: "Meal Plan", icon: Apple, onClick: () => setShowLogModal(true), color: "text-emerald-400" },
              { label: "Log Water", icon: Waves, onClick: () => logWater(0.5), color: "text-cyan-400" },
              { label: "Camera Mode", icon: Camera, onClick: () => alert("Vision lens loaded. Setup squat camera..."), color: "text-purple-400" },
              { label: "Scan Food", icon: Scan, onClick: () => alert("Food scanner activated. Scan barcode..."), color: "text-pink-400" },
              { label: "Voice Sync", icon: Mic, onClick: () => setShowVoiceListening(!showVoiceListening), color: "text-indigo-400" },
              { label: "Reset Data", icon: RefreshCw, onClick: () => alert("Settings -> Data Purge"), color: "text-rose-400" }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition group text-center"
              >
                <action.icon className={`h-5 w-5 mb-1.5 ${action.color} group-hover:scale-110 transition duration-300`} />
                <span className="text-[9px] font-bold text-white/70 group-hover:text-white transition">{action.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Smart Form Coach integration */}
        <GlassCard className="p-5 space-y-3 text-left border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 text-[var(--accent)]" /> Smart Form Coach
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Computer Vision</span>
          </div>
          <p className="text-xs text-white/60">
            Open the camera to get real-time pose estimation, automatic rep counting, tempo analysis and an AI form score for 15+ exercises.
          </p>
          <Link href="/form-coach" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-[#131315]">
            <Camera className="h-4 w-4" />Launch Form Coach
          </Link>
        </GlassCard>
      </div>

      {/* Preset Meal Targets */}
      <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
        <h3 className="font-semibold text-white text-sm">Preset Nutrition Meals</h3>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { name: "Scrambled Eggs with Spinach", cal: 320, p: 24, c: 8, f: 18 },
            { name: "Grilled Salmon bowl with Rice", cal: 620, p: 44, c: 55, f: 22 },
            { name: "Whey shake + Oatmeal", cal: 480, p: 38, c: 62, f: 8 },
            { name: "Greek yogurt with Blueberries", cal: 240, p: 18, c: 22, f: 4 },
          ].map((meal) => (
            <button
              key={meal.name}
              onClick={() => quickLogFood(meal.cal, meal.p, meal.c, meal.f)}
              className="rounded-2xl border border-white/5 bg-white/5 p-4 text-left hover:bg-white/10 transition"
            >
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{meal.name}</p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {meal.cal} kcal • P: {meal.p}g • C: {meal.c}g
                </p>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Monthly Training volume charts */}
      <GlassCard className="p-5 space-y-4 text-left border-[var(--border-subtle)]">
        <h3 className="font-bold text-white text-sm">Monthly Training Volume (Hours)</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { month: "Jan", volume: 32 },
              { month: "Feb", volume: 38 },
              { month: "Mar", volume: 44 },
              { month: "Apr", volume: 41 },
              { month: "May", volume: 52 },
              { month: "Jun", volume: 58 }
            ]}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,.03)" }} contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="volume" fill="var(--accent)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Custom Log Meal Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md space-y-4 border border-white/10 p-6 text-left">
            <h3 className="text-lg font-bold text-white">Log Custom Meal</h3>
            <form onSubmit={handleFoodSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={foodInput.cal}
                    onChange={(e) => setFoodInput({ ...foodInput, cal: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={foodInput.prot}
                    onChange={(e) => setFoodInput({ ...foodInput, prot: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/50 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    required
                    value={foodInput.carb}
                    onChange={(e) => setFoodInput({ ...foodInput, carb: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    required
                    value={foodInput.fat}
                    onChange={(e) => setFoodInput({ ...foodInput, fat: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-bold text-black"
                >
                  Add Meal
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Voice Assistant Modal */}
      {showVoiceListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="max-w-xs w-full p-6 text-center space-y-4">
            <Mic className="h-10 w-10 text-[var(--accent)] mx-auto animate-pulse" />
            <h4 className="font-bold text-white text-sm">Titan Voice Assistant</h4>
            <p className="text-xs text-[var(--foreground-muted)]">"Listening for voice instructions..."</p>
            <button 
              onClick={() => setShowVoiceListening(false)} 
              className="w-full py-2 bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white"
            >
              Disable
            </button>
          </GlassCard>
        </div>
      )}

      {/* SECTION 16: Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-black/80 border border-white/10 backdrop-blur-lg rounded-2xl p-4 w-72 shadow-2xl text-left mb-3 space-y-3"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" /> Coach Vikram Assistant
                </span>
                <button 
                  onClick={() => setChatOpen(false)} 
                  className="text-[var(--foreground-muted)] hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-[10px] text-[var(--foreground-muted)] max-h-36 overflow-y-auto font-sans leading-relaxed">
                {assistantMessage ? (
                  <div>
                    <p className="text-white bg-white/5 rounded-lg p-2 mb-1.5 font-medium">💬 You: "{assistantMessage}"</p>
                    {isTyping ? (
                      <p className="text-[var(--accent)] animate-pulse">Coach is typing...</p>
                    ) : (
                      <p className="text-emerald-300 bg-[var(--accent-glow)] rounded-lg p-2">{assistantReply}</p>
                    )}
                  </div>
                ) : (
                  <p>Ask Coach Vikram about your biological stats, training adjustments, or metabolic recovery.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2">
                {[
                  { label: "I'm tired", value: "I'm tired" },
                  { label: "What to eat?", value: "What should I eat?" },
                  { label: "Only 20 min", value: "I have only 20 minutes" },
                  { label: "Back hurts", value: "My back hurts" }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAssistantAsk(q.value)}
                    className="rounded-lg bg-white/5 hover:bg-white/10 p-1.5 text-center text-[8px] font-bold text-white/80 transition"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-black flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-105 transition duration-300"
          aria-label="Ask Coach"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </button>
      </div>

    </div>
  );
}
