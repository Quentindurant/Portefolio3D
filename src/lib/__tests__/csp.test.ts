import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy, generateNonce } from '../csp';

describe('generateNonce', () => {
  it('encode les octets fournis en base64', () => {
    expect(generateNonce(new Uint8Array([1, 2, 3]))).toBe(btoa('\u0001\u0002\u0003'));
  });

  it('produit une valeur différente à chaque appel', () => {
    expect(generateNonce()).not.toBe(generateNonce());
  });
});

describe('buildContentSecurityPolicy', () => {
  const production = buildContentSecurityPolicy({ nonce: 'abc123' });

  it('porte le nonce sur les scripts', () => {
    expect(production).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
  });

  it('interdit eval en production', () => {
    expect(production).not.toContain("'unsafe-eval'");
  });

  it('verrouille les directives sensibles', () => {
    expect(production).toContain("object-src 'none'");
    expect(production).toContain("frame-ancestors 'none'");
    expect(production).toContain("base-uri 'self'");
    expect(production).toContain("form-action 'self'");
    expect(production).toContain("default-src 'self'");
  });

  it('autorise eval uniquement en développement', () => {
    const development = buildContentSecurityPolicy({ nonce: 'abc123', isDev: true });
    expect(development).toContain("'unsafe-eval'");
    expect(development).toContain('ws:');
  });
});
