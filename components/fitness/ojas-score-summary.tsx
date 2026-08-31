"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Activity, Apple, MoonStar, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface OjasScoreSummaryProps {
  movementScore?: number;
  nutritionScore?: number;
  recoveryScore?: number;
  consistencyScore?: number;
  onNavigate?: (tab: string) => void;
}

export function OjasScoreSummary({
  movementScore = 92,
  nutritionScore = 84,
  recoveryScore = 79,
  consistencyScore = 94,
  onNavigate,
}: OjasScoreSummaryProps) {
  const { t } = useTranslation();

  // Composite Ojas Score (weighted average)
  const ojasScore = Math.round(
    movementScore * 0.25 +
    nutritionScore * 0.25 +
    recoveryScore * 0.30 +
    consistencyScore * 0.20
  );

  // Identify weakest pillar (biggest opportunity)
  const pillars = [
    { name: t("dashboard_movement", "Movement"), score: movementScore, key: "movement", href: "/workout" },
    { name: t("dashboard_nutrition", "Nutrition"), score: nutritionScore, key: "nutrition", href: "/food" },
    { name: t("dashboard_recovery", "Recovery"), score: recoveryScore, key: "recovery", href: "/recovery" },
    { name: t("dashboard_consistency", "Consistency"), score: consistencyScore, key: "consistency", href: "/progress" },
  ];

  const weakest = [...pillars].sort((a, b) => a.score - b.score)[0];

  const getOpportunityRecommendation = (key: string) => {
    switch (key) {
      case "recovery":
        return t("recovery_sleep_target", "Prioritize 7.5h sleep tonight and reduce heavy loading tomorrow.");
      case "nutrition":
        return t("nutrition_protein_target", "Boost daily protein pacing by adding 2 boiled eggs or soya chunks at mess/lunch.");
      case "movement":
        return t("workout_title", "Complete today's scheduled session to maintain neuromuscular adaptations.");
      case "consistency":
        return t("progress_consistency", "Keep workout streaks unbroken by doing at least a 15-minute quick session.");
      default:
        return t("dashboard_what_to_do_today", "Maintain your balanced routine and stay hydrated.");
    }
  };

  return (
    <GlassCard className="p-5 border-white/15 bg-gradient-to-b from-[#181a20] to-[#121316] shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Big Ojas Score */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative">
            <ProgressRing
              progress={ojasScore}
              size={96}
              strokeWidth={8}
              color="#4d8eff"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white">{ojasScore}</span>
              <span className="text-[10px] text-white/50 uppercase font-bold">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#adc6ff] flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Unified Index
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">{t("dashboard_ojas_score", "OJAS SCORE")}</h3>
            <p className="text-xs text-white/60">Holistic state across 4 vital pillars</p>
          </div>
        </div>

        {/* Middle: 4 Pillar Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto flex-1">
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-1">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <span>{t("dashboard_movement", "Movement")}</span>
            </div>
            <div className="text-lg font-bold text-white">{movementScore}</div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-1">
              <Apple className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t("dashboard_nutrition", "Nutrition")}</span>
            </div>
            <div className="text-lg font-bold text-white">{nutritionScore}</div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-1">
              <MoonStar className="h-3.5 w-3.5 text-indigo-400" />
              <span>{t("dashboard_recovery", "Recovery")}</span>
            </div>
            <div className="text-lg font-bold text-white">{recoveryScore}</div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
              <span>{t("dashboard_consistency", "Consistency")}</span>
            </div>
            <div className="text-lg font-bold text-white">{consistencyScore}</div>
          </div>
        </div>

        {/* Right: Weakest Pillar Action */}
        <div 
          onClick={() => onNavigate?.(weakest.href)}
          className="rounded-xl bg-[#adc6ff]/10 border border-[#adc6ff]/20 p-3.5 w-full md:w-64 cursor-pointer hover:bg-[#adc6ff]/15 transition group"
        >
          <div className="flex items-center justify-between text-[11px] font-bold text-[#adc6ff] mb-1">
            <span>{t("dashboard_biggest_opportunity", "BIGGEST OPPORTUNITY")}</span>
            <span className="capitalize">{weakest.name} ({weakest.score}/100)</span>
          </div>
          <p className="text-xs text-white/80 line-clamp-2">
            {getOpportunityRecommendation(weakest.key)}
          </p>
          <div className="mt-2 text-[10px] text-[#adc6ff] font-medium flex items-center gap-1 group-hover:underline">
            {t("common_view_details", "Take Action")} <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
