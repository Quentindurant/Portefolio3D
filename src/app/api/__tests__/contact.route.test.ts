// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const valid = {
  name: 'Camille Bertin',
  email: 'camille@example.com',
  message: 'Bonjour, je cherche un développeur pour un projet Next.js.',
  website: '',
};

function buildRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function loadRoute() {
  vi.resetModules();
  return import('../contact/route');
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  it('accepte un message valide', async () => {
    const { POST } = await loadRoute();
    const response = await POST(buildRequest(valid, { 'x-forwarded-for': '203.0.113.1' }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toMatchObject({ message: expect.any(String) });
  });

  it('refuse une charge utile invalide avec le détail des champs', async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      buildRequest({ ...valid, email: 'invalide' }, { 'x-forwarded-for': '203.0.113.2' }),
    );

    expect(response.status).toBe(400);
    const body = (await response.json()) as { errors?: Record<string, string> };
    expect(body.errors?.email).toBeDefined();
  });

  it('refuse un corps illisible', async () => {
    const { POST } = await loadRoute();
    const response = await POST(buildRequest('{ ceci-n-est-pas-du-json', { 'x-forwarded-for': '203.0.113.3' }));

    expect(response.status).toBe(400);
  });

  it('refuse une charge utile trop volumineuse', async () => {
    const { POST } = await loadRoute();
    const response = await POST(buildRequest(valid, { 'content-length': '99999' }));

    expect(response.status).toBe(413);
  });

  it('limite le nombre de messages par adresse', async () => {
    const { POST } = await loadRoute();
    const headers = { 'x-forwarded-for': '203.0.113.9' };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const allowed = await POST(buildRequest(valid, headers));
      expect(allowed.status).toBe(202);
    }

    const blocked = await POST(buildRequest(valid, headers));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();
  });
});
