"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AICoachVoice() {
  const { chatHistory, addMessage } = useFitness();
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [voiceText, setVoiceText] = useState("");
  const [guidanceActive, setGuidanceActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const handleQuickQuestion = (text: string) => {
    setVoiceText(`You asked: "${text}"`);
    addMessage(text, "user");
  };

  const recognitionRef = useRef<any>(null);

  // Mock Workout steps for Hands-free guidance
  const guideSteps = [
    { name: "Goblet Squats", sets: 4, reps: "10 reps", cue: "Keep your heels flat on the floor, keep your spine neutral, and drive your knees outward as you descend." },
    { name: "Push Ups", sets: 3, reps: "12 reps", cue: "Tuck your elbows at a 45-degree angle. Keep your core tight and body in a straight line." },
    { name: "DB Romanian Deadlifts", sets: 4, reps: "10 reps", cue: "Hinge at your hips. Keep the weights close to your shins, and engage your hamstrings and glutes at the top." },
    { name: "Plank Hold", sets: 3, reps: "45 seconds", cue: "Keep your elbows directly under shoulders. Squeeze your glutes and don't let your lower back sag." }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setVoiceText("Listening for your question...");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(`You said: "${transcript}"`);
        addMessage(transcript, "user");
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setVoiceText("Sorry, I didn't catch that. Please try again.");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text to Speech
  const speak = (text: string) => {
    if (!speechEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Clear queue
    const cleanText = text.replace(/[*_#]/g, ""); // Strip markdown characters
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Natural")) || voices[0];
    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  };

  // Speak coach responses automatically
  useEffect(() => {
    if (chatHistory.length === 0) return;
    const lastMsg = chatHistory[chatHistory.length - 1];
    if (lastMsg.sender === "coach" && lastMsg.text !== "Thinking...") {
      speak(lastMsg.text);
    }
  }, [chatHistory]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Guidance Control
  const startGuidance = () => {
    setGuidanceActive(true);
    setCurrentStep(0);
    setCurrentSet(1);
    const step = guideSteps[0];
    const text = `Starting hands-free guidance for today's workout. First exercise is ${step.name}. We will perform ${step.sets} sets of ${step.reps}. Remember: ${step.cue}. Start set 1 when you are ready.`;
    setVoiceText(text);
    speak(text);
  };

  const stopGuidance = () => {
    setGuidanceActive(false);
    window.speechSynthesis?.cancel();
    setVoiceText("Workout guidance paused.");
  };

  const handleNextSet = () => {
    const step = guideSteps[currentStep];
    if (currentSet < step.sets) {
      const nextS = currentSet + 1;
      setCurrentSet(nextS);
      const text = `Set ${nextS} of ${step.name}. Focus on your posture. Keep your core tight. Go!`;
      setVoiceText(text);
      speak(text);
    } else {
      // Move to next exercise
      if (currentStep < guideSteps.length - 1) {
        const nextStepIdx = currentStep + 1;
        setCurrentStep(nextStepIdx);
        setCurrentSet(1);
        const nextStep = guideSteps[nextStepIdx];
        const text = `Nice work. Next exercise is ${nextStep.name}. We will perform ${nextStep.sets} sets of ${nextStep.reps}. Focus cue: ${nextStep.cue}. Start set 1.`;
        setVoiceText(text);
        speak(text);
      } else {
        // Complete
        setGuidanceActive(false);
        const text = "Fantastic! You have completed all exercises in today's training guide. Excellent consistency. Time to cool down and hydrate.";
        setVoiceText(text);
        speak(text);
      }
    }
  };

  const speakCue = () => {
    const step = guideSteps[currentStep];
    speak(`Form Cue for ${step.name}: ${step.cue}`);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      {/* Voice Assistant Panel */}
      <GlassCard className="p-6 flex flex-col items-center justify-between min-h-[400px] border-white/5 bg-[rgba(24,23,26,0.35)] relative overflow-hidden">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => {
              setSpeechEnabled(!speechEnabled);
              if (speechEnabled) window.speechSynthesis?.cancel();
            }}
            className={`p-2.5 rounded-xl border transition ${
              speechEnabled
                ? "bg-white/5 border-white/10 text-white/60 hover:text-white"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
            title={speechEnabled ? "Mute Read-aloud responses" : "Unmute Read-aloud responses"}
          >
            {speechEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>
        </div>

        <div className="text-center space-y-1 pt-6">
          <h3 className="font-extrabold text-white text-base">Voice Companion</h3>
          <p className="text-xs text-white/40">Query or guide workouts using natural speech audio</p>
        </div>

        {/* Pulse Visualizer */}
        <div className="my-8 relative flex items-center justify-center">
          {/* Outer glowing pulses */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute h-24 w-24 rounded-full bg-cyan-400/20 blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeOut" }}
                  className="absolute h-24 w-24 rounded-full bg-[var(--accent)]/20 blur-sm"
                />
              </>
            )}
          </AnimatePresence>

          {/* Central Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListen}
            className={`h-24 w-24 rounded-full flex items-center justify-center shadow-lg relative z-10 transition-all duration-300 ${
              isListening
                ? "bg-cyan-400 text-[#131315] shadow-cyan-400/25"
                : "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white shadow-purple-500/25"
            }`}
          >
            {isListening ? (
              <Mic className="h-9 w-9 animate-pulse" />
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </motion.button>
        </div>

        <div className="w-full text-center space-y-4 px-4 pb-2">
          <p className="text-xs text-white/70 font-mono bg-black/20 border border-white/5 rounded-2xl px-4 py-3 min-h-[50px] flex items-center justify-center">
            {voiceText || 'Click the microphone or say "Start workout" to begin voice coaching.'}
          </p>
          
          <div className="space-y-2">
            <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Quick Voice Queries</p>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {[
                "What should I eat today?",
                "I only have 20 minutes.",
                "My knee feels sore.",
                "Can I train today?",
                "How many calories should I eat?",
                "Create today's workout.",
                "Explain today's recovery.",
                "Why did my weight change?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickQuestion(q)}
                  className="rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 p-2 text-center text-[10px] font-bold text-white/80 transition text-left truncate"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-white/30">
            {isListening ? "Listening active. Speak now..." : 'Tap mic button or choose a quick prompt to ask the AI coach.'}
          </p>
        </div>
      </GlassCard>

      {/* Hands-Free Workout Guide Panel */}
      <GlassCard className="p-6 flex flex-col justify-between border-white/5 bg-[rgba(24,23,26,0.35)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">Audio Workout Guide</h3>
              <p className="text-[10.5px] text-white/40">Step-by-step set cue reading and pacing control</p>
            </div>
            <button
              onClick={guidanceActive ? stopGuidance : startGuidance}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition ${
                guidanceActive 
                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25" 
                  : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 hover:brightness-110"
              }`}
            >
              {guidanceActive ? (
                <>
                  <Square className="h-4 w-4 fill-current" /> Stop Guide
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" /> Start Guide
                </>
              )}
            </button>
          </div>

          {guidanceActive ? (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 px-2 py-0.5 rounded font-black uppercase">
                    Active Exercise
                  </span>
                  <span className="text-white/40">
                    Exercise {currentStep + 1} of {guideSteps.length}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-lg font-black text-white">{guideSteps[currentStep].name}</h4>
                  <p className="text-sm font-semibold text-[#adc6ff] mt-1">
                    Set {currentSet} of {guideSteps[currentStep].sets} • {guideSteps[currentStep].reps}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-3 text-[11px] leading-relaxed text-white/60 space-y-1">
                  <p className="font-bold text-white flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Biomechanical cues:
                  </p>
                  <p>{guideSteps[currentStep].cue}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={speakCue}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Volume2 className="h-4 w-4" /> Repeat Cues
                </button>
                <button
                  onClick={handleNextSet}
                  className="flex-1 bg-[#adc6ff] hover:brightness-110 text-[#131315] font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition shadow-lg shadow-cyan-500/10"
                >
                  Next Set / Exercise <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/40 text-xs space-y-3">
              <Info className="h-8 w-8 text-white/20 mx-auto" />
              <p className="max-w-xs mx-auto leading-relaxed">
                Click &quot;Start Guide&quot; to begin hands-free workout guidance. The AI will speak each set and exercise cues out loud so you can train without looking at your screen.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-4 text-[10px] text-white/40 space-y-1 text-left">
          <p className="font-bold text-white/50">Supported Voice Commands (when listening):</p>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            <li>&quot;Next set&quot; or &quot;Next exercise&quot; to progress</li>
            <li>&quot;Read cues&quot; to repeat bio-postural guidance</li>
            <li>&quot;Stop&quot; or &quot;Pause&quot; to hold guidance</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
