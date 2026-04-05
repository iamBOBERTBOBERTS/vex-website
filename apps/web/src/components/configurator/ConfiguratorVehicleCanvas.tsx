"use client";

import { Suspense, useCallback, useEffect, useId, useState } from "react";
import { probeWebGPU } from "@vex/3d-configurator";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import { VehicleScene, getCanvasCamera, type CameraPreset } from "./VehicleScene";
import { configureVexRenderer } from "./rendererSetup";
import type { EditionId, FinishId, PowertrainId } from "./vehicleFinish";
import { StaticVehicleFallback } from "./StaticVehicleFallback";
import { useAdaptiveEffects } from "@/hooks/useAdaptiveEffects";
import { useWebglEligible } from "@/hooks/useWebglEligible";
import styles from "./ConfiguratorVehicleCanvas.module.css";
import fallbackStyles from "./StaticVehicleFallback.module.css";

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
  /** Override default premium (`!compact`). Use true on hero for fog + post-FX. */
  premium?: boolean;
  /** Subtle floor grid when `compact` (hero strip). */
  compactGrid?: boolean;
  /** External camera preset control (hero HUD). */
  cameraPresetOverride?: CameraPreset | null;
  /** External auto-rotate control (hero HUD). */
  autoRotateOverride?: boolean;
  /** External auto-rotate setter (hero HUD). */
  onAutoRotateChange?: (next: boolean) => void;
  /** External camera preset setter (hero HUD). */
  onCameraPresetChange?: (next: CameraPreset | null) => void;
  /** Callback when a preset transition completes under external control. */
  onCameraPresetApplied?: () => void;
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
  premium,
  compactGrid = false,
  cameraPresetOverride,
  autoRotateOverride,
  onAutoRotateChange,
  onCameraPresetChange,
  onCameraPresetApplied,
}: ConfiguratorVehicleCanvasProps) {
  const [cameraPreset, setCameraPreset] = useState<CameraPreset | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const hintId = useId();
  const webglEligible = useWebglEligible();
  const [webgpuCapable, setWebgpuCapable] = useState<boolean | null>(null);
  const { maxDpr } = useAdaptiveEffects();

  useEffect(() => {
    let cancelled = false;
    void probeWebGPU().then((ok) => {
      if (!cancelled) setWebgpuCapable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const cam = getCanvasCamera(compact);
  const controlledPreset = cameraPresetOverride !== undefined;
  const controlledRotate = autoRotateOverride !== undefined;
  const resolvedPreset = controlledPreset ? cameraPresetOverride : cameraPreset;
  const resolvedAutoRotate = controlledRotate ? Boolean(autoRotateOverride) : autoRotate;

  const onPresetApplied = useCallback(() => {
    if (controlledPreset) {
      onCameraPresetApplied?.();
    } else {
      setCameraPreset(null);
    }
  }, [controlledPreset, onCameraPresetApplied]);

  const handlePreset = (id: CameraPreset) => {
    if (controlledPreset) onCameraPresetChange?.(id);
    else setCameraPreset(id);
  };

  return (
    <div
      className={`${compact ? styles.wrapCompact : styles.wrap} ${embed ? styles.wrapEmbed : ""}`}
      role="region"
      aria-label="3D vehicle preview"
      aria-describedby={hintId}
      data-vex-webgpu={webgpuCapable === null ? undefined : webgpuCapable ? "1" : "0"}
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
              className={`${styles.toggle} ${resolvedAutoRotate ? styles.toggleOn : ""}`}
              onClick={() => {
                const next = !resolvedAutoRotate;
                if (controlledRotate) onAutoRotateChange?.(next);
                else setAutoRotate(next);
              }}
              aria-pressed={resolvedAutoRotate}
            >
              Auto rotate
            </button>
          </div>
        </div>
      )}

      <div className={`${styles.canvasShell} ${embed ? styles.canvasShellEmbed : ""}`}>
        {webglEligible === null ? (
          <div className={fallbackStyles.loadingShell} aria-busy="true">
            Preparing preview…
          </div>
        ) : webglEligible === false ? (
          <StaticVehicleFallback finishId={finishId} />
        ) : (
          <Canvas
            className={styles.canvas}
            shadows
            dpr={[1, maxDpr]}
            camera={{ position: cam.position, fov: cam.fov, near: 0.1, far: 80 }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            onCreated={({ gl }) => configureVexRenderer(gl)}
          >
            <Suspense fallback={<CanvasLoader />}>
              <VehicleScene
                finishId={finishId}
                edition={edition}
                powertrain={powertrain}
                cameraPreset={resolvedPreset}
                onPresetApplied={onPresetApplied}
                autoRotate={resolvedAutoRotate}
                compact={compact}
                premium={premium}
                compactGrid={compactGrid}
              />
            </Suspense>
          </Canvas>
        )}
        <p id={hintId} className={styles.hint}>
          {webglEligible === null
            ? "Loading 3D preview…"
            : webglEligible === false
              ? "Static preview — reduced motion or graphics limits 3D"
              : `Drag to orbit · Scroll to zoom${resolvedAutoRotate ? " · Auto-rotating" : ""}`}
        </p>
      </div>
    </div>
  );
}
