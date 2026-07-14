"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

export function RecipeMaker() {
  const [pantryIngredients, setPantryIngredients] = useState("");
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  const handleGenerateRecipes = () => {
    setIsGeneratingRecipes(true);
    fetch(`/api/nutrition/recipes?ingredients=${pantryIngredients}`)
      .then((res) => res.json())
      .then((data) => {
        setGeneratedRecipes(data);
        setIsGeneratingRecipes(false);
      })
      .catch(() => setIsGeneratingRecipes(false));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <GlassCard className="p-5 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--accent)]" /> Pantry Ingredients
        </h3>
        <p className="text-[10px] text-[var(--foreground-muted)]">Enter available foods in your kitchen (comma separated).</p>
        <div className="space-y-3 text-xs">
          <Input type="text" placeholder="e.g. eggs, rice, yogurt" value={pantryIngredients} onChange={(e) => setPantryIngredients(e.target.value)} className="bg-black/20 border-white/10" />
          <Button onClick={handleGenerateRecipes} disabled={isGeneratingRecipes} variant="premium" className="w-full text-xs py-2 justify-center">
            {isGeneratingRecipes ? "Compiling recipes..." : "Generate AI Recipes"}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4">
        {generatedRecipes.length > 0 ? (
          <div className="space-y-4">
            {generatedRecipes.map((rec: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="space-y-3 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                    <p className="text-[10px] text-[var(--foreground-muted)]">Cooking Time: {rec.time} • {rec.difficulty || "Medium"} • Serves {rec.servings || 2}</p>
                  </div>
                  <Badge variant="primary" label={`${rec.cal} kcal`} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-black/20 p-2 rounded-xl border border-white/5">
                  <div>Protein: <strong className="text-white block mt-0.5">{rec.p}g</strong></div>
                  <div>Carbs: <strong className="text-white block mt-0.5">{rec.c}g</strong></div>
                  <div>Fat: <strong className="text-white block mt-0.5">{rec.f}g</strong></div>
                </div>
                <div className="text-[10px] text-white/70 space-y-1">
                  <strong>Cooking Directions:</strong>
                  <ul className="list-decimal pl-4 space-y-0.5 mt-0.5">
                    {rec.instructions.map((inst: string, idy: number) => <li key={idy}>{inst}</li>)}
                  </ul>
                </div>
                <p className="text-[9px] text-[var(--accent)] font-medium">
                  Substitution: {rec.substitution}
                </p>
                {rec.cuisine && <Badge variant="neutral" label={rec.cuisine} />}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
            <BookOpen className="h-10 w-10 text-white/20 animate-pulse" />
            <p className="text-xs text-[var(--foreground-muted)]">Enter ingredients at home and compile recipes.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
