"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  HeartPulse,
  Dumbbell,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function DecisionLogicDiagram() {
  const [activeStage, setActiveStage] = useState<string | null>("recovery");
  const [showExplanation, setShowExplanation] = useState(true);

  const stages = [
    {
      id: "input",
      title: "1. Multi-Modal Context Ingestion",
      color: "from-blue-500/20 to-indigo-500/10",
      border: "border-blue-500/30",
      badge: "User & Sensor Inputs",
      desc: "Sleep duration, HRV, fatigue level, available time (15-50m), stress level, hostel/mess constraints, and recent training load."
    },
    {
      id: "recovery",
      title: "2. Recovery & Central Nervous System Gate",
      color: "from-amber-500/20 to-yellow-500/10",
      border: "border-amber-500/30",
      badge: "Safety First Check",
      desc: "If Recovery < 50 or Sleep < 5.0h → Bypass heavy training and enforce Active Recovery / Mobility protocol."
    },
    {
      id: "time",
      title: "3. Time & Environment Compression",
      color: "from-purple-500/20 to-pink-500/10",
      border: "border-purple-500/30",
      badge: "Time Constraints",
      desc: "If Available Time ≤ 15m or Exam Period → Deploy Minimal Viable Density Session (compound or hostel bodyweight). If 25m → Deploy 3-movement strength split."
    },
    {
      id: "energy",
      title: "4. Energy & Stress Auto-Regulation",
      color: "from-cyan-500/20 to-teal-500/10",
      border: "border-cyan-500/30",
      badge: "Systemic Strain Check",
      desc: "If Tired or High Stress → Auto-regulate to RPE 7 and moderate volume to avoid accumulating central fatigue."
    },
    {
      id: "optimal",
      title: "5. Optimal Readiness Trigger",
      color: "from-emerald-500/20 to-teal-500/10",
      border: "border-emerald-500/30",
      badge: "Progressive Overload",
      desc: "If Recovery ≥ 78 and Energy = Energetic → Greenlight progressive overload with heavy compound sets and accessories."
    },
    {
      id: "twin",
      title: "6. Closed-Loop Digital Twin Feedback",
      color: "from-rose-500/20 to-orange-500/10",
      border: "border-rose-500/30",
      badge: "Continuous Learning",
      desc: "Session execution, form quality scores from Computer Vision, and RPE feedback update the user's Digital Twin state for tomorrow's prediction."
    }
  ];

  return (
    <GlassCard className="p-6 border-white/10 relative overflow-hidden space-y-6" glow>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#adc6ff] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#adc6ff]" />
              Decision Engine Architecture
            </span>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] text-emerald-300 font-bold">
              Real-Time Dynamic
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            How OJAS AI Decides Your Daily Protocol
          </h3>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1 text-xs text-[#adc6ff] font-semibold hover:underline self-start sm:self-center"
        >
          {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showExplanation ? "Collapse View" : "Expand Logic Details"}
        </button>
      </div>

      {/* Interactive Flow Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage, idx) => {
          const isSelected = activeStage === stage.id;
          return (
            <motion.div
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                isSelected
                  ? `bg-gradient-to-br ${stage.color} ${stage.border} shadow-lg shadow-black/40`
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  {stage.badge}
                </span>
                <span className={`text-[10px] font-bold rounded-md px-1.5 py-0.5 ${isSelected ? "bg-white/20 text-white" : "text-white/40"}`}>
                  Step {idx + 1}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                {stage.title}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {stage.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* SVG Flowchart Diagram */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2"
          >
            <div className="rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-6 overflow-x-auto">
              <svg viewBox="0 0 900 360" className="w-full min-w-[700px] h-auto text-xs font-sans">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
                  </linearGradient>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#adc6ff" />
                  </marker>
                  <marker id="arrowRed" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                    <polygon points="0 0, 8 4, 0 8" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Box 1: Inputs */}
                <rect x="20" y="30" width="180" height="70" rx="12" fill="url(#blueGrad)" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="110" y="58" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">1. USER CONTEXT</text>
                <text x="110" y="78" textAnchor="middle" fill="#93c5fd" fontSize="10">Sleep, Time, Stress, Hostel</text>

                {/* Arrow 1 */}
                <line x1="200" y1="65" x2="260" y2="65" stroke="#adc6ff" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Box 2: Recovery Gate */}
                <rect x="260" y="25" width="200" height="80" rx="12" fill="url(#amberGrad)" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="360" y="52" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">2. RECOVERY GATE</text>
                <text x="360" y="70" textAnchor="middle" fill="#fde68a" fontSize="10">Recovery &lt; 50 or Sleep &lt; 5h?</text>
                <text x="360" y="88" textAnchor="middle" fill="#fde68a" fontSize="9">Yes ➔ Auto-Recovery Protocol</text>

                {/* Arrow 2 */}
                <line x1="460" y1="65" x2="520" y2="65" stroke="#adc6ff" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Box 3: Time & Stress Engine */}
                <rect x="520" y="25" width="200" height="80" rx="12" fill="url(#blueGrad)" stroke="#6366f1" strokeWidth="1.5" />
                <text x="620" y="52" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">3. ADAPTIVE ENGINE</text>
                <text x="620" y="70" textAnchor="middle" fill="#c7d2fe" fontSize="10">Time Split (15m/25m/50m)</text>
                <text x="620" y="88" textAnchor="middle" fill="#c7d2fe" fontSize="9">Auto-Regulate RPE vs Stress</text>

                {/* Arrow 3 */}
                <line x1="720" y1="65" x2="770" y2="65" stroke="#adc6ff" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Box 4: Output Recommendation */}
                <rect x="770" y="25" width="110" height="80" rx="12" fill="url(#greenGrad)" stroke="#10b981" strokeWidth="1.5" />
                <text x="825" y="55" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="12">4. OUTPUT</text>
                <text x="825" y="73" textAnchor="middle" fill="#a7f3d0" fontSize="9">Personalized</text>
                <text x="825" y="88" textAnchor="middle" fill="#a7f3d0" fontSize="9">Daily Split</text>

                {/* Arrow Down to Execution */}
                <line x1="825" y1="105" x2="825" y2="180" stroke="#adc6ff" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Box 5: Workout Execution & Form Coach */}
                <rect x="620" y="180" width="260" height="75" rx="12" fill="url(#blueGrad)" stroke="#06b6d4" strokeWidth="1.5" />
                <text x="750" y="208" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">5. EXECUTION &amp; FORM COACH</text>
                <text x="750" y="226" textAnchor="middle" fill="#67e8f9" fontSize="10">Real-Time Computer Vision Tracking</text>
                <text x="750" y="242" textAnchor="middle" fill="#67e8f9" fontSize="9">Angles, Reps &amp; Quality Scoring</text>

                {/* Arrow Left to Digital Twin */}
                <line x1="620" y1="217" x2="480" y2="217" stroke="#adc6ff" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Box 6: Digital Twin State Update */}
                <rect x="220" y="180" width="260" height="75" rx="12" fill="url(#amberGrad)" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="350" y="208" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">6. AI DIGITAL TWIN UPDATED</text>
                <text x="350" y="226" textAnchor="middle" fill="#fda4af" fontSize="10">Fatigue Accumulation &amp; Overload Memory</text>
                <text x="350" y="242" textAnchor="middle" fill="#fda4af" fontSize="9">Adapts Tomorrow's Recommendations</text>

                {/* Feedback Loop back to 1 */}
                <path d="M 220 217 L 110 217 L 110 105" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowRed)" />
                <text x="130" y="165" fill="#f43f5e" fontSize="10" fontWeight="bold">Continuous Loop</text>
              </svg>
            </div>

            {/* Live Example Flow */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 grid place-items-center text-amber-300">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider">Example: Exam Period Simulation</h5>
                  <p className="text-xs text-white/60">Inputs: Sleep 4.8h, Stress High, Available Time 15m ➔ Automatically routes to 15-min minimal viable recovery circuit.</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5 whitespace-nowrap">
                Zero Missed Days • Prevent Burnout
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
