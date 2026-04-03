"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
} from "@react-three/drei";
import type { ElementRef, MutableRefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { EditionId, FinishId, PowertrainId } from "./vehicleFinish";
import { GltfVehicle } from "./GltfVehicle";
import { DEFAULT_PUBLIC_VEHICLE_GLB } from "@/lib/vehicle3d/defaults";
import { ShowroomFloor } from "./ShowroomFloor";
import { ShowroomFog } from "./ShowroomFog";
import { ShowroomPostFX } from "./ShowroomPostFX";

const EDITION_ENV_INTENSITY: Record<EditionId, number> = {
  Launch: 1.22,
  Heritage: 1.1,
  Track: 1.3,
};

export type CameraPreset = "threeQuarter" | "side" | "front" | "top";

/** Default canvas + preset positions: full viewer is tighter (larger car in frame). */
export function getCanvasCamera(compact: boolean | undefined): {
  position: [number, number, number];
  fov: number;
} {
  if (compact) {
    return { position: [3.15, 1.42, 3.55], fov: 42 };
  }
  return { position: [3.05, 1.22, 3.38], fov: 38 };
}

const PRESET_COMPACT: Record<CameraPreset, [number, number, number]> = {
  threeQuarter: [3.15, 1.42, 3.55],
  side: [5.4, 1.2, 0.12],
  front: [0.08, 1.28, 5.1],
  top: [0.15, 6.2, 0.28],
};

const PRESET_FULL: Record<CameraPreset, [number, number, number]> = {
  threeQuarter: [3.05, 1.22, 3.38],
  side: [5.15, 1.05, 0.1],
  front: [0.06, 1.18, 4.85],
  top: [0.12, 6.0, 0.25],
};

function CameraRig({
  controlsRef,
  preset,
  onPresetApplied,
  compact,
  orbitTarget,
}: {
  controlsRef: MutableRefObject<ElementRef<typeof OrbitControls> | null>;
  preset: CameraPreset | null;
  onPresetApplied: () => void;
  compact: boolean | undefined;
  orbitTarget: [number, number, number];
}) {
  const { camera } = useThree();
  const isCompact = compact === true;

  useEffect(() => {
    const controls = controlsRef.current;
    if (!preset || !controls) return;

    const target = new THREE.Vector3(orbitTarget[0], orbitTarget[1], orbitTarget[2]);
    const table = isCompact ? PRESET_COMPACT : PRESET_FULL;
    const [x, y, z] = table[preset];
    const pos = new THREE.Vector3(x, y, z);

    let cancelled = false;
    import("gsap")
      .then(({ gsap }) => {
        const from = camera.position.clone();
        const to = pos.clone();
        const targetFrom = controls.target.clone();
        const targetTo = target.clone();
        const state = { t: 0 };
        gsap.to(state, {
          t: 1,
          duration: 0.85,
          ease: "power3.out",
          onUpdate: () => {
            camera.position.lerpVectors(from, to, state.t);
            controls.target.lerpVectors(targetFrom, targetTo, state.t);
            controls.update();
          },
          onComplete: () => {
            if (!cancelled) onPresetApplied();
          },
        });
      })
      .catch(() => {
        camera.position.copy(pos);
        controls.target.copy(target);
        controls.update();
        onPresetApplied();
      });
    return () => {
      cancelled = true;
    };
  }, [preset, camera, controlsRef, onPresetApplied, isCompact, orbitTarget]);

  return null;
}

export type VehicleSceneProps = {
  finishId: FinishId;
  edition: EditionId;
  powertrain: PowertrainId;
  cameraPreset: CameraPreset | null;
  onPresetApplied: () => void;
  autoRotate: boolean;
  compact?: boolean;
  gltfUrl?: string | null;
  cameraTarget?: [number, number, number];
  premium?: boolean;
  compactGrid?: boolean;
};

export function VehicleScene({
  finishId,
  edition,
  powertrain,
  cameraPreset,
  onPresetApplied,
  autoRotate,
  compact,
  gltfUrl,
  cameraTarget: cameraTargetProp,
  premium: premiumProp,
  compactGrid = false,
}: VehicleSceneProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const reducedMotion = usePrefersReducedMotion();
  const orbitTarget: [number, number, number] =
    cameraTargetProp ?? [0, 0, 0];
  const premium = premiumProp ?? !compact;
  const effectsOn = premium && !reducedMotion;
  const showReflectorFloor = premium && !reducedMotion && !compact;
  const showGrid = !showReflectorFloor && (!compact || compactGrid);

  useLayoutEffect(() => {
    const L = keyLightRef.current;
    if (L?.shadow) L.shadow.bias = -0.00025;
  }, []);

  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <ambientLight intensity={0.22} />
      <hemisphereLight intensity={0.18} color="#c4b8a0" groundColor="#080604" />
      <spotLight
        ref={keyLightRef}
        position={[6, 9, 4]}
        angle={0.42}
        penumbra={0.85}
        intensity={1.65}
        castShadow
        shadow-mapSize-width={3072}
        shadow-mapSize-height={3072}
      />
      <spotLight position={[-5, 4, -3]} angle={0.55} penumbra={1} intensity={0.48} color="#b8a878" />
      <spotLight
        position={[4.5, 5.5, -5.5]}
        angle={0.55}
        penumbra={0.95}
        intensity={0.38}
        color="#d4c4a8"
      />
      <directionalLight position={[-3, 6, 2]} intensity={0.5} color="#e8e4dc" />

      <Environment preset="city" environmentIntensity={EDITION_ENV_INTENSITY[edition]} />

      <GltfVehicle
        url={gltfUrl || DEFAULT_PUBLIC_VEHICLE_GLB}
        finishId={finishId}
        edition={edition}
        powertrain={powertrain}
      />

      <ShowroomFog enabled={effectsOn} />
      <ShowroomFloor enabled={showReflectorFloor} />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={showReflectorFloor ? 0.42 : 0.6}
        scale={compact ? 16 : 20}
        blur={2.4}
        far={9}
        color="#000000"
      />

      {showGrid && (
        <Grid
          position={[0, -0.01, 0]}
          args={[20, 20]}
          cellSize={0.35}
          cellThickness={0.6}
          cellColor="#2a2418"
          sectionSize={3.5}
          sectionThickness={1.1}
          sectionColor="#3d3428"
          fadeDistance={22}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      <ShowroomPostFX enabled={effectsOn} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enablePan={false}
        dampingFactor={0.06}
        minDistance={compact ? 2.35 : 1.18}
        maxDistance={compact ? 14 : 14}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.05}
        maxAzimuthAngle={Infinity}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
        target={orbitTarget}
      />

      <CameraRig
        controlsRef={controlsRef}
        preset={cameraPreset}
        onPresetApplied={onPresetApplied}
        compact={compact}
        orbitTarget={orbitTarget}
      />
    </>
  );
}
