/**
 * Fail fast when NODE_ENV=production so misconfigured APIs never listen.
 * Call from index.ts after dotenv and valuation env checks.
 */
export function assertProductionReady(): void {
  if (process.env.NODE_ENV !== "production") return;

  const requireCompleteIntegrationEnv = (
    label: string,
    requiredKeys: string[],
    enablementHint: string
  ): void => {
    const provided = requiredKeys.filter((k) => process.env[k]?.trim());
    if (provided.length === 0) return;

    const missing = requiredKeys.filter((k) => !process.env[k]?.trim());
    if (missing.length > 0) {
      console.error(
        `[production] ${label} integration is partially configured. Missing env vars: ${missing.join(", ")}. ` +
          enablementHint
      );
      process.exit(1);
    }
  };

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

  requireCompleteIntegrationEnv(
    "Fortellis",
    ["FORTELLIS_CLIENT_ID", "FORTELLIS_CLIENT_SECRET", "FORTELLIS_SUBSCRIPTION_ID", "FORTELLIS_TOKEN_URL"],
    "Set Fortellis credentials only when you are enabling dealer integrations."
  );

  requireCompleteIntegrationEnv(
    "Tekion",
    ["TEKION_CLIENT_ID", "TEKION_CLIENT_SECRET", "TEKION_SUBSCRIPTION_ID", "TEKION_TOKEN_URL"],
    "Set Tekion APC credentials only when you are enabling dealer integrations."
  );

  requireCompleteIntegrationEnv(
    "Reynolds",
    ["REYNOLDS_CLIENT_ID", "REYNOLDS_CLIENT_SECRET", "REYNOLDS_SUBSCRIPTION_ID", "REYNOLDS_TOKEN_URL"],
    "Set Reynolds RCI credentials only when you are enabling dealer integrations."
  );

  requireCompleteIntegrationEnv(
    "Dealertrack",
    ["DEALERTRACK_CLIENT_ID", "DEALERTRACK_CLIENT_SECRET", "DEALERTRACK_SUBSCRIPTION_ID", "DEALERTRACK_TOKEN_URL"],
    "Set Dealertrack OpenTrack credentials only when you are enabling F&I integrations."
  );

  const cdkSandbox = process.env.CDK_SANDBOX;
  if (cdkSandbox && cdkSandbox !== "true" && cdkSandbox !== "false") {
    console.error("[production] CDK_SANDBOX must be 'true' or 'false' when provided.");
    process.exit(1);
  }
}
