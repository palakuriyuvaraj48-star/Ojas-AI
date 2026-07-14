"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Apple, Sparkles, Camera, ShoppingCart, BookOpen, UtensilsCrossed, Waves, TrendingUp, MapPin, BellRing } from "lucide-react";
import { NutritionDashboard } from "@/components/fitness/nutrition-dashboard";
import { MealPlanner, MealPlanResults } from "@/components/fitness/meal-planner";
import { FoodLogger } from "@/components/fitness/food-logger";
import { GroceryAssistant } from "@/components/fitness/grocery-assistant";
import { RecipeMaker } from "@/components/fitness/recipe-maker";
import { AiNutritionCoach } from "@/components/fitness/ai-nutrition-coach";
import { WaterTracker } from "@/components/fitness/water-tracker";
import { NutritionAnalytics } from "@/components/fitness/nutrition-analytics";
import { RestaurantDining } from "@/components/fitness/restaurant-dining";
import { NutritionNotifications } from "@/components/fitness/nutrition-notifications";

export function FoodView() {
  const { profile, dailyLog, calorieTargets, macroTargets, logFood, logWater } = useFitness();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["dashboard", "planner", "scanner", "grocery", "recipes", "coach", "water", "analytics", "restaurant", "notifications"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, [typeof window !== "undefined" ? window.location.search : ""]);

  const [compiledPlan, setCompiledPlan] = useState<any | null>(null);

  const handleNavigate = (route: string) => {
    if (route.startsWith("/nutrition?tab=")) {
      const tab = route.split("tab=")[1];
      setActiveTab(tab);
      window.history.pushState({}, "", `/nutrition?tab=${tab}`);
    } else if (route.startsWith("/")) {
      window.location.href = route;
    }
  };

  if (!profile || !calorieTargets || !macroTargets) return null;

  return (
    <div className="space-y-6 relative text-left">
      {/* Sub Navigation Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "dashboard", label: "Nutrition Dashboard", icon: Apple },
          { id: "planner", label: "AI Planner", icon: Sparkles },
          { id: "scanner", label: "Log & Scan Food", icon: Camera },
          { id: "grocery", label: "Grocery Assistant", icon: ShoppingCart },
          { id: "recipes", label: "Recipe Maker", icon: BookOpen },
          { id: "coach", label: "AI Dietitian", icon: UtensilsCrossed },
          { id: "water", label: "Water Tracker", icon: Waves },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
          { id: "restaurant", label: "Restaurant", icon: MapPin },
          { id: "notifications", label: "Smart Alerts", icon: BellRing },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30"
                  : "text-white/60 hover:text-white bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && <NutritionDashboard onNavigate={handleNavigate} />}
      {activeTab === "planner" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <MealPlanner onCompile={(plan) => setCompiledPlan(plan)} />
          <MealPlanResults plan={compiledPlan} onSwapMeal={(idx) => {
            setCompiledPlan((prev: any) => {
              if (!prev) return prev;
              const altMeals = [
                { title: "Grilled Chicken breast with Sweet Potato", cal: 520, p: 40, c: 38, f: 12, cost: 95 },
                { title: "Tofu Scramble with whole wheat Roti", cal: 320, p: 20, c: 25, f: 10, cost: 40 }
              ];
              const chooseAlt = prev.meals[idx]?.title?.toLowerCase().includes("tofu") || prev.meals[idx]?.title?.toLowerCase().includes("veg") ? altMeals[1] : altMeals[0];
              const updatedMeals = [...prev.meals];
              updatedMeals[idx] = { ...updatedMeals[idx], title: chooseAlt.title, cal: chooseAlt.cal, p: chooseAlt.p, c: chooseAlt.c, f: chooseAlt.f, cost: chooseAlt.cost };
              return { ...prev, meals: updatedMeals };
            });
          }} />
        </div>
      )}
      {activeTab === "scanner" && <FoodLogger />}
      {activeTab === "grocery" && <GroceryAssistant />}
      {activeTab === "recipes" && <RecipeMaker />}
      {activeTab === "coach" && <AiNutritionCoach />}
      {activeTab === "water" && <WaterTracker dailyLog={dailyLog} logWater={logWater} calorieTargets={calorieTargets} />}
      {activeTab === "analytics" && <NutritionAnalytics />}
      {activeTab === "restaurant" && <RestaurantDining />}
      {activeTab === "notifications" && <NutritionNotifications onAction={handleNavigate} />}
    </div>
  );
}
