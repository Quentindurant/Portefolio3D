'use client';

import { useSyncExternalStore } from 'react';
import { scrollStore } from '@/lib/scroll-store';

/** Index de la section courante, mis à jour uniquement quand il change. */
export function useActiveSection(): number {
  return useSyncExternalStore(
    scrollStore.subscribe,
    scrollStore.getActiveIndex,
    () => 0,
  );
}
