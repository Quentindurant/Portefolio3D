import { afterEach, vi } from 'vitest';

const hasDom = typeof window !== 'undefined';

if (hasDom) {
  await import('@testing-library/jest-dom/vitest');
  const { cleanup } = await import('@testing-library/react');

  // jsdom n'implémente pas matchMedia : indispensable pour prefers-reduced-motion.
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
} else {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
}
