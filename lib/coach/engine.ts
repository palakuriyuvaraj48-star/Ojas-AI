import {
  CoachContextData,
  CoachMemoryData,
  CoachRecommendation,
  CoachCard,
  DailyPlan,
  WeeklyReview,
  MonthlyReview,
  Insight,
  ParsedIntent,
  EMPTY_MEMORY,
  Priority,
} from "./types";

// ---------- helpers ----------
const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const round = (v: number) => Math.round(v);
const goalLabel = (g?: string) =>
  g ? g.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "General Fitness";

function caloriesRemaining(ctx: CoachContextData): number {
  const target = ctx.calorieTargets?.activeTarget ?? 2000;
  return round(target - (ctx.dailyLog?.caloriesConsumed ?? 0));
}
function proteinRemaining(ctx: CoachContextData): number {
  const target = ctx.macroTargets?.protein?.grams ?? 120;
  return round(target - (ctx.dailyLog?.proteinConsumed ?? 0));
}

function workoutEnvLabel(ctx: CoachContextData): string {
  const env = ctx.profile?.workoutEnvironment || (ctx.profile?.availableEquipment?.length ? "gym" : "home");
  if (env === "both") return "gym or home";
  return env;
}

function equipmentSummary(ctx: CoachContextData): string {
  const eq = ctx.profile?.availableEquipment;
  if (!eq || eq.length === 0) return "bodyweight only";
  if (eq.length <= 3) return eq.join(", ");
  return `${eq.slice(0, 3).join(", ")} + more`;
}

// ---------- context builder ----------
export function buildCoachContext(input: {
  profile: any;
  dailyLog: any;
  logsHistory: any[];
  checkInHistory: any[];
  macroTargets: any;
  calorieTargets: any;
  metrics: any;
  recovery: CoachContextData["recovery"];
  memory?: CoachMemoryData;
}): CoachContextData {
  return {
    profile: input.profile,
    dailyLog: input.dailyLog,
    logsHistory: input.logsHistory ?? [],
    checkInHistory: input.checkInHistory ?? [],
    macroTargets: input.macroTargets,
    calorieTargets: input.calorieTargets,
    metrics: input.metrics,
    recovery: input.recovery,
    memory: input.memory ?? EMPTY_MEMORY,
  };
}

// ---------- NLU ----------
export function parseIntent(message: string, ctx: CoachContextData): ParsedIntent {
  const m = message.toLowerCase();
  const entities: Record<string, string> = {};

  // time extraction: "15 minutes", "20 min", "1 hour"
  const timeMatch = m.match(/(\d+)\s*(min|minute|minutes|hour|hours|hr)/);
  if (timeMatch) entities.time = timeMatch[1] + (timeMatch[2].startsWith("h") ? "h" : "m");

  // body part extraction
  const bodyPartMatch = m.match(/(knee|back|shoulder|ankle|hip|neck|wrist|elbow|chest|quad|hamstring|glute|calf)/);
  if (bodyPartMatch) entities.bodyPart = bodyPartMatch[1];

  // food extraction
  const foodMatch = m.match(/(pizza|burger|rice|chicken|eggs|paneer|tofu|sushi|pasta|salad|protein|whey|oats)/);
  if (foodMatch) entities.food = foodMatch[1];

  const has = (...words: string[]) => words.some((w) => m.includes(w));

  let intent: ParsedIntent["intent"] = "general";
  let sentiment: ParsedIntent["sentiment"] = "neutral";

  if (has("tired", "exhaust", "fatigue", "drain", "burnout", "no energy", "low energy", "worn out")) { intent = "tired"; sentiment = "negative"; }
  else if (has("only", "minutes", "short on time", "no time", "busy", "quick", "rush")) { intent = "no-time"; }
  else if (has("gym is closed", "gym closed", "no gym", "no access to gym", "gyms closed")) { intent = "gym-closed"; }
  else if (has("skipped", "missed", "couldn't train", "didn't train", "missed workout", "rest day yesterday")) { intent = "skipped"; }
  else if (has("travel", "hotel", "trip", "vacation", "away", "flying")) { intent = "travelling"; sentiment = "neutral"; }
  else if (has("ate too much", "overeat", "binge", "too many calories", "cheat", "guilty", "bloated", "pigged out")) { intent = "overeat"; sentiment = "negative"; }
  else if (has("knee", "back", "shoulder", "pain", "hurt", "injury", "injured", "sore", "ache", "tight", "stiff")) { intent = "pain-injury"; sentiment = "negative"; }
  else if (has("what workout", "build my workout", "build a workout", "train today", "what should i do", "workout plan", "program", "what should i train")) { intent = "build-workout"; }
  else if (has("can i eat", "should i eat", "eat pizza", "eat this", "what should i eat", "what to eat", "meal", "food", "snack", "protein", "hungry")) { intent = "eat-query"; }
  else if (has("buy", "grocery", "shop", "purchase", "what should i get", "shopping list")) { intent = "buy-query"; }
  else if (has("should i rest", "rest today", "take a rest", "deload", "recover today", "rest or train")) { intent = "rest-query"; }
  else if (has("generate my meals", "meal plan", "plan my meals", "meals for", "what should i eat today")) { intent = "generate-meals"; }
  else if (has("how am i", "how am i doing", "am i on track", "progress check", "how's it going", "update me")) { intent = "how-am-i"; }
  else if (has("explain my recovery", "why is my recovery", "recovery changed", "my recovery", "recovery score")) { intent = "explain-recovery"; }
  else if (has("plan my week", "weekly plan", "week plan", "plan week", "my week", "this week")) { intent = "plan-week"; }
  else if (has("hi", "hello", "hey", "good morning", "good evening", "gm", "yo", "sup", "what's up")) { intent = "greeting"; }
  else if (has("motivat", "inspire", "encourage", "give up", "unmotivated", "lazy", "demotivat", "hard day")) { intent = "motivation"; sentiment = "negative"; }
  else if (has("goal", "cut", "bulk", "lose weight", "gain muscle", "fat loss", "muscle gain", "target")) { intent = "goal"; }
  else if (has("progress", "trend", "changed", "weight changed", "strength changed", "am i losing", "gaining")) { intent = "progress"; }
  else if (has("cheat", "skip", "miss", "off track", "failed", "broke")) { intent = "consistency"; sentiment = "negative"; }
  else if (has("water", "hydrat", "thirsty", "drink")) { intent = "hydration"; }
  else if (has("sleep", "insomnia", "tired but wired", "can't sleep")) { intent = "sleep"; }
  else if (has("deflate", "deload", "taper", "take a week off")) { intent = "deload"; }

  return { intent, sentiment, entities };
}

// ---------- recommendation factory ----------
function makeRec(
  id: string,
  category: CoachRecommendation["category"],
  title: string,
  why: string,
  expectedBenefit: string,
  estimatedEffort: string,
  confidence: number,
  alternative: string,
  priority: Priority
): CoachRecommendation {
  return { id, category, title, why, expectedBenefit, estimatedEffort, confidence: clamp(round(confidence)), alternative, priority };
}

// ---------- memory extraction ----------
export function extractMemory(message: string, ctx: CoachContextData): Partial<CoachMemoryData> | null {
  const m = message.toLowerCase();
  const updates: Partial<CoachMemoryData> = {};

  const pushUnique = (arr: string[] | undefined, val: string) => {
    const base = arr ? [...arr] : [];
    if (!base.some((x) => x.toLowerCase() === val.toLowerCase())) base.push(val);
    return base.slice(0, 12);
  };

  if (m.includes("love") || m.includes("favorite") || m.includes("enjoy") || m.includes("my best") || m.includes("prefer")) {
    const workoutHit = ["squat", "deadlift", "bench", "run", "cycling", "yoga", "mobility", "hiit", "push", "pull", "leg", "row", "lunge"].find((w) => m.includes(w));
    if (workoutHit) updates.favoriteWorkouts = pushUnique(ctx.memory.favoriteWorkouts, workoutHit.charAt(0).toUpperCase() + workoutHit.slice(1));
  }
  if (m.includes("vegetarian") || m.includes("vegan") || m.includes("veg ") || m.includes("non-veg") || m.includes("i eat") || m.includes("i'm a") || m.includes("i am a")) {
    if (m.includes("vegetarian") || m.includes("vegan")) updates.mealPreferences = pushUnique(ctx.memory.mealPreferences, "Vegetarian");
    if (m.includes("non-veg") || m.includes("meat") || m.includes("chicken") || m.includes("eggs")) updates.mealPreferences = pushUnique(ctx.memory.mealPreferences, "High-protein non-veg");
    if (m.includes("both")) updates.mealPreferences = pushUnique(ctx.memory.mealPreferences, "Flexible (veg + non-veg)");
  }
  if (m.includes("travell") || m.includes("hotel")) {
    updates.travelHabits = "Prefers bodyweight / hotel-room sessions when travelling.";
  }
  if (m.includes("gym") && (m.includes("schedule") || m.includes("monday") || m.includes("days") || m.includes("routine"))) {
    updates.gymSchedule = message.slice(0, 120);
  }
  if (m.includes("motivat") || m.includes("encourage") || m.includes("tough love") || m.includes("gentle") || m.includes("strict") || m.includes("harsh")) {
    updates.motivationStyle = m.includes("tough") || m.includes("strict") || m.includes("harsh") ? "Strict / accountability" : "Supportive / encouraging";
  }
  if (m.includes("goal") || m.includes("want to") || m.includes("aiming for")) {
    const g = m.match(/goal is ([a-z\- ]+)/);
    if (g) updates.goals = pushUnique(ctx.memory.goals, g[1].trim());
  }
  if (m.includes("equipment") || m.includes("dumbbell") || m.includes("barbell") || m.includes("band") || m.includes("kettlebell")) {
    if (m.includes("dumbbell")) updates.equipment = pushUnique(ctx.memory.equipment, "Dumbbell");
    if (m.includes("barbell")) updates.equipment = pushUnique(ctx.memory.equipment, "Barbell");
    if (m.includes("band")) updates.equipment = pushUnique(ctx.memory.equipment, "Resistance band");
    if (m.includes("kettlebell") || m.includes("kettle")) updates.equipment = pushUnique(ctx.memory.equipment, "Kettlebell");
  }

  return Object.keys(updates).length ? updates : null;
}

// ---------- main response generator ----------
export function generateCoachReply(
  message: string,
  ctx: CoachContextData,
  parsed: ParsedIntent
): { text: string; recommendation?: CoachRecommendation; cards?: CoachCard[]; safety?: boolean } {
  const p = ctx.profile || {};
  const rec = ctx.recovery;
  const score = rec?.score ?? 70;
  const name = p.name ? p.name.split(" ")[0] : "there";
  const goal = goalLabel(p.goal);
  const calLeft = caloriesRemaining(ctx);
  const proLeft = proteinRemaining(ctx);
  const workoutsThisWeek = ctx.logsHistory?.filter((l) => l.workoutCompleted).length ?? 0;

  switch (parsed.intent) {
    case "tired": {
      const rest = score < 50;
      const text = rest
        ? `You're running on low recovery (${score}/100) and fatigue is ${(rec?.fatigue ?? 50)}/100. I'd swap today's session for active recovery — a 20–30 min walk, light mobility, and an earlier bedtime. Pushing hard now risks digging a deeper hole and derailing your ${goal} progress.`
        : `You feel tired, but your recovery is at ${score}/100, so this looks more like mental fatigue than physical. A short 25-minute session with reduced volume will actually lift your energy via endorphins — just keep intensity at ~70% 1RM. We'll keep it stimulating, not draining.`;
      return {
        text,
        recommendation: makeRec(
          "r-tired",
          "recovery",
          rest ? "Active Recovery Day" : "Low-Volume Session",
          `Recovery score is ${score}/100 and fatigue is ${rec?.fatigue ?? 50}/100.`,
          "Maintains training stimulus while protecting CNS and sleep.",
          rest ? "~25 min" : "~35 min",
          86,
          rest ? "Full rest + sleep focus" : "A 15-min mobility flow instead",
          rest ? "high" : "medium"
        ),
      };
    }

    case "no-time": {
      const mins = parsed.entities.time?.replace("m", "") || "15";
      const hasDB = (ctx.profile?.availableEquipment ?? []).some((e: string) => /dumbbell|kettle|band|bench/i.test(e));
      const text = `No problem — I've got you. With only ${mins} minutes, do a density-focused ${hasDB ? "dumbbell " : "bodyweight "}circuit: 40s work / 20s rest × ${Math.max(4, Math.round(Number(mins) / 2))} rounds. It hits strength + cardio and fits your ${goal} goal perfectly.`;
      return {
        text,
        recommendation: makeRec(
          "r-time",
          "workout",
          `${mins}-Minute Density Blast`,
          "Time-boxed training preserves stimulus when the schedule is tight.",
          "Elevated heart rate + mechanical tension in minimal time.",
          `${mins} min`,
          90,
          "A 20-min brisk walk + 5 min mobility",
          "medium"
        ),
      };
    }

    case "gym-closed": {
      const hasDB = (ctx.profile?.availableEquipment ?? []).some((e: string) => /dumbbell|kettle|band|bench/i.test(e));
      const text = `Gym's closed — we go portable. ${hasDB ? "You've got " + equipmentSummary(ctx) + ", so" : "With bodyweight only,"} run a home session: 3 rounds of squat hold → push-up → glute bridge → plank, 45s each. Add a backpack for load if you want more resistance.`;
      return {
        text,
        recommendation: makeRec(
          "r-gym",
          "workout",
          "Home / Bodyweight Session",
          "Keeps the training streak alive without equipment access.",
          "Maintains movement quality and habit adherence.",
          "~30 min",
          88,
          "A long walk + mobility if you prefer rest",
          "medium"
        ),
      };
    }

    case "skipped": {
      const text = `Missing yesterday isn't failure — it's life. We don't double up; we just pick up today. Your week is still on track and one skipped session barely moves the needle. Let's do a clean, focused session today and move on.`;
      return {
        text,
        recommendation: makeRec(
          "r-skipped",
          "habit",
          "Resume Today, Don't Double Up",
          "Adherence beats perfection — avoid compensatory overtraining.",
          "Protects motivation and prevents injury from stacked volume.",
          "Today's normal session",
          92,
          "A light 20-min refresher if you're short on time",
          "low"
        ),
      };
    }

    case "travelling": {
      const text = `Travelling is where most people lose progress — so let's make it frictionless. Hotel-room circuit: suitcase rows, chair dips, bodyweight squats, wall sit. For food, prioritise protein at each meal (eggs, Greek yoghurt, grilled meat) and walk 8–10k steps a day. You won't lose gains in a week.`;
      return {
        text,
        recommendation: makeRec(
          "r-travel",
          "plan",
          "Travel Survival Plan",
          "Keeps habit + protein high while away from the gym.",
          "Minimal detraining, easier return to training.",
          "~20 min / day",
          87,
          "Book a day-pass at a local gym if available",
          "medium"
        ),
      };
    }

    case "overeat": {
      const text = `No guilt needed — one heavy day doesn't erase weeks of work. Don't slash calories tomorrow (that backfires); just return to your target and add a 20–30 min walk to improve glucose disposal. Water + protein at your next meal will reset you fast.`;
      return {
        text,
        recommendation: makeRec(
          "r-overeat",
          "nutrition",
          "Reset, Don't Penalise",
          "Binge-restrict cycles spike cortisol and drive rebound eating.",
          "Stabilises mood, hunger, and the scale by midweek.",
          "Next 2 meals",
          91,
          "A 24h mild deficit if you prefer structure",
          "low"
        ),
      };
    }

    case "pain-injury": {
      const part = parsed.entities.bodyPart || "the affected area";
      const text = `Let's be smart about your ${part}. I'd avoid loaded ${part} movements today and swap to pain-free patterns — for lower body, use cycling or upper-body focus; for upper body, go lower-body or core. Movement is medicine, but compressive loading on an angry joint is not. If pain is sharp, radiating, or persists beyond a few days, please get it checked by a physio or clinician — that's outside what I should advise on.`;
      return {
        text,
        recommendation: makeRec(
          "r-pain",
          "workout",
          `Modify Training — Protect ${part.charAt(0).toUpperCase() + part.slice(1)}`,
          "Loading a painful joint risks turning irritation into injury.",
          "Keeps you training around the issue without worsening it.",
          "~30 min modified",
          84,
          "Full rest + mobility if pain is moderate-to-high",
          "high"
        ),
        safety: true,
      };
    }

    case "build-workout":
    case "what-workout": {
      const env = workoutEnvLabel(ctx);
      const text = `Based on your ${goal} goal, ${score}/100 recovery, and ${env} access, here's today: ${workoutSuggestion(ctx, score)}. Keep RPE around ${score >= 70 ? "7–8" : "6–7"} and prioritise form over load.`;
      return {
        text,
        recommendation: makeRec(
          "r-workout",
          "workout",
          "Personalised Session",
          `Goal ${goal} + recovery ${score}/100 + ${env} environment.`,
          "Drives progression toward your goal without overshooting recovery.",
          "~45–60 min",
          89,
          "A mobility + light cardio session if fatigued",
          "medium"
        ),
      };
    }

    case "eat-query": {
      const canPizza = calLeft > 500;
      const text = canPizza
        ? `Good news — you've got ~${calLeft} kcal left today, so 2 thin-crust slices (~520 kcal) fit comfortably. Keep the rest of the day high-protein (target ${proLeft}g remaining) and you're golden.`
        : `You've got ~${calLeft} kcal left, so a full pizza would overshoot. If you really want it, halve the portion, add a big salad, and shift 200 kcal off tomorrow's breakfast. Flexibility beats all-or-nothing.`;
      return {
        text,
        recommendation: makeRec(
          "r-eat",
          "nutrition",
          canPizza ? "Yes — Fits Your Budget" : "Yes — With a Trade-off",
          `Remaining budget ~${calLeft} kcal, protein ${proLeft}g left.`,
          "Keeps you in energy balance while honouring cravings.",
          "1 decision",
          88,
          "A high-protein bowl if you'd rather stay on plan",
          "low"
        ),
      };
    }

    case "buy-query": {
      const pref = ctx.memory.mealPreferences?.length ? ctx.memory.mealPreferences[0] : (p.foodPreference === "veg" ? "vegetarian" : p.foodPreference === "non-veg" ? "high-protein non-veg" : "balanced omnivore");
      const text = `Smart shopping list for your ${goal} goal (${pref}): 1) ${pref === "vegetarian" ? "Paneer, tofu, lentils, Greek yoghurt" : "Eggs, Greek yoghurt, chicken breast / fish"}, 2) Oats & sweet potato (slow carbs), 3) Spinach, broccoli, peppers, 4) Bananas + almonds, 5) Olive oil & ghee. That covers ~${ctx.macroTargets?.protein?.grams ?? 120}g protein/day.`;
      return {
        text,
        recommendation: makeRec(
          "r-buy",
          "nutrition",
          "5-Minute Grocery List",
          "Covers protein + fibre + smart carbs for the week.",
          "Removes daily decision fatigue and supports adherence.",
          "One shop",
          90,
          "Use the in-app grocery generator for a priced list",
          "low"
        ),
      };
    }

    case "rest-query": {
      const text = score < 50
        ? `Yes — rest or active recovery today is the right call. Your recovery is ${score}/100 and your body repairs during rest, not during training. A walk + 10 min mobility + 8h sleep will have you ready to train harder tomorrow.`
        : `You can train — recovery is ${score}/100. But if you feel mentally fried, an active-recovery day is a perfectly valid choice and keeps the habit alive. Listen to the body, not just the number.`;
      return {
        text,
        recommendation: makeRec(
          "r-rest",
          "recovery",
          score < 50 ? "Rest / Active Recovery" : "Train or Recover — Your Call",
          `Recovery score ${score}/100, fatigue ${rec?.fatigue ?? 50}/100.`,
          "Optimises supercompensation and prevents overreaching.",
          "Today",
          87,
          "A 30-min easy session if you feel up to it",
          score < 50 ? "high" : "low"
        ),
      };
    }

    case "generate-meals": {
      const target = ctx.calorieTargets?.activeTarget ?? 2000;
      const proteinTarget = ctx.macroTargets?.protein?.grams ?? 120;
      const text = `Here's a ${goal}-aligned day (~${target} kcal, ${proteinTarget}g protein):\n• Breakfast: Greek yoghurt + oats + berries (~400 kcal, 30g protein)\n• Lunch: Grilled ${p.foodPreference === "veg" || p.foodPreference === "both" ? "tofu/paneer" : "chicken"} + brown rice + veg (~550 kcal, 40g protein)\n• Snack: Boiled eggs + almonds (~250 kcal, 20g protein)\n• Dinner: ${p.foodPreference === "veg" || p.foodPreference === "both" ? "Salmon/paneer" : "Salmon/chicken"} + sweet potato + greens (~500 kcal, 40g protein)\nPrep protein sources in bulk on Sunday to make weekdays effortless.`;
      return {
        text,
        recommendation: makeRec(
          "r-meals",
          "nutrition",
          "Personalised Meal Blueprint",
          `Built for ${goal} at ~${target} kcal, ${proteinTarget}g protein.`,
          "Hits protein target daily, stabilises energy and hunger.",
          "Prep 30 min/week",
          90,
          "Use the Nutrition planner for a priced, auto-generated plan",
          "low"
        ),
      };
    }

    case "how-am-i":
    case "explain-recovery": {
      const c = ctx.recovery;
      const text = `Here's your snapshot, ${name}: Recovery ${c?.score ?? score}/100 (${c?.readiness ?? "moderate"}), fatigue ${c?.fatigue ?? 50}/100, weight ${ctx.profile?.weight ?? "?"}kg, goal ${goal}. ${ctx.checkInHistory?.length ? `You've logged ${ctx.checkInHistory.length} weekly check-ins.` : "No check-ins yet — add one to sharpen my insights."} ${score >= 70 ? "You're in a strong window — train with intent." : score >= 50 ? "Solid but moderate — train smart, watch fatigue." : "Recovery is low — favour recovery today."}`;
      return { text };
    }

    case "plan-week": {
      return {
        text: `Here's your adaptable week. I've balanced training, recovery, and your ${ctx.profile?.workoutDaysPerWeek ?? 4} training days with at least 1–2 recovery days baked in:`,
        cards: [{ kind: "weekly-review", title: "Your Week", data: generateWeeklyReview(ctx) }],
      };
    }

    case "motivation": {
      const quotes = [
        `You showed up today and asked — that's already the win. Progress isn't linear; it's built in boring, consistent reps most people skip. You don't need to be perfect, you just need to be consistent. One session, one good meal, repeat. I'm with you.`,
        `This is the part most people quit — but not you. Every rep, every meal, every early night is a vote for the person you're becoming. Trust the process.`,
        `The hardest lift is showing up. You did that. Now let's make today count. Small wins compound into massive change.`,
      ];
      const quote = quotes[(workoutsThisWeek + new Date().getDate()) % quotes.length];
      return { text: quote };
    }

    case "goal": {
      const text = `Your current goal is ${goal}. For that, the lever is: ${goal.includes("Fat") || goal.includes("Loss") ? "a modest calorie deficit with high protein (2.3g/kg LBM) to spare muscle" : goal.includes("bulk") || goal.includes("Muscle") ? "a small surplus (+250–350 kcal) and progressive overload on compound lifts" : goal.includes("Strength") ? "heavy compound lifts at high intensity with adequate recovery between sessions" : "consistent training + recovery to build durable habits"}. Want me to rebuild your weekly split around it?`;
      return { text };
    }

    case "progress": {
      return {
        text: `Let me pull your trends:`,
        cards: [{ kind: "insight", title: "Your Insights", data: generateInsights(ctx) }],
      };
    }

    case "consistency": {
      const streak = ctx.logsHistory?.length ?? 0;
      const text = streak >= 3
        ? `You've been consistent — don't let one off day define you. The habit you've built is real. Get back to it today with one focused session or meal. You've got this.`
        : `Every expert was once a beginner. Building consistency takes time — aim for 3 sessions this week and I'll help you lock in the routine.`;
      return { text };
    }

    case "hydration": {
      const waterTarget = ctx.macroTargets?.water ?? 2.5;
      const waterConsumed = ctx.dailyLog?.waterConsumed ?? 0;
      const remaining = waterTarget - waterConsumed;
      const text = remaining > 0
        ? `You've had ${waterConsumed.toFixed(1)}L today — ${remaining.toFixed(1)}L to go toward your ${waterTarget}L target. Sip ~${(remaining / 14).toFixed(2)}L per waking hour. Hydration directly impacts performance and recovery.`
        : `You've hit your ${waterTarget}L hydration target — great work. Keep sipping lightly throughout the day to stay topped up.`;
      return {
        text,
        recommendation: makeRec(
          "r-water",
          "recovery",
          remaining > 0 ? "Hydration Plan" : "Hydration Complete",
          remaining > 0 ? `${remaining.toFixed(1)}L remaining to reach target.` : "Target reached for today.",
          "Maintains cognitive and physical performance.",
          remaining > 0 ? "Sip throughout the day" : "Maintenance",
          remaining > 0 ? 92 : 95,
          "Add electrolytes if training intensely today",
          "low"
        ),
      };
    }

    case "sleep": {
      const sleepDuration = ctx.profile?.sleepDuration ?? 7;
      const text = sleepDuration >= 7.5
        ? `Your average sleep is ${sleepDuration}h — solid. Protect that window. Keep screens off 30 min before bed and aim for consistent wake times to preserve circadian rhythm.`
        : `You're averaging ${sleepDuration}h — slightly under the 7.5–9h target. Try shifting bedtime 30 min earlier. Sleep is where muscle repair, hormone regulation, and memory consolidation happen. It's not optional.`;
      return {
        text,
        recommendation: makeRec(
          "r-sleep",
          "recovery",
          sleepDuration >= 7.5 ? "Sleep Maintenance" : "Sleep Optimisation",
          `${sleepDuration}h vs 7.5–9h target.`,
          "Improves recovery, cognition, and training adaptation.",
          sleepDuration >= 7.5 ? "Maintain" : "Shift bedtime 30 min earlier",
          sleepDuration >= 7.5 ? 90 : 85,
          "Use the Sleep Analysis tab for deep-sleep tracking",
          "low"
        ),
      };
    }

    case "deload": {
      const text = `A deload week is smart periodisation. Drop volume by 40–50% but keep intensity moderate (60% 1RM). This allows tendon/connective tissue repair while maintaining neural adaptations. I'd recommend this every 5–6 weeks of hard training. Your current streak suggests you might be due.`;
      return {
        text,
        recommendation: makeRec(
          "r-deload",
          "plan",
          "Deload Week Protocol",
          "Prevents overreaching and prepares for the next training block.",
          "Tendon recovery, CNS reset, performance rebound.",
          "1 week",
          82,
          "Active recovery only if you prefer a gentler approach",
          "medium"
        ),
      };
    }

    default: {
      const text = `Great question. Based on your ${goal} goal, ${score}/100 recovery, ${workoutsThisWeek} workouts this week, and ${equipmentSummary(ctx)} access, my take: stay consistent, keep protein ~${ctx.macroTargets?.protein?.grams ?? 120}g/day, protect your sleep, and trust the process. Tell me more specifically — e.g. "build my workout", "what should I eat", or "should I rest today" — and I'll give you a precise, personalised plan.`;
      return { text };
    }
  }
}

// ---------- workout suggestion helper ----------
function workoutSuggestion(ctx: CoachContextData, recoveryScore: number): string {
  const goal = ctx.profile?.goal;
  const env = workoutEnvLabel(ctx);
  if (recoveryScore < 50) return "mobility flow + light activation — no loading today";
  if (goal === "fat-loss") return "full-body circuit — goblet squat, push-up, row, plank, 4 rounds";
  if (goal === "muscle-gain" || goal === "lean-bulk") return "upper/lower split — focus compound lifts with progressive overload";
  if (goal === "maintenance") return "mixed strength + conditioning session";
  if (goal === "strength") return "compound lift focus — squat, bench, deadlift, overhead press at 80%+ 1RM";
  return env === "home" ? "bodyweight full-body circuit" : "compound lift session";
}

// ---------- plans ----------
export function generateDailyPlan(ctx: CoachContextData): DailyPlan {
  const p = ctx.profile || {};
  const score = ctx.recovery?.score ?? 70;
  const goal = goalLabel(p.goal);
  const calLeft = caloriesRemaining(ctx);
  const proLeft = proteinRemaining(ctx);

  return {
    date: new Date().toISOString().split("T")[0],
    greeting: score >= 70 ? "You're in a strong window today." : score >= 50 ? "Solid but moderate — train smart." : "Recovery is low — prioritise restoration.",
    motivation: score >= 70 ? "Show up and push with intent." : "Win the day with consistency, not intensity.",
    morning: [
      `Hydrate: ${ctx.macroTargets?.water ?? 2.5}L target today.`,
      `Protein-forward breakfast (~${Math.round((ctx.macroTargets?.protein?.grams ?? 120) * 0.3)}g).`,
      `10 min sunlight + movement to set circadian rhythm.`,
    ],
    workout: {
      title: score >= 65 ? `${goal} Training` : "Mobility & Active Recovery",
      focus: score >= 65 ? "Progressive overload, RPE 7–8" : "Blood flow, no loading",
      duration: score >= 65 ? 50 : 25,
      note: ctx.recovery?.recommendationLabel ?? "Train moderate",
    },
    meals: [
      { label: "Breakfast", suggestion: "Greek yoghurt + oats + berries", protein: 30, calories: 420 },
      { label: "Lunch", suggestion: "Grilled protein + complex carb + veg", protein: 40, calories: 560 },
      { label: "Dinner", suggestion: "Lean protein + veg + healthy fat", protein: 40, calories: 540 },
    ],
    recovery: [
      `Target 7.5–8h sleep (currently ${p.sleepDuration ?? 7.5}h logged).`,
      score < 60 ? "Add a 15-min mobility flow post-session." : "Optional light stretch.",
      `${calLeft} kcal remaining — keep protein ~${proLeft}g.`,
    ],
    night: [
      "Screens off 30 min before bed.",
      "Reflect: one win from today.",
      "Prep tomorrow's workout clothes.",
    ],
  };
}

export function generateWeeklyReview(ctx: CoachContextData): WeeklyReview {
  const logs = ctx.logsHistory ?? [];
  const workouts = logs.filter((l) => l.workoutCompleted).length;
  const avgRecovery = ctx.recovery?.score ?? 70;
  const calTarget = ctx.calorieTargets?.activeTarget ?? 2000;
  const adherence = logs.length
    ? Math.round((logs.reduce((s, l) => s + (l.caloriesConsumed > calTarget * 0.6 && l.caloriesConsumed < calTarget * 1.3 ? 1 : 0), 0) / logs.length) * 100)
    : 80;

  return {
    period: "This Week",
    workoutsCompleted: workouts,
    avgRecovery,
    nutritionAdherence: adherence,
    habits: [
      workouts >= 3 ? "Training consistency is on point." : "Aim for at least 3 sessions next week.",
      adherence >= 80 ? "Nutrition tracking is solid." : "Log meals more consistently to sharpen insights.",
      "Sleep is the cheapest performance enhancer — guard it.",
    ],
    progress: [
      `You completed ${workouts} logged workouts.`,
      `Average recovery sat at ${avgRecovery}/100.`,
      ctx.checkInHistory?.length ? `${ctx.checkInHistory.length} weekly check-in(s) recorded.` : "No check-ins yet.",
    ],
    trends: [
      avgRecovery >= 70 ? "Recovery trending upward." : "Recovery needs more rest built in.",
      adherence >= 80 ? "Nutrition stable week-over-week." : "Nutrition variance is high — tighten routine.",
    ],
    celebration: workouts >= 3 ? "Three-plus sessions — that's a real training habit. Respect." : "You're building. Consistency compounds — keep showing up.",
  };
}

export function generateMonthlyReview(ctx: CoachContextData): MonthlyReview {
  const logs = ctx.logsHistory ?? [];
  const workouts = logs.filter((l) => l.workoutCompleted).length;
  const consistency = logs.length ? Math.round((workouts / Math.max(1, logs.length)) * 100) : 0;
  const checks = ctx.checkInHistory ?? [];
  const firstW = checks[0]?.weight;
  const lastW = checks[checks.length - 1]?.weight;
  const weightDelta = firstW && lastW ? (lastW - firstW).toFixed(1) : "—";

  return {
    month: new Date().toLocaleDateString([], { month: "long" }),
    achievements: [
      `${workouts} training sessions logged.`,
      `Recovery awareness built via daily checks.`,
      "You engaged with your AI Coach for personalised guidance.",
    ],
    improve: [
      consistency < 60 ? "Lift training consistency above 60%." : "Push one more session per week.",
      "Add a weekly check-in to unlock trend insights.",
      "Sleep consistency is the highest-leverage upgrade.",
    ],
    consistency: `${consistency}% of logged days included a workout.`,
    recovery: `Average recovery window held around ${ctx.recovery?.score ?? 70}/100.`,
    recommendations: [
      weightDelta !== "—" ? `Weight moved ${weightDelta}kg — keep the trend intentional.` : "Log weight weekly to track real change.",
      "Book one deload week every 4–6 weeks of hard training.",
      "Use the AI Coach daily for adaptive adjustments.",
    ],
  };
}

// ---------- insights ----------
export function generateInsights(ctx: CoachContextData): Insight[] {
  const out: Insight[] = [];
  const logs = ctx.logsHistory ?? [];
  const checks = ctx.checkInHistory ?? [];

  if (logs.length >= 2) {
    const recent = logs.slice(-7).filter((l) => l.workoutCompleted).length;
    out.push({
      id: "i-prog",
      type: "progress",
      title: "Training Consistency",
      explanation: `You completed ${recent} workouts in the last 7 days. ${recent >= 3 ? "Strong habit formation." : "Room to add 1–2 sessions for better adaptation."}`,
      trend: recent >= 4 ? "up" : recent >= 2 ? "flat" : "down",
      confidence: 82,
    });
  }
  if (ctx.recovery) {
    out.push({
      id: "i-rec",
      type: "recovery",
      title: "Recovery Status",
      explanation: `Recovery is ${ctx.recovery.score}/100 (${ctx.recovery.readiness}). ${ctx.recovery.score < 50 ? "Your training load may be outpacing recovery — add a rest day." : "Recovery is well-managed; train with intent."}`,
      trend: ctx.recovery.score >= 70 ? "up" : ctx.recovery.score >= 50 ? "flat" : "down",
      confidence: ctx.recovery.confidence,
    });
  }
  if (checks.length >= 2) {
    const w0 = checks[0].weight;
    const w1 = checks[checks.length - 1].weight;
    const d = (w1 - w0).toFixed(1);
    out.push({
      id: "i-weight",
      type: "weight",
      title: "Bodyweight Trend",
      explanation: `Weight changed ${d}kg across ${checks.length} check-ins. ${Math.abs(Number(d)) < 1 ? "Stable — good for recomposition." : Number(d) < 0 ? "Trending down — align nutrition to your goal." : "Trending up — confirm it's muscle, not excess fat."}`,
      trend: Number(d) < -0.2 ? "down" : Number(d) > 0.2 ? "up" : "flat",
      confidence: 78,
    });
  }
  if (checks.some((c) => c.strengthLevel)) {
    const last = checks[checks.length - 1];
    out.push({
      id: "i-str",
      type: "strength",
      title: "Strength Signal",
      explanation: `Latest check-in reports strength ${last.strengthLevel}. ${last.strengthLevel === "increased" ? "Progressive overload is working." : last.strengthLevel === "decreased" ? "A deload or recovery focus may help." : "Holding steady — keep pushing load gradually."}`,
      trend: last.strengthLevel === "increased" ? "up" : last.strengthLevel === "decreased" ? "down" : "flat",
      confidence: 75,
    });
  }
  if (out.length === 0) {
    out.push({
      id: "i-empty",
      type: "progress",
      title: "Start Logging",
      explanation: "Log workouts and weekly check-ins so I can generate real trend insights for you.",
      trend: "flat",
      confidence: 60,
    });
  }
  return out;
}
