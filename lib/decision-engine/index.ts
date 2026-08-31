import {
  UnifiedFitnessState,
  DailyDecision,
  OjasDecisionAction,
  HostelMessDayMenu,
  HostelChoiceRanking,
  EnvironmentalContext,
  DailyPriority,
} from "@/types/fitness-state";
import { ClientProfile, DailyLog } from "@/types/profile";
import { INDIAN_FOODS_DATABASE, searchIndianFoods } from "@/lib/nutrition/indian-food-db";

/**
 * Ojas Decision Engine:
 * Core intelligence converting multi-signal user context into personalized daily fitness decisions.
 * SENSE -> UNDERSTAND -> DECIDE -> COACH -> MEASURE -> ADAPT
 */

export function buildUnifiedFitnessState(
  profile: ClientProfile,
  dailyLog: DailyLog,
  logsHistory: DailyLog[] = [],
  overrides?: Partial<UnifiedFitnessState>
): UnifiedFitnessState {
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay: EnvironmentalContext["timeOfDay"] =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

  // Calculate training load from recent logs (last 7 days)
  const recentWorkouts = logsHistory.slice(-7).filter((l) => l.workoutCompleted);
  const weeklyWorkoutsCount = recentWorkouts.length + (dailyLog.workoutCompleted ? 1 : 0);
  const totalRecentDuration = recentWorkouts.reduce((acc, l) => acc + (l.workoutDuration || 30), 0);
  const recentTrainingLoad = Math.min(100, Math.round((totalRecentDuration / 240) * 100));

  // Determine muscle readiness based on recent workout history and profile
  const isLowerBodyFatigued = logsHistory.slice(-2).some((l) => l.workoutName?.toLowerCase().includes("lower") || l.workoutName?.toLowerCase().includes("leg"));
  const isUpperBodyFatigued = logsHistory.slice(-2).some((l) => l.workoutName?.toLowerCase().includes("upper") || l.workoutName?.toLowerCase().includes("push") || l.workoutName?.toLowerCase().includes("pull"));

  // Defensive fallbacks for profile
  const safeProfile = profile || ({} as Partial<ClientProfile>);
  const weight = safeProfile.weight ?? 68.5;
  const height = safeProfile.height ?? 174;
  const age = safeProfile.age ?? 22;
  const gender = safeProfile.gender ?? "male";
  const goal = safeProfile.goal ?? "fat-loss";

  // Recovery & Sleep calculations
  const sleepHours = safeProfile.sleepDuration || 7.2;
  const stressMultiplier = safeProfile.stressLevel === "high" ? 0.8 : safeProfile.stressLevel === "medium" ? 0.95 : 1.05;
  const baseRecovery = Math.min(100, Math.round(((sleepHours / 8) * 70 + ((dailyLog?.waterConsumed ?? 0) >= 2.5 ? 20 : 10) + (100 - recentTrainingLoad) * 0.1) * stressMultiplier));
  const recoveryScore = Math.max(30, Math.min(98, baseRecovery));

  const readinessZone: "green" | "yellow" | "blue" =
    recoveryScore >= 75 ? "green" : recoveryScore >= 50 ? "yellow" : "blue";

  // Caloric targets
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * 1.45);
  const calorieTarget =
    goal === "fat-loss"
      ? Math.round(tdee * 0.82)
      : goal === "muscle-gain" || goal === "lean-bulk"
      ? Math.round(tdee * 1.1)
      : tdee;

  const proteinTarget =
    goal === "fat-loss"
      ? Math.round(weight * 2.0)
      : goal === "muscle-gain" || goal === "lean-bulk"
      ? Math.round(weight * 1.8)
      : Math.round(weight * 1.5);

  const dailyBudget = safeProfile.dailyFoodBudget || 150;
  const availableTime = safeProfile.availableWorkoutTime || 35;

  const defaultEnvironment: EnvironmentalContext = {
    temperatureC: 32,
    feelsLikeC: 35,
    humidityPct: 62,
    airQualityIndex: 110,
    condition: "hot",
    timeOfDay,
    isHeatWaveAlert: false,
    statusText: "Warm & humid conditions (32°C). High sweat rate expected.",
    source: "fallback",
  };

  const state: UnifiedFitnessState = {
    userId: safeProfile.name || "ojas_user",
    timestamp: now.toISOString(),
    movement: {
      recentTrainingLoad,
      fatigueScore: Math.min(100, Math.round(recentTrainingLoad * 0.7 + (safeProfile.stressLevel === "high" ? 25 : 10))),
      muscleReadiness: {
        upperBody: isUpperBodyFatigued ? "recovering" : "primed",
        lowerBody: isLowerBodyFatigued ? "fatigued" : "primed",
        core: "primed",
      },
      lastWorkoutCompletedAt: recentWorkouts.length > 0 ? recentWorkouts[recentWorkouts.length - 1].date : undefined,
      weeklyWorkoutsCount,
      formScoreAverage: 88,
    },
    nutrition: {
      calorieTarget,
      caloriesConsumed: dailyLog?.caloriesConsumed ?? 0,
      proteinTarget,
      proteinConsumed: dailyLog?.proteinConsumed ?? 0,
      carbsConsumed: dailyLog?.carbsConsumed ?? 0,
      fatConsumed: dailyLog?.fatConsumed ?? 0,
      fiberConsumed: dailyLog?.fiberConsumed || 18,
      waterLitersTarget: safeProfile.waterIntake || 3.0,
      waterLitersConsumed: dailyLog?.waterConsumed ?? 0,
      dailyFoodBudgetINR: dailyBudget,
      spentSoFarINR: dailyLog?.costIncurred || 65,
      isHostelMode: safeProfile.isHostelMode ?? (safeProfile.lifestyleRole === "college-student" || safeProfile.foodEnvironment === "hostel-mess"),
      foodPreference: safeProfile.foodPreference || "both",
      mealPacing:
        (dailyLog?.proteinConsumed ?? 0) < proteinTarget * 0.4
          ? "protein_lagging"
          : (dailyLog?.caloriesConsumed ?? 0) > calorieTarget
          ? "calorie_surplus"
          : "on_track",
    },
    recovery: {
      recoveryScore,
      sleepHours,
      sleepQuality: sleepHours >= 7.5 ? "optimal" : sleepHours >= 6.5 ? "good" : "poor",
      hrvStatus: recoveryScore > 75 ? "elevated" : "stable",
      sorenessLevel: isLowerBodyFatigued ? "moderate" : "mild",
      soreMuscles: isLowerBodyFatigued ? ["Quads", "Hamstrings"] : [],
      stressLevel: profile.stressLevel,
      readinessZone,
    },
    lifestyle: {
      role: profile.lifestyleRole || "working-professional",
      availableTimeMinutes: availableTime,
      exerciseLocation: profile.workoutEnvironment === "home" ? "home" : profile.workoutEnvironment === "outdoor" ? "outdoor" : "gym",
      equipmentAvailable: profile.availableEquipment || ["Bodyweight", "Dumbbells"],
      travelStatus: "home",
    },
    environment: defaultEnvironment,
    profile,
  };

  if (overrides) {
    return { ...state, ...overrides };
  }

  return state;
}

/**
 * Generate Today's Ojas Daily Decision
 */
export function computeOjasDailyDecision(state: UnifiedFitnessState): DailyDecision {
  const { movement, recovery, nutrition, lifestyle, environment, profile } = state;

  // RULE 1: Determine Action based on Recovery Score & Fatigue
  let action: OjasDecisionAction = "TRAIN";
  let badgeColor: DailyDecision["badgeColor"] = "green";

  if (recovery.recoveryScore < 45 || recovery.sleepHours < 5.0 || movement.fatigueScore > 78) {
    action = "RECOVER";
    badgeColor = "blue";
  } else if (recovery.recoveryScore < 68 || movement.muscleReadiness.lowerBody === "fatigued" && movement.muscleReadiness.upperBody === "fatigued") {
    action = "REDUCE_INTENSITY";
    badgeColor = "yellow";
  } else {
    action = "TRAIN";
    badgeColor = "green";
  }

  // RULE 2: Adaptive Workout Selection based on Time, Muscle Readiness, Equipment
  const duration = lifestyle.availableTimeMinutes || 35;
  let workoutTitle = "";
  let workoutFocus = "";
  let workoutIntensity: "Low" | "Moderate" | "High" = "Moderate";
  const exercises: DailyDecision["suggestedWorkout"]["exercises"] = [];

  if (action === "RECOVER") {
    workoutTitle = `${Math.min(25, duration)}-minute Active Recovery & Mobility`;
    workoutFocus = "Gentle joint decompression, parasympathetic breathing, and fascia release";
    workoutIntensity = "Low";
    exercises.push(
      { name: "Cat-Cow & Thoracic Rotations", sets: 3, reps: "10 slow reps", notes: "Decompress spine and open anterior chest.", formCoachSupported: true },
      { name: "World's Greatest Stretch", sets: 3, reps: "5 per side", notes: "Open hips and thoracic spine without high neurological demand.", formCoachSupported: true },
      { name: "Diaphragmatic Box Breathing", sets: 1, reps: "5 mins", notes: "4s inhale, 4s hold, 4s exhale, 4s hold to lower cortisol." }
    );
  } else if (action === "REDUCE_INTENSITY") {
    workoutTitle = `${duration}-minute Zone 2 Cardio & Core Flow`;
    workoutFocus = "Low-impact metabolic conditioning and postural stability";
    workoutIntensity = "Low";
    exercises.push(
      { name: "Controlled Bodyweight Squats", sets: 3, reps: "12 reps (RPE 6)", notes: "Focus on knee tracking and smooth eccentric cadence.", formCoachSupported: true },
      { name: "Incline Push-ups / Band Pull-aparts", sets: 3, reps: "10-12 reps", notes: "Maintain shoulder retraction, avoid mechanical failure.", formCoachSupported: true },
      { name: "Deadbug / Plank Holds", sets: 3, reps: "40 sec hold", notes: "Keep lower back flat to floor, brace core tightly.", formCoachSupported: true }
    );
  } else {
    // Normal / High Readiness
    if (movement.muscleReadiness.lowerBody === "fatigued") {
      workoutTitle = `${duration}-minute Upper Body Hypertrophy & Core`;
      workoutFocus = "Chest, Upper Back, Delts & Core (saving fatigued legs)";
      workoutIntensity = "Moderate";
      exercises.push(
        { name: "Push-ups (or DB Bench Press)", sets: 4, reps: "10-12 reps (2 RIR)", notes: "Keep elbows at 45 degrees, chest to floor.", formCoachSupported: true },
        { name: "Dumbbell Bent-Over Row / Pull-ups", sets: 4, reps: "10-12 reps", notes: "Drive elbows to hips, squeeze lats at top.", formCoachSupported: true },
        { name: "Dumbbell Overhead Shoulder Press", sets: 3, reps: "10-12 reps", notes: "Neutral spine, avoid arching lower back.", formCoachSupported: true },
        { name: "Plank with Shoulder Taps", sets: 3, reps: "16 taps", notes: "Resist hip sway, engage obliques.", formCoachSupported: true }
      );
    } else {
      workoutTitle = `${duration}-minute Full Body Athletic Density Split`;
      workoutFocus = "Compound multi-joint power, hypertrophy, and functional strength";
      workoutIntensity = duration <= 25 ? "High" : "Moderate";
      exercises.push(
        { name: "Goblet Squats / Bodyweight Squats", sets: 4, reps: "12-15 reps (2 RIR)", notes: "Drive knees out over toes, maintain upright chest.", formCoachSupported: true },
        { name: "Push-ups (Standard / Diamond)", sets: 3, reps: "10-12 reps", notes: "Full range of motion, lock out at top.", formCoachSupported: true },
        { name: "Romanian Deadlifts (Dumbbells/Bands)", sets: 3, reps: "12 reps", notes: "Hinge at hips, maintain neutral lumbar spine.", formCoachSupported: true },
        { name: "Hanging Knee Raises / Mountain Climbers", sets: 3, reps: "15 reps", notes: "Controlled core contraction without swinging.", formCoachSupported: true }
      );
    }
  }

  // Build "Why Ojas recommends this" bullets based on transparent inputs
  const whyReasons: string[] = [
    `Recovery readiness is ${recovery.recoveryScore}/100 (${recovery.readinessZone.toUpperCase()} zone).`,
    `Sleep duration: ${recovery.sleepHours}h (${recovery.sleepQuality} quality).`,
    `Training load: ${movement.recentTrainingLoad}/100 with ${movement.weeklyWorkoutsCount} sessions logged this week.`,
    `Available window: ${lifestyle.availableTimeMinutes} minutes in ${lifestyle.exerciseLocation} environment.`,
  ];

  if (movement.muscleReadiness.lowerBody === "fatigued") {
    whyReasons.push("Lower-body fatigue is elevated from previous session; shifted volume to upper body.");
  }

  if (environment.condition === "hot") {
    whyReasons.push(`Environment is hot (${environment.temperatureC}°C); hydration target increased.`);
  }

  // Nutrition Action & Affordable Protein Hack
  let nutritionHeadline = "";
  let nutritionRecommendation = "";
  let proteinHack = "";
  let estimatedCost = 65;

  if (nutrition.isHostelMode) {
    nutritionHeadline = "Hostel/Mess Protein Strategy";
    nutritionRecommendation = "Take a double serving of Dal or Egg curry at mess today. Add a katori of curd to complete your amino acid profile.";
    proteinHack = "Boiled Eggs (₹21 for 3 whole eggs = 18g protein) or Soya Chunks (₹15 for 50g = 26g protein).";
    estimatedCost = 45;
  } else if (profile.foodPreference === "veg" || profile.foodPreference === "vegan") {
    nutritionHeadline = "Plant & Dairy Protein Pacing";
    nutritionRecommendation = `Target ${nutrition.proteinTarget}g protein. Balance meals with Paneer, Dal Tadka, Sprouts, and Curd.`;
    proteinHack = "Soya Chunks Bhurji + Curd (₹25 total for 32g protein).";
    estimatedCost = 60;
  } else {
    nutritionHeadline = "High-Quality Protein Distribution";
    nutritionRecommendation = `Target ${nutrition.proteinTarget}g protein across 3-4 meals. Prioritize eggs, chicken, fish, or paneer post-workout.`;
    proteinHack = "Egg Bhurji (2 eggs) + 2 Phulka Rotis (₹30 total for 22g protein).";
    estimatedCost = 75;
  }

  // 4 Core Priorities
  const priorities: DailyPriority[] = [
    {
      icon: "🏋️",
      category: "workout",
      title: workoutTitle,
      description: `${workoutIntensity} intensity • ${duration} mins • ${exercises.length} key movements`,
      actionText: "Start Workout",
      actionHref: "/workout",
    },
    {
      icon: "🍛",
      category: "nutrition",
      title: nutritionHeadline,
      description: `Target ${nutrition.proteinTarget}g protein today. ${proteinHack.split("=")[0]}`,
      actionText: "View Nutrition",
      actionHref: "/food",
    },
    {
      icon: "💧",
      category: "hydration",
      title: `${nutrition.waterLitersTarget}L Hydration Target`,
      description: `Currently at ${nutrition.waterLitersConsumed}L. Keep a water bottle handy for steady sips.`,
      actionText: "Quick Log +250ml",
    },
    {
      icon: "😴",
      category: "recovery",
      title: `${Math.round(profile.sleepDuration)}h Sleep & Wind-Down Target`,
      description: `Aim for bedtime at ${profile.sleepTime || "10:30 PM"} to keep circadian rhythm synchronized.`,
      actionText: "Recovery Protocols",
      actionHref: "/recovery",
    },
  ];

  return {
    action,
    badgeColor,
    headline: workoutTitle,
    subtitle: workoutFocus,
    whyReasons,
    basedOn: {
      recoveryScore: recovery.recoveryScore,
      sleepHours: recovery.sleepHours,
      trainingLoad: movement.recentTrainingLoad > 65 ? "Elevated" : "Balanced",
      availableTime: lifestyle.availableTimeMinutes,
      fatigueFocus: movement.muscleReadiness.lowerBody === "fatigued" ? "Lower Body" : "Systemic Low",
      environmentText: `${environment.temperatureC || 30}°C (${environment.condition || "Moderate"})`,
      primaryGoal: profile.goal,
    },
    priorities,
    confidence: "High",
    suggestedWorkout: {
      title: workoutTitle,
      durationMinutes: duration,
      intensity: workoutIntensity,
      focus: workoutFocus,
      exercises,
      alternativeIndoorWorkout: "15-minute Low-Impact Bodyweight Calisthenics",
    },
    suggestedNutritionAction: {
      headline: nutritionHeadline,
      recommendation: nutritionRecommendation,
      affordableProteinHack: proteinHack,
      estimatedCostINR: estimatedCost,
    },
    recoveryAction: {
      headline: action === "RECOVER" ? "Dedicated Parasympathetic Reset" : "Post-Workout 5m Mobility",
      protocol: "5 minutes dynamic stretch + 500ml water with a pinch of pink salt for electrolyte balance.",
      mobilityMinutes: 5,
    },
  };
}

/**
 * Hostel Mess Menu Intelligence Engine:
 * Analyzes mess menu and returns ranked recommendations (🥇 Best, 🥈 Solid, ⚠️ Caution)
 */
export function analyzeHostelMessMenu(menu: HostelMessDayMenu, profile: ClientProfile): HostelChoiceRanking[] {
  const rankings: HostelChoiceRanking[] = [];

  const safeIncludes = (arr: any[], term: string) =>
    Array.isArray(arr) && arr.some((i) => typeof i === "string" && i.toLowerCase().includes(term));

  // 1. Analyze Breakfast
  const bItems = menu?.breakfast || ["Idli", "Sambar", "Chutney"];
  const hasEggs = safeIncludes(bItems, "egg");
  const hasSprouts = safeIncludes(bItems, "sprout");
  const hasIdli = safeIncludes(bItems, "idli");
  const hasVada = safeIncludes(bItems, "vada") || safeIncludes(bItems, "puri");

  if (hasEggs || hasSprouts) {
    rankings.push({
      rank: 1,
      badge: "🥇 Best Choice",
      mealCategory: "Breakfast",
      selectedItems: hasEggs ? ["2 Boiled Eggs / Omelette", "2 Rotis or 2 Idlis", "Sambar"] : ["Sprouts Salad", "2 Idlis", "Sambar"],
      estimatedMacros: { calories: 340, proteinGrams: 18, carbsGrams: 45, fatGrams: 8 },
      reasoning: "Highest bioavailable protein in the morning mess menu with complex slow carbohydrates.",
      ojasHostelTip: "Drink the sambar bowl first; lentils provide essential leucine to trigger muscle protein synthesis.",
    });
  } else if (hasIdli) {
    rankings.push({
      rank: 1,
      badge: "🥇 Best Choice",
      mealCategory: "Breakfast",
      selectedItems: ["3-4 Idlis", "Double Bowl Sambar", "1 Spoon Chutney"],
      estimatedMacros: { calories: 320, proteinGrams: 9, carbsGrams: 58, fatGrams: 5 },
      reasoning: "Steamed fermented rice & urad dal is easily digestible without sluggish oil fatigue.",
      ojasHostelTip: "Ask the mess staff for a double ladle of thick dal sambar instead of extra coconut chutney.",
    });
  } else {
    rankings.push({
      rank: 1,
      badge: "🥇 Best Choice",
      mealCategory: "Breakfast",
      selectedItems: bItems.slice(0, 2),
      estimatedMacros: { calories: 310, proteinGrams: 8, carbsGrams: 52, fatGrams: 7 },
      reasoning: "Standard mess breakfast. Pair with a handful of roasted peanuts in your hostel room.",
      ojasHostelTip: "Keep a ₹50 jar of roasted chana in your hostel room to supplement 10g extra protein.",
    });
  }

  // 2. Analyze Lunch
  const lItems = menu?.lunch || ["Rice", "Dal", "Cabbage Sabzi", "Curd"];
  const hasChicken = safeIncludes(lItems, "chicken");
  const hasPaneer = safeIncludes(lItems, "paneer");
  const hasCurd = safeIncludes(lItems, "curd") || safeIncludes(lItems, "dahi") || safeIncludes(lItems, "buttermilk");

  rankings.push({
    rank: 1,
    badge: "🥇 Best Choice",
    mealCategory: "Lunch",
    selectedItems: hasChicken
      ? ["Chicken Curry (2 pieces)", "1 Cup Rice", "1 Bowl Dal", "Curd"]
      : hasPaneer
      ? ["Paneer Curry", "2 Rotis", "1 Bowl Dal", "Curd"]
      : ["2 Ladles Dal Tadka", "1 Cup Rice", "Cabbage/Veg Sabzi", "1 Bowl Curd"],
    estimatedMacros: {
      calories: hasChicken ? 540 : 460,
      proteinGrams: hasChicken ? 34 : hasPaneer ? 24 : 16,
      carbsGrams: 64,
      fatGrams: 14,
    },
    reasoning: "Optimal balance of protein, complex carbs, and gut-friendly probiotics.",
    ojasHostelTip: "Don't overload on plain white rice. Aim for a 1:1 plate volume ratio between rice and dal/curd.",
  });

  // 3. Dinner Caution
  const dItems = menu.dinner || ["Chapati", "Egg Curry", "Rice"];
  rankings.push({
    rank: 3,
    badge: "⚠️ Limit / Mind Portions",
    mealCategory: "Dinner",
    selectedItems: ["Excess White Rice", "Deep Fried Papad", "Sweet / Halwa (if served)"],
    estimatedMacros: { calories: 380, proteinGrams: 3, carbsGrams: 72, fatGrams: 12 },
    reasoning: "High refined glycemic load right before sleep reduces sleep slow-wave depth.",
    ojasHostelTip: "Prefer 2-3 whole wheat chapatis with egg/soya curry over night rice for stable overnight glucose.",
  });

  return rankings;
}
