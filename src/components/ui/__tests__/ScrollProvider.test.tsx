import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useScrollOrchestrator = vi.fn();
vi.mock('@/hooks/useScrollOrchestrator', () => ({
  useScrollOrchestrator: () => useScrollOrchestrator(),
}));

import { ScrollProvider } from '../ScrollProvider';

describe('ScrollProvider', () => {
  it('démarre la boucle de voyage et rend ses enfants', () => {
    render(
      <ScrollProvider>
        <p>Contenu</p>
      </ScrollProvider>,
    );

    expect(useScrollOrchestrator).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });
});
