"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Bell,
  Sparkles,
  Info,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function NotificationsView() {
  const [triggers, setTriggers] = useState([
    { id: "tr1", label: "Missed Workout Push Alert", channel: "Push", active: true },
    { id: "tr2", label: "Hydration Reminder (3L+)", channel: "In-App", active: true },
    { id: "tr3", label: "CNS Recovery Drop Warning", channel: "Email", active: false },
    { id: "tr4", label: "Weekly Progress Summary", channel: "Email", active: true },
  ]);

  const deliveryData = [
    { hour: "08:00 AM", rate: 85 },
    { hour: "12:00 PM", rate: 70 },
    { hour: "06:00 PM", rate: 94 },
    { hour: "09:00 PM", rate: 60 },
  ];

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  return (
    <div className="space-y-6 text-left text-xs">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Bell className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">Intelligent Alert Suite</p>
            <h2 className="text-xl font-bold text-white">Smart Notifications</h2>
            <p className="text-xs text-white/50">Manage adaptive pushes, SMS alerts, and delivery times.</p>
          </div>
        </div>
      </GlassCard>

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3 text-xs text-left">
        {[
          { label: "Notification Open Rate", value: "84%", desc: "Avg open probability" },
          { label: "Dismiss Rate", value: "12%", desc: "Avoidance frequency" },
          { label: "AI Optimization Score", value: "92%", desc: "Time-adaptive accuracy" },
        ].map((card) => (
          <GlassCard key={card.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
            <span className="text-[10px] text-white/45 uppercase font-semibold block">{card.label}</span>
            <span className="text-xl font-black mt-1.5 block text-white">{card.value}</span>
            <span className="text-[9.5px] text-white/30 mt-1 block">{card.desc}</span>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        
        {/* Left: Toggles & Triggers */}
        <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">Alert Triggers &amp; Channels</h3>
          <div className="space-y-3">
            {triggers.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl">
                <div>
                  <span className="font-bold text-white block">{t.label}</span>
                  <span className="text-[10px] text-white/45 block mt-0.5">Channel: {t.channel}</span>
                </div>

                <button
                  onClick={() => toggleTrigger(t.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition ${
                    t.active
                      ? "bg-[#adc6ff] text-[#131315]"
                      : "border border-white/10 bg-white/5 text-white/40"
                  }`}
                >
                  {t.active ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right: AI Adaptive Delivery & Delivery Optimization Charts */}
        <div className="space-y-6">
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4 text-left">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-yellow-400" /> AI Delivery Optimization
            </h4>
            <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/70">
              💡 **Adaptive Delivery**: The AI engine has learned that you are 42% more likely to open workout reminders around **06:00 PM** (immediately after office hours). Notifications are silenced between **10:00 PM and 07:00 AM** to preserve sleep hygiene.
            </div>
          </GlassCard>

          {/* Delivery rate chart */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-left mb-4 font-black">Open Rates by Hour</h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#adc6ff" radius={[4, 4, 0, 0]} name="Open Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
