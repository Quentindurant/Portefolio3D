import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BreadcrumbTrail } from '../BreadcrumbTrail';
import { SECTIONS } from '@/content/sections';
import { scrollStore } from '@/lib/scroll-store';
import { setSmoothScroller } from '@/lib/navigation';

describe('BreadcrumbTrail', () => {
  beforeEach(() => {
    scrollStore.reset();
    setSmoothScroller(null);
    document.body.innerHTML = SECTIONS.map((section) => `<div id="${section.id}"></div>`).join('');
  });

  it('affiche toutes les étapes du parcours', () => {
    render(<BreadcrumbTrail />);
    expect(screen.getAllByRole('link')).toHaveLength(SECTIONS.length);
  });

  it('suit la section active du store', () => {
    render(<BreadcrumbTrail />);

    act(() => scrollStore.setActiveIndex(2));

    const current = screen.getByRole('link', { current: 'step' });
    expect(current).toHaveAttribute('href', `#${SECTIONS[2].id}`);
  });

  it('emmène le voyageur à la station cliquée', async () => {
    const scrollTo = vi.fn();
    setSmoothScroller({ scrollTo });
    const user = userEvent.setup();

    render(<BreadcrumbTrail />);
    await user.click(screen.getByRole('link', { name: new RegExp(SECTIONS[3].crumb, 'i') }));

    expect(scrollTo).toHaveBeenCalledTimes(1);
  });
});
