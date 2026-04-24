/**
 * API Base URL Configuration
 * 
 * PRODUCTION REQUIREMENTS:
 * - Set NEXT_PUBLIC_API_URL in Netlify/Vercel environment variables
 * - Do NOT rely on fallback URLs - they may be stale
 * 
 * Expected production values:
 * - Netlify: Set NEXT_PUBLIC_API_URL to your Railway/Fly backend URL
 * - Vercel: Set NEXT_PUBLIC_API_URL in Vercel dashboard
 */

// NOTE: Removed stale fallback URL. Production MUST set NEXT_PUBLIC_API_URL.
// Previous fallback "https://2dycb8hl.up.railway.app" is no longer valid.

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

/**
 * Get the public API base URL for frontend API calls.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_API_URL (explicitly configured)
 * 2. Warn in production if not configured (but don't break SSG)
 * 3. localhost for development
 * 
 * Note: Returns a safe default in production build to avoid breaking SSG/SSG,
 * but logs a warning. Runtime calls will show the error.
 */
export function getPublicApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) {
    return trimTrailingSlash(configured);
  }
  
  // In production build, return safe default to avoid breaking SSG
  // Runtime will show warning via console
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "[PRODUCTION WARNING] NEXT_PUBLIC_API_URL is not set. " +
      "API calls may fail. Please configure NEXT_PUBLIC_API_URL in environment variables."
    );
    // Return empty string - callers should check isApiConfiguredForProduction() first
    return "";
  }
  
  // Development fallback
  return "http://localhost:3001";
}

export function hasConfiguredPublicApiBase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

export function getInternalApiBase(): string {
  return trimTrailingSlash(process.env.INTERNAL_API_URL || getPublicApiBase());
}

/**
 * Check if the API is configured for production use.
 * Returns true only if NEXT_PUBLIC_API_URL is explicitly set.
 */
export function isApiConfiguredForProduction(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}
