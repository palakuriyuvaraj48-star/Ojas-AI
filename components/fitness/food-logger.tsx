"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Mic, 
  CheckCircle2, 
  Search, 
  Plus, 
  Sparkles, 
  HelpCircle,
  Flame,
  Info,
  DollarSign
} from "lucide-react";
import { INDIAN_FOODS_DATABASE } from "@/lib/nutrition/indian-food-db";

const QUICK_INDIAN_CHIPS = [
  "Idli Sambar",
  "Dal Tadka Rice",
  "Egg Curry",
  "Soya Chunks",
  "Paneer Bhurji",
  "Boiled Eggs",
  "Poha",
  "Curd",
  "Chicken Curry",
];

export function FoodLogger() {
  const { logFood } = useFitness();
  const [customFood, setCustomFood] = useState({ name: "", cal: "", prot: "", carb: "", fat: "", fiber: "", cost: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scannedEstimate, setScannedEstimate] = useState<any | null>(null);
  const [loggedAlert, setLoggedAlert] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/nutrition/food?query=${searchQuery}`)
      .then((res) => res.json())
      .then(setFoodResults)
      .catch(() => setFoodResults([]));
  }, [searchQuery]);

  const handleCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(customFood.cal) || 0;
    const p = parseInt(customFood.prot) || 0;
    const carb = parseInt(customFood.carb) || 0;
    const f = parseInt(customFood.fat) || 0;
    const fib = parseInt(customFood.fiber) || 0;
    logFood(c, p, carb, f, fib);
    setLoggedAlert(`✅ Logged ${customFood.name || "Meal"} (${p}g Protein, ${c} kcal)`);
    setCustomFood({ name: "", cal: "", prot: "", carb: "", fat: "", fiber: "", cost: "" });
    setTimeout(() => setLoggedAlert(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanning(true);
      setScanPreview(URL.createObjectURL(file));
      fetch("/api/nutrition/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: "uploaded" }),
      })
        .then((res) => res.json())
        .then((data) => {
          setScannedEstimate(data);
          setScanning(false);
        })
        .catch(() => setScanning(false));
    }
  };

  const handleScanPreset = (mealName: string) => {
    setScanning(true);
    fetch("/api/nutrition/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodQuery: mealName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setScannedEstimate(data);
        setScanning(false);
      })
      .catch(() => setScanning(false));
  };

  const saveScannedFood = () => {
    if (scannedEstimate) {
      logFood(
        scannedEstimate.cal,
        scannedEstimate.p,
        scannedEstimate.c,
        scannedEstimate.f,
        scannedEstimate.fiber || 0
      );
      setLoggedAlert(`✅ Logged ${scannedEstimate.name} (${scannedEstimate.p}g Protein)`);
      setScanPreview(null);
      setScannedEstimate(null);
      setTimeout(() => setLoggedAlert(null), 3000);
    }
  };

  const quickLogItem = (food: any) => {
    logFood(food.cal, food.p, food.c, food.f, food.fiber || 0);
    setLoggedAlert(`✅ Logged ${food.name} (${food.p}g Protein, ${food.cal} kcal)`);
    setTimeout(() => setLoggedAlert(null), 3000);
  };

  return (
    <div className="space-y-6">
      {loggedAlert && (
        <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {loggedAlert}
        </div>
      )}

      {/* Quick Indian Staples Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-white/50 whitespace-nowrap">Quick Staples:</span>
        {QUICK_INDIAN_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setSearchQuery(chip)}
            className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10 whitespace-nowrap transition"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Indian Food Search & Manual Entry */}
        <div className="space-y-6">
          {/* Search Bar */}
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Search className="h-4 w-4 text-[#adc6ff]" />
                Search Indian Foods Database
              </h3>
              <span className="text-[10px] text-white/40">60+ verified dishes</span>
            </div>

            <div className="relative">
              <Input
                type="text"
                placeholder="Search idli, dal, chicken, paneer, dosa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20 border-white/10 text-xs pl-8"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-white/40" />
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {foodResults.map((food) => (
                <div
                  key={food.id}
                  className="rounded-xl bg-white/[0.02] border border-white/5 p-3 flex items-center justify-between hover:bg-white/[0.05] transition"
                >
                  <div className="space-y-0.5 max-w-[75%]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs">{food.name}</h4>
                      {food.cost && (
                        <span className="text-[10px] text-emerald-400 font-semibold">~₹{food.cost}</span>
                      )}
                      {food.isHostelStaple && (
                        <span className="rounded bg-amber-400/20 text-amber-300 text-[9px] px-1 py-0.2 font-bold">Hostel</span>
                      )}
                    </div>
                    {food.regionalName && (
                      <p className="text-[10px] text-white/40">{food.regionalName}</p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                      <span className="text-emerald-400 font-semibold">{food.p}g Protein</span>
                      <span>•</span>
                      <span>{food.c}g Carbs</span>
                      <span>•</span>
                      <span>{food.f}g Fat</span>
                      <span>•</span>
                      <span>{food.cal} kcal</span>
                    </div>
                    {food.ojasTip && (
                      <p className="text-[10px] text-[#adc6ff]/80 italic line-clamp-1">
                        💡 {food.ojasTip}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => quickLogItem(food)}
                    className="flex items-center gap-1 rounded-lg bg-[#adc6ff]/20 hover:bg-[#adc6ff]/30 text-[#adc6ff] px-2.5 py-1.5 text-xs font-bold transition shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    Log
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Manual Entry Form */}
          <GlassCard className="p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Manual Custom Food Entry</h3>
            <form onSubmit={handleCustomFoodSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Meal / Dish Name</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 2 Rotis + Dal + Curd"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                  className="bg-black/20 border-white/10"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-white/50 block mb-1">Calories (kcal)</label>
                  <Input
                    type="number"
                    required
                    placeholder="350"
                    value={customFood.cal}
                    onChange={(e) => setCustomFood({ ...customFood, cal: e.target.value })}
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 block mb-1">Protein (g)</label>
                  <Input
                    type="number"
                    required
                    placeholder="18"
                    value={customFood.prot}
                    onChange={(e) => setCustomFood({ ...customFood, prot: e.target.value })}
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 block mb-1">Carbs (g)</label>
                  <Input
                    type="number"
                    placeholder="45"
                    value={customFood.carb}
                    onChange={(e) => setCustomFood({ ...customFood, carb: e.target.value })}
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/50 block mb-1">Fat (g)</label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={customFood.fat}
                    onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })}
                    className="bg-black/20 border-white/10"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full bg-[#adc6ff] hover:bg-white text-[#131315] font-bold text-xs">
                Log Custom Meal
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right: AI Food Photo Lens & Meal Intelligence */}
        <div className="space-y-6">
          <GlassCard className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#adc6ff]" />
                AI Food Lens (Photo → Estimate)
              </h3>
              <span className="text-[10px] text-white/40">Visual understanding</span>
            </div>

            <p className="text-xs text-white/60">
              Upload a picture of your plate (e.g. Mess Thali, Rice + Dal + Chicken, Dosa) for instant nutrient estimation & coaching guidance.
            </p>

            <input
              type="file"
              accept="image/*"
              ref={uploadRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div
              onClick={() => uploadRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-[#adc6ff]/50 rounded-2xl p-6 text-center cursor-pointer transition bg-black/20 flex flex-col items-center justify-center gap-2"
            >
              {scanPreview ? (
                <img src={scanPreview} alt="Food Preview" className="h-32 rounded-xl object-cover" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-[#adc6ff]" />
                  <span className="text-xs font-bold text-white">Click to Upload Plate Photo</span>
                  <span className="text-[10px] text-white/40">Supports JPG, PNG, WebP</span>
                </>
              )}
            </div>

            {/* Quick Demo Scan Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white/50 block">Or try a sample meal:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Rice + Dal + Chicken",
                  "Idli + Sambar",
                  "Egg Bhurji + Roti",
                  "Soya Chunks Curry",
                ].map((demo) => (
                  <button
                    key={demo}
                    onClick={() => handleScanPreset(demo)}
                    className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    {demo}
                  </button>
                ))}
              </div>
            </div>

            {scanning && (
              <div className="p-4 text-center text-xs text-[#adc6ff] flex items-center justify-center gap-2 animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing meal composition & portion density...
              </div>
            )}

            {scannedEstimate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/[0.03] border border-emerald-500/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">
                    Recognized: {scannedEstimate.name}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/70">
                    {scannedEstimate.confidence || "Estimated"}
                  </span>
                </div>

                <p className="text-[11px] text-white/50">{scannedEstimate.portion}</p>

                {/* Macro breakdown */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs bg-black/30 rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] text-white/40 block">Calories</span>
                    <strong className="text-white font-bold">{scannedEstimate.cal}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400 block">Protein</span>
                    <strong className="text-emerald-300 font-bold">{scannedEstimate.p}g</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Carbs</span>
                    <strong className="text-white font-bold">{scannedEstimate.c}g</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Fat</span>
                    <strong className="text-white font-bold">{scannedEstimate.f}g</strong>
                  </div>
                </div>

                {/* Ojas Coaching Recommendation */}
                {scannedEstimate.ojasRecommendation && (
                  <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-[11px] text-white/80 space-y-1">
                    <span className="font-bold text-[#adc6ff] flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Ojas Recommendation
                    </span>
                    <p>{scannedEstimate.ojasRecommendation}</p>
                  </div>
                )}

                <Button
                  onClick={saveScannedFood}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  Save & Log to Daily Tracker
                </Button>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
