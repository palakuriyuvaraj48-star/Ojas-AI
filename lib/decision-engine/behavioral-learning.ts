/**
 * Engine: Behavioral Learning & Root-Cause Feedback Loop
 * Tracks user compliance, reasons for missed sessions, RPE / difficulty, and energy levels.
 * Closes the feedback loop: FEEDBACK -> DIGITAL TWIN UPDATE -> NEXT DECISION ADAPTATION.
 */

import { DigitalTwin } from "@/lib/digital-twin/types";
import { applyEventToTwin } from "@/lib/digital-twin/engine";

export interface SessionFeedback {
  sessionId?: string;
  workoutCompleted: boolean;
  durationMinutes?: number;
  formScore?: number;
  difficulty?: number; // 1 (very easy) to 10 (maximum effort)
  energyLevel?: number; // 1 (exhausted) to 10 (fully energized)
  painOrDiscomfort?: boolean;
  skipReason?: "time_constraint" | "exam_study" | "fatigue" | "work_overtime" | "travel" | "equipment_unavailable" | "other";
  notes?: string;
}

export interface FeedbackProcessingResult {
  updatedTwin: DigitalTwin;
  learnedInsights: string[];
  nextDayAdjustment: string;
  adherenceWarning?: string;
}

/**
 * Process session feedback and update Digital Twin behavioral memory.
 */
export function processFeedbackAndLearn(
  twin: DigitalTwin,
  feedback: SessionFeedback
): FeedbackProcessingResult {
  const now = new Date().toISOString();
  const learnedInsights: string[] = [];
  let nextDayAdjustment = "Proceed with scheduled progression.";

  let updatedTwin = twin;

  if (feedback.workoutCompleted) {
    const { updatedTwin: t1 } = applyEventToTwin(twin, {
      id: `evt_fb_${Date.now()}`,
      type: "WORKOUT_COMPLETED",
      userId: twin.userId,
      timestamp: now,
      payload: {
        durationMinutes: feedback.durationMinutes || 30,
        formScore: feedback.formScore || 88,
      },
    });

    const { updatedTwin: t2 } = applyEventToTwin(t1, {
      id: `evt_fb2_${Date.now()}`,
      type: "USER_FEEDBACK_RECEIVED",
      userId: twin.userId,
      timestamp: now,
      payload: {
        completed: true,
        difficulty: feedback.difficulty || 5,
        energy: feedback.energyLevel || 5,
        painDiscomfort: feedback.painOrDiscomfort || false,
      },
    });

    updatedTwin = t2;
    learnedInsights.push(`Session completed with RPE ${feedback.difficulty || 5}/10.`);

    if ((feedback.difficulty ?? 5) >= 9 || (feedback.energyLevel ?? 5) <= 3) {
      nextDayAdjustment = "High session exertion detected: Tomorrow's training load will automatically deload by 20%.";
      learnedInsights.push("Exertion exceeded baseline. Scheduled minor active recovery for next cycle.");
    }

    if (feedback.painOrDiscomfort) {
      nextDayAdjustment = "Discomfort reported: Tomorrow's plan will mandate joint mobility and zero axial spinal compression.";
      learnedInsights.push("Safety flag logged for physical discomfort.");
    }
  } else {
    // Skipped Workout Root-Cause Analysis
    const reason = feedback.skipReason || "time_constraint";
    const { updatedTwin: t1 } = applyEventToTwin(twin, {
      id: `evt_skip_${Date.now()}`,
      type: "WORKOUT_SKIPPED",
      userId: twin.userId,
      timestamp: now,
      payload: { reason },
    });

    updatedTwin = t1;
    learnedInsights.push(`Session skipped. Root cause: ${reason.replace(/_/g, " ")}.`);

    if (reason === "exam_study" || reason === "time_constraint") {
      nextDayAdjustment = "Time friction detected: Tomorrow's plan is compressed into a 15-min Minimum Viable Workout.";
      learnedInsights.push("Pattern identified: Academic or schedule crunch requires express sessions.");
    } else if (reason === "fatigue") {
      nextDayAdjustment = "Fatigue barrier detected: Tomorrow's plan will prioritize recovery and hydration.";
    }
  }

  // Check for recurring skip patterns
  let adherenceWarning: string | undefined;
  if (updatedTwin.behavioral.consecutiveMisses >= 2) {
    adherenceWarning = `User has missed ${updatedTwin.behavioral.consecutiveMisses} sessions consecutively. Switched to friction-free 10-minute micro-habits.`;
    learnedInsights.push(adherenceWarning);
  }

  return {
    updatedTwin,
    learnedInsights,
    nextDayAdjustment,
    adherenceWarning,
  };
}
