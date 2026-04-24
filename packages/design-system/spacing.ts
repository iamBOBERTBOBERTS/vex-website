export const spacing = {
  pageX: "clamp(1.25rem, 3vw, 2rem)",
  sectionY: "clamp(5rem, 9vw, 8rem)",
  sectionYCompact: "clamp(3.5rem, 6vw, 5rem)",
  stackXs: "0.5rem",
  stackSm: "0.875rem",
  stackMd: "1.25rem",
  stackLg: "2rem",
  stackXl: "3rem",
  maxShell: "80rem",
  readable: "42rem",
} as const;

export type VexSpacingToken = keyof typeof spacing;
