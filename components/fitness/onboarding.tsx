"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  User, 
  Flame, 
  Activity, 
  Heart, 
  Camera, 
  Calendar, 
  MapPin, 
  Bell, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Monitor, 
  Ruler, 
  Sparkle,
  Building2,
  DollarSign,
  Languages
} from "lucide-react";
import { useFitness } from "@/components/providers/fitness-provider";
import { 
  ClientProfile, 
  Gender, 
  FitnessGoal, 
  ActivityLevel, 
  GymExperience, 
  FoodPreference, 
  Budget, 
  StressLevel, 
  WorkoutEnvironment, 
  AIPersonality, 
  ThemePreference, 
  Language,
  IndianLifestyleRole,
  FoodEnvironment
} from "@/types/profile";
import { SPORT_REGISTRY } from "@/lib/sports";
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
    title: "Camera Access (Local Vision)",
    description: "Required for the Smart Form Coach to run real-time posture analysis, rep counting, and joint angles locally in your browser.",
    icon: Camera,
    required: true,
  },
  {
    id: "health",
    title: "Health & Fitness Telemetry",
    description: "Allows syncing step counts, sleep latency, and heart rate baselines from wearable devices and sensors.",
    icon: Heart,
    required: true,
  },
  {
    id: "notifications",
    title: "Smart Notification Alerts",
    description: "Provides daily nutrient targets, hydration nudges, recovery warnings, and adaptive workout changes.",
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
    name: "Anil Kumar",
    age: 22,
    gender: "male",
    height: 174,
    weight: 68.5,
    goal: "fat-loss",
    bodyFat: 18,
    activityLevel: "moderately-active",
    gymExperience: "intermediate",
    dailyStepGoal: 8500,
    occupation: "College Student",
    workoutDaysPerWeek: 4,
    availableWorkoutTime: 35,
    medicalConditions: "None",
    injuries: "None",
    foodPreference: "both",
    allergies: "None",
    budget: "budget",
    dailyFoodBudget: 100,
    sleepDuration: 7.4,
    stressLevel: "medium",
    availableEquipment: ["bodyweight", "dumbbell"],
    lifestyle: "Hostel resident, busy college schedule",
    lifestyleRole: "college-student",
    foodEnvironment: "hostel-mess",
    neckCircumference: 36,
    legCircumference: 56,
    targetWeight: 65,
    timelineWeeks: 12,
    workoutEnvironment: "home",
    workoutTime: "07:30",
    wakeTime: "06:30",
    sleepTime: "22:30",
    waterIntake: 3.0,
    language: "en",
    aiPersonality: "motivational",
    themePreference: "dark",
    isHostelMode: true,
    userMode: "general-fitness",
    selectedSport: "football",
    sportLevel: "foundation",
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
      name: "Anil Kumar",
      age: 22,
      gender: "male",
      height: 174,
      weight: 68.5,
      goal: "fat-loss",
      bodyFat: 18.5,
      activityLevel: "moderately-active",
      gymExperience: "intermediate",
      dailyStepGoal: 8500,
      occupation: "College Student",
      workoutDaysPerWeek: 4,
      availableWorkoutTime: 35,
      medicalConditions: "None",
      injuries: "None",
      foodPreference: "both",
      allergies: "None",
      budget: "budget",
      dailyFoodBudget: 100,
      sleepDuration: 7.4,
      stressLevel: "medium",
      availableEquipment: ["bodyweight", "dumbbell"],
      lifestyle: "Hostel living, college classes, mess food",
      lifestyleRole: "college-student",
      foodEnvironment: "hostel-mess",
      workoutEnvironment: "home",
      isHostelMode: true,
      neckCircumference: 36,
      legCircumference: 56,
      targetWeight: 65,
      timelineWeeks: 12,
      language: "en",
      aiPersonality: "motivational",
      themePreference: "dark",
      permissions: {
        camera: true,
        health: true,
        calendar: false,
        notification: true,
        location: false,
      },
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
      setStep(7);
      return;
    }
    
    // Save to global state provider
    updateProfile({
      ...formData,
      permissions: {
        camera: grantedPermissions.has("camera"),
        health: grantedPermissions.has("health"),
        calendar: false,
        notification: grantedPermissions.has("notifications"),
        location: false,
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
        {/* App Header */}
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#adc6ff] to-[#4d8eff] text-[#131315]">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">Ojas AI</p>
              <p className="text-xs text-white/50">India-First AI Fitness Operating System</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadDemo}
            className="flex items-center gap-1.5 rounded-xl border border-[#adc6ff]/30 bg-[#adc6ff]/10 px-3.5 py-1.5 text-xs font-semibold text-[#adc6ff] hover:brightness-110 transition"
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
                        ? "border-[#4d8eff] bg-[#4d8eff] text-[#131315]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    {step > s ? <Check className="h-3.5 w-3.5" /> : s}
                  </div>
                  <span className={`ml-2 text-[10px] font-semibold hidden md:inline ${step === s ? "text-white" : "text-white/40"}`}>
                    {s === 1 && "Profile"}
                    {s === 2 && "Physical"}
                    {s === 3 && "Lifestyle"}
                    {s === 4 && "Nutrition"}
                    {s === 5 && "Language"}
                    {s === 6 && "Access"}
                  </span>
                </div>
                {s < 6 && <div className={`h-[2px] min-w-4 flex-1 ${step > s ? "bg-[#4d8eff]" : "bg-white/10"}`} />}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-[#adc6ff]" /> Step 1: Basic Profile
                  </h2>
                  <p className="text-xs text-white/50">Your name, age, and fitness goal.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Your Name</label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Anil Kumar"
                      value={formData.name || ""}
                      onChange={(e) => handleSelect("name", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Age (years)</label>
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
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Biological Sex</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["male", "female", "other"] as Gender[]).map((genderOption) => (
                          <button
                            type="button"
                            key={genderOption}
                            onClick={() => handleSelect("gender", genderOption)}
                            className={`rounded-xl border p-2.5 text-center text-xs font-semibold capitalize transition ${
                              formData.gender === genderOption
                                ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white"
                                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                            }`}
                          >
                            {genderOption}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* What do you want to achieve? */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">
                      What do you want to achieve?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "general-fitness", label: "General Fitness", desc: "Overall Health" },
                        { id: "sport-transition", label: "Start a Sport", desc: "Prepare Body" },
                        { id: "athlete-performance", label: "Improve in Sport", desc: "Performance" },
                        { id: "prepare-team", label: "Prepare for Team", desc: "Tryouts" },
                        { id: "maintain-sport", label: "Maintain Fitness", desc: "In-Season" },
                        { id: "return-to-activity", label: "Return to Activity", desc: "Reconditioning" },
                      ].map((item) => {
                        const isSelected = (formData.userMode || "general-fitness") === item.id || 
                          (item.id === "prepare-team" && formData.userMode === "sport-transition");
                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => {
                              const mode = item.id === "prepare-team" || item.id === "return-to-activity" 
                                ? "sport-transition" 
                                : item.id as any;
                              handleSelect("userMode", mode);
                            }}
                            className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between min-h-[56px] ${
                              isSelected
                                ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white shadow-md shadow-blue-500/10"
                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <span className="text-xs font-bold block">{item.label}</span>
                            <span className="text-[10px] text-white/50">{item.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sport Picker if sport goal selected */}
                  {formData.userMode !== "general-fitness" && (
                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] font-bold text-[#adc6ff] uppercase tracking-wide block">
                        Which sport do you want to pursue?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.values(SPORT_REGISTRY).map((s) => {
                          const isSelected = (formData.selectedSport || "football") === s.id;
                          return (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => handleSelect("selectedSport", s.id)}
                              className={`rounded-xl border p-2 text-center transition flex flex-col items-center gap-1 ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400/20 text-white shadow-md shadow-amber-500/10"
                                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span className="text-lg">{s.icon}</span>
                              <span className="text-xs font-bold">{s.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Primary Fitness Focus</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "fat-loss", label: "Fat Loss (Burn Fat)" },
                        { id: "muscle-gain", label: "Muscle Gain (Build Mass)" },
                        { id: "lean-bulk", label: "Lean Bulk (Aesthetic)" },
                        { id: "maintenance", label: "General Health & Stamina" },
                      ].map((g) => (
                        <button
                          type="button"
                          key={g.id}
                          onClick={() => handleSelect("goal", g.id)}
                          className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                            formData.goal === g.id
                              ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {g.label}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-[#adc6ff]" /> Step 2: Physical Measurements
                  </h2>
                  <p className="text-xs text-white/50">Calibrates your baseline metabolic rate and training volume.</p>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Height (cm)</label>
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
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Weight (kg)</label>
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Gym Experience</label>
                      <Dropdown
                        value={formData.gymExperience || "intermediate"}
                        onChange={(val) => handleSelect("gymExperience", val as GymExperience)}
                        options={[
                          { label: "Beginner (<1 year)", value: "beginner" },
                          { label: "Intermediate (1-3 years)", value: "intermediate" },
                          { label: "Advanced (3+ years)", value: "advanced" },
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Daily Step Goal</label>
                      <Input
                        type="number"
                        value={formData.dailyStepGoal || 8500}
                        onChange={(e) => handleSelect("dailyStepGoal", parseInt(e.target.value))}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#adc6ff]" /> Step 3: Indian Lifestyle Context
                  </h2>
                  <p className="text-xs text-white/50">Helps Ojas adapt workouts around your daily schedule and exercise environment.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Lifestyle Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "college-student", label: "College Student" },
                        { id: "working-professional", label: "Working Professional" },
                        { id: "homemaker", label: "Homemaker" },
                        { id: "athlete", label: "Athlete / Sports" },
                        { id: "beginner", label: "Beginner" },
                        { id: "other", label: "Other" },
                      ].map((role) => (
                        <button
                          type="button"
                          key={role.id}
                          onClick={() => handleSelect("lifestyleRole", role.id)}
                          className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition ${
                            formData.lifestyleRole === role.id
                              ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Exercise Location</label>
                      <Dropdown
                        value={formData.workoutEnvironment || "home"}
                        onChange={(val) => handleSelect("workoutEnvironment", val as WorkoutEnvironment)}
                        options={[
                          { label: "Home (Living room / Bedroom)", value: "home" },
                          { label: "Gym (Full equipment)", value: "gym" },
                          { label: "Outdoor (Ground / Park)", value: "outdoor" },
                          { label: "College Campus / Hostel", value: "college" },
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Available Workout Time</label>
                      <Dropdown
                        value={String(formData.availableWorkoutTime || 35)}
                        onChange={(val) => handleSelect("availableWorkoutTime", parseInt(val))}
                        options={[
                          { label: "10–15 mins (Express)", value: "15" },
                          { label: "20–30 mins (HIIT Density)", value: "25" },
                          { label: "30–45 mins (Balanced Split)", value: "35" },
                          { label: "45–60 mins (Full Session)", value: "50" },
                          { label: "60+ mins (Advanced)", value: "65" },
                        ]}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-400" /> Step 4: Food Environment & Daily Budget
                  </h2>
                  <p className="text-xs text-white/50">Personalize Indian nutrition recommendations to your actual eating setup.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Food Environment</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "hostel-mess", label: "Hostel / College Mess" },
                        { id: "home-cooked", label: "Home Cooked Meals" },
                        { id: "restaurant-tiffin", label: "Tiffin Center / Out" },
                        { id: "meal-service", label: "Meal Subscription / Mixed" },
                      ].map((env) => (
                        <button
                          type="button"
                          key={env.id}
                          onClick={() => {
                            handleSelect("foodEnvironment", env.id);
                            if (env.id === "hostel-mess") handleSelect("isHostelMode", true);
                          }}
                          className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${
                            formData.foodEnvironment === env.id
                              ? "border-emerald-500 bg-emerald-500/20 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {env.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Daily Food Budget (INR)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 150, 250].map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => handleSelect("dailyFoodBudget", b)}
                          className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                            formData.dailyFoodBudget === b
                              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                              : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          ₹{b}/day
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Dietary Preference</label>
                      <Dropdown
                        value={formData.foodPreference || "both"}
                        onChange={(val) => handleSelect("foodPreference", val as FoodPreference)}
                        options={[
                          { label: "Non-Veg (Chicken, Fish, Eggs, Veg)", value: "both" },
                          { label: "Eggitarian (Eggs + Vegetarian)", value: "eggitarian" },
                          { label: "Pure Vegetarian (Dairy, Dal, Paneer)", value: "veg" },
                          { label: "Vegan (100% Plant Based)", value: "vegan" },
                        ]}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Sleep Target (hours)</label>
                      <Input
                        type="number"
                        step="0.5"
                        min={4}
                        max={12}
                        value={formData.sleepDuration || 7.4}
                        onChange={(e) => handleSelect("sleepDuration", parseFloat(e.target.value))}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Languages className="h-5 w-5 text-[#adc6ff]" /> Step 5: Indian Language & AI Voice
                  </h2>
                  <p className="text-xs text-white/50">Select your preferred language for the AI Coach and Daily Decisions.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Preferred Language</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "en", label: "English" },
                        { id: "te", label: "తెలుగు (Telugu)" },
                        { id: "hi", label: "हिन्दी (Hindi)" },
                        { id: "ta", label: "தமிழ் (Tamil)" },
                        { id: "kn", label: "ಕನ್ನಡ (Kannada)" },
                        { id: "ml", label: "മലയാളം (Malayalam)" },
                        { id: "mr", label: "मराठी (Marathi)" },
                        { id: "bn", label: "বাংলা (Bengali)" },
                      ].map((lang) => (
                        <button
                          type="button"
                          key={lang.id}
                          onClick={() => handleSelect("language", lang.id)}
                          className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                            formData.language === lang.id
                              ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white"
                              : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/60 uppercase tracking-wide block">Available Equipment</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "bodyweight", label: "Bodyweight Only" },
                        { id: "dumbbell", label: "Dumbbells" },
                        { id: "resistance-bands", label: "Resistance Bands" },
                        { id: "barbell", label: "Barbell & Plates" },
                        { id: "cables", label: "Cable Machine" },
                        { id: "pullup-bar", label: "Pull-up Bar" },
                      ].map((eq) => {
                        const isChecked = (formData.availableEquipment || []).includes(eq.id);
                        return (
                          <button
                            type="button"
                            key={eq.id}
                            onClick={() => handleEquipmentToggle(eq.id)}
                            className={`rounded-xl border p-3 text-left text-xs font-semibold transition flex items-center justify-between ${
                              isChecked
                                ? "border-[#4d8eff] bg-[#4d8eff]/20 text-white"
                                : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                            }`}
                          >
                            <span>{eq.label}</span>
                            {isChecked && <Check className="h-4 w-4 text-[#4d8eff]" />}
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
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#adc6ff]" /> Step 6: Privacy & Local Permissions
                  </h2>
                  <p className="text-xs text-white/50">Ojas processes vision and pose tracking locally in your browser for privacy.</p>
                </div>

                <div className="space-y-3">
                  {permissionsList.map((perm) => {
                    const isGranted = grantedPermissions.has(perm.id);
                    const Icon = perm.icon;
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handlePermissionToggle(perm.id)}
                        className={`rounded-2xl border p-4 cursor-pointer transition flex items-start gap-3.5 ${
                          isGranted
                            ? "border-[#4d8eff]/40 bg-[#4d8eff]/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white/10 text-[#adc6ff] shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{perm.title}</h4>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${isGranted ? "bg-[#4d8eff] border-[#4d8eff] text-black" : "border-white/20"}`}>
                              {isGranted && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-white/60 mt-1 leading-relaxed">{perm.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-6"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-xl shadow-emerald-500/20">
                  <Check className="h-8 w-8 stroke-[2.5]" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Ojas Intelligence Initialized
                  </h2>
                  <p className="text-xs text-white/60 max-w-md mx-auto">
                    Your profile for <strong>{formData.name}</strong> ({formData.lifestyleRole?.replace("-", " ")}, ₹{formData.dailyFoodBudget}/day budget) has been synchronized with the Ojas Decision Engine.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <span className="text-[10px] text-white/40 block">Workout Mode</span>
                    <strong className="text-xs text-[#adc6ff]">{formData.availableWorkoutTime}m {formData.workoutEnvironment}</strong>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <span className="text-[10px] text-white/40 block">Food Context</span>
                    <strong className="text-xs text-amber-300">{formData.foodEnvironment?.split("-")[0]}</strong>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <span className="text-[10px] text-white/40 block">Language</span>
                    <strong className="text-xs text-emerald-300 uppercase">{formData.language}</strong>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full max-w-sm bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] text-[#131315] font-extrabold text-sm py-6 rounded-2xl shadow-xl shadow-blue-500/20 hover:brightness-110"
                >
                  ENTER OJAS FITNESS OS <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Nav Buttons */}
          {step < 7 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-1 text-xs font-semibold text-white/60 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}

              <Button
                type="submit"
                className="bg-[#adc6ff] hover:bg-white text-[#131315] font-bold text-xs px-6 py-2 rounded-xl"
              >
                {step === 6 ? "Finish Setup" : "Next Step"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
