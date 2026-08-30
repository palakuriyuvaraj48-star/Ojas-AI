"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Send,
  ShieldAlert,
  Award,
  Clock,
  CheckCircle2,
  Info,
  Mic,
  Lightbulb,
  ArrowUpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AICoachChat() {
  const { chatHistory, addMessage } = useFitness();
  const [inputText, setInputText] = useState("");
  const [aiHealth, setAiHealth] = useState<{ status: string; model: string; ollama: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/health?init=true")
      .then((res) => res.json())
      .then((data) => setAiHealth(data))
      .catch(() => setAiHealth({ status: "unavailable", model: "gemma3:4b", ollama: false }));
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    addMessage(text, "user");
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend(inputText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const conversationStarters = [
    { label: "Build my workout", text: "Build my workout split for today" },
    { label: "Generate my meals", text: "Generate my meals according to my goals" },
    { label: "Explain my recovery", text: "Explain my recovery score and readiness" },
    { label: "Plan my week", text: "Plan my training and recovery week" },
    { label: "How am I doing?", text: "How am I doing? Give me a progress report" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] min-h-[500px] overflow-hidden bg-[rgba(24,23,26,0.35)] rounded-3xl border border-white/5 relative">
      
      {/* Visual Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/5 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#131315]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Elite AI Fitness Coach</h2>
            <p className="text-[10px] text-white/50 leading-none">
              {aiHealth?.ollama && aiHealth?.status === "ready"
                ? `Powered by Ollama (${aiHealth.model}) Local LLM`
                : "Context-Aware Sports Science & Nutrition Engine"}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
            aiHealth?.ollama && aiHealth?.status === "ready"
              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              : aiHealth?.status === "model_missing"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
              : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              aiHealth?.ollama && aiHealth?.status === "ready"
                ? "bg-emerald-400 animate-pulse"
                : aiHealth?.status === "model_missing"
                ? "bg-amber-400"
                : "bg-cyan-400"
            }`}
          />
          {aiHealth?.ollama && aiHealth?.status === "ready"
            ? `⚡ ${aiHealth.model} Ready`
            : aiHealth?.status === "model_missing"
            ? "⚠️ Model Missing"
            : "🛡️ Sports Science Engine"}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg, index) => {
            const isCoach = msg.sender === "coach";
            const isThinking = msg.text === "Thinking...";
            const hasRec = msg.recommendation;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
              >
                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                      isCoach
                        ? isThinking 
                          ? "bg-white/5 border border-white/5 text-white/30 italic animate-pulse"
                          : "bg-white/5 border border-white/10 text-white/90"
                        : "bg-[#adc6ff] text-[#131315] font-bold"
                    }`}
                  >
                    {isThinking ? (
                      <span className="flex items-center gap-1.5">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce [animation-delay:0.2s]">●</span>
                        <span className="animate-bounce [animation-delay:0.4s]">●</span>
                        Thinking...
                      </span>
                    ) : (
                      msg.text
                    )}
                    
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        isCoach ? "text-white/30" : "text-[#131315]/50"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Safety Alert (Medical Warnings) */}
                  {isCoach && msg.safety && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-[10.5px] text-yellow-300/80 flex items-start gap-2 max-w-lg"
                    >
                      <ShieldAlert className="h-4 w-4 shrink-0 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-yellow-200 uppercase tracking-wider text-[9px]">ACSM Safety Protocol Active</p>
                        <p className="mt-0.5">
                          I have flagged a potential orthopedic or medical concern. I recommend rest and consultation with a physiotherapist or clinician. Do not push through joint instability or sharp/radiating pain.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Recommendation Card */}
                  {isCoach && hasRec && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/20 bg-[rgba(167,139,250,0.04)] p-4 max-w-lg space-y-3"
                    >
                      <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--accent)]/5 rounded-full blur-2xl" />
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] bg-[var(--accent-glow)] text-[var(--accent)] px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                          <Award className="h-3 w-3" /> {msg.recommendation.category} Recommendation
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          msg.recommendation.priority === "critical" ? "bg-rose-500/20 text-rose-300 animate-pulse" : "bg-white/5 text-white/50"
                        }`}>
                          {msg.recommendation.priority} priority
                        </span>
                      </div>
                      <h4 className="font-extrabold text-white text-xs">{msg.recommendation.title}</h4>
                      
                      <div className="grid grid-cols-2 gap-2.5 text-[10px] text-white/50 pt-1">
                        <p><strong className="text-white/60 font-semibold block uppercase text-[8px]">Why:</strong> {msg.recommendation.why}</p>
                        <p><strong className="text-white/60 font-semibold block uppercase text-[8px]">Benefit:</strong> {msg.recommendation.expectedBenefit}</p>
                        <p><strong className="text-white/60 font-semibold block uppercase text-[8px]">Effort:</strong> {msg.recommendation.estimatedEffort}</p>
                        <p><strong className="text-white/60 font-semibold block uppercase text-[8px]">Alternative:</strong> {msg.recommendation.alternative}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 text-[10px] border-t border-white/5">
                        <span className="text-white/40">Confidence Score:</span>
                        <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-400 h-1.5 rounded-full" 
                            style={{ width: `${msg.recommendation.confidence}%` }} 
                          />
                        </div>
                        <span className="text-indigo-300 font-bold">{msg.recommendation.confidence}%</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters Panel */}
      <div className="p-3 border-t border-white/5 bg-black/10 flex flex-wrap gap-2">
        {conversationStarters.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s.text)}
            className="text-[10px] font-semibold rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/5 bg-white/5 flex gap-2 items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Coach anything (e.g. 'I'm tired', 'My knee hurts', 'Suggest grocery items')..."
          className="flex-1 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-xs text-white placeholder-white/30 focus:border-[#adc6ff] focus:outline-none transition"
        />
        <button
          onClick={() => handleSend(inputText)}
          className="rounded-2xl bg-[#adc6ff] p-3 text-[#131315] hover:brightness-110 transition shrink-0"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </div>

    </div>
  );
}
