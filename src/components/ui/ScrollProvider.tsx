'use client';

import type { ReactNode } from 'react';
import { useScrollOrchestrator } from '@/hooks/useScrollOrchestrator';

/** Démarre la boucle de voyage pour toute la page. */
export function ScrollProvider({ children }: { children: ReactNode }) {
  useScrollOrchestrator();
  return <>{children}</>;
}
