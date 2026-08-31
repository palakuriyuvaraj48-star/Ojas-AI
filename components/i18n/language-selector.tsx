"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, Sparkles, AlertCircle, X, Languages } from "lucide-react";
import { useTranslation, SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n";
import { GlassCard } from "@/components/ui/glass-card";

interface LanguageSelectorProps {
  variant?: "modal" | "dropdown" | "button";
  className?: string;
}

export function LanguageSelector({ variant = "modal", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage, t, currentLanguageMeta } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // The 3 First-Class Primary Languages
  const primaryLanguages = [
    { code: "en" as LanguageCode, name: "English", nativeName: "English", flag: "🇬🇧", tag: "Default" },
    { code: "te" as LanguageCode, name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", tag: "Primary" },
    { code: "hi" as LanguageCode, name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", tag: "Primary" },
  ];

  const otherIndianLanguages = SUPPORTED_LANGUAGES.filter(
    (l) => l.isIndian && l.code !== "en" && l.code !== "te" && l.code !== "hi"
  );
  const internationalLanguages = SUPPORTED_LANGUAGES.filter((l) => !l.isIndian);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Quick 3-Primary Switcher Pills */}
      <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-0.5">
        {primaryLanguages.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              type="button"
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              aria-label={`Switch to ${lang.name}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                isSelected
                  ? "bg-[#adc6ff] text-[#131315] shadow-md shadow-blue-500/20"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{lang.nativeName}</span>
            </button>
          );
        })}
      </div>

      {/* Globe Button for Full Modal */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Full Language Menu"
        className={`flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition ${className}`}
        title="More Indian & Global Languages"
      >
        <Globe className="h-3.5 w-3.5 text-[#adc6ff]" />
        <span className="hidden sm:inline text-[11px] text-white/50">All</span>
      </button>

      {/* Language Selector Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#14151a] border border-white/15 p-6 space-y-6 shadow-2xl text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-black">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {t("settings_language", "Choose Language")}
                    </h3>
                    <p className="text-xs text-white/50">
                      Ojas AI adapts UI labels, daily decisions, voice assistant, and AI coaching.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-white/10 p-2 text-white/60 hover:text-white hover:bg-white/20 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. First-Class Primary Languages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Primary Languages (ప్రధాన భాషలు / प्राथमिक भाषाएं)
                  </h4>
                  <span className="text-[10px] text-amber-300/80 font-bold">First-Class Support</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {primaryLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={`rounded-2xl border p-4 text-left transition flex flex-col justify-between min-h-[85px] ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/20 text-white shadow-xl shadow-amber-500/20 scale-[1.02]"
                            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base font-extrabold">{lang.nativeName}</span>
                          {isSelected ? (
                            <Check className="h-4 w-4 text-amber-300" />
                          ) : (
                            <span className="text-sm">{lang.flag}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-2">
                          <span className="text-xs text-white/60 font-medium">{lang.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-amber-300 font-bold font-mono">
                            {lang.tag}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Other Indian Languages */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#adc6ff] uppercase tracking-wider flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" />
                    Other Indian Languages (ఇతర భారతీయ భాషలు)
                  </h4>
                  <span className="text-[10px] text-white/40">Expanding Regional Network</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {otherIndianLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={`rounded-2xl border p-3 text-left transition flex flex-col justify-between min-h-[68px] ${
                          isSelected
                            ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white shadow-lg shadow-blue-500/10"
                            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold">{lang.nativeName}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#4d8eff]" />}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-[10px] text-white/50">{lang.name}</span>
                          {lang.isRTL && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                              RTL
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. International Languages */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  International Languages
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {internationalLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={`rounded-2xl border p-3 text-left transition flex flex-col justify-between min-h-[68px] ${
                          isSelected
                            ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white shadow-lg shadow-blue-500/10"
                            : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm font-bold">{lang.nativeName}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#4d8eff]" />}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-[10px] text-white/50">{lang.name}</span>
                          {lang.isRTL && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                              RTL
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
