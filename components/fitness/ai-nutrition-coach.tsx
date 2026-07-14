"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Sparkles } from "lucide-react";

export function AiNutritionCoach() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [coachTyping, setCoachTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || chatMessage;
    if (!msg.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", text: msg }]);
    if (!textToSend) setChatMessage("");
    setCoachTyping(true);

    fetch("/api/nutrition/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCoachTyping(false);
        setChatHistory((prev) => [...prev, { role: "coach", text: data.reply }]);
      })
      .catch(() => setCoachTyping(false));
  };

  return (
    <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4 text-[var(--accent)]" /> AI Dietitian Coach
        </h3>
        <span className="text-[9px] text-[#adc6ff] bg-[#adc6ff]/10 px-2.5 py-0.5 rounded font-black uppercase">Coach Vikram Active</span>
      </div>

      <div className="h-64 rounded-2xl bg-black/30 border border-white/5 p-4 overflow-y-auto space-y-3 font-sans text-xs" role="log" aria-live="polite">
        {chatHistory.map((item, idx) => (
          <div key={idx} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${item.role === "user" ? "bg-[var(--accent-glow)] text-white border border-[var(--accent)]/20" : "bg-white/5 text-white/80 border border-white/5"}`}>
              {item.text}
            </div>
          </div>
        ))}
        {coachTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-[var(--accent)] rounded-2xl px-3 py-2 animate-pulse">Coach is typing...</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Post-leg day meal?", text: "What should I eat after leg day?" },
          { label: "Only eggs & rice?", text: "I have only eggs and rice." },
          { label: "₹300 weekly plan?", text: "Create a ₹300 weekly meal plan." },
          { label: "High-protein veg?", text: "Suggest high-protein vegetarian meals." },
          { label: "Can I eat pizza?", text: "Can I eat pizza today?" },
          { label: "I have ₹200 left", text: "Can I eat pizza today?" },
          { label: "What should I eat?", text: "What should I eat?" },
          { label: "Meal prep tips?", text: "Meal prep tips for busy week?" },
        ].map((q, idx) => (
          <button key={idx} onClick={() => handleSendMessage(q.text)} className="rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 p-2 text-center text-[9px] font-bold text-white/80 transition">
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input type="text" placeholder="Ask coach about macro adjustments..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} className="bg-black/20 border-white/10 text-xs" />
        <Button onClick={() => handleSendMessage()} variant="premium" className="text-xs px-4">
          Send
        </Button>
      </div>
    </GlassCard>
  );
}
