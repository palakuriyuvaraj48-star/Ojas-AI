"use client";

import React, { useState } from "react";
import { ChevronRight, AlertCircle, TrendingDown, TrendingUp, Clock, Zap } from "lucide-react";
import {
  createInitialTwin,
  DigitalTwin,
  applyScenario,
  compareTwins,
} from "@/lib/digital-twin";
import { generateInitialPlan, adaptPlan, FitnessPlan, AdaptedPlan } from "@/lib/adaptive-engine";
import { ClientProfile } from "@/types/profile";

/**
 * SIH Demo: Shows Ojas adapting a fitness plan when user circumstances change.
 * This is the core innovation demonstration.
 */
export default function SIHDemoPage() {
  const [stage, setStage] = useState<"initial" | "plan-generated" | "scenario-applied" | "plan-adapted">("initial");
  const [userProfile, setUserProfile] = useState<ClientProfile | null>(null);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin | null>(null);
  const [initialPlan, setInitialPlan] = useState<FitnessPlan | null>(null);
  const [adaptedPlan, setAdaptedPlan] = useState<AdaptedPlan | null>(null);
  const [scenarioApplied, setScenarioApplied] = useState<string | null>(null);

  // Step 1: Create sample user profile
  const handleStartDemo = () => {
    const profile: ClientProfile = {
      name: "Anil (Sample User)",
      age: 22,
      gender: "male",
      height: 175,
      weight: 75,
      goal: "fat-loss",
      activityLevel: "moderately-active",
      gymExperience: "intermediate",
      dailyStepGoal: 8000,
      occupation: "Student",
      workoutDaysPerWeek: 5,
      availableWorkoutTime: 60,
      medicalConditions: "",
      injuries: "",
      foodPreference: "both",
      allergies: "",
      budget: "moderate",
      sleepDuration: 7.5,
      stressLevel: "low",
      availableEquipment: ["dumbbells", "barbell", "bench"],
      lifestyle: "hostel student",
      workoutEnvironment: "gym",
      workoutTime: "evening",
    };

    setUserProfile(profile);

    // Create digital twin
    const twin = createInitialTwin(profile, "demo_user_001");
    setDigitalTwin(twin);

    // Generate initial plan
    const plan = generateInitialPlan(profile, twin);
    setInitialPlan(plan);

    setStage("plan-generated");
  };

  // Step 2: Apply scenario
  const handleApplyScenario = (scenarioType: string) => {
    if (!digitalTwin || !initialPlan) return;

    let scenario: any = { type: scenarioType };

    if (scenarioType === "exam") {
      scenario = {
        type: "exam",
        duration: 7,
      };
    } else if (scenarioType === "budget") {
      scenario = {
        type: "budget-change",
        metadata: { newBudget: 150 },
      };
    }

    // Apply scenario to twin
    const { updatedTwin, changes, explanation } = applyScenario(digitalTwin, scenario);
    setDigitalTwin(updatedTwin);
    setScenarioApplied(scenarioType);

    // Now adapt the plan
    const newPlan = adaptPlan(initialPlan, updatedTwin, digitalTwin);
    setAdaptedPlan(newPlan as AdaptedPlan);

    setStage("plan-adapted");
  };

  const resetDemo = () => {
    setStage("initial");
    setUserProfile(null);
    setDigitalTwin(null);
    setInitialPlan(null);
    setAdaptedPlan(null);
    setScenarioApplied(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">Ojas AI — SIH Demo</h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Demonstrating adaptive fitness intelligence: How Ojas changes your plan when your real-life circumstances change.
          </p>
        </div>

        {/* Stage 1: Initial State */}
        {stage === "initial" && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Step 1: Initial User Assessment</h2>
              <p className="text-slate-400 mb-6">
                Meet Anil, a 22-year-old hostel student with a fat-loss goal. He has access to a gym and can dedicate
                60 minutes per day to fitness. Let's create his initial fitness plan.
              </p>
              <button
                onClick={handleStartDemo}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                Start Demo <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Plan Generated */}
        {stage === "plan-generated" && userProfile && initialPlan && digitalTwin && (
          <div className="space-y-8">
            {/* User Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">User Profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <span className="font-semibold">{userProfile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Age / Gender</span>
                    <span className="font-semibold">{userProfile.age}M / {userProfile.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Goal</span>
                    <span className="font-semibold text-orange-400">{userProfile.goal.replace("-", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Time</span>
                    <span className="font-semibold">60 min/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sleep Duration</span>
                    <span className="font-semibold">7.5 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget</span>
                    <span className="font-semibold">₹300/day</span>
                  </div>
                </div>
              </div>

              {/* Initial Metrics */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Current Condition</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stress Level</span>
                    <span className="font-semibold text-green-400">Low</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sleep Quality</span>
                    <span className="font-semibold text-green-400">Good</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recovery Score</span>
                    <span className="font-semibold text-green-400">50/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Readiness</span>
                    <span className="font-semibold text-blue-400">Moderate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stress Status</span>
                    <span className="font-semibold text-green-400">Manageable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Plan */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Generated Fitness Plan (v1)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-blue-400" />
                    <span className="text-slate-400 text-sm">Workout Duration</span>
                  </div>
                  <div className="text-2xl font-bold">{initialPlan.workoutPlan.durationMinutes}min</div>
                  <div className="text-slate-500 text-xs">{initialPlan.workoutPlan.daysPerWeek}x per week</div>
                </div>

                <div className="bg-slate-900 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} className="text-orange-400" />
                    <span className="text-slate-400 text-sm">Intensity</span>
                  </div>
                  <div className="text-2xl font-bold capitalize">{initialPlan.workoutPlan.intensity}</div>
                  <div className="text-slate-500 text-xs">Sustainable pace</div>
                </div>

                <div className="bg-slate-900 rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-green-400" />
                    <span className="text-slate-400 text-sm">Daily Calories</span>
                  </div>
                  <div className="text-2xl font-bold">{initialPlan.nutritionPlan.dailyCalories}</div>
                  <div className="text-slate-500 text-xs">15% deficit for fat loss</div>
                </div>
              </div>

              <p className="text-slate-400 text-sm">
                ✓ This plan is realistic for Anil's circumstances. He has time, good sleep, low stress, and access to gym equipment. The focus is
                sustainable fat loss with strength maintenance.
              </p>
            </div>

            {/* Scenario Buttons */}
            <div className="bg-slate-800/50 border border-blue-500/30 border-l-4 border-l-blue-500 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Step 2: Life Changes — Trigger a Scenario</h3>
              <p className="text-slate-400 mb-6">
                Now let's simulate a real-life change. Click a scenario to see how Ojas adapts the plan automatically.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleApplyScenario("exam")}
                  className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500 rounded-lg p-4 text-left transition"
                >
                  <div className="font-bold text-orange-400">📚 Exam Period Started</div>
                  <div className="text-sm text-slate-400 mt-2">Available time: 60min → 20min</div>
                  <div className="text-sm text-slate-400">Sleep: 7.5h → 5.5h</div>
                  <div className="text-sm text-slate-400">Stress: Low → High</div>
                </button>

                <button
                  onClick={() => handleApplyScenario("budget")}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500 rounded-lg p-4 text-left transition"
                >
                  <div className="font-bold text-red-400">💰 Budget Decreased</div>
                  <div className="text-sm text-slate-400 mt-2">Food budget: ₹300 → ₹150/day</div>
                  <div className="text-sm text-slate-400">Must adapt nutrition plan</div>
                  <div className="text-sm text-slate-400">Focus on affordable options</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Plan Adapted */}
        {stage === "plan-adapted" && initialPlan && adaptedPlan && (
          <div className="space-y-8">
            {/* Scenario Info */}
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {scenarioApplied === "exam" ? "📚 Exam Period Active" : "💰 Budget Constraint"}
                  </h3>
                  <p className="text-slate-300">
                    {scenarioApplied === "exam"
                      ? "Anil's circumstances changed dramatically. He now has only 20 minutes available, poor sleep, and high stress due to exams."
                      : "Anil's budget reduced significantly. Nutrition must adapt to affordable options while maintaining macros."}
                  </p>
                </div>
              </div>
            </div>

            {/* Before & After Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-blue-400">BEFORE (Plan v1)</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Workout Duration</div>
                    <div className="text-2xl font-bold">{initialPlan.workoutPlan.durationMinutes}min</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Days Per Week</div>
                    <div className="text-2xl font-bold">{initialPlan.workoutPlan.daysPerWeek}x</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Intensity</div>
                    <div className="text-2xl font-bold capitalize">{initialPlan.workoutPlan.intensity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Daily Calories</div>
                    <div className="text-2xl font-bold">{initialPlan.nutritionPlan.dailyCalories}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Food Budget</div>
                    <div className="text-2xl font-bold">₹{initialPlan.nutritionPlan.budget}</div>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="bg-slate-800/50 border border-green-500/30 border-l-4 border-l-green-500 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-green-400">AFTER (Plan v{adaptedPlan.version})</h3>
                <div className="space-y-4">
                  {adaptedPlan.beforeAfterComparison.map((item, idx) => {
                    // Extract the numeric value from before
                    const beforeNum = parseInt(item.before.match(/\d+/)?.[0] || "0");
                    const afterNum = parseInt(item.after.match(/\d+/)?.[0] || "0");

                    return (
                      <div key={idx}>
                        <div className="text-sm text-slate-400 mb-1">{item.category}</div>
                        <div className="text-2xl font-bold">
                          {item.after}
                        </div>
                        {beforeNum > afterNum && (
                          <div className="flex items-center gap-1 text-orange-400 text-xs mt-1">
                            <TrendingDown size={14} />
                            Reduced
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Why Your Plan Changed</h3>
              <div className="bg-slate-900/50 rounded p-4 space-y-3">
                {adaptedPlan.adaptations.map((adaptation, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500 pl-4">
                    <div className="font-semibold text-blue-400 capitalize">{adaptation.type.replace("-", " ")}</div>
                    <div className="text-slate-300 text-sm mt-1">{adaptation.reasoning}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                        Prototype AI Decision Confidence: {adaptation.confidence}%
                      </span>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize">
                        {adaptation.impact} impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insight */}
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
              <h3 className="font-bold text-green-400 mb-3">✓ How Ojas Solves the Problem</h3>
              <p className="text-slate-300 mb-3">
                Traditional fitness apps would show Anil a{" "}
                <span className="font-semibold">fixed 45-minute, 5-days/week plan</span> — which he can't complete during
                exams. He'd skip workouts, feel guilty, and abandon the app.
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Ojas instead automatically adapts</span> to his new reality: 20-minute
                workouts, 3 days/week, recovery-focused. The plan is realistic and achievable during his exam period,
                preventing the user from quitting. When exams end, the plan readapts.
              </p>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetDemo}
              className="w-full bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold"
            >
              Reset Demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
