'use client';

import dynamic from 'next/dynamic';

/**
 * La scène est chargée uniquement côté client : three.js n'a rien à faire
 * dans le HTML initial, et le contenu s'affiche sans attendre WebGL.
 */
const JungleScene = dynamic(() => import('./JungleScene'), {
  ssr: false,
  loading: () => null,
});

export function SceneLayer() {
  return (
    <div className="scene-layer" aria-hidden="true">
      <JungleScene />
    </div>
  );
}
