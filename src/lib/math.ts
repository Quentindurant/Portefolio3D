/** Petites fonctions mathématiques pures, partagées par la scène et le scroll. */

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function lerp(from: number, to: number, alpha: number): number {
  return from + (to - from) * clamp(alpha, 0, 1);
}

/** Interpolation adoucie aux extrémités, évite les à-coups de caméra. */
export function smoothstep(alpha: number): number {
  const t = clamp(alpha, 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Amortissement indépendant du framerate.
 * `lambda` élevé = rattrapage rapide de la cible.
 */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}
