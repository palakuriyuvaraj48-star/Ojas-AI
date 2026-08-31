"use client";

/**
 * AR Workout Assistant — main view (Feature 147)
 *
 * Five tabs: Live Coach, Exercise Library, Session History,
 * Performance Review, AI Insights. Fully client-side; drives the
 * AR Coach engine / API and persists sessions via localStorage.
 *
 * Experimental feature set — all predictions are estimates and NOT medical advice.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Camera,
  CheckCircle2,
  CircleDot,
  Dumbbell,
  Eye,
  Footprints,
  History,
  Layers,
  Pause,
  PersonStanding,
  Play,
  Repeat,
  Sparkles,
  Square,
  TrendingUp,
  Volume2,
  VolumeX,
  Weight,
  Zap,
  Armchair,
  Info,
  Timer,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { config } from "@/lib/config";
import { futureAdd, futureARCoach, getFutureTable } from "@/lib/future-ai/storage";
import { FUTURE_AI_TABLES } from "@/database/schema";
import {
  AR_COACH_EXERCISES,
  endARSession,
  generateInsights,
  getExerciseDef,
  processFrame,
  startARSession,
} from "@/lib/future-ai/ar-coach/engine";
import type {
  ARCoachAnalytics,
  ARCoachInsights,
  ARCoachMode,
  ARCoachSession,
  ARExerciseDef,
  CoachingCue,
} from "@/lib/future-ai/ar-coach/types";

const USER_ID = "demo-user";
const FEATURE_ENABLED = Boolean(config.features.futureARCoach);

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                             */
/* -------------------------------------------------------------------------- */

function ExperimentalDisclaimer() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-[10px] text-yellow-200/90">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-300" />
      <span>
        Experimental AR preview. All scores, cues and predictions are
        estimates for motivation only — not medical advice.
      </span>
    </div>
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clampN(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

interface Pt {
  x: number;
  y: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Dumbbell,
  PersonStanding,
  Armchair,
  ArrowUp,
  Weight,
  Footprints,
};

function ExerciseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Dumbbell;
  return <Icon className={className} />;
}

/* -------------------------------------------------------------------------- */
/*  Skeleton overlay (animated SVG pose)                                      */
/* -------------------------------------------------------------------------- */

function getPose(exerciseId: string, lift: number): {
  head: Pt;
  neck: Pt;
  shoulderL: Pt;
  shoulderR: Pt;
  elbowL: Pt;
  elbowR: Pt;
  handL: Pt;
  handR: Pt;
  hipL: Pt;
  hipR: Pt;
  kneeL: Pt;
  kneeR: Pt;
  ankleL: Pt;
  ankleR: Pt;
} {
  const def = getExerciseDef(exerciseId);
  const pattern = def.idealPattern;
  const t = clampN(lift, 0, 1);

  const cx = 100;
  const shoulderY = 66;
  const hipY = 168;
  const ankleY = 300;

  // Hinge tilts the whole upper body forward.
  const hinge = pattern === "hinge" ? lerp(0, 0.5, t) : 0;
  const upperShiftX = Math.sin(hinge) * 46;
  const upperShiftY = (1 - Math.cos(hinge)) * 22;

  const neck: Pt = { x: cx + upperShiftX, y: 56 + upperShiftY };
  const head: Pt = { x: cx + upperShiftX, y: 36 + upperShiftY };
  const shoulderL: Pt = { x: 80 + upperShiftX, y: shoulderY + upperShiftY };
  const shoulderR: Pt = { x: 120 + upperShiftX, y: shoulderY + upperShiftY };

  // Arms
  const upperLen = 34;
  const foreLen = 34;
  const arm = (shoulder: Pt, sideSign: number) => {
    let a = 0.06;
    if (pattern === "curl") a = lerp(0, 2.3, t);
    else if (pattern === "press") a = lerp(0, Math.PI * 0.96, t);
    else if (pattern === "hinge") a = lerp(0.05, 0.4, t);
    const elbow: Pt = {
      x: shoulder.x + sideSign * upperLen * Math.sin(a),
      y: shoulder.y + upperLen * Math.cos(a),
    };
    const hand: Pt = {
      x: elbow.x + sideSign * foreLen * Math.sin(a),
      y: elbow.y + foreLen * Math.cos(a),
    };
    return { elbow, hand };
  };
  const armL = arm(shoulderL, -1);
  const armR = arm(shoulderR, 1);

  // Legs
  const hipL: Pt = { x: 88, y: hipY };
  const hipR: Pt = { x: 112, y: hipY };
  const ankleL: Pt = { x: 88, y: ankleY };
  const ankleR: Pt = { x: 112, y: ankleY };

  const leg = (hip: Pt, ankle: Pt, sideSign: number) => {
    if (pattern === "squat") {
      const drop = lerp(0, 30, t);
      const hy = hip.y + drop;
      const kf = lerp(4, 22, t);
      const knee: Pt = { x: hip.x + sideSign * kf, y: hy + lerp(46, 30, t) };
      return { knee };
    }
    const knee: Pt = {
      x: (hip.x + ankle.x) / 2,
      y: (hip.y + ankle.y) / 2 + 4,
    };
    return { knee };
  };
  const legL = leg(hipL, ankleL, -1);
  const legR = leg(hipR, ankleR, 1);

  return {
    head,
    neck,
    shoulderL,
    shoulderR,
    elbowL: armL.elbow,
    elbowR: armR.elbow,
    handL: armL.hand,
    handR: armR.hand,
    hipL,
    hipR,
    kneeL: legL.knee,
    kneeR: legR.knee,
    ankleL,
    ankleR,
  };
}

function SkeletonOverlay({
  exerciseId,
  lift,
  reduced,
  cueType,
}: {
  exerciseId: string;
  lift: number;
  reduced: boolean;
  cueType?: CoachingCue["type"];
}) {
  const p = getPose(exerciseId, lift);
  const accent =
    cueType === "warning"
      ? "#f87171"
      : cueType === "form"
        ? "#fbbf24"
        : cueType === "tempo"
          ? "#38bdf8"
          : "#a78bfa";

  const limb = (a: Pt, b: Pt, w = 5) => (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={accent}
      strokeWidth={w}
      strokeLinecap="round"
      opacity={0.9}
    />
  );
  const joint = (pt: Pt, r = 4.5) => (
    <circle cx={pt.x} cy={pt.y} r={r} fill={accent} opacity={0.95} />
  );

  return (
    <svg
      viewBox="0 0 200 320"
      className="h-full w-full"
      role="img"
      aria-label="Pose skeleton overlay"
    >
      {/* torso */}
      <motion.g
        animate={reduced ? undefined : { opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        {limb(p.neck, { x: (p.hipL.x + p.hipR.x) / 2, y: p.hipL.y }, 7)}
        {limb(p.shoulderL, p.elbowL)}
        {limb(p.elbowL, p.handL)}
        {limb(p.shoulderR, p.elbowR)}
        {limb(p.elbowR, p.handR)}
        {limb(p.hipL, p.kneeL)}
        {limb(p.kneeL, p.ankleL)}
        {limb(p.hipR, p.kneeR)}
        {limb(p.kneeR, p.ankleR)}
        {joint(p.neck, 5)}
        {joint(p.shoulderL)}
        {joint(p.shoulderR)}
        {joint(p.elbowL, 4)}
        {joint(p.elbowR, 4)}
        {joint(p.handL, 3.5)}
        {joint(p.handR, 3.5)}
        {joint(p.hipL)}
        {joint(p.hipR)}
        {joint(p.kneeL, 4)}
        {joint(p.kneeR, 4)}
        {joint(p.ankleL, 4)}
        {joint(p.ankleR, 4)}
      </motion.g>
      {/* head */}
      <motion.circle
        cx={p.head.x}
        cy={p.head.y}
        r={13}
        fill="none"
        stroke={accent}
        strokeWidth={3}
        animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ transformOrigin: `${p.head.x}px ${p.head.y}px` }}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Live Coach                                                                */
/* -------------------------------------------------------------------------- */

const MODES: { id: ARCoachMode; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "form", label: "Form Focus" },
  { id: "power", label: "Power" },
  { id: "endurance", label: "Endurance" },
];

function CueCard({ cue, reduced }: { cue: CoachingCue; reduced: boolean }) {
  const styles = {
    form: "border-yellow-400/30 bg-yellow-400/10 text-yellow-200",
    tempo: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    encouragement: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warning: "border-red-400/30 bg-red-400/10 text-red-200",
  }[cue.type];
  return (
    <motion.div
      key={cue.id}
      initial={reduced ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border px-3 py-2 text-xs font-medium ${styles}`}
    >
      <span className="flex items-center gap-2">
        {cue.type === "warning" ? (
          <AlertTriangle className="h-3.5 w-3.5" />
        ) : cue.type === "encouragement" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Zap className="h-3.5 w-3.5" />
        )}
        {cue.text}
        {cue.spoken && <Volume2 className="ml-auto h-3 w-3 opacity-70" />}
      </span>
    </motion.div>
  );
}

function FormDial({ value, reduced }: { value: number; reduced: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <ProgressRing
        progress={value}
        size={84}
        strokeWidth={7}
        color={value > 75 ? "#34d399" : value > 50 ? "#fbbf24" : "#f87171"}
      />
      <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
        Form
      </span>
    </div>
  );
}

function LiveCoach({
  onSessionEnd,
}: {
  onSessionEnd: (
    s: ARCoachSession,
    i: ARCoachInsights,
    a: ARCoachAnalytics
  ) => void;
}) {
  const prefersReduced = useReducedMotion();
  const [reducedToggle, setReducedToggle] = useState(false);
  const reduced = Boolean(prefersReduced) || reducedToggle;

  const [status, setStatus] = useState<"idle" | "running" | "paused" | "done">(
    "idle"
  );
  const [exercise, setExercise] = useState(AR_COACH_EXERCISES[0].id);
  const [mode, setMode] = useState<ARCoachMode>("form");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<ARCoachSession | null>(null);
  const [cue, setCue] = useState<CoachingCue | null>(null);
  const [samples, setSamples] = useState<number[]>([]);
  const [voice, setVoice] = useState(false);
  const [lastResult, setLastResult] = useState<{
    s: ARCoachSession;
    i: ARCoachInsights;
    a: ARCoachAnalytics;
  } | null>(null);

  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<number[]>([]);
  const cueRef = useRef<CoachingCue | null>(null);

  const def = getExerciseDef(exercise);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (reduced) return;
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05;
        u.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch {
        /* no-op */
      }
    },
    [reduced]
  );

  const stopTimer = () => {
    if (frameTimer.current) {
      clearInterval(frameTimer.current);
      frameTimer.current = null;
    }
  };

  const startSession = async () => {
    setLastResult(null);
    samplesRef.current = [];
    setSamples([]);
    try {
      const res = await fetch("/api/future/ar-coach?action=start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          mode,
          reducedMotion: reduced,
          userId: USER_ID,
        }),
      });
      const data = await res.json();
      setSessionId(data.session.id);
      setSession(data.session);
      setStatus("running");
    } catch {
      // Fallback to local engine if the API is unavailable.
      const s = startARSession({
        exercise,
        mode,
        reducedMotion: reduced,
        userId: USER_ID,
      });
      setSessionId(s.id);
      setSession(s);
      setStatus("running");
    }
  };

  const tick = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/future/ar-coach?action=frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!data.session) return;
      setSession(data.session);
      setCue(data.cue);
      cueRef.current = data.cue;
      const lastAngle =
        data.session.jointAngles[data.session.jointAngles.length - 1]?.angle;
      if (typeof lastAngle === "number") {
        samplesRef.current = [...samplesRef.current, lastAngle].slice(-60);
        setSamples(samplesRef.current);
      }
      if (voice && (data.cue.spoken || data.cue.priority === "high")) {
        speak(data.cue.text);
      }
    } catch {
      /* keep last frame on transient error */
    }
  }, [sessionId, voice, speak]);

  const endSession = useCallback(async () => {
    stopTimer();
    if (!sessionId) return;
    try {
      const res = await fetch("/api/future/ar-coach?action=end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setLastResult({ s: data.session, i: data.insights, a: data.analytics });
        onSessionEnd(data.session, data.insights, data.analytics);
      }
    } catch {
      // Local fallback finalize.
      const { session: s, insights, analytics } = endARSession(sessionId);
      setSession(s);
      setLastResult({ s, i: insights, a: analytics });
      onSessionEnd(s, insights, analytics);
    }
    setStatus("done");
    setSessionId(null);
  }, [sessionId, onSessionEnd]);

  // Frame loop
  useEffect(() => {
    if (status === "running") {
      frameTimer.current = setInterval(() => {
        void tick();
      }, 220);
      return () => stopTimer();
    }
    stopTimer();
  }, [status, tick]);

  useEffect(() => () => stopTimer(), []);

  const togglePause = () => {
    if (status === "running") {
      stopTimer();
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("running");
    }
  };

  const lift = useMemo(() => {
    if (!session) return 0;
    const last = session.jointAngles[session.jointAngles.length - 1]?.angle;
    if (typeof last !== "number") return 0;
    const span = def.flexedAngle - def.extendedAngle;
    return clampN((last - def.extendedAngle) / span, 0, 1);
  }, [session, def]);

  const reps = session?.reps ?? 0;
  const sets = Math.floor(reps / 8) + 1;
  const formScore = session?.formScore ?? 0;

  /* ----------------------------- Idle CTA ------------------------------ */
  if (status === "idle" || status === "done") {
    return (
      <div className="space-y-4">
        <GlassCard className="overflow-hidden">
          <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--accent-glow)] to-transparent p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <Camera className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              AR Workout Assistant
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[var(--foreground-muted)]">
              Start a live session. The assistant tracks your pose, counts reps,
              scores form and coaches you in real time.
            </p>
            {!FEATURE_ENABLED && (
              <div className="mt-3">
                <Badge label="Preview · flag off" variant="warning" />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Choose exercise
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AR_COACH_EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setExercise(ex.id)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                  exercise === ex.id
                    ? "border-[var(--accent)]/50 bg-[var(--accent)]/10"
                    : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                }`}
              >
                <ExerciseIcon name={ex.icon} className="h-5 w-5 text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--foreground)]">
                  {ex.name}
                </span>
              </button>
            ))}
          </div>

          <h4 className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Mode
          </h4>
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  mode === m.id
                    ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] bg-white/5 text-[var(--foreground-muted)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button
              variant="premium"
              size="lg"
              icon={<Play className="h-4 w-4" />}
              onClick={startSession}
            >
              Start AR Session
            </Button>
            <Button
              variant="ghost"
              size="lg"
              icon={reducedToggle ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              onClick={() => setReducedToggle((v) => !v)}
            >
              {reducedToggle ? "Reduced motion: on" : "Reduced motion: off"}
            </Button>
          </div>
        </GlassCard>

        {status === "done" && lastResult && (
          <GlassCard className="border-emerald-400/20">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Session complete</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {lastResult.s.reps}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)]">Reps</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {lastResult.s.formScore}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)]">Form</div>
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--foreground)]">
                  {lastResult.s.movementQuality}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)]">
                  Quality
                </div>
              </div>
            </div>
            <Button
              variant="glass"
              className="mt-4 w-full"
              onClick={() => setStatus("idle")}
            >
              Start another session
            </Button>
          </GlassCard>
        )}
      </div>
    );
  }

  /* ----------------------------- Live UI ------------------------------ */
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Camera stage */}
        <GlassCard className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border)] bg-black/40">
            {/* grid overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/40 px-2 py-1 text-[10px] text-[var(--foreground-muted)]">
              <CircleDot className="h-3 w-3 text-red-400" />
              {status === "running" ? "LIVE" : "PAUSED"} · {def.name}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full max-h-[260px]">
                <SkeletonOverlay
                  exerciseId={exercise}
                  lift={lift}
                  reduced={reduced}
                  cueType={cue?.type}
                />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge label={`Reps ${reps}`} variant="primary" />
              <Badge label={`Set ${sets}`} variant="neutral" />
            </div>
            <div className="absolute bottom-3 right-3">
              <Badge
                label={`${Math.floor((session?.duration ?? 0) / 60)}:${String(
                  (session?.duration ?? 0) % 60
                ).padStart(2, "0")}`}
                variant="neutral"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {status === "running" ? (
              <Button variant="glass" icon={<Pause className="h-4 w-4" />} onClick={togglePause}>
                Pause
              </Button>
            ) : (
              <Button variant="glass" icon={<Play className="h-4 w-4" />} onClick={togglePause}>
                Resume
              </Button>
            )}
            <Button
              variant="danger"
              icon={<Square className="h-4 w-4" />}
              onClick={endSession}
            >
              Stop
            </Button>
            <Button
              variant={voice ? "premium" : "ghost"}
              icon={voice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              onClick={() => setVoice((v) => !v)}
            >
              {voice ? "Voice on" : "Voice off"}
            </Button>
            <Button
              variant="ghost"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => setReducedToggle((v) => !v)}
            >
              {reducedToggle ? "Reduced motion" : "Motion"}
            </Button>
          </div>
        </GlassCard>

        {/* Metrics */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex items-center justify-around">
              <FormDial value={formScore} reduced={reduced} />
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--foreground)]">
                  {reps}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                  Reps
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--foreground)]">
                  {session?.fatigueIndicator ?? 0}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
                  Fatigue
                </div>
              </div>
            </div>
            <div className="mt-3 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={samples.map((v, idx) => ({ idx, v }))}>
                  <XAxis dataKey="idx" hide />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={!reduced}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-[9px] text-[var(--foreground-muted)]">
              Primary joint angle (°)
            </p>
          </GlassCard>

          <GlassCard>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Coaching cues
            </h4>
            <div className="space-y-2">
              {cue ? (
                <CueCard cue={cue} reduced={reduced} />
              ) : (
                <Skeleton height={36} />
              )}
              {voice && (
                <p className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)]">
                  <Volume2 className="h-3 w-3" /> Voice coaching enabled
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Exercise Library                                                          */
/* -------------------------------------------------------------------------- */

function ExerciseLibrary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {AR_COACH_EXERCISES.map((ex) => (
        <GlassCard key={ex.id} hover padding="sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <ExerciseIcon name={ex.icon} className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)]">
                  {ex.name}
                </h4>
                <p className="text-[10px] capitalize text-[var(--foreground-muted)]">
                  {ex.primaryJoint} focus
                </p>
              </div>
            </div>
            <Badge
              label={ex.difficulty}
              variant={
                ex.difficulty === "beginner"
                  ? "success"
                  : ex.difficulty === "advanced"
                    ? "danger"
                    : "warning"
              }
            />
          </div>

          <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-[var(--border)] bg-black/30">
            <div className="h-full w-1/2">
              <SkeletonOverlay exerciseId={ex.id} lift={0.5} reduced cueType="form" />
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Form tips
            </p>
            {ex.formTips.map((tip) => (
              <p key={tip} className="flex items-start gap-1.5 text-[11px] text-[var(--foreground-muted)]">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                {tip}
              </p>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Session History                                                           */
/* -------------------------------------------------------------------------- */

function SessionHistory({ sessions }: { sessions: ARCoachSession[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (sessions.length === 0) {
    return (
      <GlassCard className="text-center py-10">
        <History className="mx-auto mb-3 h-8 w-8 text-[var(--foreground-muted)]" />
        <p className="text-sm text-[var(--foreground-muted)]">
          No sessions yet. Start a live AR session to build your history.
        </p>
      </GlassCard>
    );
  }
  return (
    <div className="space-y-3">
      {sessions
        .slice()
        .reverse()
        .map((s) => {
          const def = getExerciseDef(s.exercise);
          const isOpen = open === s.id;
          return (
            <GlassCard key={s.id} padding="sm">
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="flex w-full items-center gap-3 text-left"
              >
                <div className="h-12 w-12 shrink-0 rounded-xl border border-[var(--border)] bg-black/30">
                  <SkeletonOverlay exerciseId={s.exercise} lift={0.5} reduced />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                      {def.name}
                    </span>
                    <span className="text-[10px] text-[var(--foreground-muted)]">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-3 text-[11px] text-[var(--foreground-muted)]">
                    <span>{s.reps} reps</span>
                    <span>
                      {Math.floor(s.duration / 60)}:
                      {String(s.duration % 60).padStart(2, "0")}
                    </span>
                    <span>Form {s.formScore}</span>
                  </div>
                </div>
                <ProgressRing progress={s.formScore} size={42} strokeWidth={4} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 grid gap-3 border-t border-[var(--border)] pt-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Common mistakes
                        </p>
                        {s.commonMistakes.length ? (
                          s.commonMistakes.map((m) => (
                            <p key={m} className="text-[11px] text-[var(--foreground-muted)]">
                              • {m}
                            </p>
                          ))
                        ) : (
                          <p className="text-[11px] text-[var(--foreground-muted)]">
                            None detected
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                          Improvements
                        </p>
                        {s.improvementSuggestions.length ? (
                          s.improvementSuggestions.map((m) => (
                            <p key={m} className="text-[11px] text-[var(--foreground-muted)]">
                              • {m}
                            </p>
                          ))
                        ) : (
                          <p className="text-[11px] text-[var(--foreground-muted)]">
                            Keep it up
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Performance Review                                                        */
/* -------------------------------------------------------------------------- */

function PerformanceReview({
  sessions,
  analytics,
}: {
  sessions: ARCoachSession[];
  analytics: ARCoachAnalytics[];
}) {
  const chartData = useMemo(() => {
    const sorted = [...analytics].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.map((a, i) => ({
      name: `#${i + 1}`,
      quality: a.movementQuality,
      consistency: a.consistency,
      fatigue: a.fatigueIndicator,
    }));
  }, [analytics]);

  const current = sessions[sessions.length - 1];
  const previous = sessions[sessions.length - 2];

  const delta = (key: "formScore" | "movementQuality" | "reps") => {
    if (!current || !previous) return null;
    return current[key] - previous[key];
  };

  const mistakesData = useMemo(() => {
    if (!current) return [];
    const ins = generateInsights(current);
    return ins.commonMistakes.map((m) => ({
      name: m.name,
      value: Math.round(m.frequency * 100),
    }));
  }, [current]);

  if (!current) {
    return (
      <GlassCard className="text-center py-10">
        <BarChart3 className="mx-auto mb-3 h-8 w-8 text-[var(--foreground-muted)]" />
        <p className="text-sm text-[var(--foreground-muted)]">
          Complete at least one session to see performance reviews.
        </p>
      </GlassCard>
    );
  }

  const tooltipStyle = {
    backgroundColor: "var(--surface-elevated)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--foreground)",
    fontSize: 11,
  } as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Form vs last
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {current.formScore}
            </span>
            {delta("formScore") != null && (
              <span
                className={`text-xs ${
                  (delta("formScore") ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {delta("formScore")! >= 0 ? "+" : ""}
                {delta("formScore")}
              </span>
            )}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Quality vs last
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {current.movementQuality}
            </span>
            {delta("movementQuality") != null && (
              <span
                className={`text-xs ${
                  (delta("movementQuality") ?? 0) >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {delta("movementQuality")! >= 0 ? "+" : ""}
                {delta("movementQuality")}
              </span>
            )}
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Reps vs last
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {current.reps}
            </span>
            {delta("reps") != null && (
              <span
                className={`text-xs ${
                  (delta("reps") ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {delta("reps")! >= 0 ? "+" : ""}
                {delta("reps")}
              </span>
            )}
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" /> Movement quality trend
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="quality"
                  stroke="#a78bfa"
                  fill="url(#gq)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <Activity className="h-3.5 w-3.5 text-[var(--accent)]" /> Consistency
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="consistency"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <Timer className="h-3.5 w-3.5 text-[var(--accent)]" /> Fatigue timeline
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={11} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#f87171"
                  fill="url(#gf)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <Layers className="h-3.5 w-3.5 text-[var(--accent)]" /> Common mistakes breakdown
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={10} />
                <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  AI Insights                                                               */
/* -------------------------------------------------------------------------- */

function AIInsights({ sessions }: { sessions: ARCoachSession[] }) {
  const current = sessions[sessions.length - 1];
  const qualityTrend = useMemo(
    () =>
      sessions
        .slice(-8)
        .map((s, i) => ({ name: `#${i + 1}`, quality: s.movementQuality })),
    [sessions]
  );

  if (!current) {
    return (
      <GlassCard className="text-center py-10">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-[var(--foreground-muted)]" />
        <p className="text-sm text-[var(--foreground-muted)]">
          Insights appear after your first AR session.
        </p>
      </GlassCard>
    );
  }
  const insights = generateInsights(current);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Movement quality
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {insights.movementQuality}
            <span className="text-sm text-[var(--foreground-muted)]">/100</span>
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Consistency
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {insights.consistency}
            <span className="text-sm text-[var(--foreground-muted)]">/100</span>
          </p>
        </GlassCard>
        <GlassCard>
          <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">
            Fatigue
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {insights.fatigueIndicator}
            <span className="text-sm text-[var(--foreground-muted)]">/100</span>
          </p>
        </GlassCard>
      </div>

      <GlassCard>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" /> Consistency score trend
        </h4>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={11} />
              <YAxis stroke="var(--foreground-muted)" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="quality"
                stroke="#38bdf8"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> Common mistakes
          </h4>
          <div className="space-y-2">
            {insights.commonMistakes.map((m) => (
              <div key={m.name}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--foreground)]">{m.name}</span>
                  <Badge
                    label={m.severity}
                    variant={
                      m.severity === "high"
                        ? "danger"
                        : m.severity === "medium"
                          ? "warning"
                          : "neutral"
                    }
                  />
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-yellow-400/70"
                    style={{ width: `${Math.round(m.frequency * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" /> Improvement suggestions
          </h4>
          <div className="space-y-3">
            {insights.improvementSuggestions.map((s) => (
              <div key={s.title} className="rounded-xl border border-[var(--border)] bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--foreground)]">
                    {s.title}
                  </span>
                  <Badge label={`${Math.round(s.confidence * 100)}% ${s.confidenceLevel}`} variant="primary" />
                </div>
                <p className="mt-1 text-[11px] text-[var(--foreground-muted)]">
                  {s.description}
                </p>
                <p className="mt-1 text-[10px] font-medium text-[var(--accent)]">
                  Drill: {s.drill}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {insights.predictedPlateau && (
        <GlassCard className="border-[var(--accent)]/20">
          <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)]">
            <Zap className="h-3.5 w-3.5 text-[var(--accent)]" /> Predicted plateau
          </h4>
          <p className="text-[11px] text-[var(--foreground-muted)]">
            {insights.predictedPlateau.note}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${insights.predictedPlateau.risk}%` }}
            />
          </div>
          <p className="mt-1 text-right text-[10px] text-[var(--foreground-muted)]">
            Plateau risk {insights.predictedPlateau.risk}%
          </p>
        </GlassCard>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main view                                                                 */
/* -------------------------------------------------------------------------- */

export function ARCoachView() {
  const [activeTab, setActiveTab] = useState("live");
  const [sessions, setSessions] = useState<ARCoachSession[]>([]);
  const [analytics, setAnalytics] = useState<ARCoachAnalytics[]>([]);

  const reload = useCallback(() => {
    try {
      setSessions(getFutureTable<ARCoachSession>(FUTURE_AI_TABLES.AR_COACH_SESSIONS));
      setAnalytics(futureARCoach.listAnalytics(USER_ID));
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSessionEnd = useCallback(
    (s: ARCoachSession, _i: ARCoachInsights, a: ARCoachAnalytics) => {
      try {
        futureAdd<ARCoachSession>(FUTURE_AI_TABLES.AR_COACH_SESSIONS, s);
        futureARCoach.addAnalytics(a);
      } catch {
        /* localStorage unavailable */
      }
      reload();
    },
    [reload]
  );

  const tabs = [
    { id: "live", label: "Live Coach", icon: <Camera className="h-3.5 w-3.5" /> },
    { id: "library", label: "Exercise Library", icon: <Dumbbell className="h-3.5 w-3.5" /> },
    { id: "history", label: "Session History", icon: <History className="h-3.5 w-3.5" /> },
    { id: "review", label: "Performance Review", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: "insights", label: "AI Insights", icon: <Sparkles className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              AR Workout Assistant
            </h2>
            {!FEATURE_ENABLED && <Badge label="Preview" variant="warning" />}
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            Real-time pose tracking, form scoring and coaching
          </p>
        </div>
      </div>

      <ExperimentalDisclaimer />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "live" && <LiveCoach onSessionEnd={handleSessionEnd} />}
          {activeTab === "library" && <ExerciseLibrary />}
          {activeTab === "history" && <SessionHistory sessions={sessions} />}
          {activeTab === "review" && (
            <PerformanceReview sessions={sessions} analytics={analytics} />
          )}
          {activeTab === "insights" && <AIInsights sessions={sessions} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ARCoachView;

