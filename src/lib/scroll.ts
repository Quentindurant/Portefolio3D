import { clamp, lerp, smoothstep } from './math';

/** Progression globale du document, bornée entre 0 et 1. */
export function computeScrollProgress(
  scrollY: number,
  documentHeight: number,
  viewportHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return clamp(scrollY / scrollable, 0, 1);
}

/**
 * Projette une progression 0→1 sur une liste de jalons.
 * Chaque segment est adouci : l'arrivée sur un jalon ralentit, le départ
 * redémarre en douceur. C'est ce qui donne au voyage son rythme de marche.
 */
export function interpolateThrough(progress: number, milestones: readonly number[]): number {
  if (milestones.length === 0) return 0;
  const first = milestones[0] ?? 0;
  if (milestones.length === 1) return first;

  const scaled = clamp(progress, 0, 1) * (milestones.length - 1);
  const index = clamp(Math.floor(scaled), 0, milestones.length - 2);
  const from = milestones[index] ?? first;
  const to = milestones[index + 1] ?? from;
  return lerp(from, to, smoothstep(scaled - index));
}
