export type FinishId = "rosso" | "nero" | "oro";

export type EditionId = "Launch" | "Heritage" | "Track";

export type PowertrainId = "V12" | "Twin-turbo V8" | "Hybrid";

/** Physical material tuning per paint — drives WebGL body appearance */
export const FINISH_PHYSICAL: Record<
  FinishId,
  { hex: string; roughness: number; metalness: number; clearcoat: number }
> = {
  rosso: { hex: "#c41e3a", roughness: 0.22, metalness: 0.38, clearcoat: 1 },
  nero: { hex: "#1a1a1a", roughness: 0.48, metalness: 0.58, clearcoat: 0.85 },
  oro: { hex: "#c9a227", roughness: 0.16, metalness: 0.78, clearcoat: 1 },
};

/** CSS gradient for glow / fallback — keep in sync with marketing section */
export const FINISH_CSS_GRADIENT: Record<FinishId, string> = {
  rosso: "linear-gradient(135deg, #8b0000, #c41e3a)",
  nero: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
  oro: "linear-gradient(135deg, #c9a227, #8b6914)",
};

export const FINISH_SWATCHES: { id: FinishId; label: string }[] = [
  { id: "rosso", label: "Rosso corsa" },
  { id: "nero", label: "Nero metallic" },
  { id: "oro", label: "Oro champagne" },
];

/** Map builder / API paint option copy to showroom finish (3D + pricing selection). */
export function paintOptionNameToFinishId(name: string): FinishId {
  const lower = name.toLowerCase();
  if (lower.includes("nero") || lower.includes("black") || lower.includes("obsidian")) return "nero";
  if (lower.includes("oro") || lower.includes("gold") || lower.includes("champagne")) return "oro";
  return "rosso";
}
