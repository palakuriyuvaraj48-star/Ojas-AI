// Lightweight voice coach wrapper around the Web Speech API. Safe to import on
// the server (no window access at module scope).
export class VoiceCoach {
  private muted = false;
  private supported = false;
  private lastSpokeAt = 0;
  private lastText = "";
  
  // Custom speech settings
  private gender: "male" | "female" = "female";
  private lang: "en" | "es" | "hi" | "de" = "en";
  private rate = 1.0;
  private volume = 0.9;

  constructor(muted = false) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      this.supported = "speechSynthesis" in window;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.cancel();
  }

  get isMuted() {
    return this.muted;
  }

  get isSupported() {
    return this.supported;
  }

  setGender(gender: "male" | "female") {
    this.gender = gender;
  }

  setLanguage(lang: "en" | "es" | "hi" | "de") {
    this.lang = lang;
  }

  setRate(rate: number) {
    this.rate = rate;
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  // Speak a message, throttled so rapid feedback doesn't overlap.
  speak(text: string, opts?: { force?: boolean }) {
    if (this.muted || !this.supported) return;
    const now = Date.now();
    if (!opts?.force && (now - this.lastSpokeAt < 1200 || text === this.lastText)) return;
    this.lastSpokeAt = now;
    this.lastText = text;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = this.rate;
      u.pitch = this.gender === "female" ? 1.1 : 0.9;
      u.volume = this.volume;
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(v => v.lang.startsWith(this.lang));
      
      if (selectedVoice) {
        const genderVoice = voices.find(v => 
          v.lang.startsWith(this.lang) && 
          (this.gender === "female" 
            ? /female|zira|samantha|hazel/i.test(v.name) 
            : /male|david|mark/i.test(v.name))
        );
        if (genderVoice) selectedVoice = genderVoice;
        u.voice = selectedVoice;
      }
      
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  cancel() {
    if (this.supported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
  }
}
