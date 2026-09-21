import { describe, expect, it } from 'vitest';
import { staticSecurityHeaders } from '../security-headers';

function asRecord(headers: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(headers.map((header) => [header.key, header.value]));
}

describe('staticSecurityHeaders', () => {
  it('applique les en-têtes OWASP de base', () => {
    const headers = asRecord(staticSecurityHeaders({ enableHsts: false }));

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
  });

  it('n ajoute HSTS que lorsqu il est demandé', () => {
    expect(asRecord(staticSecurityHeaders({ enableHsts: false }))).not.toHaveProperty(
      'Strict-Transport-Security',
    );

    const secured = asRecord(staticSecurityHeaders({ enableHsts: true }));
    expect(secured['Strict-Transport-Security']).toContain('max-age=63072000');
  });
});
