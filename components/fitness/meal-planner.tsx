"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

export function MealPlanner({ onCompile }: { onCompile: (plan: any) => void }) {
  const [target, setTarget] = useState("muscle-gain");
  const [diet, setDiet] = useState("non-veg");
  const [budget, setBudget] = useState(300);
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = () => {
    setIsCompiling(true);
    fetch(`/api/nutrition/meals?target=${target}&diet=${diet}&budget=${budget}`)
      .then((res) => res.json())
      .then((data) => {
        onCompile(data);
        setIsCompiling(false);
      })
      .catch(() => setIsCompiling(false));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)] animate-pulse" /> Diet Preferences
        </h3>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Nutrition Target</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
              <option value="muscle-gain">Lean Muscle Gain (Hypertrophy caloric surplus)</option>
              <option value="fat-loss">Fat Loss (Metabolic deficit)</option>
              <option value="maintenance">Maintenance (Energy equilibrium)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Cultural Category</label>
            <select value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
              <option value="non-veg">Non-Vegetarian (High Protein poultry/fish)</option>
              <option value="veg">Vegetarian (Lacto-Ovo / Paneer / Legumes)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Daily Cost Target (INR)</label>
            <select value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none">
              <option value={300}>₹300 / day budget limit</option>
              <option value={500}>₹500 / day budget limit</option>
              <option value={800}>₹800 / day budget limit</option>
            </select>
          </div>
        </div>

        <Button onClick={handleCompile} disabled={isCompiling} variant="premium" className="w-full text-xs py-2 justify-center">
          {isCompiling ? "Compiling menu..." : "Generate AI Meal Plan"}
        </Button>
      </GlassCard>
    </div>
  );
}

export function MealPlanResults({ plan, onSwapMeal }: { plan: any; onSwapMeal: (index: number) => void }) {
  if (!plan) {
    return (
      <GlassCard className="p-5 space-y-4">
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
          <Sparkles className="h-10 w-10 text-white/20 animate-pulse" />
          <p className="text-xs text-[var(--foreground-muted)]">Configure specifications and generate your customized meal plan.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div>
          <h3 className="font-bold text-white text-md">{plan.title}</h3>
          <p className="text-[10px] text-[var(--foreground-muted)]">
            Total: {plan.totalCalories} kcal | P: {plan.protein}g | C: {plan.carbs}g | F: {plan.fat}g
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-[var(--accent)]">₹{plan.dailyCost}/day</p>
          <p className="text-[9px] text-emerald-400 font-bold">₹{plan.weeklyCost}/week</p>
        </div>
      </div>

      <div className="space-y-2">
        {plan.meals.map((meal: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs"
          >
            <div>
              <span className="text-[9px] font-bold text-white/40 uppercase block">{meal.name}</span>
              <p className="font-semibold text-white mt-0.5">{meal.title}</p>
              <p className="text-[10px] text-[var(--foreground-muted)]">{meal.cal} kcal • P: {meal.p}g • C: {meal.c}g • F: {meal.f}g</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1 shrink-0">
              <span className="text-white font-mono text-[10px]">₹{meal.cost}</span>
              <button
                onClick={() => onSwapMeal(idx)}
                className="px-2 py-0.5 border border-white/10 hover:bg-white/5 rounded text-[8px] font-semibold text-white transition flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Swap
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-[10px] leading-relaxed text-[var(--foreground-muted)]">
        <strong>Coach Vikram:</strong> {plan.reasoning}
      </div>
    </GlassCard>
  );
}
