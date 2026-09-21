'use client';

import { SECTIONS } from '@/content/sections';
import { STATION_CONTENT } from '@/components/sections/content';
import { useActiveSection } from '@/hooks/useActiveSection';

/**
 * Panneaux de contenu.
 *
 * Les six tableaux restent dans le DOM (indexation, référencement, lecture
 * hors ligne) mais un seul est visible et focalisable à la fois : celui que la
 * caméra traverse. Les autres sont neutralisés avec `inert`.
 */
export function StationPanels() {
  const activeIndex = useActiveSection();

  return (
    <div className="panels">
      {SECTIONS.map((section, index) => {
        const Content = STATION_CONTENT[index];
        const isActive = index === activeIndex;

        return (
          <section
            key={section.id}
            id={section.id}
            className="panel"
            // Lenis laisse la molette au panneau quand son contenu déborde.
            data-lenis-prevent
            data-active={isActive ? 'true' : 'false'}
            aria-hidden={!isActive}
            inert={!isActive}
            aria-labelledby={`${section.id}-title`}
          >
            <p className="panel__kicker">
              <span className="panel__number">{String(index + 1).padStart(2, '0')}</span>
              {section.kicker}
            </p>
            <h2 id={`${section.id}-title`} className="panel__title">
              {section.title}
            </h2>
            <div className="panel__body">{Content ? <Content /> : null}</div>
          </section>
        );
      })}
    </div>
  );
}
