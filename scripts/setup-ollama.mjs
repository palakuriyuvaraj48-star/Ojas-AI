/**
 * Ojas AI - Ollama Setup & Verification Helper
 * Verifies local Ollama installation, runs health checks, and verifies Gemma 3 4B.
 */

const BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const TARGET_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

async function main() {
  console.log("\n[OJAS AI] Running Ollama Setup & Verification...");
  console.log(`[OJAS AI] Target Endpoint: ${BASE_URL}`);
  console.log(`[OJAS AI] Target Model: ${TARGET_MODEL}\n`);

  try {
    const res = await fetch(`${BASE_URL}/api/tags`);
    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    const models = Array.isArray(data?.models) ? data.models.map((m) => m.name || m.model) : [];
    console.log(`[OJAS AI] ✓ Ollama service is reachable. Found ${models.length} model(s): [${models.join(", ")}]`);

    const hasTarget = models.some((m) => {
      const l = m.toLowerCase();
      const t = TARGET_MODEL.toLowerCase();
      return l === t || l.startsWith(t + ":") || l === t.split(":")[0];
    });

    if (hasTarget) {
      console.log(`[OJAS AI] ✓ Required model '${TARGET_MODEL}' is ready!`);
      console.log("[OJAS AI] ✓ Setup verification SUCCESS.\n");
    } else {
      console.warn(`[OJAS AI] ⚠️ Model '${TARGET_MODEL}' is not currently downloaded.`);
      console.log(`[OJAS AI] To install the required model, run:`);
      console.log(`          ollama pull ${TARGET_MODEL}\n`);
    }
  } catch (err) {
    console.error(`[OJAS AI] ✗ Could not connect to Ollama at ${BASE_URL}:`, err.message);
    console.log("[OJAS AI] Please ensure Ollama is installed and running (`ollama serve`).\n");
  }
}

main();
