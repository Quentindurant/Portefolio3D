/**
 * Construction de la Content-Security-Policy.
 * Un nonce est genere par requete : aucun script inline n'est accepte sans lui,
 * ce qui coupe la majorite des vecteurs XSS (OWASP A03 Injection).
 */
export function generateNonce(
  randomValues: Uint8Array = crypto.getRandomValues(new Uint8Array(16)),
): string {
  return btoa(String.fromCharCode(...randomValues));
}

export interface CspOptions {
  nonce: string;
  isDev?: boolean;
}

export function buildContentSecurityPolicy({ nonce, isDev = false }: CspOptions): string {
  // Le mode dev de Next a besoin de eval pour le rafraichissement a chaud.
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const directives: Record<string, string> = {
    'default-src': "'self'",
    'script-src': scriptSrc,
    // Tailwind et les styles injectes par React necessitent l'inline.
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: blob:",
    'font-src': "'self' data:",
    'connect-src': isDev ? "'self' ws: wss:" : "'self'",
    'worker-src': "'self' blob:",
    'media-src': "'self'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    'manifest-src': "'self'",
  };

  return Object.entries(directives)
    .map(([directive, value]) => `${directive} ${value}`)
    .join('; ');
}
