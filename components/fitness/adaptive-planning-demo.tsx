"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFitness } from "@/components/providers/fitness-provider";
import { 
  ChevronRight, AlertCircle, TrendingDown, TrendingUp, CheckCircle2, 
  BookOpen, Clock, Moon, Zap, DollarSign, MapPin, RefreshCw,
  BarChart3
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ScenarioInput, ScenarioInput as ScenarioInputType } from "@/components/fitness/scenario-input";
import { PlanAdaptationExplainer, AdaptationSummaryCard } from "@/components/fitness/plan-adaptation-explainer";
import { FitnessPlan, AdaptedPlan } from "@/lib/adaptive-engine";
import { DigitalTwin } from "@/lib/digital-twin";

type DemoStage = "initial" | "profile-review" | "plan-generated" | "scenario-input" | "plan-adapted";

interface DemoState {
  userProfile: any;
  initialTwin: DigitalTwin | null;
  initialPlan: FitnessPlan | null;
  currentTwin: DigitalTwin | null;
  adaptedPlan: AdaptedPlan | null;
  scenarioDescription: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Real SIH Demonstration
 * Shows how Ojas adapts when a user's circumstances change.
 * Uses the real Digital Twin and Adaptive Engine.
 */
export function AdaptivePlanningDemo() {
  const { profile, dailyLog, logsHistory, checkInHistory, calorieTargets, macroTargets } = useFitness();
  const [stage, setStage] = useState<DemoStage>("initial");
  const [scenarioInput, setScenarioInput] = useState<ScenarioInputType | null>(null);
  const [demoState, setDemoState] = useState<DemoState>({
    userProfile: null,
    initialTwin: null,
    initialPlan: null,
    currentTwin: null,
    adaptedPlan: null,
    scenarioDescription: "",
    isLoading: false,
    error: null,
  });

  // Step 1: Initialize with current user profile
  const handleStartDemo = async () => {
    if (!profile) return;

    setDemoState((prev) => ({ ...prev, isLoading: true, userProfile: profile }));

    try {
      // Generate initial plan using adaptive engine
      const response = await fetch("/api/coach/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "adaptive",
          userId: profile.name || "demo-user",
          profile,
          logsHistory: logsHistory || [],
          checkInHistory: checkInHistory || [],
          calorieTargets,
          macroTargets,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDemoState((prev) => ({
          ...prev,
          initialTwin: data.currentTwin,
          initialPlan: data.plan,
          currentTwin: data.currentTwin,
          isLoading: false,
        }));
        setStage("profile-review");
      } else {
        setDemoState((prev) => ({
          ...prev,
          error: "Failed to generate initial plan",
          isLoading: false,
        }));
      }
    } catch (err) {
      setDemoState((prev) => ({
        ...prev,
        error: "Error generating initial plan",
        isLoading: false,
      }));
    }
  };

  // Step 2: Review user profile and initial plan
  const handleReviewComplete = () => {
    setStage("scenario-input");
  };

  // Step 3: Handle scenario input changes
  const handleScenarioChange = (input: ScenarioInputType) => {
    setScenarioInput(input);
  };

  // Step 4: Apply scenario and adapt plan
  const handleApplyScenario = async () => {
    if (!demoState.initialTwin || !demoState.initialPlan || !scenarioInput) return;

    setDemoState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Call adaptive planning with scenario input
      const response = await fetch("/api/coach/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "adaptive",
          userId: profile?.name || "demo-user",
          profile: demoState.userProfile,
          scenarioInput,
          currentTwin: demoState.initialTwin,
          previousTwin: demoState.initialTwin,
          currentPlan: demoState.initialPlan,
          logsHistory: logsHistory || [],
          checkInHistory: checkInHistory || [],
          calorieTargets,
          macroTargets,
        }),
      });

      const data = await response.json();

      if (data.success && data.isAdapted && data.plan) {
        // Determine scenario description
        let scenarioDesc = "Your circumstances changed:";
        const changes: string[] = [];

        if (
          scenarioInput.availableTimeMinutes &&
          scenarioInput.availableTimeMinutes < (demoState.initialTwin?.lifestyle.availableTime || 60) * 0.7
        ) {
          changes.push(`⏰ Available time: ${demoState.initialTwin?.lifestyle.availableTime}min → ${scenarioInput.availableTimeMinutes}min`);
        }

        if (scenarioInput.sleepHours && scenarioInput.sleepHours < 6) {
          changes.push(`😴 Sleep quality degraded: ${scenarioInput.sleepHours}h/night`);
        }

        if (scenarioInput.stressLevel === "high") {
          changes.push(`😰 Stress level: High`);
        }

        if (scenarioInput.foodBudget && scenarioInput.foodBudget < (demoState.initialTwin?.nutrition.budget || 300) * 0.7) {
          changes.push(`💰 Food budget: ₹${demoState.initialTwin?.nutrition.budget} → ₹${scenarioInput.foodBudget}`);
        }

        if (scenarioInput.travelStatus === "travelling") {
          changes.push(`✈️ Currently travelling`);
        }

        setDemoState((prev) => ({
          ...prev,
          currentTwin: data.currentTwin,
          adaptedPlan: data.plan as AdaptedPlan,
          scenarioDescription: changes.join("\n"),
          isLoading: false,
        }));

        setStage("plan-adapted");
      } else {
        setDemoState((prev) => ({
          ...prev,
          error: "No adaptations were necessary or plan generation failed",
          isLoading: false,
        }));
      }
    } catch (err) {
      console.error("Scenario application error:", err);
      setDemoState((prev) => ({
        ...prev,
        error: "Error applying scenario",
        isLoading: false,
      }));
    }
  };

  // Reset demo
  const handleReset = () => {
    setStage("initial");
    setScenarioInput(null);
    setDemoState({
      userProfile: null,
      initialTwin: null,
      initialPlan: null,
      currentTwin: null,
      adaptedPlan: null,
      scenarioDescription: "",
      isLoading: false,
      error: null,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 size={28} className="text-blue-400" />
          Adaptive Fitness Planning Demo
        </h2>
        <p className="text-slate-400 max-w-2xl">
          See how Ojas adapts your fitness plan when your real-life circumstances change. This demonstration uses
          the actual Digital Twin and Adaptive Engine.
        </p>
      </div>

      {/* Error Display */}
      {demoState.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-red-300">Error</h4>
            <p className="text-sm text-red-200">{demoState.error}</p>
          </div>
        </motion.div>
      )}

      {/* Stage 1: Initial */}
      <AnimatePresence>
        {stage === "initial" && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <GlassCard className="p-6 border-slate-700" glow>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Step 1: Assess Your Current Fitness State</h3>
                  <p className="text-slate-400 mb-4">
                    First, we'll create a Digital Twin of your current fitness profile and generate an initial
                    personalized fitness plan based on your profile, workout history, and recovery data.
                  </p>

                  {profile && (
                    <div className="bg-slate-800/50 rounded p-4 space-y-2 mb-4">
                      <p className="text-sm">
                        <span className="text-slate-400">Your profile:</span>
                        <span className="text-white font-semibold ml-2">
                          {profile.name}, {profile.age} years, {profile.goal.replace("-", " ")} goal
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-400">Typical availability:</span>
                        <span className="text-white font-semibold ml-2">
                          {profile.workoutDaysPerWeek}x per week, ~45min sessions
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="text-slate-400">Food budget:</span>
                        <span className="text-white font-semibold ml-2">
                          ₹{profile.budget === "budget" ? "150" : profile.budget === "moderate" ? "300" : "500"}/day
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleStartDemo}
                  disabled={demoState.isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {demoState.isLoading ? "Generating..." : "Generate Initial Plan"}
                  {!demoState.isLoading && <ChevronRight size={20} />}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 2: Profile Review */}
      <AnimatePresence>
        {stage === "profile-review" && demoState.initialPlan && demoState.initialTwin && (
          <motion.div
            key="profile-review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <GlassCard className="p-6 border-slate-700" glow>
              <h3 className="text-xl font-bold text-white mb-4">Step 2: Your Initial Fitness Plan</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-blue-400" />
                    <span className="text-slate-400 text-sm">Workout Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{demoState.initialPlan.workoutPlan.durationMinutes}min</div>
                  <div className="text-slate-500 text-xs mt-1">{demoState.initialPlan.workoutPlan.daysPerWeek}x per week</div>
                </div>

                <div className="bg-slate-800/50 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} className="text-orange-400" />
                    <span className="text-slate-400 text-sm">Intensity</span>
                  </div>
                  <div className="text-2xl font-bold text-white capitalize">{demoState.initialPlan.workoutPlan.intensity}</div>
                  <div className="text-slate-500 text-xs mt-1">Sustainable pace</div>
                </div>

                <div className="bg-slate-800/50 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-green-400" />
                    <span className="text-slate-400 text-sm">Daily Calories</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{demoState.initialPlan.nutritionPlan.dailyCalories}</div>
                  <div className="text-slate-500 text-xs mt-1">Tailored to your goal</div>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                ✓ This plan is realistic for your current circumstances. Now let's see what happens when your life changes...
              </p>

              <Button
                onClick={handleReviewComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
              >
                Next: Trigger a Life Change
                <ChevronRight size={20} />
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 3: Scenario Input */}
      <AnimatePresence>
        {stage === "scenario-input" && demoState.initialTwin && (
          <motion.div
            key="scenario-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <GlassCard className="p-6 border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Step 3: Simulate a Life Change</h3>
              <p className="text-slate-400 text-sm mb-6">
                Adjust the sliders below or click a preset scenario to simulate how your circumstances have changed.
                Ojas will automatically adapt your fitness plan.
              </p>

              <ScenarioInput
                onScenarioChange={handleScenarioChange}
                currentState={{
                  availableTime: demoState.initialTwin.lifestyle.availableTime,
                  sleep: demoState.initialTwin.recovery.sleepDuration,
                  stress: demoState.initialTwin.lifestyle.stressLevel,
                  budget: demoState.initialTwin.nutrition.budget,
                }}
              />

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setStage("profile-review")}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleApplyScenario}
                  disabled={demoState.isLoading || !scenarioInput}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  {demoState.isLoading ? "Adapting Plan..." : "Adapt My Plan"}
                  {!demoState.isLoading && <ChevronRight size={20} />}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 4: Plan Adapted */}
      <AnimatePresence>
        {stage === "plan-adapted" && demoState.adaptedPlan && demoState.initialPlan && (
          <motion.div
            key="plan-adapted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Scenario Info */}
            <GlassCard className="p-6 border-red-500/30 bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Your Circumstances Changed</h3>
                  <p className="text-slate-300 whitespace-pre-line text-sm">{demoState.scenarioDescription}</p>
                </div>
              </div>
            </GlassCard>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before */}
              <GlassCard className="p-6 border-slate-700">
                <h3 className="text-lg font-bold text-blue-400 mb-4">BEFORE (Original Plan)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Workout Duration</div>
                    <div className="text-3xl font-bold text-white">{demoState.initialPlan.workoutPlan.durationMinutes}min</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Days Per Week</div>
                    <div className="text-3xl font-bold text-white">{demoState.initialPlan.workoutPlan.daysPerWeek}x</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Intensity</div>
                    <div className="text-3xl font-bold text-white capitalize">{demoState.initialPlan.workoutPlan.intensity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Daily Calories</div>
                    <div className="text-3xl font-bold text-white">{demoState.initialPlan.nutritionPlan.dailyCalories}</div>
                  </div>
                </div>
              </GlassCard>

              {/* After */}
              <GlassCard className="p-6 border-green-500/30 bg-green-900/10">
                <h3 className="text-lg font-bold text-green-400 mb-4">AFTER (Adapted Plan)</h3>
                <div className="space-y-4">
                  {demoState.adaptedPlan.beforeAfterComparison.slice(0, 4).map((item, idx) => (
                    <div key={idx}>
                      <div className="text-sm text-slate-400 mb-1">{item.category}</div>
                      <div className="text-3xl font-bold text-green-400">{item.after}</div>
                      <div className="text-xs text-slate-500 mt-1">was {item.before}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Explanation */}
            {demoState.adaptedPlan && (
              <PlanAdaptationExplainer adaptedPlan={demoState.adaptedPlan} compact={false} />
            )}

            {/* Key Insight */}
            <GlassCard className="p-6 border-green-500/30 bg-green-900/20">
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={20} />
                How Ojas Solves the Problem
              </h3>
              <div className="space-y-3 text-slate-300 text-sm">
                <p>
                  <strong className="text-white">Traditional Fitness Apps:</strong> Would show you a fixed{" "}
                  <span className="font-semibold">45-minute, 5-days/week plan</span> — which you can't complete. You'd
                  skip workouts, feel guilty, and abandon the app.
                </p>
                <p>
                  <strong className="text-white">Ojas:</strong> Automatically adapts to your new reality with{" "}
                  <span className="font-semibold">shorter workouts, fewer days, and adjusted nutrition</span>. The
                  plan stays realistic and achievable, so you actually follow it.
                </p>
                <p>
                  <strong className="text-white">Result:</strong> You continue training instead of quitting. When your
                  circumstances improve, the plan readapts automatically.
                </p>
              </div>
            </GlassCard>

            {/* Reset Button */}
            <Button
              onClick={handleReset}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} />
              Run Demo Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
