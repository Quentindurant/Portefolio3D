'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { SECTIONS } from '@/content/sections';
import { PALETTE } from '@/lib/theme';
import { motionStore } from '@/lib/motion-store';
import { experienceStore } from '@/lib/experience-store';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CameraRig } from './CameraRig';
import { Atmosphere } from './Atmosphere';
import { Forest } from './Forest';
import { Sky } from './Sky';
import { Stations } from './Stations';
import { StationTitle } from './StationTitle';
import { Terrain } from './Terrain';
import { computeStationAnchors, createJourneyCurve } from './path';

/** Signale que le premier rendu WebGL a eu lieu : le voile de chargement peut tomber. */
function ReadySignal() {
  const done = useRef(false);

  useFrame(() => {
    if (done.current) return;
    done.current = true;
    experienceStore.markReady();
  });

  return null;
}

/**
 * La scène est l'interface.
 *
 * Un seul canvas plein écran contient tout le voyage : le sol, la forêt, les
 * six tableaux et les titres gravés. Le HTML par-dessus ne porte que le texte
 * lisible et le fil d'Ariane.
 */
export default function JungleScene() {
  const reducedMotion = useReducedMotion();

  const curve = useMemo(() => createJourneyCurve(), []);
  const anchors = useMemo(() => computeStationAnchors(curve), [curve]);
  const corridorLength = useMemo(() => Math.abs(curve.getPointAt(1).z) + 90, [curve]);

  useEffect(() => {
    motionStore.setReduced(reducedMotion);
  }, [reducedMotion]);

  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, reducedMotion ? 1 : 1.6]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 2.6, 30], fov: 62, near: 0.1, far: 420 }}
    >
      <fogExp2 attach="fog" args={[PALETTE.fog, 0.023]} />

      {/* Nuit de pleine lune : une source froide dominante, presque pas d'ambiante. */}
      <ambientLight intensity={0.16} color="#24405a" />
      <hemisphereLight args={['#37607a', PALETTE.abyss, 0.2]} />
      <directionalLight position={[18, 40, -20]} intensity={0.55} color="#9fc4ff" />

      <Sky />
      <Terrain length={corridorLength} />
      <Forest curve={curve} />
      <Atmosphere curve={curve} />
      <Stations anchors={anchors} />

      {anchors.map((anchor) => {
        const section = SECTIONS[anchor.index];
        if (!section) return null;
        return (
          <StationTitle
            key={anchor.index}
            anchor={anchor}
            title={section.crumb}
            kicker={section.kicker}
          />
        );
      })}

      <CameraRig curve={curve} />
      <ReadySignal />

      <EffectComposer multisampling={reducedMotion ? 0 : 2}>
        <Bloom
          intensity={0.62}
          luminanceThreshold={0.52}
          luminanceSmoothing={0.24}
          mipmapBlur
        />
        <Noise opacity={0.04} blendFunction={BlendFunction.SOFT_LIGHT} />
        <Vignette offset={0.28} darkness={0.85} eskil={false} />
      </EffectComposer>

      <AdaptiveDpr pixelated={false} />
      <Preload all />
    </Canvas>
  );
}
