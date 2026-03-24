"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import type { ElementRef, MutableRefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { EditionId, FinishId, PowertrainId } from "./vehicleFinish";
import { FINISH_PHYSICAL } from "./vehicleFinish";
import { GltfVehicle } from "./GltfVehicle";
import { ShowroomFloor } from "./ShowroomFloor";
import { ShowroomFog } from "./ShowroomFog";
import { ShowroomPostFX } from "./ShowroomPostFX";

export type CameraPreset = "threeQuarter" | "side" | "front" | "top";

/** Default canvas + preset positions: full viewer is tighter (larger car in frame). */
export function getCanvasCamera(compact: boolean | undefined): {
  position: [number, number, number];
  fov: number;
} {
  if (compact) {
    return { position: [4.6, 1.85, 5.2], fov: 40 };
  }
  return { position: [3.65, 1.45, 4.1], fov: 36 };
}

const PRESET_COMPACT: Record<CameraPreset, [number, number, number]> = {
  threeQuarter: [4.6, 1.85, 5.2],
  side: [7.2, 1.35, 0.15],
  front: [0.1, 1.55, 6.8],
  top: [0.2, 8.4, 0.35],
};

const PRESET_FULL: Record<CameraPreset, [number, number, number]> = {
  threeQuarter: [3.65, 1.45, 4.1],
  side: [5.95, 1.12, 0.12],
  front: [0.08, 1.28, 5.65],
  top: [0.12, 6.75, 0.28],
};

type SportsCarProps = {
  finishId: FinishId;
  edition: EditionId;
  powertrain: PowertrainId;
};

function SportsCar({ finishId, edition, powertrain }: SportsCarProps) {
  const mat = FINISH_PHYSICAL[finishId];
  const color = useMemo(() => new THREE.Color(mat.hex), [mat.hex]);
  const showSpoiler = edition === "Track";
  const hybridStripe = powertrain === "Hybrid";

  return (
    <group position={[0, 0, 0]}>
      <RoundedBox
        args={[2.35, 0.48, 1.05]}
        radius={0.09}
        smoothness={5}
        position={[0, 0.38, 0.02]}
        castShadow
      >
        <meshPhysicalMaterial
          color={color}
          roughness={mat.roughness}
          metalness={mat.metalness}
          clearcoat={mat.clearcoat}
          clearcoatRoughness={0.12}
          envMapIntensity={1.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.15, 0.32, 0.78]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.72, -0.08]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#050608"
          roughness={0.08}
          metalness={0.25}
          transmission={0.72}
          thickness={0.4}
          transparent
          opacity={0.92}
          envMapIntensity={1.55}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.55, 0.2, 0.88]}
        radius={0.05}
        smoothness={3}
        position={[1.28, 0.36, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color={color}
          roughness={mat.roughness + 0.04}
          metalness={mat.metalness}
          clearcoat={mat.clearcoat}
          clearcoatRoughness={0.14}
        />
      </RoundedBox>

      {showSpoiler && (
        <RoundedBox
          args={[0.95, 0.06, 0.18]}
          radius={0.02}
          smoothness={2}
          position={[-1.22, 0.78, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color={color}
            roughness={0.35}
            metalness={0.6}
            clearcoat={0.9}
          />
        </RoundedBox>
      )}

      {hybridStripe && (
        <mesh position={[0, 0.42, 0.54]} rotation={[0, 0, 0]}>
          <planeGeometry args={[1.6, 0.04]} />
          <meshStandardMaterial
            color="#0d3d32"
            emissive="#1dd4b0"
            emissiveIntensity={0.55}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      <mesh position={[1.32, 0.32, 0.28]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.22, 0.06]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff8e8"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>

      {[
        [-0.78, 0.18, 0.46],
        [-0.78, 0.18, -0.46],
        [0.78, 0.18, 0.46],
        [0.78, 0.18, -0.46],
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.22, 28]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.85} metalness={0.15} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.23, 24]} />
            <meshStandardMaterial
              color="#1c1c1c"
              metalness={0.92}
              roughness={0.28}
              envMapIntensity={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

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

    camera.position.copy(pos);
    controls.target.copy(target);
    controls.update();
    onPresetApplied();
  }, [preset, camera, controlsRef, onPresetApplied, isCompact, orbitTarget]);

  return null;
}

export type VehicleSceneProps = SportsCarProps & {
  cameraPreset: CameraPreset | null;
  onPresetApplied: () => void;
  autoRotate: boolean;
  /** When true, gently rotate the car when user is not dragging (handled by orbit autoRotate instead — we use orbit autoRotate) */
  compact?: boolean;
  /** Load a real glTF/GLB (listing asset or library). When set, procedural concept car is hidden. */
  gltfUrl?: string | null;
  /** Orbit pivot (glTF is usually centered at origin). */
  cameraTarget?: [number, number, number];
  /** Premium showroom: filmic lighting stack, fog, optional post-FX & reflective floor. Defaults to `!compact`. */
  premium?: boolean;
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
}: VehicleSceneProps) {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  const reducedMotion = usePrefersReducedMotion();
  const useGltf = Boolean(gltfUrl?.length);
  const orbitTarget: [number, number, number] =
    cameraTargetProp ?? (useGltf ? [0, 0, 0] : [0, 0.38, 0]);
  const premium = premiumProp ?? !compact;
  const effectsOn = premium && !reducedMotion;
  const showReflectorFloor = premium && !reducedMotion && !compact;
  const showGrid = !compact && !showReflectorFloor;

  useLayoutEffect(() => {
    const L = keyLightRef.current;
    if (L?.shadow) L.shadow.bias = -0.00025;
  }, []);

  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <ambientLight intensity={useGltf ? 0.22 : 0.28} />
      <hemisphereLight intensity={0.18} color="#c4b8a0" groundColor="#080604" />
      <spotLight
        ref={keyLightRef}
        position={[6, 9, 4]}
        angle={0.42}
        penumbra={0.85}
        intensity={useGltf ? 1.65 : 1.45}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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

      <Environment preset={useGltf ? "warehouse" : compact ? "studio" : "city"} environmentIntensity={useGltf ? 1.05 : 0.9} />

      {useGltf && gltfUrl ? (
        <GltfVehicle url={gltfUrl} />
      ) : (
        <group scale={compact ? 1 : 1.14}>
          <SportsCar finishId={finishId} edition={edition} powertrain={powertrain} />
        </group>
      )}

      <ShowroomFog enabled={effectsOn} />
      <ShowroomFloor enabled={showReflectorFloor} />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={showReflectorFloor ? 0.42 : useGltf ? 0.62 : 0.55}
        scale={compact ? 14 : useGltf ? 20 : 17}
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
        minDistance={compact ? 4 : useGltf ? 1.75 : 2.65}
        maxDistance={compact ? 14 : 15}
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
