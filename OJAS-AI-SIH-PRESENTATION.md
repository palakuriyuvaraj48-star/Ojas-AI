# OJAS AI
## Final SIH Presentation | Six-slide judge-first deck

**Problem Statement ID:** SIH26196  
**Problem:** Student Innovation - Ideas that can boost fitness activities  
**Theme:** Students Innovation  
**PS Category:** Software  
**Team ID:** 53476  
**Team Name:** OJAS AI

> **Core message:** Most fitness apps give you a plan. OJAS adapts the plan to the person.

## Deck rules

- Use 16:9 slides, deep navy background, orange OJAS accent, green for recovery, blue for movement, white text.
- Keep body copy at projector-readable size. Prefer one diagram and one proof surface per slide.
- Use screenshots from the live routes listed in the notes. Add a thin orange outline around the UI area that proves the slide claim.
- Treat all values shown in the product UI as demo state unless accompanied by a reproducible benchmark.
- Never describe the Digital Twin as clinical, medical, or predictive of disease.

---

## Slide 1 - Project identity

### On-slide copy

# OJAS AI
### INDIA-FIRST ADAPTIVE AI FITNESS OPERATING SYSTEM

**Student Innovation - Ideas that can boost fitness activities**

> **MOST FITNESS APPS GIVE YOU A PLAN.**  
> **OJAS ADAPTS THE PLAN TO THE PERSON.**

Bottom rail: `SIH26196` | `Team 53476` | `OJAS AI`

### Visual direction

Use a clean product identity slide: OJAS wordmark, one dashboard crop, and a small six-step loop label:

`SENSE -> UNDERSTAND -> ANALYZE -> DECIDE -> ACT -> LEARN`

Do not use a stock fitness photo. The product screen and the loop establish the category.

### Judge question answered

**What is OJAS?** An India-first adaptive fitness operating system that selects the most feasible next action from the user's current state, performance, and constraints.

### Speaker note

OJAS is not primarily a workout generator or chatbot. It connects movement, nutrition, recovery, performance, and context into a decision workflow that can change as the user's day changes.

---

## Slide 2 - Problem -> solution -> innovation

### On-slide copy

## Fitness plans break when student life changes

| Existing gap | OJAS response |
|---|---|
| Generic guidance | **Adaptive AI Coach** |
| Exercise-form uncertainty | **Smart Form Coach** |
| Nutrition disconnected from goals | **Nutrition Intelligence** |
| Recovery tracked separately | **Recovery as a decision input** |
| Time, equipment, hostel, and mess constraints ignored | **Feasible daily action** |

### Main visual

```text
USER GOAL + HISTORY + CURRENT CONTEXT
                  |
                  v
       HUMAN PERFORMANCE DIGITAL TWIN
                  |
                  v
       ADAPTIVE DECISION ENGINE
                  |
                  v
           PERSONALIZED ACTION
                  |
                  v
                FEEDBACK
                  |
                  +------> DIGITAL TWIN UPDATED
```

Callout: **Continuous adaptation using current state, performance, and context.**

### Judge question answered

**Why does OJAS need to exist?** A fixed plan can become infeasible when sleep, stress, time, equipment, budget, or location changes. OJAS keeps the action achievable instead of treating a changed day as a failed plan.

### Speaker note

The differentiator is integration and adaptation, not a claim that other products have no individual fitness features. OJAS brings the signals together before recommending what to do next.

---

## Slide 3 - Technical architecture

### On-slide copy

## How OJAS works: a closed decision loop

```text
SENSE -> UNDERSTAND -> ANALYZE -> DECIDE -> ACT -> LEARN
  ^                                                   |
  +---------------------------------------------------+
```

```text
MOVEMENT     NUTRITION     RECOVERY     PERFORMANCE     CONTEXT
     \            |             |             |             /
      +---------- HUMAN PERFORMANCE DIGITAL TWIN ----------+
                              |
                              v
                 ADAPTIVE DECISION ENGINE
          context fusion -> constraints -> risk check
                              |
                              v
                         AI COACH
       structured decision -> understandable recommendation
                              |
                              v
               PERSONALIZED TRAINING / FOOD / RECOVERY ACTION
                              |
                              v
                    FEEDBACK -> UPDATED USER STATE
```

### Technical stack, accurately scoped

- **Next.js + React + TypeScript:** product surfaces and API routes
- **Deterministic TypeScript engines:** Digital Twin, context fusion, constraints, safety/risk, adaptive action selection
- **Browser camera and pose workflow:** Smart Form Coach interaction
- **Vision adapters:** MediaPipe/pose-model integration boundary plus prototype pose engine
- **Ollama-compatible AI layer:** turns structured state and decisions into coaching language; deterministic fallback remains available
- **FastAPI contract:** analysis service boundary for normalized pose telemetry

### Judge question answered

**How is it technically feasible?** The system is modular: deterministic decision logic owns the action choice, computer vision supplies movement signals, and the AI layer explains or personalizes the recommendation.

### Speaker note

Do not present the language model as the safety-critical decision maker. The decision engine evaluates constraints and risk first; the coach communicates the result. The Digital Twin is an evolving representation of fitness and performance state, not a medical model.

---

## Slide 4 - Smart Form Coach + Digital Twin

### On-slide copy

## Reference movement + live user = biomechanical comparison

```text
EXERCISE SELECTED
      |
      v
REFERENCE DIGITAL TWIN / EXERCISE MODEL
(target positions, angles, phases, tempo criteria)
      +
LIVE CAMERA / POSE INPUT
      |
      v
BODY POSITIONS + JOINT ANGLES + SPEED + MOVEMENT PHASE
      |
      v
COMPARE -> FORM DEVIATION -> FORM SCORE -> VISUAL FEEDBACK
      |
      v
STORE RESULT -> DIGITAL TWIN SIGNAL -> FUTURE ADAPTATION
```

### Screenshot evidence to place on the slide

- **Left:** `/form-coach` exercise guide showing squat phases and reference targets.
- **Center:** live camera/skeleton panel or comparison panel.
- **Right:** form score, detected issue, correction, and repetition timeline.

Use the product's visible squat example only as an interface demonstration. Do not turn a displayed score into an experimental accuracy claim.

### Current prototype claim

**Demonstrates a movement-analysis workflow:** exercise reference data, pose/movement processing, joint-angle and phase checks, visual feedback, score/history state, and Digital Twin synchronization hooks.

### Future / not claimed today

Higher-accuracy models, more robust multi-angle analysis, and voice alerts are under development. The system identifies potentially unsafe movement patterns and provides corrective feedback; it does not claim to prevent injuries.

### Judge question answered

**How does OJAS understand movement?** It compares a reference movement model with observed pose signals, produces an explainable form signal, and feeds that signal back into the adaptive state.

### Speaker note

This is the hero technical feature. Show the flow in under 30 seconds: select squat, show the reference, show the live/pose panel, show the issue and score, then show where the result enters the Digital Twin.

---

## Slide 5 - Adaptive daily decision + India-first impact

### On-slide copy

## Same person + different context = different next action

### Scenario: hostel student during exams

```text
POOR SLEEP + HIGH STRESS + LOW RECOVERY
+ HIGH PREVIOUS LOAD + 20 MINUTES + NO EQUIPMENT
                         |
                         v
                 OJAS ANALYZES STATE
                         |
                         v
             DO NOT RUN THE NORMAL FULL PLAN
                         |
                         v
     SHORTER / LOWER-LOAD / RECOVERY-FOCUSED ACTION
                         |
                         v
             COMPLETE -> FEEDBACK -> STATE UPDATED
```

### Minimum viable training

`IDEAL PLAN: 60 min  ->  REDUCED PLAN: 30 min  ->  MINIMUM MEANINGFUL ACTION: 15 min`

### India-first constraints

- Hostel room and limited equipment
- Mess food and practical meal substitutions
- Exam schedules and irregular time
- Budget-aware nutrition choices
- Smartphone-first access and multilingual potential
- Fitness plus sport context where relevant

### Judge question answered

**How does adaptation help an Indian student?** It compresses the plan around real constraints while preserving a meaningful action, and it lets recovery and nutrition influence the decision instead of living in separate modules.

### Speaker note

Run the local SIH demo here. The checked-in scenario uses Anil, a 22-year-old hostel student, starts from a 60-minute baseline, applies an exam or budget scenario, then recomputes the plan. Present the scenario as a prototype demonstration, not as a user-study result.

---

## Slide 6 - Validation + feasibility + differentiation

### On-slide copy

## Why OJAS is credible enough to select for the next stage

### CURRENT PROTOTYPE | demonstrated

- Dashboard, workouts, recovery, nutrition, progress, and AI Coach surfaces
- Digital Twin state creation and update flow
- Adaptive decision workflow with constraints and risk checks
- SIH scenario: input change -> recommendation change
- Smart Form Coach reference, pose/movement analysis, feedback, score/history hooks
- Ollama-compatible coaching layer with deterministic fallback

### VALIDATION PLAN | next evidence

Measure against a reproducible test set and cross-user pilot:

- Adaptive vs static plan feasibility
- Action completion and consistency
- Decision correctness under changed constraints
- Form-analysis agreement against labeled movement examples
- Nutrition lookup and portion-estimation error
- Recovery-aware recommendation adherence

**Current status:** functional demonstration; formal accuracy benchmarking and cross-user evaluation are in progress. No prototype accuracy number is claimed here.

### FEASIBILITY + SCALE

Modular web architecture, structured domain logic, expandable exercise/nutrition knowledge, smartphone-first delivery, and a clear path to wearables and multi-sensor inputs.

### DIFFERENTIATION

```text
MOVEMENT + NUTRITION + RECOVERY + PERFORMANCE + CONTEXT
                         |
                 DIGITAL TWIN + DECISION ENGINE
                         |
                   PERSONALIZED NEXT ACTION
```

### Footer CTAs

`DEMO` https://ojas-ai.vercel.app/demo/sih-scenario  
`PRODUCT` https://ojas-ai.vercel.app/  
`FORM COACH` https://ojas-ai.vercel.app/form-coach

Reserve three 1.1 in square areas for Demo QR, GitHub QR, and Walkthrough QR. Generate them only after confirming the final URLs.

### Judge question answered

**Is it real, feasible, and honest about what comes next?** The prototype demonstrates the core decision loop and movement workflow; the deck separates current behavior from validation work and future sensing hardware.

### Speaker note

Close on the memorable statement:

> **OJAS does not just give you a fitness plan. It understands your current state and adapts what you should do next.**

---

## Evidence and claim audit

| Claim used in deck | Local/live evidence | Status in deck |
|---|---|---|
| Input changes can change the recommendation | `app/demo/sih-scenario/page.tsx`, `lib/adaptive-engine`, live SIH demo | Demonstrated prototype behavior |
| Recovery and constraints affect decisions | `lib/decision-engine/adaptive-decision-engine.ts`, context and safety modules | Implemented decision logic |
| Digital Twin evolves with feedback | `lib/digital-twin/engine.ts`, vision feedback route | Implemented state/update pathway |
| Smart Form Coach tracks reference movement and form signals | `lib/vision/*`, `components/fitness/form-coach/*`, live `/form-coach` | Workflow demonstration |
| Nutrition includes BMR/TDEE and budget-aware suggestions | nutrition dashboard, adaptive decision engine | Product capability; not validation |
| Ollama is an AI coaching layer | `lib/ollama/*`, AI coach route | Integration with fallback |
| Prototype accuracy | No reproducible benchmark supplied | Explicitly not claimed |
| Injury prevention / clinical validity | No evidence supplied | Explicitly not claimed |
| Future wearables and multi-sensor hardware | Roadmap only | Future |

## Research references to add in the final visual deck

Use a small references strip or appendix handout. Each source must answer what it supports:

- **MediaPipe Pose / BlazePose documentation:** pose-landmark and movement-analysis building blocks; does not validate OJAS accuracy.
- **Food-101 dataset paper:** food-image classification benchmark; does not provide nutrition values or validate portion estimation.
- **Mifflin-St Jeor equation source:** BMR estimation method used by the product; not a personalized medical assessment.
- **WHO physical activity guidance:** general physical-activity context; does not validate OJAS recommendations.

Verify exact bibliographic details and URLs before exporting the final PPT/PDF.

## Final pre-export checks

- Replace all placeholder QR squares with confirmed URLs.
- Capture current screenshots from `/dashboard`, `/form-coach`, `/nutrition`, `/coach`, `/progress`, and `/recovery`.
- Confirm the visible UI state matches the words on each slide.
- Keep prototype outputs labeled as demo output, not experimental results.
- Show current, under development, and future states in separate visual treatments.
- Run the SIH demo live once before presentation day and keep a recorded fallback.
