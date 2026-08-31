"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Utensils, 
  ShieldCheck, 
  Award,
  ChevronRight,
  Flame
} from "lucide-react";
import { HostelMessDayMenu, HostelChoiceRanking } from "@/types/fitness-state";
import { analyzeHostelMessMenu } from "@/lib/decision-engine";
import { useFitness } from "@/components/providers/fitness-provider";
import { useTranslation } from "@/lib/i18n";

const PRESET_MESS_MENUS: { name: string; menu: HostelMessDayMenu }[] = [
  {
    name: "South Indian College Mess (Standard)",
    menu: {
      breakfast: ["Idli (3 pcs)", "Sambar", "Coconut Chutney", "Medu Vada"],
      lunch: ["Steamed White Rice", "Toor Dal Tadka", "Cabbage Poriyal", "Plain Curd", "Papad"],
      dinner: ["Phulka Chapati (3 pcs)", "Egg Curry (2 eggs)", "Mixed Veg Sabzi", "Rasam"],
    },
  },
  {
    name: "North Indian Hostel Mess (Standard)",
    menu: {
      breakfast: ["Poha with Peanuts", "Bread Jam", "Boiled Egg", "Milk/Chai"],
      lunch: ["Rajma Masala", "Jeera Rice", "Roti", "Cucumber Salad", "Boondi Raita"],
      dinner: ["Paneer Bhurji / Soya Chunks", "Tawa Roti", "Dal Makhani", "Salad"],
    },
  },
];

export function HostelMode() {
  const { profile, logFood } = useFitness();
  const { t } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [menu, setMenu] = useState<HostelMessDayMenu>(PRESET_MESS_MENUS[0].menu);

  const [newItemText, setNewItemText] = useState("");
  const [targetCategory, setTargetCategory] = useState<"breakfast" | "lunch" | "dinner">("breakfast");
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  // Generate Ranked choices
  const rankings = analyzeHostelMessMenu(menu, profile || ({} as any));

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    setMenu((prev) => ({
      ...prev,
      [targetCategory]: [...prev[targetCategory], newItemText.trim()],
    }));
    setNewItemText("");
  };

  const handleRemoveItem = (category: "breakfast" | "lunch" | "dinner", index: number) => {
    setMenu((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handleApplyPreset = (idx: number) => {
    setSelectedPreset(idx);
    setMenu(PRESET_MESS_MENUS[idx].menu);
  };

  const handleQuickLogRankedMeal = (rank: HostelChoiceRanking) => {
    logFood(
      rank.estimatedMacros.calories,
      rank.estimatedMacros.proteinGrams,
      rank.estimatedMacros.carbsGrams,
      rank.estimatedMacros.fatGrams,
      4
    );
    setLoggedNotification(`✅ ${t("common_success", "Logged")} ${rank.selectedItems[0]} (${rank.estimatedMacros.proteinGrams}g Protein)!`);
    setTimeout(() => setLoggedNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-amber-500/10 via-[#181a20] to-[#121316]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                India-First Feature
              </span>
              <span className="text-white/40 text-xs">Hostel / Mess Living Mode</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {t("nutrition_hostel_mode", "Hostel Mess Optimizer")}
            </h2>
            <p className="text-xs text-white/70 max-w-xl">
              You don’t have 100% control over the mess menu, but Ojas helps you pick the highest protein and healthiest combinations from whatever is served today.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_MESS_MENUS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(idx)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                  selectedPreset === idx
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                }`}
              >
                {preset.name.split("(")[0]}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loggedNotification && (
        <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4" />
          {loggedNotification}
        </div>
      )}

      {/* Main Grid: Mess Menu on Left, AI Ranked Choices on Right */}
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
        {/* Left: Interactive Today's Mess Menu */}
        <GlassCard className="p-5 space-y-5 border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-400" />
              {t("nutrition_mess_menu", "Today's Mess Menu")}
            </h3>
            <span className="text-[11px] text-white/50">Edit or add dishes</span>
          </div>

          {(["breakfast", "lunch", "dinner"] as const).map((cat) => (
            <div key={cat} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#adc6ff]">
                  {cat}
                </span>
                <span className="text-[10px] text-white/40">{menu[cat].length} items</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {menu[cat].map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/90 hover:bg-white/10 transition"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveItem(cat, i)}
                      className="text-white/40 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Add Custom Mess Item */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <label className="text-[11px] font-bold text-white/60 block">Add Item to Mess Menu</label>
            <div className="flex gap-2">
              <select
                value={targetCategory}
                onChange={(e: any) => setTargetCategory(e.target.value)}
                className="rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>

              <Input
                type="text"
                placeholder="e.g. Boiled Egg, Paneer, Soya..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                className="bg-black/20 border-white/10 text-xs"
              />

              <Button
                onClick={handleAddItem}
                size="sm"
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs"
              >
                <Plus className="h-4 w-4" /> {t("common_save", "Add")}
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Right: AI Ranked Choices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#adc6ff]" />
              Ranked Meal Combinations
            </h3>
            <span className="text-[11px] text-white/50">Optimal protein & calories</span>
          </div>

          <div className="space-y-3">
            {rankings.map((rank) => {
              const isBest = rank.rank === 1;
              const isSolid = rank.rank === 2;

              const badgeColor = isBest
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : isSolid
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40";

              const label = isBest
                ? t("nutrition_best_choice", "BEST CHOICE")
                : isSolid
                ? t("nutrition_solid_pick", "SOLID PICK")
                : t("nutrition_caution", "MIND PORTIONS");

              return (
                <GlassCard key={rank.rank} className="p-4 border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold tracking-wider border ${badgeColor}`}>
                      {label}
                    </span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      {rank.estimatedMacros.calories} kcal • {rank.estimatedMacros.proteinGrams}g Protein
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {rank.selectedItems.join(" + ")}
                    </h4>
                    <p className="text-xs text-white/70 mt-1 leading-relaxed">
                      {rank.reasoning}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-[#adc6ff] italic">
                      💡 {rank.ojasHostelTip}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleQuickLogRankedMeal(rank)}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs h-7"
                    >
                      {t("nutrition_log_meal", "Log Meal")}
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
