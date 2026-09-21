import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Hud } from '../Hud';
import { scrollStore } from '@/lib/scroll-store';
import { SECTIONS } from '@/content/sections';

describe('Hud', () => {
  let frameCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    scrollStore.reset();
    frameCallback = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallback = callback;
      return 3;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  it('affiche la profondeur parcourue', () => {
    const { container } = render(<Hud />);
    scrollStore.setFrame(0.5);

    frameCallback?.(0);

    expect(container.querySelector('.hud__depth-value')?.textContent).toBe('120');
  });

  it('nomme la station courante', () => {
    render(<Hud />);
    expect(screen.getByText(SECTIONS[0].crumb)).toBeInTheDocument();

    act(() => scrollStore.setActiveIndex(4));

    expect(screen.getByText(SECTIONS[4].crumb)).toBeInTheDocument();
    expect(screen.getByText('05')).toBeInTheDocument();
  });

  it('ne montre l invitation à défiler qu au départ', () => {
    render(<Hud />);
    expect(screen.getByText(/défile pour avancer/i)).toBeInTheDocument();

    act(() => scrollStore.setActiveIndex(1));

    expect(screen.queryByText(/défile pour avancer/i)).not.toBeInTheDocument();
  });
});
