"use client";

import type { CinematicPaintUniforms } from "@vex/cinematic";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { ExplodedRaycastHighlight } from "./ExplodedRaycastHighlight.js";
import { HeroGltfCar } from "./HeroGltfCar.js";
import { MouseFillLight } from "./MouseFillLight.js";
import { SpeedStreaks } from "./SpeedStreaks.js";

export type CinematicCarViewerProps = {
  glbUrl: string;
  className?: string;
  paintMode?: "standard" | "cinematicLuxury";
  cinematicUniforms?: Partial<CinematicPaintUniforms>;
  /** When true with cinematic paint, pointer raycast highlights meshes (exploded-view). */
  explodedInteractive?: boolean;
};

/** Compact orbit viewer for `/configure` and marketplace previews — same PBR path as hero. */
export function CinematicCarViewer({
  glbUrl,
  className,
  paintMode = "cinematicLuxury",
  cinematicUniforms,
  explodedInteractive = false,
}: CinematicCarViewerProps) {
  const interactive = explodedInteractive && paintMode === "cinematicLuxury";
  return (
    <div className={className} style={{ width: "100%", height: "100%", minHeight: 320 }}>
      <Canvas camera={{ position: [3.1, 1.6, 4.2], fov: 42 }} style={{ width: "100%", height: "100%" }}>
        <color attach="background" args={["#050508"]} />
        <ambientLight intensity={0.32} />
        <directionalLight position={[5, 4, 6]} intensity={1.2} color="#e8eeff" />
        <MouseFillLight />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <HeroGltfCar
            url={glbUrl}
            paintMode={paintMode}
            cinematicUniforms={cinematicUniforms}
          />
          <SpeedStreaks />
          {interactive ? <ExplodedRaycastHighlight enabled /> : null}
          <OrbitControls maxPolarAngle={Math.PI / 2.05} minDistance={2.5} maxDistance={9} />
        </Suspense>
      </Canvas>
    </div>
  );
}
