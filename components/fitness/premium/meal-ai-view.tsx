"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Info,
  Calendar,
  Flame,
  Award,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
} from "lucide-react";

export function MealAiView() {
  const [goal, setGoal] = useState<string>("recomp");
  const [diet, setDiet] = useState<string>("south-indian");
  
  // Custom meals state to simulate swaps
  const [meals, setMeals] = useState([
    { id: "b1", type: "Breakfast", name: "Ragi Malt & Almond Butter Shake", calories: 420, protein: 22, carbs: 45, fat: 12, time: "15 mins", difficulty: "Easy" },
    { id: "l1", type: "Lunch", name: "South Indian Paneer Bhurji & Brown Rice", calories: 650, protein: 35, carbs: 68, fat: 18, time: "25 mins", difficulty: "Medium" },
    { id: "d1", type: "Dinner", name: "Tofu Palak Paneer & Multigrain Rotis", calories: 510, protein: 30, carbs: 55, fat: 14, time: "20 mins", difficulty: "Easy" },
  ]);

  const handleSwap = (id: string) => {
    setMeals(prev => prev.map(m => {
      if (m.id === id) {
        if (m.id === "b1") return { ...m, name: "Oats & Sattu Protein Porridge", calories: 450, protein: 26, carbs: 48, fat: 10 };
        if (m.id === "l1") return { ...m, name: "Soya Chunks Biryani & Curd", calories: 610, protein: 38, carbs: 65, fat: 12 };
        if (m.id === "d1") return { ...m, name: "Egg White Scramble & Chapati", calories: 480, protein: 32, carbs: 40, fat: 9 };
      }
      return m;
    }));
  };

  const handleRegenerate = () => {
    setMeals([
      { id: "b1", type: "Breakfast", name: "Ragi Malt & Almond Butter Shake", calories: 420, protein: 22, carbs: 45, fat: 12, time: "15 mins", difficulty: "Easy" },
      { id: "l1", type: "Lunch", name: "South Indian Paneer Bhurji & Brown Rice", calories: 650, protein: 35, carbs: 68, fat: 18, time: "25 mins", difficulty: "Medium" },
      { id: "d1", type: "Dinner", name: "Tofu Palak Paneer & Multigrain Rotis", calories: 510, protein: 30, carbs: 55, fat: 14, time: "20 mins", difficulty: "Easy" },
    ]);
  };

  return (
    <div className="space-y-6 text-left text-xs">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Flame className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">AI Nutrition Engine</p>
            <h2 className="text-xl font-bold text-white">AI Meal Planner</h2>
            <p className="text-xs text-white/50">Generate personalized meal schedules targeting specific calorie and protein allocations.</p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          className="rounded-xl bg-[#adc6ff] hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#131315] flex items-center gap-1.5 self-start transition"
        >
          <RefreshCw className="h-4 w-4" /> Regenerate Day Plan
        </button>
      </GlassCard>

      {/* Goal & Diet Selectors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-4 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Goal Target</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="cut">Fat Loss deficit</option>
              <option value="bulk">Lean Muscle bulk</option>
              <option value="recomp">Body Recomposition</option>
            </select>
          </label>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3">
          <label className="block space-y-1">
            <span className="text-[10px] text-white/40 uppercase font-semibold">Diet Profile</span>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="south-indian">South Indian high-protein</option>
              <option value="north-indian">North Indian high-protein</option>
              <option value="vegan">Vegan / Plant-based</option>
              <option value="keto">Keto / Low-Carb</option>
            </select>
          </label>
        </GlassCard>
      </div>

      {/* Meals Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        
        {/* Meals Cards */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">Generated Recipes</h3>
          <div className="space-y-3">
            {meals.map((meal) => (
              <GlassCard key={meal.id} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded font-black uppercase">{meal.type}</span>
                  <span className="font-bold text-sm text-white block mt-1">{meal.name}</span>
                  <div className="flex gap-3 text-[10px] text-white/40 mt-1">
                    <span>Cal: {meal.calories} kcal</span>
                    <span>Pro: {meal.protein}g</span>
                    <span>Carbs: {meal.carbs}g</span>
                    <span>Fat: {meal.fat}g</span>
                  </div>
                </div>

                <div className="flex gap-2 self-start sm:self-center">
                  <button
                    onClick={() => handleSwap(meal.id)}
                    className="rounded-xl border border-white/10 hover:bg-white/5 px-3 py-1.5 text-xs text-white flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Swap Meal
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Grocery and shopping lists */}
        <div className="space-y-6">
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-yellow-400" /> AI Recipe Insights
            </h4>
            <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/70">
              💡 **AI Explanation**: This South Indian plan prioritizes Ragi Malt and paneer bhurji to maximize protein intake (87g total) while remaining within your recomposition limits.
            </div>
            <div className="space-y-1 text-white/40 text-[9.5px]">
              <p>**Local Alternatives**: Sattu protein powder as a replacement for whey; local greens as spinach substitute.</p>
              <p>**Estimated cost**: ₹1,800/week.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3.5 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Weekly Grocery List</h4>
            <ul className="list-disc list-inside space-y-1 text-white/60">
              <li>Ragi Malt / Sattu flour (1kg)</li>
              <li>Low-fat Paneer (500g)</li>
              <li>Organic Almond Butter (250g)</li>
              <li>Brown Rice &amp; Rotis grains</li>
              <li>Fresh Spinach &amp; Tofu blocks</li>
            </ul>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
