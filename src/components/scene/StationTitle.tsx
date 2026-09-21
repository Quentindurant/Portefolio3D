'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, LinearFilter, type Mesh, type MeshBasicMaterial, Vector3 } from 'three';
import { progressToCurveT, stationIntensity } from '@/lib/journey';
import { scrollStore } from '@/lib/scroll-store';
import { damp } from '@/lib/math';
import type { StationAnchor } from './path';

interface StationTitleProps {
  anchor: StationAnchor;
  title: string;
  kicker: string;
}

const CANVAS_WIDTH = 2048;
const CANVAS_HEIGHT = 560;
const SAFE_WIDTH = CANVAS_WIDTH - 180;

/** Réduit la taille jusqu'à ce que le texte tienne dans la largeur utile. */
function fitFont(
  context: CanvasRenderingContext2D,
  text: string,
  weight: number,
  startSize: number,
  family: string,
  spacing: string,
): void {
  let size = startSize;
  if ('letterSpacing' in context) context.letterSpacing = spacing;
  context.font = `${weight} ${size}px ${family}`;

  while (context.measureText(text).width > SAFE_WIDTH && size > 24) {
    size -= 6;
    context.font = `${weight} ${size}px ${family}`;
  }
}

/**
 * Titre de tableau gravé dans la scène.
 *
 * Le texte est peint dans un canvas puis appliqué sur un plan : il vit dans le
 * monde 3D, se fait masquer par les troncs qui passent devant et se dévoile
 * quand la caméra arrive sur la station.
 */
export function StationTitle({ anchor, title, kicker }: StationTitleProps) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);

  useEffect(() => {
    let cancelled = false;

    async function paint(): Promise<void> {
      // Sans cette attente, le titre serait peint avec la police de secours.
      if (document.fonts?.ready) await document.fonts.ready;
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) return;

      const family =
        getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() ||
        'Georgia, serif';

      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      fitFont(context, title.toUpperCase(), 700, 210, family, '18px');
      context.shadowColor = 'rgba(74, 222, 156, 0.5)';
      context.shadowBlur = 48;
      context.fillStyle = 'rgba(233, 228, 212, 0.85)';
      context.fillText(title.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

      fitFont(context, kicker.toUpperCase(), 500, 54, family, '20px');
      context.shadowBlur = 12;
      context.fillStyle = 'rgba(74, 222, 156, 0.8)';
      context.fillText(kicker.toUpperCase(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 140);

      const painted = new CanvasTexture(canvas);
      painted.minFilter = LinearFilter;
      painted.anisotropy = 4;
      setTexture(painted);
    }

    void paint();
    return () => {
      cancelled = true;
    };
  }, [title, kicker]);

  useEffect(() => () => texture?.dispose(), [texture]);

  const position = useMemo(() => {
    // Toujours du côté opposé aux panneaux de texte, qui occupent la gauche.
    const lateral = new Vector3(anchor.tangent.z, 0, -anchor.tangent.x).normalize();

    // Le titre se dresse en avant sur le chemin : on marche vers lui, et des
    // troncs passent devant avant qu'il ne se révèle entièrement.
    const spot = anchor.position
      .clone()
      .addScaledVector(anchor.tangent, 30)
      .addScaledVector(lateral, -7.5);

    return [spot.x, spot.y + 6, spot.z] as const;
  }, [anchor]);

  useFrame((_state, delta) => {
    if (!material.current) return;
    const curveT = progressToCurveT(scrollStore.frame.progress);
    const target = stationIntensity(curveT, anchor.index) * 0.6;
    material.current.opacity = damp(material.current.opacity, target, 4, Math.min(delta, 0.1));
  });

  if (!texture) return null;

  return (
    <mesh ref={mesh} position={position} rotation={[0, anchor.facing + Math.PI, 0]}>
      <planeGeometry args={[17, 17 * (CANVAS_HEIGHT / CANVAS_WIDTH)]} />
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
