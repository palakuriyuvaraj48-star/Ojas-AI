import { MobilityDifficulty, RestDayActivity, StretchType } from "./types";

// ---------- Mobility ----------
export interface MobilityExercise {
  name: string;
  duration: number; // seconds
  sets: number;
  reps?: string;
  hold?: string;
  instructions: string;
}
export interface MobilityPlan {
  id: string;
  title: string;
  difficulty: MobilityDifficulty;
  duration: number;
  targetMuscles: string[];
  focus: string;
  aiNote: string;
  exercises: MobilityExercise[];
}

interface MobilityTemplate {
  difficulty: MobilityDifficulty;
  duration: number;
  targetMuscles: string[];
  focus: string;
  aiNote: string;
  exercises: MobilityExercise[];
}

const MOBILITY_LIBRARY: Record<string, MobilityTemplate> = {
  general: {
    difficulty: "beginner",
    duration: 15,
    targetMuscles: ["Full Body"],
    focus: "General mobility",
    aiNote: "A balanced full-body flow ideal for active recovery days.",
    exercises: [
      { name: "Cat-Cow Stretch", duration: 60, sets: 2, instructions: "On all fours, alternate arching and rounding your spine." },
      { name: "90/90 Hip Switches", duration: 45, sets: 2, instructions: "Sit with knees at 90°, rotate hips side to side." },
      { name: "Thoracic Rotations", duration: 45, sets: 2, instructions: "On all fours, rotate upper back and reach to ceiling." },
      { name: "Deep Squat Hold", duration: 60, sets: 2, hold: "30s", instructions: "Hold a deep squat, elbows pushing knees outward." },
    ],
  },
  legs: {
    difficulty: "intermediate",
    duration: 20,
    targetMuscles: ["Quads", "Hamstrings", "Glutes", "Hip Flexors"],
    focus: "Lower body recovery",
    aiNote: "Targeted post-leg-day flow to flush blood and reduce DOMS.",
    exercises: [
      { name: "Quadruped Hip Circles", duration: 60, sets: 2, instructions: "On all fours, circle hips in large arcs." },
      { name: "Kneeling Hip Flexor Stretch", duration: 45, sets: 2, hold: "30s/side", instructions: "Kneel, push hips forward, brace core." },
      { name: "Hamstring Sweep", duration: 45, sets: 2, instructions: "From a lunge, sweep front foot side to side." },
      { name: "Glute Bridge March", duration: 60, sets: 2, instructions: "Bridge position, march feet, squeeze glutes." },
    ],
  },
  upper: {
    difficulty: "intermediate",
    duration: 20,
    targetMuscles: ["Shoulders", "Chest", "Lats", "Thoracic Spine"],
    focus: "Upper body recovery",
    aiNote: "Improves shoulder health after pressing and pulling days.",
    exercises: [
      { name: "Dead Hang", duration: 45, sets: 3, instructions: "Hang from a bar, relax shoulders, breathe deeply." },
      { name: "Band Pull-Aparts", duration: 60, sets: 3, instructions: "Pull a band apart at eye level, squeeze scapulae." },
      { name: "Child's Pose Reach", duration: 45, sets: 2, hold: "30s/side", instructions: "Child's pose, reach arms side to side." },
      { name: "Wall Slides", duration: 45, sets: 2, instructions: "Back to wall, slide arms up keeping contact." },
    ],
  },
  back: {
    difficulty: "intermediate",
    duration: 25,
    targetMuscles: ["Thoracic Spine", "Lats", "Lower Back"],
    focus: "Spine health",
    aiNote: "Counteracts desk posture and lifting compression.",
    exercises: [
      { name: "Prone Press-Ups", duration: 45, sets: 2, instructions: "Lie prone, push upper body up, hips down." },
      { name: "Seated Spinal Twist", duration: 45, sets: 2, hold: "30s/side", instructions: "Seated, twist torso using arm leverage." },
      { name: "Puppy Pose", duration: 60, sets: 2, instructions: "Tabletop, walk hands forward, hips high." },
    ],
  },
  desk: {
    difficulty: "beginner",
    duration: 10,
    targetMuscles: ["Neck", "Shoulders", "Upper Back", "Hip Flexors"],
    focus: "Desk posture",
    aiNote: "Quick office routine for forward-head posture and tight hips.",
    exercises: [
      { name: "Chin Tucks", duration: 30, sets: 3, instructions: "Sit tall, tuck chin, hold 2s, release." },
      { name: "Scapular Squeezes", duration: 30, sets: 3, instructions: "Squeeze shoulder blades, hold 3s." },
      { name: "Seated Hip Flexor Stretch", duration: 45, sets: 2, hold: "30s/side", instructions: "Standing lunge, push hips forward." },
      { name: "Wrist Flexor Stretch", duration: 30, sets: 2, instructions: "Pull fingers back with opposite hand." },
    ],
  },
  travel: {
    difficulty: "beginner",
    duration: 12,
    targetMuscles: ["Full Body"],
    focus: "Travel relief",
    aiNote: "Hotel-room friendly. No equipment required.",
    exercises: [
      { name: "Standing Forward Fold", duration: 45, sets: 2, instructions: "Feet hip-width, fold forward, head relaxed." },
      { name: "Seated Spinal Twist", duration: 45, sets: 2, hold: "30s/side", instructions: "Seated in a chair, twist torso." },
      { name: "Ankle Circles", duration: 30, sets: 2, instructions: "Lift foot, circle ankle both directions." },
      { name: "Neck Rolls", duration: 30, sets: 2, instructions: "Slow neck circles, avoid rolling backward." },
    ],
  },
};

const MOBILITY_TITLES: Record<string, string> = {
  general: "General Mobility Flow",
  legs: "Legs Recovery Mobility",
  upper: "Upper Body Mobility",
  back: "Spine & Back Mobility",
  desk: "Desk Mobility Routine",
  travel: "Travel Mobility",
};

export function generateMobilityPlan(target = "general", timeAvailable = 15, soreness: string[] = []): MobilityPlan {
  const key = MOBILITY_LIBRARY[target] ? target : "general";
  const base = MOBILITY_LIBRARY[key];
  let exercises = [...base.exercises];
  let duration = base.duration;

  if (timeAvailable < 10) {
    duration = Math.min(base.duration, timeAvailable);
    exercises = exercises.slice(0, 2);
  } else if (timeAvailable > 25) {
    // add a couple of general openers when time is generous
    exercises = [...exercises, ...MOBILITY_LIBRARY.general.exercises.slice(0, 2)];
    duration = timeAvailable;
  }

  // If specific muscles are sore, bias the note.
  const note =
    soreness.length > 0
      ? `${base.aiNote} Prioritise the ${soreness.join(", ")} work — these are the most limited today.`
      : base.aiNote;

  return {
    id: `mob-${key}-${timeAvailable}`,
    title: MOBILITY_TITLES[key],
    difficulty: base.difficulty,
    duration,
    targetMuscles: base.targetMuscles,
    focus: base.focus,
    aiNote: note,
    exercises,
  };
}

// ---------- Stretching ----------
export interface StretchExercise {
  name: string;
  duration: number;
  instructions: string;
  targetArea: string;
}
export interface StretchingPlan {
  id: string;
  type: StretchType;
  title: string;
  duration: number;
  exercises: StretchExercise[];
}

const STRETCH_LIBRARY: Record<StretchType, { title: string; duration: number; exercises: StretchExercise[] }> = {
  "pre-workout": {
    title: "Pre-Workout Dynamic Flow",
    duration: 8,
    exercises: [
      { name: "Arm Circles", duration: 60, instructions: "Large circles front-to-back, gradually increase range.", targetArea: "Shoulders" },
      { name: "Leg Swings", duration: 60, instructions: "Swing legs front-to-back and side-to-side, 10 each.", targetArea: "Hips" },
      { name: "Walking Knee Hugs", duration: 60, instructions: "Walk forward, pull knee to chest, alternate.", targetArea: "Glutes/Hips" },
      { name: "Torso Twists", duration: 45, instructions: "Feet wide, twist torso, let arms follow.", targetArea: "Core" },
    ],
  },
  "post-workout": {
    title: "Post-Workout Static Stretch",
    duration: 10,
    exercises: [
      { name: "Quad Stretch", duration: 45, instructions: "Stand, pull foot to glute, hold 30s each side.", targetArea: "Quads" },
      { name: "Hamstring Reach", duration: 45, instructions: "Seated, reach for toes, hold 30s.", targetArea: "Hamstrings" },
      { name: "Chest Opener", duration: 45, instructions: "Clasp hands behind back, lift slightly, hold 30s.", targetArea: "Chest" },
      { name: "Child's Pose", duration: 60, instructions: "Knees wide, arms forward, hold 45s.", targetArea: "Back" },
    ],
  },
  "rest-day": {
    title: "Rest Day Gentle Stretch",
    duration: 15,
    exercises: [
      { name: "Standing Side Bend", duration: 45, instructions: "Reach arm overhead, lean side to side, hold 20s.", targetArea: "Obliques" },
      { name: "Seated Forward Fold", duration: 60, instructions: "Seated, reach for toes, hold 45s.", targetArea: "Hamstrings/Lower Back" },
      { name: "Butterfly Stretch", duration: 60, instructions: "Soles together, press knees down, hold 45s.", targetArea: "Hip Adductors" },
      { name: "Supported Fish Pose", duration: 60, instructions: "Block under upper back, arms relaxed overhead.", targetArea: "Chest/Upper Back" },
    ],
  },
  desk: {
    title: "Desk Mobility Routine",
    duration: 7,
    exercises: [
      { name: "Neck Tilt", duration: 30, instructions: "Tilt ear to shoulder, hold 15s each side.", targetArea: "Neck" },
      { name: "Shoulder Rolls", duration: 30, instructions: "Roll shoulders up, back, down, 10 reps.", targetArea: "Shoulders" },
      { name: "Seated Pigeon", duration: 45, instructions: "Cross ankle over knee, lean forward, hold 20s.", targetArea: "Hip Flexors" },
      { name: "Wrist Flexor Stretch", duration: 30, instructions: "Extend arm, pull fingers back, hold 15s.", targetArea: "Wrists" },
    ],
  },
  travel: {
    title: "Travel Stretch",
    duration: 10,
    exercises: [
      { name: "Seated Spinal Twist", duration: 45, instructions: "Sit tall, twist toward chair back, hold 20s/side.", targetArea: "Spine" },
      { name: "Standing Calf Stretch", duration: 45, instructions: "Hands on wall, one foot back, heel down, hold 25s.", targetArea: "Calves" },
      { name: "Ankle Circles", duration: 30, instructions: "Lift foot, circle ankle, 10 each direction.", targetArea: "Ankles" },
    ],
  },
};

export function generateStretchingPlan(type: StretchType = "rest-day"): StretchingPlan {
  const lib = STRETCH_LIBRARY[type] ?? STRETCH_LIBRARY["rest-day"];
  return { id: `stretch-${type}`, type, title: lib.title, duration: lib.duration, exercises: lib.exercises };
}

// ---------- Rest Day ----------
export interface RestDayPlan {
  recommendation: RestDayActivity;
  duration: number;
  reasoning: string;
  alternatives: RestDayActivity[];
  confidence: number;
  expectedBenefit: string;
}

const REST_ACTIVITIES: RestDayActivity[] = ["full-rest", "walking", "yoga", "stretching", "breathing", "light-cycling"];

export function generateRestDayPlan(recoveryScore: number, fatigue: number, hrv?: number): RestDayPlan {
  let recommendation: RestDayActivity = "full-rest";
  let duration = 0;
  let reasoning = "";

  if (recoveryScore >= 80) {
    recommendation = "light-cycling";
    duration = 30;
    reasoning = "Recovery is excellent. Light cycling maintains blood flow without CNS fatigue.";
  } else if (recoveryScore >= 65) {
    recommendation = "walking";
    duration = 45;
    reasoning = "Recovery is moderate. A brisk walk promotes circulation and aids repair.";
  } else if (recoveryScore >= 50) {
    recommendation = "yoga";
    duration = 20;
    reasoning = "Recovery is suboptimal. Yoga blends mobility and breathing to activate the parasympathetic state.";
  } else if (recoveryScore >= 35) {
    recommendation = "stretching";
    duration = 15;
    reasoning = "Fatigue is elevated. Gentle stretching eases tension without adding load.";
  } else {
    recommendation = "breathing";
    duration = 10;
    reasoning = "Systemic recovery is critically low. Breathwork and sleep reset cortisol and HRV.";
  }

  if (recommendation === "breathing" && hrv && hrv < 50) {
    reasoning += " Low HRV confirms a parasympathetic reset is the smartest move today.";
  }

  const alternatives = REST_ACTIVITIES.filter((a) => a !== recommendation).slice(0, 3);
  const confidence = Math.round(75 + Math.min(20, (recoveryScore - 35) * 0.4));

  return {
    recommendation,
    duration,
    reasoning,
    alternatives,
    confidence,
    expectedBenefit: "Lowers cortisol, improves HRV, and primes the body for the next training session.",
  };
}

// ---------- Hydration ----------
export interface HydrationPlan {
  targetLiters: number;
  baselineLiters: number;
  workoutLiters: number;
  weatherLiters: number;
  perHour: number;
  advice: string[];
}

export function computeHydrationPlan(
  bodyWeightKg: number,
  workoutMinutes: number,
  weatherCelsius: number,
  alreadyDrankLiters = 0
): HydrationPlan {
  const baseline = Math.round(bodyWeightKg * 0.035 * 10) / 10;
  const workoutLiters = Math.round((workoutMinutes / 60) * 0.6 * 10) / 10; // ~0.6L per hour
  const heat = weatherCelsius > 28 ? 0.5 : weatherCelsius > 22 ? 0.25 : 0;
  const weatherLiters = heat;
  const target = Math.round((baseline + workoutLiters + weatherLiters) * 10) / 10;
  const remaining = Math.max(0, Math.round((target - alreadyDrankLiters) * 10) / 10);
  const perHour = Math.max(0.15, Math.round((remaining / 14) * 100) / 100);

  const advice = [
    `Base need ≈ ${baseline}L from body weight (${bodyWeightKg}kg).`,
    workoutMinutes > 0 ? `Add ${workoutLiters}L for ${workoutMinutes} min of training.` : "No workout logged — stay near baseline.",
    weatherCelsius > 22 ? `Hot weather (${weatherCelsius}°C) adds ${weatherLiters}L of sweat loss.` : "Temperate weather — no heat surcharge.",
    `You still need ~${remaining}L today — about ${perHour}L/hour while awake.`,
  ];

  return { targetLiters: target, baselineLiters: baseline, workoutLiters, weatherLiters, perHour, advice };
}

// ---------- Nutrition for recovery ----------
export interface NutritionRecovery {
  score: number;
  proteinGrams: number;
  proteinTarget: number;
  calorieAdherence: number; // 0-100
  mealTiming: "poor" | "fair" | "good";
  issues: string[];
  suggestions: string[];
}

export function evaluateNutritionRecovery(
  proteinGrams: number,
  proteinTarget: number,
  caloriesConsumed: number,
  calorieTarget: number,
  lastMealHoursAgo: number
): NutritionRecovery {
  const proteinPct = proteinTarget > 0 ? (proteinGrams / proteinTarget) * 100 : 0;
  const calorieAdherence = calorieTarget > 0 ? clamp((100 - Math.abs(caloriesConsumed - calorieTarget) / calorieTarget * 100)) : 60;

  let score = clamp(proteinPct * 0.6 + calorieAdherence * 0.4);
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (proteinPct < 80) {
    issues.push(`Protein at ${Math.round(proteinGrams)}g is below the ${Math.round(proteinTarget)}g target (${Math.round(proteinPct)}%).`);
    suggestions.push("Add a 30-40g protein feed within 2h post-workout to drive MPS.");
  }
  if (calorieAdherence < 80) {
    issues.push(`Calorie intake is ${caloriesConsumed} vs ${calorieTarget} target kcal.`);
    suggestions.push("Even out energy intake to avoid a recovery deficit on training days.");
  }
  const mealTiming: NutritionRecovery["mealTiming"] = lastMealHoursAgo <= 3 ? "good" : lastMealHoursAgo <= 6 ? "fair" : "poor";
  if (mealTiming !== "good") {
    issues.push(`Last meal was ${Math.round(lastMealHoursAgo)}h ago — gaps blunt overnight repair.`);
    suggestions.push("Have a slow-digesting protein (casein/cottage cheese) before bed.");
  }
  if (issues.length === 0) {
    suggestions.push("Nutrition is well aligned with recovery — keep it consistent.");
  }

  return { score: Math.round(score), proteinGrams: Math.round(proteinGrams), proteinTarget: Math.round(proteinTarget), calorieAdherence: Math.round(calorieAdherence), mealTiming, issues, suggestions };
}

function clamp(v: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, v));
}
