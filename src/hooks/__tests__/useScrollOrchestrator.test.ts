import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const lenisInstances: Array<{
  raf: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  scrollTo: ReturnType<typeof vi.fn>;
}> = [];

vi.mock('lenis', () => ({
  default: class LenisMock {
    raf = vi.fn();
    destroy = vi.fn();
    scrollTo = vi.fn();
    constructor() {
      lenisInstances.push(this);
    }
  },
}));

import { useScrollOrchestrator } from '../useScrollOrchestrator';
import { scrollStore } from '@/lib/scroll-store';
import { getSmoothScroller } from '@/lib/navigation';

let frameCallback: FrameRequestCallback | null = null;

function setupEnvironment(): void {
  frameCallback = null;
  lenisInstances.length = 0;
  scrollStore.reset();

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      disconnect = vi.fn();
    },
  );

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frameCallback = callback;
    return 1;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);

  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 3000,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true, writable: true });

  document.body.innerHTML = '<section id="un"></section><section id="deux"></section>';
}

describe('useScrollOrchestrator', () => {
  beforeEach(setupEnvironment);
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('publie la progression du scroll dans le store', () => {
    renderHook(() => useScrollOrchestrator());

    expect(frameCallback).not.toBeNull();
    frameCallback?.(16);

    // 1000 px parcourus sur 2000 px de course utile.
    expect(scrollStore.frame.progress).toBeCloseTo(0.5, 5);
    expect(lenisInstances[0]?.raf).toHaveBeenCalledWith(16);
  });

  it('enregistre puis libère le scroller fluide', () => {
    const { unmount } = renderHook(() => useScrollOrchestrator());
    expect(getSmoothScroller()).not.toBeNull();

    unmount();

    expect(getSmoothScroller()).toBeNull();
    expect(lenisInstances[0]?.destroy).toHaveBeenCalled();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
