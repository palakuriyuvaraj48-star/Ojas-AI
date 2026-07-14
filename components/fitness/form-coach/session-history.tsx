"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Trophy, Activity, Clock, Layers, Video } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Badge } from "@/components/ui/design-system";
import type { CameraSessionRecord } from "@/lib/vision";

interface Props {
  sessions: CameraSessionRecord[];
  onDelete?: (id: string) => void;
}

function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 864e5);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

export function SessionHistory({ sessions, onDelete }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  if (sessions.length === 0) {
    return (
      <GlassCard className="grid place-items-center py-12 text-center">
        <History className="h-8 w-8 text-white/30" />
        <p className="mt-3 text-sm text-white/50">No sessions yet.</p>
        <p className="text-xs text-white/30">Complete a set and it will appear here.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <GlassCard key={s.id} className="space-y-3">
          <div className="flex items-center gap-4">
            <ProgressRing progress={s.formScore} size={56} strokeWidth={6} color={s.formScore >= 80 ? "#34d399" : "#facc15"} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{s.exercise}</p>
                <Badge label={ago(s.endedAt)} variant="neutral" />
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
                <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{s.reps} reps</span>
                <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{s.sets} sets</span>
                <span className="flex items-center gap-1"><Activity className="h-3 w-3" />ROM {s.avgRom}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(s.durationMs / 1000)}s</span>
                {s.hasVideo && <span className="flex items-center gap-1"><Video className="h-3 w-3" />Video</span>}
              </div>
            </div>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/70">
              {open === s.id ? "Hide" : "Details"}
            </button>
            {onDelete && (
              <button onClick={() => onDelete(s.id)} className="rounded-lg border border-rose-400/20 p-1.5 text-rose-300/70 hover:bg-rose-500/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {open === s.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-white/5 pt-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Mini label="Avg ROM" value={`${s.avgRom}`} />
                  <Mini label="Symmetry" value={`${Math.round(s.avgSymmetry * 100)}`} />
                  <Mini label="Best rep" value={`${s.bestRepScore}`} />
                </div>
                {s.notes && <p className="mt-3 text-xs text-white/60">📝 {s.notes}</p>}
                {s.feedback.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {s.feedback[0] && s.feedback[0].corrections.map((c, i) => (
                      <p key={i} className="text-xs text-[#adc6ff]">• {c}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      ))}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-2 text-center">
      <p className="text-[9px] uppercase text-white/40">{label}</p>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
