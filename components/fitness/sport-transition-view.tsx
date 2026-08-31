"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  Target,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  HeartPulse,
  Flame,
  Scale,
  Compass,
  Award,
  RefreshCw,
  Sliders,
  HelpCircle,
  Dumbbell,
  Play,
  Calendar,
  Users,
  Check,
  BarChart3,
  Layers,
  BrainCircuit,
  Lock,
  Clock,
  ChevronDown
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFitness } from "@/components/providers/fitness-provider";
import { useTranslation } from "@/lib/i18n";
import {
  SPORT_REGISTRY,
  SPORT_ATTRIBUTES,
  analyzeSportFitnessGap,
  generateSportAdaptiveChallenge,
  discoverMatchingSports,
  UserMode,
  SportProgressionLevel,
  SportAttributeKey,
  SportChallenge,
  SportDiscoveryAnswer
} from "@/lib/sports";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import Link from "next/link";

type UserGoalType = "start_sport" | "improve_sport" | "prepare_team" | "maintain_sport" | "general_fitness";
type SubTab = 
  | "overview" 
  | "gaps" 
  | "plan" 
  | "foundation"
  | "performance" 
  | "team_prep" 
  | "twin_loop" 
  | "discovery" 
  | "return_to_activity"
  | "health_assessment";

export function SportTransitionView() {
  const { profile, updateProfile, completeWorkout } = useFitness();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<SubTab>("overview");
  
  // 1. User Goal Selection
  const [selectedGoal, setSelectedGoal] = useState<UserGoalType>("start_sport");
  const [userMode, setUserMode] = useState<UserMode>(profile?.userMode || "sport-transition");
  const [selectedSportId, setSelectedSportId] = useState<string>(profile?.selectedSport || "football");
  const [selectedLevel, setSelectedLevel] = useState<SportProgressionLevel>(profile?.sportLevel || "foundation");

  // Explainer modal state
  const [showAdaptationExplainer, setShowAdaptationExplainer] = useState(false);

  // Team Prep options
  const [teamType, setTeamType] = useState<"college" | "company" | "local">("company");

  // Available Time
  const availableTime = profile?.availableWorkoutTime || 30;

  // 2. User's Current Measured Attributes & Personal Baseline
  const [currentAttributes, setCurrentAttributes] = useState<Record<SportAttributeKey, number>>({
    agility: 48,
    acceleration: 61,
    endurance: 72,
    lower_body_power: 63,
    upper_body_strength: 58,
    core_stability: 62,
    mobility: 81,
    reaction_time: 68,
    rotational_power: 54,
    repeated_effort: 64,
  });

  const [baselineAttributes, setBaselineAttributes] = useState<Record<SportAttributeKey, number>>({
    agility: 48,
    acceleration: 55,
    endurance: 68,
    lower_body_power: 60,
    upper_body_strength: 55,
    core_stability: 58,
    mobility: 78,
    reaction_time: 65,
    rotational_power: 50,
    repeated_effort: 60,
  });

  // Training simulation state
  const [hasCompletedTraining, setHasCompletedTraining] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Return to activity state
  const [injuryState] = useState({
    active: false,
    discomfort: "mild" as "none" | "mild" | "moderate" | "high",
    affectedArea: "Right Ankle / Achilles",
    phase: "Low-Load Conditioning",
    toleranceScore: 78,
  });

  // Discovery quiz state
  const [discoveryAnswers, setDiscoveryAnswers] = useState<SportDiscoveryAnswer>({
    interests: ["running", "team_sports"],
    preferredPace: "tactical_agility",
    environment: "outdoor_turf",
    teamOrSolo: "team",
    availableTimeMinutes: 30,
    physicalStrengths: ["agility", "endurance"],
  });
  const [discoveryResults, setDiscoveryResults] = useState<any[] | null>(null);

  // Active sport configuration
  const activeSport = SPORT_REGISTRY[selectedSportId] || SPORT_REGISTRY["football"];

  // Compute deterministic gap analysis
  const gapAnalysis = useMemo(() => {
    return analyzeSportFitnessGap(selectedSportId, selectedLevel, currentAttributes, baselineAttributes);
  }, [selectedSportId, selectedLevel, currentAttributes, baselineAttributes]);

  // Secondary development area
  const secondaryDevelopmentArea = useMemo(() => {
    const sorted = [...gapAnalysis.attributeScores]
      .filter(a => a.attributeId !== gapAnalysis.primaryDevelopmentArea.attributeId)
      .sort((a, b) => b.gap - a.gap);
    return sorted[0] || gapAnalysis.attributeScores[1];
  }, [gapAnalysis]);

  // Handle Entry Mode Selection
  const handleEntryMode = (modeType: "start" | "improve" | "team") => {
    if (modeType === "start") {
      setSelectedGoal("start_sport");
      setUserMode("sport-transition");
      setSelectedLevel("foundation");
      updateProfile({ userMode: "sport-transition", sportLevel: "foundation" });
    } else if (modeType === "improve") {
      setSelectedGoal("improve_sport");
      setUserMode("athlete-performance");
      setSelectedLevel("performance");
      updateProfile({ userMode: "athlete-performance", sportLevel: "performance" });
    } else {
      setSelectedGoal("prepare_team");
      setUserMode("sport-transition");
      updateProfile({ userMode: "sport-transition" });
      setActiveTab("team_prep");
    }
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSportId(sportId);
    updateProfile({ selectedSport: sportId });
  };

  const handleLevelChange = (level: SportProgressionLevel) => {
    setSelectedLevel(level);
    updateProfile({ sportLevel: level });
  };

  // Simulate performing sport-specific training session & measuring performance
  const handlePerformTraining = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setCurrentAttributes(prev => ({
        ...prev,
        agility: Math.min(85, prev.agility + 13), // 48 -> 61
        lower_body_power: Math.min(85, prev.lower_body_power + 4), // 63 -> 67
        endurance: Math.min(90, prev.endurance + 3), // 72 -> 75
      }));
      setHasCompletedTraining(true);
      setIsSimulating(false);
      completeWorkout(35, "sport-day-1");
    }, 1200);
  };

  const handleResetBaseline = () => {
    setCurrentAttributes({
      agility: 48,
      acceleration: 61,
      endurance: 72,
      lower_body_power: 63,
      upper_body_strength: 58,
      core_stability: 62,
      mobility: 81,
      reaction_time: 68,
      rotational_power: 54,
      repeated_effort: 64,
    });
    setHasCompletedTraining(false);
  };

  const handleRunDiscovery = () => {
    const recs = discoverMatchingSports(discoveryAnswers);
    setDiscoveryResults(recs);
  };

  // Radar data
  const radarData = useMemo(() => {
    return gapAnalysis.attributeScores.map((attr) => ({
      attribute: attr.name.split("&")[0].trim(),
      PersonalBaseline: attr.baselineScore,
      CurrentScore: attr.currentScore,
      SportTarget: attr.targetScore,
    }));
  }, [gapAnalysis]);

  // Goal name label helper
  const getGoalLabel = (goal: UserGoalType) => {
    switch (goal) {
      case "start_sport": return "Start a Sport";
      case "improve_sport": return "Improve My Sport";
      case "prepare_team": return "Prepare for Team";
      default: return "Sport Preparation";
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header Section */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-blue-950/40 via-[#181a20] to-[#121316]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" />
                {t("sports_title", "Sports & Performance")}
              </span>
              <span className="text-white/40 text-xs">Foundation → Development → Performance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t("sports_title", "Sports & Performance")}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-2xl">
              <strong>{t("sports_subtitle", "Prepare for a sport. Improve your performance. Evolve with Ojas.")}</strong><br />
              Identify your physical gaps, receive progressive sport drills, measure progress against your personal baseline, and adapt continuously.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start shrink-0">
            <Link href="/adaptive-demo">
              <Button size="sm" className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                <Sparkles className="h-3.5 w-3.5" /> See How Ojas Solves the Problem
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* 2. Visual Journey: My Sport Journey Timeline */}
      <GlassCard className="p-4 border-white/10 bg-black/40">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#adc6ff] flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" /> My Sport Journey
            </span>
            <span className="text-[10px] text-white/50 font-mono">Closed-Loop Progression</span>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center text-[10px]">
            {[
              { step: "1", title: "General Fitness", state: "done" },
              { step: "2", title: "Choose Sport", state: "current" },
              { step: "3", title: "Assess", state: "next" },
              { step: "4", title: "Identify Gap", state: "next" },
              { step: "5", title: "Train", state: "next" },
              { step: "6", title: "Measure", state: "next" },
              { step: "7", title: "Adapt", state: "next" },
              { step: "8", title: "Improve", state: "next" },
            ].map((s, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 ${
                  s.state === "current"
                    ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold"
                    : s.state === "done"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-white/[0.02] border-white/5 text-white/50"
                }`}
              >
                <span className="text-[9px] opacity-60">Step {s.step}</span>
                <span className="truncate w-full">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 3. Three Primary Entry Modes */}
      <div className="grid sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => handleEntryMode("start")}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
            selectedGoal === "start_sport"
              ? "bg-blue-600/25 border-blue-400 text-white shadow-xl shadow-blue-500/10 scale-[1.01]"
              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏃</span>
              {selectedGoal === "start_sport" && <CheckCircle2 className="h-4 w-4 text-cyan-300" />}
            </div>
            <strong className="text-sm font-bold text-white block">Start a Sport</strong>
            <p className="text-xs text-white/60">I want to prepare my body and fitness for a sport.</p>
          </div>
          <span className="text-xs font-bold text-[#adc6ff] flex items-center gap-1 pt-1">
            Explore Sports <ArrowRight className="h-3 w-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleEntryMode("improve")}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
            selectedGoal === "improve_sport"
              ? "bg-amber-500/25 border-amber-400 text-white shadow-xl shadow-amber-500/10 scale-[1.01]"
              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏆</span>
              {selectedGoal === "improve_sport" && <CheckCircle2 className="h-4 w-4 text-amber-300" />}
            </div>
            <strong className="text-sm font-bold text-white block">Improve My Sport</strong>
            <p className="text-xs text-white/60">I already play a sport and want to improve my performance.</p>
          </div>
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1 pt-1">
            Improve Performance <ArrowRight className="h-3 w-3" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleEntryMode("team")}
          className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
            selectedGoal === "prepare_team"
              ? "bg-emerald-500/25 border-emerald-400 text-white shadow-xl shadow-emerald-500/10 scale-[1.01]"
              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🤝</span>
              {selectedGoal === "prepare_team" && <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            </div>
            <strong className="text-sm font-bold text-white block">Prepare for a Team</strong>
            <p className="text-xs text-white/60">I want to prepare physically for a team or sports trial.</p>
          </div>
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 pt-1">
            Prepare for Team <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "overview", label: "Overview & Sport Profile", icon: Target },
          { id: "gaps", label: "Where Do I Need To Improve? (Gaps)", icon: Scale },
          { id: "plan", label: "Sport Training Plan", icon: Dumbbell },
          { id: "foundation", label: "Physical Foundation & Progression", icon: Layers },
          { id: "performance", label: "Performance Center", icon: BarChart3 },
          { id: "team_prep", label: "Team Preparation", icon: Users },
          { id: "twin_loop", label: "Sports Digital Twin & Adaptation", icon: BrainCircuit },
          { id: "discovery", label: "Which Sport Fits Me?", icon: Compass },
          { id: "return_to_activity", label: "Return to Activity", icon: HeartPulse },
          { id: "health_assessment", label: "Health & Assessment", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & SPORT SELECTION & PROFILE */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Sport Picker */}
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{t("sports_which_sport", "Choose Your Sport")}</h3>
                <p className="text-xs text-white/50">Select your discipline to calibrate demands and progression targets.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>Progression Level:</span>
                <select
                  value={selectedLevel}
                  onChange={(e: any) => handleLevelChange(e.target.value)}
                  className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-xs text-white capitalize focus:outline-none"
                >
                  <option value="foundation">Foundation (Beginner)</option>
                  <option value="development">Development (Intermediate)</option>
                  <option value="performance">Performance (Competitive)</option>
                  <option value="advanced">Advanced (Peak)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(SPORT_REGISTRY).map((s) => {
                const isSelected = selectedSportId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSportChange(s.id)}
                    className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                      isSelected
                        ? "bg-blue-600/25 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                        : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <strong className="text-xs font-bold text-white block">{s.name}</strong>
                    <span className="text-[10px] text-white/50">{s.tagline.split(",")[0]}</span>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* Section 5: Sport Profile & What does this sport require? */}
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Sport Profile Summary</h3>
                <p className="text-xs text-white/50">Your active parameters calibrated against {activeSport.name}.</p>
              </div>
              <Badge variant="primary" label={`${activeSport.category.toUpperCase()}`} />
            </div>

            {/* 4-Stat Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-bold block">SPORT</span>
                <strong className="text-white font-bold text-sm block">{activeSport.icon} {activeSport.name}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-bold block">YOUR LEVEL</span>
                <strong className="text-cyan-300 font-bold text-sm block capitalize">{selectedLevel}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-bold block">YOUR GOAL</span>
                <strong className="text-amber-300 font-bold text-sm block">{getGoalLabel(selectedGoal)}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] text-white/50 uppercase font-bold block">AVAILABLE TIME</span>
                <strong className="text-emerald-300 font-bold text-sm block font-mono">{availableTime} min/day</strong>
              </div>
            </div>

            {/* What does this sport require? */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#adc6ff] flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" /> What does {activeSport.name} require?
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {activeSport.requiredAttributes.map((req) => {
                  const attrDef = SPORT_ATTRIBUTES[req.attributeId];
                  const intensity = req.weightInSport >= 5 ? "HIGH" : req.weightInSport >= 4 ? "MEDIUM-HIGH" : "MEDIUM";
                  const intensityColor = req.weightInSport >= 5 ? "text-amber-300 bg-amber-400/20" : req.weightInSport >= 4 ? "text-cyan-300 bg-cyan-400/20" : "text-white/70 bg-white/10";
                  
                  return (
                    <div key={req.attributeId} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <strong className="text-white font-bold block text-xs">{attrDef?.name || req.attributeId}</strong>
                        <span className="text-[10px] text-white/50">Weight factor {req.weightInSport}/5</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${intensityColor}`}>
                        {intensity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Active Sport Profile Summary Card */}
          <div className="grid sm:grid-cols-3 gap-4">
            <GlassCard className="p-5 border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-white/50 block">Active Sport Overview</span>
              <h4 className="text-xl font-bold text-white">{activeSport.icon} {activeSport.name}</h4>
              <p className="text-xs text-white/60">{activeSport.overview}</p>
            </GlassCard>

            <GlassCard className="p-5 border-emerald-500/30 bg-emerald-950/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">{t("sports_preparation_score", "My Sport Readiness")}</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white font-mono">{gapAnalysis.readinessScore}%</span>
                <span className="text-xs text-emerald-300 font-bold">Overall Development</span>
              </div>
              <p className="text-xs text-white/70">Current Level: <strong className="text-white capitalize">{selectedLevel}</strong></p>
            </GlassCard>

            <GlassCard className="p-5 border-amber-500/30 bg-amber-950/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-amber-300 block">{t("sports_primary_gap", "Primary Development Area")}</span>
              <h4 className="text-base font-bold text-white">{gapAnalysis.primaryDevelopmentArea.name}</h4>
              <p className="text-xs text-white/80">-{gapAnalysis.primaryDevelopmentArea.gap} pts gap to target benchmark.</p>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: WHERE DO I NEED TO IMPROVE? (FITNESS GAP ANALYSIS) */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          {/* Transparency Notice */}
          <div className="flex items-center gap-2 text-[11px] text-white/50 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
            <Info className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Values reflect active baseline measurements compared against {activeSport.name} benchmark targets (
              <strong className="text-white">Training assessment / demo baseline values</strong>).
            </span>
          </div>

          {/* Primary & Secondary Gap Explanation */}
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassCard className="p-5 border-amber-500/30 bg-amber-500/10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded">
                🎯 {t("sports_primary_gap", "Primary Development Area")}: {gapAnalysis.primaryDevelopmentArea.name}
              </span>
              <h3 className="text-lg font-bold text-white">
                {gapAnalysis.primaryDevelopmentArea.name} ({gapAnalysis.primaryDevelopmentArea.gap} Point Gap)
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {gapAnalysis.primaryDevelopmentArea.explanation}
              </p>
              <div className="pt-2 text-[11px] text-amber-200">
                <strong>Why is this important?</strong> &quot;{gapAnalysis.primaryDevelopmentArea.name} is one of the key physical qualities required for {activeSport.name} and is currently your largest development gap.&quot;
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-blue-500/30 bg-blue-500/10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300 bg-blue-400/20 px-2 py-0.5 rounded">
                ⚡ {t("sports_secondary_gap", "Secondary Focus Area")}: {secondaryDevelopmentArea.name}
              </span>
              <h3 className="text-lg font-bold text-white">
                {secondaryDevelopmentArea.name} ({secondaryDevelopmentArea.gap} Point Gap)
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Current score is {secondaryDevelopmentArea.currentScore}/100 vs target {secondaryDevelopmentArea.targetScore}/100.
              </p>
              <div className="pt-2 text-[11px] text-blue-200">
                <strong>Ojas Action:</strong> Neuromuscular overload pairing and stability prehab.
              </div>
            </GlassCard>
          </div>

          {/* YOU vs TARGET Table & Radar Chart */}
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
            <GlassCard className="p-5 space-y-4 border-white/10">
              <div className="border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-[#adc6ff]" />
                  {t("sports_gap_analysis", "Where Do I Need To Improve?")}
                </h4>
                <p className="text-[11px] text-white/50 mt-0.5">Physical qualities compared to your personal baseline.</p>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.15)" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" />
                    <Radar name="Personal Baseline" dataKey="PersonalBaseline" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                    <Radar name="Current Measurement" dataKey="CurrentScore" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                    <Radar name="Sport Requirement Target" dataKey="SportTarget" stroke="#eab308" fill="#eab308" fillOpacity={0.15} strokeDasharray="3 3" />
                    <Tooltip contentStyle={{ backgroundColor: "#181a20", borderColor: "rgba(255,255,255,0.2)", fontSize: "11px" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" /> Personal Baseline
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block" /> Current State
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> Sport Target
                </span>
              </div>
            </GlassCard>

            {/* Gap List Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Attribute Gap Table</h4>
                <div className="flex gap-4 text-[11px] font-mono text-white/50">
                  <span>YOU</span>
                  <span>TARGET</span>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {gapAnalysis.attributeScores.map((attr) => {
                  const isPrimary = attr.attributeId === gapAnalysis.primaryDevelopmentArea.attributeId;
                  const progressPct = Math.round((attr.currentScore / attr.targetScore) * 100);

                  return (
                    <GlassCard
                      key={attr.attributeId}
                      className={`p-3.5 border transition ${
                        isPrimary ? "border-amber-400/50 bg-amber-400/5" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{attr.name}</span>
                          {isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                              Primary Gap
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono font-bold">
                          <span className="text-white">{attr.currentScore}</span>
                          <span className="text-amber-300">{attr.targetScore}</span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPrimary ? "bg-amber-400" : progressPct >= 90 ? "bg-emerald-400" : "bg-cyan-400"
                          }`}
                          style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-white/50">
                        <span>Gap: <strong className="text-rose-300 font-mono">-{attr.gap} pts</strong></span>
                        <span className="text-emerald-300">
                          {attr.changeFromBaseline >= 0 ? `+${attr.changeFromBaseline}` : attr.changeFromBaseline} from baseline
                        </span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPORT TRAINING PLAN */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {/* Why am I doing this workout? */}
          <GlassCard className="p-5 border-blue-500/30 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-black space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#adc6ff]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t("sports_why_this_plan", "Why am I doing this workout?")}
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              &quot;{gapAnalysis.primaryDevelopmentArea.name} is currently your largest development area for {activeSport.name} ({selectedLevel}). Ojas has prioritized specialized drills ({activeSport.signatureDrills[0]?.name || "Agility Shuttles"}) to bridge this {gapAnalysis.primaryDevelopmentArea.gap}-point gap while adapting to your {availableTime}-minute workout budget.&quot;
            </p>
          </GlassCard>

          {/* Weekly Schedule */}
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {activeSport.name} ({selectedLevel.toUpperCase()}) — {t("sports_weekly_split", "Your Sport Training Plan")}
                </h3>
                <p className="text-xs text-white/50">{availableTime} min / day • Injects signature sport drills and injury prehab.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Adaptive Schedule
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { day: "Day 1", title: `${activeSport.signatureDrills[0]?.name || "Agility Shuttles"}`, drills: "4 sets × 3 reps (45s rest)", dur: `${availableTime} min`, type: "primary" },
                { day: "Day 2", title: "Mobility & Recovery", drills: "Thoracic Openers + Hip Mobility", dur: "20 min", type: "recovery" },
                { day: "Day 3", title: "Conditioning", drills: "Repeated High-Intensity Strides", dur: `${availableTime} min`, type: "cardio" },
                { day: "Day 4", title: "Rest & Recovery", drills: "Sleep Hygiene & Hydration", dur: "Rest", type: "rest" },
                { day: "Day 5", title: "Agility & Explosive Power", drills: "Plyometrics & Cone Weaves", dur: `${availableTime} min`, type: "primary" },
                { day: "Day 6", title: "Sport Practice / Field Drills", drills: "Tactical Movement & Ball Control", dur: "45 min", type: "sport" },
                { day: "Day 7", title: "Active Recovery", drills: "Weekly Progress Review", dur: "15 min", type: "recovery" },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    d.type === "primary"
                      ? "bg-amber-500/10 border-amber-400/40 text-white"
                      : d.type === "rest"
                      ? "bg-white/[0.01] border-white/5 text-white/40"
                      : "bg-white/[0.03] border-white/10 text-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-white/50 uppercase">{d.day}</span>
                    <span className="text-[10px] font-mono text-cyan-300">{d.dur}</span>
                  </div>
                  <strong className="text-xs font-bold block text-white">{d.title}</strong>
                  <p className="text-[11px] text-white/60">{d.drills}</p>
                </div>
              ))}
            </div>

            {/* Interactive Simulation Action */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-white/70">
                {!hasCompletedTraining ? (
                  <span>Ready to complete Day 1 training and test your performance?</span>
                ) : (
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Day 1 Completed! Digital Twin updated and next plan adapted.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {hasCompletedTraining && (
                  <Button
                    onClick={handleResetBaseline}
                    variant="outline"
                    size="sm"
                    className="text-xs border-white/10 text-white/70"
                  >
                    Reset Baseline Values
                  </Button>
                )}
                <Button
                  onClick={handlePerformTraining}
                  disabled={isSimulating}
                  className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 flex items-center gap-1.5 shadow-lg shadow-amber-400/20"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Measuring Performance...
                    </>
                  ) : hasCompletedTraining ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                      Train Again & Re-Measure
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Complete Day 1 & Measure Performance
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: PHYSICAL FOUNDATION & PROGRESSION */}
      {activeTab === "foundation" && (
        <div className="space-y-6">
          {/* Progression Journey Visual */}
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Sport Progression Pathway</h3>
              <p className="text-xs text-white/50">Your phased progression pathway from movement base to competitive match fitness.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              {[
                { level: "foundation", title: "1. FOUNDATION", desc: "Build movement mechanics, tendon capacity, and aerobic base.", active: selectedLevel === "foundation" },
                { level: "development", title: "2. DEVELOPMENT", desc: "Sport-specific conditioning, explosive power, and tactical speed.", active: selectedLevel === "development" },
                { level: "performance", title: "3. PERFORMANCE", desc: "Match-pace intensity, repeated sprint stamina, and peak performance.", active: selectedLevel === "performance" || selectedLevel === "advanced" },
              ].map((p, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => handleLevelChange(p.level as SportProgressionLevel)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    p.active
                      ? "bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10"
                      : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-sm text-white">{p.title}</strong>
                    {p.active && <Badge variant="primary" label="CURRENT" />}
                  </div>
                  <p className="text-[11px] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Build Your Physical Foundation */}
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">Build Your Physical Foundation for {activeSport.name}</h3>
              <p className="text-xs text-white/50">Core physical qualities trained dynamically for {activeSport.name}.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {activeSport.requiredAttributes.map((req) => {
                const attrDef = SPORT_ATTRIBUTES[req.attributeId];
                return (
                  <div key={req.attributeId} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <strong className="text-white font-bold block">{attrDef?.name || req.attributeId}</strong>
                    <p className="text-[11px] text-white/60 leading-relaxed">{req.rationale}</p>
                    <span className="text-[10px] text-amber-300 font-mono block pt-1">
                      Target Score: {req.foundationTarget} (Foundation) → {req.performanceTarget} (Performance)
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: PERFORMANCE CENTER */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#adc6ff]" />
                  📊 Performance Center & Baselines
                </h3>
                <p className="text-xs text-white/50">Compare with yourself first, then review authorized benchmarks.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold font-mono">
                {hasCompletedTraining ? "Demo / Simulated Data" : "Personal Baseline"}
              </span>
            </div>

            {/* My Progress Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">My Progress</h4>
              <div className="grid sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold block">Agility</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">48 → {currentAttributes.agility}</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      +{currentAttributes.agility - 48}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold block">Strength & Power</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">63 → {currentAttributes.lower_body_power}</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      +{currentAttributes.lower_body_power - 63}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
                  <span className="text-[10px] text-white/50 uppercase font-bold block">Endurance</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">72 → {currentAttributes.endurance}</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">
                      +{currentAttributes.endurance - 72}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compare With Yourself */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#adc6ff]">
                {t("sports_personal_progress", "Compare With Yourself")}
              </h4>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Initial Agility</span>
                  <strong className="text-white font-bold text-base block font-mono">48</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Current Agility</span>
                  <strong className="text-cyan-300 font-bold text-base block font-mono">{currentAttributes.agility}</strong>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Improvement</span>
                  <strong className="text-emerald-400 font-bold text-base block font-mono">+{currentAttributes.agility - 48} pts</strong>
                </div>
              </div>
            </div>

            {/* Compare With Benchmarks */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Compare With Benchmarks</h4>
              <div className="grid sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Personal Target</span>
                  <strong className="text-white font-bold block">Foundation (65 pts)</strong>
                  <span className="text-emerald-300 text-[10px]">On Track ({gapAnalysis.readinessScore}%)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Training Level</span>
                  <strong className="text-cyan-300 font-bold block">Development (75 pts)</strong>
                  <span className="text-white/40 text-[10px]">Next Milestone</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Coach Benchmark</span>
                  <strong className="text-white font-bold block">Club Coach (70 pts)</strong>
                  <span className="text-white/40 text-[10px]">Reference Range</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Team Tryout Benchmark</span>
                  <strong className="text-amber-300 font-bold block">Company Tryout (72 pts)</strong>
                  <span className="text-white/40 text-[10px]">Trial Standard</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50">
                <strong>Benchmark Note:</strong> Benchmarking helps identify development gaps; it does not determine a person&apos;s worth or guarantee selection.
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 6: TEAM PREPARATION */}
      {activeTab === "team_prep" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Users className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white">🤝 Team Preparation</h3>
                <p className="text-xs text-white/50">Condition physically for your target team trials ({availableTime} min/day).</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Sport</span>
                <strong className="text-white font-bold text-sm block">{activeSport.icon} {activeSport.name}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Team Type</span>
                <select
                  value={teamType}
                  onChange={(e: any) => setTeamType(e.target.value)}
                  className="rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-xs text-white w-full focus:outline-none"
                >
                  <option value="company">Company / Corporate Sports Team</option>
                  <option value="college">College / University Team</option>
                  <option value="local">Local Club / League Trial</option>
                </select>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Current Level</span>
                <strong className="text-cyan-300 font-bold text-sm block capitalize">{selectedLevel}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Available Time</span>
                <strong className="text-amber-300 font-bold text-sm block">{availableTime} min/day</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1.5">
              <strong className="block font-bold">Team Preparation Plan</strong>
              <p>
                Ojas has structured a {availableTime}-minute high-efficiency conditioning split focusing on repeated sprint ability and agility to prepare you physically for {activeSport.name} {teamType} trials. (Selection not guaranteed).
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 7: SPORTS DIGITAL TWIN & ADAPTIVE LOOP */}
      {activeTab === "twin_loop" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-[#adc6ff]" />
                  🧬 My Sports Digital Twin
                </h3>
                <p className="text-xs text-white/50">Live twin parameters informing the Adaptive Engine.</p>
              </div>
              <Button
                onClick={() => setShowAdaptationExplainer(!showAdaptationExplainer)}
                size="sm"
                variant="outline"
                className="text-xs border-white/10 text-[#adc6ff]"
              >
                Why did my plan change?
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Sport</span>
                <strong className="text-white font-bold block truncate">{activeSport.icon} {activeSport.name}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Goal</span>
                <strong className="text-amber-300 font-bold block truncate">{getGoalLabel(selectedGoal)}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Level</span>
                <strong className="text-cyan-300 font-bold block capitalize">{selectedLevel}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Fitness</span>
                <strong className="text-white font-bold block font-mono">65</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Primary Gap</span>
                <strong className="text-rose-300 font-bold block truncate">{gapAnalysis.primaryDevelopmentArea.name}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Recovery</span>
                <strong className="text-emerald-400 font-bold block">Good (78%)</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-white/50 text-[10px] block">Available Time</span>
                <strong className="text-white font-bold block">{availableTime} min</strong>
              </div>
            </div>

            {/* Section 19: Ojas Adaptation Panel */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> ⚙️ Ojas Adaptation
              </h4>
              
              <div className="grid sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">Your previous state</span>
                  <p className="text-white font-mono">Agility 48</p>
                  <p className="text-white/60 font-mono">Time 30 min</p>
                </div>
                
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1 flex flex-col justify-center text-center">
                  <span className="text-[#adc6ff] font-bold block">Training</span>
                  <span className="text-white/60 text-[11px]">Day 1 Completed</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-white/50 text-[10px] block">New state</span>
                  <p className="text-emerald-300 font-mono font-bold">Agility {currentAttributes.agility}</p>
                  <p className="text-white/60 font-mono">Time 20 min</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 space-y-1">
                  <span className="text-amber-300 text-[10px] font-bold block">Ojas adapted your next plan</span>
                  <p className="text-white font-bold text-[11px]">New focus: Lower-body power</p>
                </div>
              </div>
            </div>

            {/* Section 20: "Why did Ojas change my plan?" Explainer Drawer */}
            {showAdaptationExplainer && (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-2">
                <strong className="text-white font-bold block">Why did Ojas change my plan?</strong>
                <ul className="space-y-1 list-disc list-inside">
                  <li>&quot;Your available training time decreased, so Ojas shortened today&apos;s session.&quot;</li>
                  <li>&quot;Your agility gap decreased (+13 pts), so Ojas shifted your next training priority to lower-body power.&quot;</li>
                  <li>&quot;Your recovery is stable (78%), maintaining optimal drill intensity.&quot;</li>
                </ul>
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 8: WHICH SPORT FITS ME? (DISCOVERY) */}
      {activeTab === "discovery" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <Compass className="h-6 w-6 text-[#adc6ff]" />
              <div>
                <h3 className="text-base font-bold text-white">Which Sport Fits Me? (Discovery Mode)</h3>
                <p className="text-xs text-white/50">Explore sports matching your movement pace, facilities, and available time.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 block">Preferred Movement Pace</label>
                <select
                  value={discoveryAnswers.preferredPace}
                  onChange={(e: any) => setDiscoveryAnswers(prev => ({ ...prev, preferredPace: e.target.value }))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="explosive_bursts">Short Explosive Bursts</option>
                  <option value="continuous_stamina">Continuous Stamina / Running</option>
                  <option value="tactical_agility">Multi-directional Tactical Agility</option>
                  <option value="strength_power">High-contact Strength & Power</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 block">Available Training Facility</label>
                <select
                  value={discoveryAnswers.environment}
                  onChange={(e: any) => setDiscoveryAnswers(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="outdoor_turf">Outdoor Turf / Ground / College Pitch</option>
                  <option value="indoor_court">Indoor Badminton / Wooden Court</option>
                  <option value="track">Track / Road Running</option>
                  <option value="any">Any Available Space</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 block">Team vs Individual Sport</label>
                <select
                  value={discoveryAnswers.teamOrSolo}
                  onChange={(e: any) => setDiscoveryAnswers(prev => ({ ...prev, teamOrSolo: e.target.value }))}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="team">Team Sport (Cricket, Football, Kabaddi)</option>
                  <option value="solo">Individual Sport (Athletics, Badminton)</option>
                  <option value="both">Open to Both</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleRunDiscovery}
                className="bg-[#adc6ff] text-[#131315] font-bold text-xs hover:brightness-110"
              >
                Analyze Sport Matches
              </Button>
            </div>
          </GlassCard>

          {discoveryResults && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Recommended Sports to Explore</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                {discoveryResults.slice(0, 3).map((rec, idx) => (
                  <GlassCard key={idx} className="p-4 border-white/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{rec.icon}</span>
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-bold font-mono">
                          {rec.fitScore}% Fit
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-sm">{rec.sportName}</h5>
                      <ul className="mt-2 space-y-1 text-[11px] text-white/70 list-disc list-inside">
                        {rec.whyFitReasons.map((r: string, rIdx: number) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={() => {
                        handleSportChange(rec.sportId);
                        setActiveTab("overview");
                      }}
                      size="sm"
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs mt-2"
                    >
                      Select & Build Plan
                    </Button>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 9: SAFE RETURN TO ACTIVITY */}
      {activeTab === "return_to_activity" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-6 w-6 text-rose-400" />
              <div>
                <h3 className="text-base font-bold text-white">{t("sports_return_activity", "Return to Activity")}</h3>
                <p className="text-xs text-white/50">Non-diagnostic progressive loading protocol for post-strain reconditioning.</p>
              </div>
            </div>

            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-200 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>
                Safety Guarantee: Ojas does not diagnose injuries or provide medical clearance. Consult a qualified healthcare professional before changing training if you have a medical condition, injury, pain, or health concern.
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 space-y-1">
                <span className="text-white/50 text-[10px] block">Monitored Area</span>
                <span className="font-bold text-white text-sm block">{injuryState.affectedArea}</span>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 space-y-1">
                <span className="text-white/50 text-[10px] block">Current Stage</span>
                <span className="font-bold text-cyan-300 text-sm block">{injuryState.phase}</span>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 space-y-1">
                <span className="text-white/50 text-[10px] block">Discomfort Level</span>
                <span className="font-bold text-emerald-400 text-sm block capitalize">{injuryState.discomfort}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 10: HEALTH & ASSESSMENT */}
      {activeTab === "health_assessment" && (
        <div className="space-y-6">
          <GlassCard className="p-6 border-white/10 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Lock className="h-5 w-5 text-[#adc6ff]" />
              <div>
                <h3 className="text-base font-bold text-white">Health & Assessment (Protected Section)</h3>
                <p className="text-xs text-white/50">Private medical & biomechanical screening kept separate from public leaderboards.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <strong className="text-white font-bold block">Protected Health Data</strong>
                <p className="text-white/60">
                  Medical history, cardiac resting rates, and orthopedic assessments are isolated and never broadcasted to team boards.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <strong className="text-white font-bold block">Consent & Safety Controls</strong>
                <p className="text-white/60">
                  You retain complete ownership over private baseline logs. Ojas utilizes data strictly for personal adaptive load calibration.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50">
              <strong>Medical Disclaimer:</strong> Ojas does not provide medical clearance or diagnose conditions. If in doubt, seek qualified clinical evaluation.
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
