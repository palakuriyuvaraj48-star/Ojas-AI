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
  Languages,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, LanguageCode } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export function AICoachChat() {
  const { chatHistory, addMessage, profile, dailyLog, logsHistory } = useFitness();
  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(language || "en");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiHealth, setAiHealth] = useState<{ status: string; model: string; ollama: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (language) {
      setSelectedLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    fetch("/api/ai/health?init=true")
      .then((res) => res.json())
      .then((data) => setAiHealth(data))
      .catch(() => setAiHealth({ status: "ready", model: "gemma3:4b", ollama: false }));
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    const query = text.trim();
    addMessage(query, "user");
    setInputText("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/ojas-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          language: selectedLanguage,
          conversationHistory: chatHistory.map((m) => ({
            role: m.sender === "coach" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const reply = data.response || "I have analyzed your request.";

      if (data.actionData) {
        if (data.actionData.action === "SET_LANGUAGE" && data.actionData.languageCode) {
          setLanguage(data.actionData.languageCode as LanguageCode);
          setSelectedLanguage(data.actionData.languageCode as LanguageCode);
        } else if (data.actionData.action === "NAVIGATE" && data.actionData.route) {
          setTimeout(() => router.push(data.actionData.route), 1500);
        }
      }

      addMessage(reply, "coach");
    } catch {
      addMessage("I am temporarily unable to connect to the local Ollama agent.", "coach");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isProcessing]);

  const conversationStarters: Record<string, Array<{ label: string; text: string }>> = {
    en: [
      { label: "No time today", text: "Ojas, I only have 20 minutes today. What should I do?" },
      { label: "High fatigue", text: "My lower body is super sore from yesterday's workout." },
      { label: "Hostel protein", text: "How can I hit 100g protein on a ₹100 daily mess budget?" },
      { label: "Form tip", text: "Give me cues to prevent forward knee collapse on squats." },
    ],
    te: [
      { label: "టైమ్ లేదు", text: "ఓజస్, ఇవాళ జిమ్‌కి వెళ్లడానికి టైమ్ లేదు." },
      { label: "చాలా అలసటగా ఉంది", text: "నిన్నటి వర్కౌట్ వల్ల కాళ్ళు చాలా నొప్పులుగా ఉన్నాయి." },
      { label: "హాస్టల్ ఫుడ్", text: "హాస్టల్ మెస్‌లో తక్కువ బడ్జెట్‌లో ఎక్కువ ప్రోటీన్ ఎలా తీసుకోవాలి?" },
      { label: "వర్కౌట్ మార్చు", text: "ఈరోజు వర్కౌట్ తేలికగా చెయ్యి." },
    ],
    hi: [
      { label: "समय नहीं है", text: "ओजस, आज मेरे पास सिर्फ 20 मिनट हैं, क्या करूँ?" },
      { label: "थकान महसूस हो रही है", text: "आज काफी थकावट है, क्या भारी वर्कआउट करना चाहिए?" },
      { label: "बजट प्रोटीन", text: "₹100 के बजट में सबसे ज्यादा प्रोटीन देने वाले भारतीय फूड्स कौन से हैं?" },
      { label: "हल्का वर्कआउट", text: "आज का वर्कआउट थोड़ा आसान कर दो।" },
    ],
    ta: [
      { label: "நேரம் இல்லை", text: "இன்று எனக்கு 20 நிமிடங்கள் மட்டுமே உள்ளன." },
      { label: "அதிக சோர்வு", text: "நேற்றைய பயிற்சியால் கால் வலிக்கிறது." },
    ],
  };

  const currentStarters = conversationStarters[selectedLanguage] || conversationStarters.en;

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] min-h-[500px] overflow-hidden bg-[rgba(24,23,26,0.35)] rounded-3xl border border-white/10 relative">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/5 justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#131315]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Ojas AI Fitness Coach</h2>
            <p className="text-[10px] text-white/50 leading-none">
              Multilingual Ollama Agent • Local Tool Execution
            </p>
          </div>
        </div>

        {/* Language Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 rounded-xl p-1 border border-white/10">
          {(["en", "te", "hi", "ta"] as const).map((langCode) => (
            <button
              key={langCode}
              type="button"
              onClick={() => {
                setSelectedLanguage(langCode as LanguageCode);
                setLanguage(langCode as LanguageCode);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                selectedLanguage === langCode
                  ? "bg-[#adc6ff] text-[#131315]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {langCode === "en" ? "EN" : langCode === "te" ? "తెలుగు" : langCode === "hi" ? "हिंदी" : "தமிழ்"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8">
            <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
              🇮🇳
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-white">Ask Ojas in your natural language</h3>
              <p className="text-xs text-white/50">
                Ojas understands Indian lifestyles, hostel mess food, limited schedules, and local fitness queries.
              </p>
            </div>

            {/* Starter Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md pt-2">
              {currentStarters.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(starter.text)}
                  className="rounded-xl bg-white/5 border border-white/10 hover:border-[#adc6ff]/40 px-3 py-2 text-xs text-white/80 hover:text-white transition text-left"
                >
                  <span className="text-[10px] text-[#adc6ff] font-bold block mb-0.5">{starter.label}</span>
                  <span>"{starter.text}"</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => {
            const isCoach = msg.sender === "coach";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isCoach ? "justify-start" : "justify-end"}`}
              >
                {isCoach && (
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] flex items-center justify-center text-[#131315] shrink-0 text-xs font-bold">
                    ✨
                  </div>
                )}
                <div
                  className={`rounded-2xl p-4 max-w-[85%] text-xs leading-relaxed ${
                    isCoach
                      ? "bg-white/[0.04] border border-white/10 text-white/90"
                      : "bg-[#4d8eff] text-[#131315] font-semibold"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </motion.div>
            );
          })
        )}
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-xl bg-[#adc6ff]/20 flex items-center justify-center text-[#adc6ff] shrink-0 text-xs font-bold">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10 text-xs text-white/60">
              {t("ai_coach_thinking", "Ojas AI is consulting local tools and formulating decision...")}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t("ai_coach_placeholder", "Ask Ojas anything (e.g. modify today's workout for 20 mins)...")}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#adc6ff]/50 disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isProcessing}
            className="rounded-xl bg-[#adc6ff] hover:bg-white text-[#131315] px-4 py-2.5 text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5"
          >
            {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
