import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { StationPanels } from '../StationPanels';
import { SECTIONS } from '@/content/sections';
import { scrollStore } from '@/lib/scroll-store';

describe('StationPanels', () => {
  beforeEach(() => scrollStore.reset());

  it('garde les six tableaux dans le DOM pour le référencement', () => {
    const { container } = render(<StationPanels />);
    expect(container.querySelectorAll('.panel')).toHaveLength(SECTIONS.length);
    expect(screen.getByText('Le sanctuaire')).toBeInTheDocument();
  });

  it('n active que le tableau traversé par la caméra', () => {
    const { container } = render(<StationPanels />);

    const first = container.querySelector('#lisiere');
    const third = container.querySelector('#sanctuaire');

    expect(first).toHaveAttribute('data-active', 'true');
    expect(third).toHaveAttribute('data-active', 'false');

    act(() => scrollStore.setActiveIndex(2));

    expect(first).toHaveAttribute('data-active', 'false');
    expect(third).toHaveAttribute('data-active', 'true');
  });

  it('neutralise les tableaux inactifs pour le clavier et les lecteurs d écran', () => {
    const { container } = render(<StationPanels />);

    const inactive = container.querySelector('#racines');
    expect(inactive).toHaveAttribute('aria-hidden', 'true');
    expect(inactive).toHaveAttribute('inert');

    const active = container.querySelector('#lisiere');
    expect(active).not.toHaveAttribute('inert');
  });
});
