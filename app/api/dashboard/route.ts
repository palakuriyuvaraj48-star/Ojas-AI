import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const availableTime = parseInt(searchParams.get("availableTime") || "45");
  const mood = searchParams.get("mood") || "energetic";

  // Simulate Dashboard AI Engine Logic
  // Outputs computed recommendations, scores, sleep & weather adaptations.
  const energyScore = Math.min(100, Math.max(0, 84 + (mood === "energetic" ? 5 : mood === "tired" ? -25 : -10)));
  const recoveryScore = 92;
  const sleepDebtHours = 0.5;

  let workoutRecommendation = {
    title: "Hypertrophy Upper Body Pull",
    duration: availableTime,
    calories: Math.round(availableTime * 7.5),
    difficulty: "Intermediate",
    equipment: ["Barbell", "Dumbbells", "Cables"],
    targetMuscles: ["Lats", "Upper Back", "Biceps"],
    warmUp: ["Arm circles", "Band pull-aparts", "Light lat pulldowns"],
    explanation: "Your lats and biceps are fully recovered, and your energy peaks match pulling demands. Adaptive split loaded.",
    alternative: "15m Metabolic Upper Body Pump",
  };

  if (availableTime <= 20) {
    workoutRecommendation = {
      title: "HIIT Full Body Shock Split",
      duration: 20,
      calories: 220,
      difficulty: "Hard",
      equipment: ["Bodyweight", "Dumbbells"],
      targetMuscles: ["Quads", "Shoulders", "Core"],
      warmUp: ["Jumping jacks", "High knees"],
      explanation: "Compact 20m high-intensity intervals loaded to fit your busy schedule without losing muscle stimulus.",
      alternative: "20m Core Strength & Flow",
    };
  }

  const responseData = {
    dailySummary: {
      greeting: "Good Morning, Athlete",
      sleepSummary: "You slept 7h 45m last night.",
      recoverySummary: `Your physiological recovery is at ${recoveryScore}%, indicating a high readiness level.`,
      timeSummary: `You indicated ${availableTime} minutes available today.`,
      recommendationSummary: `Today's optimal routine: ${workoutRecommendation.title}.`,
      aiConfidence: 96,
      reasoning: `Based on your +12% HRV spike, optimal sleep cycles, and selected ${mood} mindset, your body is primed for metabolic volume.`,
      benefits: "Increases muscle protein synthesis, accelerates fat oxidization, and boosts cardiovascular stamina.",
    },
    energyScore: {
      score: energyScore,
      explanation: mood === "tired" 
        ? "Circadian dip and high stress detected. Avoid heavy overload sets."
        : "Circadian peak reached. Ideal window for metabolic hypertrophy splits.",
      trend: "+8% vs yesterday",
      recommendation: mood === "tired" ? "Active recovery walk & stretching" : "Heavy Compound Lifts",
    },
    recoveryScore: {
      score: recoveryScore,
      fatigue: "Low (15%)",
      hrv: "78 ms (+12%)",
      sleepQuality: "Excellent (94%)",
      readiness: "Optimal (Green Zone)",
      intensityRecommended: mood === "tired" ? "Low (under 65% 1RM)" : "High (75-85% 1RM)",
    },
    workout: workoutRecommendation,
    nutrition: {
      calories: 2350,
      protein: 165,
      carbs: 240,
      fat: 75,
      micronutrients: {
        fiber: "32g",
        water: 3.5,
        sodium: "2200mg",
      },
      mealSuggestions: [
        { name: "Post-Workout Fuel", text: "Grilled Salmon bowl with brown rice & spinach" },
        { name: "Snack", text: "Greek yogurt with blueberries & 25g whey scoop" }
      ],
      shoppingReminder: "Pick up fresh spinach, salmon fillets, and liquid electrolytes for recovery prep.",
    },
    sleep: {
      duration: "7h 45m",
      quality: "94%",
      sleepDebt: `${sleepDebtHours} hours`,
      weeklyTrend: "Stable (avg 7h 38m)",
      recommendation: "Maintain current wind-down routine. Begin wind-down 30m prior to sleep target (10:00 PM).",
    },
    weather: {
      summary: "Sunny & Mild",
      temp: "74°F",
      humidity: "42%",
      outdoorSuggestion: "Optimal wind-down conditions. Safe window for outdoor recovery run between 4 PM and 6 PM.",
      rainWarning: "Clear skies. No precipitation expected.",
    },
    calendar: {
      totalEvents: 3,
      conflicts: "None detected between 4:00 PM and 7:00 PM.",
      availableWindow: "07:30 AM - 09:00 AM or 05:00 PM - 06:30 PM",
    },
    privacy: {
      profileVisibility: "private",
    },
    motivation: {
      quote: "Success is the sum of small efforts, repeated day in and day out.",
      encouragement: "You have completed 94% of your daily splits this month. Consistency generates compound gains. Let's conquer today!",
    }
  };

  return NextResponse.json(responseData);
}
