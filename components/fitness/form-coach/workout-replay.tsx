"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Star,
  Film,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { SkeletonOverlay } from "./skeleton-overlay";
import type { CameraSessionRecord, JointMap, JointName } from "@/lib/vision/types";
import { snapshotPose, getExercise } from "@/lib/vision";

interface Props {
  sessions: CameraSessionRecord[];
}

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

export function WorkoutReplay({ sessions }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedRepIndex, setSelectedRepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.25, 0.5, 1.0
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);
  const [favoriteReps, setFavoriteReps] = useState<string[]>([]); // Bookmarked rep keys

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // Total frames in simulated rep animation loop
  const totalFrames = 30;

  // Frame simulation loop based on exercise archetype
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = (100 / playbackSpeed); // baseline speed
    const timer = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % totalFrames);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  if (!activeSession) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40 text-xs">
        No sessions recorded. Complete a workout session in the Live Coach to generate replay analytics.
      </div>
    );
  }

  // Generate joint landmarks dynamically for the replay based on currentFrameIdx
  const getSimulatedJointMap = () => {
    const progress = currentFrameIdx / totalFrames;
    const normalized = progress <= 0.5 ? progress * 2 : 2 - progress * 2;
    
    const exerciseNameLower = activeSession.exercise.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const activeExId = exerciseNameLower.includes("squat") ? "squat" : "press";
    const exercise = getExercise(activeExId);
    
    const poseFrame = snapshotPose(exercise, normalized);
    return poseFrameToJointMap(poseFrame.landmarks);
  };

  const currentJoints = getSimulatedJointMap();

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentFrameIdx((prev) => (prev + 1) % totalFrames);
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentFrameIdx((prev) => (prev - 1 + totalFrames) % totalFrames);
  };

  const repKey = `${selectedSessionId}_rep_${selectedRepIndex}`;
  const isBookmarked = favoriteReps.includes(repKey);

  const toggleBookmark = () => {
    if (isBookmarked) {
      setFavoriteReps(favoriteReps.filter((r) => r !== repKey));
    } else {
      setFavoriteReps([...favoriteReps, repKey]);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      {/* Visual Replay Canvas */}
      <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)] min-h-[460px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-left">
            <Film className="h-4.5 w-4.5 text-cyan-400" />
            <div>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">
                {activeSession.exercise} Replay Analyzer
              </h3>
              <p className="text-[10px] text-white/40">Set {selectedRepIndex + 1} • Rep {selectedRepIndex + 1}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.15))}
              className="p-2 border border-white/10 rounded-xl text-white/60 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomScale((z) => Math.max(1.0, z - 0.15))}
              className="p-2 border border-white/10 rounded-xl text-white/60 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={toggleBookmark}
              className={`p-2 border rounded-xl transition ${
                isBookmarked
                  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  : "border-white/10 text-white/40 hover:text-white"
              }`}
              title="Bookmark favorite rep"
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Dynamic Skeleton Player Screen */}
        <div className="my-6 relative aspect-video rounded-3xl border border-white/10 bg-[#08090c] overflow-hidden flex items-center justify-center">
          <div 
            className="w-full h-full relative transition-transform duration-300"
            style={{ transform: `scale(${zoomScale})` }}
          >
            {/* Real dynamic skeleton lines overlay */}
            <SkeletonOverlay
              pose={currentJoints}
              mirrored={false}
              showAngles={true}
              angles={{
                kneeAngle: currentFrameIdx * 3,
                hipAngle: currentFrameIdx * 2.5,
                elbowAngle: currentFrameIdx * 2.8,
              }}
            />
          </div>

          {/* Controls HUD */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 border border-white/5 rounded-2xl px-4 py-2 text-xs">
            <span className="font-mono text-cyan-300 text-[10px]">
              Frame {currentFrameIdx + 1} / {totalFrames}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPlaybackSpeed(0.25)}
                className={`px-2 py-0.5 rounded font-black text-[9px] ${
                  playbackSpeed === 0.25 ? "bg-cyan-400 text-[#131315]" : "text-white/40"
                }`}
              >
                0.25x
              </button>
              <button
                onClick={() => setPlaybackSpeed(0.5)}
                className={`px-2 py-0.5 rounded font-black text-[9px] ${
                  playbackSpeed === 0.5 ? "bg-cyan-400 text-[#131315]" : "text-white/40"
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => setPlaybackSpeed(1.0)}
                className={`px-2 py-0.5 rounded font-black text-[9px] ${
                  playbackSpeed === 1.0 ? "bg-cyan-400 text-[#131315]" : "text-white/40"
                }`}
              >
                1x
              </button>
            </div>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex items-center justify-center gap-4 border-t border-white/5 pt-4">
          <button
            onClick={handleStepBackward}
            className="p-3 border border-white/10 hover:bg-white/5 rounded-2xl text-white/70"
            title="Step Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-12 w-12 rounded-full bg-[#adc6ff] hover:brightness-110 text-[#131315] flex items-center justify-center shadow-lg transition"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleStepForward}
            className="p-3 border border-white/10 hover:bg-white/5 rounded-2xl text-white/70"
            title="Step Forward"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </GlassCard>

      {/* Sessions & Rep Selector Column */}
      <div className="space-y-6 text-left">
        {/* Select Session */}
        <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Select Session</h4>
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setSelectedRepIndex(0);
              setCurrentFrameIdx(0);
            }}
            className="w-full bg-black/40 border border-white/15 rounded-2xl p-3 text-xs text-white"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.exercise} set — {new Date(s.startedAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </GlassCard>

        {/* Rep details list */}
        <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] max-h-[300px] overflow-y-auto">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" /> AI Replay Analysis
          </h4>
          <div className="space-y-2">
            {Array.from({ length: Math.min(8, activeSession.reps || 5) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedRepIndex(idx);
                  setCurrentFrameIdx(0);
                }}
                className={`w-full flex justify-between items-center rounded-2xl p-3 text-xs border transition ${
                  selectedRepIndex === idx
                    ? "bg-[#adc6ff]/15 border-white/15 text-white"
                    : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                }`}
              >
                <div>
                  <p className="font-bold">Repetition {idx + 1}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Tempo: 2.1s / 1.0s / 1.5s</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-400">{(88 - idx * 2)} pts</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
