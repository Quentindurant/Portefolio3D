/**
 * Petit store externe partagé entre le DOM et le canvas WebGL.
 *
 * La progression est volontairement mutable et hors de React : elle change à
 * chaque frame et ne doit provoquer aucun rendu. Seul l'index de section
 * actif, qui change rarement, est réactif via `subscribe`.
 */
export interface ScrollFrame {
  progress: number;
  velocity: number;
}

type Listener = () => void;

function createScrollStore() {
  const frame: ScrollFrame = { progress: 0, velocity: 0 };
  const listeners = new Set<Listener>();
  let activeIndex = 0;

  return {
    frame,
    setFrame(progress: number, velocity = 0): void {
      frame.progress = progress;
      frame.velocity = velocity;
    },
    setActiveIndex(index: number): void {
      if (index === activeIndex) return;
      activeIndex = index;
      for (const listener of listeners) listener();
    },
    getActiveIndex(): number {
      return activeIndex;
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reset(): void {
      frame.progress = 0;
      frame.velocity = 0;
      activeIndex = 0;
      listeners.clear();
    },
    get listenerCount(): number {
      return listeners.size;
    },
  };
}

export const scrollStore = createScrollStore();
export type ScrollStore = ReturnType<typeof createScrollStore>;
