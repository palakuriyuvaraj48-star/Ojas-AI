import { NextResponse } from "next/server";
import { processFeedbackAndLearn } from "@/lib/decision-engine/behavioral-learning";
import { createInitialTwin } from "@/lib/digital-twin/engine";
import { DigitalTwin } from "@/lib/digital-twin/types";
import type { SessionFeedback } from "@/lib/decision-engine/behavioral-learning";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feedback, twin } = body;

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback data is required" },
        { status: 400 }
      );
    }

    // Use provided twin or create demo twin
    let digitalTwin: DigitalTwin;
    if (twin) {
      digitalTwin = twin;
    } else {
      // Create demo twin for testing
      const demoProfile = {
        name: "Demo User",
        age: 22,
        gender: "male" as const,
        height: 174,
        weight: 68.5,
        goal: "fat-loss" as const,
        activityLevel: "moderately-active" as const,
        gymExperience: "intermediate" as const,
        dailyStepGoal: 8500,
        occupation: "College Student",
        workoutDaysPerWeek: 4,
        availableWorkoutTime: 35,
        medicalConditions: "None",
        injuries: "None",
        foodPreference: "both" as const,
        allergies: "None",
        budget: "budget" as const,
        dailyFoodBudget: 100,
        sleepDuration: 7.5,
        stressLevel: "medium" as const,
        availableEquipment: ["bodyweight", "dumbbells"],
        lifestyle: "Hostel living",
        lifestyleRole: "college-student" as const,
        foodEnvironment: "hostel-mess" as const,
        workoutEnvironment: "home" as const,
        isHostelMode: true,
        language: "en" as const,
      };
      digitalTwin = createInitialTwin(demoProfile, "demo_user");
    }

    // Process feedback and update Digital Twin
    const result = processFeedbackAndLearn(digitalTwin, feedback as SessionFeedback);

    return NextResponse.json({
      status: "success",
      updatedTwin: result.updatedTwin,
      learnedInsights: result.learnedInsights,
      nextDayAdjustment: result.nextDayAdjustment,
      adherenceWarning: result.adherenceWarning,
    });
  } catch (error: any) {
    console.error("[API /api/feedback] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process feedback" },
      { status: 500 }
    );
  }
}
