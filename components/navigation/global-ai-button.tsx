"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Mic } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OjasVoiceAssistant } from "@/components/voice/ojas-voice-assistant";
import { useTranslation } from "@/lib/i18n";

export function GlobalAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const { language, t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ojas-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          language,
        }),
      });
      const data = await res.json();
      setAiResponse(data.response || "Ojas has processed your request.");
    } catch {
      setAiResponse("Could not connect to Ojas Agent right now.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 lg:bottom-8 lg:right-8">
        {/* Voice Assistant Mic Trigger */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setVoiceOpen(true)}
          aria-label="Open Ojas Voice Assistant"
          className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center text-black"
          title="Ojas Voice Assistant (Indian Languages)"
        >
          <Mic className="h-5 w-5" />
        </motion.button>

        {/* Global AI Text Modal Trigger */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          aria-label="Open Ojas AI Coach"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] shadow-xl shadow-blue-500/20 flex items-center justify-center text-black"
          title="Ojas AI Coach"
        >
          <Sparkles className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Voice Assistant Modal */}
      <OjasVoiceAssistant
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
      />

      {/* Text AI Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-24 right-4 left-4 z-50 lg:bottom-8 lg:right-8 lg:left-auto lg:w-[420px]"
            >
              <GlassCard className="p-6 bg-[#14151a]/95 border-white/15 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-black flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">Ojas AI Assistant</h3>
                      <p className="text-xs text-white/50">Local Ollama • Multilingual Agent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setVoiceOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 text-emerald-300 hover:bg-white/20 transition"
                      title="Switch to Voice"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4 text-white/60" />
                    </Button>
                  </div>
                </div>

                {aiResponse && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#4d8eff]/10 border border-[#4d8eff]/20 text-xs text-white/90 leading-relaxed max-h-40 overflow-y-auto">
                    <span className="text-[10px] text-[#adc6ff] font-bold block mb-1">Ojas AI Reply:</span>
                    {aiResponse}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about workouts, hostel food, budget..."
                    className="min-h-[80px] resize-none text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] text-black font-bold text-xs rounded-xl"
                      disabled={!query.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ask Ojas
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-wider">Quick Suggestions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "What workout today?",
                      "How is my recovery?",
                      "Hostel mess protein tips",
                      "వర్కౌట్ తేలికగా చేయి",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setQuery(suggestion)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
