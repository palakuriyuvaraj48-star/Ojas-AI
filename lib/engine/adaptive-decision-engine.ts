/**
 * Adaptive Decision Engine for OJAS AI
 * Real-time continuous adaptation based on recovery metrics, time constraints,
 * energy level, stress level, equipment, and lifestyle modes.
 */

export interface DashboardState {
  availableTime: number; // in minutes (e.g. 15, 25, 35, 50)
  energyLevel: "energetic" | "moderate" | "tired";
  sleepDuration: number; // in hours (e.g. 7.5)
  stressLevel: "low" | "medium" | "high";
  hostelMode: boolean;
  recovery: number; // 0-100 score
  trainingLoadYesterday: number; // 0-100 score
  currentGoal: "fat-loss" | "strength" | "athletic" | "hypertrophy";
  lastWorkoutIntensity: number; // 0-100
  isExamPeriod?: boolean;
}

export interface WorkoutRecommendation {
  type: "strength" | "hypertrophy" | "endurance" | "recovery" | "minimal" | "reduced";
  title: string;
  duration: number; // minutes
  intensity: "low" | "moderate" | "high";
  focus: string;
  reasoning: string;
  confidence: number; // 0-100
  alternatives: string[];
  exercises: {
    name: string;
    sets: number;
    reps: string;
    notes: string;
  }[];
  adaptationFactor: string;
}

export class AdaptiveDecisionEngine {
  decide(state: DashboardState): WorkoutRecommendation {
    // STEP 1: Check for severe recovery constraints (Sleep < 5h or Recovery < 50)
    if (state.recovery < 50 || state.sleepDuration < 5.0) {
      return this.recommendRecovery(state);
    }

    // STEP 2: Check for extreme time constraint (<= 15m) or Exam Period
    if (state.availableTime <= 15 || state.isExamPeriod) {
      return this.recommendMinimalTraining(state);
    }

    // STEP 3: Check for reduced training time (<= 25m)
    if (state.availableTime <= 25) {
      return this.recommendReducedTraining(state);
    }

    // STEP 4: Check for energy/stress fatigue constraints
    if (state.energyLevel === "tired" || state.stressLevel === "high") {
      return this.recommendModerateSession(state);
    }

    // STEP 5: Check optimal conditions for Progressive Overload (Recovery > 80 & Energetic)
    if (state.recovery > 80 && state.energyLevel === "energetic") {
      return this.recommendProgressiveOverload(state);
    }

    // DEFAULT: Standard balanced training session
    return this.recommendStandardSession(state);
  }

  private recommendRecovery(state: DashboardState): WorkoutRecommendation {
    const isSevere = state.recovery < 40 || state.sleepDuration < 4.5;
    return {
      type: "recovery",
      title: "🟡 Active Recovery & Nervous System Restoration",
      duration: Math.min(20, state.availableTime),
      intensity: "low",
      focus: "Mobility flow, deep breathing, joint decompression",
      reasoning: `Low recovery detected (${state.recovery}/100) alongside ${state.sleepDuration}h sleep. Prioritizing autonomic nervous system restoration and active blood flow over mechanical overload.`,
      confidence: 94,
      alternatives: [
        "10-min Thoracic & Hip Mobility Flow",
        "Full Rest Day + Contrast Shower",
        "20-min Zone 1 Brisk Walk"
      ],
      exercises: [
        { name: "Cat-Cow & Thoracic Rotation", sets: 2, reps: "10 reps each", notes: "Slow rhythmic breathing" },
        { name: "World's Greatest Stretch", sets: 2, reps: "5 per side", notes: "Decompress hips & thoracic spine" },
        { name: "90/90 Hip Mobility Flow", sets: 2, reps: "60 sec hold", notes: "Gentle hip rotation" },
        { name: "Deep Diaphragmatic Box Breathing", sets: 1, reps: "5 mins", notes: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s" }
      ],
      adaptationFactor: "Recovery Deficit Protection Triggered"
    };
  }

  private recommendMinimalTraining(state: DashboardState): WorkoutRecommendation {
    const duration = Math.min(15, state.availableTime);
    if (state.hostelMode) {
      return {
        type: "minimal",
        title: "🟢 Minimal Viable Hostel Session",
        duration,
        intensity: "high",
        focus: "High-density bodyweight compound circuit",
        reasoning: `Only ${state.availableTime}m available in hostel setting ${state.isExamPeriod ? "(Exam Mode Active)" : ""}. High-density compound bodyweight movements preserve neurological stimulation without requiring equipment.`,
        confidence: 90,
        alternatives: [
          "10-min Core & Isometric Holds",
          "15-min Tabata Bodyweight Flow",
          "Post-Exam Mobility Decompression"
        ],
        exercises: [
          { name: "Tempo Push-ups (3-1-1)", sets: 3, reps: "12-15 reps", notes: "No equipment required" },
          { name: "Bulgarian Split Squats (Bed edge)", sets: 3, reps: "10/leg", notes: "Controlled depth" },
          { name: "Doorframe Row / Isometric Hold", sets: 3, reps: "30-45 sec", notes: "Upper back activation" },
          { name: "Plank to Pike", sets: 2, reps: "45 sec", notes: "Core & shoulder stability" }
        ],
        adaptationFactor: "Hostel & Time Compression Optimization"
      };
    }

    return {
      type: "minimal",
      title: "🟢 High-Impact Express Compound Session",
      duration,
      intensity: "high",
      focus: "Primary compound strength lift with short rest",
      reasoning: `Time-constrained to ${state.availableTime}m. Concentrated on high-recruitment compound lift to maintain mechanical tension.`,
      confidence: 88,
      alternatives: ["High-Density Kettlebell / Dumbbell Circuit", "15-min EMOM Workout"],
      exercises: [
        { name: "Primary Compound Lift (Squat or Bench)", sets: 4, reps: "6-8 reps", notes: "60s rest intervals" },
        { name: "Superset: Dumbbell Row + Push-ups", sets: 3, reps: "10-12 reps", notes: "Continuous pacing" }
      ],
      adaptationFactor: "Time-Restricted Density Protocol"
    };
  }

  private recommendReducedTraining(state: DashboardState): WorkoutRecommendation {
    if (state.trainingLoadYesterday > 75 && state.recovery < 70) {
      return {
        type: "reduced",
        title: "🟡 Reduced Volume Deload Flow",
        duration: Math.min(25, state.availableTime),
        intensity: "low",
        focus: "Low-fatigue technical practice & tempo work",
        reasoning: `High training load yesterday (${state.trainingLoadYesterday}/100) paired with moderate recovery (${state.recovery}/100). Reducing total volume to avoid systemic fatigue accumulation.`,
        confidence: 89,
        alternatives: ["Light Technique Work", "20-min Mobility & Core"],
        exercises: [
          { name: "Goblet Squats (Tempo 3-0-1)", sets: 3, reps: "8 reps", notes: "Focus on pristine mechanics" },
          { name: "Single-Arm Dumbbell Row", sets: 3, reps: "10 reps/side", notes: "Submaximal load" },
          { name: "Pallof Press", sets: 3, reps: "30 sec hold/side", notes: "Anti-rotational stability" }
        ],
        adaptationFactor: "Systemic Load Balancing"
      };
    }

    return {
      type: "reduced",
      title: "🟠 Targeted 25-Min Strength Split",
      duration: Math.min(25, state.availableTime),
      intensity: "moderate",
      focus: "Primary lift + 2 focused supersets",
      reasoning: `${state.availableTime}m available window. Moderate volume provides targeted progressive stimuli without cutting into recovery margins.`,
      confidence: 87,
      alternatives: ["HIIT Bodyweight Circuit", "Sport-Specific Skill Drills"],
      exercises: [
        { name: "Primary Barbell / Dumbbell Press", sets: 3, reps: "8-10 reps", notes: "RPE 7-8" },
        { name: "Romanian Deadlift", sets: 3, reps: "10-12 reps", notes: "Posterior chain focus" },
        { name: "Hanging Knee Raises", sets: 3, reps: "12 reps", notes: "Controlled tempo" }
      ],
      adaptationFactor: "25-Min Time Adaptation"
    };
  }

  private recommendModerateSession(state: DashboardState): WorkoutRecommendation {
    return {
      type: "hypertrophy",
      title: "🟢 Moderate Volume Hypertrophy Session",
      duration: Math.min(state.availableTime, 35),
      intensity: "moderate",
      focus: "Hypertrophy accessories, controlled tempo & RPE 7",
      reasoning: `${state.energyLevel.toUpperCase()} energy & ${state.stressLevel.toUpperCase()} stress detected. Auto-regulating to moderate intensity (RPE 7) protects central recovery while maintaining muscular hypertrophy adaptations.`,
      confidence: 91,
      alternatives: ["Technical Skill Practice", "Lower-Intensity Circuit"],
      exercises: [
        { name: "Dumbbell Incline Bench Press", sets: 3, reps: "10-12 reps", notes: "2s eccentric lowering" },
        { name: "Lat Pulldowns / Pull-ups", sets: 3, reps: "8-10 reps", notes: "Full range stretch" },
        { name: "Dumbbell Walking Lunges", sets: 3, reps: "10 steps/leg", notes: "Moderate load" },
        { name: "Face Pulls with Band", sets: 3, reps: "15 reps", notes: "Rotator cuff integrity" }
      ],
      adaptationFactor: "Stress & Energy Auto-Regulation"
    };
  }

  private recommendProgressiveOverload(state: DashboardState): WorkoutRecommendation {
    return {
      type: "strength",
      title: "🔥 High-Performance Progressive Overload",
      duration: Math.min(state.availableTime, 50),
      intensity: "high",
      focus: "Heavy compound overload + hypertrophy accessory volume",
      reasoning: `Optimal biomechanical readiness detected: High recovery (${state.recovery}/100), ${state.sleepDuration}h sleep, and ${state.energyLevel} energy. Greenlight to push progressive overload on primary movement patterns today.`,
      confidence: 96,
      alternatives: ["Max Effort Strength Day", "Explosive Athletic Power Session"],
      exercises: [
        { name: "Barbell Back Squat / Deadlift", sets: 4, reps: "5-6 reps", notes: "Push load (RPE 8.5)" },
        { name: "Barbell Overhead / Bench Press", sets: 4, reps: "6-8 reps", notes: "Progressive load" },
        { name: "Chest-Supported Row", sets: 3, reps: "8-10 reps", notes: "Heavy back volume" },
        { name: "Dumbbell Bulgarian Split Squat", sets: 3, reps: "8/leg", notes: "Unilateral strength" },
        { name: "Ab Wheel Rollouts", sets: 3, reps: "12 reps", notes: "Core stiffness" }
      ],
      adaptationFactor: "Optimal Bio-Readiness Exploitation"
    };
  }

  private recommendStandardSession(state: DashboardState): WorkoutRecommendation {
    return {
      type: "hypertrophy",
      title: "🟢 Balanced Strength & Hypertrophy Split",
      duration: Math.min(state.availableTime, 40),
      intensity: "moderate",
      focus: "Balanced upper/lower compound & accessory structure",
      reasoning: `Standard baseline state supports progressive training. ${state.availableTime}m duration provides adequate warm-up, compound movement sets, and hypertrophy accessories.`,
      confidence: 88,
      alternatives: ["Higher-Intensity Density Workout", "Sport Foundation Conditioning"],
      exercises: [
        { name: "Barbell / Dumbbell Main Lift", sets: 3, reps: "8-10 reps", notes: "Controlled form" },
        { name: "Upper Back Pulling Movement", sets: 3, reps: "10-12 reps", notes: "Squeeze at peak" },
        { name: "Single-Leg Exercise", sets: 3, reps: "10/side", notes: "Balance & stability" },
        { name: "Core Anti-Extension Exercise", sets: 3, reps: "45 sec", notes: "Brace tight" }
      ],
      adaptationFactor: "Balanced Program Adherence"
    };
  }
}

export const adaptiveDecisionEngine = new AdaptiveDecisionEngine();

/** Pure, shared entry point used by dashboard and Digital Twin consumers. */
export const getRecommendation = (state: DashboardState): WorkoutRecommendation => adaptiveDecisionEngine.decide(state);
