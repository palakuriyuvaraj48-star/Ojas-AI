import { 
  SportProfile, 
  SportProgressionLevel, 
  SportGapAnalysis, 
  AttributeScore, 
  SportAttributeKey, 
  SportChallenge 
} from "./types";
import { SPORT_REGISTRY, SPORT_ATTRIBUTES } from "./sport-registry";

export function analyzeSportFitnessGap(
  sportId: string,
  targetLevel: SportProgressionLevel = "development",
  currentAttributes: Record<SportAttributeKey, number>,
  baselineAttributes?: Record<SportAttributeKey, number>
): SportGapAnalysis {
  const sport = SPORT_REGISTRY[sportId] || SPORT_REGISTRY["football"];

  const attributeScores: AttributeScore[] = sport.requiredAttributes.map((req) => {
    const attrDef = SPORT_ATTRIBUTES[req.attributeId];
    const currentScore = Math.max(10, Math.min(100, currentAttributes[req.attributeId] ?? 50));
    const baselineScore = baselineAttributes ? (baselineAttributes[req.attributeId] ?? currentScore) : currentScore;

    let targetScore = req.developmentTarget;
    if (targetLevel === "foundation") targetScore = req.foundationTarget;
    if (targetLevel === "performance") targetScore = req.performanceTarget;
    if (targetLevel === "advanced") targetScore = req.advancedTarget;

    const gap = Math.max(0, targetScore - currentScore);
    const changeFromBaseline = currentScore - baselineScore;

    return {
      attributeId: req.attributeId,
      name: attrDef.name,
      currentScore,
      baselineScore,
      targetScore,
      gap,
      changeFromBaseline,
      unit: attrDef.unit,
    };
  });

  // Calculate readiness score (weighted average of (current / target))
  let totalWeight = 0;
  let weightedProgressSum = 0;

  sport.requiredAttributes.forEach((req, idx) => {
    const item = attributeScores[idx];
    const weight = req.weightInSport;
    totalWeight += weight;
    const ratio = Math.min(1.0, item.currentScore / item.targetScore);
    weightedProgressSum += ratio * 100 * weight;
  });

  const readinessScore = Math.round(weightedProgressSum / (totalWeight || 1));

  // Determine biggest gap (weighted gap)
  let maxGapScore = -1;
  let primaryIndex = 0;

  attributeScores.forEach((item, idx) => {
    const weight = sport.requiredAttributes[idx]?.weightInSport || 1;
    const weightedGap = item.gap * weight;
    if (weightedGap > maxGapScore) {
      maxGapScore = weightedGap;
      primaryIndex = idx;
    }
  });

  const defaultPrimary: AttributeScore = {
    attributeId: "agility",
    name: "Agility & Footwork",
    currentScore: 50,
    baselineScore: 50,
    targetScore: 70,
    gap: 20,
    changeFromBaseline: 0,
    unit: "s",
  };

  const primaryItem = attributeScores[primaryIndex] || attributeScores[0] || defaultPrimary;
  const primaryAttrDef = SPORT_ATTRIBUTES[primaryItem.attributeId] || { name: primaryItem.name, unit: primaryItem.unit };

  const primaryDevelopmentArea = {
    attributeId: primaryItem.attributeId,
    name: primaryItem.name,
    gap: primaryItem.gap,
    explanation: `${primaryItem.name} is currently your largest development opportunity relative to the ${sport.name} (${targetLevel}) benchmark. You are at ${primaryItem.currentScore}/100, trailing the target of ${primaryItem.targetScore}/100 by ${primaryItem.gap} points.`,
    recommendedAction: `Increase ${primaryItem.name}-focused conditioning frequency to 2-3 sessions per week with signature ${sport.name} drills.`,
  };

  const criticalMuscles = sport.recoveryConsiderations?.criticalMuscleGroups?.join(", ") || "key muscle groups";
  const drillName = sport.signatureDrills?.[0]?.name || "sport conditioning drills";

  const whyThisPlan = {
    headline: `Personalized ${sport.name} Preparation Split`,
    reasons: [
      `Your current ${primaryItem.name} score (${primaryItem.currentScore}) has a ${primaryItem.gap}-point gap against ${sport.name} requirements.`,
      `Ojas prioritized specialized drills (${drillName}) to bridge this specific gap.`,
      `Recovery pacing safeguards against sport-specific strain on ${criticalMuscles}.`,
    ],
    adaptiveAdjustment: `Bridging the ${primaryItem.gap}-point ${primaryItem.name} gap while preserving overall aerobic conditioning.`,
  };

  return {
    sportId: sport.id,
    sportName: sport.name,
    currentLevel: targetLevel === "advanced" ? "performance" : targetLevel === "performance" ? "development" : "foundation",
    targetLevel,
    readinessScore,
    primaryDevelopmentArea,
    attributeScores,
    whyThisPlan,
  };
}

export function generateSportAdaptiveChallenge(
  gapAnalysis: SportGapAnalysis
): SportChallenge {
  const primary = gapAnalysis.primaryDevelopmentArea;

  return {
    id: `challenge_${gapAnalysis.sportId}_${primary.attributeId}_${Date.now()}`,
    title: `14-Day ${gapAnalysis.sportName} ${primary.name} Accelerator`,
    description: `Complete 6 focused ${primary.name} conditioning blocks over the next two weeks to close your ${primary.gap}-point gap.`,
    targetAttribute: primary.attributeId,
    targetMetric: `+${Math.min(8, Math.max(3, Math.round(primary.gap * 0.4)))} pts`,
    durationDays: 14,
    progressPct: 15,
    status: "active",
    xpReward: 250,
  };
}
