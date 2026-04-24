import { motion } from "@vex/design-system";

export const motionTokens = {
  duration: {
    fast: motion.durationFast,
    base: motion.durationBase,
    slow: motion.durationSlow,
    cinematic: motion.durationCinematic,
  },
  transform: {
    revealY: motion.revealDistance,
    liftY: -4,
    parallaxSubtle: motion.parallaxSubtle,
    parallaxMedium: motion.parallaxMedium,
  },
} as const;
