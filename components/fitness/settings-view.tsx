"use client";

import React, { useState, useEffect } from "react";
import { useFitness } from "@/components/providers/fitness-provider";
import { useTheme } from "@/providers/theme-provider";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Bell, Palette, Globe, Ruler, Lock, Sparkles, Mic, Calendar, Heart, Watch, Smartphone, Moon, Sun, Monitor, ChevronRight, Check } from "lucide-react";

export function SettingsView() {
  const { profile } = useFitness();
  const { preference, setPreference } = useTheme();
  const [activeSection, setActiveSection] = useState<"general" | "notifications" | "privacy" | "ai" | "integrations">("general");
  const [units, setUnits] = useState("metric");
  const [language, setLanguage] = useState("en");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [aiPersonality, setAiPersonality] = useState("motivational");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(80);
  
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    aiInsights: true,
    communityUpdates: false,
  });

  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [profileVisibility, setProfileVisibility] = useState("private");
  const [dataSharing, setDataSharing] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(true);
  const [micPermission, setMicPermission] = useState(true);
  const [healthDataSharing, setHealthDataSharing] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [photoStorage, setPhotoStorage] = useState(true);

  // Load preferences from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("titan_preferences");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.units) setUnits(parsed.units);
          if (parsed.language) setLanguage(parsed.language);
          if (typeof parsed.voiceEnabled === "boolean") setVoiceEnabled(parsed.voiceEnabled);
          if (parsed.aiPersonality) setAiPersonality(parsed.aiPersonality);
          if (parsed.voiceSpeed) setVoiceSpeed(parsed.voiceSpeed);
          if (parsed.voiceVolume) setVoiceVolume(parsed.voiceVolume);
          if (parsed.notifications) setNotifications(parsed.notifications);
          if (parsed.quietHoursStart) setQuietHoursStart(parsed.quietHoursStart);
          if (parsed.quietHoursEnd) setQuietHoursEnd(parsed.quietHoursEnd);
          if (parsed.profileVisibility) setProfileVisibility(parsed.profileVisibility);
          if (typeof parsed.dataSharing === "boolean") setDataSharing(parsed.dataSharing);
          if (typeof parsed.activityStatus === "boolean") setActivityStatus(parsed.activityStatus);
          if (typeof parsed.cameraPermission === "boolean") setCameraPermission(parsed.cameraPermission);
          if (typeof parsed.micPermission === "boolean") setMicPermission(parsed.micPermission);
          if (typeof parsed.healthDataSharing === "boolean") setHealthDataSharing(parsed.healthDataSharing);
          if (typeof parsed.cloudSync === "boolean") setCloudSync(parsed.cloudSync);
          if (typeof parsed.photoStorage === "boolean") setPhotoStorage(parsed.photoStorage);
        } catch (e) {
          console.error("Failed to parse preferences from localStorage", e);
        }
      }
    }
  }, []);

  const savePreference = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("titan_preferences");
      let current = {};
      if (saved) {
        try {
          current = JSON.parse(saved);
        } catch {}
      }
      const updated = { ...current, [key]: value };
      localStorage.setItem("titan_preferences", JSON.stringify(updated));
    }
  };

  const sections = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "notifications", label: "Notifications Feed", icon: Bell },
    { id: "privacy", label: "Privacy & Controls", icon: Lock },
    { id: "ai", label: "AI Coach Settings", icon: Sparkles },
    { id: "integrations", label: "Integrations Sync", icon: Smartphone },
  ] as const;

  if (!profile) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <GlassCard className="p-4 h-fit">
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeSection === section.id
                    ? "bg-[var(--accent-glow)] text-[var(--accent)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100" />
              </button>
            );
          })}
        </nav>
      </GlassCard>

      {/* Main Content */}
      <div className="space-y-6">
        {activeSection === "general" && (
          <div className="space-y-6">
            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Palette className="h-5 w-5 text-[var(--accent)]" /> Theme Configurations
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Select your visual scheme preference</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "dark", label: "Dark Mode", icon: Moon },
                      { id: "light", label: "Light Mode", icon: Sun },
                      { id: "system", label: "System", icon: Monitor },
                    ].map((t) => {
                      const ThemeIcon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setPreference(t.id as any)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                            preference === t.id
                              ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          <ThemeIcon className="h-5 w-5" />
                          <span className="text-xs font-semibold">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Ruler className="h-5 w-5 text-[var(--accent)]" /> Measurement Calibration
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Configure tracking metrics and system language.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-3">Measurement Units</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setUnits("metric"); savePreference("units", "metric"); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                        units === "metric"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span className="text-xs font-semibold">Metric (kg/cm)</span>
                      {units === "metric" && <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { setUnits("imperial"); savePreference("units", "imperial"); }}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition ${
                        units === "imperial"
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span className="text-xs font-semibold">Imperial (lbs/in)</span>
                      {units === "imperial" && <Check className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-3">System Language</label>
                  <select
                    value={language}
                    onChange={(e) => { const val = e.target.value; setLanguage(val); savePreference("language", val); }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-6">
            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Bell className="h-5 w-5 text-[var(--accent)]" /> Smart Notifications Feed
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Configure reminders and recovery alerts</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: "workoutReminders", label: "Workout Schedule Reminders", description: "Get alert notifications 15m before your targeted lift time." },
                  { id: "progressUpdates", label: "Weekly Bio Summaries", description: "Receive weight adjustment recommendations and consistency logs." },
                  { id: "aiInsights", label: "AI Coaching Insights", description: "Instant notification updates from Vikram concerning physiological state." },
                  { id: "communityUpdates", label: "Community Activity Updates", description: "Get notified when hybrid athletes comment or support log targets." },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="text-left pr-4">
                      <p className="font-semibold text-white text-xs">{item.label}</p>
                      <p className="text-[10px] text-[var(--foreground-muted)] mt-1 leading-normal">{item.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = { ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] };
                        setNotifications(next);
                        savePreference("notifications", next);
                      }}
                      className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${notifications[item.id as keyof typeof notifications] ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications[item.id as keyof typeof notifications] ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-white text-xs text-left">Quiet Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-2">Disable From</label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => { setQuietHoursStart(e.target.value); savePreference("quietHoursStart", e.target.value); }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block mb-2">Enable From</label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => { setQuietHoursEnd(e.target.value); savePreference("quietHoursEnd", e.target.value); }}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-tertiary)] px-4 py-3 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeSection === "privacy" && (
          <div className="space-y-6">
            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-[var(--accent)]" /> Privacy & Telemetry Logs
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Control how personal health metrics are stored and synced.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Profile Visibility</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Select who has access to view weight and lift records</p>
                  </div>
                  <select
                    value={profileVisibility}
                    onChange={(e) => { setProfileVisibility(e.target.value); savePreference("profileVisibility", e.target.value); }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none"
                  >
                    <option value="private">Private (Only Me)</option>
                    <option value="friends">Friends Only</option>
                    <option value="public">Public (All Athletes)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Anonymized Data Sharing</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Submit posture analytics data to refine global YOLO landmarks model.</p>
                  </div>
                  <button
                    onClick={() => { const val = !dataSharing; setDataSharing(val); savePreference("dataSharing", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${dataSharing ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${dataSharing ? "translate-x-6" : ""}`} />
                  </button>
                </div>
                                 <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Show Active Status</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Display online/optimal status ring to community members.</p>
                  </div>
                  <button
                    onClick={() => { const val = !activityStatus; setActivityStatus(val); savePreference("activityStatus", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${activityStatus ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${activityStatus ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Camera Permissions</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Used exclusively for on-device live posture tracking, rep/set counting, and movement analysis. Video frames are processed in-memory and are never uploaded to the cloud.</p>
                  </div>
                  <button
                    onClick={() => { const val = !cameraPermission; setCameraPermission(val); savePreference("cameraPermission", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${cameraPermission ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cameraPermission ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Microphone Permissions</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Used for the hands-free Voice AI Companion. Audio recordings are processed on-device for transcript conversion and are never stored on external servers.</p>
                  </div>
                  <button
                    onClick={() => { const val = !micPermission; setMicPermission(val); savePreference("micPermission", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${micPermission ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${micPermission ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Health Data Sharing</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Allow integration and synchronization of workouts, sleep, and heart-rate metrics from Apple Health, Whoop, Garmin, and Fitbit to calculate systemic recovery coefficients.</p>
                  </div>
                  <button
                    onClick={() => { const val = !healthDataSharing; setHealthDataSharing(val); savePreference("healthDataSharing", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${healthDataSharing ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${healthDataSharing ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Cloud Synchronization</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Allow secure backup and synchronization of daily nutrition logs, workout history, and progress analytics to the cloud.</p>
                  </div>
                  <button
                    onClick={() => { const val = !cloudSync; setCloudSync(val); savePreference("cloudSync", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${cloudSync ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${cloudSync ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Photo Storage Access</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Allow saving food scans to local device storage to preserve a visual meal logging history.</p>
                  </div>
                  <button
                    onClick={() => { const val = !photoStorage; setPhotoStorage(val); savePreference("photoStorage", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${photoStorage ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${photoStorage ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeSection === "ai" && (
          <div className="space-y-6">
            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" /> AI Coaching Personalities
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Customize how AI feedback loops are presented</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left pr-4">
                    <p className="font-semibold text-white text-xs">Voice Guided Cues</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Hear real-time vocal posture correction alerts during squat reps.</p>
                  </div>
                  <button
                    onClick={() => { const val = !voiceEnabled; setVoiceEnabled(val); savePreference("voiceEnabled", val); }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${voiceEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${voiceEnabled ? "translate-x-6" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                  <div className="text-left">
                    <p className="font-semibold text-white text-xs">Primary Personality Core</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] mt-1">Changes the tone and wording of AI Vikram summaries.</p>
                  </div>
                  <select
                    value={aiPersonality}
                    onChange={(e) => { setAiPersonality(e.target.value); savePreference("aiPersonality", e.target.value); }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background-tertiary)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none"
                  >
                    <option value="motivational">Motivational (Lion Cues)</option>
                    <option value="analytical">Analytical (Biomechanical Specs)</option>
                    <option value="friendly">Supportive (Gentle Nudges)</option>
                    <option value="strict">Strict (Tough Love / Direct)</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-white text-xs text-left flex items-center gap-2">
                <Mic className="h-4.5 w-4.5 text-[var(--accent)]" /> Voice guided speed & calibration
              </h3>
              <div className="space-y-4 text-left">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground-muted)]">Voice Cue Speed</span>
                    <span className="font-mono text-white">{voiceSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => { const val = parseFloat(e.target.value); setVoiceSpeed(val); savePreference("voiceSpeed", val); }}
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--foreground-muted)]">Cue Speaker Volume</span>
                    <span className="font-mono text-white">{voiceVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={voiceVolume}
                    onChange={(e) => { const val = parseInt(e.target.value); setVoiceVolume(val); savePreference("voiceVolume", val); }}
                    className="w-full accent-[var(--accent)]"
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {activeSection === "integrations" && (
          <div className="space-y-6 text-left">
            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Heart className="h-5 w-5 text-[var(--accent)]" /> Health App Connections
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Synchronize step count, workouts, and sleeping heart rates.</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Apple HealthKit", connected: true, description: "Sync sleep durations, steps, resting heart rates." },
                  { name: "Google Fit API", connected: false, description: "Import daily exercise sessions and calorie burns." },
                  { name: "Fitbit Cloud Sync", connected: false, description: "Export sleep metrics." },
                ].map((app) => (
                  <div key={app.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${app.connected ? "bg-[var(--success-subtle)] text-[var(--success)]" : "bg-[var(--surface-hover)] text-[var(--foreground-muted)]"}`}>
                        <Heart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">{app.name}</p>
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">{app.description}</p>
                      </div>
                    </div>
                    <Badge variant={app.connected ? "primary" : "neutral"} label={app.connected ? "Synced" : "Connect"} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Calendar className="h-5 w-5 text-[var(--accent)]" /> Google Calendar Integration
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Ensure work calendars adapt workout times dynamically.</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Google Calendar", connected: true },
                  { name: "Apple Calendar", connected: false },
                ].map((calendar) => (
                  <div key={calendar.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[var(--foreground-muted)]" />
                      <p className="font-semibold text-white text-xs">{calendar.name}</p>
                    </div>
                    <Badge variant={calendar.connected ? "primary" : "neutral"} label={calendar.connected ? "Synced" : "Connect"} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="space-y-6">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
                  <Watch className="h-5 w-5 text-[var(--accent)]" /> Connected Physiology Wearables
                </h3>
                <p className="text-xs text-[var(--foreground-muted)]">Calibrate active recoveries and daily systemic strains.</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "WHOOP 4.0 Strap", connected: true, description: "Strain score & sleep recovery index." },
                  { name: "Garmin Connect Hub", connected: false, description: "Calibrate cardio velocities." },
                ].map((device) => (
                  <div key={device.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <Watch className="h-5 w-5 text-[var(--foreground-muted)]" />
                      <div>
                        <p className="font-semibold text-white text-xs">{device.name}</p>
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5">{device.description}</p>
                      </div>
                    </div>
                    <Badge variant={device.connected ? "primary" : "neutral"} label={device.connected ? "Connected" : "Connect"} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}


