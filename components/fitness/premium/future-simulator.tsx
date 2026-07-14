"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Sliders,
  TrendingUp,
  Info,
  Calendar,
  AlertTriangle,
  Scale,
  Brain,
  Zap,
  Activity,
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
} from "recharts";

type PlanType = "current" | "aggressive" | "balanced" | "muscle" | "fat-loss" | "recomp";

export function FutureSimulator() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("current");
  const [simWorkouts, setSimWorkouts] = useState<number>(4);
  const [simSleep, setSimSleep] = useState<number>(7.5);
  const [simProtein, setSimProtein] = useState<number>(2.0);
  const [simCalorieDeficit, setSimCalorieDeficit] = useState<number>(300);
  const [timelineSlider, setTimelineSlider] = useState<number>(12); // weeks

  // Adjust parameters based on plan selection
  useEffect(() => {
    if (selectedPlan === "aggressive") {
      setSimCalorieDeficit(500);
      setSimWorkouts(5);
    } else if (selectedPlan === "balanced") {
      setSimCalorieDeficit(300);
      setSimWorkouts(4);
    } else if (selectedPlan === "muscle") {
      setSimCalorieDeficit(-200); // surplus
      setSimWorkouts(5);
      setSimProtein(2.2);
    } else if (selectedPlan === "fat-loss") {
      setSimCalorieDeficit(400);
      setSimWorkouts(4);
    } else if (selectedPlan === "recomp") {
      setSimCalorieDeficit(100);
      setSimWorkouts(5);
    }
  }, [selectedPlan]);

  // Baseline metrics
  const w = 78.5;
  const bf = 22.4;
  const h = 1.80; // height in m
  const bmi = w / (h * h);

  const ad = Math.min(1.0, (simSleep / 8 + simProtein / 2.0) / 2);

  // Projections calculations
  const calculateProjections = (weeks: number) => {
    let wtD = 0;
    if (simCalorieDeficit > 0) {
      wtD = -(simCalorieDeficit * 0.00013) * weeks * ad;
    } else {
      wtD = -(simCalorieDeficit * 0.00010) * weeks * ad; // surplus gain
    }

    const projWeight = Math.round((w + wtD) * 10) / 10;
    const projBmi = Math.round((projWeight / (h * h)) * 10) / 10;
    
    let bfD = 0;
    if (simCalorieDeficit > 0) {
      bfD = -(simCalorieDeficit * 0.004) * weeks * ad;
    } else {
      bfD = 0.1 * weeks * (1 - ad); // surplus fat gain
    }
    const projBf = Math.round(Math.max(4, bf + bfD) * 10) / 10;

    const muscleGain = Math.max(0, Math.round((simWorkouts / 4) * ad * 0.15 * weeks * 10) / 10);
    const fatLoss = Math.max(0, Math.round(Math.abs(wtD - muscleGain) * 10) / 10);

    const strengthGain = Math.round((simWorkouts / 4) * ad * 0.8 * weeks);
    const vo2Max = Math.round((42.5 + (simWorkouts / 3) * weeks * 0.1) * 10) / 10;

    return {
      weight: projWeight,
      bmi: projBmi,
      bf: projBf,
      muscleGain,
      fatLoss,
      strengthGain,
      vo2Max,
    };
  };

  const currentProj = calculateProjections(timelineSlider);

  // Chart data
  const chartData = Array.from({ length: 13 }, (_, i) => {
    const wk = Math.round((timelineSlider / 12) * i);
    const proj = calculateProjections(wk);
    return {
      name: `Wk ${wk}`,
      Weight: proj.weight,
      Muscle: proj.muscleGain,
      Fat: proj.bf,
      VO2Max: proj.vo2Max,
    };
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Brain className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Transformation Engine</p>
            <h2 className="text-xl font-bold text-white">AI Future Simulator</h2>
            <p className="text-xs text-white/50">Simulate body recomposition, strength progression, and weight trajectories.</p>
          </div>
        </div>
      </GlassCard>

      {/* Plan Comparisons */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "current", label: "Current Plan" },
          { id: "aggressive", label: "Aggressive Plan" },
          { id: "balanced", label: "Balanced Plan" },
          { id: "muscle", label: "Muscle Gain Plan" },
          { id: "fat-loss", label: "Fat Loss Plan" },
          { id: "recomp", label: "Recomposition Plan" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedPlan(item.id as PlanType)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedPlan === item.id
                ? "bg-[#adc6ff] text-[#131315]"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left Column: Sliders & Charts */}
        <div className="space-y-6">
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4.5 w-4.5 text-[#adc6ff]" /> Simulation Parameters
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="block space-y-1.5">
                <div className="flex justify-between">
                  <span>Weekly Workouts</span>
                  <span className="font-black text-white">{simWorkouts} sessions</span>
                </div>
                <input
                  type="range" min="1" max="7" step="1"
                  value={simWorkouts}
                  onChange={(e) => setSimWorkouts(parseInt(e.target.value))}
                  className="w-full accent-[#adc6ff] bg-white/10 rounded-full h-1"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between">
                  <span>Calorie Deficit</span>
                  <span className="font-black text-white">{simCalorieDeficit} kcal</span>
                </div>
                <input
                  type="range" min="-500" max="1000" step="50"
                  value={simCalorieDeficit}
                  onChange={(e) => setSimCalorieDeficit(parseInt(e.target.value))}
                  className="w-full accent-[#adc6ff] bg-white/10 rounded-full h-1"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between">
                  <span>Sleep Target</span>
                  <span className="font-black text-white">{simSleep} hours</span>
                </div>
                <input
                  type="range" min="4" max="10" step="0.5"
                  value={simSleep}
                  onChange={(e) => setSimSleep(parseFloat(e.target.value))}
                  className="w-full accent-[#adc6ff] bg-white/10 rounded-full h-1"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between">
                  <span>Protein Target</span>
                  <span className="font-black text-white">{simProtein} g/kg LBM</span>
                </div>
                <input
                  type="range" min="1" max="3" step="0.1"
                  value={simProtein}
                  onChange={(e) => setSimProtein(parseFloat(e.target.value))}
                  className="w-full accent-[#adc6ff] bg-white/10 rounded-full h-1"
                />
              </label>
            </div>

            {/* Timeline Slider */}
            <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#adc6ff]">
                <span>Timeline Slider Projections</span>
                <span>{timelineSlider} Weeks ({Math.round(timelineSlider / 4)} Mos)</span>
              </div>
              <input
                type="range" min="4" max="52" step="4"
                value={timelineSlider}
                onChange={(e) => setTimelineSlider(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-white/10 rounded-full h-1"
              />
            </div>
          </GlassCard>

          {/* Interactive Chart */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Transformation Trajectory Curve</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Weight" stroke="#adc6ff" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Fat" stroke="#fb7185" strokeWidth={1.5} name="Fat %" />
                  <Line type="monotone" dataKey="VO2Max" stroke="#34d399" strokeWidth={1.5} name="VO₂ Max" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Predictions & Explanations */}
        <div className="space-y-6">
          <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Projected Outcomes</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Estimated Body Weight</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Confidence interval range</span>
                </div>
                <span className="font-black text-[#adc6ff] text-sm">{currentProj.weight}kg ±1.2kg</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Estimated Body Fat %</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Subcutaneous fat estimation</span>
                </div>
                <span className="font-black text-[#adc6ff] text-sm">{currentProj.bf}% ±0.9%</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Muscle Mass Change</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Skeletal hypertrophy estimation</span>
                </div>
                <span className="font-black text-emerald-400 text-sm">+{currentProj.muscleGain}kg ±0.6kg</span>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Estimated BMI</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Body Mass Index</span>
                </div>
                <span className="font-black text-white text-sm">{currentProj.bmi}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/35 p-3 text-[10px] leading-relaxed text-white/60">
              💡 **Explainable AI**: Your projected fat loss is mainly driven by your current calorie deficit ({simCalorieDeficit} kcal), workout consistency ({simWorkouts} days/wk), and sleep quality index.
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-[9px] leading-relaxed text-yellow-400">
              ⚠️ **Medical Disclaimer**: Predictions are estimates and not medical guarantees. Consult a sports scientist before initiating aggressive calorie deficits.
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
