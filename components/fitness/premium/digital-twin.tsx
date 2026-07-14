"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  UserCheck,
  ShieldAlert,
  Zap,
  BarChart3,
  FileText,
  TrendingUp,
  Info,
  Calendar,
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export function DigitalTwin() {
  const [selectedMuscle, setSelectedMuscle] = useState<string>("quads");

  const muscles = [
    { id: "quads", name: "Quadriceps Femoris", activation: "90% (High)", status: "optimal" },
    { id: "lats", name: "Latissimus Dorsi", activation: "75% (Moderate)", status: "optimal" },
    { id: "chest", name: "Pectoralis Major", activation: "85% (Optimal)", status: "optimal" },
    { id: "hamstrings", name: "Biceps Femoris", activation: "35% (Under-Activated)", status: "warning" },
    { id: "shoulders", name: "Deltoid Cluster", activation: "60% (Fatigued)", status: "fatigued" },
  ];

  const twinScores = [
    { subject: "Recovery Speed", A: 88, fullMark: 100 },
    { subject: "Adaptability", A: 82, fullMark: 100 },
    { subject: "Fatigue Tolerance", A: 78, fullMark: 100 },
    { subject: "Muscle Growth Potential", A: 84, fullMark: 100 },
    { subject: "Fat Loss Potential", A: 91, fullMark: 100 },
    { subject: "Training Efficiency", A: 86, fullMark: 100 },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] text-left">
      
      {/* Left: 3D Wireframe Skeletal Twin Simulator */}
      <GlassCard className="space-y-6 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]" glow>
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#adc6ff] animate-pulse" /> Advanced Digital Twin Profile
          </h3>
          <p className="text-xs text-white/50 mt-0.5">Skeletal activation map &amp; metabolic potential diagnostics.</p>
        </div>

        {/* Dynamic Skeleton Mesh SVG */}
        <div className="relative aspect-[3/4] max-h-[420px] rounded-[24px] border border-white/5 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(173,198,255,0.08),_transparent_60%)]" />

          {/* Skeletal wireframe */}
          <svg className="w-full h-full text-white/20 stroke-1" viewBox="0 0 100 130">
            <line x1="0" y1="32.5" x2="100" y2="32.5" stroke="rgba(255,255,255,0.03)" />
            <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.03)" />
            <line x1="50" y1="0" x2="50" y2="130" stroke="rgba(255,255,255,0.03)" />

            <circle cx="50" cy="18" r="7" className="stroke-white/10 fill-none" />
            <circle cx="50" cy="18" r="5" className="stroke-cyan-500/30 fill-none animate-pulse" />
            <line x1="50" y1="25" x2="50" y2="65" className="stroke-white/30" />
            <line x1="36" y1="32" x2="64" y2="32" className="stroke-white/30" />

            {/* Arm highlights */}
            <path
              d="M 36 32 L 28 48 L 24 64"
              stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
              strokeWidth={selectedMuscle === "shoulders" ? "2.5" : "1"}
              fill="none"
            />
            <path
              d="M 64 32 L 72 48 L 76 64"
              stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
              strokeWidth={selectedMuscle === "shoulders" ? "2.5" : "1"}
              fill="none"
            />

            {/* Chest highlight */}
            <path
              d="M 40 42 Q 50 48 60 42"
              stroke={selectedMuscle === "chest" ? "#38bdf8" : "rgba(255,255,255,0.1)"}
              strokeWidth={selectedMuscle === "chest" ? "2.5" : "1"}
              fill="none"
            />

            {/* Lats highlight */}
            <path
              d="M 36 32 C 38 48 45 55 50 65 C 55 55 62 48 64 32"
              stroke={selectedMuscle === "lats" ? "#22d3ee" : "rgba(255,255,255,0.1)"}
              strokeWidth={selectedMuscle === "lats" ? "2.5" : "1"}
              fill="none"
            />

            <line x1="40" y1="65" x2="60" y2="65" className="stroke-white/30" />

            {/* Thigh highlights */}
            <path
              d="M 40 65 L 36 92 L 36 120"
              stroke={selectedMuscle === "quads" ? "#38bdf8" : selectedMuscle === "hamstrings" ? "#fb7185" : "rgba(255,255,255,0.2)"}
              strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "2.5" : "1"}
              fill="none"
            />
            <path
              d="M 60 65 L 64 92 L 64 120"
              stroke={selectedMuscle === "quads" ? "#38bdf8" : selectedMuscle === "hamstrings" ? "#fb7185" : "rgba(255,255,255,0.2)"}
              strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "2.5" : "1"}
              fill="none"
            />

            {/* Nodes */}
            <circle cx="50" cy="25" r="2" fill="#38bdf8" />
            <circle cx="36" cy="32" r="2.5" fill="#22d3ee" />
            <circle cx="64" cy="32" r="2.5" fill="#22d3ee" />
            <circle cx="40" cy="65" r="2.5" fill="#22d3ee" />
            <circle cx="60" cy="65" r="2.5" fill="#22d3ee" />
          </svg>

          <div className="absolute bottom-4 left-4 bg-black/60 rounded-xl px-3 py-2 text-xs border border-white/5">
            <span className="text-white/40 block text-[9px] uppercase tracking-wider">Active Group</span>
            <span className="font-bold text-white capitalize">{selectedMuscle}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {muscles.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMuscle(m.id)}
              className={`rounded-2xl border px-3 py-2 text-left transition shrink-0 ${
                selectedMuscle === m.id
                  ? "border-[#adc6ff] bg-[#adc6ff]/10 text-white"
                  : "border-white/5 bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              <p className="text-[10px] font-bold capitalize">{m.id}</p>
              <p className="text-[9px] text-white/40 mt-0.5 truncate max-w-[80px]">{m.activation}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Right Column: AI Capacity Radar & Projections */}
      <div className="space-y-6">
        {/* Capacity Radar */}
        <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Adaptability &amp; Potentials Profile</h4>
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={twinScores}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="none" />
                <Radar name="Twin Capacity" dataKey="A" stroke="#adc6ff" fill="#adc6ff" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Explainable AI Cards */}
        <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-4.5 w-4.5 text-yellow-400" /> Explainable AI Diagnostics
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1">
              <span className="font-bold text-rose-300">Recovery tomorrow ↓</span>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Sleep decreased 12%, Stress increased 18%, and Training workload increased by 9%. Take a recovery rest day.
              </p>
            </div>

            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1">
              <span className="font-bold text-white">Plateau Probability: 15%</span>
              <p className="text-[10px] text-white/40">
                Neuromuscular adaptation coefficients are high. Tricep auxiliary volumes are matching bench press intensities.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Tomorrow Predictions */}
        <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Tomorrow's Forecast</h4>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[8.5px] text-white/40 block">Workout readiness</span>
              <span className="font-extrabold text-emerald-400 text-sm mt-0.5 block">85% (High)</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-2.5">
              <span className="text-[8.5px] text-white/40 block">Dropout Risk</span>
              <span className="font-extrabold text-[#adc6ff] text-sm mt-0.5 block">4% (Low)</span>
            </div>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
