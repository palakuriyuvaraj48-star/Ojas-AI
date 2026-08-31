"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PoseDetector,
  CameraService,
  VoiceCoach,
  RepCounter,
  TempoTracker,
  RomTracker,
  SymmetryTracker,
  scoreRep,
  liveFeedback,
  buildFormScore,
  buildCoaching,
  saveSession,
  getSessions,
  getExercise,
  EXERCISE_GROUPS,
  computeAnalytics,
  type CameraMode,
  type CameraPreferences,
  type DetectedFrame,
  type ExerciseDefinition,
  type FormFeedback,
  type LiveCoaching,
  type RomState,
  type SymmetryState,
  type SetRecord,
  type CameraSessionRecord,
  type AnalyticsSummary,
  type FormScore,
  type MovementPhase,
} from "@/lib/vision";

const initialPreferences: CameraPreferences = {
  facingMode: "user",
  width: 1280,
  height: 720,
  frameRate: 30,
  mirrored: true,
};

function errorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Camera access was blocked. Allow access in your browser settings, then try again.";
  if (name === "NotFoundError") return "No camera was found. Connect a camera and try again.";
  if (name === "NotReadableError")
    return "Your camera is busy in another application. Close it there and try again.";
  if (name === "OverconstrainedError")
    return "This camera does not support the selected quality. Try a lower resolution.";
  return "This browser could not start the camera. Use a current Chrome, Edge, or mobile browser over HTTPS.";
}

export interface RepSummary {
  index: number;
  score: number;
  rom: number;
  symmetryIndex: number;
  partial: boolean;
  issue?: string;
  why?: string;
  how?: string;
  loweringMs?: number;
  liftingMs?: number;
  timestamp: number;
}

export function useFormCoach() {
  const serviceRef = useRef<CameraService | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const voiceRef = useRef<VoiceCoach | null>(null);
  const fpsRef = useRef({ frames: 0, started: 0 });
  const lastFrameTs = useRef(0);
  const lastFeedbackAt = useRef(0);
  const rafRef = useRef(0);
  const setRepsRef = useRef<RepSummary[]>([]);

  const [preferences, setPreferences] = useState(initialPreferences);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [status, setStatus] = useState<"idle" | "live" | "paused" | "error">("idle");
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const [exerciseId, setExerciseId] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ex = params.get("exercise");
      if (ex) return ex;
    }
    return "squat";
  });
  const exercise: ExerciseDefinition = getExercise(exerciseId);

  const [mode, setModeState] = useState<CameraMode>("simulation");
  const [liveReady, setLiveReady] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAngles, setShowAngles] = useState(true);

  const [workoutRunning, setWorkoutRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fps, setFps] = useState(0);

  const [frame, setFrame] = useState<DetectedFrame | null>(null);
  const [phase, setPhase] = useState<DetectedFrame["phase"]>("resting");
  const [movementPhase, setMovementPhase] = useState<MovementPhase>("ready");
  const [confidence, setConfidence] = useState(0);

  const [reps, setReps] = useState(0);
  const [goodReps, setGoodReps] = useState(0);
  const [partialReps, setPartialReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [targetRepsPerSet] = useState(10);
  const [currentSetReps, setCurrentSetReps] = useState<RepSummary[]>([]);
  const [finishedSets, setFinishedSets] = useState<SetRecord[]>([]);
  const [selectedRep, setSelectedRep] = useState<RepSummary | null>(null);

  // Set rest timer
  const [inRest, setInRest] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);

  const [liveScore, setLiveScore] = useState(88);
  const [liveMetrics, setLiveMetrics] = useState<FormScore["metrics"]>({
    stability: 85,
    consistency: 88,
    tempo: 82,
    control: 86,
    rangeOfMotion: 90,
  });
  const [feedback, setFeedback] = useState<FormFeedback[]>([]);
  const [primaryFeedback, setPrimaryFeedback] = useState<{ what?: string; why?: string; how?: string }>({
    what: "Ready for movement.",
    why: "Align your full body within the camera frame.",
    how: "Keep a stable stance to begin.",
  });
  const [coaching, setCoaching] = useState<LiveCoaching>({
    strengths: ["Ready when you are."],
    improvements: [],
    corrections: [exercise.cues[0]],
    summary: "Start moving to begin real-time posture tracking.",
  });
  const [rom, setRom] = useState<RomState | null>(null);
  const [symmetry, setSymmetry] = useState<SymmetryState | null>(null);
  const [lastTempo, setLastTempo] = useState<{ loweringMs: number; liftingMs: number; pauseMs: number } | null>(null);

  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);
  const [painReported, setPainReported] = useState(false);

  const [sessions, setSessions] = useState<CameraSessionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [saving, setSaving] = useState(false);
  const [workoutCompleteSummary, setWorkoutCompleteSummary] = useState<CameraSessionRecord | null>(null);

  if (detectorRef.current == null) {
    detectorRef.current = new PoseDetector(exercise, "simulation");
  }
  if (voiceRef.current == null) {
    voiceRef.current = new VoiceCoach();
  }

  const refreshData = useCallback(() => {
    setSessions(getSessions());
    setAnalytics(computeAnalytics(getSessions()));
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    detectorRef.current?.setExercise(exercise);
    setCoaching((c) => ({ ...c, corrections: [exercise.cues[0]] }));
  }, [exercise]);

  const changeMode = useCallback(async (next: CameraMode) => {
    if (next === "live") {
      const ok = await detectorRef.current?.initLive();
      setLiveReady(Boolean(ok));
      setModeState("live");
    } else {
      setModeState("simulation");
      setLiveReady(false);
    }
  }, []);

  const announce = useCallback(
    (text: string) => {
      if (voiceOn && voiceRef.current) voiceRef.current.speak(text);
    },
    [voiceOn]
  );

  const setRepsState = useCallback((list: RepSummary[]) => {
    setRepsRef.current = list;
    setCurrentSetReps(list);
  }, []);

  const start = useCallback(async () => {
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

      // Initialize live detector
      await changeMode("live");

      // Auto-start workout tracking
      setWorkoutRunning(true);
      setWorkoutCompleteSummary(null);
      detectorRef.current?.start();
      announce("Camera active. Workout tracking started.");
    } catch (caught) {
      setStatus("error");
      setError(errorMessage(caught));
    }
  }, [preferences, changeMode, announce]);

  const stop = useCallback(() => {
    serviceRef.current?.stop();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
    setFps(0);
    setWorkoutRunning(false);
    detectorRef.current?.stop();
  }, []);

  const togglePause = useCallback(() => {
    if (status === "live") {
      serviceRef.current?.pause();
      setStatus("paused");
      setWorkoutRunning(false);
    } else {
      serviceRef.current?.resume();
      setStatus("live");
      setWorkoutRunning(true);
    }
  }, [status]);

  const switchCamera = useCallback(() => {
    setPreferences((p) => ({
      ...p,
      facingMode: p.facingMode === "user" ? "environment" : "user",
      mirrored: p.facingMode === "environment",
    }));
    window.setTimeout(() => void start(), 0);
  }, [start]);

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      const nv = !v;
      voiceRef.current?.setMuted(!nv);
      return nv;
    });
  }, []);

  const startWorkout = useCallback(() => {
    setWorkoutRunning(true);
    setSeconds(0);
    setReps(0);
    setGoodReps(0);
    setPartialReps(0);
    setSets(0);
    setInRest(false);
    setRestSeconds(0);
    setCurrentSetReps([]);
    setFinishedSets([]);
    setSafetyMessage(null);
    setPainReported(false);
    setRepsState([]);
    setSelectedRep(null);
    setWorkoutCompleteSummary(null);
    detectorRef.current?.start();
    announce(`Starting ${exercise.name}. Keep your cadence controlled.`);
  }, [announce, setRepsState, exercise]);

  const manualRep = useCallback(() => {
    setReps((r) => r + 1);
    setGoodReps((g) => g + 1);
    const summary: RepSummary = {
      index: reps + partialReps + 1,
      score: liveScore || 85,
      rom: rom?.observedRange ?? exercise.expectedRom,
      symmetryIndex: symmetry?.symmetryIndex ?? 1,
      partial: false,
      issue: "Good form",
      why: "Controlled repetition within target biomechanical tolerances.",
      how: "Maintain rhythm and core bracing.",
      timestamp: Date.now(),
    };
    const all = [...setRepsRef.current, summary];
    setRepsState(all);
    announce("Rep counted.");
  }, [liveScore, rom, symmetry, exercise, announce, setRepsState, reps, partialReps]);

  const manualPartial = useCallback(() => {
    setPartialReps((p) => p + 1);
    const summary: RepSummary = {
      index: reps + partialReps + 1,
      score: 60,
      rom: Math.round((rom?.observedRange ?? exercise.expectedRom) * 0.6),
      symmetryIndex: symmetry?.symmetryIndex ?? 0.9,
      partial: true,
      issue: "Shallow range of motion",
      why: "Reversed movement before reaching full target depth.",
      how: `Descend until reaching the full ${exercise.expectedRom}° target.`,
      timestamp: Date.now(),
    };
    const all = [...setRepsRef.current, summary];
    setRepsState(all);
    announce("Partial rep noted. Strive for full depth.");
  }, [rom, exercise, announce, setRepsState, reps, partialReps]);

  const reportPain = useCallback(() => {
    setPainReported(true);
    setSafetyMessage(
      "Safety Alert: You indicated discomfort. Stop the movement immediately, rest, and consult a qualified healthcare professional if pain persists. Ojas AI does not diagnose medical conditions."
    );
    announce("Please stop and rest if you feel pain.");
  }, [announce]);

  const finishSet = useCallback(() => {
    const repsArr = setRepsRef.current;
    if (repsArr.length === 0) return;

    setFinishedSets((prev) => {
      const score = buildFormScore(repsArr, exercise);
      const coachingOut = buildCoaching(repsArr, exercise, feedback);
      const record: SetRecord = {
        setNumber: prev.length + 1,
        exercise: exercise.id,
        reps: repsArr.filter((r) => !r.partial).length,
        partialReps: repsArr.filter((r) => r.partial).length,
        durationMs: 0,
        avgScore: score.total,
        avgRom: Math.round(repsArr.reduce((a, r) => a + r.rom, 0) / repsArr.length),
        avgSymmetry:
          Math.round((repsArr.reduce((a, r) => a + r.symmetryIndex, 0) / repsArr.length) * 100) / 100,
        tempoStartMs: 0,
        tempoEndMs: 0,
      };
      setSets(prev.length + 1);
      setCoaching(coachingOut);
      announce(`Set ${prev.length + 1} complete. Rest for 60 seconds.`);

      // Trigger 60s rest countdown
      setInRest(true);
      setRestSeconds(60);

      return [...prev, record];
    });

    setRepsState([]);
  }, [exercise, feedback, announce, setRepsState]);

  const persistSession = useCallback(async () => {
    setSaving(true);
    const allReps = [
      ...finishedSets.flatMap((s) =>
        Array(s.reps).fill({ score: s.avgScore, rom: s.avgRom, symmetryIndex: s.avgSymmetry, partial: false })
      ),
      ...setRepsRef.current,
    ];
    const totalCount = reps + partialReps;
    const fs = buildFormScore(allReps.length ? allReps : setRepsRef.current, exercise);

    const record = saveSession({
      exercise: exercise.name,
      durationMs: Math.max(1000, seconds * 1000),
      sets: sets + (setRepsRef.current.length ? 1 : 0),
      reps: goodReps || reps || (allReps.length ? allReps.filter((r) => !r.partial).length : 1),
      partialReps,
      formScore: fs.total || liveScore || 85,
      avgRom: fs.metrics.rangeOfMotion || (rom?.observedRange ?? exercise.expectedRom),
      avgSymmetry: (fs.metrics.stability || 85) / 100,
      bestRepScore: allReps.length ? Math.max(...allReps.map((r) => r.score || 85)) : 90,
      notes: "Completed with Ojas AI Vision Coach.",
      source: mode === "live" ? "mediapipe" : "simulation",
      hasVideo: false,
    });

    try {
      await fetch("/api/vision/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: exercise.name,
          durationMs: seconds * 1000,
          sets: record.sets,
          reps: record.reps,
          partialReps: record.partialReps,
          formScore: record.formScore,
          avgRom: record.avgRom,
          avgSymmetry: record.avgSymmetry,
          bestRepScore: record.bestRepScore,
          source: record.source,
        }),
      });
    } catch {
      /* local storage bridge already synced */
    }

    refreshData();
    setSaving(false);
    setWorkoutCompleteSummary(record);
    announce(`Workout recorded. Digital Twin updated with ${record.reps} reps.`);
    return record;
  }, [
    finishedSets,
    exercise,
    seconds,
    sets,
    reps,
    goodReps,
    partialReps,
    liveScore,
    rom,
    mode,
    refreshData,
    announce,
  ]);

  const stopWorkout = useCallback(async () => {
    setWorkoutRunning(false);
    detectorRef.current?.stop();
    if (setRepsRef.current.length > 0 || finishedSets.length > 0 || reps > 0) {
      await persistSession();
    }
  }, [persistSession, finishedSets.length, reps]);

  // Main frame processing loop
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
      setPhase(detected.phase);
      setMovementPhase(detected.movementPhase);
      setConfidence(detected.confidence);

      const primary = detected.angles[exercise.primaryJoint] ?? 180;
      const ts = Date.now();
      tempo.update(detected.phase, ts);
      romT.update(primary);
      symT.update(detected.angles);

      const update = repCounter.update(primary, detected.phase, ts);

      if (update.completed && update.rep) {
        const romResult = romT.finalize(exercise);
        const symResult = symT.finalize();
        romT.endRep();
        romT.startRep();
        const tempoRep = tempo.finalizeRep();

        const repScore = scoreRep(
          {
            angles: detected.angles,
            rom: romResult,
            symmetry: symResult,
            tempo: tempoRep,
            partial: update.rep.partial,
          },
          exercise
        );

        const summary: RepSummary = {
          index: update.reps + update.partialReps,
          score: repScore.score,
          rom: romResult.observedRange,
          symmetryIndex: symResult.symmetryIndex,
          partial: update.rep.partial,
          issue: repScore.issue || update.rep.issue,
          why: repScore.why || update.rep.why,
          how: repScore.how || update.rep.how,
          loweringMs: update.rep.loweringMs,
          liftingMs: update.rep.liftingMs,
          timestamp: Date.now(),
        };

        const all = [...setRepsRef.current, summary];
        setRepsState(all);
        setReps(update.reps + update.partialReps);
        setGoodReps(update.reps);
        setPartialReps(update.partialReps);
        setRom(romResult);
        setSymmetry(symResult);
        if (tempoRep) setLastTempo(tempoRep);

        const fs = buildFormScore(all, exercise);
        setLiveScore(fs.total);
        setLiveMetrics(fs.metrics);
        setCoaching(buildCoaching(all, exercise, repScore.feedback));

        if (update.rep.partial) {
          announce("Partial rep. Go deeper to reach full range.");
          setPrimaryFeedback({
            what: summary.issue,
            why: summary.why,
            how: summary.how,
          });
        } else {
          if (repScore.score >= 88) announce("Excellent depth and control.");
          else if (repScore.feedback[0]?.cue) announce(repScore.feedback[0].cue);

          setPrimaryFeedback({
            what: summary.issue || "Good repetition.",
            why: summary.why || "Cadence and alignment within target tolerances.",
            how: summary.how || "Maintain this stability for the rest of the set.",
          });
        }

        // Check if set target reached
        if (all.length >= targetRepsPerSet) {
          finishSet();
        }
      } else if (now - lastFeedbackAt.current > 400) {
        lastFeedbackAt.current = now;
        const fb = liveFeedback(detected.angles, exercise);
        setFeedback(fb);
        if (fb.length > 0 && fb[0]?.what) {
          setPrimaryFeedback({
            what: fb[0].what,
            why: fb[0].why,
            how: fb[0].how,
          });
        }
        const single = scoreRep({ angles: detected.angles }, exercise);
        setLiveScore(single.score);
        setLiveMetrics(single.metrics);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutRunning, exercise, finishSet, targetRepsPerSet]);

  // Workout duration timer
  useEffect(() => {
    if (!workoutRunning) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [workoutRunning]);

  // Rest countdown timer
  useEffect(() => {
    if (!inRest || restSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRestSeconds((r) => {
        if (r <= 1) {
          setInRest(false);
          announce("Rest complete. Begin the next set.");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [inRest, restSeconds, announce]);

  // FPS Calculator
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

  useEffect(() => () => {
    detectorRef.current?.dispose();
  }, []);

  return {
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
    exerciseId,
    setExerciseId,
    exercise,
    exerciseGroups: EXERCISE_GROUPS,
    mode,
    setMode: changeMode,
    liveReady,
    voiceOn,
    toggleVoice,
    showSkeleton,
    setShowSkeleton,
    showAngles,
    setShowAngles,
    workoutRunning,
    startWorkout,
    stopWorkout,
    seconds,
    fps,
    frame,
    phase,
    movementPhase,
    confidence,
    reps,
    goodReps,
    partialReps,
    sets,
    targetRepsPerSet,
    currentSetReps,
    finishedSets,
    selectedRep,
    setSelectedRep,
    inRest,
    restSeconds,
    liveScore,
    liveMetrics,
    feedback,
    primaryFeedback,
    coaching,
    rom,
    symmetry,
    lastTempo,
    manualRep,
    manualPartial,
    finishSet,
    safetyMessage,
    setSafetyMessage,
    painReported,
    reportPain,
    sessions,
    analytics,
    persistSession,
    saving,
    workoutCompleteSummary,
    setWorkoutCompleteSummary,
    refresh: refreshData,
  };
}

export type FormCoachApi = ReturnType<typeof useFormCoach>;
