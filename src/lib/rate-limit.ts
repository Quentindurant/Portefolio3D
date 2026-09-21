/**
 * Limiteur de debit en memoire (fenetre glissante).
 * Suffisant pour un site mono-instance pilote par PM2 ; protege le formulaire
 * de contact du bruteforce et du spam (OWASP A04 / A07).
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  /** Nombre maximum de cles conservees, garde-fou contre la saturation memoire. */
  maxKeys?: number;
}

export function createRateLimiter({ limit, windowMs, maxKeys = 5_000 }: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  function prune(now: number): void {
    for (const [key, timestamps] of hits) {
      const fresh = timestamps.filter((timestamp) => now - timestamp < windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      if (hits.size > maxKeys) prune(now);

      const timestamps = (hits.get(key) ?? []).filter(
        (timestamp) => now - timestamp < windowMs,
      );

      if (timestamps.length >= limit) {
        const oldest = timestamps[0] ?? now;
        hits.set(key, timestamps);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
        };
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return {
        allowed: true,
        remaining: limit - timestamps.length,
        retryAfterSeconds: 0,
      };
    },
    reset(): void {
      hits.clear();
    },
    get size(): number {
      return hits.size;
    },
  };
}

/**
 * Derive une cle client a partir des en-tetes du reverse proxy.
 * On ne stocke jamais l'IP brute ailleurs qu'en memoire volatile (RGPD).
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? 'anonyme';
}
