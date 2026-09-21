import { describe, expect, it } from 'vitest';
import { clientKeyFromHeaders, createRateLimiter } from '../rate-limit';

describe('createRateLimiter', () => {
  it('laisse passer les requêtes sous la limite', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });

    expect(limiter.check('ip', 0).allowed).toBe(true);
    expect(limiter.check('ip', 10).allowed).toBe(true);
    const third = limiter.check('ip', 20);
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it('bloque au-delà de la limite et annonce le délai', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
    limiter.check('ip', 0);
    limiter.check('ip', 100);

    const blocked = limiter.check('ip', 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
  });

  it('libère le quota une fois la fenêtre écoulée', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.check('ip', 0);

    expect(limiter.check('ip', 500).allowed).toBe(false);
    expect(limiter.check('ip', 1500).allowed).toBe(true);
  });

  it('isole les clients les uns des autres', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.check('a', 0);

    expect(limiter.check('b', 0).allowed).toBe(true);
    expect(limiter.size).toBe(2);
  });

  it('purge les clés expirées quand la table dépasse le garde-fou', () => {
    const limiter = createRateLimiter({ limit: 5, windowMs: 1000, maxKeys: 2 });

    limiter.check('a', 0);
    limiter.check('b', 0);
    limiter.check('c', 0);
    expect(limiter.size).toBe(3);

    // Au-delà du garde-fou, les fenêtres écoulées sont nettoyées.
    limiter.check('d', 5000);
    expect(limiter.size).toBe(1);
  });

  it('remet le compteur à zéro sur demande', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    limiter.check('a', 0);
    limiter.reset();

    expect(limiter.size).toBe(0);
    expect(limiter.check('a', 0).allowed).toBe(true);
  });
});

describe('clientKeyFromHeaders', () => {
  it('retient la première adresse de la chaîne de proxy', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' });
    expect(clientKeyFromHeaders(headers)).toBe('203.0.113.7');
  });

  it('retombe sur x-real-ip puis sur une clé anonyme', () => {
    expect(clientKeyFromHeaders(new Headers({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4');
    expect(clientKeyFromHeaders(new Headers())).toBe('anonyme');
  });
});
