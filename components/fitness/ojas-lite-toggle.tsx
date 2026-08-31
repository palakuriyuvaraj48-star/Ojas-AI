"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Wifi, WifiOff, Zap, ShieldCheck } from "lucide-react";

export function OjasLiteToggle() {
  const [isLiteMode, setIsLiteMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ojas_lite_mode");
    if (saved === "true") setIsLiteMode(true);
  }, []);

  const toggleLiteMode = () => {
    const next = !isLiteMode;
    setIsLiteMode(next);
    localStorage.setItem("ojas_lite_mode", next ? "true" : "false");
  };

  return (
    <button
      onClick={toggleLiteMode}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition ${
        isLiteMode
          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
          : "bg-white/5 text-white/60 border-white/10 hover:text-white"
      }`}
      title="Ojas Lite: India-Constrained Low Data Mode"
    >
      {isLiteMode ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
      <span>Ojas Lite: {isLiteMode ? "ON" : "OFF"}</span>
    </button>
  );
}
