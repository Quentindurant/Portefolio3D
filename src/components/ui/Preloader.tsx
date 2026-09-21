'use client';

import { useEffect, useRef, useState } from 'react';
import { experienceStore } from '@/lib/experience-store';
import { damp } from '@/lib/math';
import { useExperiencePhase } from '@/hooks/useExperiencePhase';
import { PROFILE } from '@/content/profile';

/**
 * Seuil de la forêt.
 *
 * Le scroll reste verrouillé tant que la scène n'a pas rendu sa première
 * image : on n'entre pas dans un monde à moitié chargé. Le bouton donne aussi
 * le geste utilisateur qui autorise les animations.
 */
export function Preloader() {
  const phase = useExperiencePhase();
  const [displayed, setDisplayed] = useState(0);
  const button = useRef<HTMLButtonElement>(null);

  // Progression visuelle : elle grimpe jusqu'à 92 % puis attend la scène.
  // L'amortissement dépend du temps écoulé, pas du nombre d'images : la barre
  // met la même durée à se remplir sur une machine lente.
  useEffect(() => {
    let frame = 0;
    let value = 0;
    let last = performance.now();

    const tick = (now: number): void => {
      const delta = Math.min(0.12, (now - last) / 1000);
      last = now;

      const ceiling = phase === 'loading' ? 92 : 100;
      value = damp(value, ceiling, 2.6, delta);
      setDisplayed(Math.round(value));

      if (value < ceiling - 0.4) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase]);

  // Le scroll est bloqué tant qu'on n'est pas entré.
  useEffect(() => {
    document.documentElement.dataset.phase = phase;
  }, [phase]);

  useEffect(() => {
    if (phase === 'ready') button.current?.focus();
  }, [phase]);

  if (phase === 'entered') return null;

  return (
    <div className="preloader" role="dialog" aria-modal="true" aria-label="Entrée dans la forêt">
      <div className="preloader__inner">
        <p className="preloader__name">{PROFILE.name}</p>
        <p className="preloader__role">{PROFILE.role}</p>

        <div className="preloader__gauge" aria-hidden="true">
          <span className="preloader__gauge-fill" style={{ transform: `scaleX(${displayed / 100})` }} />
        </div>

        <p className="preloader__count">
          <span>{String(displayed).padStart(3, '0')}</span> %
        </p>

        <button
          ref={button}
          className="button preloader__enter"
          type="button"
          disabled={phase !== 'ready'}
          onClick={() => experienceStore.enter()}
        >
          {phase === 'ready' ? 'Entrer dans la forêt' : 'Préparation du sentier'}
        </button>
      </div>
    </div>
  );
}
