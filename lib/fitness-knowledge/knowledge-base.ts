/**
 * Ojas AI - Sports Science & Fitness Knowledge Base
 * Modular, evidence-grounded fitness intelligence modules.
 */

import { KnowledgeItem } from "./types";

export const FITNESS_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 1. TRAINING & PROGRAMMING
  {
    id: "kb_prog_overload",
    category: "training",
    title: "Progressive Overload & Periodization",
    summary: "Systematic increase in training stimulus (load, volume, density, or technical quality) over time to drive adaptation.",
    principles: [
      "Target 1-3 Reps in Reserve (RIR / RPE 7-9) on working sets for optimal hypertrophy without excessive systemic fatigue.",
      "Compound multi-joint movements (squat, hinge, push, pull) should form the core 60-70% of weekly training volume.",
      "Micro-load incrementally (1-2.5kg or +1 rep per set) when all target sets reach the top of the prescribed rep range.",
    ],
    keywords: ["progressive overload", "strength", "hypertrophy", "reps", "sets", "rir", "rpe", "intensity", "progression"],
    triggers: { minRecovery: 65 },
  },
  {
    id: "kb_deload_fatigue",
    category: "training",
    title: "Deload Protocols & Fatigue Mitigation",
    summary: "Strategic 30-50% reduction in volume and intensity to dissipate accumulated central and peripheral fatigue.",
    principles: [
      "When recovery drops below 50 or fatigue exceeds 70, swap heavy multi-joint loading for active recovery or joint-sparing mobility.",
      "Keep intensity at RPE 5-6 (4-5 RIR) during deload sessions; do not train to muscular failure.",
      "Incorporate tempo work (3-sec eccentrics) with 50% normal load to preserve motor patterns without neurological stress.",
    ],
    keywords: ["deload", "fatigue", "exhaustion", "soreness", "cns", "overtraining", "recovery priority", "burnout"],
    triggers: { maxRecovery: 45, minFatigue: 70 },
  },

  // 2. EXERCISE SELECTION & SUBSTITUTIONS
  {
    id: "kb_limited_equip",
    category: "exercise",
    title: "Minimalist & Limited Equipment Adaptations",
    summary: "Biomechanical regressions and mechanical drop-sets utilizing dumbbells, bands, and bodyweight leverage.",
    principles: [
      "Bodyweight lever adjustments: Elevate feet on pushups to mimic incline bench, single-leg Bulgarian split squats substitute heavy barbell squats.",
      "Dumbbell complexes: Pair agonist/antagonist movements (e.g. DB Romanian Deadlift into DB Bent-Over Row) to maximize density in 20 minutes.",
      "Control eccentric tempo (3-4 seconds) to increase mechanical tension when external load is restricted.",
    ],
    keywords: ["dumbbell", "bodyweight", "hostel", "home workout", "no gym", "equipment", "limited", "hotel room", "travel"],
    triggers: { equipment: ["dumbbell", "bodyweight", "none"] },
  },
  {
    id: "kb_time_compression",
    category: "exercise",
    title: "Time-Compressed High-Density Training",
    summary: "Supersets, agonist-antagonist pairings, and metabolic circuits that deliver full stimulus within 15-25 minutes.",
    principles: [
      "Use paired sets with 30-45s rest between opposing muscle groups (e.g. Quad dominant + Horizontal Pull).",
      "Prioritize compound whole-body movements that stimulate maximum muscle mass per unit of time.",
      "Keep warmup concise (3-4 minutes dynamic flow) to preserve time for core working blocks.",
    ],
    keywords: ["20 min", "15 min", "short time", "busy", "exam", "quick workout", "fast", "time limited"],
    triggers: { maxAvailableTime: 25 },
  },

  // 3. FAT LOSS
  {
    id: "kb_fat_loss_preservation",
    category: "fat_loss",
    title: "Muscle-Preserving Fat Loss Science",
    summary: "Energy deficit management combined with high-protein intake and resistance training to preserve lean mass.",
    principles: [
      "Target a moderate 300-500 kcal daily deficit (approx 0.5-1% body weight loss per week) to prevent metabolic slowdown.",
      "Keep protein elevated at 1.8-2.2g per kg of body weight to safeguard skeletal muscle from catabolism.",
      "Maintain heavy resistance training intensity rather than switching to light weight 'toning' routines.",
    ],
    keywords: ["fat loss", "cut", "calorie deficit", "weight loss", "lean", "burn fat", "diet"],
    triggers: { goals: ["fat-loss", "weight-loss", "cutting"] },
  },

  // 4. MUSCLE GAIN
  {
    id: "kb_hypertrophy_science",
    category: "muscle_gain",
    title: "Hypertrophy & Lean Bulk Science",
    summary: "Optimal volume landmarks and nutritional surplus for maximal muscle protein synthesis.",
    principles: [
      "Target 10-20 weekly sets per muscle group, split across 2-3 sessions per week for optimal frequency.",
      "Consume a slight caloric surplus of +200 to +350 kcal/day to facilitate anabolic signaling with minimal adipose accretion.",
      "Ensure minimum 1.6-2.0g/kg protein distributed across 3-4 meals containing >=2.5g leucine.",
    ],
    keywords: ["muscle gain", "hypertrophy", "bulk", "build muscle", "size", "strength gain", "mass"],
    triggers: { goals: ["muscle-gain", "hypertrophy", "strength", "bulking"] },
  },

  // 5. RECOVERY & SLEEP
  {
    id: "kb_sleep_architecture",
    category: "sleep",
    title: "Sleep Optimization & Circadian Health",
    summary: "Neurological and hormonal restoration through deep slow-wave sleep and sleep debt mitigation.",
    principles: [
      "When sleep is below 6.0 hours, growth hormone secretion drops by up to 50% and injury risk increases significantly.",
      "Scale workout volume down by 30% after nights of poor sleep (<6h) and replace high-axial loading with joint-friendly machines or floor mobility.",
      "Consistent wake-up times and 500ml morning hydration accelerate circadian rhythm alignment.",
    ],
    keywords: ["sleep", "insomnia", "tired", "poor sleep", "sleep duration", "fatigue", "circadian", "wake up"],
    triggers: { maxRecovery: 50 },
  },
  {
    id: "kb_active_recovery",
    category: "recovery",
    title: "Active Recovery & Lymphatic Drainage",
    summary: "Sub-maximal movement promoting blood flow, nutrient delivery to damaged muscle fibers, and autonomic nervous system regulation.",
    principles: [
      "Zone 1-2 aerobic activity (walking, light cycling at <60% HR max for 15-20 min) speeds metabolite clearance faster than passive bed rest.",
      "Perform diaphragmatic breathing (4s inhale, 7s hold, 8s exhale) to shift autonomic tone from sympathetic fight-or-flight to parasympathetic recovery.",
      "Target mobility routines on tight kinetic chain links (hip flexors, thoracic spine, ankles).",
    ],
    keywords: ["active recovery", "stretching", "mobility", "sore", "doms", "parasympathetic", "walk", "foam roller"],
    triggers: { maxRecovery: 55 },
  },

  // 6. NUTRITION & HYDRATION
  {
    id: "kb_budget_nutrition",
    category: "nutrition",
    title: "Cost-Effective Nutrition & Micronutrient Staples",
    summary: "High-protein, micronutrient-dense meal strategies optimized for student and budget-conscious constraints (₹150-300/day).",
    principles: [
      "High-value budget protein staples: Whole eggs, paneer, soy chunks (52% protein by weight), curd/yogurt, roasted chana, lentils/dal + rice combo.",
      "Pre-workout fuel (1-2 hours prior): Complex carbohydrate source (banana, oats, or chapati) with 15-20g protein.",
      "Hydration baseline: 35-40ml per kg body weight plus 500ml for every 45 minutes of intense sweat loss.",
    ],
    keywords: ["nutrition", "budget", "protein", "food", "diet", "rupees", "student meal", "cheap protein", "vegetarian", "hydration", "water"],
    triggers: { lifestyle: ["budget", "student", "hostel"] },
  },

  // 7. SAFETY & MEDICAL CONTRAINDICATIONS
  {
    id: "kb_safety_red_flags",
    category: "safety",
    title: "Safety Red Flags & Medical Scope Boundaries",
    summary: "Clear clinical boundaries separating fitness guidance from medical diagnosis and injury triage.",
    principles: [
      "RED FLAG: Sharp, sudden, localized joint pain, radiating neural sensations (numbness/tingling), dizziness, shortness of breath, or chest pain must IMMEDIATELY trigger exercise cessation and a recommendation to consult a qualified medical professional.",
      "Do NOT diagnose injuries (e.g. do not diagnose rotator cuff tears, disc herniations, or fractures).",
      "Offer conservative, pain-free regressions only (e.g., pain-free isometric holds or non-loaded mobility) until cleared by a physician.",
    ],
    keywords: ["injury", "pain", "sharp pain", "chest pain", "dizzy", "faint", "doctor", "medical", "swelling", "tear", "sprain"],
  },
];
