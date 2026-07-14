"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Pause, RefreshCw, Zap, Flame, Sparkles, AlertTriangle, Info, 
  Search, ShieldAlert, Award, Calendar, CheckCircle2, ChevronRight, 
  Dumbbell, Trophy, Video, Mic, RefreshCcw, BarChart3, Clock, Camera
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  mistakes: string[];
  breathing: string;
  safety: string;
  notes: string;
  beginnerAlternative: string;
  advancedVariation: string;
  sets: number;
  reps: string;
  overload: string;
}

export function WorkoutView() {
  const { profile, activeWorkout, toggleExercise, completeWorkout, setWorkoutId, streak } = useFitness();
  
  // Navigation Routing Tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Sync tab via URL query parameter safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["dashboard", "generator", "library", "player", "history", "analytics"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [typeof window !== "undefined" ? window.location.search : ""]);

  // Tab 2: Generator Input States
  const [goal, setGoal] = useState<string>("muscle");
  const [location, setLocation] = useState<string>("gym");
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [soreMuscle, setSoreMuscle] = useState<string>("none");
  const [injury, setInjury] = useState<string>("none");
  const [recoveryState, setRecoveryState] = useState<string>("fresh");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<any>(null);

  // Tab 3: Exercise Library States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("all");
  const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Tab 4: Workout Player States
  const [currentWorkout, setCurrentWorkout] = useState<any>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [timerVal, setTimerVal] = useState<number>(0);
  const [playerRunning, setPlayerRunning] = useState<boolean>(false);
  const [showRestTimer, setShowRestTimer] = useState<boolean>(false);
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [loggedSets, setLoggedSets] = useState<{ [key: string]: { weight: string; reps: string; rpe: number }[] }>({});
  const [formFeedback, setFormFeedback] = useState<string>("Align joints in frame to begin computer vision tracking.");
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Tab 5: History & PR States
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  
  // Timer Refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Initial Library, History and PRs
  useEffect(() => {
    fetch("/api/workouts/exercises")
      .then(res => res.json())
      .then(data => setLibraryExercises(data))
      .catch(err => console.error("Failed to load exercises", err));

    fetch("/api/workouts/history")
      .then(res => res.json())
      .then(data => setWorkoutHistory(data))
      .catch(err => console.error("Failed to load history", err));

    fetch("/api/workouts/pr")
      .then(res => res.json())
      .then(data => setPersonalRecords(data))
      .catch(err => console.error("Failed to load PRs", err));
  }, []);

  // Workout Player Main Timer
  useEffect(() => {
    if (playerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerVal(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [playerRunning]);

  // Rest Timer Counter
  useEffect(() => {
    if (showRestTimer && restSeconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestSeconds(prev => prev - 1);
      }, 1000);
    } else if (restSeconds <= 0) {
      setShowRestTimer(false);
      setRestSeconds(60);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [showRestTimer, restSeconds]);

  // Simulated MediaPipe camera feedback loop (Squats / Pressing checks)
  useEffect(() => {
    if (!playerRunning) return;
    const feedbacks = [
      "Keep chest proud during eccentric phase.",
      "Back alignment: Optimal. Spinal flexion under safety limits.",
      "Knee track: Good alignment. Heels flat on platform.",
      "Range of motion: Deep parallel depth reached.",
      "Tempo check: Control negative phase (3s eccentric)."
    ];
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * feedbacks.length);
      setFormFeedback(feedbacks[idx]);
    }, 4500);
    return () => clearInterval(interval);
  }, [playerRunning, activeExerciseIndex]);

  // Trigger workout compilation
  const handleGenerate = () => {
    setIsGenerating(true);
    fetch(`/api/workouts/generate?goal=${goal}&level=${profile?.gymExperience || "intermediate"}&recovery=${recoveryState}&location=${location}&availableTime=${timeLimit}&soreMuscles=${soreMuscle}&injuries=${injury}`)
      .then(res => res.json())
      .then(data => {
        setGeneratedWorkout(data);
        setIsGenerating(false);
      })
      .catch(err => {
        console.error("Generator failure", err);
        setIsGenerating(false);
      });
  };

  // Load Generated workout into the Active Player
  const loadWorkoutIntoPlayer = (workoutToLoad: any) => {
    setCurrentWorkout(workoutToLoad);
    setActiveExerciseIndex(0);
    setTimerVal(0);
    setPlayerRunning(true);
    setActiveTab("player");
    
    // Initialize sets logger mapping
    const logs: any = {};
    workoutToLoad.exercises.forEach((ex: any) => {
      logs[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", rpe: 8 }));
    });
    setLoggedSets(logs);
  };

  // Complete Workout Session
  const handleCompleteWorkout = () => {
    setPlayerRunning(false);
    
    // Calculate simulated volume
    let totalVolume = 0;
    Object.values(loggedSets).forEach((setsArray) => {
      setsArray.forEach((set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        totalVolume += w * r;
      });
    });

    const body = {
      title: currentWorkout?.title || "AI Completed Workout",
      duration: Math.floor(timerVal / 60) || 1,
      calories: currentWorkout?.calories || 200,
      exercisesCompleted: currentWorkout?.exercises?.length || 3,
      volumeLogged: totalVolume || 1500
    };

    fetch("/api/workouts/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success) {
          setWorkoutHistory(prev => [resData.log, ...prev]);
        }
      });

    // Check for PRs
    const firstEx = currentWorkout?.exercises?.[0];
    const firstSet = loggedSets[firstEx?.id]?.[0];
    if (firstSet && firstSet.weight) {
      const weightVal = parseInt(firstSet.weight);
      fetch("/api/workouts/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise: firstEx.name, weight: weightVal, type: "1RM" })
      })
        .then(res => res.json())
        .then(resPr => {
          if (resPr.success) {
            setPersonalRecords(prev => [resPr.pr, ...prev]);
          }
        });
    }

    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentWorkout(null);
      setActiveTab("dashboard");
    }, 3000);
  };

  const startRestTimer = () => {
    setRestSeconds(60);
    setShowRestTimer(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 relative text-left">
      
      {/* Celebration Award Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <GlassCard className="max-w-sm w-full p-8 text-center space-y-4 border border-yellow-500/30">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white">Routine Completed!</h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              Congratulations! Session recorded, progressive overload calculated, and achievements updated.
            </p>
            <div className="text-xs font-mono text-[var(--accent)] font-bold">
              +150 XP • Weekly Consistency Spike +12%
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "dashboard", label: "Workout Dashboard", icon: Dumbbell },
          { id: "generator", label: "AI Generator", icon: Sparkles },
          { id: "library", label: "Exercise Library", icon: Search },
          { id: "player", label: "Active Player", icon: Play },
          { id: "history", label: "Records & History", icon: Trophy },
          { id: "analytics", label: "Muscle Analytics", icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30"
                  : "text-white/60 hover:text-white bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: WORKOUT DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            
            {/* Today's Workout Hero */}
            <GlassCard className="p-6 space-y-4 border-[var(--border-subtle)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-[var(--accent)]/5 rounded-full blur-2xl" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider block">Today's AI Target</span>
                  <h2 className="text-xl font-bold text-white mt-1">Hypertrophy Upper Body Pull</h2>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">Focusing on lat extensions and scapular retraction control.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--accent-glow)] text-[var(--accent)]">
                  <Flame className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="text-[9px] text-white/40 block">DURATION</span>
                  <span className="font-bold text-white mt-0.5 block">45 mins</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="text-[9px] text-white/40 block">CALORIES</span>
                  <span className="font-bold text-white mt-0.5 block">340 kcal</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <span className="text-[9px] text-white/40 block">INTENSITY</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">92% Ready</span>
                </div>
              </div>

              <div className="text-[10px] text-[var(--foreground-muted)] leading-relaxed bg-black/20 rounded-xl p-3 border border-white/5">
                <strong>Target Muscles:</strong> Lats, Upper Back, Rear Delts, Biceps. <br />
                <strong>Equipment:</strong> Barbell, Dumbbells, Cables.
              </div>

              <Button 
                onClick={() => {
                  // Load a mock workout payload for Upper Body Pull
                  const mockGenerate = {
                    title: "Hypertrophy Upper Body Pull",
                    duration: 45,
                    calories: 340,
                    difficulty: "Intermediate",
                    exercises: [
                      {
                        id: "ex_pullup",
                        name: "Bodyweight Pull-Up",
                        muscleGroup: "Lats",
                        sets: 4,
                        reps: "8-10 reps",
                        overload: "Control eccentric 3 seconds",
                        visualUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80"
                      },
                      {
                        id: "ex_rdl",
                        name: "Romanian Deadlift",
                        muscleGroup: "Hamstrings",
                        sets: 3,
                        reps: "8-10 reps",
                        overload: "Increase load 2.5kg",
                        visualUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=500&q=80"
                      }
                    ]
                  };
                  loadWorkoutIntoPlayer(mockGenerate);
                }} 
                variant="premium" 
                className="w-full text-xs py-2.5 justify-center gap-1.5"
              >
                <Play className="h-4 w-4 fill-current" /> Start AI Workout
              </Button>
            </GlassCard>

            {/* Workout History List */}
            <GlassCard className="p-5 space-y-4">
              <h3 className="font-bold text-white text-sm">Workout History logs</h3>
              <div className="space-y-3">
                {workoutHistory.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white">{log.title}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)]">{log.date} • {log.duration} mins • {log.exercisesCompleted} Exercises</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[var(--accent)]">+{log.calories} kcal</p>
                      <p className="text-[10px] text-emerald-400 font-bold">{log.volumeLogged} kg Vol</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar Stats Panel */}
          <div className="space-y-6">
            <GlassCard className="p-5 space-y-4 text-left">
              <h3 className="font-semibold text-white text-sm">Physiological Volume Progress</h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <span className="text-[9px] text-white/40 block">WEEKLY VOLUME</span>
                  <span className="text-lg font-black text-white mt-1 block">12,420 kg</span>
                  <span className="text-[9px] text-emerald-400 mt-0.5 block">+8% vs last week</span>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <span className="text-[9px] text-white/40 block">ACTIVE STREAK</span>
                  <span className="text-lg font-black text-yellow-400 mt-1 block">{streak} Days</span>
                  <span className="text-[9px] text-white/55 mt-0.5 block">Consistent Lifter</span>
                </div>
              </div>

              {/* Personal Records summary */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Bench Press PR</span>
                  <span className="font-bold text-white">105 kg</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Back Squat PR</span>
                  <span className="font-bold text-white">140 kg</span>
                </div>
              </div>
            </GlassCard>

            {/* Smart notifications */}
            <GlassCard className="p-5 space-y-3 bg-[#adc6ff]/5 border border-[#adc6ff]/20">
              <h4 className="text-xs font-bold text-[#adc6ff] flex items-center gap-1.5">
                <Info className="h-4 w-4" /> Coach Vikram Notifications
              </h4>
              <ul className="text-[10px] text-white/70 space-y-2 leading-relaxed font-mono">
                <li>🔥 Chest is fully recovered. Prime window for Bench Press volumes.</li>
                <li>⚠️ Glute recovery is low. Avoid heavy compression splits today.</li>
                <li>🎯 Completed 95% of target sets this week! Keep pushing.</li>
              </ul>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: AI WORKOUT GENERATOR */}
      {activeTab === "generator" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Configure Panel */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-[var(--accent)] animate-pulse" /> AI Engine Configuration
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">Target Goal</label>
                <select 
                  value={goal} 
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value="strength">Strength (1RM lockout vector)</option>
                  <option value="muscle">Hypertrophy (Muscle Gain volume)</option>
                  <option value="endurance">Stamina (Conditioning / High reps)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">Gym or Home</label>
                <select 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value="gym">Gym (Barbells & Cable systems)</option>
                  <option value="home">Home (Bodyweight & Dumbbells)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">Timeline Limit</label>
                <select 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value={20}>20 Minutes (Training Economy active)</option>
                  <option value={45}>45 Minutes (Standard balance)</option>
                  <option value={60}>60 Minutes (Accessories & Volume)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">DOMS Muscle Soreness</label>
                <select 
                  value={soreMuscle} 
                  onChange={(e) => setSoreMuscle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value="none">None (Full recovery detected)</option>
                  <option value="shoulders">Shoulders (Excludes pressing)</option>
                  <option value="chest">Chest (Excludes bench press)</option>
                  <option value="legs">Legs (Excludes back squatting)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">Injury Exclusions</label>
                <select 
                  value={injury} 
                  onChange={(e) => setInjury(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value="none">None (Physiologically healthy)</option>
                  <option value="lowerback">Lower Back (Excludes spinal loads)</option>
                  <option value="knees">Knees (Excludes high flexion)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/55 uppercase block mb-1">Fatigue Modifier</label>
                <select 
                  value={recoveryState} 
                  onChange={(e) => setRecoveryState(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none"
                >
                  <option value="fresh">Fresh (100% volume)</option>
                  <option value="tired">Tired (Auto-deload -30% sets)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} variant="premium" className="w-full text-xs py-2 justify-center">
              {isGenerating ? "⚙️ Calculating splits..." : "Compile AI Routine"}
            </Button>
          </GlassCard>

          {/* Outputs Panel */}
          <GlassCard className="p-5 space-y-4">
            {generatedWorkout ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <h3 className="font-bold text-white text-md">{generatedWorkout.title}</h3>
                    <p className="text-[10px] text-[var(--foreground-muted)]">
                      ⏱️ {generatedWorkout.duration}m | 🔥 {generatedWorkout.calories} kcal | ⚡ Intensity: {generatedWorkout.intensity}
                    </p>
                  </div>
                  <Badge variant="success" label={`Confidence: ${generatedWorkout.confidenceScore}%`} />
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-white/40">Warm-Up Drill</h4>
                  <ul className="list-disc pl-4 text-white/70 space-y-1">
                    {generatedWorkout.warmUp.map((w: string, idx: number) => <li key={idx}>{w}</li>)}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-white/40">Exercises Selected</h4>
                  <div className="space-y-2">
                    {generatedWorkout.exercises.map((ex: any) => (
                      <div key={ex.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-white">{ex.name}</p>
                          <p className="text-[10px] text-[var(--foreground-muted)]">{ex.muscleGroup} • {ex.equipment}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-white">{ex.sets} Sets x {ex.reps}</p>
                          <p className="text-[9px] text-[var(--accent)] font-bold">{ex.overload}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-white/40">Cool-Down Recovery</h4>
                  <ul className="list-disc pl-4 text-white/70 space-y-1">
                    {generatedWorkout.coolDown.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                  </ul>
                </div>

                <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-[10px] leading-relaxed text-[var(--foreground-muted)]">
                  <strong>Expected Benefit:</strong> {generatedWorkout.expectedBenefit} <br />
                  <strong>Reasoning:</strong> {generatedWorkout.reasoning}
                </div>

                <Button onClick={() => loadWorkoutIntoPlayer(generatedWorkout)} variant="premium" className="w-full text-xs py-2.5 justify-center gap-1.5">
                  <Play className="h-4 w-4 fill-current" /> Load into Player & Start
                </Button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
                <Sparkles className="h-10 w-10 text-white/20 animate-pulse" />
                <p className="text-xs text-[var(--foreground-muted)]">Configure specifications and compile to load today's optimized plan.</p>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 3: EXERCISE LIBRARY */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-black/20 border-white/10"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["all", "Chest", "Lats", "Quads", "Hamstrings", "Shoulders"].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMuscleFilter(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    selectedMuscleFilter === m
                      ? "bg-[var(--accent)] text-black"
                      : "text-white/60 hover:text-white bg-white/5"
                  }`}
                >
                  {m === "all" ? "All Muscles" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {libraryExercises
              .filter(ex => 
                ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (selectedMuscleFilter === "all" || ex.muscleGroup === selectedMuscleFilter)
              )
              .map((ex) => {
                const isExpanded = expandedExerciseId === ex.id;
                return (
                  <GlassCard key={ex.id} className="p-4 flex flex-col justify-between border-white/5 space-y-3 text-left">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">{ex.name}</h4>
                        <Badge variant="primary" label={ex.difficulty} />
                      </div>
                      <div className="flex gap-2 text-[10px] text-[var(--foreground-muted)]">
                        <span>💪 Muscle: <strong>{ex.muscleGroup}</strong></span>
                        <span>🛠️ {ex.equipment}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="text-[10px] text-[var(--foreground-muted)] space-y-2 pt-2 border-t border-white/5 leading-relaxed">
                        <div>
                          <strong>Instructions:</strong>
                          <ul className="list-decimal pl-4 space-y-0.5 mt-0.5">
                            {ex.instructions.map((inst: string, idx: number) => <li key={idx}>{inst}</li>)}
                          </ul>
                        </div>
                        <div><strong>Common Mistakes:</strong> <span className="text-rose-300">{ex.mistakes?.join(", ")}</span></div>
                        <div><strong>Breathing:</strong> <span>{ex.breathing}</span></div>
                        <div><strong>Safety Tip:</strong> <span className="text-yellow-400">{ex.safety}</span></div>
                        <div><strong>Vikram's Note:</strong> <span className="italic">{ex.notes}</span></div>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedExerciseId(isExpanded ? null : ex.id)}
                      className="w-full py-1.5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/5 transition"
                    >
                      {isExpanded ? "Hide Details" : "View HD Details"}
                    </button>
                  </GlassCard>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 4: WORKOUT PLAYER & SMART FORM COACH */}
      {activeTab === "player" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {currentWorkout ? (
            <div className="space-y-6">
              
              {/* Player Panel */}
              <GlassCard className="p-5 space-y-4 border-[var(--accent)]/20 relative">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <h3 className="font-bold text-white text-md">{currentWorkout.title}</h3>
                    <p className="text-[10px] text-[var(--foreground-muted)]">⏱️ Session Duration: {formatTime(timerVal)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setPlayerRunning(!playerRunning)}
                      variant={playerRunning ? "outline" : "premium"}
                      className="text-[10px] px-3 py-1.5"
                    >
                      {playerRunning ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1 fill-current" />}
                      {playerRunning ? "Pause" : "Resume"}
                    </Button>
                    <Button onClick={handleCompleteWorkout} variant="danger" className="text-[10px] px-3 py-1.5">
                      Finish Session
                    </Button>
                  </div>
                </div>

                {/* Active exercise display */}
                {currentWorkout.exercises && currentWorkout.exercises[activeExerciseIndex] && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider block">Active Exercise {activeExerciseIndex + 1} of {currentWorkout.exercises.length}</span>
                        <h4 className="text-lg font-bold text-white mt-0.5">
                          {currentWorkout.exercises[activeExerciseIndex].name}
                        </h4>
                        <p className="text-[10px] text-[var(--foreground-muted)]">Target: {currentWorkout.exercises[activeExerciseIndex].muscleGroup}</p>
                      </div>
                      <Badge variant="success" label={currentWorkout.exercises[activeExerciseIndex].reps} />
                    </div>

                    {/* Weight & Rep log sheet */}
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      <div className="grid grid-cols-4 gap-2 text-[10px] text-white/45 font-bold uppercase">
                        <span>Set</span>
                        <span>Weight (kg)</span>
                        <span>Reps</span>
                        <span>RPE (1-10)</span>
                      </div>
                      {loggedSets[currentWorkout.exercises[activeExerciseIndex].id]?.map((set, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-center text-xs">
                          <span className="text-white/60">Set {idx + 1}</span>
                          <Input
                            type="number"
                            placeholder="e.g. 80"
                            value={set.weight}
                            onChange={(e) => {
                              const list = { ...loggedSets };
                              list[currentWorkout.exercises[activeExerciseIndex].id][idx].weight = e.target.value;
                              setLoggedSets(list);
                            }}
                            className="bg-black/20 border-white/5 py-1 text-xs text-white"
                          />
                          <Input
                            type="number"
                            placeholder="e.g. 10"
                            value={set.reps}
                            onChange={(e) => {
                              const list = { ...loggedSets };
                              list[currentWorkout.exercises[activeExerciseIndex].id][idx].reps = e.target.value;
                              setLoggedSets(list);
                            }}
                            className="bg-black/20 border-white/5 py-1 text-xs text-white"
                          />
                          <select
                            value={set.rpe}
                            onChange={(e) => {
                              const list = { ...loggedSets };
                              list[currentWorkout.exercises[activeExerciseIndex].id][idx].rpe = parseInt(e.target.value);
                              setLoggedSets(list);
                            }}
                            className="rounded-xl border border-white/5 bg-[#16161a] p-1.5 text-xs text-white"
                          >
                            {[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>RPE {n}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={startRestTimer}
                        disabled={showRestTimer}
                        className="flex-1 py-2 border border-[#adc6ff]/20 bg-[#adc6ff]/5 hover:bg-[#adc6ff]/10 rounded-xl text-xs font-bold text-[#adc6ff] transition"
                      >
                        {showRestTimer ? `Resting: ${restSeconds}s` : "Start 60s Rest"}
                      </button>
                      <button
                        disabled={activeExerciseIndex === currentWorkout.exercises.length - 1}
                        onClick={() => setActiveExerciseIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition"
                      >
                        Next Exercise
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
              <ShieldAlert className="h-10 w-10 text-white/20" />
              <p className="text-xs text-[var(--foreground-muted)]">No active workout session. Please load a routine from the Dashboard or Generator!</p>
            </div>
          )}

          {/* TAB 4 RIGHT SIDE: Smart Form Coach */}
          <div className="space-y-6">
            <GlassCard className="p-5 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Video className="h-4.5 w-4.5 text-cyan-400" /> Smart Form Coach (AI Vision)
              </h3>
              
              {/* Camera Preview Mock */}
              <div className="relative aspect-video rounded-2xl border border-white/10 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-black/45" />
                
                {/* Simulated joint tracker wireframe overlay */}
                {playerRunning && (
                  <svg className="absolute inset-0 w-full h-full text-cyan-300 stroke-[2.5] drop-shadow-[0_0_8px_rgba(34,211,238,0.85)] animate-pulse">
                    <line x1="50%" y1="20%" x2="50%" y2="55%" />
                    <line x1="38%" y1="28%" x2="62%" y2="28%" />
                    <line x1="38%" y1="28%" x2="28%" y2="40%" />
                    <line x1="62%" y1="28%" x2="72%" y2="40%" />
                    <line x1="42%" y1="55%" x2="58%" y2="55%" />
                    <circle cx="50%" cy="20%" r="5" fill="#38bdf8" />
                    <circle cx="38%" cy="28%" r="4" fill="#22d3ee" />
                    <circle cx="62%" cy="28%" r="4" fill="#22d3ee" />
                  </svg>
                )}

                <div className="absolute top-3 left-3 bg-black/70 border border-white/5 rounded-xl px-2 py-1 text-[9px] font-mono text-cyan-300">
                  Pose Check: active
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500/90 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-black">
                  ✅ Heels aligned
                </div>
              </div>

              {/* Action Button to launch live camera Form Coach */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const exName = currentWorkout.exercises[activeExerciseIndex]?.name || "squat";
                    let exId = "squat";
                    const lower = exName.toLowerCase();
                    if (lower.includes("squat")) exId = "squat";
                    else if (lower.includes("pushup") || lower.includes("push-up")) exId = "push-up";
                    else if (lower.includes("bench")) exId = "bench-press";
                    else if (lower.includes("deadlift") && !lower.includes("romanian")) exId = "deadlift";
                    else if (lower.includes("romanian") || lower.includes("rdl")) exId = "romanian-deadlift";
                    else if (lower.includes("shoulder press") || lower.includes("overhead press")) exId = "shoulder-press";
                    else if (lower.includes("pullup") || lower.includes("pull-up")) exId = "pull-up";
                    else if (lower.includes("lat pull")) exId = "lat-pulldown";
                    else if (lower.includes("row")) exId = "row";
                    else if (lower.includes("lunge")) exId = "lunge";
                    else if (lower.includes("plank")) exId = "plank";
                    else if (lower.includes("curl")) exId = "biceps-curl";
                    else if (lower.includes("pushdown")) exId = "triceps-pushdown";
                    else if (lower.includes("leg press")) exId = "leg-press";
                    else if (lower.includes("thrust")) exId = "hip-thrust";
                    
                    window.location.href = `/form-coach?exercise=${exId}`;
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 py-3 text-xs font-black text-[#131315] hover:brightness-110 transition shadow-lg shadow-cyan-500/10 animate-pulse"
                >
                  <Camera className="h-4 w-4" /> Open Form Coach Camera
                </button>
              </div>

              {/* Feed Text */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[10px] flex gap-2 items-start text-cyan-300">
                <Camera className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
                <div>
                  <p className="font-bold">Real-time Form Cues:</p>
                  <p className="mt-0.5 leading-relaxed">{formFeedback}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 5: RECORDS & HISTORY */}
      {activeTab === "history" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Records */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> Personal Records & 1RMs
            </h3>
            <div className="space-y-3">
              {personalRecords.map((pr) => (
                <div key={pr.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{pr.exercise}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)]">{pr.date} • type: {pr.type}</p>
                  </div>
                  <div className="text-xs font-black text-yellow-400">
                    {pr.weight} kg
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Historical logs */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Completed Sessions Timeline</h3>
            <div className="space-y-3 font-mono text-[10px] leading-relaxed text-[var(--foreground-muted)]">
              {workoutHistory.map((log) => (
                <div key={log.id} className="border-l-2 border-[var(--accent)] pl-3">
                  <span className="text-white block font-bold">{log.date}</span>
                  <p>{log.title} completed in {log.duration} mins with {log.volumeLogged} kg total volume load.</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 6: MUSCLE ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Muscle Activation Heatmap */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Muscle Activation Heatmap</h3>
            <p className="text-[10px] text-[var(--foreground-muted)]">Relative volume percentage loaded by target groups this week.</p>
            <div className="space-y-3 text-xs">
              {[
                { muscle: "Lats & Upper Back", pct: 90, color: "bg-[var(--accent)]" },
                { muscle: "Chest / Anterior Delts", pct: 75, color: "bg-[#adc6ff]" },
                { muscle: "Quadriceps / Glutes", pct: 60, color: "bg-emerald-400" },
                { muscle: "Hamstrings / Lower Back", pct: 45, color: "bg-yellow-400" },
                { muscle: "Biceps / Triceps", pct: 30, color: "bg-rose-400" }
              ].map((g, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white font-medium">{g.muscle}</span>
                    <span className="text-[var(--foreground-muted)]">{g.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Strength Volume Chart */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Weekly Volume Load (kg)</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { week: "Wk 23", vol: 9200 },
                  { week: "Wk 24", vol: 10400 },
                  { week: "Wk 25", vol: 11100 },
                  { week: "Wk 26", vol: 12420 }
                ]}>
                  <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,.03)" }} contentStyle={{ background: "var(--background-secondary)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar dataKey="vol" fill="var(--accent)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

    </div>
  );
}
