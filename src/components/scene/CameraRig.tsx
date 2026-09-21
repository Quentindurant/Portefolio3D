'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type CatmullRomCurve3, Vector3 } from 'three';
import { LOOK_AHEAD, progressToCurveT, STATION_T } from '@/lib/journey';
import { scrollStore } from '@/lib/scroll-store';
import { motionStore } from '@/lib/motion-store';
import { damp } from '@/lib/math';

interface CameraRigProps {
  curve: CatmullRomCurve3;
}

/**
 * Le voyage.
 *
 * Le scroll ne déplace pas la page : il fait avancer la caméra sur la courbe.
 * La position est amortie pour absorber les à-coups de molette, et la souris
 * ajoute une parallaxe discrète qui donne du volume à la scène.
 */
export function CameraRig({ curve }: CameraRigProps) {
  const pointer = useRef({ x: 0, y: 0 });
  const position = useRef(new Vector3());
  const lookAt = useRef(new Vector3());
  const lateral = useRef(new Vector3());
  const target = useRef(new Vector3());

  useEffect(() => {
    const start = STATION_T[0] ?? 0;
    position.current.copy(curve.getPointAt(start));
    lookAt.current.copy(curve.getPointAt(Math.min(0.999, start + LOOK_AHEAD)));
  }, [curve]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent): void => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.1);
    const curveT = progressToCurveT(scrollStore.frame.progress);

    const onPath = curve.getPointAt(curveT);
    const ahead = curve.getPointAt(Math.min(0.999, curveT + LOOK_AHEAD));
    const tangent = curve.getTangentAt(curveT);

    lateral.current.set(tangent.z, 0, -tangent.x).normalize();

    const parallax = motionStore.reduced ? 0 : 1;
    target.current
      .copy(onPath)
      .addScaledVector(lateral.current, pointer.current.x * 1.9 * parallax)
      .add(new Vector3(0, -pointer.current.y * 0.9 * parallax, 0));

    const lambda = motionStore.reduced ? 12 : 3.6;
    position.current.set(
      damp(position.current.x, target.current.x, lambda, step),
      damp(position.current.y, target.current.y, lambda, step),
      damp(position.current.z, target.current.z, lambda, step),
    );

    lookAt.current.set(
      damp(lookAt.current.x, ahead.x, lambda * 0.8, step),
      damp(lookAt.current.y, ahead.y, lambda * 0.8, step),
      damp(lookAt.current.z, ahead.z, lambda * 0.8, step),
    );

    const { camera } = state;
    camera.position.copy(position.current);
    camera.lookAt(lookAt.current);

    // Léger roulis dans les virages, comme une marche.
    camera.rotation.z = damp(
      camera.rotation.z,
      -pointer.current.x * 0.035 * parallax,
      2.5,
      step,
    );
  });

  return null;
}
