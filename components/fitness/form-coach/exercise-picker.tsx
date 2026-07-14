"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { EXERCISES, EXERCISE_GROUPS, type ExerciseDefinition } from "@/lib/vision";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

const CATEGORY_ICON: Record<string, string> = {
  squat: "🦵", press: "💪", pull: "🏋️", hinge: "🔥", lunge: "🚶", isometric: "🧘",
};

export function ExercisePicker({ selectedId, onSelect }: Props) {
  const [group, setGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const filtered = EXERCISES.filter(
    (e) => (group === "all" || e.group === group) && e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[#adc6ff]" />
          <h3 className="font-bold text-white">Exercise Library</h3>
          <span className="text-xs text-white/40">{EXERCISES.length} supported</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXERCISE_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGroup(g.id)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${group === g.id ? "bg-[#adc6ff]/20 text-[#adc6ff]" : "bg-white/5 text-white/50 hover:text-white"}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <ExerciseCard key={ex.id} ex={ex} selected={ex.id === selectedId} onSelect={() => onSelect(ex.id)} />
        ))}
      </div>
    </GlassCard>
  );
}

function ExerciseCard({ ex, selected, onSelect }: { ex: ExerciseDefinition; selected: boolean; onSelect: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? "border-[#adc6ff]/50 bg-[#adc6ff]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/30 text-lg">{CATEGORY_ICON[ex.category] ?? "🏋️"}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{ex.name}</p>
        <p className="text-[10px] text-white/40">{ex.equipment} · {ex.group}</p>
      </div>
    </motion.button>
  );
}
