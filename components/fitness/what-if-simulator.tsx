"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Play,
  ArrowRight,
  Clock,
  Moon,
  Wallet,
  Dumbbell,
  BookOpen,
  Plane,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

type ScenarioType = "exam" | "poor-sleep" | "travel" | "budget-change" | "form-degradation" | "no-equipment";

interface ScenarioConfig {
  type: ScenarioType;
  label: string;
  icon: React.ReactNode;
  description: string;
  metadata?: any;
}

const scenarios: ScenarioConfig[] = [
  {
    type: "exam",
    label: "Exam Period",
    icon: <BookOpen className="h-5 w-5" />,
    description: "Sleep reduced, stress elevated, available time compressed",
  },
  {
    type: "poor-sleep",
    label: "Poor Sleep (5h)",
    icon: <Moon className="h-5 w-5" />,
    description: "Acute fatigue spike, recovery score depressed",
  },
  {
    type: "travel",
    label: "Travel Mode",
    icon: <Plane className="h-5 w-5" />,
    description: "Hotel room constraints, bodyweight-only exercises",
  },
  {
    type: "budget-change",
    label: "Budget Cut (₹50)",
    icon: <Wallet className="h-5 w-5" />,
    description: "Food budget reduced to ₹50/day",
    metadata: { newBudget: 50 },
  },
  {
    type: "form-degradation",
    label: "Form Declining",
    icon: <AlertTriangle className="h-5 w-5" />,
    description: "Vision Coach detects movement degradation",
  },
  {
    type: "no-equipment",
    label: "No Equipment",
    icon: <Dumbbell className="h-5 w-5" />,
    description: "Only bodyweight exercises available",
    metadata: { equipment: ["bodyweight"] },
  },
];

export function WhatIfSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const runSimulation = async () => {
    if (!selectedScenario) return;

    setIsSimulating(true);
    try {
      const scenario = scenarios.find(s => s.type === selectedScenario);
      const response = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioType: selectedScenario,
          scenarioMetadata: scenario?.metadata,
        }),
      });
      const data = await response.json();
      setSimulationResult(data);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const resetSimulation = () => {
    setSelectedScenario(null);
    setSimulationResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">What-If Simulator</h3>
          <p className="text-xs text-white/60">Test how Ojas adapts to different scenarios</p>
        </div>
        <Button
          onClick={resetSimulation}
          variant="outline"
          size="sm"
          className="border-white/10 text-white/70 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
        </Button>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.type}
            onClick={() => setSelectedScenario(scenario.type)}
            className={`p-4 rounded-xl border text-left transition ${
              selectedScenario === scenario.type
                ? "bg-[#adc6ff]/20 border-[#adc6ff]/40 text-white"
                : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg ${
                selectedScenario === scenario.type ? "bg-[#adc6ff]/30" : "bg-white/10"
              }`}>
                {scenario.icon}
              </div>
              <span className="font-bold text-sm">{scenario.label}</span>
            </div>
            <p className="text-[11px] opacity-80">{scenario.description}</p>
          </button>
        ))}
      </div>

      {/* Run Simulation Button */}
      {selectedScenario && !simulationResult && (
        <div className="flex justify-center">
          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            className="bg-[#adc6ff] text-black font-bold text-sm hover:bg-[#adc6ff]/90 px-6 py-2.5 flex items-center gap-2"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Simulation
              </>
            )}
          </Button>
        </div>
      )}

      {/* Simulation Results */}
      <AnimatePresence>
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Scenario Explanation */}
            <GlassCard className="p-4 border-blue-500/30 bg-blue-950/10">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200">
                  <strong className="block mb-1">Scenario Applied:</strong>
                  {simulationResult.scenarioExplanation}
                </div>
              </div>
            </GlassCard>

            {/* Comparison Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Baseline */}
              <GlassCard className="p-4 border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase text-white/50">Before</span>
                  <span className="text-xs text-white/60">Baseline State</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-white/50 block">Action</span>
                    <span className="text-sm font-bold text-white">
                      {simulationResult.baseline.decision.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/50 block">Workout</span>
                    <span className="text-sm font-bold text-white">
                      {simulationResult.baseline.decision.headline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/70">
                      {simulationResult.baseline.decision.duration} minutes
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* Simulated */}
              <GlassCard className="p-4 border-[#adc6ff]/30 bg-[#adc6ff]/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase text-[#adc6ff]">After</span>
                  <span className="text-xs text-white/60">Simulated State</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-white/50 block">Action</span>
                    <span className="text-sm font-bold text-[#adc6ff]">
                      {simulationResult.simulated.decision.action.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-white/50 block">Workout</span>
                    <span className="text-sm font-bold text-white">
                      {simulationResult.simulated.decision.headline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-white/50" />
                    <span className="text-xs text-white/70">
                      {simulationResult.simulated.decision.duration} minutes
                    </span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Why Ojas Changed This */}
            <GlassCard className="p-4 border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Why Ojas Changed This</span>
              </div>
              <div className="space-y-2">
                {simulationResult.simulated.decision.whyReasons?.map((reason: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Comparison Summary */}
            <GlassCard className="p-4 border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Action Changed:</span>
                <span className={`font-bold ${simulationResult.comparison.actionChanged ? "text-amber-400" : "text-emerald-400"}`}>
                  {simulationResult.comparison.actionChanged ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-white/60">Duration Changed:</span>
                <span className={`font-bold ${simulationResult.comparison.durationChanged ? "text-amber-400" : "text-emerald-400"}`}>
                  {simulationResult.comparison.durationChanged ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-white/60">Intensity Changed:</span>
                <span className={`font-bold ${simulationResult.comparison.intensityChanged ? "text-amber-400" : "text-emerald-400"}`}>
                  {simulationResult.comparison.intensityChanged ? "Yes" : "No"}
                </span>
              </div>
            </GlassCard>

            {/* Note */}
            <div className="text-center">
              <p className="text-[11px] text-white/40 italic">
                {simulationResult.note}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
