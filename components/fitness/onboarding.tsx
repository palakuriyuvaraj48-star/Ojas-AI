"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, ArrowRight, ArrowLeft, Check, Sparkles, User, Flame, Activity, Heart, Camera, Calendar, MapPin, Bell, ShieldCheck, Moon, Sun, Monitor, Ruler, Sparkle } from "lucide-react";
import { useFitness } from "@/components/providers/fitness-provider";
import { ClientProfile, Gender, FitnessGoal, ActivityLevel, GymExperience, FoodPreference, Budget, StressLevel, WorkoutEnvironment, AIPersonality, ThemePreference, Language } from "@/types/profile";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Dropdown } from "@/components/ui/dropdown";

interface Permission {
  id: string;
  title: string;
  description: string;
  icon: any;
  required: boolean;
}

const permissionsList: Permission[] = [
  {
    id: "camera",
    title: "Camera Access",
    description: "Required for the AI Vision Lens to run real-time posture analysis, track joint angles, and audit exercise depths.",
    icon: Camera,
    required: true,
  },
  {
    id: "health",
    title: "Health & Fitness App Permissions",
    description: "Allows syncing step counts, sleep latency, and heart rate recovery baselines from devices like Apple Watch and WHOOP.",
    icon: Heart,
    required: true,
  },
  {
    id: "calendar",
    title: "Calendar Scheduler Sync",
    description: "Integrates workout times directly into your Google/Apple calendar to help build strict consistency habits.",
    icon: Calendar,
    required: false,
  },
  {
    id: "location",
    title: "Location Telemetry",
    description: "Used to calibrate outdoor running velocity, compute elevations, and find nearby certified hybrid fitness gyms.",
    icon: MapPin,
    required: false,
  },
  {
    id: "notifications",
    title: "Smart Notification Alerts",
    description: "Provides daily nutrient targets, hydration nudges, recovery warnings, and workout schedule changes.",
    icon: Bell,
    required: true,
  },
];

export function Onboarding() {
  const { updateProfile } = useFitness();
  const [step, setStep] = useState(1);
  const [permissionStep, setPermissionStep] = useState(0);
  const [grantedPermissions, setGrantedPermissions] = useState<Set<string>>(new Set(["camera", "health", "notifications"]));
  
  const [formData, setFormData] = useState<Partial<ClientProfile>>({
    name: "Maya Chen",
    age: 28,
    gender: "female",
    height: 168,
    weight: 64.2,
    goal: "lean-bulk",
    bodyFat: 22,
    activityLevel: "moderately-active",
    gymExperience: "intermediate",
    dailyStepGoal: 9000,
    occupation: "Product Designer",
    workoutDaysPerWeek: 4,
    medicalConditions: "None",
    injuries: "None",
    foodPreference: "both",
    allergies: "None",
    budget: "moderate",
    sleepDuration: 7.5,
    stressLevel: "medium",
    availableEquipment: ["barbell", "dumbbell", "cables", "machines"],
    lifestyle: "Active professional, high screen time.",
    neckCircumference: 32,
    legCircumference: 55,
    targetWeight: 66,
    timelineWeeks: 12,
    workoutEnvironment: "gym",
    workoutTime: "07:30",
    wakeTime: "06:30",
    sleepTime: "22:30",
    waterIntake: 3.0,
    language: "en",
    aiPersonality: "motivational",
    themePreference: "dark",
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handlePermissionToggle = (permissionId: string) => {
    setGrantedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const nextPermission = () => {
    if (permissionStep < permissionsList.length - 1) {
      setPermissionStep((prev) => prev + 1);
    } else {
      setStep(7); // Complete screen
    }
  };

  const prevPermission = () => {
    if (permissionStep > 0) {
      setPermissionStep((prev) => prev - 1);
    } else {
      setStep(5); // Go back to AI & Theme step
    }
  };

  const handleSelect = (field: keyof ClientProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEquipmentToggle = (equip: string) => {
    setFormData((prev) => {
      const current = prev.availableEquipment || [];
      const updated = current.includes(equip)
        ? current.filter((e) => e !== equip)
        : [...current, equip];
      return { ...prev, availableEquipment: updated };
    });
  };

  const loadDemo = () => {
    const demoProfile: ClientProfile = {
      name: "Vikram Malhotra",
      age: 32,
      gender: "male",
      height: 180,
      weight: 84.5,
      goal: "muscle-gain",
      bodyFat: 16.5,
      activityLevel: "very-active",
      gymExperience: "advanced",
      dailyStepGoal: 11000,
      occupation: "Principal Engineer",
      workoutDaysPerWeek: 5,
      medicalConditions: "None",
      injuries: "Shoulder impingement risk",
      foodPreference: "both",
      allergies: "None",
      budget: "premium",
      sleepDuration: 8.0,
      stressLevel: "medium",
      availableEquipment: ["barbell", "dumbbell", "cables", "machines"],
      lifestyle: "Hybrid setup, lots of walking.",
      neckCircumference: 39,
      legCircumference: 61,
      targetWeight: 88,
      timelineWeeks: 16,
      workoutEnvironment: "both",
      workoutTime: "18:30",
      wakeTime: "06:00",
      sleepTime: "22:00",
      waterIntake: 4.0,
      language: "en",
      aiPersonality: "strict",
      themePreference: "dark",
      permissions: {
        camera: true,
        health: true,
        calendar: true,
        notification: true,
        location: false,
      }
    };
    setFormData(demoProfile);
    setStep(7);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 6) {
      nextStep();
      return;
    }
    if (step === 6) {
      // Manage permissions confirmation and proceed
      return;
    }
    
    // Save to global state provider
    updateProfile({
      ...formData,
      permissions: {
        camera: grantedPermissions.has("camera"),
        health: grantedPermissions.has("health"),
        calendar: grantedPermissions.has("calendar"),
        notification: grantedPermissions.has("notifications"),
        location: grantedPermissions.has("location"),
      }
    } as ClientProfile);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-hero)] p-4 text-[var(--foreground)]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-[32px] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[var(--elevation-xl)] backdrop-blur-3xl sm:p-8"
      >
        {/* App Title */}
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strong)] text-white">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)] tracking-tight">Project Titan</p>
              <p className="text-xs text-[var(--foreground-muted)]">AI Fitness Operating System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadDemo}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-glow)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:brightness-110 transition"
          >
            <Sparkles className="h-3 w-3" /> Quick Demo
          </button>
        </div>

        {/* Steps Tracker */}
        {step < 7 && (
          <div className="mb-8 flex items-center justify-between px-2 overflow-x-auto gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition text-xs font-bold ${
                      step >= s
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                  </div>
                  <span className={`ml-2 text-[10px] font-semibold hidden md:inline ${step === s ? "text-[var(--foreground)]" : "text-[var(--foreground-muted)]"}`}>
                    {s === 1 && "Basic"}
                    {s === 2 && "Physical"}
                    {s === 3 && "Fitness"}
                    {s === 4 && "Lifestyle"}
                    {s === 5 && "AI/Theme"}
                    {s === 6 && "Access"}
                  </span>
                </div>
                {s < 6 && <div className={`h-[2px] min-w-4 flex-1 ${step > s ? "bg-[var(--accent)]" : "bg-[var(--border-subtle)]"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <User className="h-5 w-5 text-[var(--accent)]" /> Basic Bio Profiling
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Set up your profile identity and language parameters.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Preferred Name</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Maya Chen"
                      value={formData.name || ""}
                      onChange={(e) => handleSelect("name", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Age (years)</label>
                      <Input
                        type="number"
                        required
                        min={14}
                        max={99}
                        value={formData.age || ""}
                        onChange={(e) => handleSelect("age", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">System Language</label>
                      <Dropdown
                        value={formData.language || "en"}
                        onChange={(val) => handleSelect("language", val as Language)}
                        options={[
                          { label: "English", value: "en" },
                          { label: "Español", value: "es" },
                          { label: "Français", value: "fr" },
                          { label: "Deutsch", value: "de" },
                          { label: "Hindi", value: "hi" },
                          { label: "日本語", value: "ja" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Biological Sex</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["male", "female", "other"] as Gender[]).map((genderOption) => (
                        <button
                          type="button"
                          key={genderOption}
                          onClick={() => handleSelect("gender", genderOption)}
                          className={`rounded-2xl border p-4 text-center text-xs font-semibold capitalize transition ${
                            formData.gender === genderOption
                              ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--foreground)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-[var(--accent)]" /> Physical Metrics
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Precise bio-measurements calibrate cellular metabolic indexes.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Height (cm)</label>
                      <Input
                        type="number"
                        required
                        min={100}
                        max={250}
                        value={formData.height || ""}
                        onChange={(e) => handleSelect("height", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Weight (kg)</label>
                      <Input
                        type="number"
                        required
                        min={30}
                        max={250}
                        step="0.1"
                        value={formData.weight || ""}
                        onChange={(e) => handleSelect("weight", parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Body Fat % (optional)</label>
                      <Input
                        type="number"
                        min={3}
                        max={60}
                        value={formData.bodyFat || ""}
                        onChange={(e) => handleSelect("bodyFat", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Neck Circ. (cm)</label>
                      <Input
                        type="number"
                        min={20}
                        max={60}
                        value={formData.neckCircumference || ""}
                        onChange={(e) => handleSelect("neckCircumference", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Leg/Thigh Circ. (cm)</label>
                      <Input
                        type="number"
                        min={30}
                        max={100}
                        value={formData.legCircumference || ""}
                        onChange={(e) => handleSelect("legCircumference", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Flame className="h-5 w-5 text-[var(--accent)]" /> Goals & Fitness Splits
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Establish training volume thresholds and environment preferences.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Fitness Goal</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: "fat-loss", label: "Fat Loss" },
                        { id: "muscle-gain", label: "Muscle Gain" },
                        { id: "lean-bulk", label: "Lean Bulk" },
                        { id: "maintenance", label: "Maintenance" }
                      ] as { id: FitnessGoal; label: string }[]).map((g) => (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => handleSelect("goal", g.id)}
                          className={`rounded-2xl border p-3.5 text-center text-xs font-semibold transition ${
                            formData.goal === g.id
                              ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--foreground)]"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Gym Experience</label>
                      <Dropdown
                        value={formData.gymExperience || "intermediate"}
                        onChange={(val) => handleSelect("gymExperience", val as GymExperience)}
                        options={[
                          { label: "Beginner (<1 year)", value: "beginner" },
                          { label: "Intermediate (1-3 years)", value: "intermediate" },
                          { label: "Advanced (3+ years)", value: "advanced" }
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Activity Level</label>
                      <Dropdown
                        value={formData.activityLevel || "moderately-active"}
                        onChange={(val) => handleSelect("activityLevel", val as ActivityLevel)}
                        options={[
                          { label: "Sedentary (Office worker)", value: "sedentary" },
                          { label: "Lightly Active (1-3 days/wk)", value: "lightly-active" },
                          { label: "Moderately Active (3-5 days/wk)", value: "moderately-active" },
                          { label: "Very Active (6-7 days/wk)", value: "very-active" },
                          { label: "Extra Active (Double splits/Physical)", value: "extra-active" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Workout Split (days/wk)</label>
                      <Input
                        type="number"
                        min={2}
                        max={7}
                        value={formData.workoutDaysPerWeek || ""}
                        onChange={(e) => handleSelect("workoutDaysPerWeek", parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Training Location</label>
                      <Dropdown
                        value={formData.workoutEnvironment || "gym"}
                        onChange={(val) => handleSelect("workoutEnvironment", val as WorkoutEnvironment)}
                        options={[
                          { label: "Gym (Full weights)", value: "gym" },
                          { label: "Home (Limited setup)", value: "home" },
                          { label: "Both (Hybrid split)", value: "both" }
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Workout Time</label>
                      <Input
                        type="time"
                        value={formData.workoutTime || "07:30"}
                        onChange={(e) => handleSelect("workoutTime", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[var(--accent)]" /> Lifestyle & Recovery
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Align nutrition, sleep schedule, stress, and medical profiles.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Wake Time</label>
                      <Input
                        type="time"
                        value={formData.wakeTime || "06:30"}
                        onChange={(e) => handleSelect("wakeTime", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Sleep Time</label>
                      <Input
                        type="time"
                        value={formData.sleepTime || "22:30"}
                        onChange={(e) => handleSelect("sleepTime", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Water Intake (L/day)</label>
                      <Input
                        type="number"
                        step="0.5"
                        min={1}
                        max={10}
                        value={formData.waterIntake || ""}
                        onChange={(e) => handleSelect("waterIntake", parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Diet Preference</label>
                      <Dropdown
                        value={formData.foodPreference || "both"}
                        onChange={(val) => handleSelect("foodPreference", val as FoodPreference)}
                        options={[
                          { label: "Non-Veg (All Foods)", value: "both" },
                          { label: "Vegetarian (No meat/fish)", value: "veg" }
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Stress Level</label>
                      <Dropdown
                        value={formData.stressLevel || "medium"}
                        onChange={(val) => handleSelect("stressLevel", val as StressLevel)}
                        options={[
                          { label: "Low (Very relaxed)", value: "low" },
                          { label: "Medium (Workload pressure)", value: "medium" },
                          { label: "High (Exhausting/Hyper)", value: "high" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Occupation</label>
                      <Input
                        type="text"
                        placeholder="e.g. Sales Executive"
                        value={formData.occupation || ""}
                        onChange={(e) => handleSelect("occupation", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Allergies / Restrictions</label>
                      <Input
                        type="text"
                        placeholder="e.g. Peanuts, Gluten (or 'None')"
                        value={formData.allergies || ""}
                        onChange={(e) => handleSelect("allergies", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[var(--accent)]" /> AI Persona & Themes
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Tailor the AI Coach's psychological personality and UI styling.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">AI Coach Personality</label>
                      <Dropdown
                        value={formData.aiPersonality || "motivational"}
                        onChange={(val) => handleSelect("aiPersonality", val as AIPersonality)}
                        options={[
                          { label: "Motivational (Inspiring / Lion Cues)", value: "motivational" },
                          { label: "Analytical (Biomechanical Data Focus)", value: "analytical" },
                          { label: "Friendly (Empathetic / Supportive)", value: "friendly" },
                          { label: "Strict (Tough Love / Vikram Style)", value: "strict" }
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Theme Preference</label>
                      <Dropdown
                        value={formData.themePreference || "dark"}
                        onChange={(val) => handleSelect("themePreference", val as ThemePreference)}
                        options={[
                          { label: "Dark Mode (Power Saving)", value: "dark" },
                          { label: "Light Mode (High Contrast)", value: "light" },
                          { label: "Adaptive System Mode", value: "system" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide block">Available Equipment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "barbell", label: "Barbells / Plates" },
                        { id: "dumbbell", label: "Dumbbells" },
                        { id: "cables", label: "Pulley/Cables" },
                        { id: "machines", label: "Pin Machines" },
                        { id: "resistance-bands", label: "Resistance Bands" },
                        { id: "bodyweight", label: "Bodyweight Only" },
                      ].map((eq) => {
                        const isChecked = (formData.availableEquipment || []).includes(eq.id);
                        return (
                          <button
                            type="button"
                            key={eq.id}
                            onClick={() => handleEquipmentToggle(eq.id)}
                            className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition flex items-center justify-between ${
                              isChecked
                                ? "border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--foreground)]"
                                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
                            }`}
                          >
                            <span>{eq.label}</span>
                            {isChecked && <Check className="h-4 w-4 text-[var(--accent)]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[var(--accent)]" /> App Permissions
                  </h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Grant accesses to activate Project Titan computer vision & telemetry syncs.</p>
                </div>

                <GlassCard className="p-6">
                  <AnimatePresence mode="wait">
                    {permissionsList.map((permission, index) => (
                      permissionStep === index && (
                        <motion.div
                          key={permission.id}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${grantedPermissions.has(permission.id) ? "bg-[var(--accent-glow)] text-[var(--accent)]" : "bg-[var(--surface)] text-[var(--foreground-muted)]"}`}>
                              <permission.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white text-sm">{permission.title}</h3>
                              <p className="text-xs text-white/50 mt-1 leading-relaxed">{permission.description}</p>
                              {permission.required && (
                                <span className="inline-block mt-2 text-[9px] font-bold text-[var(--warning)] bg-[var(--warning-subtle)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Required OS Feature
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              type="button"
                              variant={grantedPermissions.has(permission.id) ? "premium" : "outline"}
                              className="flex-1"
                              onClick={() => {
                                if (!grantedPermissions.has(permission.id)) {
                                  handlePermissionToggle(permission.id);
                                }
                                nextPermission();
                              }}
                            >
                              {grantedPermissions.has(permission.id) ? "✓ Granted" : "Authorize Access"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="flex-1 text-white/50"
                              onClick={() => {
                                if (grantedPermissions.has(permission.id)) {
                                  handlePermissionToggle(permission.id);
                                }
                                nextPermission();
                              }}
                            >
                              Skip
                            </Button>
                          </div>

                          <div className="flex justify-center gap-2 mt-4">
                            {permissionsList.map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 w-4 rounded-full transition ${
                                  i === permissionStep ? "bg-[var(--accent)]" : "bg-[var(--border-subtle)]"
                                }`}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <ProgressRing progress={100} size={120} strokeWidth={8} color="var(--accent)" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-8 w-8 text-[var(--accent)]" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Titan OS Initialized</h2>
                  <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto">
                    Your custom physiological, training split, and AI personalities have been modeled. Welcome to hybrid human performance.
                  </p>
                </div>

                <div className="grid gap-2 text-left max-w-md mx-auto bg-black/20 border border-white/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Check className="h-4 w-4 text-[var(--success)]" />
                    <span>Calculated BMR TDEE target: **{formData.gender === "male" ? 2450 : 2180} kcal**</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Check className="h-4 w-4 text-[var(--success)]" />
                    <span>AI Coach Personality set to **{formData.aiPersonality}**</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Check className="h-4 w-4 text-[var(--success)]" />
                    <span>Computer vision permission status: **Granted**</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <Check className="h-4 w-4 text-[var(--success)]" />
                    <span>Health kit synchronizer connection: **Sync Ready**</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full"
                  size="lg"
                >
                  Start Your Fitness Journey
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
            {step > 1 && step !== 7 ? (
              <button
                type="button"
                onClick={step === 6 ? prevPermission : prevStep}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-xs font-semibold hover:bg-[var(--surface-hover)] transition text-white/70"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 && (
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-6 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition shadow-lg ml-auto"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
