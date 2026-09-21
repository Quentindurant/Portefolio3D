'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { computeScrollProgress } from '@/lib/scroll';
import { nearestStation, progressToCurveT } from '@/lib/journey';
import { scrollStore } from '@/lib/scroll-store';
import { setSmoothScroller } from '@/lib/navigation';
import { useReducedMotion } from './useReducedMotion';

/**
 * Boucle unique du site.
 *
 * Elle lisse le scroll, le convertit en progression de voyage et publie la
 * station courante. Tout passe par une seule requestAnimationFrame : aucun
 * écouteur `scroll` supplémentaire, aucun rendu React par frame.
 */
export function useScrollOrchestrator(): void {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let documentHeight = 0;
    let viewportHeight = 0;

    const measure = (): void => {
      viewportHeight = window.innerHeight;
      documentHeight = document.documentElement.scrollHeight;
    };

    measure();

    const lenis = reducedMotion
      ? null
      : new Lenis({
          duration: 1.25,
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.3,
        });

    setSmoothScroller(lenis);

    let previousProgress = 0;
    let frameId = 0;

    const tick = (time: number): void => {
      lenis?.raf(time);

      const progress = computeScrollProgress(window.scrollY, documentHeight, viewportHeight);
      scrollStore.setFrame(progress, progress - previousProgress);
      previousProgress = progress;

      scrollStore.setActiveIndex(nearestStation(progressToCurveT(progress)));

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    window.addEventListener('resize', measure, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      setSmoothScroller(null);
      lenis?.destroy();
    };
  }, [reducedMotion]);
}
