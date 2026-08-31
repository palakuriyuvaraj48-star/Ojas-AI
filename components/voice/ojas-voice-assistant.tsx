"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  X,
  ChevronRight,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Globe
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useTranslation, LanguageCode } from "@/lib/i18n";
import { SpeechRecognitionService } from "@/lib/voice/speech-recognition";
import { TextToSpeechService } from "@/lib/voice/text-to-speech";
import { useFitness } from "@/components/providers/fitness-provider";
import { useRouter } from "next/navigation";

type VoiceState = "idle" | "listening" | "processing" | "acting" | "speaking" | "error";

interface MessageItem {
  id: string;
  sender: "user" | "ojas";
  text: string;
  toolUsed?: string;
  timestamp: string;
}

export function OjasVoiceAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language, setLanguage, t, currentLanguageMeta } = useTranslation();
  const { profile } = useFitness();
  const router = useRouter();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      sender: "ojas",
      text:
        language === "te"
          ? "నమస్కారం! నేను మీ ఓజస్ వాయిస్ అసిస్టెంట్. ఈరోజు వర్కౌట్ లేదా రికవరీ గురించి అడగండి."
          : language === "hi"
          ? "नमस्ते! मैं आपका ओजस वॉइस असिस्टेंट हूँ। आज के वर्कआउट या रिकवरी के बारे में पूछें।"
          : "Hello! I am your Ojas Voice Assistant. Tap the mic and ask about your workout, recovery, or mess food.",
      timestamp: "Just now",
    },
  ]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showTranscriptHistory, setShowTranscriptHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const speechRecRef = useRef<SpeechRecognitionService | null>(null);
  const ttsRef = useRef<TextToSpeechService | null>(null);

  // Handle User Speech processing via /api/ojas-agent
  const handleUserSpeech = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    speechRecRef.current?.stop();
    setTranscript(queryText);
    setVoiceState("processing");

    const userMsg: MessageItem = {
      id: String(Date.now()),
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ojas-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          language,
          conversationHistory: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      const ojasReply = data.response || "I have processed your request.";
      const toolUsed = data.toolCallsExecuted?.[0]?.tool;

      if (data.actionData) {
        setVoiceState("acting");
        // Safe actions
        if (data.actionData.action === "SET_LANGUAGE" && data.actionData.languageCode) {
          setLanguage(data.actionData.languageCode as LanguageCode);
        } else if (data.actionData.action === "NAVIGATE" && data.actionData.route) {
          setTimeout(() => router.push(data.actionData.route), 1200);
        }
      }

      const ojasMsg: MessageItem = {
        id: String(Date.now() + 1),
        sender: "ojas",
        text: ojasReply,
        toolUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, ojasMsg]);

      // Speak response in user language if enabled
      if (ttsEnabled && ttsRef.current) {
        setVoiceState("speaking");
        ttsRef.current.speak(ojasReply, data.responseLanguage || language);
      } else {
        setVoiceState("idle");
      }
    } catch {
      setVoiceState("error");
      setErrorMessage("Network error calling Ojas AI.");
    }
  }, [language, messages, router, setLanguage, ttsEnabled]);

  // Initialize Voice Services
  useEffect(() => {
    speechRecRef.current = new SpeechRecognitionService({
      onStart: () => {
        setVoiceState("listening");
        setErrorMessage("");
        setInterimText("");
      },
      onResult: (text, isFinal) => {
        setInterimText(text);
        if (isFinal) {
          handleUserSpeech(text);
        }
      },
      onError: (err) => {
        setVoiceState("error");
        setErrorMessage(err);
      },
      onEnd: () => {
        if (voiceState === "listening") {
          if (interimText.trim()) {
            handleUserSpeech(interimText);
          } else {
            setVoiceState("idle");
          }
        }
      },
    });

    ttsRef.current = new TextToSpeechService({
      onStart: () => setVoiceState("speaking"),
      onEnd: () => setVoiceState("idle"),
      onError: () => setVoiceState("idle"),
    });

    return () => {
      speechRecRef.current?.stop();
      ttsRef.current?.stop();
    };
  }, [handleUserSpeech, interimText, voiceState]);

  const toggleListen = () => {
    if (voiceState === "listening") {
      speechRecRef.current?.stop();
      setVoiceState("idle");
    } else {
      ttsRef.current?.stop();
      const started = speechRecRef.current?.start(language);
      if (started) {
        setVoiceState("listening");
      }
    }
  };

  const quickVoicePrompts = [
    { label: "What workout today?", query: "What workout should I do today?" },
    { label: "Make it 20 mins", query: "Make today's workout 20 minutes" },
    { label: "How is my recovery?", query: "How is my recovery score today?" },
    { label: "వర్కౌట్ తేలికగా చేయి", query: "ఓజస్, వర్కౌట్ తేలికగా చేయి" },
    { label: "आज का मेस खाना?", query: "आज मेस में क्या खाना सही रहेगा?" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl rounded-3xl bg-[#14151a] border border-white/15 p-6 space-y-6 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-2 rounded-xl bg-[#4d8eff]/20 text-[#adc6ff]">
                <Mic className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{t("voice_title", "Ojas Voice Assistant")}</h3>
                <p className="text-[10px] text-white/50">
                  {currentLanguageMeta.nativeName} ({currentLanguageMeta.name}) • Local Ollama Agent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-2 rounded-xl border transition ${
                  ttsEnabled
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-white/40"
                }`}
                title={ttsEnabled ? "TTS Audio On" : "TTS Audio Muted"}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  speechRecRef.current?.stop();
                  ttsRef.current?.stop();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Central Hero Voice Visualizer */}
          <div className="py-6 flex flex-col items-center justify-center relative">
            {/* Animated Glow Rings */}
            <div className="relative flex items-center justify-center">
              {voiceState === "listening" && (
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-36 w-36 rounded-full bg-[#4d8eff]/30 blur-md pointer-events-none"
                />
              )}

              {voiceState === "speaking" && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute h-36 w-36 rounded-full bg-emerald-400/30 blur-md pointer-events-none"
                />
              )}

              <button
                type="button"
                onClick={toggleListen}
                className={`relative z-10 h-24 w-24 rounded-full flex items-center justify-center text-black shadow-2xl transition transform hover:scale-105 active:scale-95 ${
                  voiceState === "listening"
                    ? "bg-gradient-to-tr from-red-500 to-rose-400 text-white shadow-rose-500/40"
                    : voiceState === "speaking"
                    ? "bg-gradient-to-tr from-emerald-400 to-teal-400 text-black shadow-emerald-500/30"
                    : voiceState === "processing" || voiceState === "acting"
                    ? "bg-gradient-to-tr from-amber-400 to-orange-400 text-black shadow-amber-500/30"
                    : "bg-gradient-to-tr from-[#adc6ff] to-[#4d8eff] text-black shadow-blue-500/30"
                }`}
              >
                {voiceState === "listening" ? (
                  <MicOff className="h-9 w-9 animate-pulse" />
                ) : (
                  <Mic className="h-9 w-9" />
                )}
              </button>
            </div>

            {/* State Label */}
            <div className="mt-5 space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#adc6ff]">
                {voiceState === "idle" && t("voice_tap_to_speak", "Tap to Speak")}
                {voiceState === "listening" && "🔴 " + t("voice_listening", "Listening...")}
                {voiceState === "processing" && "🧠 " + t("voice_thinking", "Ojas is thinking...")}
                {voiceState === "acting" && "⚙️ " + t("voice_acting", "Updating your plan...")}
                {voiceState === "speaking" && "🔊 " + t("voice_speaking", "Ojas is responding...")}
                {voiceState === "error" && "⚠️ " + t("voice_error", "Error")}
              </span>

              {/* Real-time speech text */}
              <p className="text-sm font-medium text-white/90 max-w-md mx-auto min-h-[24px]">
                {interimText || transcript || (
                  <span className="text-white/40 text-xs">
                    Speak naturally in {currentLanguageMeta.nativeName} or English
                  </span>
                )}
              </p>

              {errorMessage && (
                <p className="text-xs text-rose-400 pt-1">{errorMessage}</p>
              )}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2 text-left pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span>Quick Voice Commands</span>
              <button
                type="button"
                onClick={() => setShowTranscriptHistory(!showTranscriptHistory)}
                className="text-[#adc6ff] hover:underline flex items-center gap-1"
              >
                <MessageSquare className="h-3 w-3" />
                {showTranscriptHistory ? "Hide Transcript" : t("voice_transcript", "Show Transcript")}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickVoicePrompts.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleUserSpeech(p.query)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition text-left"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transcript History Drawer */}
          {showTranscriptHistory && (
            <div className="rounded-2xl bg-black/40 border border-white/10 p-3 max-h-44 overflow-y-auto space-y-2 text-left text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl ${
                    m.sender === "user"
                      ? "bg-white/10 text-white ml-6 text-right"
                      : "bg-[#4d8eff]/15 text-white/90 mr-6"
                  }`}
                >
                  <span className="text-[10px] text-white/40 block mb-0.5">
                    {m.sender === "user" ? "You" : "Ojas AI"}{" "}
                    {m.toolUsed && `• [Tool: ${m.toolUsed}]`}
                  </span>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            <span className="text-[10px] text-white/40">
              Press Mic to record • Local Ollama AI Engine
            </span>

            {voiceState === "speaking" && (
              <button
                type="button"
                onClick={() => ttsRef.current?.stop()}
                className="text-xs text-amber-300 hover:underline"
              >
                {t("voice_stop", "Stop Audio")}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
