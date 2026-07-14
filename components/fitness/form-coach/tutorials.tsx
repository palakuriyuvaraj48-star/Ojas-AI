"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PlayCircle, AlertTriangle, Lightbulb, CheckCircle2, ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EXERCISES, type ExerciseDefinition } from "@/lib/vision";

export function Tutorials({ featuredId }: { featuredId?: string }) {
  const [open, setOpen] = useState<string | null>(featuredId ?? EXERCISES[0].id);
  const ordered = featuredId ? [EXERCISES.find((e) => e.id === featuredId)!, ...EXERCISES.filter((e) => e.id !== featuredId)] : EXERCISES;

  return (
    <div className="space-y-3">
      <GlassCard className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-[#adc6ff]" />
        <h3 className="font-bold text-white">Exercise Tutorials</h3>
        <span className="text-xs text-white/40">Demo · cues · common mistakes</span>
      </GlassCard>
      {ordered.map((ex) => (
        <TutorialCard key={ex.id} ex={ex} open={open === ex.id} onToggle={() => setOpen(open === ex.id ? null : ex.id)} />
      ))}
    </div>
  );
}

function TutorialCard({ ex, open, onToggle }: { ex: ExerciseDefinition; open: boolean; onToggle: () => void }) {
  const t = ex.tutorial;
  return (
    <GlassCard className="overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <p className="font-semibold text-white">{ex.name}</p>
          <p className="text-[10px] text-white/40">{ex.equipment} · {ex.group}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
              <video src={t.demoVideoUrl} controls className="aspect-video w-full rounded-xl border border-white/10 bg-black" />
              <p className="flex items-start gap-2 text-xs text-white/70"><PlayCircle className="mt-0.5 h-4 w-4 text-[#adc6ff]" /><span><b className="text-white">Setup:</b> {t.setup}</span></p>
              <Section icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />} title="How to" items={t.instructions} />
              <Section icon={<AlertTriangle className="h-4 w-4 text-rose-300" />} title="Common mistakes" items={t.commonMistakes} tone="rose" />
              <Section icon={<Lightbulb className="h-4 w-4 text-amber-300" />} title="Coaching cues" items={t.coachingCues} tone="amber" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function Section({ icon, title, items, tone }: { icon: React.ReactNode; title: string; items: string[]; tone?: "rose" | "amber" }) {
  const color = tone === "rose" ? "text-rose-200" : tone === "amber" ? "text-amber-200" : "text-emerald-200";
  return (
    <div>
      <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase ${color}`}>{icon}{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((it, i) => <li key={i} className="text-xs text-white/70">• {it}</li>)}
      </ul>
    </div>
  );
}
