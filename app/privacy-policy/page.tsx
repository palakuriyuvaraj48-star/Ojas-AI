"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-bold text-cyan-300 mb-6">
            <ShieldCheck className="h-4 w-4" />
            PRIVACY & DATA PROTECTION
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Your Data, Your Control
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            OJAS is built on a principle of privacy-first fitness. Your health data is sensitive. We treat it that way.
          </p>
        </motion.div>

        {/* Privacy Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-2">Privacy-First Design</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Your biometric and workout data stays on-device. No cloud upload of video. No unauthorized data sharing.
                  Built under DPDP Act 2023 principles.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* What We Collect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-white/10 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#adc6ff]" />
              What We Collect
            </h2>
            <div className="space-y-3">
              <ListItem text="Workout data (exercises, reps, form scores)" />
              <ListItem text="Sleep data (duration, quality, HRV)" />
              <ListItem text="Nutrition logs (meals, calories, macros)" />
              <ListItem text="Optional: Wearable data (if connected)" />
              <ListItem text="Sport data (performance metrics, gaps)" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Where It's Stored */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-white/10 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              Where It&apos;s Stored
            </h2>
            <div className="space-y-3 text-xs text-white/70">
              <p><strong className="text-white">On-Device:</strong> Form coaching video stays on your phone. No upload.</p>
              <p><strong className="text-white">Local Storage:</strong> Nutrition, workouts stored locally.</p>
              <p><strong className="text-white">Optional Cloud:</strong> If you enable sync, uses encrypted connection.</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-white/10 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-400" />
              Your Rights Under DPDP 2023
            </h2>
            <div className="space-y-3">
              <ListItem text="Right to access your data" />
              <ListItem text="Right to correct inaccurate data" />
              <ListItem text="Right to delete your data" />
              <ListItem text="Right to data portability" />
              <ListItem text="No unauthorized sharing" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Medical Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-2">Medical / Health Considerations</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  OJAS is a fitness tool, not medical advice. If you have a medical condition, consult your doctor.
                  OJAS can support, not replace, medical guidance.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 shadow-xl shadow-cyan-400/20"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
      <p className="text-xs text-white/70">{text}</p>
    </div>
  );
}
