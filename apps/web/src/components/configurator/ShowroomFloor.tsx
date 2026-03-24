"use client";

import { MeshReflectorMaterial } from "@react-three/drei";

type ShowroomFloorProps = {
  enabled: boolean;
};

/**
 * Dark polished floor with soft reflection — auction-house / studio feel.
 */
export function ShowroomFloor({ enabled }: ShowroomFloorProps) {
  if (!enabled) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
      <planeGeometry args={[48, 48]} />
      <MeshReflectorMaterial
        blur={[280, 120]}
        resolution={512}
        mixBlur={0.85}
        mixStrength={0.35}
        roughness={0.95}
        depthScale={0.55}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.25}
        color="#070809"
        metalness={0.55}
        mirror={0.42}
      />
    </mesh>
  );
}
