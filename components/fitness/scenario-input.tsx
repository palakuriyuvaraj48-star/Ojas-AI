"use client";

import React, { useState } from "react";
import { AlertCircle, Calendar, MapPin, DollarSign, Moon, Zap, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface ScenarioInputProps {
  onScenarioChange: (input: ScenarioInput) => void;
  currentState: {
    availableTime?: number;
    sleep?: number;
    stress?: string;
    budget?: number;
  };
}

export interface ScenarioInput {
  availableTimeMinutes?: number;
  sleepHours?: number;
  stressLevel?: "low" | "medium" | "high";
  foodBudget?: number;
  travelStatus?: "home" | "travelling";
  injuryReport?: boolean;
  gymAccessible?: boolean;
}

/**
 * Component for users to input scenario changes (exams, travel, poor sleep, etc.)
 */
export function ScenarioInput({ onScenarioChange, currentState }: ScenarioInputProps) {
  const [scenarioInput, setScenarioInput] = useState<ScenarioInput>({
    availableTimeMinutes: currentState.availableTime || 60,
    sleepHours: currentState.sleep || 7.5,
    stressLevel: (currentState.stress as any) || "low",
    foodBudget: currentState.budget || 300,
    travelStatus: "home",
    injuryReport: false,
    gymAccessible: true,
  });

  const handleChange = (key: keyof ScenarioInput, value: any) => {
    const updated = { ...scenarioInput, [key]: value };
    setScenarioInput(updated);
    onScenarioChange(updated);
  };

  const presetScenarios = [
    {
      label: "📚 Exam Period",
      description: "Limited time, poor sleep, high stress",
      values: {
        availableTimeMinutes: 20,
        sleepHours: 5.5,
        stressLevel: "high" as const,
        foodBudget: 150,
      },
    },
    {
      label: "✈️ Travelling",
      description: "Away from home, limited equipment",
      values: {
        travelStatus: "travelling" as const,
        availableTimeMinutes: 25,
        gymAccessible: false,
      },
    },
    {
      label: "😴 Poor Sleep",
      description: "Reduced sleep quality and duration",
      values: {
        sleepHours: 5,
      },
    },
    {
      label: "💰 Budget Reduced",
      description: "Food budget decreased significantly",
      values: {
        foodBudget: 150,
      },
    },
  ];

  const applyPreset = (values: Partial<ScenarioInput>) => {
    const updated = { ...scenarioInput, ...values };
    setScenarioInput(updated);
    onScenarioChange(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Quick Preset Scenarios */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Quick Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presetScenarios.map((scenario, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              onClick={() => applyPreset(scenario.values)}
              className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg p-3 text-left transition"
            >
              <div className="font-semibold text-white text-sm">{scenario.label}</div>
              <div className="text-xs text-slate-400 mt-1">{scenario.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-white">Custom Scenario</h3>

        {/* Available Time */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <Clock size={16} />
            Available Workout Time: <span className="text-white">{scenarioInput.availableTimeMinutes}min</span>
          </label>
          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={scenarioInput.availableTimeMinutes || 60}
            onChange={(e) => handleChange("availableTimeMinutes", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1">Previous: {currentState.availableTime}min</div>
        </div>

        {/* Sleep */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <Moon size={16} />
            Sleep Duration: <span className="text-white">{scenarioInput.sleepHours}h</span>
          </label>
          <input
            type="range"
            min="3"
            max="10"
            step="0.5"
            value={scenarioInput.sleepHours || 7.5}
            onChange={(e) => handleChange("sleepHours", parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1">Previous: {currentState.sleep}h</div>
        </div>

        {/* Stress Level */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <Zap size={16} />
            Stress Level
          </label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                onClick={() => handleChange("stressLevel", level)}
                className={`flex-1 py-2 rounded text-xs font-semibold transition ${
                  scenarioInput.stressLevel === level
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Food Budget */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <DollarSign size={16} />
            Food Budget: <span className="text-white">₹{scenarioInput.foodBudget}/day</span>
          </label>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={scenarioInput.foodBudget || 300}
            onChange={(e) => handleChange("foodBudget", parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1">Previous: ₹{currentState.budget}/day</div>
        </div>

        {/* Travel Status */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            <MapPin size={16} />
            Travel Status
          </label>
          <div className="flex gap-2">
            {["home", "travelling"].map((status) => (
              <button
                key={status}
                onClick={() => handleChange("travelStatus", status)}
                className={`flex-1 py-2 rounded text-xs font-semibold transition ${
                  scenarioInput.travelStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {status === "home" ? "🏠 Home" : "✈️ Travelling"}
              </button>
            ))}
          </div>
        </div>

        {/* Gym Access */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
            Gym Access
          </label>
          <div className="flex gap-2">
            {[true, false].map((access) => (
              <button
                key={String(access)}
                onClick={() => handleChange("gymAccessible", access)}
                className={`flex-1 py-2 rounded text-xs font-semibold transition ${
                  scenarioInput.gymAccessible === access
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {access ? "✓ Accessible" : "✗ Not Available"}
              </button>
            ))}
          </div>
        </div>

        {/* Injury Report */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={scenarioInput.injuryReport || false}
              onChange={(e) => handleChange("injuryReport", e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Report injury or pain
          </label>
          {scenarioInput.injuryReport && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
              ⚠️ If you&apos;re experiencing acute pain, please consult a healthcare professional.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
