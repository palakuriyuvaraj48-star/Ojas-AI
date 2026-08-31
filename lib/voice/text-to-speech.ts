/**
 * Ojas AI - Text-to-Speech Service Abstraction
 * Synthesizes voice audio matching the user's selected language with natural speech cues.
 */

import { LanguageCode } from "@/lib/i18n/types";

export interface TextToSpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export class TextToSpeechService {
  private isSpeaking = false;
  private callbacks: TextToSpeechCallbacks = {};
  private voices: SpeechSynthesisVoice[] = [];

  constructor(callbacks: TextToSpeechCallbacks = {}) {
    this.callbacks = callbacks;
    this.initVoices();
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public speak(text: string, language: LanguageCode = "en"): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.callbacks.onError?.("Text-to-speech not supported on this device.");
      return false;
    }

    if (!text.trim()) return false;

    try {
      // Cancel previous utterances
      window.speechSynthesis.cancel();

      // Clean markdown tags and emojis from spoken audio
      const cleanText = text
        .replace(/[*_#`~\[\]\(\)\{\}]/g, "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "");

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Find matching voice
      if (this.voices.length === 0) {
        this.voices = window.speechSynthesis.getVoices();
      }

      const langPrefix = language.toLowerCase();
      const matchedVoice = this.voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) ||
          (language === "en" && v.lang.toLowerCase().includes("en-in"))
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = language === "en" ? "en-IN" : `${language}-IN`;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.callbacks.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.callbacks.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.callbacks.onError?.(e.error || "Speech synthesis failed");
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e: any) {
      this.isSpeaking = false;
      this.callbacks.onError?.(e?.message || "Speech synthesis exception");
      return false;
    }
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public isAvailable(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }
}
