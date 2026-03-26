import "dotenv/config";
import { app } from "./app.js";
import { startObservability } from "./lib/observability.js";
import { startQueueWorkers } from "./lib/queue.js";

const PORT = Number(process.env.PORT) || 3001;

const requiredValuationEnvs = ["EDMUNDS_API_KEY", "EDMUNDS_SECRET", "MARKETCHECK_API_KEY"] as const;
const missingValuation = requiredValuationEnvs.filter((k) => !process.env[k]);
if (missingValuation.length > 0) {
  console.error("Missing valuation API env vars:", missingValuation.join(", "));
  console.error("Refusing to start to protect valuation reliability and billing guardrails.");
  process.exit(1);
}
startObservability();
startQueueWorkers();

app.listen(PORT, "0.0.0.0", () => {
  console.log(JSON.stringify({
    api: "@vex/api",
    status: "running hot 🔥",
    message: "VEX backend is live — luxury whips, no cap",
    endpoints: {
      health: "GET /health → server check",
      auth: [
        "POST /auth/register → create account",
        "POST /auth/login → get JWT",
        "GET /auth/me → current user (needs token)",
      ],
      vehicles: "GET /vehicles, GET /vehicles/:id/options",
      inventory: "GET /inventory (filters), GET /inventory/:id, POST/PATCH /inventory (auth)",
    },
    note: "Hit /health to confirm everything's breathing",
    timestamp: new Date().toISOString(),
  }, null, 2));
  console.log(`\n→ http://localhost:${PORT}/health\n`);
});
