'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { MeshStandardMaterial } from 'three';
import { createTerrainMaterial } from './shaders/materials';

interface TerrainProps {
  /** Longueur du couloir à couvrir, en unités monde. */
  length: number;
}

/**
 * Sol et versants de la vallée.
 * Le relief est calculé dans le shader de sommets : une seule géométrie plane
 * suffit, et le sentier reste praticable au centre.
 */
export function Terrain({ length }: TerrainProps) {
  const material = useMemo<MeshStandardMaterial>(() => createTerrainMaterial(), []);
  const elapsed = useRef(0);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    const uniforms = material.userData.uniforms as { uTime: { value: number } } | undefined;
    if (uniforms) uniforms.uTime.value = elapsed.current;
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -2.6, -length / 2 + 20]}
      frustumCulled={false}
    >
      <planeGeometry args={[220, length + 120, 180, 220]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
