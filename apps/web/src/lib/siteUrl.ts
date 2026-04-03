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
  return new URL("http://localhost:3000");
}
