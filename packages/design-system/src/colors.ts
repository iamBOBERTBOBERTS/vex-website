export const colors = {
  ink: "#050506",
  obsidian: "#070707",
  charcoal: "#101010",
  panel: "rgba(17, 17, 17, 0.72)",
  panelStrong: "rgba(24, 24, 24, 0.82)",
  white: "#fff8eb",
  text: "#f6f1e8",
  textSoft: "#d8d0c2",
  textMuted: "#a99f8d",
  gold: "#d4af37",
  goldSoft: "#f1d38a",
  goldDeep: "#8a6b2e",
  steel: "#8fd8ff",
  signal: "#c7f0d8",
} as const;

export type VexColorToken = keyof typeof colors;
