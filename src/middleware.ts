import { NextResponse, type NextRequest } from 'next/server';
import { buildContentSecurityPolicy, generateNonce } from '@/lib/csp';

/**
 * Injecte une CSP avec nonce unique par requête.
 * Next lit l'en-tête de requête `Content-Security-Policy` pour propager le
 * nonce sur ses propres balises script.
 */
export function middleware(request: NextRequest): NextResponse {
  const nonce = generateNonce();
  const policy = buildContentSecurityPolicy({
    nonce,
    isDev: process.env.NODE_ENV !== 'production',
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
