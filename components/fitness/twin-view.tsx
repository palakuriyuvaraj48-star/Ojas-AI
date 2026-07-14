"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
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
  Scale,
  Brain,
  Sliders,
  CheckCircle2,
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

type TwinTab = "twin" | "simulator" | "forecast" | "comparison";

export function TwinView() {
  const { profile, metrics } = useFitness();
  const [tab, setTab] = useState<TwinTab>("twin");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("quads");

  // Simulation Sliders
  const [simWorkouts, setSimWorkouts] = useState<number>(4);
  const [simSleep, setSimSleep] = useState<number>(7.5);
  const [simProtein, setSimProtein] = useState<number>(2.0);
  const [simDiet, setSimDiet] = useState<"cut" | "bulk" | "maintain">("cut");

  // Selected Preset Scenario
  const [scenarioPreset, setScenarioPreset] = useState<string>("default");

  useEffect(() => {
    if (scenarioPreset === "train5") {
      setSimWorkouts(5);
      setSimSleep(8.0);
    } else if (scenarioPreset === "cut300") {
      setSimDiet("cut");
      setSimProtein(2.2);
    } else if (scenarioPreset === "bulk") {
      setSimDiet("bulk");
      setSimWorkouts(5);
    } else if (scenarioPreset === "stop2") {
      setSimWorkouts(0);
      setSimSleep(9.0);
    }
  }, [scenarioPreset]);

  if (!profile || !metrics) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40 text-xs">
        No active user profile found. Please register or log in to initialize your AI Digital Twin.
      </div>
    );
  }

  const muscles = [
    { id: "quads", name: "Quadriceps Femoris", activation: "90% (High Intensity)", status: "optimal" },
    { id: "lats", name: "Latissimus Dorsi", activation: "75% (Moderate)", status: "optimal" },
    { id: "chest", name: "Pectoralis Major", activation: "85% (Optimal)", status: "optimal" },
    { id: "hamstrings", name: "Biceps Femoris", activation: "35% (Under-Activated)", status: "warning" },
    { id: "shoulders", name: "Deltoid Cluster", activation: "60% (Fatigued)", status: "fatigued" },
  ];

  // Dynamic simulation outcomes
  const w = profile.weight || 78.5;
  const bf = profile.bodyFat || 22.4;
  const ad = Math.min(1.0, (simSleep / 8 + simProtein / 2.0) / 2);
  
  // Weight & fat calculation
  let wtD = 0;
  if (simDiet === "cut") wtD = -3.8 * ad;
  else if (simDiet === "bulk") wtD = 2.2 * ad;
  else wtD = -0.3 * ad;
  
  const projWeight = Math.round((w + wtD) * 10) / 10;
  
  let bfD = 0;
  if (simDiet === "cut") bfD = -2.5 * ad;
  else if (simDiet === "bulk") bfD = 0.5 * (1 - ad);
  
  const projBf = Math.round(Math.max(4, bf + bfD) * 10) / 10;
  const strGain = Math.round((simWorkouts / 4) * ad * 12);

  // Future Timeline data
  const forecastData = [
    { name: "Now", weight: w, fat: bf },
    { name: "1 Wk", weight: Math.round((w + wtD * 0.1) * 10) / 10, fat: Math.round((bf + bfD * 0.1) * 10) / 10 },
    { name: "4 Wks", weight: Math.round((w + wtD * 0.3) * 10) / 10, fat: Math.round((bf + bfD * 0.3) * 10) / 10 },
    { name: "8 Wks", weight: Math.round((w + wtD * 0.6) * 10) / 10, fat: Math.round((bf + bfD * 0.6) * 10) / 10 },
    { name: "12 Wks", weight: projWeight, fat: projBf },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* Tabs Navigation */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "twin", label: "Twin Dashboard" },
          { id: "simulator", label: "AI Scenario Simulator" },
          { id: "forecast", label: "Projections Timeline" },
          { id: "comparison", label: "Plan Comparison" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as TwinTab)}
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: 3D Wireframe Skeletal Twin Simulator */}
        <GlassCard className="space-y-6 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]" glow>
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#adc6ff] animate-pulse" /> AI Twin Wireframe
            </h3>
            <p className="text-xs text-white/50 mt-0.5">Skeletal mapping &amp; dynamic muscle activation analysis.</p>
          </div>

          <div className="relative aspect-[3/4] max-h-[420px] rounded-[24px] border border-white/5 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(173,198,255,0.08),_transparent_60%)]" />

            <svg className="w-full h-full text-white/20 stroke-1" viewBox="0 0 100 130">
              <line x1="0" y1="32.5" x2="100" y2="32.5" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.03)" />
              <line x1="0" y1="97.5" x2="100" y2="97.5" stroke="rgba(255,255,255,0.03)" />
              <line x1="50" y1="0" x2="50" y2="130" stroke="rgba(255,255,255,0.03)" />

              <circle cx="50" cy="18" r="7" className="stroke-white/10 fill-none" />
              <circle cx="50" cy="18" r="5" className="stroke-cyan-500/30 fill-none animate-pulse" />
              <line x1="50" y1="25" x2="50" y2="65" className="stroke-white/30" />
              <line x1="36" y1="32" x2="64" y2="32" className="stroke-white/30" />

              {/* Arms */}
              <line x1="36" y1="32" x2="28" y2="48" className="stroke-white/20" />
              <line x1="28" y1="48" x2="24" y2="64" className="stroke-white/20" />
              <path
                d="M 36 32 L 28 48"
                stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "shoulders" ? "3" : "1"}
              />

              <line x1="64" y1="32" x2="72" y2="48" className="stroke-white/20" />
              <line x1="72" y1="48" x2="76" y2="64" className="stroke-white/20" />
              <path
                d="M 64 32 L 72 48"
                stroke={selectedMuscle === "shoulders" ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "shoulders" ? "3" : "1"}
              />

              {/* Spine/Chest */}
              <ellipse cx="50" cy="42" rx="10" ry="12" className="stroke-white/10 fill-none" />
              <path
                d="M 40 42 Q 50 48 60 42"
                stroke={selectedMuscle === "chest" ? "#38bdf8" : "rgba(255,255,255,0.1)"}
                strokeWidth={selectedMuscle === "chest" ? "3" : "1"}
                fill="none"
              />

              {/* Lats */}
              <path
                d="M 36 32 C 38 48 45 55 50 65 C 55 55 62 48 64 32"
                stroke={selectedMuscle === "lats" ? "#22d3ee" : "rgba(255,255,255,0.1)"}
                strokeWidth={selectedMuscle === "lats" ? "3" : "1"}
                fill="none"
              />

              <line x1="40" y1="65" x2="60" y2="65" className="stroke-white/30" />

              {/* Thighs */}
              <line x1="40" y1="65" x2="36" y2="92" className="stroke-white/20" />
              <line x1="36" y1="92" x2="36" y2="120" className="stroke-white/20" />
              <path
                d="M 40 65 L 36 92"
                stroke={selectedMuscle === "quads" ? "#38bdf8" : selectedMuscle === "hamstrings" ? "#fb7185" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "3" : "1"}
              />

              <line x1="60" y1="65" x2="64" y2="92" className="stroke-white/20" />
              <line x1="64" y1="92" x2="64" y2="120" className="stroke-white/20" />
              <path
                d="M 60 65 L 64 92"
                stroke={selectedMuscle === "quads" ? "#38bdf8" : selectedMuscle === "hamstrings" ? "#fb7185" : "rgba(255,255,255,0.2)"}
                strokeWidth={selectedMuscle === "quads" || selectedMuscle === "hamstrings" ? "3" : "1"}
              />

              {/* Joints */}
              <circle cx="50" cy="25" r="2.5" fill="#38bdf8" />
              <circle cx="36" cy="32" r="2" fill="#22d3ee" />
              <circle cx="64" cy="32" r="2" fill="#22d3ee" />
              <circle cx="40" cy="65" r="2" fill="#22d3ee" />
              <circle cx="60" cy="65" r="2" fill="#22d3ee" />
              <circle cx="36" cy="92" r="2" fill="#22d3ee" />
              <circle cx="64" cy="92" r="2" fill="#22d3ee" />
            </svg>

            <div className="absolute bottom-4 left-4 bg-black/60 rounded-xl px-3 py-2 text-xs border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider font-bold">Highlight Muscle Group</span>
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

        {/* Right Column: Dynamic Tabs switcher */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {tab === "twin" && (
                <div className="space-y-6">
                  {/* Scores Grid */}
                  <div className="grid gap-3 grid-cols-2">
                    {[
                      { label: "Overall Health Score", value: "86 / 100", col: "text-emerald-400" },
                      { label: "Fitness Score", value: "88 / 100", col: "text-emerald-400" },
                      { label: "Strength Index", value: "85 / 100", col: "text-emerald-400" },
                      { label: "Recovery Efficiency", value: "82 / 100", col: "text-cyan-400" },
                      { label: "Nutrition Score", value: "90 / 100", col: "text-emerald-400" },
                      { label: "Consistency Score", value: "94 / 100", col: "text-emerald-400" },
                    ].map((score) => (
                      <GlassCard key={score.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 text-left">
                        <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold block">{score.label}</span>
                        <span className={`text-xl font-black mt-1.5 block ${score.col}`}>{score.value}</span>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Posture Audit list */}
                  <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="h-4.5 w-4.5 text-[#adc6ff]" /> Posture &amp; Symmetry Audit
                    </h3>
                    <div className="space-y-2.5 text-xs text-white/70">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Shoulder Symmetry Deviation</span>
                        <span className="font-bold text-yellow-400">0.8 cm (Left high)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Pelvic Alignment (Tilt)</span>
                        <span className="font-bold text-yellow-400">1.2° (Anterior tilt)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Spine Curve Classification</span>
                        <span className="font-bold text-emerald-400">Neutral cervical and thoracic</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}

              {tab === "simulator" && (
                <GlassCard className="p-5 space-y-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="h-4.5 w-4.5 text-[#adc6ff]" /> Scenario Simulator
                    </h3>
                  </div>

                  {/* Preset Scenario Select */}
                  <label className="block space-y-1.5">
                    <span className="text-[10px] text-white/50 uppercase font-semibold">"What if I..." Preset Explorer</span>
                    <select
                      value={scenarioPreset}
                      onChange={(e) => setScenarioPreset(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="default">Use current configuration</option>
                      <option value="train5">What if I train 5 days instead of 4?</option>
                      <option value="cut300">What if I cut calories by 300 kcal?</option>
                      <option value="bulk">What if I bulk (surplus calorie target)?</option>
                      <option value="stop2">What if I stop training for 2 weeks?</option>
                    </select>
                  </label>

                  {/* Sliders */}
                  <div className="space-y-4 pt-2 text-xs">
                    <label className="block space-y-1.5">
                      <div className="flex justify-between">
                        <span>Weekly Workouts Frequency</span>
                        <span className="font-black text-white">{simWorkouts} days/wk</span>
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
                        <span>Sleep Duration Target</span>
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

                  {/* Results Panel */}
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[8px] text-white/40 block">Projected Weight</span>
                        <span className="font-extrabold text-white text-xs mt-0.5 block">{projWeight} kg</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[8px] text-white/40 block">Projected Fat %</span>
                        <span className="font-extrabold text-[#adc6ff] text-xs mt-0.5 block">{projBf}%</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[8px] text-white/40 block">1RM Strength</span>
                        <span className="font-extrabold text-emerald-400 text-xs mt-0.5 block">+{strGain}%</span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 text-[10px] text-white/60 flex items-start gap-1.5 leading-relaxed">
                      <Info className="h-3.5 w-3.5 text-[#adc6ff] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white">AI Plateau Forecaster: </span>
                        <span>
                          {simWorkouts >= 6 && simSleep < 6.5
                            ? "88% chance of Bench Press plateau due to elevated CNS overreaching."
                            : "Low risk of plateaus. Stance width accessories are well balanced."}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {tab === "forecast" && (
                <div className="space-y-6">
                  {/* Recharts chart */}
                  <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">12-Week Projections Curve</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "rgba(20,20,22,0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }}
                          />
                          <Line type="monotone" dataKey="weight" stroke="#adc6ff" strokeWidth={2} name="Weight (kg)" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="fat" stroke="#fb7185" strokeWidth={1.5} name="Body Fat %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  {/* Future timeline intervals list */}
                  <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                    <h4 className="text-white font-bold text-xs uppercase tracking-wider">Future Timeline Forecast</h4>
                    <div className="space-y-2.5">
                      {[
                        { label: "1 Week Projections", weight: `~${forecastData[1].weight} kg`, desc: "Initial glycogen adjustments. Low water weight loss." },
                        { label: "4 Weeks Projections", weight: `~${forecastData[2].weight} kg`, desc: "Lean mass preservation index active. Muscle tone hardening." },
                        { label: "8 Weeks Projections", weight: `~${forecastData[3].weight} kg`, desc: "Body fat reduction visible. Target chest fibers expanding." },
                        { label: "12 Weeks Projections", weight: `${projWeight} kg`, desc: "Full physique transformation. Estimated 1RM Deadlift tracking +15kg." },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white block">{item.label}</span>
                            <span className="text-[10px] text-white/40 block mt-0.5">{item.desc}</span>
                          </div>
                          <span className="font-black text-[#adc6ff]">{item.weight}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}

              {tab === "comparison" && (
                <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="h-4.5 w-4.5 text-[#adc6ff]" /> Plan Comparison Mode
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 bg-white/5 rounded-2xl border border-[#adc6ff]/15 space-y-1.5">
                      <span className="font-black text-white text-[10px] block uppercase">Plan A: Deficit Cutting</span>
                      <p className="text-white/70 leading-relaxed text-[11px]">
                        Focus on calorie cutting (-300 kcal) and high protein (2.2g/kg).
                      </p>
                      <ul className="list-disc list-inside text-white/40 text-[9.5px] space-y-0.5">
                        <li>Weight: -3.8 kg in 12 wks</li>
                        <li>Body Fat: -2.5%</li>
                        <li>CNS Fatigue risk: Low</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                      <span className="font-black text-white text-[10px] block uppercase">Plan B: Strength Bulking</span>
                      <p className="text-white/70 leading-relaxed text-[11px]">
                        Focus on calorie surplus (+300 kcal) and 5 days workout frequency.
                      </p>
                      <ul className="list-disc list-inside text-white/40 text-[9.5px] space-y-0.5">
                        <li>Weight: +2.2 kg in 12 wks</li>
                        <li>Body Fat: +0.5% (approx)</li>
                        <li>CNS Fatigue risk: Moderate</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl p-3 text-[10px] text-white/60 leading-relaxed">
                    🧠 **AI Recommendation (Confidence: 89%)**: Plan A is estimated to reach your goal weight trajectory 14 days earlier. If time commitment is a constraint, Option B reduces training frequency to 4 days but may delay strength peak outcomes.
                  </div>
                </GlassCard>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
