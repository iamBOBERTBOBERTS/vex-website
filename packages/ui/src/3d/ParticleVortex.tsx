"use client";

import type { MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { resolveParticlePointBudget } from "@vex/3d-configurator";

/** Buffer size = perf cap; `resolveParticlePointBudget()` + `setDrawRange` implement LOD. */
const VEX_POINTS = 512;

function fillVexClusters(target: Float32Array, n: number) {
  let i = 0;
  const pushCluster = (cx: number, spread: number, count: number) => {
    for (let k = 0; k < count && i < n; k++) {
      target[i * 3] = cx + (Math.random() - 0.5) * spread;
      target[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
      target[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6;
      i++;
    }
  };
  const a = Math.round((70 / 180) * n);
  const b = Math.round((55 / 180) * n);
  const c = Math.round((55 / 180) * n);
  pushCluster(-1.35, 0.85, a);
  pushCluster(0, 0.75, b);
  pushCluster(1.25, 0.9, c);
  while (i < n) {
    target[i * 3] = (Math.random() - 0.5) * 4;
    target[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
    target[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    i++;
  }
}

function fillScatterSphere(scatter: Float32Array, n: number) {
  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const u = Math.random() * 2 - 1;
    const r = 1.9 + Math.random() * 2.4;
    scatter[i * 3] = Math.sqrt(1 - u * u) * Math.cos(t) * r;
    scatter[i * 3 + 1] = u * 1.35 + (Math.random() - 0.5) * 0.4;
    scatter[i * 3 + 2] = Math.sqrt(1 - u * u) * Math.sin(t) * r * 0.65;
  }
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Stylized “VEX” particle field — optional load formation from scatter → logo clusters. */
export function ParticleVortex({
  intensity = 1,
  scrollY,
  accentColor = "#e8d5a4",
  formationProgress,
}: {
  intensity?: number;
  scrollY?: MutableRefObject<number>;
  /** Tenant accent (`--accent-bright`) for white-label energy field */
  accentColor?: string;
  /** 0 = scattered, 1 = settled into VEX clusters; omit for static layout */
  formationProgress?: MutableRefObject<number>;
}) {
  const ref = useRef<THREE.Points>(null);
  const internalFp = useRef(1);
  const fpRef = formationProgress ?? internalFp;

  const { geometry, scatter, target } = useMemo(() => {
    const targetArr = new Float32Array(VEX_POINTS * 3);
    fillVexClusters(targetArr, VEX_POINTS);
    const scatterArr = new Float32Array(VEX_POINTS * 3);
    fillScatterSphere(scatterArr, VEX_POINTS);
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(VEX_POINTS * 3);
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry: g, scatter: scatterArr, target: targetArr };
  }, []);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const n = resolveParticlePointBudget();
    geometry.setDrawRange(0, n);
    const attr = geometry.attributes.position;
    const pos = attr.array as Float32Array;
    const fp = smoothstep(fpRef.current);
    const limit = n * 3;
    for (let i = 0; i < limit; i++) {
      pos[i] = scatter[i] + (target[i] - scatter[i]) * fp;
    }
    attr.needsUpdate = true;

    const t = state.clock.elapsedTime;
    const sy = scrollY?.current ?? 0;
    const px = state.pointer.x;
    const py = state.pointer.y;
    pts.rotation.y = t * 0.11 * intensity + sy * 0.00025 + px * 0.05 * intensity;
    pts.rotation.x = Math.sin(t * 0.14) * 0.06 * intensity + py * 0.035 * intensity;
    pts.rotation.z = px * 0.025 * intensity;
    pts.position.y = Math.sin(t * 0.2) * 0.08 * intensity;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        transparent
        opacity={0.34 * intensity}
        size={0.028}
        sizeAttenuation
        color={accentColor}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
