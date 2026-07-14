"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Activity,
  Award,
  Sparkles,
  Info,
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Star,
  Film,
  AlertTriangle,
  Scale,
  Brain,
  Zap,
  TrendingUp,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import { SkeletonOverlay } from "./form-coach/skeleton-overlay";
import { snapshotPose, getExercise } from "@/lib/vision";
import type { JointMap, JointName } from "@/lib/vision/types";

type Tab = "dashboard" | "history" | "studio" | "heatmaps" | "coaching" | "reports";

const JOINT_NAMES: JointName[] = [
  "head", "neck", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
  "leftWrist", "rightWrist", "spine", "pelvis", "leftHip", "rightHip",
  "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"
];

function poseFrameToJointMap(landmarks: any[]): JointMap {
  const joints = {} as JointMap;
  JOINT_NAMES.forEach((name, idx) => {
    const lm = landmarks[idx];
    if (lm) {
      joints[name] = { x: lm.x, y: lm.y, visibility: lm.visibility ?? 0.9 };
    }
  });
  return joints;
}

export function MotionLabView() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [exerciseId, setExerciseId] = useState<string>("squat");
  
  // Replay studio state
  const [frameIdx, setFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [favoriteReps, setFavoriteReps] = useState<number[]>([]);

  // Fatigue slider state
  const [fatigueLevel, setFatigueLevel] = useState<number>(0.2); // 0 (Fresh) to 1 (Exhausted)

  // Auto playback in Replay Studio
  const totalFrames = 30;
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % totalFrames);
    }, 100 / playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Simulated coordinate engine for replay studio
  const getReplaySkeleton = () => {
    const progress = frameIdx / totalFrames;
    const normalized = progress <= 0.5 ? progress * 2 : 2 - progress * 2;
    const exercise = getExercise(exerciseId);
    const poseFrame = snapshotPose(exercise, normalized);
    return poseFrameToJointMap(poseFrame.landmarks);
  };

  // Simulated coordinate engine for Fatigue Lab (Fresh vs Fatigued)
  const getFatiguedSkeleton = () => {
    const exercise = getExercise(exerciseId);
    const poseFrame = snapshotPose(exercise, 0.5); // Hold deepest position
    const joints = poseFrameToJointMap(poseFrame.landmarks);
    
    // Deform joints based on fatigueLevel
    if (exerciseId === "squat") {
      // Hips rise too fast, torso leans forward (spine y increases, neck x shifts)
      joints.spine = { ...joints.spine, y: joints.spine.y + fatigueLevel * 0.05 };
      joints.neck = { ...joints.neck, x: joints.neck.x - fatigueLevel * 0.04, y: joints.neck.y + fatigueLevel * 0.05 };
      // Knees cave inward (left/right knee x move closer)
      joints.leftKnee = { ...joints.leftKnee, x: joints.leftKnee.x + fatigueLevel * 0.04 };
      joints.rightKnee = { ...joints.rightKnee, x: joints.rightKnee.x - fatigueLevel * 0.04 };
    } else {
      // Press/Push-up: hips sag (spine y shifts down, left/right shoulder offsets show asymmetry)
      joints.spine = { ...joints.spine, y: joints.spine.y + fatigueLevel * 0.06 };
      joints.leftElbow = { ...joints.leftElbow, y: joints.leftElbow.y + fatigueLevel * 0.05 };
    }
    return joints;
  };

  const replaySkeleton = getReplaySkeleton();
  const fatiguedSkeleton = getFatiguedSkeleton();

  // Recharts radar scores
  const scoreData = [
    { subject: "Movement", A: 87, fullMark: 100 },
    { subject: "Technique", A: 88, fullMark: 100 },
    { subject: "Consistency", A: 90, fullMark: 100 },
    { subject: "Mobility", A: 78, fullMark: 100 },
    { subject: "Stability", A: 84, fullMark: 100 },
    { subject: "Balance", A: 92, fullMark: 100 },
  ];

  // Recharts line progress data
  const historyData = [
    { name: "Week 1", Squat: 82, Deadlift: 78, Bench: 80 },
    { name: "Week 2", Squat: 84, Deadlift: 80, Bench: 82 },
    { name: "Week 3", Squat: 85, Deadlift: 83, Bench: 85 },
    { name: "Week 4", Squat: 88, Deadlift: 86, Bench: 86 },
    { name: "Week 5", Squat: 86, Deadlift: 85, Bench: 88 },
    { name: "Week 6", Squat: 91, Deadlift: 92, Bench: 90 },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header and selector */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Activity className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Motion Laboratory</p>
            <h2 className="text-xl font-bold text-white">Movement Intelligence Lab</h2>
            <p className="text-xs text-white/50">Long-term biomechanical analytics, replays, and progress reports.</p>
          </div>
        </div>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white"
        >
          <option value="squat">Barbell Squat</option>
          <option value="push-up">Push-up</option>
          <option value="bench-press">Bench Press</option>
          <option value="deadlift">Deadlift</option>
          <option value="shoulder-press">Overhead Press</option>
          <option value="lunge">Lunge</option>
          <option value="pull-up">Pull-up</option>
          <option value="hip-thrust">Hip Thrust</option>
        </select>
      </GlassCard>

      {/* Tabs */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "dashboard", label: "Dashboard" },
          { id: "history", label: "Movement History" },
          { id: "studio", label: "Replay Studio" },
          { id: "heatmaps", label: "Quality Heatmaps" },
          { id: "coaching", label: "Coaching Lab" },
          { id: "reports", label: "Motion Reports" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as Tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === item.id
                ? "bg-[#adc6ff] text-[#131315]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </GlassCard>

      {/* Content tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {tab === "dashboard" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Main Scores Grid */}
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Movement Score", value: "87%", trend: "+3.4%" },
                    { label: "Technique Score", value: "88%", trend: "+2.1%" },
                    { label: "Consistency Score", value: "90%", trend: "+4.5%" },
                    { label: "Mobility Score", value: "78%", trend: "-1.2%" },
                    { label: "Stability Score", value: "84%", trend: "+2.8%" },
                    { label: "Balance Score", value: "92%", trend: "Stable" },
                  ].map((score) => (
                    <GlassCard key={score.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
                      <span className="text-[10px] text-white/40 uppercase font-semibold">{score.label}</span>
                      <span className="text-2xl font-black text-white mt-1 block">{score.value}</span>
                      <span className={`text-[9px] mt-1 block font-bold ${score.trend.startsWith("-") ? "text-rose-400" : "text-emerald-400"}`}>
                        {score.trend}
                      </span>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3">
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" /> AI Biomechanical Summary
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    💡 **Summary of observations**: Your movement efficiency remains strong at 87%. Stance adjustments during Squat sets have successfully improved lumbar extension by 12 degrees. However, ankle dorsiflexion restrictions are beginning to manifest as a minor inward knee collapse near the bottom phase (valgus) as training loads exceed 80% 1RM. Maintain dynamic flossing drills before loading sets.
                  </p>
                </GlassCard>
              </div>

              {/* Radar Profiles */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Movement Radar Profile</h4>
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scoreData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                      <Radar name="Form" dataKey="A" stroke="#adc6ff" fill="#adc6ff" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "history" && (
            <div className="space-y-6">
              {/* Trend Charts */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Long-term Movement History</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(20,20,22,0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                      />
                      <Line type="monotone" dataKey="Squat" stroke="#adc6ff" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Deadlift" stroke="#34d399" strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Bench" stroke="#f43f5e" strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Progress Log Table */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Technique Timeline Progress</h4>
                <div className="space-y-2.5">
                  {[
                    { date: "Yesterday", score: 91, comment: "Wide stance squat. Hips reached 92 degrees. Knees caved slightly on concentric drive." },
                    { date: "Last Week", score: 86, comment: "Narrow stance squat. Hips reached 108 degrees. Back caved forward at bottom." },
                    { date: "Last Month", score: 82, comment: "Standard stance squat. Heels lifted. High pressure on toes." },
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl text-xs">
                      <div>
                        <span className="font-bold text-white block">{row.date}</span>
                        <span className="text-white/40 text-[10px] block mt-0.5">{row.comment}</span>
                      </div>
                      <span className="font-black text-emerald-400">{row.score} pts</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "studio" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Studio Player */}
              <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)] min-h-[460px]">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-left">
                    <Film className="h-4.5 w-4.5 text-cyan-400" />
                    <div>
                      <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">AI Replay Studio</h3>
                      <p className="text-[10px] text-white/40">Frame {frameIdx + 1} • Dynamic Skeleton Analyzer</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (favoriteReps.includes(frameIdx)) {
                        setFavoriteReps(favoriteReps.filter((r) => r !== frameIdx));
                      } else {
                        setFavoriteReps([...favoriteReps, frameIdx]);
                      }
                    }}
                    className={`p-2 border rounded-xl transition ${
                      favoriteReps.includes(frameIdx)
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                        : "border-white/10 text-white/45"
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>

                {/* Video Playback Canvas */}
                <div className="my-6 relative aspect-video rounded-3xl border border-white/10 bg-[#08090c] overflow-hidden flex items-center justify-center">
                  <SkeletonOverlay
                    pose={replaySkeleton}
                    mirrored={false}
                    showAngles={true}
                    angles={{
                      kneeAngle: frameIdx * 3,
                      hipAngle: frameIdx * 2.5,
                      elbowAngle: frameIdx * 2.8,
                    }}
                  />
                  
                  {/* Annotations */}
                  {frameIdx > 12 && frameIdx < 18 && (
                    <div className="absolute top-10 right-10 bg-rose-500/90 text-white font-black text-[9px] px-2 py-0.5 rounded-full border border-rose-400 animate-pulse">
                      KNEE CAVE DETECTED
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 border border-white/5 rounded-2xl px-4 py-2 text-xs">
                    <span className="font-mono text-cyan-300 text-[10px]">
                      Frame {frameIdx + 1} / {totalFrames}
                    </span>
                    <div className="flex gap-2">
                      {[0.25, 0.5, 1.0].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-2 py-0.5 rounded font-black text-[9px] ${
                            playbackSpeed === speed ? "bg-cyan-400 text-[#131315]" : "text-white/40"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player controls */}
                <div className="flex items-center justify-center gap-4 border-t border-white/5 pt-4">
                  <button
                    onClick={() => { setIsPlaying(false); setFrameIdx((prev) => (prev - 1 + totalFrames) % totalFrames); }}
                    className="p-3 border border-white/10 hover:bg-white/5 rounded-2xl text-white/70"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-12 w-12 rounded-full bg-[#adc6ff] hover:brightness-110 text-[#131315] flex items-center justify-center shadow-lg transition"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => { setIsPlaying(false); setFrameIdx((prev) => (prev + 1) % totalFrames); }}
                    className="p-3 border border-white/10 hover:bg-white/5 rounded-2xl text-white/70"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </GlassCard>

              {/* Replay Studio Info */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Key Coaching Moments</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    ⚠️ **Knee valgus caving (Frame 14)**: Concentric transition shows knee translation of 4.2cm inward. Wide stance alignment recommended.
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    ✅ **Depth lockout (Frame 15)**: Clean vertical parallel reached at 92 degrees. Perfect hamstring loading.
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "heatmaps" && (
            <div className="space-y-6">
              {/* Heatmap Grids */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Joint Quality Grid */}
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Joint Technique Heatmap</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { joint: "Shoulders", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-400", desc: "Stable retraction" },
                      { joint: "Hip hinge", color: "bg-amber-500/20 border-amber-500/30 text-amber-400", desc: "Lumbar butt wink" },
                      { joint: "Knees path", color: "bg-rose-500/20 border-rose-500/30 text-rose-300", desc: "Inward valgus caving" },
                      { joint: "Ankles flexion", color: "bg-rose-500/20 border-rose-500/30 text-rose-300", desc: "Dorsiflexion restriction" },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border ${item.color}`}>
                        <p className="font-bold text-xs">{item.joint}</p>
                        <p className="text-[10px] mt-0.5 text-white/50">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Muscle Load grid */}
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Muscle Load Distribution</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { muscle: "Quadriceps", share: "52% load", color: "bg-[#adc6ff]/20 border-white/10 text-white" },
                      { muscle: "Gluteals", share: "28% load", color: "bg-[#adc6ff]/20 border-white/10 text-white" },
                      { muscle: "Erectors (Lower back)", share: "12% load", color: "bg-amber-500/10 border-amber-500/25 text-amber-400" },
                      { muscle: "Hamstrings", share: "8% load", color: "bg-white/5 border-transparent text-white/50" },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-2xl border ${item.color} flex justify-between items-center text-xs`}>
                        <span className="font-bold">{item.muscle}</span>
                        <span className="font-black text-[10px]">{item.share}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {tab === "coaching" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Fatigue slider comparing fresh vs fatigue */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left min-h-[440px] flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="h-4.5 w-4.5 text-[#adc6ff]" /> Fatigue Movement Simulator
                  </h4>
                  <p className="text-[10px] text-white/40 mt-1">
                    Drag the slider to see estimated alignment deviations as neuromuscular fatigue sets in.
                  </p>
                </div>

                <div className="my-6 aspect-video rounded-3xl border border-white/10 bg-[#08090c] overflow-hidden relative flex items-center justify-center p-4">
                  <SkeletonOverlay
                    pose={fatiguedSkeleton}
                    mirrored={false}
                    showAngles={true}
                    angles={exerciseId === "squat"
                      ? { kneeAngle: 92 + fatigueLevel * 20, hipAngle: 75 + fatigueLevel * 22, torso: fatigueLevel * 30 }
                      : { elbowAngle: 70 + fatigueLevel * 25, torso: fatigueLevel * 15 }
                    }
                    className={fatigueLevel > 0.6 ? "text-rose-400" : fatigueLevel > 0.3 ? "text-amber-400" : "text-cyan-400"}
                  />
                  <div className="absolute top-4 left-4 rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase text-white bg-black/60 border border-white/15">
                    {fatigueLevel > 0.6 ? "🔥 Neuromuscular Breakdown" : fatigueLevel > 0.3 ? "⚡ Compensating Form" : "✨ High Efficiency"}
                  </div>
                </div>

                <label className="block space-y-1.5 border-t border-white/5 pt-4">
                  <div className="flex justify-between text-xs font-bold text-white/70">
                    <span>Simulated Fatigue Level</span>
                    <span>{Math.round(fatigueLevel * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={fatigueLevel}
                    onChange={(e) => setFatigueLevel(parseFloat(e.target.value))}
                    className="w-full accent-rose-400 bg-white/10 rounded-full h-1"
                  />
                </label>
              </GlassCard>

              {/* Priorities list */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left flex flex-col justify-between">
                <div className="space-y-3.5">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Brain className="h-4.5 w-4.5 text-yellow-400" /> AI Coaching Priorities
                  </h4>
                  
                  <div className="space-y-3 text-xs text-white/70">
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1">
                      <p className="font-bold text-rose-300">1. Wider Squat Stance (Top Priority)</p>
                      <p className="text-[10px] leading-relaxed text-white/60">
                        Widening heels by 3-5cm allows hip crease transit below parallel without lumbar flexion caving.
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                      <p className="font-bold text-white">2. Pre-workout Ankle Flossing</p>
                      <p className="text-[10px] leading-relaxed text-white/60">
                        Increases dorsiflexion rom to prevent heel lifting under heavy load sets.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl p-3 text-[10px] text-white/60">
                  💪 **Expected Improvement**: Wide stance squat implementation is estimated to boost overall form score to 94% in 14 days (Confidence: 89%).
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "reports" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Weekly Report */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-4.5 w-4.5 text-[#adc6ff]" /> Weekly Motion Report
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Period:</span>
                    <span className="font-bold text-white">July 06 - July 12</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Avg Form Score:</span>
                    <span className="font-bold text-emerald-400">88%</span>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-3 space-y-1.5 text-white/70">
                    <p className="font-bold text-white">Key Technique shift:</p>
                    <p className="leading-relaxed text-white/50 text-[10.5px]">
                      &quot;Stance alterations successfully decreased hip butt-wink deflection from 22 degrees to 8 degrees. Eccentric speed remained solid (2.4s lowering).&quot;
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Monthly Report */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="h-4.5 w-4.5 text-cyan-400" /> Monthly Motion Report
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Period:</span>
                    <span className="font-bold text-white">June 2026 - July 2026</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-white/40">Efficiency Score:</span>
                    <span className="font-bold text-emerald-400">87%</span>
                  </div>

                  <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl p-3 space-y-1.5 text-white/70">
                    <p className="font-bold text-[#adc6ff]">AI Insights (Confidence: 94%):</p>
                    <p className="leading-relaxed text-white/50 text-[10.5px]">
                      &quot;Long-term squats records reveal range of motion increased by 18% over the past 30 days. Core stiffness has successfully stabilized lateral torso sway during push-up sets.&quot;
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
