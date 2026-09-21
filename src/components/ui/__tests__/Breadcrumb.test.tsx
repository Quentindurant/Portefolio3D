import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Breadcrumb } from '../Breadcrumb';
import type { SectionDefinition } from '@/content/sections';

const sections: SectionDefinition[] = [
  { id: 'lisiere', crumb: 'Lisière', title: 'Lisière', kicker: 'Accueil', depth: 0 },
  { id: 'sentier', crumb: 'Sentier', title: 'Sentier', kicker: 'Profil', depth: -10 },
  { id: 'clairiere', crumb: 'Clairière', title: 'Clairière', kicker: 'Contact', depth: -20 },
];

describe('Breadcrumb', () => {
  it('rend une étape par section, dans l ordre', () => {
    render(<Breadcrumb sections={sections} activeIndex={0} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '#lisiere');
    expect(screen.getByText('Clairière')).toBeInTheDocument();
  });

  it('marque l étape courante pour les lecteurs d écran', () => {
    render(<Breadcrumb sections={sections} activeIndex={1} />);

    const current = screen.getByRole('link', { current: 'step' });
    expect(current).toHaveAttribute('href', '#sentier');
  });

  it('distingue les étapes parcourues de celles à venir', () => {
    const { container } = render(<Breadcrumb sections={sections} activeIndex={1} />);
    const items = container.querySelectorAll('.breadcrumb__item');

    expect(items[0]).toHaveAttribute('data-state', 'visited');
    expect(items[1]).toHaveAttribute('data-state', 'active');
    expect(items[2]).toHaveAttribute('data-state', 'upcoming');
  });

  it('notifie la navigation au clic', async () => {
    const onNavigate = vi.fn().mockReturnValue(true);
    const user = userEvent.setup();

    render(<Breadcrumb sections={sections} activeIndex={0} onNavigate={onNavigate} />);
    await user.click(screen.getByRole('link', { name: /clairière/i }));

    expect(onNavigate).toHaveBeenCalledWith('clairiere', 2);
  });

  it('reste un lien fonctionnel sans gestionnaire', async () => {
    const user = userEvent.setup();
    render(<Breadcrumb sections={sections} activeIndex={0} />);

    await user.click(screen.getByRole('link', { name: /sentier/i }));
    expect(screen.getByRole('navigation', { name: /fil d'ariane/i })).toBeInTheDocument();
  });
});
