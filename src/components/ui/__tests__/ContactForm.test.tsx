import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '../ContactForm';

function mockFetch(response: { ok: boolean; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    json: async () => response.body,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nom'), 'Camille Bertin');
  await user.type(screen.getByLabelText('E-mail'), 'camille@example.com');
  await user.type(
    screen.getByLabelText('Message'),
    'Bonjour, je cherche un développeur pour un projet Next.js.',
  );
}

describe('ContactForm', () => {
  it('envoie le formulaire et affiche la confirmation', async () => {
    const fetchMock = mockFetch({ ok: true, body: { message: 'Message reçu, merci.' } });
    const user = userEvent.setup();

    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Message reçu'));

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.anything());
    expect(JSON.parse(String(init.body))).toMatchObject({ email: 'camille@example.com' });
  });

  it('affiche les erreurs de champ renvoyées par le serveur', async () => {
    mockFetch({
      ok: false,
      body: { message: 'Merci de corriger les champs signalés.', errors: { email: 'Adresse invalide.' } },
    });
    const user = userEvent.setup();

    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => expect(screen.getByText('Adresse invalide.')).toBeInTheDocument());
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
  });

  it('gère une panne réseau sans casser la page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const user = userEvent.setup();

    render(<ContactForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/impossible de joindre le serveur/i),
    );
  });

  it('expose un champ piège invisible pour les robots', () => {
    render(<ContactForm />);
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest('.honeypot')).toHaveAttribute('aria-hidden', 'true');
  });
});
