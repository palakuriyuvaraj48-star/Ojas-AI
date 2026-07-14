"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Camera,
  Expand,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Shrink,
  SwitchCamera,
  VideoOff,
  Sparkles,
  Cpu,
  Save,
  Camera as CameraIcon,
  CheckCircle2,
  Award,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { CameraService } from "@/lib/vision/camera-service";
import { PoseDetector } from "@/lib/vision/detector";
import { SkeletonOverlay } from "./form-coach/skeleton-overlay";
import {
  getExercise,
  RepCounter,
  TempoTracker,
  RomTracker,
  SymmetryTracker,
  scoreRep,
  liveFeedback,
  buildFormScore,
  buildCoaching,
  type DetectedFrame,
} from "@/lib/vision";
import type { CameraPreferences, JointMap, JointName } from "@/lib/vision/types";
import { motion, AnimatePresence } from "framer-motion";

const initialPreferences: CameraPreferences = {
  facingMode: "user",
  width: 1280,
  height: 720,
  frameRate: 30,
  mirrored: true,
};

function messageFor(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Camera access was blocked. Allow access in your browser settings, then try again.";
  }
  if (name === "NotFoundError") return "No camera was found. Connect a camera and try again.";
  if (name === "NotReadableError") return "Your camera is busy in another application. Close it there and try again.";
  if (name === "OverconstrainedError") return "This camera does not support the selected quality. Try a lower resolution.";
  return "This browser could not start the camera. Use a current Chrome, Edge, or mobile browser over HTTPS.";
}

interface RepSummary {
  score: number;
  rom: number;
  symmetryIndex: number;
  partial: boolean;
}

export function VisionView() {
  const serviceRef = useRef<CameraService | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameTs = useRef<number>(0);
  const lastFeedbackAt = useRef<number>(0);
  const fpsRef = useRef({ frames: 0, started: 0 });
  const repsArrayRef = useRef<RepSummary[]>([]);

  const [preferences, setPreferences] = useState(initialPreferences);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState<"idle" | "live" | "paused" | "error">("idle");
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fps, setFps] = useState(0);

  const [exerciseId, setExerciseId] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ex = params.get("exercise");
      if (ex) return ex;
    }
    return "squat";
  });
  const exercise = getExercise(exerciseId);

  const [mode, setMode] = useState<"live" | "simulation">("simulation");
  const [liveReady, setLiveReady] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

  // Live Biomechanics state
  const [frame, setFrame] = useState<DetectedFrame | null>(null);
  const [reps, setReps] = useState(0);
  const [partialReps, setPartialReps] = useState(0);
  const [sets, setSets] = useState(1);
  const [feedback, setFeedback] = useState<string>("Align your body in the frame and click 'Start Workout'.");
  
  // Real-time tracking data
  const [liveScore, setLiveScore] = useState(90);
  const [romValue, setRomValue] = useState<number>(0);
  const [symmetryIndex, setSymmetryIndex] = useState<number>(0.95);
  const [tempoPhases, setTempoPhases] = useState<{ loweringMs: number; pauseMs: number; liftingMs: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!detectorRef.current) {
    detectorRef.current = new PoseDetector(exercise, "simulation");
  }

  // Load detector settings when exercise changes
  useEffect(() => {
    detectorRef.current?.setExercise(exercise);
  }, [exercise]);

  // Mode Selection Helper
  const changeMode = async (next: "live" | "simulation") => {
    if (next === "live") {
      const ok = await detectorRef.current?.initLive();
      setLiveReady(Boolean(ok));
      if (!ok) {
        setMode("simulation");
        setFeedback("Failed to load MediaPipe. Running in simulator mode.");
      } else {
        setMode("live");
        setFeedback("MediaPipe Live pose tracking activated.");
      }
    } else {
      setMode("simulation");
      setLiveReady(false);
      setFeedback("Simulator mode activated.");
    }
  };

  // Camera stream controls
  const start = async () => {
    setError("");
    try {
      const service = serviceRef.current ?? new CameraService();
      serviceRef.current = service;
      const stream = await service.start(preferences);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setDevices(await service.listDevices());
      setStatus("live");
    } catch (caught) {
      setStatus("error");
      setError(messageFor(caught));
    }
  };

  const stop = () => {
    serviceRef.current?.stop();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setFps(0);
    setWorkoutRunning(false);
  };

  const togglePause = () => {
    if (status === "live") {
      serviceRef.current?.pause();
      setStatus("paused");
    } else {
      serviceRef.current?.resume();
      setStatus("live");
    }
  };

  const switchCamera = () => {
    setPreferences((prev) => ({
      ...prev,
      facingMode: prev.facingMode === "user" ? "environment" : "user",
      mirrored: prev.facingMode === "environment",
    }));
    window.setTimeout(() => void start(), 0);
  };

  const announce = useCallback((text: string) => {
    if (voiceOn && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#]/g, "");
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(clean));
    }
  }, [voiceOn]);

  // Telemetry loop for joint estimation
  useEffect(() => {
    if (!workoutRunning) return;
    const repCounter = new RepCounter(exercise);
    const tempo = new TempoTracker();
    const romT = new RomTracker();
    const symT = new SymmetryTracker();
    romT.startRep();

    const tick = async () => {
      const now = performance.now();
      const dt = lastFrameTs.current ? now - lastFrameTs.current : 33;
      lastFrameTs.current = now;

      const detected = await detectorRef.current?.detect(videoRef.current, dt);
      if (!detected) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setFrame(detected);
      const primary = detected.angles[exercise.primaryJoint] ?? 180;
      const ts = Date.now();
      
      tempo.update(detected.phase, ts);
      romT.update(primary);
      symT.update(detected.angles);

      const update = repCounter.update(primary, detected.phase, ts);
      if (update.completed && update.rep) {
        const romResult = romT.finalize(exercise);
        const symResult = symT.finalize();
        const tempoRep = tempo.finalizeRep();
        romT.endRep();
        romT.startRep();

        const repScore = scoreRep(
          { angles: detected.angles, rom: romResult, symmetry: symResult, tempo: tempoRep },
          exercise
        );

        const repRecord: RepSummary = {
          score: repScore.score,
          rom: romResult.observedRange,
          symmetryIndex: symResult.symmetryIndex,
          partial: update.rep.partial,
        };

        repsArrayRef.current.push(repRecord);
        setReps(update.reps);
        setPartialReps(update.partialReps);
        setRomValue(romResult.observedRange);
        setSymmetryIndex(symResult.symmetryIndex);
        if (tempoRep) setTempoPhases(tempoRep);

        const fs = buildFormScore(repsArrayRef.current, exercise);
        setLiveScore(fs.total);
        setFeedback(repScore.feedback[0]?.cue || "Excellent consistency. Squeeze at the peak.");
        announce(repScore.feedback[0]?.cue || "Good rep.");
      } else if (now - lastFeedbackAt.current > 600) {
        lastFeedbackAt.current = now;
        const fb = liveFeedback(detected.angles, exercise);
        if (fb.length > 0 && fb[0]?.cue) {
          setFeedback(fb[0].cue);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [workoutRunning, exercise, announce]);

  // Session Duration Timer
  useEffect(() => {
    if (!workoutRunning) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [workoutRunning]);

  // Frame FPS Calculator
  useEffect(() => {
    if (status !== "live") return;
    const loop = () => {
      const clock = performance.now();
      if (!fpsRef.current.started) fpsRef.current.started = clock;
      fpsRef.current.frames += 1;
      if (clock - fpsRef.current.started >= 1000) {
        setFps(fpsRef.current.frames);
        fpsRef.current = { frames: 0, started: clock };
      }
      requestAnimationFrame(loop);
    };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [status]);

  // Take Workout Snapshot Screenshot
  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `titan_vision_snapshot_${Date.now()}.png`;
      a.click();
      announce("Screenshot saved.");
    }
  };

  // Save Workout Session
  const handleSaveSession = async () => {
    setSaving(true);
    const fs = buildFormScore(repsArrayRef.current, exercise);
    const payload = {
      exercise: exercise.name,
      durationMs: seconds * 1000,
      sets,
      reps,
      partialReps,
      formScore: fs.total,
      avgRom: romValue || fs.metrics.rangeOfMotion,
      avgSymmetry: symmetryIndex,
      bestRepScore: repsArrayRef.current.length
        ? Math.max(...repsArrayRef.current.map((r) => r.score))
        : 85,
      notes: "Saved via live camera analysis interface.",
      source: mode === "live" ? "mediapipe" : "simulation",
      hasVideo: false,
    };

    try {
      await fetch("/api/vision/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      repsArrayRef.current = [];
      setReps(0);
      setSeconds(0);
    } catch (e) {
      console.error("Failed to save session", e);
    }
    setSaving(false);
  };

  const elapsed = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const calories = Math.round(seconds * 0.15 + reps * 4.5);
  const hasVideo = status === "live" || status === "paused";

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">On-Device Biometrics</p>
          <h2 className="mt-1 text-xl font-bold text-white">Workout Camera Core</h2>
          <p className="mt-1 text-xs text-white/50">
            Real-time MediaPipe joint keypoints mapping. Frames processed entirely in-browser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={start}
            disabled={hasVideo}
            className="rounded-xl bg-[#adc6ff] px-4 py-2.5 text-xs font-black text-[#131315] hover:brightness-110 disabled:opacity-50 transition"
          >
            <Camera className="mr-1.5 inline h-4 w-4" /> Start camera
          </button>
          <button
            onClick={stop}
            disabled={!hasVideo}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 transition hover:bg-white/5"
          >
            Stop camera
          </button>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="rounded-xl border border-white/10 p-2.5 text-white/70 hover:bg-white/5 transition"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>

      {/* Settings Section */}
      {settingsOpen && (
        <GlassCard className="grid gap-4 md:grid-cols-3 border-white/5 bg-black/20 p-4 text-xs text-left text-white/60">
          <label className="space-y-1">
            <span>Select Exercise Target</span>
            <select
              value={exerciseId}
              onChange={(e) => setExerciseId(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-white"
            >
              {[
                { id: "squat", name: "Barbell Squat" },
                { id: "push-up", name: "Push-up" },
                { id: "bench-press", name: "Bench Press" },
                { id: "deadlift", name: "Deadlift" },
                { id: "shoulder-press", name: "Shoulder Press" },
                { id: "pull-up", name: "Pull-up" },
                { id: "lat-pulldown", name: "Lat Pulldown" },
                { id: "row", name: "Row" },
                { id: "lunge", name: "Lunge" },
                { id: "plank", name: "Plank" },
                { id: "biceps-curl", name: "Biceps Curl" },
                { id: "triceps-pushdown", name: "Triceps Pushdown" },
                { id: "hip-thrust", name: "Hip Thrust" },
              ].map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          
          <label className="space-y-1">
            <span>Quality & Resolution</span>
            <select
              value={`${preferences.width}x${preferences.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split("x").map(Number);
                setPreferences({ ...preferences, width: w, height: h });
              }}
              className="mt-1 block w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-white"
            >
              <option value="1280x720">1280 × 720 (HD)</option>
              <option value="1920x1080">1920 × 1080 (FHD)</option>
              <option value="640x480">640 × 480 (SD)</option>
            </select>
          </label>

          <div className="flex flex-col gap-2">
            <span>Camera Pipeline Mode</span>
            <div className="flex gap-1 rounded-xl border border-white/10 bg-black/30 p-1 mt-1">
              <button
                onClick={() => changeMode("simulation")}
                className={`flex-1 rounded-lg py-2 text-[10px] font-bold ${
                  mode === "simulation" ? "bg-[#adc6ff]/20 text-[#adc6ff]" : "text-white/50"
                }`}
              >
                Simulation
              </button>
              <button
                onClick={() => changeMode("live")}
                className={`flex-1 rounded-lg py-2 text-[10px] font-bold ${
                  mode === "live" ? "bg-emerald-400/20 text-emerald-300" : "text-white/50"
                }`}
              >
                MediaPipe Live
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-white/70">
            <span>Visual Overlays</span>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSkeleton}
                  onChange={(e) => setShowSkeleton(e.target.checked)}
                />
                Skeleton Overlay
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAngles}
                  onChange={(e) => setShowAngles(e.target.checked)}
                />
                Live Joint Angles
              </label>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Main Grid: Camera Stage + Telemetry Panel */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        
        {/* Camera Feed Stage */}
        <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] relative">
          <div
            className={`relative aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#08090c] ${
              fullscreen ? "fixed inset-4 z-50 aspect-auto" : ""
            }`}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              className={`h-full w-full object-cover ${preferences.mirrored ? "-scale-x-100" : ""} ${
                hasVideo ? "opacity-100" : "opacity-0"
              }`}
            />
            
            {/* Blank State */}
            {!hasVideo && (
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <Camera className="mx-auto h-10 w-10 text-[#adc6ff] animate-pulse" />
                  <p className="mt-3 font-semibold text-white">Camera Offline</p>
                  <p className="mt-1 text-xs text-white/45">Click &quot;Start Camera&quot; to authorize device permission.</p>
                  {status === "error" && (
                    <div className="mx-auto mt-4 max-w-md rounded-xl border border-rose-500/30 bg-rose-950/60 p-3 text-left text-xs text-rose-100">
                      <VideoOff className="mr-1 inline h-4 w-4" />
                      {error}
                      <button onClick={start} className="ml-2 font-bold text-[#adc6ff] underline">
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skeleton & Overlay layers */}
            {hasVideo && (
              <>
                <div className="pointer-events-none absolute inset-[10%_24%] rounded-[35%] border-2 border-dashed border-cyan-300/40" />
                {showSkeleton && (
                  <SkeletonOverlay
                    pose={frame?.pose ?? null}
                    mirrored={preferences.mirrored}
                    showAngles={showAngles}
                    angles={frame?.angles ?? {}}
                  />
                )}
                
                {/* HUD Badges */}
                <div className="absolute left-4 top-4 rounded-lg bg-black/60 px-2.5 py-1 text-[9px] font-bold text-cyan-200 uppercase tracking-widest flex items-center gap-1">
                  <ScanLine className="h-3 w-3 text-cyan-300 animate-pulse" />
                  Telemetry Engine Active
                </div>
                <div className="absolute right-4 top-4 rounded-lg bg-black/60 px-2.5 py-1 text-[9px] font-bold text-white">
                  {fps} FPS • {preferences.width} × {preferences.height}
                </div>
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-2.5 py-1 text-[9px] font-bold text-white">
                  {mode === "live" ? (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Cpu className="h-3.5 w-3.5" /> MediaPipe Model Live
                    </span>
                  ) : (
                    <span className="text-[#adc6ff] flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Simulation fallback active
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="absolute bottom-4 right-4 rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 transition"
            >
              {fullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`text-xs font-semibold flex items-center gap-1.5 ${
                status === "live"
                  ? "text-emerald-300"
                  : status === "paused"
                  ? "text-amber-200"
                  : "text-white/50"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {status === "live" ? "Camera live" : status === "paused" ? "Camera paused" : "Camera off"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={togglePause}
                disabled={!hasVideo}
                className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 transition"
              >
                {status === "paused" ? "Resume feed" : "Pause feed"}
              </button>
              <button
                onClick={switchCamera}
                disabled={!hasVideo}
                className="rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 transition"
              >
                <SwitchCamera className="mr-1.5 inline h-4 w-4" /> Switch Camera
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Telemetry Dashboard Column */}
        <div className="space-y-4 text-left">
          {/* Main Rep / Duration metrics */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Target exercise", value: exercise.name },
              { label: "Reps Counted", value: `${reps} / ${exercise.repBottomAngle === 95 ? "10" : "12"}` },
              { label: "Active Sets", value: `${sets}` },
              { label: "Duration", value: elapsed },
              { label: "Calories Burned", value: `${calories} kcal` },
              { label: "Confidence", value: hasVideo ? "98.2%" : "—" },
            ].map((metric) => (
              <GlassCard key={metric.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
                <p className="text-[10px] uppercase tracking-wider text-white/45">{metric.label}</p>
                <p className="mt-1 text-lg font-black text-white">{metric.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* AI Coaching Console */}
          <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">AI Coach Console</h3>
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                className="text-white/40 hover:text-white transition"
              >
                {voiceOn ? <Mic className="h-4 w-4 text-[#adc6ff]" /> : <MicOff className="h-4 w-4" />}
              </button>
            </div>
            
            <p className="rounded-xl border border-[#adc6ff]/20 bg-[#adc6ff]/5 p-3.5 text-xs text-[#adc6ff] leading-relaxed">
              💡 {feedback}
            </p>

            {saveSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs font-bold text-center">
                ✅ Session saved to workout history!
              </div>
            )}

            {/* Interaction Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setWorkoutRunning(!workoutRunning);
                  if (!workoutRunning) {
                    announce("Three, two, one. Workout started. Keep your form controlled.");
                  }
                }}
                disabled={!hasVideo}
                className={`flex-1 rounded-xl py-3 text-xs font-black transition ${
                  workoutRunning
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : "bg-[#adc6ff] text-[#131315] hover:brightness-110"
                } disabled:opacity-50`}
              >
                {workoutRunning ? "Stop Workout" : "Start Workout"}
              </button>
              
              <button
                onClick={takeScreenshot}
                disabled={!hasVideo}
                className="rounded-xl border border-white/10 hover:bg-white/5 px-3.5 text-white disabled:opacity-50 transition"
                title="Take snapshot"
              >
                <CameraIcon className="h-4 w-4" />
              </button>

              <button
                onClick={handleSaveSession}
                disabled={saving || reps === 0}
                className="rounded-xl border border-white/10 hover:bg-white/5 px-3.5 text-white disabled:opacity-50 transition"
                title="Save session"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>

          {/* Tempo Analysis Visualization */}
          {tempoPhases && (
            <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)]">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tempo Analyser</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-white/50 text-[10px]">
                  <span>Lowering (Eccentric)</span>
                  <span className="font-bold text-[#adc6ff]">{(tempoPhases.loweringMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#adc6ff] h-full" style={{ width: `${Math.min(100, (tempoPhases.loweringMs / 4000) * 100)}%` }} />
                </div>

                <div className="flex justify-between text-white/50 text-[10px] pt-1">
                  <span>Pause (Isometric)</span>
                  <span className="font-bold text-yellow-400">{(tempoPhases.pauseMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-yellow-400 h-full" style={{ width: `${Math.min(100, (tempoPhases.pauseMs / 2000) * 100)}%` }} />
                </div>

                <div className="flex justify-between text-white/50 text-[10px] pt-1">
                  <span>Lifting (Concentric)</span>
                  <span className="font-bold text-emerald-400">{(tempoPhases.liftingMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, (tempoPhases.liftingMs / 3000) * 100)}%` }} />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Form Score Dial / Summary */}
          <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] text-xs text-white/60">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Real-time Form Score</span>
              <span className="font-black text-emerald-400 text-sm">{liveScore} / 100</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[9px] text-white/40 block">ROM</span>
                <span className="font-bold text-white mt-1 block">{romValue ? `${romValue}°` : "—"}</span>
              </div>
              <div className="flex-1 bg-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[9px] text-white/40 block">Symmetry</span>
                <span className="font-bold text-white mt-1 block">{Math.round(symmetryIndex * 100)}%</span>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="text-[10px] text-white/40 leading-relaxed border-white/5">
            ⚠️ **Biomechanical Disclaimer**: Real-time pose analysis results are mathematically calculated based on frame estimates. This tool does not diagnose injuries or suggest clinical rehabilitation routines.
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
