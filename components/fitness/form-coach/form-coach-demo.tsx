"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  EXERCISE_REFERENCES,
  formAnalysisService,
  FormAnalysisResult,
} from "@/lib/vision/form-analysis-service";

export function FormCoachDemo() {
  const [selectedExercise, setSelectedExercise] = useState<string>("squat");
  const [isPlaying, setIsPlaying] = useState(true);
  const [formQualitySetting, setFormQualitySetting] = useState<"optimal" | "shallow" | "deep">("optimal");
  const [repCount, setRepCount] = useState(6);
  const [currentScore, setCurrentScore] = useState(94);
  const [analysisResult, setAnalysisResult] = useState<FormAnalysisResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | 0>(0);
  const phaseRef = useRef<number>(0);

  const exerciseRef = EXERCISE_REFERENCES[selectedExercise] || EXERCISE_REFERENCES["squat"];

  // Run real-time biomechanical simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localPhase = 0;
    let repTriggered = false;

    const render = () => {
      if (isPlaying) {
        localPhase += 0.035;
        phaseRef.current = localPhase;
      }

      const sinVal = Math.sin(localPhase);
      // Determine joint angles based on motion cycle & quality setting
      let kneeAngle = 168 - Math.abs(sinVal) * (formQualitySetting === "shallow" ? 50 : formQualitySetting === "deep" ? 85 : 74);
      let hipAngle = 150 - Math.abs(sinVal) * (formQualitySetting === "shallow" ? 40 : 65);
      let spineAngle = 15 + Math.abs(sinVal) * (formQualitySetting === "shallow" ? 10 : 15);
      let elbowAngle = 160 - Math.abs(sinVal) * (formQualitySetting === "shallow" ? 55 : 85);
      let shoulderAngle = 85 + Math.sin(localPhase) * 15;

      // Count reps on bottom turnaround
      if (sinVal > 0.95 && !repTriggered) {
        setRepCount((r) => r + 1);
        repTriggered = true;
      } else if (sinVal < 0.2) {
        repTriggered = false;
      }

      const activeAngles: Record<string, number> = {
        kneeAngle,
        hipAngle,
        spineAngle,
        elbowAngle,
        shoulderAngle,
      };

      const result = formAnalysisService.analyzeForm(activeAngles, selectedExercise);
      setCurrentScore(result.score);
      setAnalysisResult(result);

      // Draw onto canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#13141a");
      grad.addColorStop(1, "#0d0e12");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid guidelines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw ground line
      ctx.strokeStyle = "rgba(173, 198, 255, 0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, canvas.height - 40);
      ctx.lineTo(canvas.width - 40, canvas.height - 40);
      ctx.stroke();

      // Kinematic skeletal model points
      const cx = canvas.width / 2;
      const cy = canvas.height - 40;

      // Squat / lower body kinematics
      const squatDepth = (168 - kneeAngle) * 1.8;
      const hipX = cx - 15;
      const hipY = cy - 190 + squatDepth;
      const kneeX = cx + 35;
      const kneeY = cy - 100 + squatDepth * 0.4;
      const ankleX = cx + 25;
      const ankleY = cy - 10;
      const shoulderX = cx + 5;
      const shoulderY = hipY - 110;
      const headX = shoulderX + 5;
      const headY = shoulderY - 35;

      // Draw skeleton bones
      ctx.strokeStyle = result.score >= 85 ? "#10b981" : result.score >= 70 ? "#f59e0b" : "#ef4444";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      // Head
      ctx.beginPath();
      ctx.arc(headX, headY, 16, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(173, 198, 255, 0.2)";
      ctx.fill();
      ctx.stroke();

      // Spine / Torso
      ctx.beginPath();
      ctx.moveTo(headX, headY + 16);
      ctx.lineTo(shoulderX, shoulderY);
      ctx.lineTo(hipX, hipY);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(ankleX, ankleY);
      ctx.stroke();

      // Arms (Barbell grip position)
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(shoulderX + 25, shoulderY + 45);
      ctx.lineTo(shoulderX + 35, shoulderY + 25);
      ctx.stroke();

      // Joint Landmark Nodes
      const joints = [
        { x: headX, y: headY, name: "Head" },
        { x: shoulderX, y: shoulderY, name: "Shoulder" },
        { x: hipX, y: hipY, name: "Hip" },
        { x: kneeX, y: kneeY, name: "Knee" },
        { x: ankleX, y: ankleY, name: "Ankle" },
      ];

      joints.forEach((j) => {
        ctx.beginPath();
        ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Joint Angle HUD Overlays
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillStyle = "#10b981";
      ctx.fillText(`Knee: ${Math.round(kneeAngle)}°`, kneeX + 15, kneeY);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`Hip: ${Math.round(hipAngle)}°`, hipX - 85, hipY);
      ctx.fillStyle = "#facc15";
      ctx.fillText(`Spine: ${Math.round(spineAngle)}°`, shoulderX - 90, shoulderY + 40);

      // Top corner overlay
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.fillStyle = "#adc6ff";
      ctx.fillText(`● CV TRACKING ACTIVE • 60 FPS`, 20, 30);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, formQualitySetting, selectedExercise]);

  return (
    <div className="space-y-6 text-left">
      {/* Exercise Selector Tabs */}
      <GlassCard className="p-4 border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#131418]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-white/50 mr-1">Exercise:</span>
          {Object.entries(EXERCISE_REFERENCES).map(([key, refItem]) => (
            <button
              key={key}
              onClick={() => setSelectedExercise(key)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                selectedExercise === key
                  ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {refItem.name}
            </button>
          ))}
        </div>

        {/* Quality Simulation Presets */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-white/50">Form:</span>
          <button
            onClick={() => setFormQualitySetting("optimal")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              formQualitySetting === "optimal"
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            Optimal (95°)
          </button>
          <button
            onClick={() => setFormQualitySetting("shallow")}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              formQualitySetting === "shallow"
                ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                : "bg-white/5 text-white/50 hover:text-white"
            }`}
          >
            Shallow (115°)
          </button>
        </div>
      </GlassCard>

      {/* Main Interactive Stage */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Canvas Demonstration */}
        <GlassCard className="p-4 border-white/15 relative overflow-hidden space-y-3 bg-[#101115]">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{exerciseRef.name} Vision Tracker</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white hover:bg-white/20 transition"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => setRepCount(0)}
                className="rounded-lg bg-white/10 p-1 text-white/70 hover:text-white hover:bg-white/20 transition"
                title="Reset Reps"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-[4/3] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-white/50 block font-bold uppercase">Form Score</span>
              <span className={`text-base font-extrabold ${currentScore >= 85 ? "text-emerald-400" : currentScore >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                {currentScore}/100
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-white/50 block font-bold uppercase">Reps Logged</span>
              <span className="text-base font-extrabold text-[#adc6ff]">{repCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="text-[10px] text-white/50 block font-bold uppercase">Target Depth</span>
              <span className="text-base font-extrabold text-emerald-300">
                {exerciseRef.targetAngles.kneeAngle?.ideal || 95}°
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Real-Time Form Analysis & Corrections */}
        <div className="space-y-4">
          <GlassCard className="p-5 border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#adc6ff] tracking-wider block">Real-Time Biomechanics</span>
                <h4 className="text-lg font-bold text-white">Movement Analysis</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                currentScore >= 85
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : currentScore >= 70
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {analysisResult?.repQuality.replace("_", " ") || "GOOD"}
              </span>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white/60">Execution Quality</span>
                <span className="text-white">{currentScore}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    currentScore >= 85
                      ? "bg-gradient-to-r from-teal-400 to-emerald-400"
                      : currentScore >= 70
                      ? "bg-gradient-to-r from-amber-400 to-yellow-400"
                      : "bg-gradient-to-r from-rose-500 to-red-400"
                  }`}
                  animate={{ width: `${currentScore}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Target Angle Bounds */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-white/50">Tracked Angles:</span>
              <div className="grid gap-2">
                {Object.entries(exerciseRef.targetAngles).map(([k, angleData]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/70 font-semibold">{angleData.label}</span>
                    <span className="text-[#adc6ff] font-mono font-bold">
                      {angleData.min}° – {angleData.max}° (Ideal: {angleData.ideal}°)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Issues & Corrections */}
            {analysisResult && analysisResult.issues.length > 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  Form Deviation Detected
                </div>
                {analysisResult.issues.map((iss, i) => (
                  <p key={i} className="text-xs text-amber-200/80 pl-5">
                    • {iss}
                  </p>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Pristine biomechanical range of motion detected!
              </div>
            )}

            {/* Digital Twin Integration Loop Note */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs">
              <span className="font-bold text-[#adc6ff] flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Cpu className="h-3.5 w-3.5" />
                Digital Twin Auto-Regulation
              </span>
              <p className="text-white/70 leading-relaxed">
                {analysisResult?.digitalTwinImpact || "Form quality verified: Progressive load approved for next workout."}
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
