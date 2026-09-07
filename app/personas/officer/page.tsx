"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Briefcase, Clock, DollarSign, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Zap } from "lucide-react";

export default function OfficerPersona() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 mb-6">
            <Briefcase className="h-4 w-4" /> BUILT FOR OFFICERS
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">👨‍💼 OJAS for Officers</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">Desk job fatigue. Limited time. High stress. We reduce load when you need it.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
            <h2 className="text-xl font-bold text-white mb-4">What OJAS Does</h2>
            <div className="space-y-3">
              <SolutionItem text="15-20 min workouts that fit into a busy schedule" />
              <SolutionItem text="Recovery focus: desk job fatigue is real" />
              <SolutionItem text="Stress-aware: adapts when work pressure is high" />
              <SolutionItem text="Ergonomic exercises to counteract sitting" />
              <SolutionItem text="Morning energy boost vs evening wind-down modes" />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20">Start Smarter Training <ArrowRight className="h-4 w-4" /></Link>
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

function SolutionItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
      <p className="text-xs text-white/70">{text}</p>
    </div>
  );
}
