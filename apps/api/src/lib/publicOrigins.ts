function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function resolveConfiguredOrigin(envKey: "PUBLIC_WEB_URL" | "PUBLIC_CRM_URL", devFallback: string): string {
  const configured = process.env[envKey]?.trim();
  if (configured) {
    return trimTrailingSlash(configured);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envKey} must be configured in production.`);
  }

  return devFallback;
}

export function getPublicWebOrigin() {
  return resolveConfiguredOrigin("PUBLIC_WEB_URL", "http://localhost:3000");
}

export function getPublicCrmOrigin() {
  return resolveConfiguredOrigin("PUBLIC_CRM_URL", "http://localhost:3002");
}

export function resolveBrowserOrPublicWebOrigin(originHeader?: string | null) {
  if (originHeader?.trim()) {
    return trimTrailingSlash(originHeader);
  }

  return getPublicWebOrigin();
}
