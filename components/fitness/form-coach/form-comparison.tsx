"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Info,
  Scale,
  Video,
  Dumbbell,
  AlertTriangle,
} from "lucide-react";
import { SkeletonOverlay } from "./skeleton-overlay";
import { snapshotPose, getExercise } from "@/lib/vision";
import type { JointMap, JointName } from "@/lib/vision/types";

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

export function FormComparison() {
  const [activeExercise, setActiveExercise] = useState<"squat" | "press">("squat");

  // Fetch simulated poses (0.5 progress matches deepest bottom position)
  const exercise = getExercise(activeExercise);
  const demoPoseFrame = snapshotPose(exercise, 0.5);
  const demoJoints = poseFrameToJointMap(demoPoseFrame.landmarks);
  
  // Simulated user pose with minor errors (e.g., higher hips, forward knee lean)
  const userJoints = { ...demoJoints };
  if (activeExercise === "squat") {
    userJoints.leftKnee = { ...userJoints.leftKnee, x: userJoints.leftKnee.x + 0.05, y: userJoints.leftKnee.y - 0.04 };
    userJoints.leftHip = { ...userJoints.leftHip, y: userJoints.leftHip.y - 0.05 };
  } else {
    userJoints.leftElbow = { ...userJoints.leftElbow, y: userJoints.leftElbow.y - 0.06 };
  }

  const comparisons = {
    squat: [
      { metric: "Torso Angle (Lean)", demo: "18° (Proud chest)", user: "32° (Excessive lean)", state: "warn", cue: "Keep your chest up and drive through your heels." },
      { metric: "Flexion Depth", demo: "92° (Below parallel)", user: "108° (Shallow range)", state: "danger", cue: "Squat lower until thighs are parallel to the floor." },
      { metric: "Knee Tracking", demo: "Stable (Aligned)", user: "Inward drift (Caving)", state: "danger", cue: "Screw your knees outward. Keep them tracking over your toes." },
      { metric: "Foot Placement", demo: "Flat (Equal force)", user: "Heels lifting slightly", state: "warn", cue: "Spread the floor. Maintain weight over mid-foot." },
    ],
    press: [
      { metric: "Elbow Path", demo: "45° tucked", user: "65° flared", state: "danger", cue: "Tuck elbows slightly to save shoulder joints from excessive shear stress." },
      { metric: "Plank Line", demo: "0° (Rigid body)", user: "14° (Sagging hips)", state: "warn", cue: "Squeeze your glutes and engage your core to lock a straight line." },
      { metric: "Lockout Symmetry", demo: "Equal balance", user: "Left elbow lagging", state: "danger", cue: "Push evenly through both palms. Reduce weight if needed." },
    ]
  };

  const currentComps = comparisons[activeExercise];

  return (
    <div className="space-y-6 text-left">
      {/* Exercise select cards */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveExercise("squat")}
          className={`flex-1 rounded-2xl p-4 border text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeExercise === "squat"
              ? "bg-[#adc6ff]/15 border-white/15 text-white"
              : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
          }`}
        >
          <Dumbbell className="h-4 w-4 text-[#adc6ff]" /> Barbell Squat Analysis
        </button>
        <button
          onClick={() => setActiveExercise("press")}
          className={`flex-1 rounded-2xl p-4 border text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeExercise === "press"
              ? "bg-[#adc6ff]/15 border-white/15 text-white"
              : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
          }`}
        >
          <Video className="h-4 w-4 text-cyan-400" /> Push-up Biomechanics
        </button>
      </div>

      {/* Split Poses Screens */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Perfect Form Demo */}
        <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs font-bold text-white/60">
            <Sparkles className="h-4 w-4 text-yellow-400" /> Demonstration Video (Pro Form)
          </div>
          <div className="my-4 aspect-video rounded-2xl border border-white/10 bg-[#08090c] overflow-hidden relative flex items-center justify-center">
            <SkeletonOverlay
              pose={demoJoints}
              mirrored={false}
              showAngles={true}
              angles={activeExercise === "squat" ? { kneeAngle: 92, hipAngle: 75 } : { elbowAngle: 70 }}
            />
            <div className="absolute top-3 left-3 bg-emerald-500/90 rounded-full px-2 py-0.5 text-[8.5px] font-black text-black">
              IDEAL POSITION
            </div>
          </div>
        </GlassCard>

        {/* Right: User Form */}
        <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-xs font-bold text-white/60">
            <AlertTriangle className="h-4 w-4 text-rose-400" /> Your Form Analysis (Under load)
          </div>
          <div className="my-4 aspect-video rounded-2xl border border-white/10 bg-[#08090c] overflow-hidden relative flex items-center justify-center">
            <SkeletonOverlay
              pose={userJoints}
              mirrored={false}
              showAngles={true}
              angles={activeExercise === "squat" ? { kneeAngle: 108, hipAngle: 90 } : { elbowAngle: 85 }}
              className="text-rose-400"
            />
            <div className="absolute top-3 left-3 bg-rose-500/90 rounded-full px-2 py-0.5 text-[8.5px] font-black text-white">
              DEVIATIONS DETECTED
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Deviations / Differences list */}
      <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="h-4.5 w-4.5 text-[#adc6ff]" /> Biomechanical Deviation Audit
        </h4>
        <div className="space-y-3">
          {currentComps.map((comp, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-white/40 block text-[9.5px] uppercase">{comp.metric}</span>
                <div className="flex gap-4 items-center">
                  <span className="text-emerald-400 font-semibold">Demo: {comp.demo}</span>
                  <span className="text-white/50">vs</span>
                  <span className={comp.state === "danger" ? "text-rose-400 font-bold" : "text-amber-400 font-bold"}>
                    You: {comp.user}
                  </span>
                </div>
                <p className="text-[10.5px] text-white/80 italic leading-relaxed pt-1">
                  💡 <strong>Correction:</strong> {comp.cue}
                </p>
              </div>
              <span
                className={`shrink-0 text-[9px] px-2 py-0.5 rounded font-black uppercase self-start sm:self-center ${
                  comp.state === "danger"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                }`}
              >
                {comp.state === "danger" ? "High Priority" : "Monitor"}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="text-[10.5px] text-white/40 leading-relaxed border-white/5">
        <Info className="h-3.5 w-3.5 inline text-white/30 mr-1.5" />
        Comparing joint angles helps highlight leverage limits. Always adjust load to maintain safety in compromised ranges of motion.
      </GlassCard>
    </div>
  );
}
