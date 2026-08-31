"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { RecoveryDashboard } from "@/components/fitness/recovery-dashboard";
import { SleepAnalysis } from "@/components/fitness/sleep-analysis";
import { DOMSTracker } from "@/components/fitness/doms-tracker";
import { MobilitySystem } from "@/components/fitness/mobility-system";
import { StretchingPlans } from "@/components/fitness/stretching-plans";
import { RestDayPlanner } from "@/components/fitness/rest-day-planner";
import { RecoveryTimeline } from "@/components/fitness/recovery-timeline";
import { FatigueMonitoring } from "@/components/fitness/fatigue-monitoring";
import { AiRecoveryCoach } from "@/components/fitness/ai-recovery-coach";
import { RecoveryAnalytics } from "@/components/fitness/recovery-analytics";
import { RecoveryCalendar } from "@/components/fitness/recovery-calendar";
import { RecoveryHistory } from "@/components/fitness/recovery-history";
import { HydrationRecovery } from "@/components/fitness/hydration-recovery";
import { NutritionRecovery } from "@/components/fitness/nutrition-recovery";
import { RecoveryNotifications } from "@/components/fitness/recovery-notifications";
import { RecoveryDecisionEngine } from "@/components/fitness/recovery-decision-engine";
import { RecoveryBudget } from "@/components/fitness/recovery-budget";
import { RecoveryWeeklyReview } from "@/components/fitness/recovery-weekly-review";
import { GitCompareArrows, Scale, Award, Sparkles, Activity, TrendingUp, Moon, Waves, Apple, ShieldAlert, HeartPulse, AlertTriangle, BarChart, Calendar, History, Bell } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

export function RecoveryView() {
  const { profile, dailyLog, calorieTargets, macroTargets } = useFitness();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!profile || !calorieTargets || !macroTargets) return null;

  const recoveryScore = 78;
  const fatigue = 35;

  const tabs: { id: string; key?: keyof TranslationDictionary; label: string; icon: any }[] = [
    { id: "dashboard", key: "nav_recovery_dashboard", label: "Dashboard", icon: Activity },
    { id: "coach", key: "nav_ai_coach", label: "AI Coach", icon: Sparkles },
    { id: "decision", key: "dashboard_decision_engine", label: "Decision", icon: GitCompareArrows },
    { id: "budget", label: "Budget", icon: Scale },
    { id: "review", label: "Weekly", icon: Award },
    { id: "timeline", label: "Timeline", icon: TrendingUp },
    { id: "sleep", key: "nav_sleep_analysis", label: "Sleep", icon: Moon },
    { id: "hydration", key: "dashboard_priority_hydration", label: "Hydration", icon: Waves },
    { id: "nutrition", key: "nav_nutrition", label: "Nutrition", icon: Apple },
    { id: "doms", key: "nav_doms_tracker", label: "DOMS", icon: ShieldAlert },
    { id: "mobility", key: "nav_mobility", label: "Mobility", icon: Activity },
    { id: "stretching", key: "nav_stretching", label: "Stretching", icon: Activity },
    { id: "rest-day", key: "nav_rest_day", label: "Rest Day", icon: HeartPulse },
    { id: "fatigue", key: "recovery_fatigue_level", label: "Fatigue", icon: AlertTriangle },
    { id: "analytics", key: "nav_analytics", label: "Analytics", icon: BarChart },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "history", key: "nav_prs", label: "History", icon: History },
    { id: "notifications", key: "nav_smart_alerts", label: "Alerts", icon: Bell },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <RecoveryDashboard />;
      case "coach": return <AiRecoveryCoach />;
      case "decision": return <RecoveryDecisionEngine />;
      case "budget": return <RecoveryBudget />;
      case "review": return <RecoveryWeeklyReview />;
      case "timeline": return <RecoveryTimeline />;
      case "sleep": return <SleepAnalysis />;
      case "hydration": return <HydrationRecovery dailyLog={dailyLog} />;
      case "nutrition": return <NutritionRecovery dailyLog={dailyLog} macroTargets={macroTargets} />;
      case "doms": return <DOMSTracker />;
      case "mobility": return <MobilitySystem />;
      case "stretching": return <StretchingPlans />;
      case "rest-day": return <RestDayPlanner recoveryScore={recoveryScore} fatigue={fatigue} />;
      case "fatigue": return <FatigueMonitoring />;
      case "analytics": return <RecoveryAnalytics />;
      case "calendar": return <RecoveryCalendar />;
      case "history": return <RecoveryHistory />;
      case "notifications": return <RecoveryNotifications />;
      default: return <RecoveryDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-white/5 border border-transparent text-white/60 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.key ? t(tab.key, tab.label) : tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
}
