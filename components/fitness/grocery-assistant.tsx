"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CheckCircle2 } from "lucide-react";

export function GroceryAssistant() {
  const [groceryList, setGroceryList] = useState<any[]>([]);
  const [checkedGroceries, setCheckedGroceries] = useState<{ [key: string]: boolean }>({});
  const [budget, setBudget] = useState(300);

  useEffect(() => {
    fetch(`/api/nutrition/grocery?target=muscle-gain`)
      .then((res) => res.json())
      .then(setGroceryList)
      .catch(() => setGroceryList([]));
  }, []);

  const toggleGroceryCheck = (itemName: string) => {
    setCheckedGroceries((prev) => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-yellow-400" /> Smart Grocery Checklist
        </h3>

        <div className="space-y-4 text-xs">
          {groceryList.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-bold text-[#adc6ff] uppercase text-[10px] tracking-wider">{cat.category}</h4>
              <div className="space-y-1.5">
                {cat.items.map((item: any, idy: number) => {
                  const isChecked = checkedGroceries[item.name] || false;
                  return (
                    <div key={idy} onClick={() => toggleGroceryCheck(item.name)} className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isChecked} onChange={() => { }} className="rounded border-white/20 bg-black/20 text-[var(--accent)]" />
                        <span className={`text-white font-medium ${isChecked ? "line-through text-white/30" : ""}`}>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[var(--accent)]">₹{item.price}</span>
                        {isChecked && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm">Budget Grocery Substitutions</h3>
        <p className="text-[10px] text-[var(--foreground-muted)]">AI-identified alternatives to optimize weekly diet economy.</p>
        <div className="space-y-3 text-xs">
          {groceryList.map((cat) =>
            cat.items.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-rose-300 font-mono text-[10px]">₹{item.price}</span>
                </div>
                <p className="text-[10px] text-emerald-400">
                  💡 Swap Alternative: <strong>{item.alternative}</strong> (saves approx 30%)
                </p>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
