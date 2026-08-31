"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFitness } from "@/components/providers/fitness-provider";
import { AICoachHome } from "./ai-coach-home";
import { AICoachChat } from "./ai-coach-chat";
import { AICoachVoice } from "./ai-coach-voice";
import { AICoachPlans } from "./ai-coach-plans";
import { AICoachInsights } from "./ai-coach-insights";
import { AICoachMemory } from "./ai-coach-memory";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Home,
  MessageSquare,
  Mic,
  Calendar,
  TrendingUp,
  Brain,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { TranslationDictionary } from "@/lib/i18n/types";

interface CoachChatProps {
  initialTab?: string;
}

export function CoachChat({ initialTab }: CoachChatProps) {
  const { profile } = useFitness();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(initialTab || tabParam || "home");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [initialTab, tabParam]);

  if (!profile) return null;

  const tabs: { id: string; key?: keyof TranslationDictionary; label: string; icon: any }[] = [
    { id: "home", key: "ai_coach_title", label: "Coach Home", icon: Home },
    { id: "chat", key: "ai_coach_placeholder", label: "AI Chat", icon: MessageSquare },
    { id: "voice", key: "nav_voice_assistant", label: "Voice Companion", icon: Mic },
    { id: "plans", label: "Plans & Reviews", icon: Calendar },
    { id: "insights", key: "nav_analytics", label: "Insights", icon: TrendingUp },
    { id: "memory", label: "Memory Vault", icon: Brain },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <AICoachHome setActiveTab={setActiveTab} />;
      case "chat":
        return <AICoachChat />;
      case "voice":
        return <AICoachVoice />;
      case "plans":
        return <AICoachPlans />;
      case "insights":
        return <AICoachInsights />;
      case "memory":
        return <AICoachMemory />;
      default:
        return <AICoachHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Header */}
      <GlassCard className="p-3 border-white/5 bg-[rgba(24,23,26,0.35)] overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-[620px] md:min-w-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = tab.key ? t(tab.key, tab.label) : tab.label;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#adc6ff] text-[#131315] font-bold shadow-md shadow-blue-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Render Active View */}
      {renderActiveTab()}
    </div>
  );
}
