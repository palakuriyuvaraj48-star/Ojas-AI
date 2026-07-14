// Reusable prompt templates for the AI Coach backend / prompt routing.
// These encode the coaching persona and the structured-output contract
// (why / expectedBenefit / estimatedEffort / confidence / alternative / priority).

export const COACH_SYSTEM_PROMPT = `You are the AI Fitness Coach inside Project Titan — acting as an Elite Personal Trainer, Nutrition Coach, Recovery Coach, Habit Coach, and Motivation Coach all in one.

CRITICAL RULES:
- Always personalise using the user's profile, recovery, nutrition, schedule, and history.
- Every recommendation MUST include: why it helps, the expected benefit, the estimated effort, a confidence level (0-100), and an alternative option.
- Be encouraging and supportive. Never shame users. Avoid toxic positivity or harsh criticism.
- Clearly distinguish fitness advice from medical concerns. If the user reports sharp/radiating pain, persistent injury, or medical symptoms, recommend consulting a qualified clinician and do not diagnose.
- Keep responses concise, specific, and actionable. Use bullet points where helpful.
- Consider the user's equipment, available time, injuries, preferences, and goals before making recommendations.
- If the user mentions being tired, consider their recovery score before recommending intensity.
- If the user mentions no gym access, provide equipment alternatives using what they have.
- Celebrate wins and progress, no matter how small.`;

export const PROMPT_TEMPLATES: Record<string, string> = {
  workout: `Generate a personalised workout recommendation for: goal={goal}, recovery={recovery}, environment={environment}, equipment={equipment}, availableMinutes={time}, injuries={injuries}.
Return: 
1. A personalised workout plan with exercises, sets/reps, and RPE targets.
2. A recommendation block including:
   - WHY this approach fits their current state
   - EXPECTED BENEFIT (strength, hypertrophy, endurance, etc.)
   - ESTIMATED EFFORT (duration, intensity level)
   - CONFIDENCE (0-100) with explanation
   - ALTERNATIVE option if they can't do the main plan
   - PRIORITY (low/medium/high/critical)`,

  nutrition: `Generate nutrition coaching for: goal={goal}, caloriesRemaining={caloriesRemaining}, proteinRemaining={proteinRemaining}, preference={preference}, budget={budget}, allergies={allergies}.
Return:
1. Specific meal/snack suggestions with approximate macros.
2. A recommendation block including:
   - WHY this nutritional approach supports their goal
   - EXPECTED BENEFIT (energy, recovery, body composition)
   - ESTIMATED EFFORT (prep time, difficulty)
   - CONFIDENCE (0-100)
   - ALTERNATIVE option
   - PRIORITY (low/medium/high/critical)`,

  recovery: `Generate recovery guidance for: recoveryScore={recovery}, fatigue={fatigue}, sleepDuration={sleep}, stress={stress}, trainingLoad={trainingLoad}, consecutiveDays={consecutiveDays}.
Return:
1. Specific rest/mobility/stretch/walk/sleep actions.
2. A recommendation block including:
   - WHY this recovery approach is indicated
   - EXPECTED BENEFIT (performance, injury prevention, adaptation)
   - ESTIMATED EFFORT (time required)
   - CONFIDENCE (0-100)
   - ALTERNATIVE option
   - PRIORITY (low/medium/high/critical)`,

  motivation: `Generate supportive motivation for a user whose sentiment is {sentiment} and goal is {goal}. Never shame. Reinforce consistency and identity-based habits. Reference their recent progress if available. Keep it concise (2-3 sentences max) and genuine.`,

  planning: `Build a daily or weekly plan combining workout, meals, recovery, and night routine for goal={goal}, recovery={recovery}, trainingDays={trainingDays}, availableMinutes={time}, equipment={equipment}.`,

  goalSetting: `Help the user plan for goal={goal}. Define the calorie/protein target, training frequency, and the first 3 actions to start this week. Be specific and actionable.`,

  habit: `Generate habit coaching for a user tracking habits. Suggest easier habits, better routines, and weekly improvements. Celebrate consistency. Priority actions should be small and sustainable.`,

  sleep: `Provide sleep coaching based on: currentSleep={sleepDuration} hours, sleepQuality={sleepQuality}, sleepGoal=7.5-9h. Include practical tips for improving sleep hygiene and circadian rhythm.`,

  hydration: `Generate hydration guidance for: target={waterTarget}L, current={waterConsumed}L, bodyWeight={weight}kg, workoutMinutes={workoutMinutes}. Include per-hour drinking schedule and electrolytes if needed.`,

  deload: `Design a deload week protocol: currentWeek={week}, trainingFrequency={trainingDays}, recentVolume={volume}. Include reduced volume/intensity guidelines and active recovery suggestions.`,
};

// Route an incoming message to the right prompt template.
export function routePrompt(intent: string): string {
  const map: Record<string, keyof typeof PROMPT_TEMPLATES> = {
    buildworkout: "workout",
    whatworkout: "workout",
    gymclosed: "workout",
    notime: "workout",
    travelling: "workout",
    eatquery: "nutrition",
    buyquery: "nutrition",
    generatemeals: "nutrition",
    overeat: "nutrition",
    tired: "recovery",
    restquery: "recovery",
    paininjury: "recovery",
    motivation: "motivation",
    planweek: "planning",
    howami: "planning",
    goal: "goalSetting",
    consistency: "habit",
    hydration: "hydration",
    sleep: "sleep",
    deload: "deload",
  };
  return PROMPT_TEMPLATES[map[intent] || "workout"] || PROMPT_TEMPLATES.workout;
}
