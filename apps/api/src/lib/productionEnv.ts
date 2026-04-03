/**
 * Fail fast when NODE_ENV=production so misconfigured APIs never listen.
 * Call from index.ts after dotenv and valuation env checks.
 */
export function assertProductionReady(): void {
  if (process.env.NODE_ENV !== "production") return;

  const cors = process.env.CORS_ORIGIN?.trim() ?? "";
  if (!cors || cors === "*") {
    console.error(
      "[production] CORS_ORIGIN must list allowed browser origins (comma-separated). Empty or * is not permitted."
    );
    process.exit(1);
  }

  const skipVal =
    process.env.SKIP_VALUATION_ENV_CHECK === "1" || process.env.SKIP_VALUATION_ENV_CHECK === "true";
  if (skipVal) {
    console.error("[production] Remove SKIP_VALUATION_ENV_CHECK — valuation provider keys are required.");
    process.exit(1);
  }

  if (!process.env.REDIS_URL?.trim()) {
    console.warn(
      "[production] REDIS_URL is not set — using in-memory rate limits and BullMQ/async jobs are disabled. Set REDIS_URL for pilot-grade reliability."
    );
  }
}
