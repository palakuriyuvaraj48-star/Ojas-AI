"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Info, 
  ShoppingBag
} from "lucide-react";
import { useFitness } from "@/components/providers/fitness-provider";
import { useTranslation } from "@/lib/i18n";

interface BudgetMealPlanOption {
  budget: number;
  label: string;
  totalCost: number;
  totalProtein: number;
  totalCalories: number;
  meals: {
    title: string;
    items: string;
    protein: number;
    calories: number;
    cost: number;
  }[];
  topHacks: string[];
}

const BUDGET_PLANS: Record<number, BudgetMealPlanOption> = {
  50: {
    budget: 50,
    label: "₹50 / Day — Ultra Budget Muscle Split",
    totalCost: 48,
    totalProtein: 76,
    totalCalories: 1850,
    meals: [
      { title: "Breakfast", items: "Poha with 30g Roasted Peanuts", protein: 12, calories: 340, cost: 12 },
      { title: "Lunch", items: "Lentil Dal Tadka (2 bowls) + Steamed Rice", protein: 16, calories: 480, cost: 14 },
      { title: "Evening Snack", items: "Sattu Chana Drink (40g sattu in water)", protein: 11, calories: 165, cost: 8 },
      { title: "Dinner", items: "50g Soya Chunks Curry + 2 Phulka Rotis", protein: 37, calories: 460, cost: 14 },
    ],
    topHacks: [
      "Soya chunks provide 52g protein per 100g dry weight at just ₹15.",
      "Sattu (roasted gram powder) delivers 11g clean protein without cooking.",
      "Buy peanuts in 500g bulk packs for ₹70 instead of single packets.",
    ],
  },
  100: {
    budget: 100,
    label: "₹100 / Day — High-Protein Balanced Split",
    totalCost: 95,
    totalProtein: 108,
    totalCalories: 2150,
    meals: [
      { title: "Breakfast", items: "3 Boiled Whole Eggs + 2 Phulka Rotis", protein: 24, calories: 370, cost: 26 },
      { title: "Lunch", items: "Rajma Masala / Dal Tadka + Rice + Curd (150g)", protein: 22, calories: 540, cost: 25 },
      { title: "Evening Snack", items: "Moong Sprouts Salad with Lemon + Peanuts", protein: 18, calories: 260, cost: 16 },
      { title: "Dinner", items: "Egg Bhurji (2 eggs) + Soya Chunks (30g) + 2 Rotis", protein: 44, calories: 520, cost: 28 },
    ],
    topHacks: [
      "Eggs are a complete biological protein source at ₹7 per egg.",
      "Curd adds 6g protein plus active probiotics for gut health at ₹15.",
      "Sprouting whole green moong dal at home multiplies vitamin C and B-complex.",
    ],
  },
  150: {
    budget: 150,
    label: "₹150 / Day — Athlete & Lean Bulk Split",
    totalCost: 142,
    totalProtein: 135,
    totalCalories: 2400,
    meals: [
      { title: "Breakfast", items: "Egg Bhurji (3 eggs) + Whole Wheat Toast + Milk", protein: 28, calories: 460, cost: 35 },
      { title: "Lunch", items: "Home Chicken Curry (150g) OR Paneer Curry + Rice + Dal", protein: 42, calories: 620, cost: 55 },
      { title: "Evening Snack", items: "Roasted Chana (50g) + Curd (150g)", protein: 18, calories: 290, cost: 20 },
      { title: "Dinner", items: "Fish Curry OR Soya-Paneer Stir-fry + 3 Phulka Rotis", protein: 47, calories: 560, cost: 32 },
    ],
    topHacks: [
      "Local market chicken breast / eggs offer maximum protein per rupee.",
      "Batch-cooking chicken or paneer curry saves 40% over restaurant orders.",
      "Seasonal local greens (palak, methi) add essential micronutrients for ₹10/bunch.",
    ],
  },
  250: {
    budget: 250,
    label: "₹250+ / Day — Premium Whole Food & Whey Split",
    totalCost: 240,
    totalProtein: 160,
    totalCalories: 2600,
    meals: [
      { title: "Breakfast", items: "4 Egg White + 1 Whole Egg Omelette + Oats Bowl", protein: 32, calories: 480, cost: 50 },
      { title: "Lunch", items: "Grilled Chicken Breast (200g) + Basmati Rice + Salad", protein: 56, calories: 650, cost: 85 },
      { title: "Evening Post-Workout", items: "1 Scoop Whey Protein with Water + 1 Banana", protein: 26, calories: 210, cost: 60 },
      { title: "Dinner", items: "Paneer Tikka (150g) + 2 Multigrain Rotis + Dal", protein: 46, calories: 580, cost: 45 },
    ],
    topHacks: [
      "Combine fast-digesting whey protein post-workout with whole food casein at night.",
      "High bioavailability lean meats keep dietary thermogenesis elevated.",
    ],
  },
};

export function BudgetCoach() {
  const { profile } = useFitness();
  const { t } = useTranslation();
  const [budgetTier, setBudgetTier] = useState<number>(profile?.dailyFoodBudget || 100);
  const activePlan = BUDGET_PLANS[budgetTier] || BUDGET_PLANS[100];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-emerald-500/10 via-[#181a20] to-[#121316]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                Affordable Nutrition
              </span>
              <span className="text-white/40 text-xs">India Budget Coach</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {t("nutrition_budget_coach", "Budget Fitness Coach")}
            </h2>
            <p className="text-xs text-white/70 max-w-xl">
              High-protein fitness doesn't require expensive imported supplements. Ojas creates tailored Indian meal plans based on real daily budget constraints.
            </p>
          </div>

          {/* Budget Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {[50, 100, 150, 250].map((b) => (
              <button
                key={b}
                onClick={() => setBudgetTier(b)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold border transition ${
                  budgetTier === b
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                }`}
              >
                ₹{b}/day
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-4 border-white/10 text-center">
          <span className="text-[11px] text-white/50 block mb-1">Estimated Daily Cost</span>
          <span className="text-2xl font-extrabold text-emerald-400">₹{activePlan.totalCost}</span>
          <span className="text-[10px] text-white/40 block mt-0.5">Budget limit: ₹{budgetTier}</span>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 text-center">
          <span className="text-[11px] text-white/50 block mb-1">{t("nutrition_protein_target", "Total Daily Protein")}</span>
          <span className="text-2xl font-extrabold text-white">{activePlan.totalProtein}g</span>
          <span className="text-[10px] text-emerald-300 block mt-0.5">₹{(activePlan.totalCost / activePlan.totalProtein).toFixed(1)} per gram</span>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 text-center">
          <span className="text-[11px] text-white/50 block mb-1">{t("nutrition_calories", "Total Calories")}</span>
          <span className="text-2xl font-extrabold text-white">{activePlan.totalCalories}</span>
          <span className="text-[10px] text-white/40 block mt-0.5">kcal / day</span>
        </GlassCard>

        <GlassCard className="p-4 border-white/10 text-center">
          <span className="text-[11px] text-white/50 block mb-1">Protein Quality</span>
          <span className="text-xl font-extrabold text-[#adc6ff]">High Bioavailability</span>
          <span className="text-[10px] text-white/40 block mt-0.5">Complete amino profile</span>
        </GlassCard>
      </div>

      {/* Daily Meal Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Complete Day Meal Breakdown ({activePlan.label})
          </h3>
          <span className="text-[11px] text-white/50">Full day targets hit for ₹{activePlan.totalCost}</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activePlan.meals.map((m, i) => (
            <GlassCard key={i} className="p-4 border-white/10 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#adc6ff] uppercase tracking-wider text-[10px]">{m.title}</span>
                  <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    ₹{m.cost}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{m.items}</h4>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/70">
                <span className="text-emerald-300 font-bold">{m.protein}g Protein</span>
                <span>{m.calories} kcal</span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Budget Protein Hacks */}
      <GlassCard className="p-5 border-white/10 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#adc6ff]" />
          Smart Grocery & Prep Hacks for Indian Fitness
        </h4>

        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {activePlan.topHacks.map((hack, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] border border-white/5 p-3.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-white/80 leading-relaxed">{hack}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
