"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Camera, Upload, VideoOff, RefreshCw, Mic, CheckCircle2, Search, Trash2 } from "lucide-react";

export function FoodLogger() {
  const { logFood } = useFitness();
  const [customFood, setCustomFood] = useState({ name: "", cal: "", prot: "", carb: "", fat: "", fiber: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [foodResults, setFoodResults] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scannedEstimate, setScannedEstimate] = useState<any | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery) {
      fetch(`/api/nutrition/food?query=${searchQuery}`)
        .then((res) => res.json())
        .then(setFoodResults)
        .catch(() => setFoodResults([]));
    } else {
      setFoodResults([]);
    }
  }, [searchQuery]);

  const handleCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(customFood.cal) || 0;
    const p = parseInt(customFood.prot) || 0;
    const carb = parseInt(customFood.carb) || 0;
    const f = parseInt(customFood.fat) || 0;
    const fib = parseInt(customFood.fiber) || 0;
    logFood(c, p, carb, f, fib);
    setCustomFood({ name: "", cal: "", prot: "", carb: "", fat: "", fiber: "" });
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

  const saveScannedFood = () => {
    if (scannedEstimate) {
      logFood(
        scannedEstimate.cal,
        scannedEstimate.p,
        scannedEstimate.c,
        scannedEstimate.f,
        scannedEstimate.fiber || 0
      );
      setScanPreview(null);
      setScannedEstimate(null);
    }
  };

  const quickLog = (c: number, p: number, carb: number, f: number) => {
    logFood(c, p, carb, f);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">Manual Food Entry</h3>
          <form onSubmit={handleCustomFoodSubmit} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-white/50 block mb-1">Meal Name</label>
              <Input type="text" required placeholder="e.g. Scrambled Eggs" value={customFood.name} onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })} className="bg-black/20 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Calories (kcal)</label>
                <Input type="number" required placeholder="e.g. 320" value={customFood.cal} onChange={(e) => setCustomFood({ ...customFood, cal: e.target.value })} className="bg-black/20 border-white/10" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Protein (g)</label>
                <Input type="number" required placeholder="e.g. 24" value={customFood.prot} onChange={(e) => setCustomFood({ ...customFood, prot: e.target.value })} className="bg-black/20 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Carbs (g)</label>
                <Input type="number" required placeholder="e.g. 8" value={customFood.carb} onChange={(e) => setCustomFood({ ...customFood, carb: e.target.value })} className="bg-black/20 border-white/10" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Fat (g)</label>
                <Input type="number" required placeholder="e.g. 18" value={customFood.fat} onChange={(e) => setCustomFood({ ...customFood, fat: e.target.value })} className="bg-black/20 border-white/10" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/50 block mb-1">Fiber (g)</label>
                <Input type="number" placeholder="e.g. 5" value={customFood.fiber} onChange={(e) => setCustomFood({ ...customFood, fiber: e.target.value })} className="bg-black/20 border-white/10" />
              </div>
            </div>
            <Button type="submit" variant="premium" className="w-full py-2 text-xs justify-center">Save Meal Log</Button>
          </form>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Log Favorites</h4>
          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              { name: "Scrambled Eggs with Spinach", cal: 320, p: 24, c: 8, f: 18 },
              { name: "Grilled Salmon bowl with Rice", cal: 620, p: 44, c: 55, f: 22 },
              { name: "Greek Yogurt with Berries", cal: 240, p: 18, c: 28, f: 6 },
              { name: "Protein Whey Shake", cal: 160, p: 30, c: 8, f: 2 },
            ].map((fav, idx) => (
              <button key={idx} onClick={() => quickLog(fav.cal, fav.p, fav.c, fav.f)} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-xs text-left">
                <p className="font-bold text-white truncate">{fav.name}</p>
                <p className="text-[9px] text-[var(--foreground-muted)] mt-1">{fav.cal} kcal • P: {fav.p}g • C: {fav.c}g</p>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Voice Log</h4>
          <button onClick={() => setVoiceListening(!voiceListening)} className={`w-full py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${voiceListening ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]" : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"}`}>
            <Mic className="h-4 w-4" /> {voiceListening ? "Listening..." : "Tap to speak a meal"}
          </button>
        </GlassCard>
      </div>

      <div className="space-y-6 text-left">
        <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Camera className="h-4 w-4 text-cyan-400" /> AI Food Recognition
          </h3>
          <div className="relative aspect-video rounded-2xl border border-white/10 bg-black/20 overflow-hidden flex flex-col items-center justify-center p-4">
            {scanPreview ? (
              <>
                <img src={scanPreview} alt="Scan preview" className="absolute inset-0 w-full h-full object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <RefreshCw className="h-8 w-8 text-[var(--accent)] animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center space-y-2">
                <VideoOff className="h-8 w-8 text-white/20 mx-auto" />
                <p className="text-xs text-[var(--foreground-muted)]">Upload a photo to estimate portions & macros.</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input type="file" ref={uploadRef} accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <Button onClick={() => uploadRef.current?.click()} variant="outline" className="flex-1 text-xs py-2 justify-center gap-1.5">
              <Upload className="h-4 w-4" /> Upload Meal Photo
            </Button>
          </div>
          {scannedEstimate && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t border-white/5 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">AI Detected Food Details</span>
                <Badge variant="success" label={`Confidence: ${scannedEstimate.confidence}%`} />
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[9px] font-bold text-white/40 block mb-0.5">Meal Name</label>
                  <Input 
                    type="text" 
                    value={scannedEstimate.name} 
                    onChange={(e) => setScannedEstimate({ ...scannedEstimate, name: e.target.value })} 
                    className="bg-black/20 border-white/10 py-1 h-8 text-xs" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-white/40 block mb-0.5">Portion</label>
                  <Input 
                    type="text" 
                    value={scannedEstimate.portion} 
                    onChange={(e) => setScannedEstimate({ ...scannedEstimate, portion: e.target.value })} 
                    className="bg-black/20 border-white/10 py-1 h-8 text-xs" 
                  />
                </div>
                
                <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-white text-left">
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-0.5">Cal</label>
                    <Input 
                      type="number" 
                      value={scannedEstimate.cal} 
                      onChange={(e) => setScannedEstimate({ ...scannedEstimate, cal: parseInt(e.target.value) || 0 })} 
                      className="bg-black/20 border-white/10 p-1 h-8 text-center text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-0.5">Prot</label>
                    <Input 
                      type="number" 
                      value={scannedEstimate.p} 
                      onChange={(e) => setScannedEstimate({ ...scannedEstimate, p: parseInt(e.target.value) || 0 })} 
                      className="bg-black/20 border-white/10 p-1 h-8 text-center text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-0.5">Carb</label>
                    <Input 
                      type="number" 
                      value={scannedEstimate.c} 
                      onChange={(e) => setScannedEstimate({ ...scannedEstimate, c: parseInt(e.target.value) || 0 })} 
                      className="bg-black/20 border-white/10 p-1 h-8 text-center text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-0.5">Fat</label>
                    <Input 
                      type="number" 
                      value={scannedEstimate.f} 
                      onChange={(e) => setScannedEstimate({ ...scannedEstimate, f: parseInt(e.target.value) || 0 })} 
                      className="bg-black/20 border-white/10 p-1 h-8 text-center text-xs" 
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-white/40 block mb-0.5">Fiber</label>
                    <Input 
                      type="number" 
                      value={scannedEstimate.fiber ?? 0} 
                      onChange={(e) => setScannedEstimate({ ...scannedEstimate, fiber: parseInt(e.target.value) || 0 })} 
                      className="bg-black/20 border-white/10 p-1 h-8 text-center text-xs" 
                    />
                  </div>
                </div>
              </div>

              <p className="text-[9px] text-amber-400/80 leading-relaxed italic mt-2">
                ⚠️ **Disclaimer**: Nutritional values are AI estimates and may vary. Please verify values for exact accuracy.
              </p>

              <Button onClick={saveScannedFood} variant="premium" className="w-full text-xs py-2 justify-center">Accept & Log Macros</Button>
            </motion.div>
          )}
        </GlassCard>

        <GlassCard className="p-5 space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--accent)]" /> Barcode Lookup
          </h3>
          <div className="relative">
            <Input type="text" placeholder="Enter barcode or search food..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/20 border-white/10 text-xs" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--foreground-muted)]">🔍</div>
          </div>
          {foodResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {foodResults.map((food) => (
                <div key={food.id || food.name} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-white text-[10px]">{food.name}</p>
                    <p className="text-[9px] text-[var(--foreground-muted)]">{food.cal} kcal • P: {food.p}g • C: {food.c}g</p>
                  </div>
                  <button onClick={() => { logFood(food.cal, food.p, food.c, food.f); setSearchQuery(""); setFoodResults([]); }} className="px-2 py-1 bg-[var(--accent)] text-black text-[9px] rounded-lg font-bold">Log</button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
