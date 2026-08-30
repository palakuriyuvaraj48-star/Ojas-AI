"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Expand,
  Shrink,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Settings2,
  SwitchCamera,
  VideoOff,
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { CameraMode, CameraPreferences } from "@/lib/vision";
import type { RefObject } from "react";
import { SkeletonOverlay } from "./skeleton-overlay";

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: "idle" | "live" | "paused" | "error";
  error: string;
  start: () => void;
  stop: () => void;
  togglePause: () => void;
  switchCamera: () => void;
  preferences: CameraPreferences;
  setPreferences: (p: CameraPreferences) => void;
  devices: MediaDeviceInfo[];
  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
  showSkeleton: boolean;
  setShowSkeleton: (v: boolean) => void;
  showAngles: boolean;
  setShowAngles: (v: boolean) => void;
  mode: CameraMode;
  setMode: (m: CameraMode) => void;
  liveReady: boolean;
  fps: number;
  exerciseName: string;
  pose: any;
  angles: Record<string, number>;
  landmarksVisible?: boolean;
  movementPhase?: string;
  activeCue?: string;
  faultJoints?: string[];
  primaryJoint?: string;
  targetAngle?: number;
}

const RESOLUTIONS = [
  { label: "1280 × 720 (HD)", w: 1280, h: 720 },
  { label: "1920 × 1080 (FHD)", w: 1920, h: 1080 },
  { label: "640 × 480 (SD)", w: 640, h: 480 },
];

export function CameraStage(props: Props) {
  const {
    videoRef,
    status,
    error,
    start,
    stop,
    togglePause,
    switchCamera,
    preferences,
    setPreferences,
    devices,
    fullscreen,
    setFullscreen,
    showSkeleton,
    setShowSkeleton,
    showAngles,
    setShowAngles,
    mode,
    setMode,
    liveReady,
    fps,
    pose,
    angles,
    landmarksVisible = true,
    movementPhase = "ready",
    activeCue,
    faultJoints = [],
    primaryJoint = "kneeAngle",
    targetAngle = 95,
  } = props;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasVideo = status === "live" || status === "paused";

  return (
    <GlassCard className="space-y-4 text-left">
      {/* Camera Stage Container */}
      <div
        className={`relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#08090c] ${
          fullscreen ? "fixed inset-4 z-50 aspect-auto shadow-2xl" : ""
        }`}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            preferences.mirrored ? "-scale-x-100" : ""
          } ${hasVideo ? "opacity-100" : "opacity-0"}`}
        />

        {/* Camera Inactive State & Permission Flow */}
        {!hasVideo && (
          <div className="absolute inset-0 grid place-items-center text-center p-6 bg-[radial-gradient(ellipse_at_center,_rgba(173,198,255,0.06),_transparent_70%)]">
            <div className="max-w-md space-y-4">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-[#adc6ff]">
                <Camera className="h-8 w-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">AI Vision Pose Setup</h3>
                <p className="mt-1 text-xs text-white/50 leading-relaxed">
                  Start your camera to analyze exercise biomechanics, count real reps, and receive instant posture corrections.
                </p>
              </div>

              {/* Camera Calibration Checklist */}
              <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5 text-xs text-left space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  Pre-Workout Camera Checks:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Full body in frame
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Good front lighting
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 6–8 ft distance
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Camera stationary
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  onClick={start}
                  className="rounded-xl bg-[#adc6ff] px-6 py-3 text-xs font-bold text-[#131315] hover:brightness-110 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                >
                  <Camera className="h-4 w-4 fill-current" />
                  Start Live Camera
                </button>
              </div>

              {status === "error" && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-950/60 p-3 text-left text-xs text-rose-100 flex items-start gap-2">
                  <VideoOff className="h-4 w-4 shrink-0 mt-0.5 text-rose-300" />
                  <div>
                    <p className="font-semibold">{error}</p>
                    <button onClick={start} className="mt-1 font-bold text-[#adc6ff] underline block">
                      Retry camera connection
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Camera Overlays */}
        {hasVideo && (
          <>
            {/* Guide Silhouette Frame */}
            <div className="pointer-events-none absolute inset-[6%_20%] rounded-[30%] border-2 border-dashed border-cyan-300/40 animate-pulse" />

            {/* Skeleton Mesh Overlay with Red Form Correction */}
            {showSkeleton && (
              <SkeletonOverlay
                pose={pose}
                mirrored={preferences.mirrored}
                showAngles={showAngles}
                angles={angles}
                faultJoints={faultJoints}
                primaryJoint={primaryJoint}
                targetAngle={targetAngle}
                activeCue={activeCue}
              />
            )}

            {/* Top Left Status Badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <div className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-cyan-300 border border-white/10 flex items-center gap-1.5">
                <ScanLine className="h-3 w-3" />
                POSE TRACKING
              </div>

              <div className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase text-white border border-white/10">
                {movementPhase}
              </div>
            </div>

            {/* Top Right Specs */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <div className="rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-white/80 border border-white/10">
                {fps} FPS
              </div>
            </div>

            {/* Live On-Screen Cue HUD Banner */}
            <div className="absolute bottom-16 left-4 right-4 pointer-events-none flex justify-center">
              <motion.div
                key={activeCue || movementPhase}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-black/80 backdrop-blur-md border border-cyan-400/40 px-4 py-1.5 rounded-full text-xs font-bold text-cyan-200 shadow-xl"
              >
                {activeCue || (movementPhase === "bottom" ? "✓ GOOD DEPTH" : movementPhase === "descending" ? "DESCENDING..." : "READY")}
              </motion.div>
            </div>

            {/* Low Visibility Guidance Alert */}
            {!landmarksVisible && (
              <div className="absolute top-14 left-4 right-4 z-10 flex justify-center">
                <div className="bg-amber-950/90 border border-amber-500/40 text-amber-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Step back slightly so your full body is visible in the frame.</span>
                </div>
              </div>
            )}

            {/* Bottom Engine Tag */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold border border-white/10">
              <span className="flex items-center gap-1 text-emerald-300">
                <Cpu className="h-3 w-3" />
                MediaPipe Vision
              </span>
            </div>
          </>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs">
        <div className="flex items-center gap-2">
          {hasVideo ? (
            <>
              <button
                onClick={togglePause}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold text-white hover:bg-white/10 transition"
              >
                {status === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                onClick={switchCamera}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold text-white hover:bg-white/10 transition"
                title="Switch front/back camera"
              >
                <SwitchCamera className="h-4 w-4" />
              </button>
              <button
                onClick={stop}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-bold text-rose-300 hover:bg-rose-500/20 transition"
              >
                <VideoOff className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={start}
              className="rounded-xl bg-[#adc6ff] px-4 py-2 font-bold text-[#131315] hover:brightness-110 transition flex items-center gap-1.5"
            >
              <Camera className="h-4 w-4 fill-current" />
              Start Camera
            </button>
          )}

          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`rounded-xl border px-3 py-2 font-bold transition ${
              showSkeleton ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/50"
            }`}
          >
            Skeleton: {showSkeleton ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setShowAngles(!showAngles)}
            className={`rounded-xl border px-3 py-2 font-bold transition ${
              showAngles ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300" : "border-white/10 text-white/50"
            }`}
          >
            Angles: {showAngles ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-bold text-white hover:bg-white/10 transition"
          >
            {fullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
