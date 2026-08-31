/**
 * Benchmark Runner Script for OJAS V2
 */

import { runBenchmarkSuite } from "../lib/benchmark/scenario-suite.ts";

console.log("\n=======================================================");
console.log("  OJAS V2 — ADAPTIVE HUMAN PERFORMANCE BENCHMARK SUITE");
console.log("  (6 User Archetypes x Constraint & Safety Validation)");
console.log("=======================================================\n");

const { total, passed, failed, results } = runBenchmarkSuite();

results.forEach((r, idx) => {
  console.log(`[${idx + 1}/${total}] ${r.caseName}`);
  console.log(`      Decision: "${r.decisionHeadline}" (${r.action}, ${r.duration} min)`);
  r.tests.forEach((t) => {
    if (t.pass) {
      console.log(`      ✓ PASS: ${t.message}`);
    } else {
      console.log(`      ✗ FAIL: ${t.message}`);
    }
  });
  console.log("");
});

console.log("=======================================================");
console.log(`  RESULTS: ${passed} / ${total} Archetypes Passed (${Math.round((passed / total) * 100)}%)`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
