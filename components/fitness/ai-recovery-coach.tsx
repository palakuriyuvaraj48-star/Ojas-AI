"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, UtensilsCrossed } from "lucide-react";
import { useRecovery } from "@/lib/recovery/use-recovery";
import { recoveryCoachReply } from "@/lib/recovery";

export function AiRecoveryCoach() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [typing, setTyping] = useState(false);
  const { loading, result, signals, fatigue } = useRecovery();

  const send = (text?: string) => {
    const msg = text || message;
    if (!msg.trim()) return;
    setHistory((p) => [...p, { role: "user", text: msg }]);
    if (!text) setMessage("");
    setTyping(true);

    const reply = !loading && result && signals && fatigue
      ? recoveryCoachReply(msg, { result, signals, fatigue })
      : null;

    if (reply) {
      setTimeout(() => {
        setTyping(false);
        setHistory((p) => [...p, { role: "coach", text: reply }]);
      }, 600);
      return;
    }

    fetch("/api/recovery/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTyping(false);
        setHistory((p) => [...p, { role: "coach", text: data.reply }]);
      })
      .catch(() => setTyping(false));
  };

  return (
    <GlassCard className="p-5 space-y-4 border-[var(--border-subtle)]">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-[var(--accent)]" /> AI Recovery Coach
        </h3>
        <span className="text-[9px] text-[#adc6ff] bg-[#adc6ff]/10 px-2.5 py-0.5 rounded font-black uppercase">Coach Active</span>
      </div>

      <div className="h-64 rounded-2xl bg-black/30 border border-white/5 p-4 overflow-y-auto space-y-3 font-sans text-xs">
        {history.map((item, idx) => (
          <div key={idx} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${item.role === "user" ? "bg-[var(--accent-glow)] text-white border border-[var(--accent)]/20" : "bg-white/5 text-white/80 border border-white/5"}`}>
              {item.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-[var(--accent)] rounded-2xl px-3 py-2 animate-pulse">Coach is typing...</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Should I train today?", text: "Should I train today?" },
          { label: "Why is recovery low?", text: "Why is my recovery low?" },
          { label: "Can I do legs today?", text: "Can I do legs today?" },
          { label: "What should I do instead?", text: "What should I do instead?" },
        ].map((q, idx) => (
          <button key={idx} onClick={() => send(q.text)} className="rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 p-2 text-center text-[9px] font-bold text-white/80 transition">
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input type="text" placeholder="Ask about recovery, sleep, fatigue..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="bg-black/20 border-white/10 text-xs" />
        <Button onClick={() => send()} variant="premium" className="text-xs px-4">Send</Button>
      </div>
    </GlassCard>
  );
}
