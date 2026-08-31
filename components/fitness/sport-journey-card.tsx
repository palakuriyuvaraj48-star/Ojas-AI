"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Compass,
  Dumbbell,
  Award,
  Users
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/providers/fitness-provider";
import { useTranslation } from "@/lib/i18n";
import { SPORT_REGISTRY, analyzeSportFitnessGap, SportAttributeKey } from "@/lib/sports";
import Link from "next/link";

export function SportJourneyCard() {
  const { profile } = useFitness();
  const { t } = useTranslation();

  const userMode = profile?.userMode || "sport-transition";
  const selectedSportId = profile?.selectedSport || "football";
  const sportLevel = profile?.sportLevel || "foundation";

  const sportConfig = SPORT_REGISTRY[selectedSportId] || SPORT_REGISTRY["football"];

  // User's baseline attributes
  const currentAttributes: Record<SportAttributeKey, number> = useMemo(() => ({
    agility: profile?.sportAttributes?.agility ?? 48,
    acceleration: profile?.sportAttributes?.acceleration ?? 58,
    endurance: profile?.sportAttributes?.endurance ?? 72,
    lower_body_power: profile?.sportAttributes?.lower_body_power ?? 63,
    upper_body_strength: profile?.sportAttributes?.upper_body_strength ?? 58,
    core_stability: profile?.sportAttributes?.core_stability ?? 62,
    mobility: profile?.sportAttributes?.mobility ?? 81,
    reaction_time: profile?.sportAttributes?.reaction_time ?? 68,
    rotational_power: profile?.sportAttributes?.rotational_power ?? 54,
    repeated_effort: profile?.sportAttributes?.repeated_effort ?? 64,
  }), [profile?.sportAttributes]);

  const baselineAttributes: Record<SportAttributeKey, number> = useMemo(() => ({
    agility: profile?.sportBaselines?.agility ?? 48,
    acceleration: profile?.sportBaselines?.acceleration ?? 55,
    endurance: profile?.sportBaselines?.endurance ?? 68,
    lower_body_power: profile?.sportBaselines?.lower_body_power ?? 60,
    upper_body_strength: profile?.sportBaselines?.upper_body_strength ?? 55,
    core_stability: profile?.sportBaselines?.core_stability ?? 58,
    mobility: profile?.sportBaselines?.mobility ?? 78,
    reaction_time: profile?.sportBaselines?.reaction_time ?? 65,
    rotational_power: profile?.sportBaselines?.rotational_power ?? 50,
    repeated_effort: profile?.sportBaselines?.repeated_effort ?? 60,
  }), [profile?.sportBaselines]);

  const gapAnalysis = useMemo(() => {
    return analyzeSportFitnessGap(selectedSportId, sportLevel, currentAttributes, baselineAttributes);
  }, [selectedSportId, sportLevel, currentAttributes, baselineAttributes]);

  return (
    <GlassCard className="p-6 border-white/15 bg-gradient-to-r from-blue-950/40 via-[#181a20] to-[#121316] shadow-xl relative overflow-hidden text-left">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {t("sports_title", "Sports & Performance")}
            </span>
            <span className="text-white/40 text-xs">Student → Sport Transition → Athlete Progression</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {userMode === "general-fitness" ? (
              <>Want to start or improve in a sport?</>
            ) : (
              <>{sportConfig.icon} {sportConfig.name} Performance & Preparation</>
            )}
          </h3>
          <p className="text-xs text-white/60">
            Identify your fitness gaps, train for your sport, and let Ojas adapt your journey continuously.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start shrink-0">
          <Link href="/sports">
            <Button size="sm" className="bg-[#adc6ff] text-[#131315] font-bold text-xs hover:brightness-110 flex items-center gap-1">
              Open Sports & Performance <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Dynamic Content based on User Mode */}
      {userMode === "general-fitness" ? (
        <div className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Current Goal</span>
              <strong className="text-white font-bold text-sm block">Improve Overall Fitness</strong>
              <span className="text-white/60">Base conditioning & recomposition</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Fitness Level</span>
              <strong className="text-cyan-300 font-bold text-sm block capitalize">{sportLevel}</strong>
              <span className="text-white/60">Consistent movement foundation</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Next Priority</span>
              <strong className="text-amber-300 font-bold text-sm block">Compound Strength & Mobility</strong>
              <span className="text-white/60">Ready to bridge into sport</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-white/70">
              Supported sports: <strong>Cricket, Football, Badminton, Basketball, Volleyball, Hockey, Kabaddi, Athletics</strong>.
            </span>
            <div className="flex gap-2 shrink-0">
              <Link href="/sports">
                <Button size="sm" className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300">
                  <Target className="h-3.5 w-3.5 mr-1" /> Choose a Sport to Start
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 space-y-4">
          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Active Sport</span>
              <strong className="text-white font-bold text-sm block">{sportConfig.icon} {sportConfig.name}</strong>
              <span className="text-white/60 capitalize">Level: {sportLevel}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] text-white/50 uppercase font-bold block">Preparation Index</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-400 font-mono">{gapAnalysis.readinessScore}%</span>
                <span className="text-[10px] text-emerald-300">Ready</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${gapAnalysis.readinessScore}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">🎯 Primary Gap</span>
              <strong className="text-white font-bold text-xs block">{gapAnalysis.primaryDevelopmentArea.name}</strong>
              <span className="text-amber-200 text-[11px] font-mono">-{gapAnalysis.primaryDevelopmentArea.gap} pts from target</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/30 space-y-1">
              <span className="text-[10px] text-blue-300 uppercase font-bold block">⚡ Next Training Focus</span>
              <strong className="text-white font-bold text-xs block">{sportConfig.signatureDrills[0]?.name || "Agility Shuttles"}</strong>
              <span className="text-blue-200 text-[11px]">Signature Sport Drill</span>
            </div>
          </div>

          <div className="rounded-xl bg-black/30 border border-white/5 p-3 flex items-start gap-2.5 text-xs text-white/80">
            <Sparkles className="h-4 w-4 text-[#adc6ff] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">Why this workout? </strong>
              <span>&quot;{gapAnalysis.primaryDevelopmentArea.name} is currently your largest development gap for {sportConfig.name}. Ojas prioritized signature drills to bridge this gap.&quot;</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-white/50">
              Personal Baseline: <strong className="text-white font-mono">+{currentAttributes.agility - baselineAttributes.agility} pts</strong> improvement logged.
            </span>
            <div className="flex gap-2">
              <Link href="/workout">
                <Button size="sm" className="bg-amber-400 text-black font-bold text-xs hover:bg-amber-300">
                  <Dumbbell className="h-3.5 w-3.5 mr-1" /> Start {sportConfig.name} Workout
                </Button>
              </Link>
              <Link href="/sports">
                <Button size="sm" variant="outline" className="border-white/10 text-white/80 font-bold text-xs hover:bg-white/5">
                  Analyze All Gaps <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
