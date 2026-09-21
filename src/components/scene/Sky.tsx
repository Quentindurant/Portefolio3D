'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide } from 'three';
import { createSkyMaterial } from './shaders/materials';

/** Dôme de nuit : dégradé, halo de lune et poussière d'étoiles, sans texture. */
export function Sky() {
  const material = useMemo(() => createSkyMaterial(), []);
  const time = useRef(0);

  useFrame((_state, delta) => {
    time.current += delta;
    material.uniforms.uTime.value = time.current;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[320, 32, 24]} />
      <primitive object={material} attach="material" side={BackSide} />
    </mesh>
  );
}
