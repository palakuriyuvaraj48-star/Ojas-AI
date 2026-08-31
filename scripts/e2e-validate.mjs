import assert from "node:assert";

const BASE_URL = process.env.BASE_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3000");

console.log("===============================================================================");
console.log("  OJAS-AI COMPREHENSIVE E2E FUNCTIONAL & API VALIDATION SUITE");
console.log("===============================================================================\n");

let totalPassed = 0;
let totalFailed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    totalPassed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    totalFailed++;
  }
}

async function checkAsync(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    totalPassed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    totalFailed++;
  }
}

// ----------------------------------------------------------------------------
// 1. PAGE ROUTES HTTP VERIFICATION
// ----------------------------------------------------------------------------
console.log("--- 1. Page Routes Status & Rendering Checks ---");

const ROUTES = [
  "/",
  "/dashboard",
  "/sports",
  "/workout",
  "/food",
  "/recovery",
  "/twin",
  "/progress",
  "/form-coach",
  "/coach",
  "/adaptive-demo",
  "/community",
  "/achievements",
  "/settings",
  "/profile",
  "/history",
  "/music",
  "/admin",
  "/demo/sih-scenario"
];

for (const route of ROUTES) {
  await checkAsync(`Route GET ${route}`, async () => {
    const res = await fetch(`${BASE_URL}${route}`);
    assert.strictEqual(res.status, 200, `Expected 200 OK for ${route}, got ${res.status}`);
    const html = await res.text();
    assert.ok(html.length > 500, `HTML body for ${route} should not be empty`);
  });
}

// ----------------------------------------------------------------------------
// 2. API ENDPOINTS VERIFICATION
// ----------------------------------------------------------------------------
console.log("\n--- 2. API Endpoints Validation ---");

const API_TESTS = [
  { url: "/api/ai/health", method: "GET" },
  { url: "/api/workouts/exercises", method: "GET" },
  { url: "/api/workouts/generate?goal=fat-loss&level=intermediate&availableTime=35&location=home", method: "GET" },
  { url: "/api/workouts/generate?goal=strength&level=advanced&availableTime=50&location=gym", method: "GET" },
  { url: "/api/nutrition/meals?target=fat-loss&diet=veg&budget=100", method: "GET" },
  { url: "/api/dashboard", method: "GET" },
  { url: "/api/recovery/score", method: "GET" },
  { url: "/api/recovery/rest-day", method: "GET" },
  { url: "/api/recovery/sleep", method: "GET" },
  { url: "/api/community", method: "GET" },
  { url: "/api/music", method: "GET" },
  { url: "/api/motivation", method: "GET" },
];

for (const test of API_TESTS) {
  await checkAsync(`API ${test.method} ${test.url}`, async () => {
    const res = await fetch(`${BASE_URL}${test.url}`, { method: test.method });
    assert.ok(res.status === 200 || res.status === 304, `Expected 200 for ${test.url}, got ${res.status}`);
    const data = await res.json();
    assert.ok(data !== null && typeof data === "object", "Expected valid JSON response");
  });
}

// Test AI Coach route with fallback handling
await checkAsync("API POST /api/ai/coach (Fallback & Validation Test)", async () => {
  const res = await fetch(`${BASE_URL}/api/ai/coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      context: {
        goal: "fat-loss",
        recovery_score: 80,
        available_time_minutes: 30,
      },
      prompt: "Give me today's plan",
    }),
  });
  assert.strictEqual(res.status, 200, "Should return 200 even with Ollama offline (deterministic fallback)");
  const json = await res.json();
  assert.ok(json.recommendation, "Should contain recommendation");
  assert.ok(json.recommendation.workout, "Should recommend workout");
});

// ----------------------------------------------------------------------------
// 3. GENERATE ROUTINE CALCULATION & DATA SAFETY TESTS
// ----------------------------------------------------------------------------
console.log("\n--- 3. Edge-Case Calculation & Safety Checks ---");

await checkAsync("API Workout Generator with missing/edge parameters", async () => {
  const res = await fetch(`${BASE_URL}/api/workouts/generate?goal=&level=&availableTime=invalid`);
  assert.strictEqual(res.status, 200, "Should handle missing/invalid query params safely");
  const data = await res.json();
  assert.ok(data.title, "Should produce fallback title");
  assert.ok(data.exercises.length > 0, "Should produce fallback exercises");
});

await checkAsync("API Nutrition Meals with edge parameters", async () => {
  const res = await fetch(`${BASE_URL}/api/nutrition/meals?target=unknown&diet=unknown&budget=0`);
  assert.strictEqual(res.status, 200, "Should handle edge diet/target safely");
  const data = await res.json();
  assert.ok(data.title, "Should produce valid meal plan");
});

// ----------------------------------------------------------------------------
// SUMMARY REPORT
// ----------------------------------------------------------------------------
console.log("\n===============================================================================");
console.log(`  E2E VALIDATION SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("===============================================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
