'use client';

import { useSyncExternalStore } from 'react';
import { experienceStore, type ExperiencePhase } from '@/lib/experience-store';

/** Phase courante de l'expérience, partagée entre le canvas et le HTML. */
export function useExperiencePhase(): ExperiencePhase {
  return useSyncExternalStore(
    experienceStore.subscribe,
    experienceStore.getPhase,
    () => 'loading' as const,
  );
}
