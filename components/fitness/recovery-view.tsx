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
import { GitCompareArrows, Scale, Award, Sparkles } from "lucide-react";

export function RecoveryView() {
  const { profile, dailyLog, calorieTargets, macroTargets } = useFitness();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!profile || !calorieTargets || !macroTargets) return null;

  const recoveryScore = 78;
  const fatigue = 35;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "coach", label: "AI Coach", icon: Sparkles },
    { id: "decision", label: "Decision", icon: GitCompareArrows },
    { id: "budget", label: "Budget", icon: Scale },
    { id: "review", label: "Weekly", icon: Award },
    { id: "timeline", label: "Timeline", icon: TrendingUp },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "hydration", label: "Hydration", icon: Waves },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "doms", label: "DOMS", icon: ShieldAlert },
    { id: "mobility", label: "Mobility", icon: Activity },
    { id: "stretching", label: "Stretching", icon: Activity },
    { id: "rest-day", label: "Rest Day", icon: HeartPulse },
    { id: "fatigue", label: "Fatigue", icon: AlertTriangle },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "history", label: "History", icon: History },
    { id: "notifications", label: "Alerts", icon: Bell },
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Moon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldAlert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.23l7.65-7.65.78-.77a5.4 5.4 0 0 0 0-7.63z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <line x1="12" y1="20" x2="12" y2="10" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="18" y1="20" x2="18" y2="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="6" y1="20" x2="6" y2="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function History(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Waves(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 6 9 6c1.2 0 1.8.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2s2.5 2 5 2c1.2 0 1.8-.5 2.5-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2c2.5 0 2.5-2 5-2s2.5 2 5 2c1.2 0 1.8-.5 2.5-1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2c2.5 0 2.5-2 5-2s2.5 2 5 2c1.2 0 1.8-.5 2.5-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Apple(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20.94c1.5 0 2.75-.55 3.5-1.5 1.25-1.5 2.75-1.5 3.5-1.5.35 0 .65.05.95.15-.25-1.15-.75-2.15-1.5-3-.75-.85-1.95-1.45-3.25-1.5-.35-1.15-1.05-2.15-2-2.85-.95-.7-2.05-1.05-3.25-1.05-1.2 0-2.3.35-3.25 1.05-.95.7-1.65 1.7-2 2.85-1.3.05-2.5.65-3.25 1.5-.75.85-1.25 1.85-1.5 3 .3-.1.6-.15.95-.15.75 0 2.25 0 3.5 1.5.75.95 2 1.5 3.5 1.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
