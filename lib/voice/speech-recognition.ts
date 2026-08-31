/**
 * Ojas AI - Speech Recognition Service Abstraction
 * Supports browser Web Speech API with regional Indian locale mapping and error tolerance.
 */

import { LanguageCode } from "@/lib/i18n/types";

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
  en: "en-IN",
  te: "te-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  or: "or-IN",
  ur: "ur-IN",
  as: "as-IN",
  ne: "ne-NP",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  ar: "ar-SA",
  ja: "ja-JP",
  ko: "ko-KR",
};

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private callbacks: SpeechRecognitionCallbacks = {};
  private language: LanguageCode = "en";

  constructor(callbacks: SpeechRecognitionCallbacks = {}) {
    this.callbacks = callbacks;
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[Ojas Voice] SpeechRecognition API not supported on this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        if (text) {
          this.callbacks.onResult?.(text, isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errorMessage = "Speech recognition error";
        if (event.error === "no-speech") {
          errorMessage = "No speech detected. Please speak clearly into your mic.";
        } else if (event.error === "audio-capture") {
          errorMessage = "Microphone capture failed. Check browser permissions.";
        } else if (event.error === "not-allowed") {
          errorMessage = "Microphone permission denied. Allow mic access in browser settings.";
        }
        this.callbacks.onError?.(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.callbacks.onEnd?.();
      };
    } catch (e) {
      console.error("[Ojas Voice] Failed to instantiate SpeechRecognition:", e);
    }
  }

  public setLanguage(lang: LanguageCode) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = LANGUAGE_LOCALE_MAP[lang] || "en-IN";
    }
  }

  public start(lang?: LanguageCode): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        this.callbacks.onError?.("Speech recognition not supported in this browser.");
        return false;
      }
    }

    if (lang) {
      this.setLanguage(lang);
    } else {
      this.setLanguage(this.language);
    }

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      // If already started, ignore
      if (err.name !== "InvalidStateError") {
        this.callbacks.onError?.("Could not start microphone.");
      }
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }

  public isAvailable(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition
    );
  }
}
