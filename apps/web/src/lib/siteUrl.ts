let hasWarnedMissingSiteUrl = false;

/**
 * Canonical site origin for metadata (Open Graph, Twitter cards).
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://vex.example.com).
 */
export function getSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (raw) {
    const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(withProtocol);
  }
  if (process.env.NODE_ENV === "production") {
    if (!hasWarnedMissingSiteUrl) {
      hasWarnedMissingSiteUrl = true;
      // eslint-disable-next-line no-console
      console.warn(
        "[PRODUCTION WARNING] NEXT_PUBLIC_SITE_URL is not set. Metadata URLs may resolve incorrectly."
      );
    }
    return new URL("https://example.invalid");
  }
  return new URL("http://localhost:3000");
}
