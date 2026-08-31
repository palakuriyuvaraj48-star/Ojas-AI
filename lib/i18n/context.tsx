"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LanguageCode, LanguageMeta, SUPPORTED_LANGUAGES, TranslationDictionary } from "./types";
import { TRANSLATIONS } from "./translations";
import { useFitness } from "@/components/providers/fitness-provider";

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  isRTL: boolean;
  dir: "ltr" | "rtl";
  currentLanguageMeta: LanguageMeta;
  supportedLanguages: LanguageMeta[];
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "ojas_language_preference";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useFitness();
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Load language preference from profile or localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    const profileLang = profile?.language as LanguageCode | undefined;
    
    const validLang = profileLang || stored || "en";
    if (SUPPORTED_LANGUAGES.some((l) => l.code === validLang)) {
      setLanguageState(validLang);
    }
  }, [profile?.language]);

  const currentLanguageMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isRTL = currentLanguageMeta.isRTL;
  const dir: "ltr" | "rtl" = isRTL ? "rtl" : "ltr";

  // Update HTML document dir and lang attributes
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const setLanguage = useCallback((newLang: LanguageCode) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) return;
    setLanguageState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
    if (profile && profile.language !== newLang) {
      updateProfile({ ...profile, language: newLang });
    }
  }, [profile, updateProfile]);

  const t = useCallback((key: keyof TranslationDictionary, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    const defaultDict = TRANSLATIONS.en;
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  }, [language]);

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        dir,
        currentLanguageMeta,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      <div dir={dir} className={isRTL ? "rtl" : "ltr"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback safe context if used outside provider
    const fallbackMeta = SUPPORTED_LANGUAGES[0];
    return {
      language: "en" as LanguageCode,
      setLanguage: () => {},
      t: (key: keyof TranslationDictionary, fallback?: string) => TRANSLATIONS.en[key] || fallback || key,
      isRTL: false,
      dir: "ltr" as "ltr" | "rtl",
      currentLanguageMeta: fallbackMeta,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
