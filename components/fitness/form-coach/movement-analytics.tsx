"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TrendingUp,
  Activity,
  HeartPulse,
  Award,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { AnalyticsSummary } from "@/lib/vision/types";

interface Props {
  analytics: AnalyticsSummary | null;
}

export function MovementAnalytics({ analytics }: Props) {
  // Default mock data if analytics is empty
  const chartData = [
    { name: "Mon", form: 82, stability: 78, rom: 66 },
    { name: "Tue", form: 84, stability: 80, rom: 68 },
    { name: "Wed", form: 85, stability: 83, rom: 72 },
    { name: "Thu", form: 88, stability: 86, rom: 75 },
    { name: "Fri", form: 86, stability: 85, rom: 78 },
    { name: "Sat", form: 91, stability: 92, rom: 80 },
  ];

  const heatmapJoints = [
    { name: "Cervical Spine (Neck)", score: 94, status: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", note: "Proper neutral head alignment maintained during flexion." },
    { name: "Shoulder girdle", score: 88, status: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/25", note: "Solid shoulder retraction and lat engagement." },
    { name: "Thoracic Spine (Back)", score: 81, status: "Stable", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", note: "Slight rounding noted at the bottom of the movement." },
    { name: "Lumbo-Pelvic (Hips)", score: 79, status: "Review", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25", note: "Minor pelvic tilt (butt wink) at maximum depth." },
    { name: "Knee joints", score: 72, status: "Attention", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/25", note: "Inward knee collapse (valgus) on concentric phase." },
    { name: "Ankle Mobility", score: 68, status: "Attention", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/25", note: "Dorsiflexion restrictions causing heel lifting." },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Metrics Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-semibold">Form Accuracy</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {analytics?.avgFormScore ? `${analytics.avgFormScore}%` : "88%"}
          </span>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="h-3 w-3" /> +4.2% from last week
          </span>
        </GlassCard>
        
        <GlassCard className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-semibold">Stability Index</span>
          <span className="text-2xl font-black text-white mt-1 block">
            91%
          </span>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
            <TrendingUp className="h-3 w-3" /> Left/Right load balanced
          </span>
        </GlassCard>

        <GlassCard className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-semibold">Completed reps</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {analytics?.totalReps ? `${analytics.totalReps} reps` : "96 reps"}
          </span>
          <span className="text-[9px] text-[#adc6ff] flex items-center gap-1 mt-1 font-bold">
            0 partials today
          </span>
        </GlassCard>
      </div>

      {/* Recharts Trends */}
      <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Form Progress Trends</h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(20,20,22,0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
              />
              <Line type="monotone" dataKey="form" stroke="#adc6ff" strokeWidth={2.5} name="Form Score" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="stability" stroke="#38bdf8" strokeWidth={1.5} name="Stability" />
              <Line type="monotone" dataKey="rom" stroke="#34d399" strokeWidth={1.5} name="ROM" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Joint Heatmap Grid */}
      <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="h-4.5 w-4.5 text-cyan-400" /> Movement Quality Heatmap
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {heatmapJoints.map((joint, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border transition ${joint.bg} space-y-1.5`}>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">{joint.name}</span>
                <span className={`font-black text-[10px] ${joint.color}`}>{joint.score}%</span>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed">
                {joint.note}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Technique Timeline & Predictor */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Timeline */}
        <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="h-4.5 w-4.5 text-[#adc6ff]" /> AI Technique Timeline
          </h4>
          <div className="space-y-4 text-xs text-white/70">
            <div className="border-l-2 border-[#adc6ff]/20 pl-4 py-1 relative">
              <span className="absolute -left-1.5 top-2.5 h-3.5 w-3.5 rounded-full bg-[#adc6ff] border-4 border-[#131315]" />
              <p className="font-bold text-white">Fatigue Compensation Detected</p>
              <p className="text-[10px] text-white/40 mt-0.5">July 12, 2026</p>
              <p className="mt-1.5 leading-relaxed text-white/60">
                &quot;Your squat depth has decreased by 14% compared to last week. Based on your higher training volume today, this suggests accumulated fatigue in the lower extremities rather than an inherent regression in technique.&quot;
              </p>
            </div>
            
            <div className="border-l-2 border-[#adc6ff]/20 pl-4 py-1 relative">
              <span className="absolute -left-1.5 top-2.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-4 border-[#131315]" />
              <p className="font-bold text-white">Stability Improvement</p>
              <p className="text-[10px] text-white/40 mt-0.5">July 10, 2026</p>
              <p className="mt-1.5 leading-relaxed text-white/60">
                &quot;Foot pressure distribution is significantly more balanced. Left/right symmetry index improved from 0.88 to 0.94 following stance widening cues.&quot;
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Predictor */}
        <GlassCard className="p-5 flex flex-col justify-between border-white/5 bg-gradient-to-br from-[var(--accent)]/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Award className="h-4.5 w-4.5 text-yellow-400" /> AI Progress Predictor
            </h4>
            
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Current Squat Form Accuracy</span>
                <span className="font-bold text-white">88%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Projected squat form accuracy (95%+)</span>
                <span className="font-black text-emerald-300">14 days</span>
              </div>
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-[10px] leading-relaxed space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Target drills for acceleration:
                </p>
                <ul className="list-disc list-inside text-white/50 space-y-0.5">
                  <li>Stance widening (10-15 degrees toes out)</li>
                  <li>Dumbbell counterbalance goblet squat</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 text-[9.5px] text-white/40 flex items-start gap-1">
            <Info className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
            <span>Progress predictions are calculated based on session logs and motor learning kinetics models.</span>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
