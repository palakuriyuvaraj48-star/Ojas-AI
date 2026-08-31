"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { 
  Apple, 
  Sparkles, 
  Camera, 
  ShoppingCart, 
  BookOpen, 
  UtensilsCrossed, 
  Waves, 
  TrendingUp, 
  MapPin, 
  BellRing,
  Building2,
  DollarSign
} from "lucide-react";
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
import { HostelMode } from "@/components/fitness/hostel-mode";
import { BudgetCoach } from "@/components/fitness/budget-coach";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

interface FoodTabConfig {
  id: string;
  key?: keyof TranslationDictionary;
  defaultLabel: string;
  icon: any;
  highlight?: boolean;
}

export function FoodView() {
  const { profile, dailyLog, calorieTargets, macroTargets, logWater } = useFitness();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab && ["dashboard", "hostel", "budget", "planner", "scanner", "grocery", "recipes", "coach", "water", "analytics", "restaurant", "notifications"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  const [compiledPlan, setCompiledPlan] = useState<any | null>(null);

  const handleNavigate = (route: string) => {
    if (route.startsWith("/nutrition?tab=") || route.startsWith("/food?tab=")) {
      const tab = route.split("tab=")[1];
      setActiveTab(tab);
      window.history.pushState({}, "", `/food?tab=${tab}`);
    } else if (route.startsWith("/")) {
      window.location.href = route;
    }
  };

  if (!profile || !calorieTargets || !macroTargets) return null;

  const tabs: FoodTabConfig[] = [
    { id: "dashboard", key: "nav_nutrition_dashboard", defaultLabel: "Nutrition Dashboard", icon: Apple },
    { id: "hostel", key: "nutrition_hostel_mode", defaultLabel: "Hostel Mode", icon: Building2, highlight: true },
    { id: "budget", key: "nutrition_budget_coach", defaultLabel: "Budget Coach", icon: DollarSign, highlight: true },
    { id: "scanner", key: "nav_food_scanner", defaultLabel: "Log & Scan Food", icon: Camera },
    { id: "planner", key: "nav_meal_planner", defaultLabel: "AI Planner", icon: Sparkles },
    { id: "grocery", key: "nav_grocery", defaultLabel: "Grocery Assistant", icon: ShoppingCart },
    { id: "recipes", key: "nav_recipes", defaultLabel: "Recipe Maker", icon: BookOpen },
    { id: "coach", key: "nav_ai_dietitian", defaultLabel: "AI Dietitian", icon: UtensilsCrossed },
    { id: "water", key: "nav_water_tracker", defaultLabel: "Water Tracker", icon: Waves },
    { id: "analytics", key: "nav_nutrition_analytics", defaultLabel: "Analytics", icon: TrendingUp },
    { id: "restaurant", key: "nav_restaurant_dining", defaultLabel: "Restaurant", icon: MapPin },
    { id: "notifications", key: "nav_smart_alerts", defaultLabel: "Smart Alerts", icon: BellRing },
  ];

  return (
    <div className="space-y-6 relative text-left">
      {/* Sub Navigation Bar with India-First Features */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = tab.key ? t(tab.key, tab.defaultLabel) : tab.defaultLabel;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.history.pushState({}, "", `/food?tab=${tab.id}`);
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? "bg-[#adc6ff] text-[#131315] shadow-lg shadow-blue-500/20"
                  : tab.highlight
                  ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* View Switcher */}
      {activeTab === "dashboard" && <NutritionDashboard onNavigate={handleNavigate} />}
      {activeTab === "hostel" && <HostelMode />}
      {activeTab === "budget" && <BudgetCoach />}
      {activeTab === "planner" && (
        <div className="space-y-6">
          <MealPlanner onCompile={(plan: any) => setCompiledPlan(plan)} />
          {compiledPlan && <MealPlanResults plan={compiledPlan} onSwapMeal={() => {}} />}
        </div>
      )}
      {activeTab === "scanner" && <FoodLogger />}
      {activeTab === "grocery" && <GroceryAssistant />}
      {activeTab === "recipes" && <RecipeMaker />}
      {activeTab === "coach" && <AiNutritionCoach />}
      {activeTab === "water" && <WaterTracker dailyLog={dailyLog} logWater={logWater} calorieTargets={calorieTargets} />}
      {activeTab === "analytics" && <NutritionAnalytics />}
      {activeTab === "restaurant" && <RestaurantDining />}
      {activeTab === "notifications" && <NutritionNotifications />}
    </div>
  );
}
