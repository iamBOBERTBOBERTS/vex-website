/**
 * VEX Digital Presence v2 — luxury surface tokens (maps to CSS vars on web/CRM).
 * Canonical “crown jewel” palette: obsidian + violet–gold neon (see elite v2 plan doc).
 */
export const vexLuxuryTokens = {
  /** Master directive base */
  obsidianVault: "#0A0A0A",
  electricViolet: "#A020F0",
  metallicGoldFoil: "#FFD700",
  voidBlack: "#050508",
  voidElevated: "#0b0d12",
  liquidMetal: "linear-gradient(135deg, rgba(212,184,106,0.95) 0%, rgba(180,190,210,0.55) 42%, rgba(201,169,98,0.88) 100%)",
  liquidMetalBorder: "rgba(212, 184, 106, 0.45)",
  electricEmerald: "#00c9a7",
  electricRuby: "#ff4d6d",
  electricSapphire: "#4d7cff",
  volumetricShadow: "0 28px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
  glassBloom: "0 0 42px rgba(97, 193, 255, 0.12), 0 0 64px rgba(201, 169, 98, 0.08)",
  neonBloomEmerald: "0 0 24px rgba(0, 201, 167, 0.35)",
  neonBloomGold: "0 0 32px rgba(201, 169, 98, 0.28)",
  surfaceGlassLuxury: "linear-gradient(165deg, rgba(14,18,28,0.82), rgba(6,8,14,0.72))",
} as const;

export type VexLuxuryTokenKey = keyof typeof vexLuxuryTokens;
