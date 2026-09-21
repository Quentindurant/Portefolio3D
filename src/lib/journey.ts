import { clamp, smoothstep } from './math';
import { interpolateThrough } from './scroll';

/**
 * Le voyage de la caméra.
 *
 * Le scroll ne fait pas défiler des blocs : il fait avancer la caméra le long
 * d'une courbe qui serpente entre six tableaux. Les points sont définis ici,
 * en données pures, pour rester testables et modifiables sans toucher au rendu.
 */
export type Vec3 = readonly [number, number, number];

/** Points de contrôle de la courbe, du départ à la clairière finale. */
export const PATH_POINTS: readonly Vec3[] = [
  [0, 2.6, 30],
  [-3, 3.2, 16],
  [-7, 2.8, 2],
  [-2, 2.4, -14],
  [6, 3.6, -28],
  [9, 4.2, -44],
  [2, 3.2, -60],
  [-7, 2.2, -74],
  [-11, -0.6, -90],
  [-5, -1.2, -106],
  [3, 1.6, -120],
  [10, 4.6, -136],
  [7, 5.2, -152],
  [0, 3.4, -168],
  [-2, 2.8, -184],
  [0, 2.6, -198],
];

/**
 * Position de chaque station sur la courbe, exprimée en abscisse curviligne.
 * L'interpolation entre deux stations est adoucie : la caméra ralentit en
 * arrivant sur un tableau et repart doucement.
 */
export const STATION_T: readonly number[] = [0.015, 0.2, 0.4, 0.58, 0.76, 0.965];

/** Distance de regard en avant sur la courbe. */
export const LOOK_AHEAD = 0.018;

/** Convertit la progression du scroll en abscisse sur la courbe. */
export function progressToCurveT(progress: number): number {
  return interpolateThrough(progress, STATION_T);
}

/** Index de la station la plus proche, utilisé pour allumer les décors. */
export function nearestStation(curveT: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  STATION_T.forEach((t, index) => {
    const distance = Math.abs(t - curveT);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });

  return best;
}

/**
 * Intensité d'un tableau : 1 quand la caméra est dessus, 0 quand elle est à
 * plus d'une demi-station. Sert à allumer les lumières et révéler les titres.
 */
export function stationIntensity(curveT: number, index: number): number {
  const anchor = STATION_T[index];
  if (anchor === undefined) return 0;

  const span = 1 / (STATION_T.length - 1) / 2;
  const distance = Math.abs(curveT - anchor);
  return smoothstep(1 - clamp(distance / span, 0, 1));
}
