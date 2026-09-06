"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Dumbbell, History, BarChart3, BookOpen, Save, Sparkles, Cpu, Play, Scale, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useFormCoach } from "./form-coach/use-form-coach";
import { CameraStage } from "./form-coach/camera-stage";
import { LivePanel } from "./form-coach/live-panel";
import { HowToPerform } from "./form-coach/how-to-perform";
import { ExercisePicker } from "./form-coach/exercise-picker";
import { SessionHistory } from "./form-coach/session-history";
import { Tutorials } from "./form-coach/tutorials";
import { WorkoutReplay } from "./form-coach/workout-replay";
import { FormComparison } from "./form-coach/form-comparison";
import { MovementAnalytics } from "./form-coach/movement-analytics";
import { FormCoachDemo } from "./form-coach/form-coach-demo";
import { deleteSession } from "@/lib/vision";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

type Tab = "demo" | "live" | "exercises" | "tutorials" | "replay" | "comparison" | "history" | "progress";

interface TabConfig {
  id: Tab;
  key?: keyof TranslationDictionary;
  defaultLabel: string;
  icon: React.ReactNode;
}

export function FormCoachView() {
  const coach = useFormCoach();
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("demo");
  const angles = coach.frame?.angles ?? {};

  const tabs: TabConfig[] = [
    { id: "demo", defaultLabel: "CV Interactive Demo", icon: <Eye className="h-4 w-4" /> },
    { id: "live", key: "form_coach_title", defaultLabel: "Live Camera Coach", icon: <Camera className="h-4 w-4" /> },
    { id: "exercises", key: "workout_exercises", defaultLabel: "Exercises", icon: <Dumbbell className="h-4 w-4" /> },
    { id: "tutorials", defaultLabel: "Tutorials", icon: <BookOpen className="h-4 w-4" /> },
    { id: "replay", defaultLabel: "Workout Replay", icon: <Play className="h-4 w-4" /> },
    { id: "comparison", defaultLabel: "Comparison", icon: <Scale className="h-4 w-4" /> },
    { id: "history", key: "nav_prs", defaultLabel: "History", icon: <History className="h-4 w-4" /> },
    { id: "progress", key: "nav_analytics", defaultLabel: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#181a20] to-[#121316]" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Sparkles className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">Computer Vision &amp; Pose Kinematics</p>
            <h2 className="text-xl font-bold text-white">{t("form_coach_title", "Smart Form Coach")}</h2>
            <p className="text-xs text-white/50">Real-time skeleton landmark detection, joint angles calculation, and bio-feedback.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab === "demo" && (
            <span className="flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1.5 text-[11px] font-bold text-blue-300">
              <Cpu className="h-3.5 w-3.5" />
              Interactive CV Simulator Active
            </span>
          )}
          {coach.mode === "live" && coach.status === "live" && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
              <Cpu className="h-3.5 w-3.5" />MediaPipe Live Active
            </span>
          )}
          <button
            onClick={() => void coach.persistSession()}
            disabled={coach.saving || (coach.reps === 0 && coach.finishedSets.length === 0)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-white/10 transition"
          >
            <Save className="h-4 w-4" />{coach.saving ? t("common_loading", "Saving…") : t("common_save", "Save Session")}
          </button>
        </div>
      </GlassCard>

      {/* Exercise Quick Selector for instant switching */}
      <GlassCard className="p-3 bg-[#131418] border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-white/50 flex items-center gap-1.5 mr-1">
            <Dumbbell className="h-3.5 w-3.5 text-[#adc6ff]" />
            Active Exercise:
          </span>
          {[
            { id: "squat", name: "Barbell Squat", tag: "Lower Body" },
            { id: "push-up", name: "Push-up", tag: "Bodyweight" },
            { id: "deadlift", name: "Deadlift", tag: "Hinge Strength" },
            { id: "bench-press", name: "Bench Press", tag: "Upper Press" },
            { id: "pull-up", name: "Pull-up", tag: "Upper Pull" },
          ].map((ex) => (
            <button
              key={ex.id}
              onClick={() => coach.setExerciseId(ex.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                coach.exercise.id === ex.id
                  ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-blue-500/20 scale-105"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <span>{ex.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                coach.exercise.id === ex.id ? "bg-[#131315]/20 text-[#131315]" : "bg-white/10 text-white/40"
              }`}>
                {ex.tag}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1">
        {tabs.map((tItem) => {
          const label = tItem.key ? t(tItem.key, tItem.defaultLabel) : tItem.defaultLabel;
          return (
            <button
              key={tItem.id}
              onClick={() => setTab(tItem.id)}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                tab === tItem.id ? "text-[#131315]" : "text-white/50 hover:text-white"
              }`}
            >
              {tab === tItem.id && (
                <motion.span
                  layoutId="fcTab"
                  className="absolute inset-0 rounded-xl bg-[#adc6ff]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tItem.icon}</span>
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Content depending on selected tab */}
      {tab === "demo" && <FormCoachDemo />}

      {tab === "live" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <HowToPerform exercise={coach.exercise} movementPhase={coach.movementPhase} liveAngles={angles} />
          <div className="space-y-4">
            <CameraStage
              {...coach}
              exerciseName={coach.exercise.name}
              pose={coach.frame?.pose}
              angles={angles}
            />
            <LivePanel coach={coach} />
          </div>
        </div>
      )}

      {tab === "exercises" && (
        <ExercisePicker
          selectedId={coach.exercise.id}
          onSelect={(id: string) => {
            coach.setExerciseId(id);
            setTab("live");
          }}
        />
      )}

      {tab === "tutorials" && <Tutorials featuredId={coach.exercise.id} />}
      {tab === "replay" && <WorkoutReplay sessions={coach.sessions} />}
      {tab === "comparison" && <FormComparison />}
      {tab === "history" && <SessionHistory sessions={coach.sessions} onDelete={async (id: string) => { await deleteSession(id); coach.refresh(); }} />}
      {tab === "progress" && <MovementAnalytics analytics={coach.analytics} />}
    </div>
  );
}
