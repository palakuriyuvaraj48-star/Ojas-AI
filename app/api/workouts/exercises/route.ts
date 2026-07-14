import { NextResponse } from "next/server";

export const EXERCISES_DATABASE = [
  {
    id: "ex_squat",
    name: "Barbell Back Squat",
    muscleGroup: "Quads",
    secondaryMuscles: ["Glutes", "Hamstrings", "Lower Back"],
    equipment: "Barbell",
    difficulty: "Advanced",
    instructions: [
      "Rest the bar on your upper traps, feet shoulder-width apart.",
      "Inhale, brace your core, and push your hips back to descend.",
      "Lower until thighs are parallel to the floor or deeper.",
      "Drive through your heels to return to starting position, exhaling at the top."
    ],
    mistakes: ["Knees caving inwards", "Heels lifting off the ground", "Butt wink/rounding lower back"],
    breathing: "Inhale on the way down, exhale as you drive back up.",
    safety: "Keep chest proud, do not look down, and squat in a rack with safety pins set.",
    notes: "Core stabilization is key. Brace as if about to be punched in the stomach.",
    beginnerAlternative: "Dumbbell Goblet Squat",
    advancedVariation: "Barbell Front Squat",
    visualUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80"
  },
  {
    id: "ex_bench",
    name: "Barbell Bench Press",
    muscleGroup: "Chest",
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Lie flat on the bench, feet flat on the floor, eyes under the bar.",
      "Grip the bar slightly wider than shoulder-width, retract your scapula.",
      "Unrack the bar and lower it under control to your mid-chest.",
      "Press the bar back up in a slight arc, exhaling as you extend."
    ],
    mistakes: ["Bouncing the bar off the chest", "Elbows flaring too wide", "Lifting hips off the bench"],
    breathing: "Inhale during the slow descent, exhale forcefully on the press.",
    safety: "Always use a spotter when lifting near failure, and maintain five points of contact.",
    notes: "Squeeze the shoulder blades together before unracking to build a solid foundation.",
    beginnerAlternative: "Push-ups",
    advancedVariation: "Dumbbell Incline Bench Press",
    visualUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80"
  },
  {
    id: "ex_rdl",
    name: "Romanian Deadlift",
    muscleGroup: "Hamstrings",
    secondaryMuscles: ["Glutes", "Erectors", "Grip"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    instructions: [
      "Stand tall holding the bar with an overhand grip, shoulder-width feet.",
      "Hinge at the hips, pushing them backwards while keeping legs relatively straight.",
      "Lower the bar close to your shins until you feel a deep hamstring stretch.",
      "Drive hips forward to return to standing, locking out glutes."
    ],
    mistakes: ["Rounding the back", "Shrugging the bar at the top", "Bending knees too much"],
    breathing: "Inhale on the hinge down, exhale on the lockout.",
    safety: "Keep the bar locked against your legs to protect the lumbar spine.",
    notes: "Focus on the hip hinge. Imagine touching a wall behind you with your hips.",
    beginnerAlternative: "Kettlebell Hinge",
    advancedVariation: "Single-leg Dumbbell RDL",
    visualUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=500&q=80"
  },
  {
    id: "ex_pullup",
    name: "Bodyweight Pull-Up",
    muscleGroup: "Lats",
    secondaryMuscles: ["Biceps", "Rhomboids", "Core"],
    equipment: "Pull-up Bar",
    difficulty: "Advanced",
    instructions: [
      "Hang from the bar with an overhand grip, hands wider than shoulders.",
      "Engage your lats and depress your shoulders before pulling.",
      "Pull yourself up until your chin clears the bar, leading with your chest.",
      "Lower yourself under control to a full dead hang."
    ],
    mistakes: ["Using momentum/kipping", "Not going all the way down", "Shoulders shrugging at the top"],
    breathing: "Exhale on the pull up, inhale as you lower.",
    safety: "Ensure the bar is stable. Do not let go at the top.",
    notes: "Focus on pulling your elbows down to your pockets rather than pulling your body up.",
    beginnerAlternative: "Lat Pulldown (Cables)",
    advancedVariation: "Weighted Pull-Up",
    visualUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&q=80"
  },
  {
    id: "ex_press",
    name: "Dumbbell Overhead Press",
    muscleGroup: "Shoulders",
    secondaryMuscles: ["Triceps", "Upper Chest"],
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    instructions: [
      "Sit on an upright bench holding dumbbells at shoulder level.",
      "Keep feet planted, core braced, and dumbbells slightly rotated in front.",
      "Press the weights straight up until elbows lock, exhaling.",
      "Lower under control back to shoulder level."
    ],
    mistakes: ["Arching lower back", "Clashing weights at the top", "Incomplete range of motion"],
    breathing: "Exhale as you press up, inhale as you lower.",
    safety: "Avoid flaring elbows directly out to the sides; keep them at a 30-degree angle.",
    notes: "Press in a straight vertical line. Avoid leaning back.",
    beginnerAlternative: "Seated Dumbbell Shoulder Press",
    advancedVariation: "Standing Barbell Military Press",
    visualUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&q=80"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";
  const muscle = searchParams.get("muscle")?.toLowerCase() || "";

  let results = EXERCISES_DATABASE;

  if (query) {
    results = results.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.muscleGroup.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query)
    );
  }

  if (muscle) {
    results = results.filter((ex) => ex.muscleGroup.toLowerCase() === muscle);
  }

  return NextResponse.json(results);
}
