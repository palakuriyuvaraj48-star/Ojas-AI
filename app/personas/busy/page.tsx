"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function BusyPersona() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 mb-6">💼 BUILT FOR BUSY PROFESSIONALS</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">🏃 OJAS for Busy Professionals</h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">Some days 60 min, some days 15 min. Most apps fail. We adapt every single day.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
            <h2 className="text-xl font-bold text-white mb-4">What OJAS Does</h2>
            <div className="space-y-3">
              <SolutionItem text="Every workout has a 15-min version — no excuses" />
              <SolutionItem text="Adapts to your actual calendar, not an idealized one" />
              <SolutionItem text="Travel mode: hotel room workouts, no equipment needed" />
              <SolutionItem text="Stress-aware: high work pressure = lighter training" />
              <SolutionItem text="Consistency tracking: celebrates showing up, not perfection" />
            </div>
          </GlassCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20">Fit Fitness Into Your Life <ArrowRight className="h-4 w-4" /></Link>
        </motion.div>
      </div>
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
