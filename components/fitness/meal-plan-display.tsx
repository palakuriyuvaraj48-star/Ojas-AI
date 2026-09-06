"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  DollarSign,
  Sparkles,
  CheckCircle2,
  Apple,
  Clock,
  Flame,
  Info,
  ChevronRight,
  Zap,
  Cpu
} from "lucide-react";
import { HOSTEL_MEAL_PLANS, HostelMealPlan } from "@/data/hostel-meal-plans";

export function HostelMealPlanDisplay() {
  const [selectedBudget, setSelectedBudget] = useState<number>(100);
  const plan: HostelMealPlan = HOSTEL_MEAL_PLANS[selectedBudget] || HOSTEL_MEAL_PLANS[100];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Top Banner */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-amber-950/40 via-[#181a20] to-[#121316] relative overflow-hidden" glow>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                India-First Hostel Nutrition
              </span>
              <span className="text-white/40 text-xs">Mess &amp; Local Market Optimized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hostel Budget Meal Planner
            </h2>
            <p className="text-sm text-white/70">
              High-protein, micro-budget meal plans built with authentic Indian ingredients — zero expensive supplements required.
            </p>
          </div>

          {/* Budget Selector Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center p-1.5 rounded-2xl bg-black/40 border border-white/10">
            {[100, 150, 250].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBudget(b)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  selectedBudget === b
                    ? "bg-[#adc6ff] text-[#131315] shadow-lg shadow-blue-500/20 scale-105"
                    : "text-white/60 hover:text-white"
                }`}
              >
                ₹{b}/day
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Daily Totals Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <GlassCard className="p-3.5 border-white/10 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Daily Cost</span>
          <div className="text-xl font-extrabold text-[#adc6ff]">
            ₹{plan.dailyTotals.cost}
          </div>
          <span className="text-[10px] text-white/40">Within ₹{plan.budget} Budget</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/10 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Total Protein</span>
          <div className="text-xl font-extrabold text-emerald-400">
            {Math.round(plan.dailyTotals.protein)}g
          </div>
          <span className="text-[10px] text-white/40">Muscle Building Target</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/10 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Total Calories</span>
          <div className="text-xl font-extrabold text-amber-300">
            {plan.dailyTotals.calories} kcal
          </div>
          <span className="text-[10px] text-white/40">Energy Maintenance</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/10 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Carbohydrates</span>
          <div className="text-xl font-extrabold text-indigo-300">
            {Math.round(plan.dailyTotals.carbs)}g
          </div>
          <span className="text-[10px] text-white/40">Lecture &amp; Workout Fuel</span>
        </GlassCard>

        <GlassCard className="p-3.5 border-white/10 text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase font-bold text-white/50 block">Healthy Fats</span>
          <div className="text-xl font-extrabold text-rose-300">
            {Math.round(plan.dailyTotals.fats)}g
          </div>
          <span className="text-[10px] text-white/40">Hormonal Health</span>
        </GlassCard>
      </div>

      {/* Meals Schedule Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plan.meals.map((meal, idx) => (
          <GlassCard key={idx} className="p-5 border-white/10 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm">{meal.name}</h4>
                  <span className="text-[11px] text-white/50">{meal.time}</span>
                </div>
                <span className="rounded-lg bg-[#adc6ff]/15 text-[#adc6ff] font-bold text-xs px-2.5 py-1">
                  ₹{meal.subtotalCost}
                </span>
              </div>

              {/* Food Items List */}
              <div className="space-y-2">
                {meal.foods.map((food, fIdx) => (
                  <div key={fIdx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white block">{food.item}</span>
                      <span className="text-[10px] text-white/50">
                        {food.protein}g protein • {food.calories} cal
                      </span>
                    </div>
                    <span className="text-amber-300 font-bold text-xs shrink-0 ml-2">₹{food.cost}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[11px] text-white/70 font-semibold">
                <span>Meal Subtotal:</span>
                <span className="text-emerald-400 font-bold">{meal.subtotalProtein}g protein • {meal.subtotalCalories} kcal</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed italic">
                💡 {meal.notes}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Success Tips & Digital Twin Auto-Regulation Note */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="p-5 border-white/10 space-y-3">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Hostel Execution Tips
          </h4>
          <ul className="space-y-2 text-xs text-white/70">
            {plan.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5 border-blue-500/20 bg-blue-950/20 space-y-3">
          <h4 className="text-sm font-bold text-[#adc6ff] flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            How OJAS AI Uses Nutrition Data
          </h4>
          <p className="text-xs text-white/70 leading-relaxed">
            When you log meals from this plan, the <strong>Adaptive Decision Engine</strong> tracks your cumulative protein &amp; caloric balance. If daily protein falls below 60g, tomorrow&apos;s workout volume is auto-regulated to prevent catabolic muscle breakdown.
          </p>
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200">
            ✓ Real-time cross-talk between Nutrition Scanner and Workout Generator.
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
