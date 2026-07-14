"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Utensils, Star, AlertTriangle } from "lucide-react";

export function RestaurantDining() {
  const [budget, setBudget] = useState(300);
  const [diet, setDiet] = useState("non-veg");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nutrition/restaurant?diet=${diet}&budget=${budget}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.recommended || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [diet, budget]);

  return (
    <div className="space-y-6">
      <GlassCard className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Diet Preference</label>
            <select value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none text-xs">
              <option value="non-veg">Non-Vegetarian</option>
              <option value="veg">Vegetarian</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-white/50 uppercase block mb-1">Max Budget (INR)</label>
            <select value={budget} onChange={(e) => setBudget(parseInt(e.target.value))} className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-white focus:outline-none text-xs">
              <option value={200}>₹200</option>
              <option value={300}>₹300</option>
              <option value={500}>₹500</option>
              <option value={800}>₹800</option>
            </select>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--accent)]" /> Restaurant Suggestions
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants.map((r: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm">{r.dish}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.restaurant}</p>
                    </div>
                    <Badge variant="success" label={`₹${r.price}`} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px] text-center bg-black/20 p-2 rounded-xl">
                    <div><span className="block text-white/40 text-[8px] uppercase">Cal</span><strong className="text-white">{r.calories}</strong></div>
                    <div><span className="block text-white/40 text-[8px] uppercase">Protein</span><strong className="text-white">{r.protein}g</strong></div>
                    <div><span className="block text-white/40 text-[8px] uppercase">Carbs</span><strong className="text-white">{r.carbs}g</strong></div>
                    <div><span className="block text-white/40 text-[8px] uppercase">Fat</span><strong className="text-white">{r.fat}g</strong></div>
                  </div>
                  <p className="text-[10px] text-[var(--foreground-muted)] leading-relaxed">{r.notes}</p>
                  <p className="text-[9px] text-emerald-400">
                    <strong>Swap:</strong> {r.healthierAlternative}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" /> Smart Dining Tips
            </h3>
            <div className="space-y-3 text-xs">
              {[
                "Order grilled instead of fried to save 200-400 kcal per meal",
                "Request sauces on the side to control hidden calories",
                "Choose salads with lean protein over creamy dressing options",
                "Avoid supersize meals — calorie density triples with large portions",
                "Drink water before dining out to reduce hunger-driven decisions",
                "Skip the bread basket if you hit your carb target earlier",
              ].map((tip, idx) => (
                <div key={idx} className="flex gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[var(--accent)] font-bold">{idx + 1}.</span>
                  <p className="text-white/70 leading-relaxed text-[10px]">{tip}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">Budget Estimate</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white">Daily Budget</span>
                <span className="font-bold text-[var(--accent)]">₹{budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Cheapest Pick</span>
                <span className="font-bold text-emerald-400">₹{restaurants[0]?.price || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Remaining</span>
                <span className="font-bold text-white">₹{(budget - (restaurants[0]?.price || 0))}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
