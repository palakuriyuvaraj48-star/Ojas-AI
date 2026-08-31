"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

import { ClientProfile, DailyLog, WeeklyCheckIn, Message } from "@/types/profile";
export type { ClientProfile, DailyLog, WeeklyCheckIn, Message };

import { 
  buildCoachContext, 
  parseIntent, 
  generateCoachReply, 
  extractMemory, 
  getMemory, 
  saveMemory, 
  mergeMemory, 
  pushRecommendation 
} from "@/lib/coach";
import { buildSignals, computeRecovery } from "@/lib/recovery";

import { DigitalTwin, TwinEvent, TwinDelta } from "@/lib/digital-twin/types";
import { createInitialTwin, applyEventToTwin } from "@/lib/digital-twin/engine";
import { computeAdaptiveDecision, AdaptiveDecisionResult } from "@/lib/decision-engine/adaptive-decision-engine";
import { processFeedbackAndLearn, SessionFeedback, FeedbackProcessingResult } from "@/lib/decision-engine/behavioral-learning";
import { runWhatIfSimulation, SimulationScenario, SimulationResult } from "@/lib/simulation/what-if-engine";

interface FitnessContextType {
  profile: ClientProfile | null;
  digitalTwin: DigitalTwin;
  twinHistory: DigitalTwin[];
  twinDeltas: TwinDelta[];
  dailyDecision: AdaptiveDecisionResult;
  dispatchTwinEvent: (event: TwinEvent) => void;
  submitSessionFeedback: (feedback: SessionFeedback) => FeedbackProcessingResult;
  runSimulation: (scenario: SimulationScenario) => SimulationResult;
  dailyLog: DailyLog;
  logsHistory: DailyLog[];
  checkInHistory: WeeklyCheckIn[];
  chatHistory: Message[];
  activeWorkout: {
    completedExercises: string[];
    timerSeconds: number;
    isTimerRunning: boolean;
    currentWorkoutId: string | null;
  };
  metrics: {
    bmi: number;
    healthyWeightRange: { min: number; max: number };
    estimatedBodyFat: number;
    lbm: number;
    ffmi: number;
    ffmiCategory: string;
    bmr: number;
    tdee: number;
    metabolicCategory: string;
  } | null;
  calorieTargets: {
    maintenance: number;
    fatLoss: number;
    leanBulk: number;
    muscleGain: number;
    activeTarget: number;
  } | null;
  macroTargets: {
    protein: { grams: number; calories: number; pct: number };
    fat: { grams: number; calories: number; pct: number };
    carbs: { grams: number; calories: number; pct: number };
    fiber: number;
    water: number;
    sodium: string;
  } | null;
  streak: number;
  isOnboarded: boolean;
  updateProfile: (profile: Partial<ClientProfile>) => void;
  logFood: (calories: number, protein: number, carbs: number, fat: number, fiber?: number) => void;
  logWater: (liters: number) => void;
  logSteps: (steps: number) => void;
  completeWorkout: (duration: number, id: string) => void;
  toggleExercise: (exerciseId: string) => void;
  setWorkoutId: (id: string | null) => void;
  addMessage: (text: string, sender: "user" | "coach") => void;
  submitCheckIn: (checkIn: Omit<WeeklyCheckIn, "adjustments">) => WeeklyCheckIn["adjustments"];
  resetData: () => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// A useful workspace should be useful on first launch. Local data, when present,
// still takes precedence in the hydration effect below.
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
  availableEquipment: ["Bodyweight", "Dumbbells"],
  lifestyle: "Hostel resident, college schedule, mess dining",
  lifestyleRole: "college-student",
  foodEnvironment: "hostel-mess",
  workoutEnvironment: "home",
  isHostelMode: true,
  neckCircumference: 36,
  legCircumference: 56,
  targetWeight: 65,
  timelineWeeks: 12,
  language: "en",
};

export function FitnessProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<ClientProfile | null>(demoProfile);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwin>(() => createInitialTwin(demoProfile));
  const [twinHistory, setTwinHistory] = useState<DigitalTwin[]>([]);
  const [twinDeltas, setTwinDeltas] = useState<TwinDelta[]>([]);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [logsHistory, setLogsHistory] = useState<DailyLog[]>([]);
  const [checkInHistory, setCheckInHistory] = useState<WeeklyCheckIn[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  
  // Daily consumption log for current day
  const getTodayDateStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: getTodayDateStr(),
    caloriesConsumed: 1240,
    proteinConsumed: 86,
    carbsConsumed: 128,
    fatConsumed: 36,
    waterConsumed: 1.5,
    stepsCount: 5640,
    workoutCompleted: false,
    workoutDuration: 0,
    fiberConsumed: 18,
  });

  const [activeWorkout, setActiveWorkout] = useState({
    completedExercises: [] as string[],
    timerSeconds: 0,
    isTimerRunning: false,
    currentWorkoutId: null as string | null,
  });

  // Calculate Streak
  const [streak, setStreak] = useState<number>(12);

  const calculateLBM = (p: Partial<ClientProfile>) => {
    const weight = p.weight ?? 68.5;
    const height = p.height ?? 174;
    const gender = p.gender ?? "male";
    if (p.bodyFat && p.bodyFat > 0) {
      return weight * (1 - p.bodyFat / 100);
    }
    // Boer Formula
    if (gender === "male") {
      return 0.407 * weight + 0.267 * height - 19.2;
    } else {
      return 0.252 * weight + 0.473 * height - 48.3;
    }
  };

  const calculateTDEE = (p: Partial<ClientProfile>) => {
    const weight = p.weight ?? 68.5;
    const height = p.height ?? 174;
    const age = p.age ?? 22;
    const gender = p.gender ?? "male";
    const activityLevel = p.activityLevel ?? "moderately-active";

    let bmrVal = 0;
    if (gender === "male") {
      bmrVal = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmrVal = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let factor = 1.2;
    switch (activityLevel) {
      case "sedentary": factor = 1.2; break;
      case "lightly-active": factor = 1.375; break;
      case "moderately-active": factor = 1.55; break;
      case "very-active": factor = 1.725; break;
      case "extra-active": factor = 1.9; break;
      default: factor = 1.55; break;
    }

    return bmrVal * factor;
  };

  // Compute metrics if profile exists
  let metrics: FitnessContextType["metrics"] = null;
  let calorieTargets: FitnessContextType["calorieTargets"] = null;
  let macroTargets: FitnessContextType["macroTargets"] = null;

  if (profile) {
    const height = profile.height ?? 174;
    const weight = profile.weight ?? 68.5;
    const age = profile.age ?? 22;
    const gender = profile.gender ?? "male";
    const goal = profile.goal ?? "fat-loss";

    const hMeters = (height || 174) / 100;
    const bmi = weight / (hMeters * hMeters);
    const healthyWeightRange = {
      min: 18.5 * hMeters * hMeters,
      max: 24.9 * hMeters * hMeters,
    };
    
    let estBF = profile.bodyFat || 0;
    if (!estBF) {
      const gFactor = gender === "male" ? 1 : 0;
      estBF = (1.20 * bmi) + (0.23 * age) - (10.8 * gFactor) - 5.4;
      if (estBF < 3) estBF = 3;
    }

    const lbm = calculateLBM(profile);
    const ffmi = lbm / (hMeters * hMeters);
    
    let ffmiCategory = "Average";
    if (gender === "male") {
      if (ffmi >= 25) ffmiCategory = "Steroid-like baseline / Elite Genetic Upper Limit";
      else if (ffmi >= 22) ffmiCategory = "Excellent (Highly Trained)";
      else if (ffmi >= 20) ffmiCategory = "Above Average";
      else if (ffmi >= 18) ffmiCategory = "Average";
      else ffmiCategory = "Below Average";
    } else {
      if (ffmi >= 22) ffmiCategory = "Elite Upper Limit";
      else if (ffmi >= 19) ffmiCategory = "Excellent (Highly Trained)";
      else if (ffmi >= 17) ffmiCategory = "Above Average";
      else if (ffmi >= 15) ffmiCategory = "Average";
      else ffmiCategory = "Below Average";
    }

    const bmr = gender === "male"
      ? (10 * weight + 6.25 * height - 5 * age + 5)
      : (10 * weight + 6.25 * height - 5 * age - 161);

    const tdee = calculateTDEE(profile);
    
    const metabolicRatio = tdee / (bmr || 1);
    let metabolicCategory = "Standard metabolism";
    if (metabolicRatio > 1.65) metabolicCategory = "Highly Active / Hyper-metabolic";
    else if (metabolicRatio < 1.35) metabolicCategory = "Sedentary / Adaptive Downregulation Risk";
    else metabolicCategory = "Healthy / Active metabolism";

    metrics = {
      bmi,
      healthyWeightRange,
      estimatedBodyFat: estBF,
      lbm,
      ffmi,
      ffmiCategory,
      bmr,
      tdee,
      metabolicCategory,
    };

    const maintenance = Math.round(tdee);
    let fatLoss = Math.round(tdee - 450);
    const minCalories = gender === "male" ? 1500 : 1200;
    if (fatLoss < minCalories) fatLoss = minCalories;

    const leanBulk = Math.round(tdee + 250);
    const muscleGain = Math.round(tdee + 350);

    let activeTarget = maintenance;
    if (goal === "fat-loss") activeTarget = fatLoss;
    else if (goal === "lean-bulk") activeTarget = leanBulk;
    else if (goal === "muscle-gain") activeTarget = muscleGain;

    if (checkInHistory.length > 0) {
      const latestCheckIn = checkInHistory[checkInHistory.length - 1];
      activeTarget = activeTarget + (latestCheckIn?.adjustments?.calorieDelta || 0);
    }

    calorieTargets = {
      maintenance,
      fatLoss,
      leanBulk,
      muscleGain,
      activeTarget,
    };

    let proteinGrams = 0;
    if (goal === "fat-loss") {
      proteinGrams = Math.round(lbm * 2.3);
    } else {
      proteinGrams = Math.round(weight * 2.0);
    }
    proteinGrams = Math.max(120, Math.min(proteinGrams, Math.round(weight * 2.5)));
    
    let fatGrams = Math.round((activeTarget * 0.25) / 9);
    const minFat = Math.round(weight * 0.7);
    if (fatGrams < minFat) fatGrams = minFat;

    const proteinCal = proteinGrams * 4;
    const fatCal = fatGrams * 9;
    let carbCal = activeTarget - proteinCal - fatCal;
    if (carbCal < 50 * 4) {
      carbCal = 100 * 4;
      fatGrams = Math.round((activeTarget - proteinCal - carbCal) / 9);
    }
    const carbGrams = Math.round(carbCal / 4);

    const actualTotalCal = (proteinGrams * 4) + (fatGrams * 9) + (carbGrams * 4);

    macroTargets = {
      protein: {
        grams: proteinGrams,
        calories: proteinGrams * 4,
        pct: Math.round((proteinGrams * 4 / (actualTotalCal || 1)) * 100),
      },
      fat: {
        grams: fatGrams,
        calories: fatGrams * 9,
        pct: Math.round((fatGrams * 9 / (actualTotalCal || 1)) * 100),
      },
      carbs: {
        grams: carbGrams,
        calories: carbGrams * 4,
        pct: Math.round((carbGrams * 4 / (actualTotalCal || 1)) * 100),
      },
      fiber: Math.round((activeTarget / 1000) * 14),
      water: Number((0.035 * weight).toFixed(1)),
      sodium: "1,500 - 2,300 mg (ACSM standard, adjust for sweating)",
    };
  }

  // Load from local storage
  useEffect(() => {
    try {
      const storedTwin = localStorage.getItem("ojas_digital_twin_v2");
      if (storedTwin) {
        try {
          const parsed = JSON.parse(storedTwin);
          if (parsed && typeof parsed === "object") {
            setDigitalTwin(parsed);
          }
        } catch {
          // ignore
        }
      }

      const storedProfile = localStorage.getItem("lumina_profile");
      const storedLogs = localStorage.getItem("lumina_logs");
      const storedCheckIns = localStorage.getItem("lumina_checkins");
      const storedChat = localStorage.getItem("lumina_chat");

      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile && typeof parsedProfile === "object") {
          setProfileState({
            ...demoProfile,
            ...parsedProfile,
            goal: parsedProfile.goal || demoProfile.goal || "fat-loss",
            activityLevel: parsedProfile.activityLevel || demoProfile.activityLevel || "moderately-active",
          });
          setIsOnboarded(true);
        }
      }
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs) as DailyLog[];
        setLogsHistory(parsedLogs);
        
        // Find if we have logs for today
        const todayStr = getTodayDateStr();
        const todayLog = parsedLogs.find((l) => l.date === todayStr);
        if (todayLog) {
          setDailyLog(todayLog);
        } else {
          setDailyLog({
            date: todayStr,
            caloriesConsumed: 0,
            proteinConsumed: 0,
            carbsConsumed: 0,
            fatConsumed: 0,
            waterConsumed: 0,
            stepsCount: 0,
            workoutCompleted: false,
            workoutDuration: 0,
            fiberConsumed: 0,
          });
        }
      }
      if (storedCheckIns) {
        setCheckInHistory(JSON.parse(storedCheckIns));
      }
      if (storedChat) {
        setChatHistory(JSON.parse(storedChat));
      } else {
        // Welcome message
        setChatHistory([
          {
            sender: "coach",
            text: "Welcome to AI Coach Lens! I'm your elite AI Fitness Coach. Complete your profile details so I can construct a scientific nutrition, training, and recovery program tailored to your biology.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }
    } catch (e) {
      console.error("Error loading localStorage", e);
    }
  }, []);

  // Update Streak
  useEffect(() => {
    if (logsHistory.length === 0) return;
    
    // Sort logs descending
    const sortedLogs = [...logsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const todayStr = getTodayDateStr();
    const checkDate = new Date(todayStr);

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const log = sortedLogs.find((l) => l.date === dateStr);
      
      // If today has no log yet, that's fine, we check yesterday
      if (i === 0 && (!log || (log.caloriesConsumed === 0 && log.stepsCount === 0 && !log.workoutCompleted))) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (log && (log.caloriesConsumed > 0 || log.stepsCount > 1000 || log.workoutCompleted)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, [logsHistory, dailyLog]);

  // Save profile and compute updates
  const updateProfile = (updatedFields: Partial<ClientProfile>) => {
    let mergedProfile: ClientProfile = demoProfile;
    setProfileState((prev) => {
      mergedProfile = {
        ...(prev || demoProfile),
        ...updatedFields,
      };
      try {
        localStorage.setItem("lumina_profile", JSON.stringify(mergedProfile));
      } catch (e) {
        console.error("Error saving profile to localStorage", e);
      }
      return mergedProfile;
    });

    const isFirstTime = !isOnboarded;
    setIsOnboarded(true);

    // Seed chat history only if onboarding for the very first time
    if (isFirstTime) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentGoal = (updatedFields.goal || profile?.goal || "maintenance").replace("-", " ");
      const currentWeight = updatedFields.weight ?? profile?.weight ?? 68.5;
      const welcome: Message[] = [
        {
          sender: "coach",
          text: `Onboarding completed! Welcome, client. Based on your profile (${currentWeight}kg, aiming for ${currentGoal}), I have computed your exact metabolic baseline and custom workout splits.`,
          timestamp: time,
        },
        {
          sender: "coach",
          text: `Your daily TDEE is approximately ${Math.round(calculateTDEE(mergedProfile))} kcal. I have loaded a custom layout for you in the Dashboard and Food Scanner. Let me know if you have any questions!`,
          timestamp: time,
        }
      ];
      setChatHistory((prev) => {
        const updated = [...prev, ...welcome];
        try {
          localStorage.setItem("lumina_chat", JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving chat history to localStorage", e);
        }
        return updated;
      });
    }
  };

  const saveDailyLog = (updatedLog: DailyLog) => {
    setDailyLog(updatedLog);
    setLogsHistory((prev) => {
      const idx = prev.findIndex((l) => l.date === updatedLog.date);
      let newHistory = [];
      if (idx !== -1) {
        newHistory = [...prev];
        newHistory[idx] = updatedLog;
      } else {
        newHistory = [...prev, updatedLog];
      }
      localStorage.setItem("lumina_logs", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const logFood = (calories: number, protein: number, carbs: number, fat: number, fiber = 0) => {
    const updated = {
      ...dailyLog,
      caloriesConsumed: dailyLog.caloriesConsumed + calories,
      proteinConsumed: dailyLog.proteinConsumed + protein,
      carbsConsumed: dailyLog.carbsConsumed + carbs,
      fatConsumed: dailyLog.fatConsumed + fat,
      fiberConsumed: (dailyLog.fiberConsumed ?? 0) + fiber,
    };
    saveDailyLog(updated);
  };

  const logWater = (liters: number) => {
    const updated = {
      ...dailyLog,
      waterConsumed: Number((dailyLog.waterConsumed + liters).toFixed(2)),
    };
    saveDailyLog(updated);
  };

  const logSteps = (steps: number) => {
    const updated = {
      ...dailyLog,
      stepsCount: dailyLog.stepsCount + steps,
    };
    saveDailyLog(updated);
  };

  const dispatchTwinEvent = (event: TwinEvent) => {
    setDigitalTwin((prev) => {
      const { updatedTwin, delta } = applyEventToTwin(prev, event);
      try {
        localStorage.setItem("ojas_digital_twin_v2", JSON.stringify(updatedTwin));
      } catch (e) {
        console.error("Error saving digital twin", e);
      }
      setTwinDeltas((d) => [delta, ...d].slice(0, 20));
      setTwinHistory((h) => [updatedTwin, ...h].slice(0, 20));
      return updatedTwin;
    });
  };

  const submitSessionFeedback = (feedback: SessionFeedback): FeedbackProcessingResult => {
    let result: FeedbackProcessingResult = {
      updatedTwin: digitalTwin,
      learnedInsights: [],
      nextDayAdjustment: "Proceed with scheduled plan",
    };
    setDigitalTwin((prev) => {
      result = processFeedbackAndLearn(prev, feedback);
      try {
        localStorage.setItem("ojas_digital_twin_v2", JSON.stringify(result.updatedTwin));
      } catch (e) {
        console.error("Error saving digital twin after feedback", e);
      }
      return result.updatedTwin;
    });
    return result;
  };

  const runSimulation = (scenario: SimulationScenario): SimulationResult => {
    return runWhatIfSimulation(digitalTwin, profile, scenario);
  };

  const dailyDecision = computeAdaptiveDecision(digitalTwin, profile, dailyLog, logsHistory);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const completeWorkout = (duration: number, _id: string) => {
    const updated = {
      ...dailyLog,
      workoutCompleted: true,
      workoutDuration: dailyLog.workoutDuration + duration,
    };
    saveDailyLog(updated);
    dispatchTwinEvent({
      id: `evt_wo_${Date.now()}`,
      type: "WORKOUT_COMPLETED",
      userId: profile?.name || "ojas_user",
      timestamp: new Date().toISOString(),
      payload: {
        durationMinutes: duration,
        formScore: 90,
      },
    });
    setActiveWorkout((prev) => ({
      ...prev,
      completedExercises: [],
      timerSeconds: 0,
      isTimerRunning: false,
      currentWorkoutId: null,
    }));
  };

  const toggleExercise = (exerciseId: string) => {
    setActiveWorkout((prev) => {
      const exists = prev.completedExercises.includes(exerciseId);
      const completedExercises = exists
        ? prev.completedExercises.filter((id) => id !== exerciseId)
        : [...prev.completedExercises, exerciseId];
      return { ...prev, completedExercises };
    });
  };

  const setWorkoutId = (id: string | null) => {
    setActiveWorkout((prev) => ({
      ...prev,
      currentWorkoutId: id,
    }));
  };

  const addMessage = async (text: string, sender: "user" | "coach") => {
    if (!profile) return;
    const userMsg: Message = {
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => {
      const updated = [...prev, userMsg];
      localStorage.setItem("lumina_chat", JSON.stringify(updated));
      return updated;
    });

    if (sender === "user") {
      // Create temporary coach message for streaming / typing feedback
      const tempTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const coachMsg: Message = {
        sender: "coach",
        text: "Thinking...",
        timestamp: tempTimestamp,
      };
      
      setChatHistory((prev) => [...prev, coachMsg]);

      try {
        const isOffline = typeof window !== "undefined" && !window.navigator.onLine;
        if (isOffline) {
          throw new Error("offline");
        }

        const signals = buildSignals({
          profile,
          dailyLog,
          logsHistory,
          hydrationTarget: macroTargets?.water,
        });
        const recResult = computeRecovery(signals, { previousScore: 70 });
        const recovery = {
          score: recResult.score,
          readiness: recResult.readiness,
          fatigue: recResult.fatigueLevel,
          confidence: recResult.confidence,
          recommendationLabel: recResult.recommendation.label,
          muscleReadiness: recResult.muscleReadiness.map((m) => ({ muscle: m.muscle, readiness: m.readiness, soreness: m.soreness })),
        };
        const memory = getMemory();

        const response = await fetch("/api/coach/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            profile,
            dailyLog,
            logsHistory,
            checkInHistory,
            macroTargets,
            calorieTargets,
            metrics,
            recovery,
            memory,
          }),
        });

        if (!response.ok) throw new Error("Stream endpoint failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            fullText += chunk;

            setChatHistory((prev) =>
              prev.map((msg) =>
                msg.timestamp === tempTimestamp && msg.sender === "coach"
                  ? { ...msg, text: fullText }
                  : msg
              )
            );
          }
        }

        // Secondary call to sync memory updates and fetch recommendations
        const detailsRes = await fetch("/api/coach/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            profile,
            dailyLog,
            logsHistory,
            checkInHistory,
            macroTargets,
            calorieTargets,
            metrics,
            recovery,
            memory,
            onClientSave: false,
          }),
        });

        if (detailsRes.ok) {
          const data = await detailsRes.json();
          setChatHistory((prev) => {
            const updated = prev.map((msg) =>
              msg.timestamp === tempTimestamp && msg.sender === "coach"
                ? {
                    ...msg,
                    text: data.reply || fullText,
                    recommendation: data.recommendation,
                    cards: data.cards,
                    safety: data.safety,
                  }
                : msg
            );
            localStorage.setItem("lumina_chat", JSON.stringify(updated));
            return updated;
          });

          if (data.memory) saveMemory(data.memory);
          if (data.recommendation) pushRecommendation(data.recommendation);
        }

      } catch (err: any) {
        console.warn("AI Stream error, falling back to local computation:", err);
        
        // Local fallback computations
        const signals = buildSignals({
          profile,
          dailyLog,
          logsHistory,
          hydrationTarget: macroTargets?.water,
        });
        const recResult = computeRecovery(signals, { previousScore: 70 });
        const recovery = {
          score: recResult.score,
          readiness: recResult.readiness,
          fatigue: recResult.fatigueLevel,
          confidence: recResult.confidence,
          recommendationLabel: recResult.recommendation.label,
          muscleReadiness: recResult.muscleReadiness.map((m) => ({ muscle: m.muscle, readiness: m.readiness, soreness: m.soreness })),
        };
        const memory = getMemory();
        const ctx = buildCoachContext({
          profile,
          dailyLog,
          logsHistory,
          checkInHistory,
          macroTargets,
          calorieTargets,
          metrics,
          recovery,
          memory,
        });

        const parsed = parseIntent(text, ctx);
        const reply = generateCoachReply(text, ctx, parsed);

        // Queue message if offline
        const isOffline = typeof window !== "undefined" && !window.navigator.onLine;
        if (isOffline) {
          const queue = JSON.parse(localStorage.getItem("titan_offline_queue") || "[]") as string[];
          if (!queue.includes(text)) {
            queue.push(text);
            localStorage.setItem("titan_offline_queue", JSON.stringify(queue));
          }
        }

        // Simulate typing flow for user feedback
        let wordIndex = 0;
        const words = reply.text.split(/(\s+)/);
        let streamText = "";

        const interval = setInterval(() => {
          if (wordIndex >= words.length) {
            clearInterval(interval);
            setChatHistory((prev) => {
              const updated = prev.map((msg) =>
                msg.timestamp === tempTimestamp && msg.sender === "coach"
                  ? {
                      ...msg,
                      text: reply.text,
                      recommendation: reply.recommendation,
                      cards: reply.cards,
                      safety: reply.safety,
                    }
                  : msg
              );
              localStorage.setItem("lumina_chat", JSON.stringify(updated));
              return updated;
            });

            // Sync memory locally
            const memUpdate = extractMemory(text, { ...ctx, memory });
            if (memUpdate) mergeMemory(memUpdate);
            if (reply.recommendation) pushRecommendation(reply.recommendation);
            return;
          }

          streamText += words[wordIndex];
          wordIndex++;

          setChatHistory((prev) =>
            prev.map((msg) =>
              msg.timestamp === tempTimestamp && msg.sender === "coach"
                ? { ...msg, text: streamText }
                : msg
            )
          );
        }, 20);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      if (!profile) return;
      const queue = JSON.parse(localStorage.getItem("titan_offline_queue") || "[]") as string[];
      if (queue.length === 0) return;

      console.log("Reconnected to internet. Syncing queued messages:", queue);
      localStorage.removeItem("titan_offline_queue");

      for (const text of queue) {
        try {
          const signals = buildSignals({
            profile,
            dailyLog,
            logsHistory,
            hydrationTarget: macroTargets?.water,
          });
          const recResult = computeRecovery(signals, { previousScore: 70 });
          const recovery = {
            score: recResult.score,
            readiness: recResult.readiness,
            fatigue: recResult.fatigueLevel,
            confidence: recResult.confidence,
            recommendationLabel: recResult.recommendation.label,
            muscleReadiness: recResult.muscleReadiness.map((m) => ({ muscle: m.muscle, readiness: m.readiness, soreness: m.soreness })),
          };
          const memory = getMemory();

          await fetch("/api/coach/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              profile,
              dailyLog,
              logsHistory,
              checkInHistory,
              macroTargets,
              calorieTargets,
              metrics,
              recovery,
              memory,
            }),
          });
        } catch {
          // Re-queue on failure
          const currentQueue = JSON.parse(localStorage.getItem("titan_offline_queue") || "[]") as string[];
          currentQueue.push(text);
          localStorage.setItem("titan_offline_queue", JSON.stringify(currentQueue));
          break;
        }
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [profile, dailyLog, logsHistory, checkInHistory, macroTargets, calorieTargets, metrics]);

  const resetData = () => {
    localStorage.removeItem("lumina_profile");
    localStorage.removeItem("lumina_logs");
    localStorage.removeItem("lumina_checkins");
    localStorage.removeItem("lumina_chat");
    setProfileState(demoProfile);
    setIsOnboarded(true);
    setLogsHistory([]);
    setCheckInHistory([]);
    setStreak(12);
    setChatHistory([
      {
        sender: "coach",
        text: "Reset successful. Welcome back. Let's restart your fitness journey with scientific guidance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setDailyLog({
      date: getTodayDateStr(),
      caloriesConsumed: 1240,
      proteinConsumed: 86,
      carbsConsumed: 128,
      fatConsumed: 36,
      waterConsumed: 1.5,
      stepsCount: 5640,
      workoutCompleted: false,
      workoutDuration: 0,
      fiberConsumed: 18,
    });
  };



  const submitCheckIn = (checkIn: Omit<WeeklyCheckIn, "adjustments">) => {
    if (!profile || !calorieTargets) {
      return { calorieDelta: 0, stepDelta: 0, volumeDelta: "maintain", reason: "Error: profile unavailable." };
    }

    const isFatLoss = profile.goal === "fat-loss";
    const isGain = profile.goal === "muscle-gain" || profile.goal === "lean-bulk";
    
    let lastWeight = profile.weight;
    if (checkInHistory.length > 0) {
      lastWeight = checkInHistory[checkInHistory.length - 1].weight;
    } else {
      lastWeight = profile.weight;
    }

    const weightDelta = checkIn.weight - lastWeight;
    let calorieDelta = 0;
    let stepDelta = 0;
    let volumeDelta: "reduce" | "maintain" | "increase" = "maintain";
    let reason = "Weight is trending on track. Maintain current training volume and calories.";

    if (isFatLoss) {
      if (weightDelta > -0.2) {
        calorieDelta = -150;
        stepDelta = 2000;
        reason = `Weight loss is slower than target (change of ${weightDelta.toFixed(2)}kg). Adjusted calories by -150 kcal and increased daily step goal by 2,000 steps to boost metabolic rate.`;
      } else if (weightDelta < -1.2) {
        calorieDelta = 200;
        stepDelta = -1000;
        reason = `Weight loss is too rapid (${weightDelta.toFixed(2)}kg in one week), risking muscle catabolism and metabolic adaptation. Increased calories by +200 kcal to protect lean body mass.`;
      }
    } else if (isGain) {
      if (weightDelta < 0.1) {
        calorieDelta = 150;
        reason = `Lean gain is below targets (change of ${weightDelta.toFixed(2)}kg). Added +150 kcal to increase muscle protein synthesis requirements.`;
      } else if (weightDelta > 0.8) {
        calorieDelta = -150;
        reason = `Weight gain is too fast (${weightDelta.toFixed(2)}kg), indicating excess fat accumulation. Reduced calorie surplus by 150 kcal.`;
      }
    }

    if (checkIn.strengthLevel === "decreased") {
      volumeDelta = "reduce";
      reason += " Strength drop detected. Initiating a recovery deload (reducing set volume) and review sleep/carbohydrates.";
    }

    if (checkIn.sleepQuality === "poor" && checkIn.stressLevel === "high") {
      volumeDelta = "reduce";
      reason += " Systemic fatigue is high (poor sleep & high stress). Reducing training volume by 20% to prevent overreaching.";
    }

    const finalAdjustments = {
      calorieDelta,
      stepDelta,
      volumeDelta,
      reason,
    };

    const newCheckIn: WeeklyCheckIn = {
      ...checkIn,
      adjustments: finalAdjustments,
    };

    setCheckInHistory((prev) => {
      const updated = [...prev, newCheckIn];
      localStorage.setItem("lumina_checkins", JSON.stringify(updated));
      return updated;
    });

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const adjustmentChatMsg: Message = {
      sender: "coach",
      text: `🔔 **Weekly Check-In Action Plan**:\n\n* **Calorie Adjustments**: ${calorieDelta > 0 ? "+" : ""}${calorieDelta} kcal\n* **Step Target**: ${stepDelta > 0 ? "+" : ""}${stepDelta} steps\n* **Training Volume**: ${volumeDelta.toUpperCase()}\n\n**Reason**: ${reason}`,
      timestamp: time,
    };
    setChatHistory((prev) => {
      const updated = [...prev, adjustmentChatMsg];
      localStorage.setItem("lumina_chat", JSON.stringify(updated));
      return updated;
    });

    return finalAdjustments;
  };

  return (
    <FitnessContext.Provider
      value={{
        profile,
        digitalTwin,
        twinHistory,
        twinDeltas,
        dailyDecision,
        dispatchTwinEvent,
        submitSessionFeedback,
        runSimulation,
        dailyLog,
        logsHistory,
        checkInHistory,
        chatHistory,
        activeWorkout,
        metrics,
        calorieTargets,
        macroTargets,
        streak,
        isOnboarded,
        updateProfile,
        logFood,
        logWater,
        logSteps,
        completeWorkout,
        toggleExercise,
        setWorkoutId,
        addMessage,
        submitCheckIn,
        resetData,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error("useFitness must be used within a FitnessProvider");
  }
  return context;
}

function getCoachReply(input: string, profile: ClientProfile | null): string {
  const query = input.toLowerCase();
  
  if (!profile) {
    return "I don't have your biology stats yet. Please onboard so we can map out your scientific nutrition and training splits.";
  }

  if (query.includes("creatine") || query.includes("supplement")) {
    return `🔬 **Creatine Monohydrate & Supps Evidence Summary**:\n\n1. **Creatine Monohydrate**: The most researched strength supplement. Dose **5g daily** indefinitely. It increases intramuscular phosphocreatine stores, speeding up ATP resynthesis during high-intensity lifting. No need to load; consistency is key.\n2. **Whey/Vegan Protein**: A tool to hit your target of **${profile.weight * 2}g** of protein. Whey isolate has high bioavailability (DIAS score > 1.15) and is rich in leucine (the primary trigger for Muscle Protein Synthesis via the mTOR pathway).\n3. **Caffeine**: 1.5–3.0mg per kg bodyweight ingested 45 mins pre-workout improves power output, fatigue tolerance, and mental focus by blockading adenosine receptors.`;
  }
  
  if (query.includes("protein") || query.includes("macro") || query.includes("carbs") || query.includes("fat")) {
    const goalStr = (profile.goal || "maintenance").replace("-", " ");
    return `Protein is critical for muscle retention during your **${goalStr}** phase. \n\nAim for high-quality sources:\n* **Egg whites, Chicken breast, Lean beef** (Non-vegetarian)\n* **Paneer, Tofu, Soy chunks, Tempeh, Lentils** (Vegetarian / Indian options)\n\nCarbohydrates fuel anaerobic training. Keep them high on training days! Fats support critical hormonal function. Keep fat intake above 0.7g/kg of body weight.`;
  }

  if (query.includes("workout") || query.includes("train") || query.includes("lift") || query.includes("exercise")) {
    return `Your current setup calls for a **${profile.workoutDaysPerWeek}-day split** optimized for **${profile.gymExperience}** trainees. \n\nFocus on compound lifts (squats, presses, pulls) and practice **Progressive Overload** (adding load, reps, or sets systematically over weeks). Make sure to track your working weight and keep RPE (Rate of Perceived Exertion) around 7–9.`;
  }

  if (query.includes("sleep") || query.includes("stress") || query.includes("recover")) {
    return `Recovery is the governor of muscle hypertrophy and fat loss. During deep sleep (non-REM stage 3), growth hormone (GH) peaks and muscle tissue repair accelerates. Aim for **7.5–9 hours**. High cortisol (stress) downregulates testosterone, increases water retention, and accelerates muscle breakdown. Focus on sleep hygiene and active recovery days.`;
  }

  if (query.includes("hello") || query.includes("hi ") || query.includes("hey")) {
    return `Hello! Elite Coach here. I'm ready to review your current training logs, nutrition targets, or answer any physiological questions. What's on your mind today?`;
  }

  return `Understood. Let's keep our focus on hitting your daily calorie target, keeping protein high, and maintaining progressive overload in the gym. If you're experiencing fatigue, let me know, and we'll evaluate if a deload is warranted. What specific area (nutrition, training, recovery) would you like to audit?`;
}
