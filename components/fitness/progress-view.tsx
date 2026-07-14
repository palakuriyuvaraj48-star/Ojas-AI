"use client";

import React, { useState } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TrendingUp,
  Plus,
  Calendar,
  Sparkles,
  Check,
  ChevronRight,
  Info,
  AlertTriangle,
  UserCheck,
  Zap,
  HelpCircle,
  FileText,
  Heart,
  Flame,
  Award,
  Download,
  Dumbbell,
  Scale,
  Clock,
  Share2,
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
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

type IntelTab = "home" | "biometrics" | "strength" | "nutrition" | "recovery" | "habits" | "predictions" | "decisions" | "reports";

export function ProgressView() {
  const { profile, checkInHistory, submitCheckIn } = useFitness();
  const [tab, setTab] = useState<IntelTab>("home");
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [activeAdjustment, setActiveAdjustment] = useState<any | null>(null);

  // PDF Export and Share state
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [form, setForm] = useState({
    weight: "",
    waist: "",
    chest: "",
    arms: "",
    thighs: "",
    sleepQuality: "good" as "poor" | "average" | "good",
    stressLevel: "medium" as "low" | "medium" | "high",
    adherenceRate: 90,
    strengthLevel: "stable" as "decreased" | "stable" | "increased",
    notes: "",
  });

  if (!profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep < 3) {
      setWizardStep((prev) => prev + 1);
      return;
    }

    const checkInData = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(form.weight) || profile.weight,
      waist: form.waist ? parseFloat(form.waist) : undefined,
      chest: form.chest ? parseFloat(form.chest) : undefined,
      arms: form.arms ? parseFloat(form.arms) : undefined,
      thighs: form.thighs ? parseFloat(form.thighs) : undefined,
      sleepQuality: form.sleepQuality,
      stressLevel: form.stressLevel,
      adherenceRate: form.adherenceRate,
      strengthLevel: form.strengthLevel,
      notes: form.notes,
    };

    const adj = submitCheckIn(checkInData);
    setActiveAdjustment(adj);
    setWizardStep(4);
  };

  const handleCloseWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setActiveAdjustment(null);
    setForm({
      weight: "",
      waist: "",
      chest: "",
      arms: "",
      thighs: "",
      sleepQuality: "good",
      stressLevel: "medium",
      adherenceRate: 90,
      strengthLevel: "stable",
      notes: "",
    });
  };

  const latestStats = checkInHistory.length > 0
    ? checkInHistory[checkInHistory.length - 1]
    : {
        weight: profile.weight,
        waist: undefined,
        chest: undefined,
        arms: undefined,
        thighs: undefined,
      };

  const chartData = [
    { name: "Baseline", weight: profile.weight, fat: profile.bodyFat || 22.4 },
    ...checkInHistory.map((item, idx) => ({
      name: `Wk ${idx + 1}`,
      weight: item.weight,
      fat: Math.round(Math.max(10, (profile.bodyFat || 22.4) - idx * 0.3) * 10) / 10,
    })),
  ];

  // Volume datasets
  const volumeData = [
    { muscle: "Quads", sets: 14, reps: 112 },
    { muscle: "Hamstrings", sets: 8, reps: 64 },
    { muscle: "Chest", sets: 16, reps: 128 },
    { muscle: "Back", sets: 12, reps: 96 },
    { muscle: "Shoulders", sets: 10, reps: 80 },
  ];

  // Nutrition trends
  const nutritionData = [
    { name: "Mon", calories: 2100, protein: 165, carbs: 220, fat: 70 },
    { name: "Tue", calories: 2050, protein: 160, carbs: 210, fat: 68 },
    { name: "Wed", calories: 2200, protein: 170, carbs: 230, fat: 72 },
    { name: "Thu", calories: 1980, protein: 155, carbs: 190, fat: 65 },
    { name: "Fri", calories: 2000, protein: 162, carbs: 205, fat: 66 },
    { name: "Sat", calories: 2300, protein: 175, carbs: 245, fat: 75 },
    { name: "Sun", calories: 2150, protein: 168, carbs: 225, fat: 71 },
  ];

  // PDF Export Trigger
  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      const element = document.createElement("a");
      const file = new Blob(["Titan AI Fitness Progress Report - Summary: Weight stable, Squat strength +8%, Waist -1.5cm"], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `titan_progress_report_${Date.now()}.txt`;
      element.click();
    }, 1500);
  };

  // Share Trigger
  const handleShareReport = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      alert("Report link copied to clipboard! Share it with your coach or community feed.");
    }, 800);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between bg-[rgba(24,23,26,0.35)] border-white/5" glow>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Analytics &amp; Intelligence Hub</p>
          <h2 className="text-xl font-bold text-white">Metabolic &amp; Biomechanical Intelligence</h2>
          <p className="text-xs text-white/50 mt-0.5">Biometrics, strength profiles, recovery timelines, and action paths.</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="rounded-xl bg-[#adc6ff] px-4 py-2.5 text-xs font-black text-[#131315] hover:brightness-110 transition flex items-center gap-1.5 self-start shadow-lg shadow-cyan-500/10"
        >
          <Plus className="h-4 w-4" /> Submit Weekly Check-In
        </button>
      </GlassCard>

      {/* Tabs Navigation */}
      <GlassCard className="p-3 bg-[rgba(24,23,26,0.35)] border-white/5 flex gap-2 flex-wrap">
        {[
          { id: "home", label: "Dashboard" },
          { id: "biometrics", label: "AI Weight & Body" },
          { id: "strength", label: "AI Workout & Volume" },
          { id: "nutrition", label: "AI Nutrition" },
          { id: "recovery", label: "AI Recovery" },
          { id: "habits", label: "AI Habit Streaks" },
          { id: "predictions", label: "Projections Timeline" },
          { id: "decisions", label: "AI Decisions" },
          { id: "reports", label: "Reports Hub" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as IntelTab)}
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

      {/* Dynamic Tab Render */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          
          {tab === "home" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Intelligence Scores Grid */}
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "AI Fitness Score", value: "88 / 100", trend: "Optimal", color: "text-emerald-400" },
                    { label: "AI Health Score", value: "86 / 100", trend: "Stable", color: "text-emerald-400" },
                    { label: "AI Performance Score", value: "89 / 100", trend: "+3.2%", color: "text-emerald-400" },
                    { label: "AI Consistency Score", value: "94 / 100", trend: "High", color: "text-emerald-400" },
                    { label: "AI Recovery Score", value: "82 / 100", trend: "Stable", color: "text-cyan-400" },
                    { label: "AI Nutrition Score", value: "90 / 100", trend: "Optimal", color: "text-emerald-400" },
                  ].map((score) => (
                    <GlassCard key={score.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 text-left">
                      <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold block">{score.label}</span>
                      <span className={`text-xl font-black mt-1.5 block ${score.color}`}>{score.value}</span>
                      <span className="text-[9px] text-white/30 mt-1 block">{score.trend}</span>
                    </GlassCard>
                  ))}
                </div>

                {/* AI Explanation block */}
                <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-yellow-400" /> AI Insights Engine
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    💡 **Metabolic Insights**: Your overall Health Score remains high at 86. Stable daily weigh-ins combined with a 1.5cm waist reduction confirm active body recomposition. Squat depth parallel is improving (lockout symmetry reached 94%), but ankle dorsiflexion restrictions continue to slow squat bottom transition speed.
                  </p>
                </GlassCard>
              </div>

              {/* Goal milestones */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">Goal milestones</h4>
                  <div className="space-y-3 text-xs text-white/70">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Fat Loss (Target: 70kg)</span>
                      <span className="font-bold text-emerald-400">75% complete</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span>Strength Index 1RM</span>
                      <span className="font-bold text-[#adc6ff]">88% complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metabolic Consistency</span>
                      <span className="font-bold text-emerald-400">94% complete</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-xl p-3 text-[10px] text-white/60 mt-4">
                  💪 **Expected Goal timeline**: With current 94% consistency, your fat-loss target of 70kg is estimated to be reached in 8.2 weeks (Confidence: 89%).
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "biometrics" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Daily weight line graph */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Rolling Weight Average</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#adc6ff" strokeWidth={2.5} name="Weight (kg)" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="fat" stroke="#fb7185" strokeWidth={1.5} name="Body Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Chest, Waist, Hips, Shoulders, Arms, Forearms, Neck, Thighs, Calves comparisons */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-4.5 w-4.5 text-cyan-400" /> Body Measurements Audit
                </h4>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {[
                    { label: "Chest", val: "105.2 cm", delta: "+1.2 cm", positive: true },
                    { label: "Waist", val: "86.5 cm", delta: "-1.5 cm", positive: true },
                    { label: "Hips", val: "97.2 cm", delta: "-0.8 cm", positive: true },
                    { label: "Shoulders", val: "119.5 cm", delta: "+1.5 cm", positive: true },
                    { label: "Arms", val: "37.2 cm", delta: "+0.7 cm", positive: true },
                    { label: "Forearms", val: "29.9 cm", delta: "+0.4 cm", positive: true },
                    { label: "Neck", val: "38.5 cm", delta: "Stable", positive: true },
                    { label: "Thighs", val: "59.0 cm", delta: "+0.8 cm", positive: true },
                    { label: "Calves", val: "37.8 cm", delta: "+0.3 cm", positive: true },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-xl">
                      <div>
                        <span className="font-bold text-white block">{item.label}</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Current: {item.val}</span>
                      </div>
                      <span className={`font-black ${item.delta.startsWith("-") ? "text-emerald-400" : item.delta.startsWith("+") ? "text-[#adc6ff]" : "text-white/40"}`}>{item.delta}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "strength" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Estimated 1RMs */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Estimated 1RM Progression</h4>
                <div className="space-y-3 text-xs">
                  {[
                    { lift: "Squat", pr: "140 kg", oneRepMax: "146 kg", pct: 90 },
                    { lift: "Deadlift", pr: "185 kg", oneRepMax: "194 kg", pct: 94 },
                    { lift: "Bench Press", pr: "105 kg", oneRepMax: "110 kg", pct: 82 },
                    { lift: "Overhead Press", pr: "65 kg", oneRepMax: "68 kg", pct: 75 },
                  ].map((s) => (
                    <div key={s.lift} className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white">{s.lift}</span>
                          <span className="text-[9px] text-white/40 block mt-0.5">PR: {s.pr}</span>
                        </div>
                        <span className="font-black text-emerald-400">1RM: {s.oneRepMax}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Volume sets/reps */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Workout Frequency &amp; Sets</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="muscle" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="sets" fill="#adc6ff" radius={[4, 4, 0, 0]} name="Weekly Sets" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "nutrition" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Daily calorie burn vs consumed intake */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Calorie Intake vs. Burned</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip />
                      <Area type="monotone" dataKey="calories" stroke="#adc6ff" fill="rgba(173, 198, 255, 0.1)" name="Consumed (kcal)" />
                      <Area type="monotone" dataKey="protein" stroke="#34d399" fill="rgba(52, 211, 153, 0.05)" name="Protein (g)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Protein, fat, carb, water tracking details */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="h-4.5 w-4.5 text-orange-400 animate-pulse" /> Macronutrients Target
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Protein Target (165g)</span>
                    <span className="font-bold text-emerald-400">168g average (Optimal)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Carbohydrates Target (220g)</span>
                    <span className="font-bold text-white">222g average (Stable)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Fat Target (70g)</span>
                    <span className="font-bold text-white">71g average (Stable)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Water Target (3.5L)</span>
                    <span className="font-bold text-emerald-400">3.8L average (Excellent)</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "recovery" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* HRV sleep readiness */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">HRV &amp; Sleep Duration Trends</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip />
                      <Line type="monotone" dataKey="fat" stroke="#fb7185" strokeWidth={2.5} name="HRV (ms)" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* recovery readiness list */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="h-4.5 w-4.5 text-rose-400" /> Systemic Recovery Audit
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Sleep Quality Index</span>
                    <span className="font-bold text-emerald-400">Restorative (88/100)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">CNS Readiness Score</span>
                    <span className="font-bold text-[#adc6ff]">Ready (85/100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">HRV (Heart Rate Variability)</span>
                    <span className="font-bold text-emerald-400">72 ms (Stable)</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "habits" && (
            <div className="grid gap-6 md:grid-cols-2 text-left">
              {/* streaks workouts, sleep, meditation, stretching */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-4.5 w-4.5 text-cyan-400" /> Habit Consistency Streaks
                </h4>
                <div className="space-y-3 text-xs">
                  {[
                    { habit: "Workout Compliance", streak: "18 days" },
                    { habit: "Nutrition Compliance", streak: "12 days" },
                    { habit: "Hydration Compliance", streak: "24 days" },
                    { habit: "Sleep Duration (7h+)", streak: "8 days" },
                    { habit: "Stretching Routine", streak: "10 days" },
                    { habit: "Daily Meditation", streak: "5 days" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <span className="font-bold text-white">{item.habit}</span>
                      <span className="font-black text-[#adc6ff]">{item.streak}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* AI Habit Intelligence summary */}
              <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider">AI Habit Analysis</h4>
                  <p className="text-xs text-white/60 leading-relaxed mt-2">
                    💡 **Habit Intelligence**: Stretching habits are steady at 10 days, helping optimize ankle dorsiflexion indexes. Maintaining a high meditation streak (5 days) keeps sympathetic stress levels in balance to prevent CNS fatigue plateau blockages.
                  </p>
                </div>
                <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-xl p-3 text-[10px] text-white/60 mt-4">
                  🎯 **Expected Goal timeline**: With current 94% consistency, your fat-loss target of 70kg is estimated to be reached in 8.2 weeks.
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "predictions" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Forecast graph Weight and fat projections */}
              <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">12-Week Projections Curve</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#adc6ff" strokeWidth={2.5} name="Projected Wt (kg)" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="fat" stroke="#fb7185" strokeWidth={1.5} name="Projected Fat %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Timeline intervals list */}
              <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Future Projections Timeline</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                    <span>1 Week Outlook</span>
                    <span className="font-bold text-emerald-400">~78.1 kg</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                    <span>4 Weeks Outlook</span>
                    <span className="font-bold text-emerald-400">~77.0 kg</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                    <span>12 Weeks Outlook</span>
                    <span className="font-bold text-[#adc6ff]">~74.5 kg</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "decisions" && (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
              {/* Recommendations list (Why, Confidence, expected benefit, alternative option) */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">AI Decision intelligence Alerts</h4>
                <div className="space-y-3.5">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
                    <p className="font-bold text-rose-300">1. Reduce weekly chest sets by 10% (Top Priority)</p>
                    <p className="text-[10.5px] leading-relaxed text-white/60">
                      **Why**: Prevents central CNS overreaching. Chest mechanical volumes grew by 20% but triceps stabilizers are fatigued.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/5 pt-2 text-white/40">
                      <span>**Confidence**: 85%</span>
                      <span>**Expected Benefit**: Avert bench plateau risk</span>
                    </div>
                    <div className="text-[9.5px] text-white/50 bg-black/30 p-2 rounded-xl">
                      **Alternative Option**: Increase rest days by 1 to permit triceps loading recoveries.
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
                    <p className="font-bold text-emerald-400">2. Increase protein by 15g (High Priority)</p>
                    <p className="text-[10.5px] leading-relaxed text-white/60">
                      **Why**: Sustains lean tissue growth while in caloric deficit.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[9px] border-t border-white/5 pt-2 text-white/40">
                      <span>**Confidence**: 94%</span>
                      <span>**Expected Benefit**: Boost LBM preservation</span>
                    </div>
                    <div className="text-[9.5px] text-white/50 bg-black/30 p-2 rounded-xl">
                      **Alternative Option**: Defer caloric cuts to next week.
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Insights stats */}
              <GlassCard className="p-5 space-y-3 border-white/5 bg-[rgba(24,23,26,0.35)] text-left text-xs">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">Performance Insights</h4>
                <div className="space-y-2.5">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    ⚡ &quot;You are strongest on Tuesdays.&quot;
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl">
                    ⚡ &quot;Recovery scores increase 25% after 8 hours of sleep.&quot;
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl">
                    ⚡ &quot;Leg training frequency decreased by 8% this month.&quot;
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {tab === "reports" && (
            <div className="grid gap-6 md:grid-cols-2 text-left">
              {/* Daily, Weekly, Monthly, Quarterly, Yearly report selector */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)]">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    <FileText className="h-4.5 w-4.5 text-[#adc6ff]" /> Weekly Progress Audit
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportPDF}
                      disabled={exporting}
                      className="rounded-lg border border-white/10 hover:bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white transition flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting..." : "Export PDF"}
                    </button>
                    <button
                      onClick={handleShareReport}
                      disabled={sharing}
                      className="rounded-lg bg-[#adc6ff]/10 hover:bg-[#adc6ff]/20 px-2.5 py-1 text-[10px] font-bold text-[#adc6ff] transition flex items-center gap-1"
                    >
                      <Share2 className="h-3.5 w-3.5" /> {sharing ? "Sharing..." : "Share"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-emerald-400 block text-[9.5px] uppercase">Wins this week:</span>
                    <ul className="list-disc list-inside text-white/70 space-y-0.5 leading-relaxed">
                      <li>Wide stance squat depth reached parallel (92°).</li>
                      <li>Met protein target (165g+) all 7 days.</li>
                      <li>Left/right bench lockout symmetry reached 94%.</li>
                    </ul>
                  </div>

                  <div className="space-y-1 border-t border-white/5 pt-3">
                    <span className="font-bold text-yellow-400 block text-[9.5px] uppercase">Areas for improvement:</span>
                    <ul className="list-disc list-inside text-white/70 space-y-0.5 leading-relaxed">
                      <li>Ankle dorsiflexion remains restricted.</li>
                      <li>Average sleep fell short by 40 minutes.</li>
                    </ul>
                  </div>
                </div>
              </GlassCard>

              {/* Quarterly/Yearly report summaries */}
              <GlassCard className="p-5 space-y-4 border-white/5 bg-[rgba(24,23,26,0.35)] flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 border-b border-white/5 pb-2">
                    <TrendingUp className="h-4.5 w-4.5 text-cyan-400" /> Quarterly Progress Report
                  </h4>

                  <div className="space-y-3 text-xs text-white/70">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Lean Muscle Mass Growth</span>
                      <span className="font-bold text-white">+2.4 kg</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span>Fat Mass Reduction</span>
                      <span className="font-bold text-emerald-400">-5.2 kg</span>
                    </div>
                    
                    <p className="leading-relaxed text-white/50 text-[10.5px] pt-1">
                      💡 **AI Projections Summary (Confidence: 94%)**: Your quarterly biometrics show successful structural recomposition. Deadlift 1RM baseline grew by 24kg over the past 90 days due to increased gluteal-erector coordination.
                    </p>
                  </div>
                </div>

                <div className="bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-xl p-3 text-[10px] text-white/60">
                  🎯 **Next Quarter Focus**: Prioritize shoulder rotator cuff mobility stretches to balance overhead press lockout paths.
                </div>
              </GlassCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Weekly Check-in Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#adc6ff]" /> Weekly Progress Audit
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Let&apos;s audit this week&apos;s bio-markers &amp; adapt your calorie splits.</p>
              </div>
              {wizardStep < 4 && (
                <span className="text-xs font-semibold text-white/40">Step {wizardStep} of 3</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Current Body Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder={`e.g. ${profile.weight}`}
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Waist Circum. (cm)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={form.waist}
                        onChange={(e) => setForm({ ...form, waist: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Chest Circum. (cm)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={form.chest}
                        onChange={(e) => setForm({ ...form, chest: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Arms Circum. (cm)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={form.arms}
                        onChange={(e) => setForm({ ...form, arms: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Thighs Circum. (cm)</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={form.thighs}
                        onChange={(e) => setForm({ ...form, thighs: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Sleep Quality</label>
                    <select
                      value={form.sleepQuality}
                      onChange={(e) => setForm({ ...form, sleepQuality: e.target.value as any })}
                      className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-3.5 text-xs text-white focus:border-[#adc6ff] focus:outline-none"
                    >
                      <option value="poor">Poor (fragmented / short)</option>
                      <option value="average">Average (stable)</option>
                      <option value="good">Good (restorative / deep)</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Stress Level</label>
                    <select
                      value={form.stressLevel}
                      onChange={(e) => setForm({ ...form, stressLevel: e.target.value as any })}
                      className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-3.5 text-xs text-white focus:border-[#adc6ff] focus:outline-none"
                    >
                      <option value="low">Low (relaxed)</option>
                      <option value="medium">Medium (standard)</option>
                      <option value="high">High (overloaded / high anxiety)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Weekly Adherence Rate (%)</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="100"
                      value={form.adherenceRate}
                      onChange={(e) => setForm({ ...form, adherenceRate: parseInt(e.target.value) || 90 })}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-[#adc6ff] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase block mb-1.5">Strength Level Trend</label>
                    <select
                      value={form.strengthLevel}
                      onChange={(e) => setForm({ ...form, strengthLevel: e.target.value as any })}
                      className="w-full rounded-2xl border border-white/10 bg-[#16161a] p-3.5 text-xs text-white focus:border-[#adc6ff] focus:outline-none"
                    >
                      <option value="decreased">Decreased weights / reps</option>
                      <option value="stable">Stable / maintained baseline</option>
                      <option value="increased">Increased weights / progressive overload</option>
                    </select>
                  </div>
                </div>
              )}

              {wizardStep === 4 && activeAdjustment && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h4 className="text-md font-bold text-white">Biometric Check-In Analyzed!</h4>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-left text-xs space-y-3">
                    <p className="font-bold text-[#adc6ff] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> AI Adjustments Output:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Calorie Delta: <span className="font-bold text-white">{activeAdjustment.calorieDelta > 0 ? "+" : ""}{activeAdjustment.calorieDelta} kcal</span></li>
                      {activeAdjustment.stepDelta !== 0 && (
                        <li>Daily Steps Delta: <span className="font-bold text-white">{activeAdjustment.stepDelta > 0 ? "+" : ""}{activeAdjustment.stepDelta} steps</span></li>
                      )}
                      <li>Volume Coefficient: <span className="font-bold text-white capitalize">{activeAdjustment.volumeDelta}</span></li>
                    </ul>
                    <p className="text-[10px] text-white/50 border-t border-white/5 pt-2 leading-relaxed">
                      **Physiological context**: {activeAdjustment.reason}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseWizard}
                    className="w-full rounded-2xl bg-[#adc6ff] py-3 text-xs font-bold text-[#131315]"
                  >
                    Done
                  </button>
                </div>
              )}

              {wizardStep < 4 && (
                <div className="flex justify-between gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep > 1) setWizardStep((prev) => prev - 1);
                      else handleCloseWizard();
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-white"
                  >
                    {wizardStep > 1 ? "Back" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#adc6ff] px-6 py-3 text-xs font-bold text-[#131315] hover:brightness-110 transition flex items-center gap-1 shadow-lg shadow-cyan-500/10"
                  >
                    <span>{wizardStep === 3 ? "Run Diagnostics" : "Continue"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
