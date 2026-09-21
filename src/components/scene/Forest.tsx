'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import type { CatmullRomCurve3 } from 'three';
import { Color, InstancedMesh, Object3D, Vector3 } from 'three';
import { createRandom, randomBetween } from '@/lib/random';
import { PALETTE } from '@/lib/theme';

interface ForestProps {
  curve: CatmullRomCurve3;
  trunks?: number;
  crowns?: number;
}

interface Placement {
  position: Vector3;
  rotation: number;
  scale: Vector3;
  tint: number;
}

/**
 * Forêt qui suit le tracé du voyage.
 *
 * Les arbres ne sont pas alignés sur un axe : chaque tronc est tiré le long de
 * la courbe puis décalé latéralement par rapport à sa tangente. Tout est
 * instancié, donc la forêt entière tient en deux appels de rendu.
 */
export function Forest({ curve, trunks = 280, crowns = 150 }: ForestProps) {
  const trunkMesh = useRef<InstancedMesh>(null);
  const crownMesh = useRef<InstancedMesh>(null);

  const placements = useMemo(() => {
    const random = createRandom(20260921);
    const lateral = new Vector3();
    const trunkList: Placement[] = [];
    const crownList: Placement[] = [];

    for (let index = 0; index < trunks; index += 1) {
      const t = Math.min(0.999, random());
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);

      // Perpendiculaire horizontale au chemin.
      lateral.set(tangent.z, 0, -tangent.x).normalize();

      const side = index % 2 === 0 ? 1 : -1;
      const distance = randomBetween(random, 11, 38);
      const height = randomBetween(random, 14, 38);
      const radius = randomBetween(random, 0.5, 1.5);

      const position = new Vector3(
        point.x + lateral.x * distance * side,
        -3.1 + height / 2,
        point.z + lateral.z * distance * side,
      );

      trunkList.push({
        position,
        rotation: randomBetween(random, -0.08, 0.08),
        scale: new Vector3(radius, height, radius),
        tint: random(),
      });

      if (crownList.length < crowns && random() > 0.42) {
        crownList.push({
          position: new Vector3(
            position.x + randomBetween(random, -2, 2),
            position.y + height / 2 - randomBetween(random, 1, 4),
            position.z + randomBetween(random, -2, 2),
          ),
          rotation: randomBetween(random, 0, Math.PI),
          scale: new Vector3(1, 0.7, 1).multiplyScalar(randomBetween(random, 4, 9)),
          tint: random(),
        });
      }
    }

    return { trunkList, crownList };
  }, [curve, trunks, crowns]);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const color = new Color();
    const bark = new Color(PALETTE.bark);
    const moss = new Color(PALETTE.moss);

    const apply = (mesh: InstancedMesh | null, list: Placement[], from: Color, to: Color) => {
      if (!mesh) return;
      list.forEach((item, index) => {
        dummy.position.copy(item.position);
        dummy.rotation.set(item.rotation, item.tint * Math.PI * 2, item.rotation * 0.5);
        dummy.scale.copy(item.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, color.copy(from).lerp(to, item.tint));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    apply(trunkMesh.current, placements.trunkList, bark, moss);
    apply(crownMesh.current, placements.crownList, moss, bark);
  }, [placements]);

  return (
    <group>
      <instancedMesh
        ref={trunkMesh}
        args={[undefined, undefined, placements.trunkList.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.55, 1, 1, 6, 1]} />
        <meshStandardMaterial roughness={0.95} metalness={0.02} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={crownMesh}
        args={[undefined, undefined, Math.max(1, placements.crownList.length)]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          roughness={1}
          metalness={0}
          flatShading
          emissive={PALETTE.moss}
          emissiveIntensity={0.08}
        />
      </instancedMesh>
    </group>
  );
}
