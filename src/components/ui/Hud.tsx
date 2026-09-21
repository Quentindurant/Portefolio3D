'use client';

import { useEffect, useRef } from 'react';
import { SECTIONS } from '@/content/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { scrollStore } from '@/lib/scroll-store';

/** Longueur symbolique du parcours, affichée comme une profondeur parcourue. */
const JOURNEY_METRES = 240;

/**
 * Compteur de progression.
 * La valeur change à chaque frame : elle est écrite directement dans le DOM
 * plutôt que dans un état React, pour ne rien re-rendre pendant le scroll.
 */
function DepthCounter() {
  const value = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const tick = (): void => {
      const element = value.current;
      if (element) {
        const metres = Math.round(scrollStore.frame.progress * JOURNEY_METRES);
        const text = metres.toString().padStart(3, '0');
        if (element.textContent !== text) element.textContent = text;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <p className="hud__depth">
      <span ref={value} className="hud__depth-value">
        000
      </span>
      <span className="hud__depth-unit">mètres sous la canopée</span>
    </p>
  );
}

/** Étape courante, en haut à droite, comme un repère de progression. */
function StationLabel() {
  const activeIndex = useActiveSection();
  const section = SECTIONS[activeIndex] ?? SECTIONS[0];

  return (
    <p className="hud__station">
      <span className="hud__station-index">{String(activeIndex + 1).padStart(2, '0')}</span>
      <span className="hud__station-dash" aria-hidden="true" />
      <span className="hud__station-name">{section.crumb}</span>
    </p>
  );
}

/** Invitation à défiler, visible uniquement au départ. */
function ScrollHint() {
  const activeIndex = useActiveSection();
  if (activeIndex > 0) return null;

  return (
    <p className="hud__hint" aria-hidden="true">
      Défile pour avancer
      <span className="hud__hint-line" />
    </p>
  );
}

/** Interface de voyage superposée à la scène. */
export function Hud() {
  return (
    <div className="hud">
      <DepthCounter />
      <StationLabel />
      <ScrollHint />
    </div>
  );
}
