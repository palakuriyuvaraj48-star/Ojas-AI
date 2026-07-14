"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera, Expand, Shrink, Mic, MicOff, Pause, Play, RotateCcw, ScanLine, Settings2,
  SwitchCamera, VideoOff, Cpu, Sparkles, ShieldCheck,
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
}

const RESOLUTIONS = [
  { label: "1280 × 720", w: 1280, h: 720 },
  { label: "1920 × 1080", w: 1920, h: 1080 },
  { label: "640 × 480", w: 640, h: 480 },
];

export function CameraStage(props: Props) {
  const {
    videoRef, status, error, start, stop, togglePause, switchCamera, preferences, setPreferences,
    devices, fullscreen, setFullscreen, showSkeleton, setShowSkeleton, showAngles, setShowAngles,
    mode, setMode, liveReady, fps, pose, angles,
  } = props;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasVideo = status === "live" || status === "paused";

  return (
    <GlassCard className="space-y-4">
      <div className={`relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#08090c] ${fullscreen ? "fixed inset-4 z-50 aspect-auto" : ""}`}>
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${preferences.mirrored ? "-scale-x-100" : ""} ${hasVideo ? "opacity-100" : "opacity-0"}`}
        />

        {!hasVideo && (
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <Camera className="mx-auto h-10 w-10 text-[#adc6ff]" />
              <p className="mt-3 font-semibold text-white">Ready when you are</p>
              <p className="mt-1 text-xs text-white/45">Start the camera to grant permission.</p>
              {status === "error" && (
                <div className="mx-auto mt-4 max-w-md rounded-xl border border-rose-400/30 bg-rose-950/60 p-3 text-left text-xs text-rose-100">
                  <VideoOff className="mr-1 inline h-4 w-4" />
                  {error}
                  <button onClick={start} className="ml-2 font-bold text-[#adc6ff] underline">Try again</button>
                </div>
              )}
            </div>
          </div>
        )}

        {hasVideo && (
          <>
            <div className="pointer-events-none absolute inset-[8%_22%] rounded-[35%] border-2 border-dashed border-cyan-300/60" />
            {showSkeleton && <SkeletonOverlay pose={pose} mirrored={preferences.mirrored} showAngles={showAngles} angles={angles} />}
            <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
              <ScanLine className="mr-1 inline h-3 w-3" />POSE PIPELINE ACTIVE
            </div>
            <div className="absolute right-4 top-4 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white">
              {fps} FPS · {preferences.width}×{preferences.height}
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold">
              {mode === "live" && liveReady ? (
                <span className="flex items-center gap-1 text-emerald-300"><Cpu className="h-3 w-3" />MEDIAPIPE LIVE</span>
              ) : (
                <span className="flex items-center gap-1 text-[#adc6ff]"><Sparkles className="h-3 w-3" />SIM ENGINE</span>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="absolute bottom-4 right-4 rounded-lg bg-black/60 p-2 text-white"
          aria-label="Toggle fullscreen"
        >
          {fullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`text-xs font-semibold ${status === "live" ? "text-emerald-300" : status === "paused" ? "text-amber-200" : "text-white/50"}`}>
          ● {status === "live" ? "Camera live" : status === "paused" ? "Camera paused" : "Camera off"}
        </span>
        <div className="flex flex-wrap gap-2">
          <button onClick={start} disabled={hasVideo} className="rounded-xl bg-[#adc6ff] px-4 py-2.5 text-xs font-bold text-[#131315] disabled:opacity-50">
            <Camera className="mr-1 inline h-4 w-4" />Start camera
          </button>
          <button onClick={stop} disabled={!hasVideo} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            Stop camera
          </button>
          <button onClick={togglePause} disabled={!hasVideo} className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">
            {status === "paused" ? <Play className="mr-1 inline h-4 w-4" /> : <Pause className="mr-1 inline h-4 w-4" />}
            {status === "paused" ? "Resume" : "Pause"}
          </button>
          <button onClick={switchCamera} disabled={!hasVideo} className="rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">
            <SwitchCamera className="mr-1 inline h-4 w-4" />Switch
          </button>
          <button onClick={() => setSettingsOpen((v) => !v)} className="rounded-xl border border-white/10 p-2.5 text-white/70">
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-3">
          <label className="text-xs text-white/60">
            Camera
            <select
              value={preferences.facingMode}
              onChange={(e) => setPreferences({ ...preferences, facingMode: e.target.value as "user" | "environment" })}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/30 p-2 text-white"
            >
              <option value="user">Front (selfie)</option>
              <option value="environment">Rear</option>
            </select>
          </label>
          <label className="text-xs text-white/60">
            Device
            <select
              value={preferences.deviceId ?? ""}
              onChange={(e) => setPreferences({ ...preferences, deviceId: e.target.value || undefined })}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/30 p-2 text-white"
            >
              <option value="">Automatic</option>
              {devices.map((d, i) => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${i + 1}`}</option>)}
            </select>
          </label>
          <label className="text-xs text-white/60">
            Resolution
            <select
              value={`${preferences.width}x${preferences.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split("x").map(Number);
                setPreferences({ ...preferences, width: w, height: h });
              }}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/30 p-2 text-white"
            >
              {RESOLUTIONS.map((r) => <option key={r.label} value={`${r.w}x${r.h}`}>{r.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-white/60">
            Target FPS
            <select
              value={preferences.frameRate}
              onChange={(e) => setPreferences({ ...preferences, frameRate: Number(e.target.value) })}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/30 p-2 text-white"
            >
              <option value={30}>30 FPS</option>
              <option value={24}>24 FPS</option>
              <option value={15}>15 FPS</option>
            </select>
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-xs text-white/60">Pose source</span>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              <button onClick={() => setMode("simulation")} className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${mode === "simulation" ? "bg-[#adc6ff]/20 text-[#adc6ff]" : "text-white/50"}`}>
                <Sparkles className="mr-1 inline h-3 w-3" />Simulation
              </button>
              <button onClick={() => setMode("live")} className={`flex-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold ${mode === "live" ? "bg-emerald-400/20 text-emerald-300" : "text-white/50"}`}>
                <Cpu className="mr-1 inline h-3 w-3" />MediaPipe Live
              </button>
            </div>
            {mode === "live" && !liveReady && (
              <span className="text-[10px] text-amber-300/80">Loading model… falls back to simulation if unavailable.</span>
            )}
          </div>
          <div className="flex flex-col gap-2 text-xs text-white/60">
            <span>Overlays</span>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showSkeleton} onChange={(e) => setShowSkeleton(e.target.checked)} /> Skeleton</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showAngles} onChange={(e) => setShowAngles(e.target.checked)} /> Joint angles</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={preferences.mirrored} onChange={(e) => setPreferences({ ...preferences, mirrored: e.target.checked })} /> Mirror</label>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-white/40">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Frames are processed on-device. Nothing is uploaded automatically.
      </div>
    </GlassCard>
  );
}
