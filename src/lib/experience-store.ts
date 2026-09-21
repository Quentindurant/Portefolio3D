/**
 * État d'entrée dans l'expérience.
 *
 * `loading` tant que le premier rendu WebGL n'a pas eu lieu, `ready` quand la
 * scène est prête, `entered` une fois que le visiteur a franchi la porte. Le
 * scroll reste verrouillé avant l'entrée.
 */
export type ExperiencePhase = 'loading' | 'ready' | 'entered';

type Listener = () => void;

function createExperienceStore() {
  const listeners = new Set<Listener>();
  let phase: ExperiencePhase = 'loading';

  function emit(): void {
    for (const listener of listeners) listener();
  }

  return {
    getPhase(): ExperiencePhase {
      return phase;
    },
    markReady(): void {
      if (phase !== 'loading') return;
      phase = 'ready';
      emit();
    },
    enter(): void {
      if (phase === 'entered') return;
      phase = 'entered';
      emit();
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset(): void {
      phase = 'loading';
      listeners.clear();
    },
    get listenerCount(): number {
      return listeners.size;
    },
  };
}

export const experienceStore = createExperienceStore();
