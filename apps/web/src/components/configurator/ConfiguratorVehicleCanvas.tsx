"use client";

import { Suspense, useCallback, useId, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import { VehicleScene, getCanvasCamera, type CameraPreset } from "./VehicleScene";
import { configureVexRenderer } from "./rendererSetup";
import type { EditionId, FinishId, PowertrainId } from "./vehicleFinish";
import styles from "./ConfiguratorVehicleCanvas.module.css";

export type ConfiguratorVehicleCanvasProps = {
  finishId: FinishId;
  edition: EditionId;
  powertrain: PowertrainId;
  /** Smaller footprint, lighter grid, for hero */
  compact?: boolean;
  /** Hide camera / auto-rotate toolbar (hero strip) */
  minimal?: boolean;
  /** Strip outer frame — parent provides border (e.g. hero) */
  embed?: boolean;
};

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className={styles.loading}>{Math.round(progress)}%</div>
    </Html>
  );
}

const PRESETS: { id: CameraPreset; label: string }[] = [
  { id: "threeQuarter", label: "3/4" },
  { id: "side", label: "Side" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
];

export function ConfiguratorVehicleCanvas({
  finishId,
  edition,
  powertrain,
  compact = false,
  minimal = false,
  embed = false,
}: ConfiguratorVehicleCanvasProps) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const hintId = useId();
  const cam = getCanvasCamera(compact);

  const onPresetApplied = useCallback(() => {
    setCameraPreset(null);
  }, []);

  const handlePreset = (id: CameraPreset) => {
    setCameraPreset(id);
  };

  return (
    <div
      className={`${compact ? styles.wrapCompact : styles.wrap} ${embed ? styles.wrapEmbed : ""}`}
      role="region"
      aria-label="3D vehicle preview"
      aria-describedby={hintId}
    >
      {!minimal && (
        <div className={styles.toolbar}>
          <div className={styles.viewRow} role="group" aria-label="Camera">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={styles.viewBtn}
                onClick={() => handlePreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className={styles.toolsRow}>
            <button
              type="button"
              className={`${styles.toggle} ${autoRotate ? styles.toggleOn : ""}`}
              onClick={() => setAutoRotate((v) => !v)}
              aria-pressed={autoRotate}
            >
              Auto rotate
            </button>
          </div>
        </div>
      )}

      <div className={`${styles.canvasShell} ${embed ? styles.canvasShellEmbed : ""}`}>
        <Canvas
          className={styles.canvas}
          shadows
          dpr={[1, 2]}
          camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => configureVexRenderer(gl)}
        >
          <Suspense fallback={<CanvasLoader />}>
            <VehicleScene
              finishId={finishId}
              edition={edition}
              powertrain={powertrain}
              cameraPreset={cameraPreset}
              onPresetApplied={onPresetApplied}
              autoRotate={autoRotate}
              compact={compact}
            />
          </Suspense>
        </Canvas>
        <p id={hintId} className={styles.hint}>
          Drag to orbit · Scroll to zoom
          {autoRotate ? " · Auto-rotating" : ""}
        </p>
      </div>
    </div>
  );
}
