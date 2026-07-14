"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  Scale,
  Brain,
  Zap,
  Activity,
  Heart,
  User,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function InjuryRisk() {
  const [selectedRegion, setSelectedRegion] = useState<string>("knees");

  const regions = [
    { id: "shoulders", name: "Shoulder Girdle", score: "15% (Low Risk)", status: "safe" },
    { id: "back", name: "Lower Back Lumbar", score: "32% (Moderate Risk)", status: "warning" },
    { id: "knees", name: "Knee Patella Tendon", score: "45% (Elevated Risk)", status: "attention" },
    { id: "hips", name: "Hip Flexors", score: "12% (Safe)", status: "safe" },
    { id: "ankles", name: "Ankle Dorsiflexion", score: "8% (Safe)", status: "safe" },
    { id: "wrists", name: "Wrist Flexors", score: "14% (Safe)", status: "safe" },
  ];

  const loadTrend = [
    { name: "Week 1", acute: 1.0, chronic: 1.1, risk: 12 },
    { name: "Week 2", acute: 1.2, chronic: 1.1, risk: 18 },
    { name: "Week 3", acute: 1.5, chronic: 1.2, risk: 28 },
    { name: "Week 4", acute: 1.3, chronic: 1.3, risk: 24 },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-rose-400">AI Safety Diagnostics</p>
            <h2 className="text-xl font-bold text-white">Injury Risk Prediction</h2>
            <p className="text-xs text-white/50">Analyze acute to chronic workload ratios, joint strain levels, and biomechanical safety.</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column: Risk scores & Load charts */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Overall Injury Risk", value: "Yellow (Moderate)", color: "text-yellow-400", desc: "Risk Index: 28%" },
              { label: "Acute : Chronic Load Ratio", value: "1.25", color: "text-[#adc6ff]", desc: "Optimal bounds: 0.8 - 1.3" },
              { label: "Next 30-Day Probability", value: "8.4%", color: "text-emerald-400", desc: "Lowered by sleep targets" },
            ].map((card) => (
              <GlassCard key={card.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
                <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold block">{card.label}</span>
                <span className={`text-lg font-black mt-1.5 block ${card.color}`}>{card.value}</span>
                <span className="text-[9.5px] text-white/30 mt-1 block">{card.desc}</span>
              </GlassCard>
            ))}
          </div>

          {/* Load Trend Chart */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Acute vs. Chronic Workload Trends</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loadTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip />
                  <Area type="monotone" dataKey="acute" stroke="#adc6ff" fill="rgba(173, 198, 255, 0.1)" name="Acute Load" />
                  <Area type="monotone" dataKey="chronic" stroke="#34d399" fill="rgba(52, 211, 153, 0.05)" name="Chronic Baseline" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Region Audits & Deload protocols */}
        <div className="space-y-6">
          {/* Region Risks */}
          <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Joint Strain Index by Region</h4>
            <div className="space-y-2 text-xs">
              {regions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRegion(r.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-2xl border transition ${
                    selectedRegion === r.id
                      ? "border-rose-500/20 bg-rose-500/5 text-white"
                      : "border-white/5 bg-white/5 text-white/50"
                  }`}
                >
                  <span className="font-bold">{r.name}</span>
                  <span className={`font-black ${r.status === "attention" ? "text-rose-400" : r.status === "warning" ? "text-yellow-400" : "text-emerald-400"}`}>{r.score}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Deload protocols */}
          <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-[#adc6ff]" /> Recommended Deload &amp; Prehab Protocol
            </h4>

            {selectedRegion === "knees" && (
              <div className="space-y-3">
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1">
                  <span className="font-bold text-rose-300">Why knee risk increased:</span>
                  <p className="text-[10px] text-white/60 leading-relaxed">
                    Squat sets volume increased 30% while sleep hours dropped. Mobility scores fell due to tight calves.
                  </p>
                </div>
                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                  <p className="font-bold text-white">Targeted Mobility Drills:</p>
                  <ul className="list-disc list-inside text-white/50 text-[10px] space-y-0.5">
                    <li>3x15 calf raises (eccentric focus)</li>
                    <li>2x10 ankle wall flossing</li>
                    <li>Exercise substitution: Switch Squats to Leg Press for 7 days</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedRegion !== "knees" && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-center text-white/40">
                Select Knee joint region to inspect deload recommendations and calf mobility protocols.
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
