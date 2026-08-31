import { SportDiscoveryAnswer, SportDiscoveryRecommendation } from "./types";
import { SPORT_REGISTRY } from "./sport-registry";

export function discoverMatchingSports(
  answers: SportDiscoveryAnswer
): SportDiscoveryRecommendation[] {
  const recommendations: SportDiscoveryRecommendation[] = [];

  Object.values(SPORT_REGISTRY).forEach((sport) => {
    let fitScore = 50; // base score
    const reasons: string[] = [];

    // Check environment match
    if (answers.environment === "outdoor_turf" && (sport.category === "field" || sport.category === "track_running")) {
      fitScore += 15;
      reasons.push(`Matches your preference for outdoor turf training.`);
    } else if (answers.environment === "indoor_court" && (sport.category === "court" || sport.category === "racket" || sport.category === "combat_contact")) {
      fitScore += 15;
      reasons.push(`Matches your indoor court training environment.`);
    }

    // Check pace/energy system match
    if (answers.preferredPace === "explosive_bursts" && (sport.primaryEnergySystem === "Anaerobic Alactic" || sport.id === "badminton" || sport.id === "kabaddi")) {
      fitScore += 20;
      reasons.push(`Demands high-intensity short explosive bursts matching your movement style.`);
    } else if (answers.preferredPace === "continuous_stamina" && (sport.primaryEnergySystem === "Aerobic" || sport.id === "athletics" || sport.id === "football")) {
      fitScore += 20;
      reasons.push(`Utilizes sustained cardiovascular stamina and pacing.`);
    } else if (answers.preferredPace === "tactical_agility" && (sport.id === "football" || sport.id === "badminton" || sport.id === "cricket")) {
      fitScore += 18;
      reasons.push(`Emphasizes multi-directional agility and tactical anticipation.`);
    }

    // Check physical strength overlap
    let strengthMatches = 0;
    sport.requiredAttributes.forEach((req) => {
      if (answers.physicalStrengths?.includes(req.attributeId)) {
        strengthMatches++;
      }
    });

    if (strengthMatches > 0) {
      fitScore += Math.min(25, strengthMatches * 8);
      reasons.push(`Directly leverages your identified physical strengths (${strengthMatches} high-priority overlap).`);
    }

    // Normalized fit score
    const clampedScore = Math.min(96, Math.max(45, fitScore));

    recommendations.push({
      sportId: sport.id,
      sportName: sport.name,
      icon: sport.icon,
      fitScore: clampedScore,
      whyFitReasons: reasons.length > 0 ? reasons : ["Provides strong general athletic conditioning foundation."],
      startingLevel: "foundation",
    });
  });

  // Sort descending by fit score
  return recommendations.sort((a, b) => b.fitScore - a.fitScore);
}
