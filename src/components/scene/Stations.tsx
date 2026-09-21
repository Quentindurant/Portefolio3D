'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  Color,
  type Group,
  type InstancedMesh,
  type Mesh,
  Object3D,
  type PointLight,
  Vector3,
} from 'three';
import { progressToCurveT, stationIntensity } from '@/lib/journey';
import { scrollStore } from '@/lib/scroll-store';
import { damp } from '@/lib/math';
import { createRandom, randomBetween } from '@/lib/random';
import { PALETTE } from '@/lib/theme';
import { motionStore } from '@/lib/motion-store';
import { createRuneMaterial } from './shaders/materials';
import type { StationAnchor } from './path';

/** Suit l'intensité de la station courante sans provoquer de rendu React. */
function useStationPulse(index: number) {
  const value = useRef(0);

  useFrame((_state, delta) => {
    const curveT = progressToCurveT(scrollStore.frame.progress);
    value.current = damp(
      value.current,
      stationIntensity(curveT, index),
      3.5,
      Math.min(delta, 0.1),
    );
  });

  return value;
}

interface StationProps {
  anchor: StationAnchor;
}

/** 01 · La lisière : une porte de racines tordues marque l'entrée de la forêt. */
function GateOfRoots({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const lantern = useRef<PointLight>(null);
  const halo = useRef<Mesh>(null);

  const arcs = useMemo(() => {
    const random = createRandom(11);
    return [-1, 1].map((side) =>
      new CatmullRomCurve3([
        new Vector3(side * 13, 0, randomBetween(random, -2, 2)),
        new Vector3(side * 11, 5, randomBetween(random, -1, 1)),
        new Vector3(side * 6, 11.5, randomBetween(random, -1.5, 1.5)),
        new Vector3(0, 14.5, 0),
      ]),
    );
  }, []);

  useFrame((state) => {
    const intensity = pulse.current;
    if (lantern.current) lantern.current.intensity = 3 + intensity * 14;
    if (halo.current) {
      halo.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.06);
    }
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      {arcs.map((curve, index) => (
        <mesh key={index}>
          <tubeGeometry args={[curve, 56, 0.55, 7, false]} />
          <meshStandardMaterial color={PALETTE.bark} roughness={0.9} flatShading />
        </mesh>
      ))}

      <mesh ref={halo} position={[0, 13.2, 0]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshBasicMaterial color={PALETTE.jade} toneMapped={false} />
      </mesh>

      <pointLight ref={lantern} position={[0, 13, 0]} color={PALETTE.jade} distance={40} />
    </group>
  );
}

/** 02 · Le sentier : des dalles flottantes qui s'allument au passage. */
function SteppingStones({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const group = useRef<Group>(null);

  const stones = useMemo(() => {
    const random = createRandom(22);
    return Array.from({ length: 7 }, (_, index) => ({
      position: [
        randomBetween(random, -5, 5),
        randomBetween(random, 0.8, 3.8),
        -index * 3.8,
      ] as const,
      radius: randomBetween(random, 1.2, 2.4),
      phase: randomBetween(random, 0, Math.PI * 2),
    }));
  }, []);

  useFrame((state) => {
    if (!group.current || motionStore.reduced) return;
    const time = state.clock.elapsedTime;
    group.current.children.forEach((child, index) => {
      const stone = stones[index];
      if (!stone) return;
      child.position.y = stone.position[1] + Math.sin(time * 0.6 + stone.phase) * 0.35;
      child.rotation.y += 0.0009 * (index % 3 === 0 ? -1 : 1);
    });
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      <group ref={group}>
        {stones.map((stone, index) => (
          <mesh key={index} position={stone.position}>
            <cylinderGeometry args={[stone.radius, stone.radius * 0.8, 0.45, 6]} />
            <meshStandardMaterial
              color={PALETTE.bark}
              emissive={PALETTE.jade}
              emissiveIntensity={0.25}
              roughness={0.85}
              flatShading
            />
          </mesh>
        ))}
      </group>
      <pointLight
        position={[0, 4, -10]}
        color={PALETTE.jade}
        distance={30}
        intensity={8}
        ref={(light) => {
          if (light) light.intensity = 2 + pulse.current * 10;
        }}
      />
    </group>
  );
}

/** 03 · Le sanctuaire : quatre monolithes gravés, un par projet. */
function Sanctuary({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const ring = useRef<Mesh>(null);
  const glow = useRef<PointLight>(null);

  const stones = useMemo(() => {
    const tints = [PALETTE.jade, PALETTE.arcane, PALETTE.ember, PALETTE.jade];
    return tints.map((tint, index) => {
      const material = createRuneMaterial(tint);
      material.uniforms.uSeed.value = index * 7.3;

      const angle = (index / tints.length) * Math.PI * 1.35 - Math.PI * 0.68;
      const radius = 9.5;

      const height = 6.4 + (index % 2) * 1.6;

      return {
        material,
        position: [
          Math.sin(angle) * radius,
          height / 2,
          Math.cos(angle) * radius - 10,
        ] as const,
        rotation: -angle,
        height,
      };
    });
  }, []);

  useFrame((state, delta) => {
    const intensity = pulse.current;
    stones.forEach((stone) => {
      stone.material.uniforms.uTime.value = state.clock.elapsedTime;
      stone.material.uniforms.uPower.value = 0.25 + intensity * 1.1;
    });
    if (ring.current) ring.current.rotation.y += delta * (0.05 + intensity * 0.25);
    if (glow.current) glow.current.intensity = 1.5 + intensity * 13;
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      {stones.map((stone, index) => (
        <group key={index} position={stone.position} rotation={[0, stone.rotation, 0]}>
          <mesh>
            <boxGeometry args={[1.8, stone.height, 0.7]} />
            <meshStandardMaterial color={PALETTE.bark} roughness={0.88} metalness={0.1} flatShading />
          </mesh>
          <mesh position={[0, 0.2, 0.37]}>
            <planeGeometry args={[1.25, stone.height * 0.72]} />
            <primitive object={stone.material} attach="material" />
          </mesh>
        </group>
      ))}

      <mesh ref={ring} position={[0, 9, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[7.5, 0.09, 8, 64]} />
        <meshStandardMaterial
          color={PALETTE.arcane}
          emissive={PALETTE.arcane}
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>

      <pointLight ref={glow} position={[0, 3.5, -10]} color={PALETTE.arcane} distance={44} />
    </group>
  );
}

/** 04 · Les racines : une caverne de racines et de champignons luminescents. */
function RootCavern({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const mushrooms = useRef<InstancedMesh>(null);
  const glow = useRef<PointLight>(null);

  const roots = useMemo(() => {
    const random = createRandom(44);
    return Array.from({ length: 4 }, (_, index) =>
      new CatmullRomCurve3([
        new Vector3(-18, randomBetween(random, 3, 7), -index * 4.5 - 3),
        new Vector3(-6, randomBetween(random, 8, 13), -index * 4.5 - 6),
        new Vector3(6, randomBetween(random, 7, 12), -index * 4.5 - 1),
        new Vector3(18, randomBetween(random, 2, 6), -index * 4.5 - 3),
      ]),
    );
  }, []);

  const caps = useMemo(() => {
    const random = createRandom(45);
    return Array.from({ length: 46 }, () => ({
      position: [
        randomBetween(random, -14, 14),
        0.12,
        randomBetween(random, -20, 3),
      ] as const,
      scale: randomBetween(random, 0.16, 0.5),
    }));
  }, []);

  useFrame((state) => {
    if (glow.current) glow.current.intensity = 1.2 + pulse.current * 11;

    const mesh = mushrooms.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const time = state.clock.elapsedTime;

    caps.forEach((cap, index) => {
      const bob = motionStore.reduced ? 0 : Math.sin(time * 0.8 + index) * 0.06;
      dummy.position.set(cap.position[0], cap.position[1] + bob, cap.position[2]);
      dummy.scale.set(cap.scale, cap.scale * 0.6, cap.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      {roots.map((curve, index) => (
        <mesh key={index}>
          <tubeGeometry args={[curve, 36, randomRadius(index), 6, false]} />
          <meshStandardMaterial color={PALETTE.bark} roughness={0.95} flatShading />
        </mesh>
      ))}

      <instancedMesh ref={mushrooms} args={[undefined, undefined, caps.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial
          color={PALETTE.moss}
          emissive={PALETTE.jade}
          emissiveIntensity={0.55}
          roughness={0.7}
        />
      </instancedMesh>

      <pointLight ref={glow} position={[0, 2.5, -14]} color={PALETTE.jade} distance={40} />
    </group>
  );
}

function randomRadius(index: number): number {
  return 0.5 + ((index * 37) % 5) * 0.12;
}

/** 05 · Le grimoire : des éclats de cristal en constellation. */
function CrystalGrimoire({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const group = useRef<Group>(null);
  const glow = useRef<PointLight>(null);

  const shards = useMemo(() => {
    const random = createRandom(55);
    return Array.from({ length: 14 }, (_, index) => ({
      position: [
        randomBetween(random, -10, 10),
        randomBetween(random, 2.5, 13),
        randomBetween(random, -18, -2),
      ] as const,
      scale: randomBetween(random, 0.5, 1.8),
      speed: randomBetween(random, 0.1, 0.5) * (index % 2 === 0 ? 1 : -1),
    }));
  }, []);

  useFrame((state, delta) => {
    if (glow.current) glow.current.intensity = 1.2 + pulse.current * 12;
    if (!group.current || motionStore.reduced) return;

    const time = state.clock.elapsedTime;
    group.current.children.forEach((child, index) => {
      const shard = shards[index];
      if (!shard) return;
      child.rotation.x += delta * shard.speed * 0.4;
      child.rotation.y += delta * shard.speed * 0.6;
      child.position.y = shard.position[1] + Math.sin(time * 0.5 + index) * 0.4;
    });
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      <group ref={group}>
        {shards.map((shard, index) => (
          <mesh key={index} position={shard.position} scale={shard.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={PALETTE.arcane}
              emissive={PALETTE.arcane}
              emissiveIntensity={0.9}
              roughness={0.25}
              metalness={0.5}
              flatShading
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight ref={glow} position={[0, 7, -10]} color={PALETTE.arcane} distance={46} />
    </group>
  );
}

/** 06 · La clairière : l'arbre-cœur et son bassin, fin du voyage. */
function HeartTree({ anchor }: StationProps) {
  const pulse = useStationPulse(anchor.index);
  const core = useRef<Mesh>(null);
  const glow = useRef<PointLight>(null);

  const canopy = useMemo(() => {
    const random = createRandom(66);
    return Array.from({ length: 14 }, () => ({
      position: [
        randomBetween(random, -4.5, 4.5),
        randomBetween(random, 15, 21),
        randomBetween(random, -4.5, 4.5),
      ] as const,
      scale: randomBetween(random, 2.2, 4),
    }));
  }, []);

  useFrame((state) => {
    const intensity = pulse.current;
    if (glow.current) glow.current.intensity = 2.5 + intensity * 20;
    if (core.current) {
      const breath = 1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.07;
      core.current.scale.setScalar(breath * (0.7 + intensity * 0.5));
    }
  });

  return (
    <group position={anchor.position} rotation={[0, anchor.facing + Math.PI, 0]}>
      <mesh position={[0, 7, -16]}>
        <cylinderGeometry args={[1.4, 2.8, 15, 9, 1]} />
        <meshStandardMaterial color={PALETTE.bark} roughness={0.9} flatShading />
      </mesh>

      {canopy.map((blob, index) => (
        <mesh key={index} position={[blob.position[0], blob.position[1], blob.position[2] - 16]}>
          <icosahedronGeometry args={[blob.scale, 0]} />
          <meshStandardMaterial
            color="#0d2219"
            emissive={PALETTE.jade}
            emissiveIntensity={0.12}
            roughness={1}
            flatShading
          />
        </mesh>
      ))}

      <mesh ref={core} position={[0, 12, -16]}>
        <sphereGeometry args={[1.6, 18, 18]} />
        <meshBasicMaterial color={PALETTE.jade} toneMapped={false} />
      </mesh>

      {/* Bassin : miroir sombre qui capte la lueur de l'arbre. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, -12]}>
        <circleGeometry args={[15, 48]} />
        <meshStandardMaterial
          color={new Color('#02110d')}
          roughness={0.12}
          metalness={0.85}
        />
      </mesh>

      <pointLight ref={glow} position={[0, 12, -16]} color={PALETTE.jade} distance={60} />
    </group>
  );
}

const STATION_COMPONENTS = [
  GateOfRoots,
  SteppingStones,
  Sanctuary,
  RootCavern,
  CrystalGrimoire,
  HeartTree,
] as const;

/** Hauteur du sol : les tableaux sont posés dessus, pas sur le chemin aérien. */
export const GROUND_Y = -2.6;

/**
 * Place chaque tableau un peu en avant de son ancre, au niveau du sol.
 *
 * Le groupe est tourné de `facing + π` : dans ses coordonnées locales, -Z
 * pointe donc vers l'avant du chemin, comme la caméra. Tous les décors sont
 * écrits avec cette convention.
 */
export function Stations({ anchors }: { anchors: StationAnchor[] }) {
  return (
    <group>
      {anchors.map((anchor) => {
        const Station = STATION_COMPONENTS[anchor.index] ?? GateOfRoots;
        const grounded = anchor.position.clone().addScaledVector(anchor.tangent, 16);
        grounded.y = GROUND_Y;

        return (
          <Station key={anchor.index} anchor={{ ...anchor, position: grounded }} />
        );
      })}
    </group>
  );
}
