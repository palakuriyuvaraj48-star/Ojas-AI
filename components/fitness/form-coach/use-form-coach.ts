"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PoseDetector, CameraService, VoiceCoach, RepCounter, TempoTracker, RomTracker,
  SymmetryTracker, scoreRep, liveFeedback, buildFormScore, buildCoaching, saveSession,
  getSessions, getExercise, EXERCISE_GROUPS, computeAnalytics,
  type CameraMode, type CameraPreferences, type DetectedFrame, type ExerciseDefinition,
  type FormFeedback, type LiveCoaching,   type RomState, type SymmetryState, type SetRecord,
  type CameraSessionRecord, type AnalyticsSummary, type FormScore,
} from "@/lib/vision";

const initialPreferences: CameraPreferences = {
  facingMode: "user", width: 1280, height: 720, frameRate: 30, mirrored: true,
};

function errorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Camera access was blocked. Allow access in your browser settings, then try again.";
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
  const [confidence, setConfidence] = useState(0);

  const [reps, setReps] = useState(0);
  const [partialReps, setPartialReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [currentSetReps, setCurrentSetReps] = useState<RepSummary[]>([]);
  const [finishedSets, setFinishedSets] = useState<SetRecord[]>([]);

  const [liveScore, setLiveScore] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState<FormScore["metrics"]>({
    stability: 0, consistency: 0, tempo: 0, control: 0, rangeOfMotion: 0,
  });
  const [feedback, setFeedback] = useState<FormFeedback[]>([]);
  const [coaching, setCoaching] = useState<LiveCoaching>({
    strengths: ["Ready when you are."], improvements: [], corrections: [exercise.cues[0]], summary: "Start a set to begin coaching.",
  });
  const [rom, setRom] = useState<RomState | null>(null);
  const [symmetry, setSymmetry] = useState<SymmetryState | null>(null);
  const [lastTempo, setLastTempo] = useState<{ loweringMs: number; liftingMs: number; pauseMs: number } | null>(null);

  const [safetyMessage, setSafetyMessage] = useState<string | null>(null);
  const [painReported, setPainReported] = useState(false);

  const [sessions, setSessions] = useState<CameraSessionRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [saving, setSaving] = useState(false);

  if (!detectorRef.current) detectorRef.current = new PoseDetector(exercise, "simulation");
  if (!voiceRef.current) voiceRef.current = new VoiceCoach();

  const refreshData = useCallback(() => {
    setSessions(getSessions());
    setAnalytics(computeAnalytics(getSessions()));
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  useEffect(() => {
    detectorRef.current?.setExercise(exercise);
    setCoaching((c) => ({ ...c, corrections: [exercise.cues[0]] }));
  }, [exercise]);

  const changeMode = useCallback(async (next: CameraMode) => {
    if (next === "live") {
      const ok = await detectorRef.current?.initLive();
      setLiveReady(Boolean(ok));
      if (!ok) setModeState("simulation");
      else setModeState("live");
    } else {
      setModeState("simulation");
      setLiveReady(false);
    }
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const service = serviceRef.current ?? new CameraService();
      serviceRef.current = service;
      const stream = await service.start(preferences);
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setDevices(await service.listDevices());
      setStatus("live");
    } catch (caught) { setStatus("error"); setError(errorMessage(caught)); }
  }, [preferences]);

  const stop = useCallback(() => {
    serviceRef.current?.stop();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle"); setFps(0);
  }, []);

  const togglePause = useCallback(() => {
    if (status === "live") { serviceRef.current?.pause(); setStatus("paused"); }
    else { serviceRef.current?.resume(); setStatus("live"); }
  }, [status]);

  const switchCamera = useCallback(() => {
    setPreferences((p) => ({ ...p, facingMode: p.facingMode === "user" ? "environment" : "user", mirrored: p.facingMode === "environment" }));
    window.setTimeout(() => void start(), 0);
  }, [start]);

  const announce = useCallback((text: string) => {
    if (voiceOn && voiceRef.current) voiceRef.current.speak(text);
  }, [voiceOn]);

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => { const nv = !v; voiceRef.current?.setMuted(nv); return nv; });
  }, []);

  const setRepsState = useCallback((list: RepSummary[]) => {
    setRepsRef.current = list;
    setCurrentSetReps(list);
  }, []);

  const startWorkout = useCallback(() => {
    setWorkoutRunning(true);
    setSeconds(0);
    setReps(0);
    setPartialReps(0);
    setSets(0);
    setCurrentSetReps([]);
    setFinishedSets([]);
    setSafetyMessage(null);
    setPainReported(false);
    setRepsState([]);
    detectorRef.current?.start();
    announce("Workout started. Keep your form controlled.");
  }, [announce, setRepsState]);

  const manualRep = useCallback(() => {
    setReps((r) => r + 1);
    const summary: RepSummary = {
      score: liveScore || 80, rom: rom?.observedRange ?? exercise.expectedRom, symmetryIndex: symmetry?.symmetryIndex ?? 1, partial: false,
    };
    setRepsState([...setRepsRef.current, summary]);
    announce("Rep added.");
  }, [liveScore, rom, symmetry, exercise, announce, setRepsState]);

  const manualPartial = useCallback(() => {
    setPartialReps((p) => p + 1);
    announce("Partial rep noted.");
  }, [announce]);

  const reportPain = useCallback(() => {
    setPainReported(true);
    setSafetyMessage("If you feel pain, stop the set and let the area recover. Consider consulting a qualified physiotherapist or healthcare professional before training again. This app does not diagnose injuries.");
    announce("Please stop and rest if you are in pain.");
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
        reps: repsArr.length,
        partialReps: repsArr.filter((r) => r.partial).length,
        durationMs: 0,
        avgScore: score.total,
        avgRom: Math.round(repsArr.reduce((a, r) => a + r.rom, 0) / repsArr.length),
        avgSymmetry: Math.round((repsArr.reduce((a, r) => a + r.symmetryIndex, 0) / repsArr.length) * 100) / 100,
        tempoStartMs: 0, tempoEndMs: 0,
      };
      setSets(prev.length + 1);
      setCoaching(coachingOut);
      announce(coachingOut.corrections[0] ?? "Set complete.");
      return [...prev, record];
    });
    setRepsState([]);
  }, [exercise, feedback, announce, setRepsState]);

  const stopWorkout = useCallback(() => {
    setWorkoutRunning(false);
    detectorRef.current?.stop();
    if (setRepsRef.current.length > 0) finishSet();
  }, [finishSet]);

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
      if (!detected) { rafRef.current = requestAnimationFrame(tick); return; }

      setFrame(detected);
      setPhase(detected.phase);
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
        romT.endRep(); romT.startRep();
        const tempoRep = tempo.finalizeRep();
        const repScore = scoreRep({ angles: detected.angles, rom: romResult, symmetry: symResult, tempo: tempoRep }, exercise);
        const summary: RepSummary = {
          score: repScore.score,
          rom: romResult.observedRange,
          symmetryIndex: symResult.symmetryIndex,
          partial: update.rep.partial,
        };
        const all = [...setRepsRef.current, summary];
        setRepsState(all);
        setReps(update.reps);
        setPartialReps(update.partialReps);
        setRom(romResult);
        setSymmetry(symResult);
        if (tempoRep) setLastTempo(tempoRep);

        const fs = buildFormScore(all, exercise);
        setLiveScore(fs.total);
        setLiveMetrics(fs.metrics);
        setCoaching(buildCoaching(all, exercise, repScore.feedback));

        if (repScore.score >= 85) announce("Great rep.");
        else if (repScore.feedback[0]?.cue) announce(repScore.feedback[0].cue);

        if (repScore.score < 55 && update.reps > 3 && !painReported) {
          setSafetyMessage("Your movement quality dipped this rep. Consider reducing the weight or practicing the technique with a lighter load.");
        }
      } else if (now - lastFeedbackAt.current > 450) {
        lastFeedbackAt.current = now;
        const fb = liveFeedback(detected.angles, exercise);
        setFeedback(fb);
        const single = scoreRep({ angles: detected.angles }, exercise);
        setLiveScore(single.score);
        setLiveMetrics(single.metrics);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutRunning, exercise]);

  useEffect(() => {
    if (!workoutRunning) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [workoutRunning]);

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

  const persistSession = useCallback(async () => {
    setSaving(true);
    const allReps = [...finishedSets.flatMap(() => []), ...setRepsRef.current];
    const fs = buildFormScore(allReps.length ? allReps : setRepsRef.current, exercise);
    const record = saveSession({
      exercise: exercise.name,
      durationMs: seconds * 1000,
      sets: sets + (setRepsRef.current.length ? 1 : 0),
      reps: reps + setRepsRef.current.length,
      partialReps,
      formScore: fs.total,
      avgRom: fs.metrics.rangeOfMotion,
      avgSymmetry: fs.metrics.stability / 100,
      bestRepScore: allReps.length ? Math.max(...allReps.map((r) => r.score)) : 0,
      notes: "",
      source: mode === "live" ? "mediapipe" : "simulation",
      hasVideo: false,
    });
    try {
      await fetch("/api/vision/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise: exercise.name, durationMs: seconds * 1000, sets: record.sets, reps: record.reps,
          partialReps: record.partialReps, formScore: record.formScore, avgRom: record.avgRom,
          avgSymmetry: record.avgSymmetry, bestRepScore: record.bestRepScore, source: record.source,
        }),
      });
    } catch { /* local fallback already saved */ }
    refreshData();
    setSaving(false);
    return record;
  }, [reps, finishedSets, sets, partialReps, exercise, seconds, mode, refreshData]);

  useEffect(() => () => { detectorRef.current?.dispose(); }, []);

  return {
    videoRef, status, error, start, stop, togglePause, switchCamera, preferences, setPreferences,
    devices, fullscreen, setFullscreen,
    exerciseId, setExerciseId, exercise, exerciseGroups: EXERCISE_GROUPS,
    mode, setMode: changeMode, liveReady,
    voiceOn, toggleVoice, showSkeleton, setShowSkeleton, showAngles, setShowAngles,
    workoutRunning, startWorkout, stopWorkout, seconds, fps,
    frame, phase, confidence,
    reps, partialReps, sets, currentSetReps, finishedSets,
    liveScore, liveMetrics, feedback, coaching, rom, symmetry, lastTempo,
    manualRep, manualPartial, finishSet,
    safetyMessage, setSafetyMessage, painReported, reportPain,
    sessions, analytics, persistSession, saving, refresh: refreshData,
  };
}

export type FormCoachApi = ReturnType<typeof useFormCoach>;
