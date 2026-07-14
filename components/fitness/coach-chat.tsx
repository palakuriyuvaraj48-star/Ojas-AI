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
  Sparkles,
  Home,
  MessageSquare,
  Mic,
  Calendar,
  TrendingUp,
  Brain,
} from "lucide-react";

interface CoachChatProps {
  initialTab?: string;
}

export function CoachChat({ initialTab }: CoachChatProps) {
  const { profile } = useFitness();
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

  const tabs = [
    { id: "home", label: "Coach Home", icon: Home },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "voice", label: "Voice Companion", icon: Mic },
    { id: "plans", label: "Plans & Reviews", icon: Calendar },
    { id: "insights", label: "Insights", icon: TrendingUp },
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
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#adc6ff]/15 text-[#adc6ff] border border-white/10"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#adc6ff]" : "text-white/40"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Primary Tab View */}
      <div className="transition-all duration-300">
        {renderActiveTab()}
      </div>
    </div>
  );
}
