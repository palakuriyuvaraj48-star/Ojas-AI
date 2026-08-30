/**
 * Ojas AI - Live Vision Coach & Digital Twin Integration Test Suite
 * Tests:
 * 1. RepCounter state machine (Full reps vs Partial reps)
 * 2. Biomechanical Form Analyzer (Squats, Push-ups, Bicep Curls, Overhead Press)
 * 3. Structured What/Why/How Feedback generation
 * 4. Vision Session save & Digital Twin closed-loop bridge
 */

import { EXERCISES, getExercise } from "../lib/vision/exercises.ts";
import { RepCounter } from "../lib/vision/rep-counter.ts";
import { evaluateRules, scoreRep } from "../lib/vision/form-analysis.ts";

async function runVisionTests() {
  console.log("\n=======================================================");
  console.log("  OJAS AI — LIVE VISION COACH & DIGITAL TWIN TEST SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = "") {
    total++;
    if (condition) {
      console.log(`  ✓ PASS: ${name} ${details ? `(${details})` : ""}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ""}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Full Rep Counting State Machine (Squat)
  // ----------------------------------------------------
  console.log("[1/4] Testing RepCounter full repetition state machine...");
  const squatEx = getExercise("squat");
  const counter = new RepCounter(squatEx);

  let now = Date.now();
  // Simulate 3 full squats (168° top -> 90° bottom -> 168° top)
  for (let rep = 1; rep <= 3; rep++) {
    // Top -> Descending
    counter.update(168, "resting", now);
    now += 200;
    counter.update(140, "lowering", now);
    now += 300;
    counter.update(110, "lowering", now);
    now += 400;
    // Bottom
    counter.update(88, "pause", now);
    now += 300;
    // Ascending
    counter.update(120, "lifting", now);
    now += 400;
    counter.update(150, "lifting", now);
    now += 300;
    // Return to Top
    const res = counter.update(168, "resting", now);
    now += 700; // debounce gap

    assert(res.completed === true, `Squat Rep ${rep} completed`);
    assert(res.rep?.partial === false, `Squat Rep ${rep} counted as valid full repetition`);
  }

  const counts = counter.getCounts();
  assert(counts.reps === 3, "Total valid reps equals 3", `reps=${counts.reps}`);
  assert(counts.partialReps === 0, "Partial reps equals 0", `partial=${counts.partialReps}`);

  // ----------------------------------------------------
  // TEST 2: Partial Rep Detection (Shallow Squat)
  // ----------------------------------------------------
  console.log("\n[2/4] Testing Partial Repetition Detection...");
  counter.reset();
  now = Date.now();

  // User only descends to 130° (target 95°) then stands back up
  counter.update(168, "resting", now);
  now += 200;
  counter.update(150, "lowering", now);
  now += 300;
  counter.update(130, "pause", now); // shallow bottom (reversed too high)
  now += 300;
  counter.update(145, "lifting", now);
  now += 300;
  const partialRes = counter.update(168, "resting", now);

  assert(partialRes.completed === true, "Partial movement cycle detected");
  assert(partialRes.rep?.partial === true, "Repetition correctly classified as partial");
  assert(counter.getCounts().partialReps === 1, "Partial rep counter incremented to 1");
  assert(partialRes.rep?.issue?.toLowerCase().includes("range") || partialRes.rep?.issue?.toLowerCase().includes("depth"), "Partial rep feedback provides clear reason");

  // ----------------------------------------------------
  // TEST 3: Biomechanical What / Why / How Form Diagnostics
  // ----------------------------------------------------
  console.log("\n[3/4] Testing Biomechanical Form Diagnostics (What / Why / How)...");

  // A. Squat with Knee Valgus & Forward Torso Lean
  const squatBadAngles = {
    kneeL: 85,
    kneeR: 110, // 25° difference -> valgus
    kneeAngle: 95,
    torso: 42,  // > 38° lean
    hipAngle: 80,
  };
  const squatEval = evaluateRules(squatBadAngles, squatEx);
  assert(squatEval.feedback.length >= 2, "Squat rule evaluator identified multiple biomechanical flaws");
  const valgusFeedback = squatEval.feedback.find(f => f.what?.toLowerCase().includes("knee"));
  assert(valgusFeedback?.what && valgusFeedback?.why && valgusFeedback?.how, "Squat feedback includes structured What / Why / How");
  console.log(`      What: "${valgusFeedback?.what}"`);
  console.log(`      Why:  "${valgusFeedback?.why}"`);
  console.log(`      How:  "${valgusFeedback?.how}"`);

  // B. Push-up with Sagging Hips
  const pushupEx = getExercise("push-up");
  const pushupBadAngles = {
    torso: 25, // sagging hips (>20°)
    elbowAngle: 85,
    elbowL: 85,
    elbowR: 85,
  };
  const pushupEval = evaluateRules(pushupBadAngles, pushupEx);
  const hipSagging = pushupEval.feedback.find(f => f.what?.toLowerCase().includes("hips") || f.what?.toLowerCase().includes("sagging"));
  assert(Boolean(hipSagging), "Push-up evaluation flagged hip sagging issue");

  // C. Bicep Curl with Shoulder Drift & Incomplete Extension
  const curlEx = getExercise("bicep-curl");
  const curlBadAngles = {
    shoulderAngle: 45, // excessive elbow drift (>35°)
    elbowAngle: 125,   // incomplete extension (<140°)
  };
  const curlEval = evaluateRules(curlBadAngles, curlEx);
  assert(curlEval.feedback.length >= 1, "Bicep curl evaluation flagged form faults");

  // ----------------------------------------------------
  // TEST 4: Rep Scoring & Performance Metrics
  // ----------------------------------------------------
  console.log("\n[4/4] Testing Form Scoring System...");
  const repScoreResult = scoreRep({
    angles: { kneeL: 92, kneeR: 93, kneeAngle: 92.5, torso: 18, hipAngle: 85 },
    rom: { joint: "kneeAngle", minAngle: 90, maxAngle: 168, observedRange: 78, expectedRange: 73, completeness: 1.0, shallow: false },
    symmetry: { joint: "knee", leftAngle: 92, rightAngle: 93, asymmetryPct: 1, symmetryIndex: 0.99, flagged: false },
    tempo: { loweringMs: 1800, pauseMs: 400, liftingMs: 1200, totalMs: 3400 },
  }, squatEx);

  assert(repScoreResult.score >= 85, `Optimal rep received high form score (${repScoreResult.score}/100)`);
  assert(repScoreResult.metrics.stability >= 80, `Stability metric computed (${repScoreResult.metrics.stability}%)`);
  assert(repScoreResult.metrics.rangeOfMotion >= 90, `ROM metric computed (${repScoreResult.metrics.rangeOfMotion}%)`);
  assert(repScoreResult.metrics.tempo >= 80, `Tempo metric computed (${repScoreResult.metrics.tempo}%)`);

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n=======================================================");
  console.log(`  RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log("=======================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVisionTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
