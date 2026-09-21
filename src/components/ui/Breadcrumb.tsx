'use client';

import type { MouseEvent } from 'react';
import type { SectionDefinition } from '@/content/sections';

export interface BreadcrumbProps {
  sections: readonly SectionDefinition[];
  activeIndex: number;
  onNavigate?: (id: string, index: number) => boolean | void;
}

/**
 * Fil d'Ariane du parcours. Composant purement présentationnel : il reçoit
 * l'index actif et notifie la navigation, ce qui le rend trivial à tester.
 *
 * Accessibilité : vraie liste ordonnée de liens d'ancre, `aria-current` sur
 * l'étape courante, et le clic reste un lien fonctionnel sans JavaScript.
 */
export function Breadcrumb({ sections, activeIndex, onNavigate }: BreadcrumbProps) {
  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
    index: number,
  ): void => {
    if (!onNavigate) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    const handled = onNavigate(id, index);
    if (handled !== false) event.preventDefault();
  };

  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <ol className="breadcrumb__list">
        {sections.map((section, index) => {
          const isActive = index === activeIndex;
          const isVisited = index < activeIndex;

          return (
            <li
              key={section.id}
              className="breadcrumb__item"
              data-state={isActive ? 'active' : isVisited ? 'visited' : 'upcoming'}
            >
              <a
                className="breadcrumb__link"
                href={`#${section.id}`}
                aria-current={isActive ? 'step' : undefined}
                onClick={(event) => handleClick(event, section.id, index)}
              >
                <span className="breadcrumb__marker" aria-hidden="true" />
                <span className="breadcrumb__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="breadcrumb__label">{section.crumb}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
