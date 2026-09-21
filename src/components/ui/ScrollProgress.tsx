'use client';

import { useEffect, useRef } from 'react';
import { scrollStore } from '@/lib/scroll-store';

/**
 * Jauge de progression du parcours.
 * Le style est muté directement dans une boucle d'animation : aucun rendu
 * React déclenché pendant le scroll.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameId = 0;

    const tick = (): void => {
      const element = bar.current;
      if (element) {
        const percent = Math.round(scrollStore.frame.progress * 100);
        element.style.transform = `scaleX(${scrollStore.frame.progress})`;
        element.setAttribute('aria-valuenow', String(percent));
      }
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      className="scroll-progress"
      role="progressbar"
      aria-label="Progression dans le parcours"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div ref={bar} className="scroll-progress__bar" />
    </div>
  );
}
