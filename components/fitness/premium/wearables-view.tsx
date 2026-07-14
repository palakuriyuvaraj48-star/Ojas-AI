"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Info,
  Calendar,
  Activity,
  Heart,
  Moon,
  Zap,
  TrendingUp,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function WearablesView() {
  const [devices, setDevices] = useState([
    { id: "whoop", name: "WHOOP Strap 4.0", connected: true, battery: 78, lastSync: "10 mins ago" },
    { id: "oura", name: "Oura Ring Gen3", connected: true, battery: 42, lastSync: "1 hour ago" },
    { id: "garmin", name: "Garmin Fenix 7", connected: false, battery: 0, lastSync: "Never" },
  ]);
  const [syncing, setSyncing] = useState(false);

  const hrvData = [
    { name: "Mon", hrv: 68, sleep: 7.2 },
    { name: "Tue", hrv: 70, sleep: 7.5 },
    { name: "Wed", hrv: 65, sleep: 6.8 },
    { name: "Thu", hrv: 72, sleep: 7.8 },
    { name: "Fri", hrv: 74, sleep: 8.2 },
    { name: "Sat", hrv: 71, sleep: 7.0 },
    { name: "Sun", hrv: 75, sleep: 8.0 },
  ];

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setDevices(prev => prev.map(d => d.connected ? { ...d, lastSync: "Just now" } : d));
    }, 1500);
  };

  const toggleConnection = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: !d.connected, lastSync: !d.connected ? "Just now" : "Never" } : d));
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <GlassCard className="p-5 bg-[rgba(24,23,26,0.35)] border-white/5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" glow>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff]">
            <Cpu className="h-6 w-6 text-[#131315]" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#adc6ff]">Wearable Integration Hub</p>
            <h2 className="text-xl font-bold text-white">Wearable Insights</h2>
            <p className="text-xs text-white/50">Sync data from WHOOP, Oura, Fitbit, and Garmin devices.</p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-xl bg-[#adc6ff] hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#131315] flex items-center gap-1.5 self-start transition"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing..." : "Sync Wearables"}
        </button>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Device Connectivity & Stats */}
        <div className="space-y-6">
          {/* Device list */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Connected Wearables</h3>
            <div className="space-y-3">
              {devices.map((d) => (
                <div key={d.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl text-xs">
                  <div>
                    <span className="font-bold text-white block">{d.name}</span>
                    {d.connected ? (
                      <span className="text-[10px] text-white/40 block mt-0.5">Battery: {d.battery}% • Synced: {d.lastSync}</span>
                    ) : (
                      <span className="text-[10px] text-white/30 block mt-0.5">Disconnected</span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleConnection(d.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition ${
                      d.connected
                        ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                        : "bg-[#adc6ff] text-[#131315] hover:brightness-110"
                    }`}
                  >
                    {d.connected ? "Disconnect" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Sync Stats */}
          <div className="grid gap-4 sm:grid-cols-3 text-xs text-left">
            {[
              { label: "Resting Heart Rate", value: "54 bpm", icon: Heart, col: "text-emerald-400" },
              { label: "HRV (Heart Rate Var)", value: "72 ms", icon: Activity, col: "text-[#adc6ff]" },
              { label: "Sleep Duration", value: "7.2 hrs", icon: Moon, col: "text-[#adc6ff]" },
            ].map((stat) => (
              <GlassCard key={stat.label} className="p-4 bg-[rgba(24,23,26,0.35)] border-white/5">
                <span className="text-[10px] text-white/45 uppercase font-semibold block">{stat.label}</span>
                <span className={`text-xl font-black mt-1.5 block ${stat.col}`}>{stat.value}</span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: AI Insights & Recharts Sleep/HRV curves */}
        <div className="space-y-6">
          {/* AI Insights */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)] space-y-3.5 text-left text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-yellow-400 animate-pulse" /> AI Wearable Insights
            </h4>
            <div className="p-3.5 bg-[#adc6ff]/5 border border-[#adc6ff]/15 rounded-2xl leading-relaxed text-white/80 space-y-1.5">
              <p>📈 **HRV increased by 14%**: Recovery index shows positive trend. CNS fatigue holds within safe margins.</p>
              <p>💤 **Sleep quality index fell slightly**: Reduced deep sleep stages logged. Reduce training volume by 10% today to maintain progressive overload bounds.</p>
            </div>
            <div className="text-[9px] text-white/30 border-t border-white/5 pt-2">
              Assumptions: Sleep average 7.2h, active calories 450 kcal. Confidence: 91%. Projections shown are estimates and not medical advice.
            </div>
          </GlassCard>

          {/* HRV & Sleep Chart */}
          <GlassCard className="p-5 border-white/5 bg-[rgba(24,23,26,0.35)]">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider text-left mb-4 font-black">7-Day Recovery Trends</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrvData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip />
                  <Line type="monotone" dataKey="hrv" stroke="#adc6ff" strokeWidth={2} name="HRV (ms)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="sleep" stroke="#fb7185" strokeWidth={1.5} name="Sleep (hrs)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
