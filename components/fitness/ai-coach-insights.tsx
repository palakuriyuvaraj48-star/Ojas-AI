"use client";

import React from "react";
import { useCoachContext } from "@/lib/coach/storage";
import { GlassCard } from "@/components/ui/glass-card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Award,
  Activity,
  HeartPulse,
} from "lucide-react";
import { motion } from "framer-motion";

export function AICoachInsights() {
  const { insights } = useCoachContext();

  if (!insights) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin text-2xl text-[var(--accent)]">🔄</div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "progress":
        return <Activity className="h-5 w-5 text-cyan-400" />;
      case "recovery":
        return <HeartPulse className="h-5 w-5 text-emerald-400" />;
      case "weight":
        return <TrendingUp className="h-5 w-5 text-purple-400" />;
      case "strength":
        return <Award className="h-5 w-5 text-yellow-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-[var(--accent)]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left space-y-1">
        <h3 className="font-extrabold text-white text-base">Physiological Insights Engine</h3>
        <p className="text-xs text-white/50">Cross-analyzing biometric logs, sleep debt, and muscular soreness metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((ins) => {
          return (
            <GlassCard key={ins.id} className="p-5 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)] relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(ins.type)}
                    <span className="font-bold text-white text-xs capitalize">{ins.title}</span>
                  </div>

                  {/* Trend Indicator badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1 ${
                    ins.trend === "up" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : ins.trend === "down" 
                      ? "bg-rose-500/10 text-rose-400" 
                      : "bg-white/5 text-white/50"
                  }`}>
                    {ins.trend === "up" ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" /> Upward
                      </>
                    ) : ins.trend === "down" ? (
                      <>
                        <TrendingDown className="h-3.5 w-3.5" /> Downward
                      </>
                    ) : (
                      <>
                        <Minus className="h-3.5 w-3.5" /> Stable
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-white/70 leading-relaxed pt-1">
                  {ins.explanation}
                </p>
              </div>

              {/* Confidence progress bar */}
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                <span className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-white/30" /> Insights Confidence:
                </span>
                <div className="flex items-center gap-2 w-1/2">
                  <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-indigo-400 h-1 rounded-full" 
                      style={{ width: `${ins.confidence}%` }} 
                    />
                  </div>
                  <span className="font-bold text-white/60">{ins.confidence}%</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
