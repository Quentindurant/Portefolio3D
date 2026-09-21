import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Preloader } from '../Preloader';
import { experienceStore } from '@/lib/experience-store';

describe('Preloader', () => {
  beforeEach(() => experienceStore.reset());

  it('verrouille le voyage tant que la scène n est pas prête', () => {
    render(<Preloader />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/préparation/i);
    expect(document.documentElement.dataset.phase).toBe('loading');
  });

  it('ouvre la porte une fois la première image rendue', () => {
    render(<Preloader />);

    act(() => experienceStore.markReady());

    const button = screen.getByRole('button', { name: /entrer dans la forêt/i });
    expect(button).toBeEnabled();
    expect(button).toHaveFocus();
  });

  it('disparaît quand le visiteur entre', async () => {
    const user = userEvent.setup();
    render(<Preloader />);

    act(() => experienceStore.markReady());
    await user.click(screen.getByRole('button', { name: /entrer/i }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(experienceStore.getPhase()).toBe('entered');
  });
});
