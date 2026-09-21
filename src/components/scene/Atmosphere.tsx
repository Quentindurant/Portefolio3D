'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  type BufferAttribute,
  type CatmullRomCurve3,
  type Points,
  Vector3,
} from 'three';
import { createRandom, randomBetween } from '@/lib/random';
import { PALETTE } from '@/lib/theme';
import { createMistMaterial, createShaftMaterial } from './shaders/materials';
import { motionStore } from '@/lib/motion-store';

interface AtmosphereProps {
  curve: CatmullRomCurve3;
  mistPanels?: number;
  fireflies?: number;
}

/**
 * Brume, rayons de lune et lucioles.
 * C'est cette couche qui donne la perspective atmosphérique : les masses
 * lointaines se fondent dans le ciel, comme dans une vallée brumeuse.
 */
export function Atmosphere({ curve, mistPanels = 14, fireflies = 650 }: AtmosphereProps) {
  const mistMaterial = useMemo(() => createMistMaterial(PALETTE.haze), []);
  const shaftMaterial = useMemo(() => createShaftMaterial('#8fb9d6'), []);
  const points = useRef<Points>(null);
  const elapsed = useRef(0);

  const panels = useMemo(() => {
    const random = createRandom(515);
    return Array.from({ length: mistPanels }, (_, index) => {
      const t = Math.min(0.995, (index + 0.5) / mistPanels);
      const point = curve.getPointAt(t);
      return {
        position: [
          point.x + randomBetween(random, -8, 8),
          randomBetween(random, -2, 5),
          point.z + randomBetween(random, -4, 4),
        ] as const,
        scale: randomBetween(random, 16, 34),
        rotation: randomBetween(random, -0.4, 0.4),
      };
    });
  }, [curve, mistPanels]);

  const shafts = useMemo(() => {
    const random = createRandom(1012);
    return Array.from({ length: 6 }, (_, index) => {
      const t = Math.min(0.99, (index + 0.5) / 6);
      const point = curve.getPointAt(t);
      return {
        position: [
          point.x + randomBetween(random, -10, 10),
          16,
          point.z + randomBetween(random, -8, 8),
        ] as const,
        radius: randomBetween(random, 3.5, 7),
        height: randomBetween(random, 26, 40),
        tilt: randomBetween(random, -0.22, 0.22),
      };
    });
  }, [curve]);

  const { positions, speeds } = useMemo(() => {
    const random = createRandom(31415);
    const positionArray = new Float32Array(fireflies * 3);
    const speedArray = new Float32Array(fireflies);
    const lateral = new Vector3();

    for (let index = 0; index < fireflies; index += 1) {
      const t = Math.min(0.999, random());
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      lateral.set(tangent.z, 0, -tangent.x).normalize();

      const offset = randomBetween(random, -22, 22);
      positionArray[index * 3] = point.x + lateral.x * offset;
      positionArray[index * 3 + 1] = randomBetween(random, -2.4, 16);
      positionArray[index * 3 + 2] = point.z + lateral.z * offset;
      speedArray[index] = randomBetween(random, 0.25, 1.5);
    }

    return { positions: positionArray, speeds: speedArray };
  }, [curve, fireflies]);

  useFrame((_state, delta) => {
    elapsed.current += delta;
    const time = elapsed.current;

    mistMaterial.uniforms.uTime.value = time;
    shaftMaterial.uniforms.uTime.value = time;

    if (motionStore.reduced || !points.current) return;

    const attribute = points.current.geometry.getAttribute('position') as BufferAttribute;
    for (let index = 0; index < fireflies; index += 1) {
      const speed = speeds[index] ?? 1;
      const baseY = positions[index * 3 + 1] ?? 0;
      const baseX = positions[index * 3] ?? 0;
      attribute.setY(index, baseY + Math.sin(time * 0.4 * speed + index) * 0.8);
      attribute.setX(index, baseX + Math.cos(time * 0.25 * speed + index) * 0.5);
    }
    attribute.needsUpdate = true;
  });

  return (
    <group>
      {panels.map((panel, index) => (
        <mesh key={`mist-${index}`} position={panel.position} rotation={[0, panel.rotation, 0]}>
          <planeGeometry args={[panel.scale, panel.scale * 0.55]} />
          <primitive object={mistMaterial} attach="material" />
        </mesh>
      ))}

      {shafts.map((shaft, index) => (
        <mesh
          key={`shaft-${index}`}
          position={shaft.position}
          rotation={[shaft.tilt, 0, shaft.tilt * 0.6]}
        >
          <coneGeometry args={[shaft.radius, shaft.height, 14, 1, true]} />
          <primitive object={shaftMaterial} attach="material" />
        </mesh>
      ))}

      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          color={PALETTE.jade}
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}
