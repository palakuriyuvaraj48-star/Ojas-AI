"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Activity,
  Award,
  Sparkles,
  Info,
  Sliders,
  Scale,
  Brain,
  Zap,
  TrendingUp,
  Heart,
  Flame,
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
} from "recharts";

type Tab = "lab" | "mobility" | "timeline" | "balance";

interface JointDetail {
  name: string;
  rom: string;
  symmetry: string;
  status: "Excellent" | "Stable" | "Review" | "Attention";
  confidence: number;
  drill: string;
  x: number;
  y: number;
}

const JOINTS: Record<string, JointDetail> = {
  neck: { name: "Cervical Spine (Neck)", rom: "42° flex", symmetry: "Balanced", status: "Excellent", confidence: 97, drill: "Chin tucks & neutral neck alignment drills.", x: 50, y: 15 },
  shoulder: { name: "Shoulders", rom: "165° flexion", symmetry: "Left 162° / Right 168°", status: "Excellent", confidence: 96, drill: "Wall slides & shoulder dislocates with bands.", x: 35, y: 22 },
  elbow: { name: "Elbows", rom: "145° flexion", symmetry: "Left 142° / Right 148°", status: "Stable", confidence: 95, drill: "Eccentric wrist extensions & tricep releases.", x: 23, y: 35 },
  wrist: { name: "Wrists", rom: "72° extension", symmetry: "Balanced", status: "Stable", confidence: 94, drill: "Wrist extensions & dynamic palm presses.", x: 15, y: 48 },
  spine: { name: "Thoracic Spine (Back)", rom: "24° rotation", symmetry: "Balanced", status: "Review", confidence: 92, drill: "Cat-cow stretches & foam roller thoracic extensions.", x: 50, y: 32 },
  hip: { name: "Lumbo-Pelvic (Hips)", rom: "115° flexion", symmetry: "Left 118° / Right 112°", status: "Review", confidence: 91, drill: "90/90 hip flossing & pigeon stretches.", x: 38, y: 50 },
  knee: { name: "Knees", rom: "128° flexion", symmetry: "Left valgus cave / Right stable", status: "Attention", confidence: 93, drill: "Goblet squats with mini-bands around knees.", x: 40, y: 70 },
  ankle: { name: "Ankles", rom: "18° dorsiflexion", symmetry: "Left 15° / Right 20°", status: "Attention", confidence: 89, drill: "Ankle flossing & calf wall stretches.", x: 42, y: 88 },
};

export function BiomechanicsView() {
  const [tab, setTab] = useState<Tab>("lab");
  const [selectedJoint, setSelectedJoint] = useState<string>("knee");
  const [exercise, setExercise] = useState<string>("squat");

  // Fatigue inputs
  const [sleep, setSleep] = useState<number>(7.0);
  const [soreness, setSoreness] = useState<string>("moderate"); // low, moderate, high

  const joint = JOINTS[selectedJoint] || JOINTS.knee;

  // Fatigue-aware coaching logic
  const getFatigueRecommendation = () => {
    if (soreness === "high" || sleep < 6.0) {
      return {
        cue: "Elevated fatigue signature. Reduce weight by 15% today, focus on range of motion over absolute load.",
        confidence: 94,
        benefit: "Minimizes lower lumbar shear stress and reduces injury risk under fatigue.",
      };
    }
    if (soreness === "moderate") {
      return {
        cue: "Maintain current workload. Focus on controlled tempo (3s lowering phase) to optimize muscle tracking.",
        confidence: 88,
        benefit: "Improves eccentric control and helps stabilize knee path deviations.",
      };
    }
    return {
      cue: "Optimized recovery state. Clean form signals readiness for overload testing.",
      confidence: 96,
      benefit: "Allows safe strength progression while maintaining perfect alignment.",
    };
  };

  const fatigueRecommendation = getFatigueRecommendation();

  // Recharts Radar movement scores
  const scoreData = [
    { subject: "Efficiency", A: 88, fullMark: 100 },
    { subject: "Stability", A: 91, fullMark: 100 },
    { subject: "Control", A: 85, fullMark: 100 },
    { subject: "Tempo", A: 82, fullMark: 100 },
    { subject: "Symmetry", A: 94, fullMark: 100 },
    { subject: "ROM", A: 78, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Sub Tabs Navigation */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "lab", label: "Movement Lab" },
          { id: "mobility", label: "Mobility Assessment" },
          { id: "timeline", label: "Technique Timeline" },
          { id: "balance", label: "Balance & Symmetry" },
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

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "lab" && (
            <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
              {/* Interactive body overlay & details */}
              <GlassCard className="p-5 grid md:grid-cols-[1.1fr_0.9fr] gap-6 border-white/5 bg-[rgba(24,23,26,0.35)]">
                
                {/* SVG Human wireframe overlay */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-xs uppercase tracking-wider">
                    Interactive Joint Map
                  </h3>
                  <div className="relative aspect-[3/4] bg-[#0c0d12] rounded-3xl border border-white/10 flex items-center justify-center p-4">
                    <svg viewBox="0 0 100 120" className="w-full h-full opacity-80">
                      {/* Body outline shape */}
                      <path
                        d="M50,10 C53,10 55,14 55,18 C55,22 53,24 50,24 C47,24 45,22 45,18 C45,14 47,10 50,10 Z M50,24 L50,50 M35,26 L65,26 M35,26 L23,45 L15,62 M65,26 L77,45 L85,62 M38,50 L40,78 L42,105 M62,50 L60,78 L58,105"
                        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeLinecap="round"
                      />
                      {/* Clickable Joint Pins */}
                      {Object.entries(JOINTS).map(([key, item]) => (
                        <circle
                          key={key}
                          cx={item.x}
                          cy={item.y}
                          r={key === selectedJoint ? 4 : 2.5}
                          className={`cursor-pointer transition-all duration-300 ${
                            key === selectedJoint
                              ? "fill-cyan-400 stroke-cyan-200 stroke-2 animate-pulse"
                              : "fill-white/40 hover:fill-cyan-300"
                          }`}
                          onClick={() => setSelectedJoint(key)}
                        />
                      ))}
                    </svg>
                    <div className="absolute bottom-4 right-4 bg-black/60 rounded-xl px-2.5 py-1 text-[9px] font-mono text-white/50">
                      Hover/click joint markers
                    </div>
                  </div>
                </div>

                {/* Selected Joint metrics details card */}
                <div className="flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-3">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] text-white/40 block uppercase tracking-wider font-bold">Selected Joint</span>
                      <h4 className="text-lg font-black text-white">{joint.name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded-xl p-2.5">
                        <span className="text-[9px] text-white/40 block">ROM Estimate</span>
                        <span className="font-bold text-white block mt-0.5">{joint.rom}</span>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5">
                        <span className="text-[9px] text-white/40 block">Confidence</span>
                        <span className="font-bold text-cyan-300 block mt-0.5">{joint.confidence}%</span>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-white/40 block text-[9.5px] uppercase">Left vs Right Symmetry</span>
                      <p className="text-white font-bold">{joint.symmetry}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-white/40 block text-[9.5px] uppercase">Biomechanical Status</span>
                      <span className={`inline-block font-black px-2 py-0.5 rounded text-[10px] ${
                        joint.status === "Excellent" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                        joint.status === "Stable" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}>
                        {joint.status}
                      </span>
                    </div>

                    <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-xl p-3 text-xs space-y-1">
                      <span className="font-bold text-[#adc6ff] block text-[9.5px] uppercase">Targeted mobility drill</span>
                      <p className="text-white/80 leading-relaxed text-[11px]">{joint.drill}</p>
                    </div>
                  </div>

                  <p className="text-[9.5px] text-white/30 italic leading-relaxed">
                    ⚠️ Camera measurements represent dynamic visual estimations and do not replace professional physical diagnostic services.
                  </p>
                </div>
              </GlassCard>

              {/* Radar Scores & Fatigue inputs column */}
              <div className="space-y-6">
                
                {/* Radar chart of Movement efficiency */}
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Movement Efficiency Profiles</h4>
                  <div className="h-52 flex items-center justify-center">
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

                {/* Fatigue inputs panel */}
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-4 w-4 text-[#adc6ff]" /> Fatigue parameters
                  </h4>
                  
                  <div className="space-y-3 text-xs text-white/70">
                    <label className="block space-y-1.5">
                      <div className="flex justify-between">
                        <span>Sleep duration (last night)</span>
                        <span className="font-black text-white">{sleep} hrs</span>
                      </div>
                      <input
                        type="range" min="4" max="10" step="0.5"
                        value={sleep}
                        onChange={(e) => setSleep(parseFloat(e.target.value))}
                        className="w-full accent-[#adc6ff] bg-white/10 rounded-full h-1"
                      />
                    </label>

                    <div className="space-y-1.5">
                      <span>Muscle Soreness (DOMS)</span>
                      <div className="flex gap-2">
                        {["low", "moderate", "high"].map((level) => (
                          <button
                            key={level}
                            onClick={() => setSoreness(level)}
                            className={`flex-1 rounded-xl py-2 text-[10px] font-bold border transition capitalize ${
                              soreness === level
                                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                : "bg-white/5 border-transparent text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
                
                {/* Adaptive recommendations cards */}
                <GlassCard className="p-5 border-white/5 bg-gradient-to-br from-[var(--accent)]/5 to-transparent relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <Brain className="h-4.5 w-4.5 text-[#adc6ff] animate-pulse" /> Fatigue-Adaptive Coaching Recommendation
                    </h4>
                    
                    <p className="text-xs text-white/80 leading-relaxed font-semibold">
                      💡 {fatigueRecommendation.cue}
                    </p>

                    <div className="pt-2 space-y-2 border-t border-white/5 text-[10px] text-white/50">
                      <div className="flex justify-between">
                        <span>Expected Benefit:</span>
                        <span className="text-[#adc6ff] font-medium text-right max-w-[200px]">{fatigueRecommendation.benefit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Confidence Level:</span>
                        <span className="font-bold text-emerald-400">{fatigueRecommendation.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

              </div>
            </div>
          )}

          {tab === "mobility" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Mobility assessments */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <Scale className="h-4.5 w-4.5 text-cyan-400" /> Mobility Audit
                </h4>
                <div className="space-y-3">
                  {[
                    { joint: "Ankles (Dorsiflexion)", score: "18° / Target: 20°", status: "Attention", color: "text-rose-400", bg: "bg-rose-500/5 border-rose-500/10", explanation: "Restricted ankle mobility triggers knee collapse and early heels lift in deep squats." },
                    { joint: "Hips (Flexion/Rotation)", score: "115° / Target: 120°", status: "Review", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10", explanation: "Tight hip capsule limits hip crease depth and causes minor lumbar curvature." },
                    { joint: "Shoulder girdle", score: "165° / Target: 170°", status: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10", explanation: "Excellent extension and flex patterns allow stable overhead press trajectories." },
                    { joint: "Thoracic extension", score: "24° / Target: 25°", status: "Stable", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10", explanation: "Solid upper back mobility assists in holding neutral posture under load." },
                  ].map((mob, idx) => (
                    <div key={idx} className={`p-3.5 rounded-2xl border ${mob.bg} space-y-1`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{mob.joint}</span>
                        <span className={`font-black text-[10px] ${mob.color}`}>{mob.score}</span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed pt-1">
                        {mob.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Corrective drills */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> Recommanded corrective drills
                </h4>
                <div className="space-y-3 text-xs text-white/70">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                    <p className="font-black text-white">1. Calf wall dorsiflexion floss</p>
                    <p className="text-white/40 text-[10px]">Sets: 2 • Reps: 10 per leg • Focus: Eccentric control</p>
                    <p className="leading-relaxed text-white/60 pt-1">
                      Set up 10cm from wall, drive knee straight forward to touch wall without lifting heel. Hold for 3s.
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                    <p className="font-black text-white">2. 90/90 Hip flossing</p>
                    <p className="text-white/40 text-[10px]">Sets: 2 • duration: 60s • Focus: Internal/External rotation</p>
                    <p className="leading-relaxed text-white/60 pt-1">
                      Sit with legs bent at 90-degree angles. Rotate hips side to side, keeping chest upright.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "timeline" && (
            <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="h-4.5 w-4.5 text-[#adc6ff]" /> Biomechanical timeline
              </h4>
              <div className="space-y-4 text-xs text-white/70">
                {[
                  { title: "Knee stability improvement", date: "July 12, 2026", desc: "Squat knee valgus caving reduced by 22% compared to last week following stance adjustments." },
                  { title: "Ankle restriction relapse", date: "July 10, 2026", desc: "Slight increase in forward spinal tilt due to restricted ankle dorsiflexion mobility under high loads." },
                  { title: "Symmetry balancing achieved", date: "July 08, 2026", desc: "Left/right push-up weight balance symmetry index reached 94% following single-arm unilateral drills." },
                ].map((item, idx) => (
                  <div key={idx} className="border-l-2 border-[#adc6ff]/20 pl-4 py-1 relative">
                    <span className="absolute -left-1.5 top-2.5 h-3.5 w-3.5 rounded-full bg-[#adc6ff] border-4 border-[#131315]" />
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-[9.5px] text-white/40 mt-0.5">{item.date}</p>
                    <p className="mt-1.5 leading-relaxed text-white/60">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {tab === "balance" && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Static vs dynamic balance */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Balance & weight distribution</h4>
                <div className="space-y-3">
                  {[
                    { metric: "Static Balance", score: "96%", desc: "Stable posture holding bottom squat pause." },
                    { metric: "Dynamic Balance", score: "88%", desc: "Controlled path transit during rapid concentric push." },
                    { metric: "Weight Shifting", score: "Left 48% / Right 52%", desc: "Equal foot force distribution under bar loads." },
                  ].map((bal, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{bal.metric}</span>
                        <span className="font-black text-cyan-300 text-[10px]">{bal.score}</span>
                      </div>
                      <p className="text-[10px] text-white/40">{bal.desc}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Symmetry timeline chart */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs text-white/60">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-cyan-300" /> Joint Stability Trends
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Upper Body Symmetry</span>
                    <span className="font-bold text-white">94%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Lower Body Symmetry</span>
                    <span className="font-bold text-white">88%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Core Stability Index</span>
                    <span className="font-bold text-white">92%</span>
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
