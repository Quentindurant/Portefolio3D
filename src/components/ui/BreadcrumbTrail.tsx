'use client';

import { Breadcrumb } from './Breadcrumb';
import { SECTIONS } from '@/content/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { goToStation } from '@/lib/navigation';

/** Branche le fil d'Ariane sur la progression réelle du voyage. */
export function BreadcrumbTrail() {
  const activeIndex = useActiveSection();

  return (
    <Breadcrumb
      sections={SECTIONS}
      activeIndex={activeIndex}
      onNavigate={(_id, index) => {
        goToStation(index, SECTIONS.length);
      }}
    />
  );
}
