"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import {
  GraduationCap,
  UtensilsCrossed,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Dumbbell,
  MoonStar,
} from "lucide-react";

export default function StudentPersona() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 mb-6">
            <GraduationCap className="h-4 w-4" />
            BUILT FOR STUDENTS
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            👨‍🎓 OJAS for Students
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            ₹100 budget. Exam stress. Hostel living. OJAS is built for you.
          </p>
        </motion.div>

        {/* Your Reality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-white/10 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Your Reality
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RealityCard icon={<DollarSign className="h-5 w-5 text-red-400" />} label="Budget" value="₹100/day" desc="Hostel mess + occasional treats" />
              <RealityCard icon={<Clock className="h-5 w-5 text-amber-400" />} label="Time" value="20-40 min" desc="Between classes and assignments" />
              <RealityCard icon={<BookOpen className="h-5 w-5 text-blue-400" />} label="Stress" value="Exam cycles" desc="Weeks of high stress, then relief" />
              <RealityCard icon={<MoonStar className="h-5 w-5 text-purple-400" />} label="Sleep" value="5-7 hours" desc="Irregular during exams" />
            </div>
          </GlassCard>
        </motion.div>

        {/* What Generic Apps Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              What Generic Apps Do
            </h2>
            <div className="space-y-3">
              <ProblemItem text="₹500 meal plans — impossible on hostel budget" />
              <ProblemItem text="60-min gym workouts — you don't have time during exams" />
              <ProblemItem text="Fixed 12-week plans — life doesn't wait for your fitness schedule" />
              <ProblemItem text="No exam mode — they expect you to choose between fitness and grades" />
              <ProblemItem text="Generic exercises — no cricket/badminton/football specific training" />
            </div>
          </GlassCard>
        </motion.div>

        {/* What OJAS Does */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              What OJAS Does
            </h2>
            <div className="space-y-3">
              <SolutionItem text="₹100 meal plans using hostel mess + local options" />
              <SolutionItem text="15-45 min adaptive workouts — fits your schedule" />
              <SolutionItem text="Exam mode automatically reduces load and prioritizes recovery" />
              <SolutionItem text="Sport-specific training for cricket, football, badminton" />
              <SolutionItem text="Real-time form coaching so you don't get injured" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Amal Case Study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20">
            <h2 className="text-xl font-bold text-white mb-4">Meet Amal (Your Real Scenario)</h2>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">Without OJAS</h3>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2 text-xs text-white/70">
                  <p>Day 1: Gets generic plan (60 min, gym, ₹500)</p>
                  <p>Day 2: Exams start → No time</p>
                  <p>Day 3: Misses workout → Feels guilty</p>
                  <p>Day 4: Tries to catch up → Overtrained</p>
                  <p>Week 2: Injured from bad form + fatigue</p>
                  <p>Week 4: Quits fitness</p>
                  <p className="text-red-300 font-bold mt-2">Consistency: 20%</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">With OJAS</h3>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs text-white/70">
                  <p>Day 1: Gets adapted plan (30 min, hostel, ₹100)</p>
                  <p>Day 2: Exams → OJAS adapts to 15 min mobility</p>
                  <p>Day 3: Sleep drops → Recovery focus</p>
                  <p>Day 4: Match tomorrow → Cricket prep shift</p>
                  <p>Week 2: Form coaching prevents injury</p>
                  <p>Week 4: Still consistent, played well in match</p>
                  <p className="text-emerald-300 font-bold mt-2">Consistency: 85%</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-sm font-bold text-cyan-300">RESULT:</p>
              <p className="text-xs text-white/70 mt-1">
                Without OJAS: Quit during exams. With OJAS: Stayed fit through exams AND played well in match.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
          >
            Get Started Like Amal <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function RealityCard({ icon, label, value, desc }: { icon: React.ReactNode; label: string; value: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
      <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] text-white/50">{desc}</p>
    </div>
  );
}

function ProblemItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
      <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
      <p className="text-xs text-white/70">{text}</p>
    </div>
  );
}

function SolutionItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
      <p className="text-xs text-white/70">{text}</p>
    </div>
  );
}
