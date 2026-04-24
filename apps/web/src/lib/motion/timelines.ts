import { easing } from "./easing";
import { motionTokens } from "./motionTokens";

export const timelines = {
  sectionReveal: {
    duration: motionTokens.duration.slow,
    ease: easing.luxuryOut,
    y: motionTokens.transform.revealY,
  },
  entryFade: {
    duration: motionTokens.duration.cinematic,
    ease: easing.cinematicInOut,
  },
} as const;
