/**
 * Ojas AI - Whitelisted Agent Tool Registry
 * Strictly controlled, deterministic tools that the Ollama agent can execute.
 * NO arbitrary shell, NO filesystem access, NO arbitrary code execution.
 */

import { ClientProfile } from "@/types/profile";
import { UnifiedFitnessState, DailyDecision } from "@/types/fitness-state";
import { INDIAN_FOODS_DATABASE } from "@/lib/nutrition/indian-food-db";

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  permissionType: "READ" | "SAFE_WRITE" | "CONFIRMATION_REQUIRED";
}

export const OJAS_TOOL_DEFINITIONS: AgentToolDefinition[] = [
  {
    name: "get_user_profile",
    description: "Retrieves user identity, lifestyle role, budget, and physical metrics.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_fitness_state",
    description: "Retrieves complete Unified Fitness State (movement, recovery, nutrition, lifestyle, weather).",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_today_plan",
    description: "Retrieves the Ojas Daily Decision for today (Train / Reduce / Recover) and 4 core priorities.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_recovery_state",
    description: "Retrieves sleep metrics, HRV readiness, soreness (DOMS), and recovery score.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_progress",
    description: "Retrieves weekly consistency score, streak count, and workout volume logs.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_nutrition_summary",
    description: "Retrieves daily calorie target, protein intake, and hostel mess food recommendations.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_available_time",
    description: "Retrieves the user's available workout window in minutes for today.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_available_equipment",
    description: "Retrieves the list of equipment available in the user's current environment.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_daily_budget",
    description: "Retrieves the user's daily food budget in INR (e.g. ₹50, ₹100, ₹150, ₹250).",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "get_current_workout",
    description: "Retrieves detailed exercise list, sets, and reps for today's session.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "start_workout",
    description: "Navigates to active workout mode or opens Smart Form Coach camera.",
    parameters: {
      type: "object",
      properties: {
        mode: { type: "string", description: "Standard workout or Form Coach camera", enum: ["standard", "form-coach"] }
      }
    },
    permissionType: "SAFE_WRITE",
  },
  {
    name: "change_workout_intensity",
    description: "Modifies today's workout intensity to lighter, moderate, harder, or mobility only based on fatigue.",
    parameters: {
      type: "object",
      properties: {
        level: { type: "string", description: "Target intensity level", enum: ["lighter", "moderate", "harder", "mobility"] }
      },
      required: ["level"]
    },
    permissionType: "SAFE_WRITE",
  },
  {
    name: "generate_short_workout",
    description: "Generates an express time-compressed workout (e.g. 15 or 20 minutes) fitting available equipment.",
    parameters: {
      type: "object",
      properties: {
        durationMinutes: { type: "string", description: "Target duration in minutes (e.g. '15', '20', '30')" }
      },
      required: ["durationMinutes"]
    },
    permissionType: "SAFE_WRITE",
  },
  {
    name: "generate_budget_meal_options",
    description: "Generates affordable Indian high-protein meal suggestions within a specific daily budget.",
    parameters: {
      type: "object",
      properties: {
        budgetInr: { type: "string", description: "Target daily food budget in INR (e.g. '50', '100', '150')" }
      }
    },
    permissionType: "READ",
  },
  {
    name: "explain_plan_change",
    description: "Provides a clear scientific explanation of why today's plan was adjusted.",
    parameters: { type: "object", properties: {} },
    permissionType: "READ",
  },
  {
    name: "open_ojas_route",
    description: "Navigates the user to a specific Ojas interface route.",
    parameters: {
      type: "object",
      properties: {
        route: { 
          type: "string", 
          description: "Target route path", 
          enum: ["/dashboard", "/workout", "/form-coach", "/food", "/recovery", "/progress", "/twin", "/community", "/settings"] 
        }
      },
      required: ["route"]
    },
    permissionType: "SAFE_WRITE",
  },
  {
    name: "set_language",
    description: "Switches the Ojas application and AI interaction language.",
    parameters: {
      type: "object",
      properties: {
        languageCode: { 
          type: "string", 
          description: "2-letter language code", 
          enum: ["en", "te", "hi", "ta", "kn", "ml", "mr", "bn", "gu", "pa", "or", "ur", "as", "ne", "es", "fr", "de", "pt", "ar", "ja", "ko"] 
        }
      },
      required: ["languageCode"]
    },
    permissionType: "SAFE_WRITE",
  }
];

export interface ToolExecutionContext {
  profile?: ClientProfile | null;
  fitnessState?: UnifiedFitnessState | null;
  todayDecision?: DailyDecision | null;
}

/**
 * Deterministic tool executor.
 * Safely executes whitelisted tools without executing any external code.
 */
export async function executeAgentTool(
  toolName: string,
  args: Record<string, any>,
  context: ToolExecutionContext
): Promise<{ success: boolean; data: any; message?: string }> {
  const profile = context.profile || {
    name: "Anil Kumar",
    age: 22,
    goal: "fat-loss" as const,
    weight: 68.5,
    dailyFoodBudget: 100,
    lifestyleRole: "college-student" as const,
    availableWorkoutTime: 35,
    workoutEnvironment: "home" as const,
    availableEquipment: ["bodyweight", "dumbbell"],
    isHostelMode: true,
  };

  switch (toolName) {
    case "get_user_profile":
      return {
        success: true,
        data: {
          name: profile.name,
          age: profile.age,
          goal: profile.goal,
          weight: `${profile.weight || 68.5} kg`,
          lifestyleRole: profile.lifestyleRole || "college-student",
          budget: `₹${profile.dailyFoodBudget || 100}/day`,
          availableTime: `${profile.availableWorkoutTime || 35} mins`,
          environment: profile.workoutEnvironment || "home",
        },
      };

    case "get_fitness_state":
      return {
        success: true,
        data: {
          ojasScore: 88,
          movementReadiness: "92/100 (Upper body fresh, legs recovering)",
          recoveryScore: "79/100 (Sleep: 7.4 hrs, HRV normal)",
          nutritionPacing: "84/100 (Protein target: 120g, Mess meal logged)",
          consistency: "94% (4-day streak)",
        },
      };

    case "get_today_plan":
      return {
        success: true,
        data: {
          action: "TRAIN",
          title: "35-min Upper Body Push & Core",
          priorityWorkout: "35m Dumbbell & Bodyweight hypertrophy",
          priorityNutrition: "High-protein lunch (Soya / Boiled Eggs)",
          priorityHydration: "3.2 Liters (1.8L logged)",
          priorityRecovery: "7.5 hrs sleep target tonight",
          why: "Recovery score is 79/100 and upper body readiness is high.",
        },
      };

    case "get_recovery_state":
      return {
        success: true,
        data: {
          recoveryScore: 79,
          sleepHours: 7.4,
          sleepQuality: "Good (Deep sleep 1.8 hrs)",
          soreness: "Mild quadriceps DOMS from yesterday's squats",
          hrvStatus: "Optimal (Green zone)",
        },
      };

    case "get_progress":
      return {
        success: true,
        data: {
          currentStreakDays: 4,
          weeklyAdherence: "94%",
          volumeCompletedKg: "4,250 kg this week",
          weightTrend: "-0.8 kg in past 14 days",
        },
      };

    case "get_nutrition_summary":
      return {
        success: true,
        data: {
          calorieTarget: "2,050 kcal",
          caloriesConsumed: "1,120 kcal",
          proteinTarget: "125 g",
          proteinLogged: "68 g",
          budgetRemaining: `₹${(profile.dailyFoodBudget || 100) - 35}`,
          hostelMessRecommendation: "Pair hostel dal with 2 boiled eggs or roasted soya chunks.",
        },
      };

    case "get_available_time":
      return {
        success: true,
        data: {
          availableWorkoutTime: `${profile.availableWorkoutTime || 35} minutes`,
        },
      };

    case "get_available_equipment":
      return {
        success: true,
        data: {
          equipment: profile.availableEquipment || ["bodyweight", "dumbbell"],
        },
      };

    case "get_daily_budget":
      return {
        success: true,
        data: {
          dailyBudget: `₹${profile.dailyFoodBudget || 100} / day`,
        },
      };

    case "get_current_workout":
      return {
        success: true,
        data: {
          name: "Upper Body & Core Hypertrophy",
          duration: `${profile.availableWorkoutTime || 35} mins`,
          exercises: [
            { name: "Push-ups", sets: "3 sets x 12 reps", rest: "60s" },
            { name: "DB Shoulder Press", sets: "3 sets x 10 reps", rest: "60s" },
            { name: "DB Bent-Over Row", sets: "3 sets x 12 reps", rest: "60s" },
            { name: "Plank Hold", sets: "3 sets x 45s", rest: "45s" },
          ],
        },
      };

    case "change_workout_intensity": {
      const level = args.level || "lighter";
      return {
        success: true,
        data: {
          adjustedIntensity: level,
          updatedWorkout:
            level === "lighter"
              ? "20-minute Light Mobility & Bodyweight Flow"
              : level === "harder"
              ? "45-minute High-Density Upper Hypertrophy"
              : "25-minute Active Recovery & Hip Stretches",
        },
        message: `Workout intensity successfully updated to ${level}.`,
      };
    }

    case "generate_short_workout": {
      const duration = Number(args.durationMinutes) || 20;
      return {
        success: true,
        data: {
          title: `${duration}-Minute High-Efficiency Session`,
          duration: `${duration} mins`,
          exercises: [
            "Bodyweight Squats - 3 sets x 15 reps",
            "Incline Push-ups - 3 sets x 12 reps",
            "Glute Bridges - 3 sets x 15 reps",
            "Core Plank - 2 sets x 40s",
          ],
        },
      };
    }

    case "generate_budget_meal_options": {
      const budget = Number(args.budgetInr) || profile.dailyFoodBudget || 100;
      const budgetItems = INDIAN_FOODS_DATABASE.filter(
        (f) => f.estimatedCostINR && f.estimatedCostINR <= budget / 2
      ).slice(0, 4);

      return {
        success: true,
        data: {
          budget: `₹${budget}/day`,
          recommendations: budgetItems.map((item) => ({
            name: item.name,
            protein: `${item.proteinGrams}g`,
            cost: `₹${item.estimatedCostINR}`,
            tip: item.ojasTip,
          })),
        },
      };
    }

    case "explain_plan_change":
      return {
        success: true,
        data: {
          explanation:
            "Your workout was adapted to respect your available 35-minute time window and recovery score (79/100). Lower body volume was moderated to allow quadriceps recovery while maintaining upper body progressive overload.",
        },
      };

    case "start_workout":
      return {
        success: true,
        data: {
          action: "START_WORKOUT",
          targetRoute: args.mode === "form-coach" ? "/form-coach" : "/workout",
        },
        message: "Workout initialized.",
      };

    case "open_ojas_route":
      return {
        success: true,
        data: {
          action: "NAVIGATE",
          route: args.route || "/dashboard",
        },
        message: `Navigating to ${args.route || "/dashboard"}.`,
      };

    case "set_language":
      return {
        success: true,
        data: {
          action: "SET_LANGUAGE",
          languageCode: args.languageCode || "en",
        },
        message: `Language updated to ${args.languageCode || "en"}.`,
      };

    default:
      return {
        success: false,
        data: null,
        message: `Unknown tool "${toolName}". Execution rejected.`,
      };
  }
}
