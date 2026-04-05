"use client";

import { useLayoutEffect } from "react";
import * as THREE from "three";
import { applyCinematicLuxuryPaint } from "../shaders/applyCinematicLuxuryPaint.js";
import type { CinematicLuxuryPaintOptions } from "../shaders/iridescentCarPaint.js";
import { CinematicMouseUniform } from "./CinematicMouseUniform.js";
import { CinematicPaintTimeTicker } from "./CinematicPaintTimeTicker.js";

export type VortexCarMaterialGLSLProps = {
  object: THREE.Object3D;
  options?: CinematicLuxuryPaintOptions;
};

/**
 * Declarative GLSL luxury paint: applies `applyCinematicLuxuryPaint` + time ticker.
 * Same pipeline as hero/configurator `HeroGltfCar` cinematic path.
 */
export function VortexCarMaterialGLSL({ object, options }: VortexCarMaterialGLSLProps) {
  useLayoutEffect(() => {
    applyCinematicLuxuryPaint(object, options);
  }, [object, options]);

  return (
    <>
      <CinematicPaintTimeTicker root={object} />
      <CinematicMouseUniform root={object} />
    </>
  );
}
