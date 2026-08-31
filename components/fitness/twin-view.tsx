"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  UserCheck,
  ShieldAlert,
  Zap,
  BarChart3,
  FileText,
  TrendingUp,
  Info,
  Calendar,
  Scale,
  Brain,
  Sliders,
  CheckCircle2,
  Camera,
  Activity,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  RefreshCw,
  Clock,
  Dumbbell,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { getSessions } from "@/lib/vision/session-storage";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";
import { SPORT_REGISTRY } from "@/lib/sports";

type TwinTab = "twin" | "what-changed" | "timeline" | "simulator" | "forecast";

export function TwinView() {
  const { profile, metrics, logsHistory } = useFitness();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TwinTab>("twin");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("quads");
  const [avatarMode, setAvatarMode] = useState<"avatar" | "photo">("avatar");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Vision sessions history
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecentSessions(getSessions());
      const storedPhoto = localStorage.getItem("ojas_user_avatar");
      if (storedPhoto) setUserPhoto(storedPhoto);
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUserPhoto(result);
        if (typeof window !== "undefined") {
          localStorage.setItem("ojas_user_avatar", result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dynamic simulation outcomes
  const w = profile?.weight || 78.5;
  const bf = profile?.bodyFat || 22.4;

  // Simulation Sliders
  const [simWorkouts, setSimWorkouts] = useState<number>(4);
  const [simSleep, setSimSleep] = useState<number>(7.5);
  const [simProtein, setSimProtein] = useState<number>(2.0);
  const [simDiet, setSimDiet] = useState<"cut" | "bulk" | "maintain">("cut");

  const ad = Math.min(1.0, (simSleep / 8 + simProtein / 2.0) / 2);
  let wtD = 0;
  if (simDiet === "cut") wtD = -3.8 * ad;
  else if (simDiet === "bulk") wtD = 2.2 * ad;
  else wtD = -0.3 * ad;

  const projWeight = Math.round((w + wtD) * 10) / 10;
  let bfD = 0;
  if (simDiet === "cut") bfD = -2.5 * ad;
  else if (simDiet === "bulk") bfD = 0.5 * (1 - ad);

  const projBf = Math.round(Math.max(4, bf + bfD) * 10) / 10;

  // Forecast data
  const forecastData = [
    { name: "Now", weight: w, fat: bf },
    { name: "1 Wk", weight: Math.round((w + wtD * 0.1) * 10) / 10, fat: Math.round((bf + bfD * 0.1) * 10) / 10 },
    { name: "4 Wks", weight: Math.round((w + wtD * 0.3) * 10) / 10, fat: Math.round((bf + bfD * 0.3) * 10) / 10 },
    { name: "8 Wks", weight: Math.round((w + wtD * 0.6) * 10) / 10, fat: Math.round((bf + bfD * 0.6) * 10) / 10 },
    { name: "12 Wks", weight: projWeight, fat: projBf },
  ];

  const muscles = [
    { id: "quads", name: "Quadriceps Femoris", activation: "92% (High Output)", status: "optimal" },
    { id: "lats", name: "Latissimus Dorsi", activation: "78% (Active)", status: "optimal" },
    { id: "chest", name: "Pectoralis Major", activation: "86% (Optimal)", status: "optimal" },
    { id: "hamstrings", name: "Biceps Femoris", activation: "40% (Under-Activated)", status: "warning" },
    { id: "shoulders", name: "Deltoid Cluster", activation: "65% (Moderate)", status: "fatigued" },
    { id: "core", name: "Rectus Abdominis", activation: "88% (Engaged)", status: "optimal" },
  ];

  // Calculated session stats
  const avgFormScore = recentSessions.length
    ? Math.round(recentSessions.reduce((a, s) => a + (s.formScore || 80), 0) / recentSessions.length)
    : 84;

  const totalVisionReps = recentSessions.reduce((a, s) => a + (s.reps || 0), 0);

  // Digital Twin Timeline events
  const timelineEvents = [
    {
      week: "Week 1",
      title: "Digital Twin Baseline Established",
      desc: "Initial onboarding biometrics, posture audit, and movement baseline registered.",
      type: "baseline",
      date: "Initial Setup",
    },
    {
      week: "Week 2",
      title: "Workout Consistency Increased",
      desc: "Logged 4 consecutive training sessions. Adherence score climbed from 50% to 74%.",
      type: "progress",
      date: "7 days ago",
    },
    {
      week: "Week 3",
      title: "Live Squat Form Improved",
      desc: "Vision Coach detected deeper squat depth and reduced knee valgus. Average form score reached 88/100.",
      type: "form",
      date: "3 days ago",
    },
    {
      week: "Week 4",
      title: "Exam Stress & Reduced Time Detected",
      desc: "Sleep dropped to 5.2h and available workout window compressed to 20 min.",
      type: "adaptation",
      date: "Today",
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Navigation Tabs */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap" glow>
        {[
          { id: "twin", key: "nav_digital_twin" as keyof TranslationDictionary, label: "Visual Digital Twin" },
          { id: "what-changed", label: "What Changed?" },
          { id: "timeline", label: "Twin Timeline" },
          { id: "simulator", label: "AI Scenario Simulator" },
          { id: "forecast", label: "Projections" },
        ].map((item) => {
          const label = item.key ? t(item.key, item.label) : item.label;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as TwinTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === item.id
                  ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-cyan-500/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Visual Representation (Option 1 Photo / Option 2 3D Biomechanical Avatar) */}
        <GlassCard className="space-y-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)] p-5" glow>
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#adc6ff] animate-pulse" /> Visual Digital Twin
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Dynamic reflection of your physiological state & movement capacity.
              </p>
            </div>

            {/* Toggle Avatar vs Photo */}
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setAvatarMode("avatar")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  avatarMode === "avatar" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30" : "text-white/50"
                }`}
              >
                Avatar
              </button>
              <button
                onClick={() => setAvatarMode("photo")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  avatarMode === "photo" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30" : "text-white/50"
                }`}
              >
                Photo
              </button>
            </div>
          </div>

          {/* Visual Container */}
          <div className="relative aspect-[3/4] max-h-[420px] rounded-[24px] border border-white/5 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(173,198,255,0.08),_transparent_60%)]" />

            {avatarMode === "photo" && userPhoto ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={userPhoto}
                  alt="User Profile"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-cyan-300">Verified User Avatar</p>
                  <p className="text-xs text-white/80 mt-0.5">Biometrics synchronized with real workout telemetry.</p>
                </div>
              </div>
            ) : (
              <>
                {/* 3D Skeletal Wireframe Avatar */}
                <svg className="w-full h-full text-white/20 stroke-1" viewBox="0 0 100 130">
                  <line x1="0" y1="32.5" x2="100" y2="32.5" stroke="rgba(255,255,255,0.03)" />
                  <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.03)" />
                  <line x1="0" y1="97.5" x2="100" y2="97.5" stroke="rgba(255,255,255,0.03)" />
                  <line x1="50" y1="0" x2="50" y2="130" stroke="rgba(255,255,255,0.03)" />

                  <circle cx="50" cy="18" r="7" className="stroke-white/10 fill-none" />
                  <circle cx="50" cy="18" r="5" className="stroke-cyan-500/30 fill-none animate-pulse" />
                  <line x1="50" y1="25" x2="50" y2="65" className="stroke-white/30" />
                  <line x1="36" y1="32" x2="64" y2="32" className="stroke-white/30" />

                  {/* Arms */}
                  <line x1="36" y1="32" x2="28" y2="48" className="stroke-white/20" />
                  <line x1="28" y1="48" x2="24" y2="64" className="stroke-white/20" />
                  <path
                    d="M 36 32 L 28 48"
                    stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                    strokeWidth={selectedMuscle === "shoulders" ? "3" : "1"}
                  />

                  <line x1="64" y1="32" x2="72" y2="48" className="stroke-white/20" />
                  <line x1="72" y1="48" x2="76" y2="64" className="stroke-white/20" />
                  <path
                    d="M 64 32 L 72 48"
                    stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                    strokeWidth={selectedMuscle === "shoulders" ? "3" : "1"}
                  />

                  {/* Spine/Chest */}
                  <ellipse cx="50" cy="42" rx="10" ry="12" className="stroke-white/10 fill-none" />
                  <path
                    d="M 40 42 Q 50 48 60 42"
                    stroke={selectedMuscle === "chest" ? "#38bdf8" : "rgba(255,255,255,0.1)"}
                    strokeWidth={selectedMuscle === "chest" ? "3" : "1"}
                    fill="none"
                  />

                  {/* Lats */}
                  <path
                    d="M 36 32 C 38 48 45 55 50 65 C 55 55 62 48 64 32"
                    stroke={selectedMuscle === "lats" ? "#22d3ee" : "rgba(255,255,255,0.1)"}
                    strokeWidth={selectedMuscle === "lats" ? "3" : "1"}
                    fill="none"
                  />

                  <line x1="40" y1="65" x2="60" y2="65" className="stroke-white/30" />

                  {/* Thighs */}
                  <line x1="40" y1="65" x2="36" y2="92" className="stroke-white/20" />
                  <line x1="36" y1="92" x2="36" y2="120" className="stroke-white/20" />
                  <path
                    d="M 40 65 L 36 92"
                    stroke={
                      selectedMuscle === "quads"
                        ? "#38bdf8"
                        : selectedMuscle === "hamstrings"
                        ? "#fb7185"
                        : "rgba(255,255,255,0.2)"
                    }
                    strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "3" : "1"}
                  />

                  <line x1="60" y1="65" x2="64" y2="92" className="stroke-white/20" />
                  <line x1="64" y1="92" x2="64" y2="120" className="stroke-white/20" />
                  <path
                    d="M 60 65 L 64 92"
                    stroke={
                      selectedMuscle === "quads"
                        ? "#38bdf8"
                        : selectedMuscle === "hamstrings"
                        ? "#fb7185"
                        : "rgba(255,255,255,0.2)"
                    }
                    strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "3" : "1"}
                  />

                  {/* Joint nodes */}
                  <circle cx="50" cy="25" r="2.5" fill="#38bdf8" />
                  <circle cx="36" cy="32" r="2" fill="#22d3ee" />
                  <circle cx="64" cy="32" r="2" fill="#22d3ee" />
                  <circle cx="40" cy="65" r="2" fill="#22d3ee" />
                  <circle cx="60" cy="65" r="2" fill="#22d3ee" />
                  <circle cx="36" cy="92" r="2" fill="#22d3ee" />
                  <circle cx="64" cy="92" r="2" fill="#22d3ee" />
                </svg>

                <div className="absolute bottom-4 left-4 bg-black/60 rounded-xl px-3 py-2 text-xs border border-white/5">
                  <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">
                    Active Biomechanical Focus
                  </span>
                  <span className="font-bold text-white capitalize">{selectedMuscle}</span>
                </div>
              </>
            )}

            {avatarMode === "photo" && (
              <label className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 cursor-pointer text-[10px] font-bold text-cyan-300 border border-white/10 px-3 py-1.5 rounded-xl transition flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Muscle Group Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {muscles.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMuscle(m.id)}
                className={`rounded-2xl border px-3 py-2 text-left transition shrink-0 ${
                  selectedMuscle === m.id
                    ? "border-[#adc6ff] bg-[#adc6ff]/10 text-white shadow-md shadow-cyan-500/10"
                    : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                <p className="text-[10px] font-bold capitalize">{m.id}</p>
                <p className="text-[9px] text-white/40 mt-0.5 truncate max-w-[90px]">{m.activation}</p>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Right Column: Dynamic Tabs switcher */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* TAB 1: Visual Twin Dashboard */}
              {tab === "twin" && (
                <div className="space-y-6">
                  {/* Scores Grid */}
                  <div className="grid gap-3 grid-cols-2">
                    {[
                      { label: "Overall Fitness Score", value: "88 / 100", col: "text-emerald-400" },
                      { label: "Strength Trend", value: "↑ Increasing", col: "text-emerald-400" },
                      { label: "Average Form Score", value: `${avgFormScore} / 100`, col: "text-cyan-400" },
                      { label: "Workout Consistency", value: "84 / 100", col: "text-emerald-400" },
                      { label: "Recovery Efficiency", value: "82 / 100", col: "text-cyan-400" },
                      { label: "Total Vision Reps", value: `${totalVisionReps || 42} reps`, col: "text-purple-300" },
                    ].map((score) => (
                      <GlassCard key={score.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 text-left">
                        <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold block">
                          {score.label}
                        </span>
                        <span className={`text-lg font-black mt-1.5 block ${score.col}`}>{score.value}</span>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Closed-Loop Action to Adaptive Engine */}
                  <GlassCard className="p-5 border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-cyan-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-cyan-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                          Digital Twin → Adaptive Engine Loop
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                        Synchronized
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Your Digital Twin continuously feeds your live computer-vision form and workout logs into the local Gemma 3 4B AI model to dynamically adjust training volume, intensity, and recovery.
                    </p>
                    <Link
                      href="/coach"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-3.5 py-2 rounded-xl hover:bg-cyan-500/20 transition"
                    >
                      Personalize Plan via Digital Twin <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </GlassCard>

                  {/* Sport Transition & Athlete Performance Twin Layer */}
                  <GlassCard className="p-5 border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-amber-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Sport Performance Twin Layer
                        </h4>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                        Active Transition
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/50 block">Target Sport</span>
                        <strong className="text-white font-bold capitalize">
                          {SPORT_REGISTRY[profile?.selectedSport || "football"]?.icon || "⚽"}{" "}
                          {SPORT_REGISTRY[profile?.selectedSport || "football"]?.name || "Football"}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/50 block">Primary Gap</span>
                        <strong className="text-amber-300 font-bold">Agility (-18 pts)</strong>
                      </div>
                    </div>
                    <Link
                      href="/sports"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-400/30 px-3.5 py-2 rounded-xl hover:bg-amber-500/20 transition w-full justify-center"
                    >
                      Open Sport Transition & Gap Analysis Hub <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </GlassCard>
                </div>
              )}

              {/* TAB 2: "What Changed?" Section */}
              {tab === "what-changed" && (
                <div className="space-y-5">
                  <GlassCard className="p-5 space-y-4 border-cyan-400/20 bg-black/40">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-cyan-400" /> What Changed?
                      </h4>
                      <span className="text-[10px] text-white/40">This Period vs Previous</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-semibold">Workout Consistency</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 line-through">62%</span>
                          <span className="text-emerald-400 font-bold">→ 84%</span>
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-semibold">Average Squat Form</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 line-through">74/100</span>
                          <span className="text-cyan-300 font-bold">→ {avgFormScore}/100</span>
                          <ArrowUpRight className="h-4 w-4 text-cyan-300" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-semibold">Available Workout Time</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 line-through">60 min</span>
                          <span className="text-amber-300 font-bold">→ 20 min</span>
                          <ArrowDownRight className="h-4 w-4 text-amber-300" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-semibold">Sleep Duration</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-white/50 line-through">7.4 hrs</span>
                          <span className="text-amber-300 font-bold">→ 5.5 hrs</span>
                          <ArrowDownRight className="h-4 w-4 text-amber-300" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* "What Does This Mean?" Explainable Analysis */}
                  <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                      <Brain className="h-4 w-4" /> What Does This Mean?
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed">
                      “Your movement technique and consistency have significantly improved, but reduced sleep and available time create temporary central nervous system fatigue. Ojas automatically compresses your workout to 20 minutes with active recovery to preserve strength while protecting joint health.”
                    </p>
                  </GlassCard>
                </div>
              )}

              {/* TAB 3: Digital Twin Change Timeline */}
              {tab === "timeline" && (
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <div className="border-b border-white/5 pb-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#adc6ff]" /> Digital Twin Timeline
                    </h4>
                    <p className="text-xs text-white/40 mt-0.5">Chronological evolution of your fitness state.</p>
                  </div>

                  <div className="space-y-4 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                    {timelineEvents.map((evt, idx) => (
                      <div key={idx} className="relative text-xs space-y-1">
                        <div className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-950" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">{evt.week}: {evt.title}</span>
                          <span className="text-[10px] text-white/40">{evt.date}</span>
                        </div>
                        <p className="text-white/70 leading-relaxed">{evt.desc}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* TAB 4: Simulator */}
              {tab === "simulator" && (
                <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                  <h4 className="font-bold text-white text-sm">Biomechanical Scenario Simulator</h4>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-white/60 mb-1">
                        <span>Workouts per Week</span>
                        <span className="font-bold text-cyan-300">{simWorkouts} sessions</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="7"
                        value={simWorkouts}
                        onChange={(e) => setSimWorkouts(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-white/60 mb-1">
                        <span>Sleep per Night</span>
                        <span className="font-bold text-cyan-300">{simSleep} hours</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="10"
                        step="0.5"
                        value={simSleep}
                        onChange={(e) => setSimSleep(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs text-white/70">
                    <p className="font-bold text-white">Projected 12-Week State:</p>
                    <p className="mt-1">
                      Weight: <strong>{projWeight} kg</strong> · Body Fat: <strong>{projBf}%</strong>
                    </p>
                  </div>
                </GlassCard>
              )}

              {/* TAB 5: Forecast */}
              {tab === "forecast" && (
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="font-bold text-white text-sm">12-Week Body Composition Projections</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} />
                        <YAxis stroke="#ffffff40" fontSize={10} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ backgroundColor: "#0c0e12", borderColor: "#ffffff20", fontSize: "11px" }} />
                        <Line type="monotone" dataKey="weight" stroke="#38bdf8" strokeWidth={2} name="Weight (kg)" />
                        <Line type="monotone" dataKey="fat" stroke="#fb7185" strokeWidth={2} name="Body Fat %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
