/**
 * Adaptive Engine: Core intelligence that adapts fitness plans based on evolving user state.
 * Compares CURRENT_STATE vs CURRENT_PLAN vs EXPECTED_PROGRESS to decide what changes.
 */

import {
  WorkoutPlan,
  NutritionPlan,
  RecoveryPlan,
  FitnessPlan,
  AdaptationRecommendation,
  AdaptedPlan,
} from "./types";
import { DigitalTwin } from "../digital-twin/types";
import { ClientProfile, FitnessGoal } from "@/types/profile";

/**
 * Generate initial fitness plan from user profile and digital twin.
 */
export function generateInitialPlan(profile: ClientProfile, twin: DigitalTwin): FitnessPlan {
  const now = new Date().toISOString();

  // Estimate daily caloric needs
  const calorieMultiplier = {
    sedentary: 1.2,
    "lightly-active": 1.375,
    "moderately-active": 1.55,
    "very-active": 1.725,
    "extra-active": 1.9,
  };

  const bmr = profile.gender === "male" ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5 : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  const tdee = bmr * (calorieMultiplier[profile.activityLevel] || 1.55);

  let dailyCalories: number;
  const macro = { protein: 0, carbs: 0, fat: 0 };

  if (profile.goal === "fat-loss") {
    dailyCalories = Math.round(tdee * 0.85); // 15% deficit
    macro.protein = Math.round(profile.weight * 2.2); // high protein
    macro.fat = Math.round(dailyCalories * 0.25) / 9;
    macro.carbs = (dailyCalories - macro.protein * 4 - macro.fat * 9) / 4;
  } else if (profile.goal === "muscle-gain" || profile.goal === "lean-bulk") {
    dailyCalories = Math.round(tdee * 1.1); // 10% surplus
    macro.protein = Math.round(profile.weight * 2.0);
    macro.fat = Math.round(dailyCalories * 0.25) / 9;
    macro.carbs = (dailyCalories - macro.protein * 4 - macro.fat * 9) / 4;
  } else {
    dailyCalories = Math.round(tdee);
    macro.protein = Math.round(profile.weight * 1.6);
    macro.fat = Math.round(dailyCalories * 0.3) / 9;
    macro.carbs = (dailyCalories - macro.protein * 4 - macro.fat * 9) / 4;
  }

  // Build workout plan based on available time and equipment
  const availableTime = twin.lifestyle.availableTime;
  let workoutDuration = 45;
  let daysPerWeek = Math.min(profile.workoutDaysPerWeek, 5);
  let intensity: "low" | "moderate" | "high" = "moderate";

  if (availableTime < 30) {
    workoutDuration = 20;
    intensity = "high"; // HIIT style
  } else if (availableTime < 45) {
    workoutDuration = 30;
    intensity = "moderate";
  }

  // Select exercises based on equipment
  const exercises = selectExercises(
    profile.goal,
    workoutDuration,
    twin.lifestyle.availableEquipment,
    intensity
  );

  const workoutPlan: WorkoutPlan = {
    id: `workout_${Date.now()}`,
    durationMinutes: workoutDuration,
    daysPerWeek: daysPerWeek,
    intensity,
    exercises,
    focusAreas: getGoalFocusAreas(profile.goal),
    equipment: twin.lifestyle.availableEquipment,
    expectedProgress: `${profile.goal.replace("-", " ")} over 12 weeks`,
  };

  // Nutrition plan
  const nutritionPlan: NutritionPlan = {
    id: `nutrition_${Date.now()}`,
    dailyCalories,
    macros: {
      protein: {
        grams: Math.round(macro.protein),
        percent: Math.round((macro.protein * 4) / dailyCalories) * 100,
      },
      carbs: {
        grams: Math.round(macro.carbs),
        percent: Math.round((macro.carbs * 4) / dailyCalories) * 100,
      },
      fat: {
        grams: Math.round(macro.fat),
        percent: Math.round((macro.fat * 9) / dailyCalories) * 100,
      },
    },
    meals: generateMeals(dailyCalories, macro, profile.foodPreference, twin.nutrition.budget),
    budget: twin.nutrition.budget,
    foodPreferences: [profile.foodPreference],
    notes: `Tailored to ${profile.foodPreference} preferences and ₹${twin.nutrition.budget}/day budget`,
  };

  // Recovery plan
  const recoveryPlan: RecoveryPlan = {
    id: `recovery_${Date.now()}`,
    sleepTarget: profile.sleepDuration,
    restDays: 7 - daysPerWeek,
    mobilityMinutes: workoutDuration < 30 ? 5 : 10,
    stressManagement: ["meditation", "deep breathing", "yoga"],
    notes: "Focus on sleep consistency and stress management",
  };

  return {
    id: `plan_${Date.now()}`,
    userId: profile.name || "user",
    version: 1,
    timestamp: now,
    name: `${profile.goal} Plan - v1`,
    goal: profile.goal,
    duration: 12, // weeks
    workoutPlan,
    nutritionPlan,
    recoveryPlan,
    milestones: [
      { week: 2, target: "Establish routine", expectedProgress: "Habits formed" },
      { week: 4, target: "First visible progress", expectedProgress: "Energy increase" },
      { week: 8, target: "Measurable progress", expectedProgress: "Performance improvement" },
      { week: 12, target: "Significant transformation", expectedProgress: "Body composition change" },
    ],
    confidence: 65, // initial confidence
  };
}

/**
 * Adapt an existing plan based on changes in the digital twin.
 */
export function adaptPlan(
  currentPlan: FitnessPlan,
  currentTwin: DigitalTwin,
  previousTwin: DigitalTwin | null
): AdaptedPlan {
  const now = new Date().toISOString();
  const adaptations: AdaptationRecommendation[] = [];
  const beforeAfter: { category: string; before: string; after: string }[] = [];
  // Recommendations and the returned plan must remain in sync: consumers can
  // safely execute the adapted plan instead of only rendering its explanation.
  const workoutPlan: WorkoutPlan = { ...currentPlan.workoutPlan, exercises: [...currentPlan.workoutPlan.exercises] };
  const nutritionPlan: NutritionPlan = { ...currentPlan.nutritionPlan, meals: [...currentPlan.nutritionPlan.meals] };
  const recoveryPlan: RecoveryPlan = { ...currentPlan.recoveryPlan, stressManagement: [...currentPlan.recoveryPlan.stressManagement] };

  // Key decision factors
  const previousAvailableTime = previousTwin?.lifestyle.availableTime ?? 60;
  const timeDecreased = currentTwin.lifestyle.availableTime < previousAvailableTime;
  const sleepDegraded =
    currentTwin.recovery.sleepQuality === "poor" ||
    currentTwin.recovery.recoveryScore < 40;
  const stressIncreased = currentTwin.lifestyle.stressLevel === "high";
  const previousBudget = previousTwin?.nutrition.budget;
  const budgetChanged = previousBudget && currentTwin.nutrition.budget !== previousBudget;
  const consistencyLow = currentTwin.behavioral.workoutConsistency < 50;

  // ADAPTATION 1: Workout duration
  if (timeDecreased && currentTwin.lifestyle.availableTime < 30) {
    const recommendation: AdaptationRecommendation = {
      id: `adapt_duration_${Date.now()}`,
      planId: currentPlan.id,
      type: "workout-duration",
      currentValue: currentPlan.workoutPlan.durationMinutes,
      recommendedValue: 20,
      reasoning: `Available time decreased from ${previousTwin?.lifestyle.availableTime || 60}min to ${currentTwin.lifestyle.availableTime}min. Reducing workout to 20 minutes maintains consistency without creating unrealistic expectations.`,
      confidence: 90,
      impact: "high",
      relatedFactors: ["available_time"],
    };
    adaptations.push(recommendation);
    workoutPlan.durationMinutes = 20;
    workoutPlan.exercises = selectExercises(currentPlan.goal as FitnessGoal, 20, currentTwin.lifestyle.availableEquipment, workoutPlan.intensity);
    beforeAfter.push({
      category: "Workout Duration",
      before: `${currentPlan.workoutPlan.durationMinutes} minutes`,
      after: "20 minutes",
    });
  }

  // ADAPTATION 2: Workout intensity
  if ((sleepDegraded || stressIncreased) && currentTwin.recovery.recoveryScore < 40) {
    const recommendation: AdaptationRecommendation = {
      id: `adapt_intensity_${Date.now()}`,
      planId: currentPlan.id,
      type: "workout-intensity",
      currentValue: currentPlan.workoutPlan.intensity,
      recommendedValue: "low",
      reasoning: `Recovery score dropped to ${currentTwin.recovery.recoveryScore}/100. Sleep quality is ${currentTwin.recovery.sleepQuality} and stress is ${currentTwin.lifestyle.stressLevel}. Reducing intensity protects against overtraining during this period.`,
      confidence: 85,
      impact: "high",
      relatedFactors: ["sleep_quality", "recovery_score", "stress_level"],
    };
    adaptations.push(recommendation);
    workoutPlan.intensity = "low";
    beforeAfter.push({
      category: "Workout Intensity",
      before: currentPlan.workoutPlan.intensity,
      after: "low (recovery-focused)",
    });
  }

  // ADAPTATION 3: Training days per week
  if (consistencyLow && timeDecreased) {
    const newDays = Math.max(2, currentPlan.workoutPlan.daysPerWeek - 2);
    const recommendation: AdaptationRecommendation = {
      id: `adapt_days_${Date.now()}`,
      planId: currentPlan.id,
      type: "training-days",
      currentValue: currentPlan.workoutPlan.daysPerWeek,
      recommendedValue: newDays,
      reasoning: `Workout consistency is at ${currentTwin.behavioral.workoutConsistency}%. Reducing training days to ${newDays}/week with higher quality workouts will improve adherence over high-volume plans you can't complete.`,
      confidence: 80,
      impact: "medium",
      relatedFactors: ["workout_consistency", "available_time"],
    };
    adaptations.push(recommendation);
    workoutPlan.daysPerWeek = newDays;
    beforeAfter.push({
      category: "Training Days",
      before: `${currentPlan.workoutPlan.daysPerWeek} days/week`,
      after: `${newDays} days/week`,
    });
  }

  // ADAPTATION 4: Nutrition budget
  if (budgetChanged && previousTwin && currentTwin.nutrition.budget < previousTwin.nutrition.budget) {
    const recommendation: AdaptationRecommendation = {
      id: `adapt_budget_${Date.now()}`,
      planId: currentPlan.id,
      type: "nutrition-budget",
      currentValue: previousBudget,
      recommendedValue: currentTwin.nutrition.budget,
      reasoning: `Food budget changed from ₹${previousBudget}/day to ₹${currentTwin.nutrition.budget}/day. Nutrition plan will pivot to more affordable, locally-available protein and staple foods while maintaining macro targets.`,
      confidence: 95,
      impact: "medium",
      relatedFactors: ["food_budget"],
    };
    adaptations.push(recommendation);
    nutritionPlan.budget = currentTwin.nutrition.budget;
    nutritionPlan.meals = generateMeals(
      nutritionPlan.dailyCalories,
      {
        protein: nutritionPlan.macros.protein.grams,
        carbs: nutritionPlan.macros.carbs.grams,
        fat: nutritionPlan.macros.fat.grams,
      },
      nutritionPlan.foodPreferences[0] as ClientProfile["foodPreference"],
      currentTwin.nutrition.budget
    );
    nutritionPlan.notes = `Adapted to a ₹${currentTwin.nutrition.budget}/day food budget with affordable staples and protein options.`;
    beforeAfter.push({
      category: "Nutrition Budget",
      before: `₹${previousBudget}/day`,
      after: `₹${currentTwin.nutrition.budget}/day`,
    });
  }

  // ADAPTATION 5: Recovery priority
  if (sleepDegraded || stressIncreased) {
    const recommendation: AdaptationRecommendation = {
      id: `adapt_recovery_${Date.now()}`,
      planId: currentPlan.id,
      type: "recovery-priority",
      currentValue: "balanced",
      recommendedValue: "high-priority",
      reasoning: `Sleep duration is ${currentTwin.recovery.sleepDuration}h (down from ${previousTwin?.recovery.sleepDuration}h) and quality is ${currentTwin.recovery.sleepQuality}. Prioritizing recovery practices to maintain progress despite suboptimal conditions.`,
      confidence: 90,
      impact: "medium",
      relatedFactors: ["sleep_duration", "sleep_quality", "stress_level"],
    };
    adaptations.push(recommendation);
    recoveryPlan.mobilityMinutes = Math.max(recoveryPlan.mobilityMinutes, 10);
    recoveryPlan.notes = "Recovery-priority period: keep training comfortable and prioritize sleep consistency.";
    beforeAfter.push({
      category: "Recovery Focus",
      before: "Balanced approach",
      after: "Recovery-priority with stress management",
    });
  }

  // Travel and equipment changes require a usable exercise list, not just a
  // narrative explanation. This keeps no-gym and low-resource modes executable.
  const equipmentChanged = previousTwin &&
    previousTwin.lifestyle.availableEquipment.join("|") !== currentTwin.lifestyle.availableEquipment.join("|");
  if (equipmentChanged) {
    const duration = workoutPlan.durationMinutes;
    adaptations.push({
      id: `adapt_equipment_${Date.now()}`,
      planId: currentPlan.id,
      type: "exercise-selection",
      currentValue: previousTwin.lifestyle.availableEquipment,
      recommendedValue: currentTwin.lifestyle.availableEquipment,
      reasoning: `Available equipment changed. Ojas replaced movements with options practical for ${currentTwin.lifestyle.travelStatus === "travelling" ? "travel" : "your current location"}.`,
      confidence: 100,
      impact: "high",
      relatedFactors: ["available_equipment", "travel_status"],
    });
    workoutPlan.equipment = currentTwin.lifestyle.availableEquipment;
    workoutPlan.exercises = selectExercises(currentPlan.goal as FitnessGoal, duration, workoutPlan.equipment, workoutPlan.intensity);
    beforeAfter.push({
      category: "Equipment",
      before: previousTwin.lifestyle.availableEquipment.join(", ") || "No equipment recorded",
      after: workoutPlan.equipment.join(", ") || "Bodyweight",
    });
  }

  // Generate summary reasoning
  const changeReasons = adaptations.map((a) => `• ${a.reasoning}`).join("\n");
  const changeReasoning = `Plan adapted based on changing circumstances:\n${changeReasons}`;

  const adaptedPlan: AdaptedPlan = {
    ...currentPlan,
    previousVersion: currentPlan.version,
    version: currentPlan.version + 1,
    timestamp: now,
    name: `${currentPlan.goal} Plan - v${currentPlan.version + 1}`,
    workoutPlan,
    nutritionPlan,
    recoveryPlan,
    adaptations,
    changeReasoning,
    beforeAfterComparison: beforeAfter,
    confidence: Math.max(50, currentPlan.confidence - 10), // slightly lower confidence during adaptation
  };

  return adaptedPlan;
}

/**
 * Helper: Select exercises based on goal, duration, equipment, intensity.
 */
function selectExercises(
  goal: FitnessGoal,
  duration: number,
  equipment: string[],
  intensity: string
): WorkoutPlan["exercises"] {
  const baseExercises: WorkoutPlan["exercises"] = [];

  // For short workouts (20min), do compound movements
  if (duration <= 25) {
    baseExercises.push({
      name: "Burpees or Jumping Jacks",
      sets: 3,
      reps: [15, 20],
      rest: 30,
      notes: "Warm-up, full-body engagement",
    });
    baseExercises.push({
      name: "Squats or Lunges",
      sets: 3,
      reps: [12, 15],
      rest: 45,
      notes: "Lower body, full engagement",
    });
    baseExercises.push({
      name: "Push-ups or Chest Press",
      sets: 3,
      reps: [10, 12],
      rest: 45,
      notes: "Upper body push",
    });
  } else {
    // For 30-45min workouts, more detail
    baseExercises.push({
      name: goal === "fat-loss" ? "HIIT Cardio" : "Compound Lift",
      sets: 4,
      reps: [8, 12],
      rest: 60,
      notes: "Main strength builder",
    });
    baseExercises.push({
      name: "Secondary Compound",
      sets: 3,
      reps: [8, 12],
      rest: 60,
      notes: "Secondary strength",
    });
    baseExercises.push({
      name: "Isolation Exercise",
      sets: 3,
      reps: [12, 15],
      rest: 45,
      notes: "Muscle specific",
    });
  }

  return baseExercises;
}

/**
 * Helper: Get focus areas based on goal.
 */
function getGoalFocusAreas(goal: FitnessGoal): string[] {
  const areas: Record<FitnessGoal, string[]> = {
    "fat-loss": ["cardio", "HIIT", "caloric deficit"],
    "lean-bulk": ["compound lifts", "progressive overload", "caloric surplus"],
    "muscle-gain": ["hypertrophy", "compound lifts", "high volume"],
    maintenance: ["consistency", "balanced", "health"],
  };
  return areas[goal] || [];
}

/**
 * Helper: Generate meal suggestions based on macros and preferences.
 */
function generateMeals(
  dailyCalories: number,
  macro: { protein: number; carbs: number; fat: number },
  foodPreference: ClientProfile["foodPreference"],
  budget: number
): NutritionPlan["meals"] {
  const mealCalories = dailyCalories / 3;
  const lowBudget = budget <= 150;
  const breakfastOptions = lowBudget
    ? foodPreference === "veg" ? ["Poha + peanuts", "Oats + milk", "Idli + sambar"] : ["Eggs + toast", "Poha + curd", "Oats + milk"]
    : foodPreference === "veg" ? ["Oats + milk", "Idli + sambar", "Dosa + chutney"] : ["Eggs + toast", "Chicken + rice", "Paneer paratha"];
  const lunchOptions = lowBudget
    ? ["Dal + rice", "Roti + seasonal vegetables", "Chana + rice"]
    : foodPreference === "veg" ? ["Dal + rice", "Roti + veggies", "Chole bhature"] : ["Chicken curry + rice", "Fish + rice", "Mutton + roti"];
  const dinnerOptions = lowBudget
    ? foodPreference === "veg" ? ["Dal + roti", "Khichdi + curd", "Soya chunks + rice"] : ["Egg curry + roti", "Dal + rice", "Soya chunks + rice"]
    : foodPreference === "veg" ? ["Dal + roti", "Sabzi + rice", "Paneer tikka"] : ["Grilled chicken", "Fish curry", "Beef + vegetables"];

  return [
    {
      label: "breakfast",
      calorieTarget: Math.round(mealCalories),
      mealOptions: breakfastOptions,
      proteinTarget: Math.round(macro.protein / 3),
    },
    {
      label: "lunch",
      calorieTarget: Math.round(mealCalories),
      mealOptions: lunchOptions,
      proteinTarget: Math.round(macro.protein / 3),
    },
    {
      label: "dinner",
      calorieTarget: Math.round(mealCalories),
      mealOptions: dinnerOptions,
      proteinTarget: Math.round(macro.protein / 3),
    },
  ];
}
