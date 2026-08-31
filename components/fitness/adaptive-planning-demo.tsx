"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Target,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Flame,
  Scale,
  Award,
  RefreshCw,
  Sliders,
  Dumbbell,
  Play,
  User,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/providers/fitness-provider";

type SIHStep = 
  | "persona" 
  | "sport_requirements" 
  | "gap_analysis" 
  | "sport_plan" 
  | "training_simulation" 
  | "twin_adaptation" 
  | "summary";

export function AdaptivePlanningDemo() {
  const { completeWorkout } = useFitness();
  const [currentStep, setCurrentStep] = useState<SIHStep>("persona");
  const [isSimulatingTraining, setIsSimulatingTraining] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);

  // Demo Persona State
  const persona = {
    name: "Vikram R.",
    role: "Working Professional & Aspiring Player",
    targetGoal: "Prepare for Company Football Team Tryouts",
    availableTime: "30 minutes / day",
    level: "Beginner (Foundation)",
    sport: "⚽ Football",
  };

  // 1. Initial Measured Baseline
  const initialFitness = [
    { attribute: "Agility & Footwork", score: 48, target: 74, gap: 26, rating: "HIGH DEMAND" },
    { attribute: "Lower-Body Power", score: 63, target: 72, gap: 9, rating: "MEDIUM-HIGH" },
    { attribute: "Aerobic Endurance", score: 72, target: 76, gap: 4, rating: "HIGH DEMAND" },
    { attribute: "Dynamic Mobility", score: 81, target: 80, gap: 0, rating: "HIGH DEMAND" },
  ];

  // 2. Updated Post-Training Measured Baseline
  const updatedFitness = [
    { attribute: "Agility & Footwork", score: 61, before: 48, change: "+13 pts", status: "Significant Improvement" },
    { attribute: "Lower-Body Power", score: 67, before: 63, change: "+4 pts", status: "Steady Overload" },
    { attribute: "Aerobic Endurance", score: 75, before: 72, change: "+3 pts", status: "Pacing Preserved" },
    { attribute: "Dynamic Mobility", score: 82, before: 81, change: "+1 pt", status: "Optimal Range" },
  ];

  const handleSimulateWorkout = () => {
    setIsSimulatingTraining(true);
    setTimeout(() => {
      setHasTrained(true);
      setIsSimulatingTraining(false);
      completeWorkout(30, "football-day-1");
      setCurrentStep("twin_adaptation");
    }, 1500);
  };

  const handleResetDemo = () => {
    setHasTrained(false);
    setCurrentStep("persona");
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Top Banner */}
      <GlassCard className="p-6 border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#181a20] to-[#121316]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                SIH Hero Demo Mode
              </span>
              <span className="text-white/40 text-xs">2-Minute Judge Walkthrough</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              OJAS: The Continuous Adaptation Loop
            </h2>
            <p className="text-xs text-white/70 max-w-2xl">
              Witness how Ojas transitions a user from general baseline fitness into a sport, detects physical gaps, prescribes targeted drills, measures real progress, and adapts the Digital Twin automatically.
            </p>
          </div>

          <Button
            onClick={handleResetDemo}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 text-xs self-start shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset Demo
          </Button>
        </div>
      </GlassCard>

      {/* Step Progress Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "persona", label: "1. User Goal & Persona", num: 1 },
          { id: "sport_requirements", label: "2. Sport Requirements", num: 2 },
          { id: "gap_analysis", label: "3. Gap Analysis", num: 3 },
          { id: "sport_plan", label: "4. Sport-Specific Plan", num: 4 },
          { id: "training_simulation", label: "5. Train & Measure", num: 5 },
          { id: "twin_adaptation", label: "6. Digital Twin Adapt", num: 6 },
          { id: "summary", label: "7. SIH Takeaway", num: 7 },
        ].map((step) => {
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id as SIHStep)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? "bg-amber-400 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                {step.num}
              </span>
              {step.label}
            </button>
          );
        })}
      </div>

      {/* STEP 1: USER GOAL & PERSONA */}
      {currentStep === "persona" && (
        <GlassCard className="p-6 space-y-6 border-white/10">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 1</span>
            <h3 className="text-lg font-bold text-white">Realistic SIH Evaluation Persona</h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-white/50 text-[10px] block">User Profile</span>
              <strong className="text-white font-bold text-sm block">{persona.name}</strong>
              <span className="text-white/60">{persona.role}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-white/50 text-[10px] block">Selected Goal</span>
              <strong className="text-cyan-300 font-bold text-sm block">Start a Sport (Team Prep)</strong>
              <span className="text-white/60">{persona.targetGoal}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-white/50 text-[10px] block">Lifestyle Constraint</span>
              <strong className="text-amber-300 font-bold text-sm block">{persona.availableTime}</strong>
              <span className="text-white/60">Level: {persona.level}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Key Insight for Judges:</strong> Ojas does not assume the user is already an athlete. It accepts any beginner or working professional, understands their target sport, and creates a progressive bridge.
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setCurrentStep("sport_requirements")}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              Next: View Football Requirements <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 2: SPORT REQUIREMENTS */}
      {currentStep === "sport_requirements" && (
        <GlassCard className="p-6 space-y-6 border-white/10">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 2</span>
            <h3 className="text-lg font-bold text-white">What Does Football Require Physically?</h3>
            <p className="text-xs text-white/50">Ojas calibrates against sport-specific physical demands instead of static gym routines.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {initialFitness.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-white font-bold text-sm">{item.attribute}</strong>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                    {item.rating}
                  </span>
                </div>
                <p className="text-[11px] text-white/60">
                  Target Benchmark Score: <strong className="text-white font-mono">{item.target}/100</strong>
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentStep("persona")}
              variant="outline"
              size="sm"
              className="text-xs border-white/10 text-white/70"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep("gap_analysis")}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              Next: Calculate Fitness Gaps <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 3: GAP ANALYSIS */}
      {currentStep === "gap_analysis" && (
        <GlassCard className="p-6 space-y-6 border-white/10">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 3</span>
            <h3 className="text-lg font-bold text-white">Fitness Gap Analysis Screen</h3>
            <p className="text-xs text-white/50">Comparing Vikram&apos;s baseline vs Football Foundation benchmark targets.</p>
          </div>

          {/* Primary Opportunity Card */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-400/40 p-4 space-y-1.5 text-xs">
            <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
              🎯 Primary Development Opportunity Detected
            </span>
            <h4 className="text-base font-bold text-white">Agility & Footwork (26 Point Gap)</h4>
            <p className="text-white/80 leading-relaxed">
              Vikram is at 48/100, trailing the target of 74/100. Ojas will prioritize agility shuttle drills (5-10-5 Pro Shuttles) while maintaining his strong mobility (81/100).
            </p>
          </div>

          {/* Comparison Table */}
          <div className="space-y-2">
            {initialFitness.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-white w-1/3">{item.attribute}</span>
                <div className="flex items-center gap-4 text-center font-mono">
                  <span>Current: <strong className="text-cyan-300">{item.score}</strong></span>
                  <span>Target: <strong className="text-white">{item.target}</strong></span>
                  <span className={item.gap > 10 ? "text-rose-400 font-bold" : "text-emerald-400"}>
                    {item.gap > 0 ? `-${item.gap} pts` : "Optimal"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentStep("sport_requirements")}
              variant="outline"
              size="sm"
              className="text-xs border-white/10 text-white/70"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep("sport_plan")}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              Next: Generate Football Plan <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 4: SPORT-SPECIFIC PLAN */}
      {currentStep === "sport_plan" && (
        <GlassCard className="p-6 space-y-6 border-white/10">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 4</span>
            <h3 className="text-lg font-bold text-white">Generated Football Foundation Plan</h3>
            <p className="text-xs text-white/50">30 min / day • Focuses heavily on the detected Agility Gap.</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200">
            <strong className="block font-bold mb-0.5">Why am I doing this workout?</strong>
            <span>&quot;Agility is currently your largest development area for Football Foundation. Ojas injected 5-10-5 Pro Shuttles and Nordic Hamstrings to close this 26-point gap.&quot;</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-300">Day 1 Focus (Primary)</span>
              <strong className="text-white block">5-10-5 Pro Agility Shuttles</strong>
              <p className="text-white/60">4 sets × 3 reps (45s rest)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-white/50">Day 1 Injury Prehab</span>
              <strong className="text-white block">Nordic Hamstrings</strong>
              <p className="text-white/60">3 sets × 6 reps (eccentric control)</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold uppercase text-white/50">Day 1 Lower-Body Power</span>
              <strong className="text-white block">Explosive Box Jumps</strong>
              <p className="text-white/60">3 sets × 8 reps</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentStep("gap_analysis")}
              variant="outline"
              size="sm"
              className="text-xs border-white/10 text-white/70"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep("training_simulation")}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5"
            >
              Next: Train & Measure <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 5: TRAIN & MEASURE PERFORMANCE */}
      {currentStep === "training_simulation" && (
        <GlassCard className="p-6 space-y-6 border-white/10 text-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 5</span>
            <h3 className="text-lg font-bold text-white">Execute Workout & Vision Form Coach</h3>
            <p className="text-xs text-white/50">Simulate Vikram performing his 30-minute Day 1 agility block.</p>
          </div>

          <div className="py-8 space-y-4">
            <div className="relative h-28 w-28 mx-auto rounded-full border-4 border-amber-400/40 flex items-center justify-center bg-amber-400/5 shadow-2xl shadow-amber-400/20">
              <Dumbbell className="h-10 w-10 text-amber-400 animate-pulse" />
            </div>

            <div className="max-w-md mx-auto space-y-1 text-xs text-white/70">
              <strong className="text-white font-bold block">Smart Vision Pose & Rep Tracker Active</strong>
              <span>Measures turn cadence, joint angles, sprint split times, and recovery heart rate.</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              onClick={handleSimulateWorkout}
              disabled={isSimulatingTraining}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 px-6 py-2.5 flex items-center gap-2"
            >
              {isSimulatingTraining ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Logging Metrics & Updating Digital Twin...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Simulate Training Completion
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 6: DIGITAL TWIN UPDATES & PLAN ADAPTS */}
      {currentStep === "twin_adaptation" && (
        <GlassCard className="p-6 space-y-6 border-emerald-500/30 bg-emerald-950/10">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Step 6 (The Core Innovation)</span>
              <h3 className="text-lg font-bold text-white">Digital Twin Updated & Next Plan Adapted</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
              ✓ Loop Closed
            </span>
          </div>

          {/* Performance Progress */}
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <strong className="text-white font-bold block">1. Measured Performance Gains</strong>
              <div className="space-y-2 font-mono">
                {updatedFitness.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="text-white/70">{item.attribute}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{item.before} →</span>
                      <span className="text-white font-bold">{item.score}</span>
                      <span className="text-emerald-400 font-bold">({item.change})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <strong className="text-cyan-300 font-bold block">2. How Ojas Adapted Next Plan</strong>
              <ul className="space-y-1.5 text-[11px] text-white/80 list-disc list-inside">
                <li>Agility improved from <strong>48 → 61</strong> (+13 pts).</li>
                <li>Agility gap reduced from 26 pts to 13 pts.</li>
                <li><strong className="text-amber-300">Next Training Priority Shifted:</strong> Lower-Body Power & Explosive Movement.</li>
                <li>Preserves 30-minute daily constraint for working schedule.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentStep("training_simulation")}
              variant="outline"
              size="sm"
              className="text-xs border-white/10 text-white/70"
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep("summary")}
              className="bg-emerald-400 text-black font-bold text-xs hover:bg-emerald-300 flex items-center gap-1.5"
            >
              Next: Judge Summary <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </GlassCard>
      )}

      {/* STEP 7: SIH SUMMARY & TAKEAWAYS */}
      {currentStep === "summary" && (
        <GlassCard className="p-6 space-y-6 border-white/10">
          <div className="border-b border-white/10 pb-3">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Step 7</span>
            <h3 className="text-lg font-bold text-white">Why This Wins SIH (Key Evaluation Criteria)</h3>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <strong className="text-white font-bold block text-sm">1. Truly Dynamic</strong>
              <p className="text-white/70 leading-relaxed">
                Not a static plan generator. When the user trains, the Digital Twin updates and changes the next workout.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <Scale className="h-5 w-5 text-cyan-400" />
              <strong className="text-white font-bold block text-sm">2. 100% Explainable</strong>
              <p className="text-white/70 leading-relaxed">
                Every single drill is backed by measurable gap calculations (e.g. &quot;Agility is your largest gap&quot;).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <strong className="text-white font-bold block text-sm">3. Realistic & Safe</strong>
              <p className="text-white/70 leading-relaxed">
                Respects real human constraints: 30-minute busy schedule, personal baseline progress, and prehab safeguards.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleResetDemo}
              className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300"
            >
              Restart Hero Walkthrough
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
