"use client";

import React, { useState } from "react";
import { useCoachContext, saveMemory } from "@/lib/coach/storage";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Brain,
  Save,
  Dumbbell,
  UtensilsCrossed,
  Calendar,
  Compass,
  Trophy,
  Award,
  Zap,
  Info,
} from "lucide-react";

export function AICoachMemory() {
  const { memory } = useCoachContext();
  const [favoriteWorkouts, setFavoriteWorkouts] = useState(memory?.favoriteWorkouts?.join(", ") || "");
  const [mealPreferences, setMealPreferences] = useState(memory?.mealPreferences?.join(", ") || "");
  const [gymSchedule, setGymSchedule] = useState(memory?.gymSchedule || "");
  const [travelHabits, setTravelHabits] = useState(memory?.travelHabits || "");
  const [equipment, setEquipment] = useState(memory?.equipment?.join(", ") || "");
  const [goals, setGoals] = useState(memory?.goals?.join(", ") || "");
  const [motivationStyle, setMotivationStyle] = useState(memory?.motivationStyle || "");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    const updated = {
      favoriteWorkouts: favoriteWorkouts.split(",").map(s => s.trim()).filter(Boolean),
      mealPreferences: mealPreferences.split(",").map(s => s.trim()).filter(Boolean),
      gymSchedule: gymSchedule.trim(),
      travelHabits: travelHabits.trim(),
      equipment: equipment.split(",").map(s => s.trim()).filter(Boolean),
      goals: goals.split(",").map(s => s.trim()).filter(Boolean),
      motivationStyle: motivationStyle.trim(),
      notes: memory?.notes || [],
    };
    saveMemory(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <GlassCard className="p-6 max-w-2xl mx-auto border-white/5 bg-[rgba(24,23,26,0.35)] space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">AI Memory Vault</h3>
            <p className="text-[10.5px] text-white/40 leading-none">Extracted preferences and habits remembered by the AI</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#adc6ff] hover:brightness-110 text-[#131315] text-xs font-black px-4 py-2.5 rounded-xl transition"
        >
          <Save className="h-4 w-4" /> Save memory
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 text-xs font-semibold text-center animate-fade-in">
          ✅ Memory Vault updated successfully! Syncing preferences in downstream advice.
        </div>
      )}

      {/* Forms Grid */}
      <div className="grid gap-4 sm:grid-cols-2 text-xs text-left">
        
        {/* Favorite workouts */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Dumbbell className="h-4 w-4 text-cyan-400" /> Favorite Workouts
          </label>
          <input
            type="text"
            value={favoriteWorkouts}
            onChange={(e) => setFavoriteWorkouts(e.target.value)}
            placeholder="e.g. Squat, Bench, Yoga (comma separated)"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Meal Preferences */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <UtensilsCrossed className="h-4 w-4 text-purple-400" /> Meal Preferences
          </label>
          <input
            type="text"
            value={mealPreferences}
            onChange={(e) => setMealPreferences(e.target.value)}
            placeholder="e.g. Vegetarian, High-protein, Indian"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Gym Schedule */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-orange-400" /> Gym Schedule
          </label>
          <input
            type="text"
            value={gymSchedule}
            onChange={(e) => setGymSchedule(e.target.value)}
            placeholder="e.g. Monday/Wednesday/Friday 7:00 AM"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Travel habits */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-yellow-400" /> Travel Habits
          </label>
          <input
            type="text"
            value={travelHabits}
            onChange={(e) => setTravelHabits(e.target.value)}
            placeholder="e.g. Hotel workouts, prefers bodyweight circuit"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Available Equipment */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-400" /> Equipment Owned / Access
          </label>
          <input
            type="text"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="e.g. Dumbbell, Barbell, Cable (comma separated)"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Custom Goals */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-yellow-500" /> Specific Goals
          </label>
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Improve squat depth, 10k steps"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

        {/* Motivation Style */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[11px] font-bold text-white/60 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-400" /> Motivation Style
          </label>
          <input
            type="text"
            value={motivationStyle}
            onChange={(e) => setMotivationStyle(e.target.value)}
            placeholder="e.g. Supportive and encouraging, or tough love accountability"
            className="w-full bg-black/20 border border-white/5 rounded-xl px-3.5 py-2.5 text-white placeholder-white/20 focus:border-[#adc6ff] focus:outline-none transition"
          />
        </div>

      </div>

      <div className="border-t border-white/5 pt-4 text-[10px] text-white/40 flex items-start gap-1.5 leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-white/30" />
        <p>
          The memory system listens to your queries and automatically updates its logs. (For example, saying &quot;I love cycling&quot; will append it to Favorite Workouts). You can audit or adjust these memory blocks here at any time.
        </p>
      </div>

    </GlassCard>
  );
}
