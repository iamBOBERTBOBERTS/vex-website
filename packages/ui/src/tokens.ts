export type VexMotionToken = {
  durationFast: number;
  durationBase: number;
  durationSlow: number;
  easeStandard: string;
  easeEmphasis: string;
};

export type VexThemeTokenSet = {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  surfaceGlass: string;
  surfaceStrong: string;
  borderSubtle: string;
  borderStrong: string;
};

export const vexMotionTokens: VexMotionToken = {
  durationFast: 0.2,
  durationBase: 0.45,
  durationSlow: 0.8,
  easeStandard: "cubic-bezier(0.22,1,0.36,1)",
  easeEmphasis: "cubic-bezier(0.16,1,0.3,1)",
};

export const vexThemeTokens: VexThemeTokenSet = {
  radiusSm: "10px",
  radiusMd: "14px",
  radiusLg: "18px",
  surfaceGlass: "rgba(15, 20, 31, 0.68)",
  surfaceStrong: "rgba(17, 25, 37, 0.9)",
  borderSubtle: "rgba(148, 162, 191, 0.16)",
  borderStrong: "rgba(148, 162, 191, 0.32)",
};

/** Enterprise DMS + luxury marketing surfaces (maps to CSS vars where possible). */
export const vexEnterpriseTokens = {
  cockpitGlass: "rgba(12, 16, 26, 0.78)",
  cockpitInset: "rgba(6, 8, 14, 0.55)",
  metallicEdge: "rgba(201, 169, 98, 0.42)",
  metallicEdgeSoft: "rgba(201, 169, 98, 0.18)",
  agentRunning: "rgba(97, 193, 255, 0.22)",
  agentIdle: "rgba(148, 162, 191, 0.12)",
  paymentFiat: "rgba(230, 236, 245, 0.14)",
  paymentCrypto: "rgba(201, 169, 98, 0.12)",
} as const;

export type VexEnterpriseTokenKey = keyof typeof vexEnterpriseTokens;
