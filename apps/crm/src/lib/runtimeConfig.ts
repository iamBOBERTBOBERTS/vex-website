function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

const warnedKeys = new Set<string>();

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function readConfiguredUrl(value: string | undefined) {
  if (!value) return null;
  return trimTrailingSlash(value);
}

function warnOnce(key: string, message: string) {
  if (warnedKeys.has(key)) return;
  warnedKeys.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

export function getCrmApiBase(): string {
  const configured = readConfiguredUrl(process.env.NEXT_PUBLIC_API_URL);
  if (configured) {
    return configured;
  }

  if (isProductionRuntime()) {
    warnOnce(
      "crm-api-base",
      "[PRODUCTION WARNING] NEXT_PUBLIC_API_URL is not set for CRM. API requests may fail until it is configured."
    );
    return "";
  }

  return "http://localhost:3001";
}

export function getCrmWebBase(): string {
  const configured = readConfiguredUrl(process.env.NEXT_PUBLIC_WEB_URL);
  if (configured) {
    return configured;
  }

  if (isProductionRuntime()) {
    if (typeof window !== "undefined" && window.location.origin) {
      return trimTrailingSlash(window.location.origin);
    }

    warnOnce(
      "crm-web-base",
      "[PRODUCTION WARNING] NEXT_PUBLIC_WEB_URL is not set for CRM. Public website links may resolve incorrectly."
    );
    return "";
  }

  return "http://localhost:3000";
}

export function getCrmApiHealthUrl(): string {
  const apiBase = getCrmApiBase();
  return apiBase ? `${apiBase}/health` : "";
}
