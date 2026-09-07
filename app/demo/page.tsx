"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Plane,
  MoonStar,
  RotateCcw,
  ArrowRight,
  Clock,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";
import { applyScenario, createInitialTwin } from "@/lib/digital-twin";
import { adaptPlan, generateInitialPlan, type AdaptedPlan } from "@/lib/adaptive-engine";
import type { ClientProfile } from "@/types/profile";

const defaultProfile: ClientProfile = {
  name: "Anil (Sample User)",
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
  medicalConditions: "",
  injuries: "",
  foodPreference: "both",
  allergies: "",
  budget: "moderate",
  sleepDuration: 7.5,
  stressLevel: "low",
  availableEquipment: ["dumbbells", "barbell", "bench"],
  lifestyle: "hostel student",
  workoutEnvironment: "gym",
  workoutTime: "evening",
};

export default function DemoPage() {
  const [scenario, setScenario] = useState<"normal" | "exam" | "travel" | "recovery">("normal");
  const [adapted, setAdapted] = useState<AdaptedPlan | null>(null);

  const initial = React.useMemo(() => {
    const twin = createInitialTwin(defaultProfile, "demo_user_001");
    return {
      twin,
      plan: generateInitialPlan(defaultProfile, twin),
    };
  }, []);

  const handleScenarioChange = (scenarioType: "normal" | "exam" | "travel" | "recovery") => {
    setScenario(scenarioType);
    if (scenarioType === "normal") {
      setAdapted(null);
      return;
    }

    if (scenarioType === "exam") {
      const examTwin = applyScenario(initial.twin, { type: "exam", duration: 7 }).updatedTwin;
      const constrainedTwin = applyScenario(examTwin, {
        type: "budget-change",
        metadata: { newBudget: 150 },
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, constrainedTwin, initial.twin));
    } else if (scenarioType === "travel") {
      const travelTwin = applyScenario(initial.twin, {
        type: "travel",
        duration: 5,
        metadata: { equipmentAvailable: ["bodyweight"] },
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, travelTwin, initial.twin));
    } else if (scenarioType === "recovery") {
      const recoveryTwin = applyScenario(initial.twin, {
        type: "poor-sleep",
        duration: 3,
      }).updatedTwin;
      setAdapted(adaptPlan(initial.plan, recoveryTwin, initial.twin));
    }
  };

  const adaptedDuration = adapted?.workoutPlan.durationMinutes ?? 20;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 mb-6">
            <Sparkles className="h-4 w-4" />
            LIVE ADAPTATION DEMO
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            🎬 Watch OJAS Adapt in Real-Time
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Click a scenario. Watch your plan adapt instantly.
          </p>
        </motion.div>

        {/* Scenario Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {[
            { id: "exam" as const, label: "📚 Simulate Exam Period", icon: BookOpen },
            { id: "travel" as const, label: "✈️ Simulate Travel", icon: Plane },
            { id: "recovery" as const, label: "😴 Simulate Poor Sleep", icon: MoonStar },
            { id: "normal" as const, label: "🔄 Reset to Normal", icon: RotateCcw },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleScenarioChange(btn.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                scenario === btn.id
                  ? "bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-400/20"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <btn.icon className="h-4 w-4" />
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Before vs After */}
        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6 border-white/10 bg-slate-900/50 h-full">
              <h3 className="text-lg font-bold text-white mb-4">NORMAL BASELINE</h3>
              <div className="space-y-3">
                <StatRow label="Available Time" value="60 min" />
                <StatRow label="Sleep Duration" value="7.5 hours" />
                <StatRow label="Stress Level" value="Low" />
                <StatRow label="Daily Food Budget" value="₹250 / day" />
                <StatRow label="Training Location" value="Gym" />
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className={`p-6 border-white/10 h-full ${scenario !== "normal" ? "border-amber-400/30 bg-amber-950/10" : "bg-slate-900/50"}`}>
              <h3 className="text-lg font-bold text-white mb-4">
                {scenario === "exam" && "📚 LIFE CHANGES DETECTED (Exam Period)"}
                {scenario === "travel" && "✈️ LIFE CHANGES DETECTED (Travel)"}
                {scenario === "recovery" && "😴 LIFE CHANGES DETECTED (Poor Sleep)"}
                {scenario === "normal" && "LIFE CHANGES (Click a scenario)"}
              </h3>
              {scenario === "exam" && (
                <div className="space-y-3">
                  <StatRow label="Available Time" value="20 min (Compressed)" highlight />
                  <StatRow label="Sleep Duration" value="5.5 hours (Reduced)" highlight />
                  <StatRow label="Stress Level" value="High (Exam Stress)" highlight />
                  <StatRow label="Daily Food Budget" value="₹150 / day" highlight />
                  <StatRow label="Training Location" value="Hostel Room" highlight />
                </div>
              )}
              {scenario === "travel" && (
                <div className="space-y-3">
                  <StatRow label="Available Time" value="30 min" highlight />
                  <StatRow label="Sleep Duration" value="6.5 hours" highlight />
                  <StatRow label="Stress Level" value="Moderate" highlight />
                  <StatRow label="Equipment" value="Bodyweight Only" highlight />
                  <StatRow label="Location" value="Hotel Room" highlight />
                </div>
              )}
              {scenario === "recovery" && (
                <div className="space-y-3">
                  <StatRow label="Available Time" value="45 min" highlight />
                  <StatRow label="Sleep Duration" value="4.5 hours (Severe drop)" highlight />
                  <StatRow label="Stress Level" value="High Fatigue" highlight />
                  <StatRow label="Recovery Score" value="28% (Low readiness)" highlight />
                  <StatRow label="Training Focus" value="Active Deload" highlight />
                </div>
              )}
              {scenario === "normal" && (
                <div className="space-y-3 text-white/40">
                  <StatRow label="Available Time" value="60 min → Click 'Simulate Exam'" />
                  <StatRow label="Sleep Duration" value="7.5 h → Click 'Simulate Exam'" />
                  <StatRow label="Stress Level" value="Low → Click 'Simulate Exam'" />
                  <StatRow label="Daily Food Budget" value="₹250 → Click 'Simulate Exam'" />
                  <StatRow label="Training Location" value="Gym → Click 'Simulate Exam'" />
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Adapted Plan Output */}
        {scenario !== "normal" && adapted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Decision Pipeline */}
            <GlassCard className="p-6 border-cyan-400/30 bg-slate-950/80">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-cyan-300 mb-4">
                <Sparkles className="h-4 w-4" />
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
            </GlassCard>

            {/* Adaptation Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdaptCard label="Workout Duration" before="45 min" after={`${adaptedDuration} min`} />
              <AdaptCard label="Training Load" before="Moderate / High" after="Adjusted (Lower Volume)" />
              <AdaptCard label="Nutrition Budget" before="₹250 / day" after="₹150 / day Practical Meal Guide" />
              <AdaptCard label="Recovery Priority" before="Standard" after="Higher Priority (Active Rest)" />
            </div>

            {/* Explanation */}
            <GlassCard className="p-6 border-cyan-400/30 bg-slate-950/80">
              <h3 className="text-sm font-extrabold text-cyan-300 mb-3">Why This Changed</h3>
              <div className="space-y-2">
                {adapted.adaptations.map((adaptation, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-cyan-300 capitalize">{(adaptation.type || "").replace(/-/g, " ")}</p>
                    <p className="text-xs text-white/70 mt-1">{adaptation.reasoning}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
              >
                Explore Full System <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
      <span className="text-white/60 text-xs">{label}</span>
      <span className={`text-xs font-bold ${highlight ? "text-amber-300" : "text-white"}`}>{value}</span>
    </div>
  );
}

function AdaptCard({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
      <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-white/40 line-through">{before}</span>
        <span className="text-white/30">→</span>
        <span className="text-emerald-300 font-bold">{after}</span>
      </div>
    </div>
  );
}
