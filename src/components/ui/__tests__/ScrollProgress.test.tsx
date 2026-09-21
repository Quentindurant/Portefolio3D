import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollProgress } from '../ScrollProgress';
import { scrollStore } from '@/lib/scroll-store';

describe('ScrollProgress', () => {
  let frameCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    scrollStore.reset();
    frameCallback = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallback = callback;
      return 7;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  it('expose une barre de progression accessible', () => {
    render(<ScrollProgress />);
    const bar = screen.getByRole('progressbar', { name: /progression/i });

    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('reflète la progression du store sans rendu React', () => {
    const { container } = render(<ScrollProgress />);
    scrollStore.setFrame(0.42);

    frameCallback?.(0);

    const bar = container.querySelector<HTMLElement>('.scroll-progress__bar');
    expect(bar?.style.transform).toBe('scaleX(0.42)');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
  });

  it('arrête la boucle au démontage', () => {
    const { unmount } = render(<ScrollProgress />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(7);
  });
});
