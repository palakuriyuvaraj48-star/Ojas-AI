import { NextResponse } from "next/server";
import {
  createRehabPlan,
  computeReadinessScore,
  logPain,
  computeMobilityTrends,
  computeRecoveryTrends,
  generateRecommendations,
  estimateReturnToTraining,
} from "@/lib/future-ai/rehabilitation/engine";
import { futureRehab, generateId } from "@/lib/future-ai/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId") || "default-user";

  try {
    if (action === "plan") {
      const plans = futureRehab.listPlans(userId);
      const active = plans.filter((p) => !p.completed).slice(-1);
      if (active.length === 0) return NextResponse.json({ plan: null });
      return NextResponse.json({ plan: active[0] });
    }

    if (action === "assessments") {
      const assessments = futureRehab.listAssessments(userId);
      return NextResponse.json({ assessments });
    }

    if (action === "trends") {
      const mobility = computeMobilityTrends(userId);
      const recovery = computeRecoveryTrends(userId);
      const painLogs = futureRehab.listPainLogs(userId).slice(-7);
      const painTrends = painLogs.map((p) => ({ date: p.loggedAt.split("T")[0], level: p.level }));
      return NextResponse.json({ mobilityTrends: mobility, recoveryTrends: recovery, painTrends });
    }

    if (action === "recommendations") {
      const plans = futureRehab.listPlans(userId);
      const active = plans.filter((p) => !p.completed).slice(-1);
      const painLogs = futureRehab.listPainLogs(userId);
      const assessments = futureRehab.listAssessments(userId);

      const lastPain = painLogs.length > 0 ? painLogs[painLogs.length - 1].level : 3;
      const lastAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;

      const recommendations = generateRecommendations(userId, {
        painLevel: lastPain,
        mobilityScore: lastAssessment ? lastAssessment.score : 70,
        recoveryScore: lastAssessment ? lastAssessment.score * 0.9 : 65,
        adherence: active.length > 0 ? active[0].adherence : 80,
      });

      return NextResponse.json({ recommendations });
    }

    if (action === "readiness") {
      const painLogs = futureRehab.listPainLogs(userId);
      const assessments = futureRehab.listAssessments(userId);

      const lastPain = painLogs.length > 0 ? painLogs[painLogs.length - 1].level : 3;
      const lastAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;

      const readiness = computeReadinessScore(
        userId,
        lastPain,
        lastAssessment ? lastAssessment.score : 70,
        lastAssessment ? lastAssessment.score * 0.9 : 65
      );

      return NextResponse.json({ readiness });
    }

    if (action === "estimate") {
      const estimate = estimateReturnToTraining(userId);
      return NextResponse.json({ estimate });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();
    const userId = body.userId || "default-user";

    if (action === "plan") {
      const plan = createRehabPlan(userId, body);
      futureRehab.addPlan(plan as any);
      return NextResponse.json({ plan });
    }

    if (action === "assess") {
      const assessment = {
        id: generateId(),
        userId,
        type: body.type,
        score: body.score,
        details: body.details || {},
        assessedAt: new Date().toISOString(),
      };
      futureRehab.addAssessment(assessment as any);
      return NextResponse.json({ assessment });
    }

    if (action === "pain") {
      const log = logPain(userId, {
        userId,
        level: body.level,
        location: body.location || [],
        description: body.description,
      } as any);
      futureRehab.addPainLog(log as any);
      return NextResponse.json({ log });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
