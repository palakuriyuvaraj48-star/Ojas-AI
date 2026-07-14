/**
 * Feature 150 — Health Risk Prediction engine.
 *
 * Pure TypeScript heuristic engine. No external API calls.
 * All outputs are INFORMATIONAL ESTIMATES grounded in general fitness
 * principles and are NOT a substitute for professional medical advice.
 */

import {
  type HealthFactor,
  type HealthInsight,
  type HealthRiskAssessment,
  type HealthRiskCategory,
  type HealthRiskSignals,
  type LongTermProjection,
  type RiskHeatmapPoint,
  type RiskLevel,
  type ScenarioComparison,
} from "./types";

export const HEALTH_RISK_MODEL_VERSION = "titan-hr-1.0.0";
const ASSESSMENT_TTL_DAYS = 14;

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "high";
  return "critical";
}

export const RISK_COLORS: Record<RiskLevel, { text: string; bg: string; border: string; hex: string }> = {
  low: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", hex: "#34d399" },
  moderate: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", hex: "#facc15" },
  high: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", hex: "#fb923c" },
  critical: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", hex: "#fb7185" },
};

export interface HealthRiskCategoryMeta {
  category: HealthRiskCategory;
  label: string;
  short: string;
  icon: string;
  description: string;
  higherIsWorse?: boolean;
}

export const HEALTH_RISK_CATEGORIES: HealthRiskCategoryMeta[] = [
  { category: "cardiovascular", label: "Cardiovascular Risk", short: "Cardio", icon: "Heart", description: "Estimated risk related to heart and circulatory fitness." },
  { category: "metabolic", label: "Metabolic Risk", short: "Metabolic", icon: "Activity", description: "Estimated risk related to blood sugar, insulin and body composition." },
  { category: "overtraining", label: "Overtraining Risk", short: "Overtrain", icon: "Flame", description: "Estimated risk of chronic training overload without recovery." },
  { category: "recovery", label: "Recovery Quality Risk", short: "Recovery", icon: "Wind", description: "Estimated risk from poor recovery between sessions." },
  { category: "stress", label: "Chronic Stress Risk", short: "Stress", icon: "Brain", description: "Estimated risk from sustained psychological / physiological stress." },
  { category: "sleep", label: "Sleep Quality Risk", short: "Sleep", icon: "Moon", description: "Estimated risk from poor or irregular sleep." },
  { category: "injury", label: "Injury Susceptibility", short: "Injury", icon: "ShieldAlert", description: "Estimated susceptibility to training-related injury." },
  { category: "weightRegain", label: "Weight Regain Probability", short: "Wt Regain", icon: "Scale", description: "Estimated probability of regaining lost weight." },
  { category: "trainingSustainability", label: "Training Sustainability", short: "Sustain", icon: "TrendingUp", description: "Estimated likelihood of sustaining a long-term training habit." },
  { category: "habitConsistency", label: "Habit Consistency Risk", short: "Habits", icon: "Repeat", description: "Estimated risk from inconsistent adherence to training and nutrition." },
  { category: "lifestyleBalance", label: "Lifestyle Balance", short: "Balance", icon: "Scale", description: "Overall lifestyle balance across sleep, stress, training and nutrition." },
];

export function getCategoryMeta(category: HealthRiskCategory): HealthRiskCategoryMeta {
  return HEALTH_RISK_CATEGORIES.find((c) => c.category === category) ?? HEALTH_RISK_CATEGORIES[0];
}

/* ------------------------------------------------------------------ *
 * Rule-based evaluation core
 * ------------------------------------------------------------------ */

interface Rule {
  id: string;
  name: string;
  impact: "positive" | "negative" | "neutral";
  weight: number; // 0-1
  points: number; // magnitude applied to risk score
  description: string;
  recommendation?: string;
  active: (s: HealthRiskSignals) => boolean;
}

interface EvaluationResult {
  riskScore: number;
  contributingFactors: HealthFactor[];
  protectiveFactors: HealthFactor[];
  recommendations: string[];
}

let factorSeq = 0;
function factorId(prefix: string): string {
  factorSeq += 1;
  return `${prefix}-${factorSeq}`;
}

function evaluate(rules: Rule[], baseline: number, s: HealthRiskSignals): EvaluationResult {
  let score = baseline;
  const contributing: HealthFactor[] = [];
  const protective: HealthFactor[] = [];
  const recommendations: string[] = [];

  for (const r of rules) {
    if (!r.active(s)) continue;
    if (r.impact === "negative") {
      score += r.points;
      contributing.push({
        id: factorId("cf"),
        name: r.name,
        impact: "negative",
        weight: r.weight,
        description: r.description,
      });
      if (r.recommendation && !recommendations.includes(r.recommendation)) {
        recommendations.push(r.recommendation);
      }
    } else if (r.impact === "positive") {
      score -= r.points;
      protective.push({
        id: factorId("pf"),
        name: r.name,
        impact: "positive",
        weight: r.weight,
        description: r.description,
      });
    }
  }

  return {
    riskScore: Math.round(clamp(score, 1, 99)),
    contributingFactors: contributing,
    protectiveFactors: protective,
    recommendations,
  };
}

function buildAssessment(
  userId: string,
  category: HealthRiskCategory,
  result: EvaluationResult,
  confidence: number,
  assessedAt: string
): HealthRiskAssessment {
  const expires = new Date(new Date(assessedAt).getTime() + ASSESSMENT_TTL_DAYS * 86400000).toISOString();
  return {
    id: `${category}-${userId}-${assessedAt}`,
    userId,
    category,
    riskScore: result.riskScore,
    confidence: Math.round(clamp(confidence, 1, 100)),
    riskLevel: riskLevelFromScore(result.riskScore),
    contributingFactors: result.contributingFactors.map((f) => f.name),
    protectiveFactors: result.protectiveFactors.map((f) => f.name),
    recommendations: result.recommendations,
    assessedAt,
    expiresAt: expires,
    modelVersion: HEALTH_RISK_MODEL_VERSION,
  };
}

/* ------------------------------------------------------------------ *
 * Confidence — based on how many expected signals are present
 * ------------------------------------------------------------------ */

const EXPECTED_SIGNAL_KEYS: (keyof HealthRiskSignals)[] = [
  "age",
  "restingHeartRate",
  "vo2max",
  "restingSystolic",
  "weeklyCardioSessions",
  "weeklyStrengthSessions",
  "fastingGlucose",
  "hba1c",
  "waistCircumference",
  "bmi",
  "sleepHours",
  "sleepQuality",
  "sleepConsistency",
  "stressLevel",
  "recoveryScore",
  "hrv",
  "sorenessLevel",
  "trainingStressBalance",
  "workoutAdherence",
  "nutritionAdherence",
  "hydrationLiters",
  "stepsPerDay",
  "weightHistoryStability",
  "priorInjuries",
  "mobilityScore",
  "previousWeightLossAttempts",
  "currentDeficit",
  "alcoholUnitsPerWeek",
  "smoking",
  "familyHistory",
];

export function computeConfidence(signals: HealthRiskSignals): number {
  let present = 0;
  for (const key of EXPECTED_SIGNAL_KEYS) {
    const v = signals[key];
    if (v !== undefined && v !== null) {
      if (key === "familyHistory") {
        if (typeof v === "object" && Object.keys(v as object).length > 0) present += 1;
      } else {
        present += 1;
      }
    }
  }
  const ratio = present / EXPECTED_SIGNAL_KEYS.length;
  // Floor confidence so sparse inputs still read as a tentative estimate.
  return Math.round(clamp(35 + ratio * 60, 0, 100));
}

export function dataCompleteness(signals: HealthRiskSignals): number {
  let present = 0;
  for (const key of EXPECTED_SIGNAL_KEYS) {
    const v = signals[key];
    if (v !== undefined && v !== null) present += 1;
  }
  return Math.round((present / EXPECTED_SIGNAL_KEYS.length) * 100);
}

/* ------------------------------------------------------------------ *
 * Rule catalogs per category
 * ------------------------------------------------------------------ */

const CARDIO_RULES: Rule[] = [
  { id: "c-rhr", name: "Elevated resting heart rate", impact: "negative", weight: 0.7, points: 14, description: "Resting heart rate above ~75 bpm can indicate reduced cardiovascular fitness.", recommendation: "Add 2-3 steady-state cardio sessions per week to improve autonomic tone.", active: (s) => (s.restingHeartRate ?? 0) > 75 },
  { id: "c-bp", name: "Elevated blood pressure", impact: "negative", weight: 0.8, points: 18, description: "Systolic blood pressure at or above 130 mmHg is a known cardiovascular risk marker.", recommendation: "Track blood pressure and discuss sustained elevations with your healthcare provider.", active: (s) => (s.restingSystolic ?? 0) >= 130 },
  { id: "c-vo2", name: "Low cardiorespiratory fitness (VO2max)", impact: "negative", weight: 0.7, points: 15, description: "VO2max below ~35 ml/kg/min is associated with higher long-term risk.", recommendation: "Build aerobic base with Zone 2 training 3-4x per week.", active: (s) => (s.vo2max ?? 99) < 35 },
  { id: "c-cardiofreq", name: "Low weekly cardio frequency", impact: "negative", weight: 0.6, points: 12, description: "Fewer than 2 cardio sessions per week limits cardiac adaptation.", recommendation: "Schedule at least 150 minutes of moderate aerobic activity weekly.", active: (s) => (s.weeklyCardioSessions ?? 9) < 2 },
  { id: "c-bmi", name: "Elevated BMI", impact: "negative", weight: 0.5, points: 10, description: "BMI at or above 30 adds cardiometabolic load.", recommendation: "Combine modest calorie deficit with resistance training to improve body composition.", active: (s) => (s.bmi ?? 0) >= 30 },
  { id: "c-age", name: "Age factor", impact: "negative", weight: 0.4, points: 8, description: "Risk naturally increases with age.", recommendation: "Prioritize regular screening and consistent movement.", active: (s) => (s.age ?? 0) >= 50 },
  { id: "c-smoke", name: "Smoking", impact: "negative", weight: 0.9, points: 22, description: "Smoking is a major modifiable cardiovascular risk factor.", recommendation: "Seek a cessation program — this is the highest-impact change available.", active: (s) => s.smoking === true },
  { id: "c-fam", name: "Family history of cardiac disease", impact: "negative", weight: 0.5, points: 10, description: "Genetic predisposition increases baseline risk.", recommendation: "Share family history with your clinician for tailored screening.", active: (s) => Boolean(s.familyHistory?.cardiac) },
  { id: "c-goodvo2", name: "Strong aerobic fitness", impact: "positive", weight: 0.6, points: 10, description: "VO2max at or above 45 ml/kg/min is protective.", active: (s) => (s.vo2max ?? 0) >= 45 },
  { id: "c-goodrhr", name: "Low resting heart rate", impact: "positive", weight: 0.4, points: 6, description: "Resting heart rate under 60 bpm reflects good fitness.", active: (s) => (s.restingHeartRate ?? 99) < 60 },
  { id: "c-cardiofreq-ok", name: "Regular cardio training", impact: "positive", weight: 0.5, points: 8, description: "4+ cardio sessions per week is protective.", active: (s) => (s.weeklyCardioSessions ?? 0) >= 4 },
  { id: "c-nosmoke", name: "Non-smoker", impact: "positive", weight: 0.5, points: 8, description: "Absence of smoking is strongly protective.", active: (s) => s.smoking === false },
];

const METABOLIC_RULES: Rule[] = [
  { id: "m-glu", name: "Elevated fasting glucose", impact: "negative", weight: 0.8, points: 18, description: "Fasting glucose above ~100 mg/dL suggests impaired glucose regulation.", recommendation: "Favor fiber-rich meals and post-meal walks to blunt glucose spikes.", active: (s) => (s.fastingGlucose ?? 0) > 100 },
  { id: "m-a1c", name: "Elevated HbA1c", impact: "negative", weight: 0.85, points: 20, description: "HbA1c at or above 5.7% indicates pre-diabetes range.", recommendation: "Consult your provider; consistent resistance training improves insulin sensitivity.", active: (s) => (s.hba1c ?? 0) >= 5.7 },
  { id: "m-waist", name: "High waist circumference", impact: "negative", weight: 0.6, points: 12, description: "Central adiposity is a strong metabolic risk marker.", recommendation: "Reduce refined carbs and prioritize protein at each meal.", active: (s) => (s.waistCircumference ?? 0) > 102 },
  { id: "m-bmi", name: "Elevated BMI", impact: "negative", weight: 0.5, points: 10, description: "Higher BMI correlates with metabolic dysfunction.", recommendation: "Aim for a sustainable 10-20% calorie deficit with adequate protein.", active: (s) => (s.bmi ?? 0) >= 27 },
  { id: "m-fam", name: "Family history of diabetes", impact: "negative", weight: 0.5, points: 10, description: "Genetic predisposition to type 2 diabetes.", recommendation: "Annual screening is advisable given family history.", active: (s) => Boolean(s.familyHistory?.diabetes) },
  { id: "m-mets", name: "Low muscular fitness", impact: "negative", weight: 0.5, points: 9, description: "Low muscle mass reduces glucose disposal capacity.", recommendation: "Train each major muscle group 2x per week.", active: (s) => (s.weeklyStrengthSessions ?? 9) < 2 },
  { id: "m-strength-ok", name: "Regular resistance training", impact: "positive", weight: 0.6, points: 10, description: "Strength training improves insulin sensitivity.", active: (s) => (s.weeklyStrengthSessions ?? 0) >= 3 },
  { id: "m-glu-ok", name: "Healthy fasting glucose", impact: "positive", weight: 0.6, points: 9, description: "Fasting glucose in healthy range is protective.", active: (s) => (s.fastingGlucose ?? 99) <= 95 },
  { id: "m-waist-ok", name: "Healthy waist circumference", impact: "positive", weight: 0.4, points: 6, description: "Low central adiposity is protective.", active: (s) => (s.waistCircumference ?? 0) > 0 && (s.waistCircumference ?? 999) < 90 },
];

const OVERTRAINING_RULES: Rule[] = [
  { id: "o-acr", name: "High acute:chronic workload ratio", impact: "negative", weight: 0.8, points: 20, description: "Acute:chronic ratio above 1.5 sharply raises overload risk.", recommendation: "Hold weekly volume growth under 10% to stay in the safe ramp zone.", active: (s) => (s.trainingStressBalance ?? 1) > 1.5 },
  { id: "o-sore", name: "Persistent soreness", impact: "negative", weight: 0.6, points: 12, description: "Soreness levels above ~60 indicate inadequate recovery.", recommendation: "Insert a deload or low-intensity week.", active: (s) => (s.sorenessLevel ?? 0) > 60 },
  { id: "o-hrv", name: "Suppressed HRV", impact: "negative", weight: 0.6, points: 12, description: "Low HRV suggests accumulated training stress.", recommendation: "Add sleep and relaxation; reduce intensity until HRV recovers.", active: (s) => (s.hrv ?? 99) < 40 },
  { id: "o-rec", name: "Low recovery score", impact: "negative", weight: 0.7, points: 14, description: "Recovery score below ~50 signals systemic fatigue.", recommendation: "Prioritize a recovery day and review total weekly load.", active: (s) => (s.recoveryScore ?? 99) < 50 },
  { id: "o-freq", name: "Very high training frequency", impact: "negative", weight: 0.4, points: 8, description: "Training 7 days/week with no rest challenges recovery.", recommendation: "Schedule at least 1-2 full rest days weekly.", active: (s) => (s.weeklyStrengthSessions ?? 0) + (s.weeklyCardioSessions ?? 0) >= 9 },
  { id: "o-rested", name: "Balanced workload ratio", impact: "positive", weight: 0.6, points: 10, description: "Acute:chronic ratio in 0.8-1.3 is protective.", active: (s) => { const r = s.trainingStressBalance ?? 1; return r >= 0.8 && r <= 1.3; } },
  { id: "o-goodrec", name: "Strong recovery score", impact: "positive", weight: 0.5, points: 8, description: "Recovery score above 70 supports adaptation.", active: (s) => (s.recoveryScore ?? 0) > 70 },
];

const RECOVERY_RULES: Rule[] = [
  { id: "r-rec", name: "Low recovery score", impact: "negative", weight: 0.8, points: 18, description: "Recovery score below 50 limits adaptation and raises injury risk.", recommendation: "Increase sleep and reduce concurrent life stress.", active: (s) => (s.recoveryScore ?? 99) < 50 },
  { id: "r-sleep", name: "Short sleep duration", impact: "negative", weight: 0.7, points: 14, description: "Under 6 hours sleep impairs physical recovery.", recommendation: "Target 7-9 hours; keep a fixed sleep/wake time.", active: (s) => (s.sleepHours ?? 9) < 6 },
  { id: "r-hrv", name: "Low HRV", impact: "negative", weight: 0.6, points: 12, description: "Low HRV reflects poor autonomic recovery.", recommendation: "Add breathing or mobility sessions on hard days.", active: (s) => (s.hrv ?? 99) < 45 },
  { id: "r-sore", name: "High soreness", impact: "negative", weight: 0.5, points: 10, description: "Soreness above 60 slows recovery.", recommendation: "Use light movement / contrast showers to aid recovery.", active: (s) => (s.sorenessLevel ?? 0) > 60 },
  { id: "r-hyd", name: "Low hydration", impact: "negative", weight: 0.3, points: 6, description: "Under 1.5 L/day impairs recovery processes.", recommendation: "Aim for ~35 ml/kg bodyweight daily.", active: (s) => (s.hydrationLiters ?? 9) < 1.5 },
  { id: "r-goodrec", name: "Good recovery score", impact: "positive", weight: 0.6, points: 10, description: "Recovery score above 70 is protective.", active: (s) => (s.recoveryScore ?? 0) > 70 },
  { id: "r-goodsleep", name: "Adequate sleep", impact: "positive", weight: 0.6, points: 9, description: "7+ hours sleep supports recovery.", active: (s) => (s.sleepHours ?? 0) >= 7 },
];

const STRESS_RULES: Rule[] = [
  { id: "s-level", name: "High perceived stress", impact: "negative", weight: 0.8, points: 18, description: "Stress level above 60 elevates cortisol exposure.", recommendation: "Introduce a daily 10-minute breathing or mindfulness habit.", active: (s) => (s.stressLevel ?? 0) > 60 },
  { id: "s-sleep", name: "Stress-driven short sleep", impact: "negative", weight: 0.5, points: 10, description: "Poor sleep amplifies stress response.", recommendation: "Create a wind-down routine 60 min before bed.", active: (s) => (s.sleepHours ?? 9) < 6 && (s.stressLevel ?? 0) > 50 },
  { id: "s-rec", name: "Low recovery under stress", impact: "negative", weight: 0.5, points: 9, description: "Low recovery alongside high stress compounds risk.", recommendation: "Reduce training intensity on high-stress days.", active: (s) => (s.recoveryScore ?? 99) < 55 && (s.stressLevel ?? 0) > 50 },
  { id: "s-alc", name: "High alcohol intake", impact: "negative", weight: 0.4, points: 8, description: "Over 14 units/week disrupts sleep and recovery.", recommendation: "Set alcohol-free days each week.", active: (s) => (s.alcoholUnitsPerWeek ?? 0) > 14 },
  { id: "s-low", name: "Low perceived stress", impact: "positive", weight: 0.6, points: 10, description: "Stress under 40 is protective.", active: (s) => (s.stressLevel ?? 99) < 40 },
  { id: "s-goodrec", name: "Good recovery capacity", impact: "positive", weight: 0.5, points: 8, description: "Recovery above 70 buffers stress.", active: (s) => (s.recoveryScore ?? 0) > 70 },
];

const SLEEP_RULES: Rule[] = [
  { id: "sl-dur", name: "Short sleep duration", impact: "negative", weight: 0.8, points: 18, description: "Under 6 hours is linked to metabolic and recovery harm.", recommendation: "Protect a consistent 7-9 hour sleep window.", active: (s) => (s.sleepHours ?? 9) < 6 },
  { id: "sl-qual", name: "Poor sleep quality", impact: "negative", weight: 0.7, points: 14, description: "Sleep quality under 50 reduces restorative benefit.", recommendation: "Reduce evening screen time and caffeine after 2pm.", active: (s) => (s.sleepQuality ?? 99) < 50 },
  { id: "sl-cons", name: "Irregular sleep schedule", impact: "negative", weight: 0.6, points: 12, description: "Schedule consistency under 50 disrupts circadian rhythm.", recommendation: "Wake at the same time daily, even on weekends.", active: (s) => (s.sleepConsistency ?? 99) < 50 },
  { id: "sl-alc", name: "Alcohol near bedtime", impact: "negative", weight: 0.4, points: 7, description: "Alcohol fragments sleep architecture.", recommendation: "Avoid alcohol within 3 hours of sleep.", active: (s) => (s.alcoholUnitsPerWeek ?? 0) > 14 },
  { id: "sl-dur-ok", name: "Adequate sleep duration", impact: "positive", weight: 0.6, points: 10, description: "7+ hours supports health.", active: (s) => (s.sleepHours ?? 0) >= 7 },
  { id: "sl-cons-ok", name: "Consistent schedule", impact: "positive", weight: 0.5, points: 8, description: "Consistency above 70 is protective.", active: (s) => (s.sleepConsistency ?? 0) > 70 },
];

const INJURY_RULES: Rule[] = [
  { id: "i-acr", name: "High workload ramp", impact: "negative", weight: 0.8, points: 18, description: "Acute:chronic ratio above 1.5 raises injury odds.", recommendation: "Cap weekly load increases at ~10%.", active: (s) => (s.trainingStressBalance ?? 1) > 1.5 },
  { id: "i-prior", name: "History of injuries", impact: "negative", weight: 0.6, points: 12, description: "Prior injuries increase recurrence risk.", recommendation: "Include prehab and mobility work for vulnerable areas.", active: (s) => (s.priorInjuries ?? 0) >= 2 },
  { id: "i-mob", name: "Low mobility score", impact: "negative", weight: 0.5, points: 10, description: "Mobility under 50 limits safe range of motion.", recommendation: "Add daily mobility drills for key joints.", active: (s) => (s.mobilityScore ?? 99) < 50 },
  { id: "i-sore", name: "High soreness", impact: "negative", weight: 0.4, points: 8, description: "High soreness raises compensation risk.", recommendation: "Train around soreness with varied loading.", active: (s) => (s.sorenessLevel ?? 0) > 60 },
  { id: "i-mob-ok", name: "Good mobility", impact: "positive", weight: 0.5, points: 9, description: "Mobility above 70 is protective.", active: (s) => (s.mobilityScore ?? 0) > 70 },
  { id: "i-freq-ok", name: "Balanced training frequency", impact: "positive", weight: 0.4, points: 7, description: "Reasonable frequency supports tissue tolerance.", active: (s) => (s.weeklyStrengthSessions ?? 0) + (s.weeklyCardioSessions ?? 0) <= 8 },
];

const WEIGHTREGAIN_RULES: Rule[] = [
  { id: "w-attempts", name: "Multiple prior loss attempts", impact: "negative", weight: 0.6, points: 14, description: "More previous attempts correlate with higher regain probability.", recommendation: "Adopt habits you can sustain indefinitely rather than a short diet.", active: (s) => (s.previousWeightLossAttempts ?? 0) >= 3 },
  { id: "w-stability", name: "Unstable weight history", impact: "negative", weight: 0.6, points: 12, description: "Low weight-history stability predicts regain.", recommendation: "Use maintenance phases to consolidate losses.", active: (s) => (s.weightHistoryStability ?? 99) < 50 },
  { id: "w-deficit", name: "Aggressive deficit", impact: "negative", weight: 0.5, points: 10, description: "Large deficits are harder to maintain long-term.", recommendation: "Prefer a moderate 15-20% deficit you can keep.", active: (s) => (s.currentDeficit ?? 0) > 750 },
  { id: "w-strength-ok", name: "Preserved muscle via training", impact: "positive", weight: 0.5, points: 9, description: "Resistance training protects metabolic rate.", active: (s) => (s.weeklyStrengthSessions ?? 0) >= 3 },
  { id: "w-stability-ok", name: "Stable weight history", impact: "positive", weight: 0.4, points: 7, description: "Stable history lowers regain risk.", active: (s) => (s.weightHistoryStability ?? 0) > 70 },
];

const SUSTAIN_RULES: Rule[] = [
  { id: "t-adh", name: "Low workout adherence", impact: "negative", weight: 0.7, points: 16, description: "Adherence under 50 threatens long-term consistency.", recommendation: "Lower the barrier: shorter, frequent sessions beat rare long ones.", active: (s) => (s.workoutAdherence ?? 99) < 50 },
  { id: "t-freq", name: "Very high frequency burnout risk", impact: "negative", weight: 0.4, points: 8, description: "9+ sessions/week can lead to dropout.", recommendation: "Keep frequency sustainable for your life.", active: (s) => (s.weeklyStrengthSessions ?? 0) + (s.weeklyCardioSessions ?? 0) >= 9 },
  { id: "t-rec", name: "Poor recovery", impact: "negative", weight: 0.5, points: 9, description: "Low recovery undermines adherence.", recommendation: "Align training load with recovery capacity.", active: (s) => (s.recoveryScore ?? 99) < 50 },
  { id: "t-adh-ok", name: "Strong adherence", impact: "positive", weight: 0.6, points: 10, description: "Adherence above 75 supports sustainability.", active: (s) => (s.workoutAdherence ?? 0) > 75 },
  { id: "t-steps", name: "Active daily lifestyle", impact: "positive", weight: 0.4, points: 7, description: "8k+ daily steps supports habit formation.", active: (s) => (s.stepsPerDay ?? 0) >= 8000 },
];

const HABIT_RULES: Rule[] = [
  { id: "h-wadh", name: "Low workout adherence", impact: "negative", weight: 0.7, points: 16, description: "Inconsistent training weakens habit loops.", recommendation: "Anchor workouts to an existing daily cue.", active: (s) => (s.workoutAdherence ?? 99) < 50 },
  { id: "h-nadh", name: "Low nutrition adherence", impact: "negative", weight: 0.6, points: 13, description: "Inconsistent nutrition limits progress.", recommendation: "Prep 2-3 staple meals you enjoy.", active: (s) => (s.nutritionAdherence ?? 99) < 50 },
  { id: "h-sleep", name: "Irregular sleep", impact: "negative", weight: 0.5, points: 10, description: "Poor sleep consistency disrupts routines.", recommendation: "Fix wake time first; sleep follows.", active: (s) => (s.sleepConsistency ?? 99) < 50 },
  { id: "h-wadh-ok", name: "Consistent training", impact: "positive", weight: 0.6, points: 10, description: "Adherence above 75 is protective.", active: (s) => (s.workoutAdherence ?? 0) > 75 },
  { id: "h-nadh-ok", name: "Consistent nutrition", impact: "positive", weight: 0.5, points: 8, description: "Nutrition adherence above 75 is protective.", active: (s) => (s.nutritionAdherence ?? 0) > 75 },
];

/* ------------------------------------------------------------------ *
 * Public assess functions
 * ------------------------------------------------------------------ */

export function assessCardiovascularRisk(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "cardiovascular", evaluate(CARDIO_RULES, 20, signals), conf, assessedAt);
}

export function assessMetabolicRisk(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "metabolic", evaluate(METABOLIC_RULES, 18, signals), conf, assessedAt);
}

export function assessOvertrainingRisk(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "overtraining", evaluate(OVERTRAINING_RULES, 15, signals), conf, assessedAt);
}

export function assessRecoveryQuality(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "recovery", evaluate(RECOVERY_RULES, 20, signals), conf, assessedAt);
}

export function assessChronicStress(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "stress", evaluate(STRESS_RULES, 18, signals), conf, assessedAt);
}

export function assessSleepQualityRisk(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "sleep", evaluate(SLEEP_RULES, 18, signals), conf, assessedAt);
}

export function assessInjurySusceptibility(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "injury", evaluate(INJURY_RULES, 18, signals), conf, assessedAt);
}

export function assessWeightRegainProbability(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "weightRegain", evaluate(WEIGHTREGAIN_RULES, 25, signals), conf, assessedAt);
}

export function assessTrainingSustainability(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "trainingSustainability", evaluate(SUSTAIN_RULES, 20, signals), conf, assessedAt);
}

export function assessHabitConsistencyRisk(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const conf = computeConfidence(signals);
  return buildAssessment(userId, "habitConsistency", evaluate(HABIT_RULES, 20, signals), conf, assessedAt);
}

export function computeLifestyleBalanceScore(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment {
  const sleep = evaluate(SLEEP_RULES, 18, signals).riskScore;
  const stress = evaluate(STRESS_RULES, 18, signals).riskScore;
  const rec = evaluate(RECOVERY_RULES, 20, signals).riskScore;
  const train = evaluate(SUSTAIN_RULES, 20, signals).riskScore;
  const nutr = 100 - clamp((signals.nutritionAdherence ?? 70));
  const balanceRisk = Math.round(clamp((sleep + stress + rec + train + nutr) / 5, 1, 99));
  const conf = computeConfidence(signals);
  return buildAssessment(
    userId,
    "lifestyleBalance",
    {
      riskScore: balanceRisk,
      contributingFactors: [],
      protectiveFactors: [],
      recommendations:
        balanceRisk >= 50
          ? ["Improve the weakest pillar (sleep, stress, recovery, training or nutrition) by 10 points."]
          : ["Maintain your current balanced routine; review quarterly."],
    },
    conf,
    assessedAt
  );
}

/* ------------------------------------------------------------------ *
 * Batch + projections + scenarios
 * ------------------------------------------------------------------ */

export function runFullAssessment(userId: string, signals: HealthRiskSignals, assessedAt = new Date().toISOString()): HealthRiskAssessment[] {
  return [
    assessCardiovascularRisk(userId, signals, assessedAt),
    assessMetabolicRisk(userId, signals, assessedAt),
    assessOvertrainingRisk(userId, signals, assessedAt),
    assessRecoveryQuality(userId, signals, assessedAt),
    assessChronicStress(userId, signals, assessedAt),
    assessSleepQualityRisk(userId, signals, assessedAt),
    assessInjurySusceptibility(userId, signals, assessedAt),
    assessWeightRegainProbability(userId, signals, assessedAt),
    assessTrainingSustainability(userId, signals, assessedAt),
    assessHabitConsistencyRisk(userId, signals, assessedAt),
    computeLifestyleBalanceScore(userId, signals, assessedAt),
  ];
}

export function overallRiskScore(assessments: HealthRiskAssessment[]): number {
  if (assessments.length === 0) return 0;
  const sum = assessments.reduce((acc, a) => acc + a.riskScore, 0);
  return Math.round(sum / assessments.length);
}

/**
 * Generate 3/6/12 month projections from current category risk scores.
 * Heuristic drift: high-risk categories with low adherence trend upward,
 * while low-risk categories with protective habits trend gently down.
 */
export function generateLongTermProjection(
  userId: string,
  currentTrends: Partial<Record<HealthRiskCategory, { riskScore: number; confidence: number }>>
): LongTermProjection[] {
  const horizons = ["3months", "6months", "12months"] as const;
  const monthlyDrift: Record<HealthRiskCategory, number> = {
    cardiovascular: 0.4,
    metabolic: 0.5,
    overtraining: 0.6,
    recovery: -0.3,
    stress: 0.3,
    sleep: 0.3,
    injury: 0.4,
    weightRegain: 0.7,
    trainingSustainability: -0.4,
    habitConsistency: -0.3,
    lifestyleBalance: -0.2,
  };

  return horizons.map((horizon) => {
    const months = horizon === "3months" ? 3 : horizon === "6months" ? 6 : 12;
    const categories: LongTermProjection["categories"] = {};
    (Object.keys(currentTrends) as HealthRiskCategory[]).forEach((cat) => {
      const cur = currentTrends[cat];
      if (!cur) return;
      const drift = monthlyDrift[cat] ?? 0;
      const projected = clamp(Math.round(cur.riskScore + drift * months), 1, 99);
      const confidenceDecay = Math.max(20, cur.confidence - months * 3);
      categories[cat] = { riskScore: projected, confidence: Math.round(confidenceDecay) };
    });
    return { horizon, categories, modelVersion: HEALTH_RISK_MODEL_VERSION };
  });
}

export function buildHeatmapFromAssessments(assessments: HealthRiskAssessment[]): RiskHeatmapPoint[] {
  return assessments.map((a) => ({
    category: a.category,
    date: a.assessedAt,
    riskScore: a.riskScore,
    confidence: a.confidence,
  }));
}

/* Scenario simulation: returns adjusted signals for a named "what-if" */

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  apply: (s: HealthRiskSignals) => HealthRiskSignals;
  changes: string[];
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: "current",
    name: "Current Trajectory",
    description: "No change to your current habits.",
    apply: (s) => ({ ...s }),
    changes: ["Baseline projection"],
  },
  {
    id: "more-training",
    name: "+2 Workouts / Week",
    description: "Add two strength sessions and one cardio session per week.",
    apply: (s) => ({
      ...s,
      weeklyStrengthSessions: (s.weeklyStrengthSessions ?? 3) + 2,
      weeklyCardioSessions: (s.weeklyCardioSessions ?? 2) + 1,
      vo2max: (s.vo2max ?? 40) + 2,
      workoutAdherence: clamp((s.workoutAdherence ?? 70) + 5, 0, 100),
    }),
    changes: ["+2 strength sessions", "+1 cardio session", "VO2max +2"],
  },
  {
    id: "better-sleep",
    name: "Sleep to 8h",
    description: "Improve sleep duration to 8h and consistency to 85.",
    apply: (s) => ({
      ...s,
      sleepHours: 8,
      sleepQuality: clamp((s.sleepQuality ?? 60) + 15, 0, 100),
      sleepConsistency: clamp((s.sleepConsistency ?? 60) + 20, 0, 100),
      recoveryScore: clamp((s.recoveryScore ?? 60) + 12, 0, 100),
      hrv: (s.hrv ?? 55) + 6,
    }),
    changes: ["Sleep 8h", "Consistency +20", "Recovery +12"],
  },
  {
    id: "stress-less",
    name: "Daily Mindfulness",
    description: "Add a daily 10-minute mindfulness practice and cut alcohol.",
    apply: (s) => ({
      ...s,
      stressLevel: clamp((s.stressLevel ?? 55) - 20, 0, 100),
      alcoholUnitsPerWeek: Math.max(0, (s.alcoholUnitsPerWeek ?? 6) - 7),
      recoveryScore: clamp((s.recoveryScore ?? 60) + 8, 0, 100),
    }),
    changes: ["Stress -20", "Alcohol -7 units", "Recovery +8"],
  },
];

export interface ScenarioResult {
  definition: ScenarioDefinition;
  overallRisk: number;
  perCategory: HealthRiskAssessment[];
  comparison: ScenarioComparison;
}

export function simulateScenario(userId: string, base: HealthRiskSignals, def: ScenarioDefinition): ScenarioResult {
  const adjusted = def.apply(base);
  const perCategory = runFullAssessment(userId, adjusted);
  const overallRisk = overallRiskScore(perCategory);
  return {
    definition: def,
    overallRisk,
    perCategory,
    comparison: {
      name: def.name,
      riskScore: overallRisk,
      changes: def.changes,
      description: def.description,
    },
  };
}

export function simulateAllScenarios(userId: string, base: HealthRiskSignals): ScenarioResult[] {
  return SCENARIO_DEFINITIONS.map((def) => simulateScenario(userId, base, def));
}

/* Derive trend insights by comparing latest vs previous assessment per category */
export function deriveInsights(
  userId: string,
  latest: HealthRiskAssessment[],
  previous: HealthRiskAssessment[]
): HealthInsight[] {
  const prevMap = new Map(previous.map((p) => [p.category, p]));
  return latest.map((a) => {
    const prev = prevMap.get(a.category);
    const change = prev ? a.riskScore - prev.riskScore : 0;
    const trend = change <= -3 ? "improving" : change >= 3 ? "worsening" : "stable";
    return {
      id: `insight-${a.category}-${userId}`,
      userId,
      category: a.category,
      trend,
      change,
      context:
        change === 0
          ? `Your ${getCategoryMeta(a.category).short} risk is holding steady at an estimated ${a.riskScore}/100.`
          : `Your ${getCategoryMeta(a.category).short} risk ${trend === "improving" ? "improved" : "worsened"} by ${Math.abs(change)} points to an estimated ${a.riskScore}/100.`,
    };
  });
}

/* ------------------------------------------------------------------ *
 * Default demo signals (used when none supplied)
 * ------------------------------------------------------------------ */

export function defaultSignals(): HealthRiskSignals {
  return {
    age: 34,
    restingHeartRate: 68,
    vo2max: 41,
    restingSystolic: 122,
    restingDiastolic: 78,
    weeklyCardioSessions: 2,
    weeklyStrengthSessions: 3,
    fastingGlucose: 94,
    hba1c: 5.3,
    waistCircumference: 88,
    bmi: 26.1,
    sleepHours: 6.8,
    sleepQuality: 62,
    sleepConsistency: 58,
    stressLevel: 54,
    recoveryScore: 63,
    hrv: 58,
    sorenessLevel: 38,
    trainingStressBalance: 1.18,
    workoutAdherence: 72,
    nutritionAdherence: 66,
    hydrationLiters: 2.2,
    stepsPerDay: 7400,
    weightHistoryStability: 61,
    priorInjuries: 1,
    mobilityScore: 68,
    previousWeightLossAttempts: 2,
    currentDeficit: 350,
    alcoholUnitsPerWeek: 5,
    smoking: false,
    familyHistory: { cardiac: false, metabolic: false, diabetes: false },
  };
}

/* Catalog of factor definitions per category (with weights) for detail panels */
const FACTOR_CATALOG: Record<HealthRiskCategory, Rule[]> = {
  cardiovascular: CARDIO_RULES,
  metabolic: METABOLIC_RULES,
  overtraining: OVERTRAINING_RULES,
  recovery: RECOVERY_RULES,
  stress: STRESS_RULES,
  sleep: SLEEP_RULES,
  injury: INJURY_RULES,
  weightRegain: WEIGHTREGAIN_RULES,
  trainingSustainability: SUSTAIN_RULES,
  habitConsistency: HABIT_RULES,
  lifestyleBalance: [],
};

export function getCategoryFactors(category: HealthRiskCategory): HealthFactor[] {
  return FACTOR_CATALOG[category].map((r) => ({
    id: `${category}-${r.id}`,
    name: r.name,
    impact: r.impact,
    weight: r.weight,
    description: r.description,
  }));
}

/* ------------------------------------------------------------------ *
 * Educational content (framed as education, not diagnosis)
 * ------------------------------------------------------------------ */

export const EDUCATIONAL_CONTENT: import("./types").EducationalContent[] = [
  {
    category: "cardiovascular",
    title: "Understanding Cardiovascular Risk",
    summary: "Cardiovascular risk reflects the estimated likelihood of heart and circulatory problems over time.",
    detail:
      "Factors such as blood pressure, resting heart rate, aerobic fitness (VO2max), body composition and smoking status all influence cardiovascular health. Regular moderate-intensity aerobic activity, strength training and not smoking are among the most evidence-backed protective behaviors. This estimate is heuristic and does not replace a clinical risk score such as those from your physician.",
    sources: ["General fitness & cardiology literature", "Consult a physician for formal risk scoring"],
  },
  {
    category: "metabolic",
    title: "Metabolic Health Basics",
    summary: "Metabolic risk relates to how your body regulates blood sugar and stores energy.",
    detail:
      "Fasting glucose, HbA1c, waist circumference and muscle mass are useful signals. Resistance training improves insulin sensitivity, while excessive refined carbohydrates and sedentary behavior can worsen metabolic markers. These are estimates — lab tests from a clinician are required for a real diagnosis.",
    sources: ["General metabolic health literature"],
  },
  {
    category: "overtraining",
    title: "Overtraining & Load Management",
    summary: "Overtraining risk rises when training load grows faster than the body can adapt.",
    detail:
      "The acute:chronic workload ratio is a common heuristic: staying near 0.8-1.3 is considered safer, while sustained values above 1.5 raise injury and fatigue risk. HRV and soreness are useful daily signals. Periodize training with deload weeks.",
    sources: ["Sports science load-management literature"],
  },
  {
    category: "recovery",
    title: "Recovery Quality",
    summary: "Recovery is when adaptation actually happens — not during the workout.",
    detail:
      "Sleep, hydration, nutrition and autonomic balance (HRV) drive recovery. Low recovery scores combined with high soreness suggest you should reduce load or add rest. Track trends rather than single days.",
    sources: ["Recovery science literature"],
  },
  {
    category: "stress",
    title: "Chronic Stress & Cortisol",
    summary: "Sustained psychological stress affects sleep, recovery and eating behavior.",
    detail:
      "Elevated perceived stress can raise cortisol exposure, which in turn influences fat storage and recovery. Mindfulness, breathing, social connection and sleep protect against chronic stress. If stress feels unmanageable, speak to a professional.",
    sources: ["Psychophysiology literature"],
  },
  {
    category: "sleep",
    title: "Sleep & Health",
    summary: "Sleep is foundational — most repair and memory consolidation happens during rest.",
    detail:
      "Adults generally benefit from 7-9 hours with a consistent schedule. Short or irregular sleep is linked to poorer metabolic and recovery outcomes. Protect a wind-down routine and limit late caffeine and alcohol.",
    sources: ["Sleep medicine literature"],
  },
  {
    category: "injury",
    title: "Injury Susceptibility",
    summary: "Injury risk is influenced by load ramp, mobility, history and recovery.",
    detail:
      "A sudden spike in training volume is the most common injury predictor. Prehab, mobility work and graded progression reduce risk. Past injuries in the same area deserve extra attention.",
    sources: ["Sports medicine literature"],
  },
  {
    category: "weightRegain",
    title: "Weight Regain Probability",
    summary: "Many people regain lost weight; habits determine long-term success.",
    detail:
      "Aggressive deficits, repeated crash dieting and low weight-history stability increase regain probability. Sustainable, moderate changes plus resistance training to preserve muscle improve long-term odds.",
    sources: ["Behavioral weight-management literature"],
  },
  {
    category: "trainingSustainability",
    title: "Training Sustainability",
    summary: "The best program is the one you can keep doing for years.",
    detail:
      "Adherence beats intensity. Overly demanding schedules raise dropout risk. Build a routine that fits your life and preserves recovery.",
    sources: ["Exercise adherence literature"],
  },
  {
    category: "habitConsistency",
    title: "Habit Consistency",
    summary: "Consistency compounds; small repeated actions drive results.",
    detail:
      "Anchoring workouts and nutrition to existing cues builds automatic habits. Irregular sleep and low adherence erode progress. Focus on systems, not motivation.",
    sources: ["Habit-formation literature"],
  },
  {
    category: "lifestyleBalance",
    title: "Lifestyle Balance",
    summary: "Balance across sleep, stress, training and nutrition is the big picture.",
    detail:
      "No single pillar compensates for a failing one. Monitor the weakest pillar and improve it by a small, sustainable margin. This composite is a heuristic overview only.",
    sources: ["Integrative health literature"],
  },
];

export function getEducationalContent(): import("./types").EducationalContent[] {
  return EDUCATIONAL_CONTENT;
}
