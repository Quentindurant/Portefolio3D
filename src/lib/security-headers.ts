/**
 * En-tetes de securite appliques a toutes les reponses (OWASP Secure Headers).
 * La CSP n'est pas ici : elle est generee par requete dans `src/middleware.ts`
 * car elle embarque un nonce unique.
 */
export interface SecurityHeader {
  key: string;
  value: string;
}

export function staticSecurityHeaders(
  options: { enableHsts?: boolean } = {},
): SecurityHeader[] {
  const enableHsts = options.enableHsts ?? process.env.ENABLE_HSTS === 'true';

  const headers: SecurityHeader[] = [
    // Empeche le navigateur de deviner un type MIME (A03 / A05 OWASP).
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    // Anti clickjacking, complete par frame-ancestors dans la CSP.
    { key: 'X-Frame-Options', value: 'DENY' },
    // Limite la fuite d'URL vers les tiers.
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // Coupe les APIs navigateur dont le site n'a aucun besoin.
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  ];

  if (enableHsts) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    });
  }

  return headers;
}
