"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Dumbbell, History, BarChart3, BookOpen, Save, Sparkles, Cpu, Play, Scale } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { useFormCoach } from "./form-coach/use-form-coach";
import { CameraStage } from "./form-coach/camera-stage";
import { LivePanel } from "./form-coach/live-panel";
import { HowToPerform } from "./form-coach/how-to-perform";
import { ExercisePicker } from "./form-coach/exercise-picker";
import { SessionHistory } from "./form-coach/session-history";
import { ProgressDashboard } from "./form-coach/progress-dashboard";
import { Tutorials } from "./form-coach/tutorials";
import { WorkoutReplay } from "./form-coach/workout-replay";
import { FormComparison } from "./form-coach/form-comparison";
import { MovementAnalytics } from "./form-coach/movement-analytics";
import { deleteSession } from "@/lib/vision";

type Tab = "live" | "exercises" | "tutorials" | "replay" | "comparison" | "history" | "progress";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "live", label: "Live Coach", icon: <Camera className="h-4 w-4" /> },
  { id: "exercises", label: "Exercises", icon: <Dumbbell className="h-4 w-4" /> },
  { id: "tutorials", label: "Tutorials", icon: <BookOpen className="h-4 w-4" /> },
  { id: "replay", label: "Workout Replay", icon: <Play className="h-4 w-4" /> },
  { id: "comparison", label: "Comparison", icon: <Scale className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "progress", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
];

export function FormCoachView() {
  const coach = useFormCoach();
  const [tab, setTab] = useState<Tab>("live");
  const angles = coach.frame?.angles ?? {};

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Sparkles className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">Computer vision</p>
            <h2 className="text-xl font-bold text-white">Smart Form Coach</h2>
            <p className="text-xs text-white/50">Guided instructions on left • Real-time computer vision analysis on right.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {coach.mode === "live" && coach.liveReady && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-300">
              <Cpu className="h-3.5 w-3.5" />MediaPipe Live Active
            </span>
          )}
          <button
            onClick={() => void coach.persistSession()}
            disabled={coach.saving || (coach.reps === 0 && coach.finishedSets.length === 0)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-white/10 transition"
          >
            <Save className="h-4 w-4" />{coach.saving ? "Saving…" : "Save Session"}
          </button>
        </div>
      </GlassCard>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
              tab === t.id ? "text-[#131315]" : "text-white/50 hover:text-white"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="fcTab"
                className="absolute inset-0 rounded-xl bg-[#adc6ff]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "live" && (
            <div className="space-y-5">
              {/* Exercise Selector */}
              <ExercisePicker selectedId={coach.exerciseId} onSelect={coach.setExerciseId} />

              {/* Two-Sided Guided Coaching Layout */}
              <div className="grid gap-6 lg:grid-cols-[0.42fr_0.58fr] items-start">
                {/* LEFT SIDE: "HOW TO DO IT" (Instruction, Posture, Movement Phase Steps) */}
                <div className="space-y-4">
                  <HowToPerform
                    exercise={coach.exercise}
                    movementPhase={coach.movementPhase}
                    liveAngles={angles}
                  />
                </div>

                {/* RIGHT SIDE: "LIVE AI COACH" (Camera, Skeleton, Live Comparison, Reps, Feedback) */}
                <div className="space-y-4">
                  <CameraStage
                    videoRef={coach.videoRef}
                    status={coach.status}
                    error={coach.error}
                    start={coach.start}
                    stop={coach.stop}
                    togglePause={coach.togglePause}
                    switchCamera={coach.switchCamera}
                    preferences={coach.preferences}
                    setPreferences={coach.setPreferences}
                    devices={coach.devices}
                    fullscreen={coach.fullscreen}
                    setFullscreen={coach.setFullscreen}
                    showSkeleton={coach.showSkeleton}
                    setShowSkeleton={coach.setShowSkeleton}
                    showAngles={coach.showAngles}
                    setShowAngles={coach.setShowAngles}
                    mode={coach.mode}
                    setMode={coach.setMode}
                    liveReady={coach.liveReady}
                    fps={coach.fps}
                    exerciseName={coach.exercise.name}
                    pose={coach.frame?.pose ?? null}
                    angles={angles}
                    landmarksVisible={coach.frame?.landmarksVisible}
                    movementPhase={coach.movementPhase}
                    activeCue={coach.feedback[0]?.cue}
                    faultJoints={coach.feedback.filter((f) => f.severity === "warning").map((f) => f.joint).filter(Boolean) as string[]}
                    primaryJoint={coach.exercise.primaryJoint}
                    targetAngle={coach.exercise.repBottomAngle}
                  />
                  <LivePanel coach={coach} />
                </div>
              </div>
            </div>
          )}
          {tab === "exercises" && <ExercisePicker selectedId={coach.exerciseId} onSelect={coach.setExerciseId} />}
          {tab === "tutorials" && <Tutorials featuredId={coach.exerciseId} />}
          {tab === "replay" && <WorkoutReplay sessions={coach.sessions} />}
          {tab === "comparison" && <FormComparison />}
          {tab === "history" && (
            <SessionHistory sessions={coach.sessions} onDelete={(id) => { deleteSession(id); coach.refresh(); }} />
          )}
          {tab === "progress" && <MovementAnalytics analytics={coach.analytics} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
