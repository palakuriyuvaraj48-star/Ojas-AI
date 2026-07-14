import { NextResponse } from "next/server";
import { EXERCISES_DATABASE } from "../exercises/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const goal = searchParams.get("goal") || "strength";
  const level = searchParams.get("level") || "intermediate";
  const recovery = searchParams.get("recovery") || "fresh";
  const location = searchParams.get("location") || "gym";
  const availableTime = parseInt(searchParams.get("availableTime") || "45");
  const soreMuscles = searchParams.get("soreMuscles") || "";
  const injuries = searchParams.get("injuries") || "";

  // Core filter logic representing Workout Generator AI Engine
  let recommendedExercises = [...EXERCISES_DATABASE];

  // Filter out exercises based on equipment location (gym = Barbell/Cables, home = Dumbbells/Bodyweight)
  if (location === "home") {
    recommendedExercises = recommendedExercises.filter(
      (ex) => ex.equipment === "Dumbbells" || ex.equipment === "Pull-up Bar" || ex.equipment === "Bodyweight"
    );
  }

  // Filter out exercises targeting sore muscles or injuries
  if (soreMuscles || injuries) {
    const avoid = (soreMuscles + "," + injuries).toLowerCase();
    recommendedExercises = recommendedExercises.filter((ex) => {
      const matchPrimary = avoid.includes(ex.muscleGroup.toLowerCase());
      const matchSecondary = ex.secondaryMuscles.some((sm) => avoid.includes(sm.toLowerCase()));
      return !matchPrimary && !matchSecondary;
    });
  }

  // Fallback: if all exercises filtered out, return basic safe ones
  if (recommendedExercises.length === 0) {
    recommendedExercises = [
      {
        id: "ex_fallback",
        name: "Lying Floor Glute Bridge",
        muscleGroup: "Glutes",
        secondaryMuscles: ["Hamstrings"],
        equipment: "Bodyweight",
        difficulty: "Beginner",
        instructions: ["Lie on your back, bend knees, lift hips towards ceiling."],
        mistakes: ["Arching lower back too much"],
        breathing: "Exhale on lift, inhale on descent.",
        safety: "Maintain flat head support.",
        notes: "Excellent for low back decompression.",
        beginnerAlternative: "Glute squeeze",
        advancedVariation: "Single leg bridge",
        visualUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80"
      }
    ];
  }

  // Adjust volume/intensity based on recovery coefficients
  const setsMultiplier = recovery === "tired" ? -1 : 0;
  const intensity = recovery === "tired" ? "Low (60-65% 1RM)" : goal === "strength" ? "High (80-85% 1RM)" : "Moderate (70-75% 1RM)";

  const workout = {
    title: `${goal.charAt(0).toUpperCase() + goal.slice(1)} ${location === "gym" ? "Gym" : "Home"} Routine`,
    duration: availableTime,
    calories: Math.round(availableTime * (recovery === "tired" ? 5.5 : 7.8)),
    difficulty: level.charAt(0).toUpperCase() + level.slice(1),
    intensity,
    warmUp: [
      "5 mins light cardiorespiratory prep",
      "Dynamic arm & hip rotations",
      recovery === "tired" ? "10m Deep Breathing decompression" : "90/90 Hip openers"
    ],
    coolDown: [
      "Passive hamstring stretch (1 min/side)",
      "Child's pose (2 mins)",
      "Box breathing (2 mins)"
    ],
    exercises: recommendedExercises.map((ex) => ({
      ...ex,
      sets: Math.max(2, (level === "advanced" ? 4 : 3) + setsMultiplier),
      reps: goal === "strength" ? "5-6 reps" : "10-12 reps",
      overload: goal === "strength" ? "Increase load 2.5kg if all sets hit targets at RPE 8.5" : "Add 1 rep each session"
    })),
    reasoning: `Selected based on your ${goal} target, targeting fully recovered muscle groups. Adjusted for ${recovery} readiness with ${intensity} parameters.`,
    expectedBenefit: "Stimulates hypertrophy pathways, preserves structural balance, and decompresses high fatigue areas.",
    confidenceScore: recovery === "tired" ? 88 : 95
  };

  return NextResponse.json(workout);
}
