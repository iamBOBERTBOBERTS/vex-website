"use client";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import { VehicleScene, getCanvasCamera, type CameraPreset } from "@/components/configurator/VehicleScene";
import { configureVexRenderer } from "@/components/configurator/rendererSetup";
import { preloadVehicleGltf } from "@/components/configurator/GltfVehicle";
import { DEFAULT_PUBLIC_VEHICLE_GLB } from "@/lib/vehicle3d/defaults";
import type { FinishId } from "@/components/configurator/vehicleFinish";
import styles from "./InventoryVehicleViewer.module.css";

type Props = {
  modelGlbUrl: string | null;
  modelSource: string | null;
  title: string;
};

const PRESETS: { id: CameraPreset; label: string }[] = [
  { id: "threeQuarter", label: "3/4" },
  { id: "side", label: "Side" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className={styles.loader}>{Math.round(progress)}%</div>
    </Html>
  );
}

/**
 * PBR glTF viewer for inventory: uses listing `modelGlbUrl` when set, otherwise a demo vehicle mesh.
 */
export function InventoryVehicleViewer({ modelGlbUrl, modelSource, title }: Props) {
  const headingId = useId();
  const glb = modelGlbUrl?.trim() || DEFAULT_PUBLIC_VEHICLE_GLB;
  const isListingAsset = Boolean(modelGlbUrl?.trim());
  const cam = getCanvasCamera(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);

  const onPresetApplied = useCallback(() => {
    setCameraPreset(null);
  }, []);

  useEffect(() => {
    preloadVehicleGltf(glb);
  }, [glb]);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.head}>
        <h2 className={styles.h2} id={headingId}>
          3D inspection
        </h2>
        <p className={styles.caption}>
          {isListingAsset
            ? `PBR model · ${
                modelSource === "GENERATED_FROM_PHOTOS"
                  ? "Reconstructed from listing photos (pipeline)"
                  : modelSource === "UPLOAD"
                    ? "Uploaded mesh"
                    : "Library / scan"
              }`
            : "Demo mesh — set modelGlbUrl on this listing (or run photo→3D generation) to show this exact vehicle"}
        </p>
      </div>
      <div className={styles.toolbar} role="group" aria-label="Camera angle">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={styles.viewBtn} onClick={() => setCameraPreset(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className={styles.canvasWrap}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 120 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => configureVexRenderer(gl)}
        >
          <Suspense fallback={<Loader />}>
            <VehicleScene
              finishId={"rosso" as FinishId}
              edition="Launch"
              powertrain="V12"
              gltfUrl={glb}
              cameraTarget={[0, 0, 0]}
              cameraPreset={cameraPreset}
              onPresetApplied={onPresetApplied}
              autoRotate={false}
              compact={false}
              premium
            />
          </Suspense>
        </Canvas>
        <p className={styles.hint}>Drag to orbit · Scroll to zoom · {title}</p>
      </div>
    </section>
  );
}
