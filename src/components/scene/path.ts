import { CatmullRomCurve3, Vector3 } from 'three';
import { PATH_POINTS, STATION_T } from '@/lib/journey';

/** Courbe du voyage, construite une seule fois et partagée par toute la scène. */
export function createJourneyCurve(): CatmullRomCurve3 {
  const points = PATH_POINTS.map(([x, y, z]) => new Vector3(x, y, z));
  return new CatmullRomCurve3(points, false, 'catmullrom', 0.4);
}

export interface StationAnchor {
  index: number;
  position: Vector3;
  /** Direction du chemin à cet endroit, pour orienter les décors. */
  tangent: Vector3;
  /** Angle de rotation Y pour faire face au chemin. */
  facing: number;
}

/** Position et orientation de chaque tableau le long de la courbe. */
export function computeStationAnchors(curve: CatmullRomCurve3): StationAnchor[] {
  return STATION_T.map((t, index) => {
    const position = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    return {
      index,
      position,
      tangent,
      facing: Math.atan2(tangent.x, tangent.z),
    };
  });
}
