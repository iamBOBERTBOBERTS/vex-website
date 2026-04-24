const DEFAULT_PUBLIC_API_BASE = "https://2dycb8hl.up.railway.app";

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function getPublicApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return trimTrailingSlash(configured);
  if (process.env.NODE_ENV === "production") return DEFAULT_PUBLIC_API_BASE;
  return "http://localhost:3001";
}

export function hasConfiguredPublicApiBase() {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

export function getInternalApiBase() {
  return trimTrailingSlash(process.env.INTERNAL_API_URL || getPublicApiBase());
}
