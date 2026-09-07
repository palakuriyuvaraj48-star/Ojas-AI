"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShieldCheck,
  Activity,
  HeartPulse,
  MoonStar,
  BrainCircuit,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

const truths = [
  {
    num: 1,
    title: "Your life is not consistent. Your plan shouldn't be.",
    problem: "Generic apps say: Follow this fixed plan for 12 weeks",
    reality: "You won't have 60 min 3x/week consistently",
    ojas: "OJAS: Your plan changes with your life (exams, travel, medical issues, stress)",
  },
  {
    num: 2,
    title: "Budget is real. Most apps ignore it. We don't.",
    problem: "Generic apps assume ₹500 meals and gym access",
    reality: "Most Indians have ₹100-150/day for food and may not have gym access",
    ojas: "OJAS: Hostel meals, ₹100 budgets, bodyweight alternatives — all supported",
  },
  {
    num: 3,
    title: "Your sport matters. Training shouldn't be generic.",
    problem: "Generic apps give the same workout to everyone",
    reality: "Cricket needs different prep than football, which is different from badminton",
    ojas: "OJAS: Sport-specific gaps analyzed, cricket drills, football agility, badminton footwork",
  },
  {
    num: 4,
    title: "Bad form is an injury waiting to happen.",
    problem: "Generic apps show videos and hope you copy them",
    reality: "Most beginners have no idea their squat depth is shallow or knees are caving",
    ojas: "OJAS: Real-time computer vision form coaching catches issues before they become injuries",
  },
  {
    num: 5,
    title: "Your body gives signals. Listen to them.",
    problem: "Generic apps ignore fatigue, sleep, and recovery",
    reality: "Your body tells you when to push and when to rest — most apps don't listen",
    ojas: "OJAS: Recovery score, fatigue tracking, HRV integration — adapts to your readiness",
  },
  {
    num: 6,
    title: "Recovery is not separate from training.",
    problem: "Generic apps treat recovery as an afterthought",
    reality: "Recovery is where adaptation happens — skip it and you'll plateau or get injured",
    ojas: "OJAS: Recovery is built into every decision. Better sleep → better performance.",
  },
  {
    num: 7,
    title: "Medical conditions aren't exceptions.",
    problem: "Generic apps have no mechanism for injuries or medical constraints",
    reality: "Millions of Indians train with knee issues, back pain, asthma, diabetes",
    ojas: "OJAS: Constraints are the foundation of your plan, not exceptions to it",
  },
  {
    num: 8,
    title: "Consistency beats perfection.",
    problem: "Generic apps expect perfect adherence and fail when life happens",
    reality: "Missing a workout isn't failure — quitting because of guilt is",
    ojas: "OJAS: 15-min version exists for every 60-min workout. Showing up matters more.",
  },
  {
    num: 9,
    title: "India's fitness reality is different.",
    problem: "Most fitness apps are built for Western lifestyles and environments",
    reality: "Hostel living, joint families, climate, food, budget — all different",
    ojas: "OJAS: Built for India. Hostel mode, budget coach, multilingual, Indian foods.",
  },
  {
    num: 10,
    title: "Fitness should tell you the truth.",
    problem: "Generic apps promise 6-pack abs in 30 days",
    reality: "Sustainable fitness takes time, and apps that lie set you up to fail",
    ojas: "OJAS: No fake promises. No fantasy. Just honest adaptation to your reality.",
  },
];

export default function FitnessTruth() {
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
            <ShieldCheck className="h-4 w-4" />
            THE TRUTH PLATFORM
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            The Real Truth About Fitness
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            (That Apps Won&apos;t Tell You)
          </p>
        </motion.div>

        {/* Truths */}
        <div className="space-y-6">
          {truths.map((truth, idx) => (
            <motion.div
              key={truth.num}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-6 border-white/10 bg-slate-900/50 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 font-black text-lg">
                    {truth.num}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-white">{truth.title}</h3>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                        <p className="text-[10px] font-bold text-red-300 uppercase tracking-wider mb-1">Generic Apps Say</p>
                        <p className="text-xs text-white/70">{truth.problem}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">Reality</p>
                        <p className="text-xs text-white/70">{truth.reality}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">OJAS Does</p>
                        <p className="text-xs text-white/70">{truth.ojas}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <GlassCard className="p-8 border-cyan-400/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-950">
            <h2 className="text-3xl font-extrabold text-white mb-4">This is OJAS.</h2>
            <p className="text-lg text-white/70 mb-6">Not promises. Truth.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
            >
              Start Your Real Fitness Journey <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
