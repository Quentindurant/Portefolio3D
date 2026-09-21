import { describe, expect, it } from 'vitest';
import {
  nearestStation,
  PATH_POINTS,
  progressToCurveT,
  stationIntensity,
  STATION_T,
} from '../journey';

describe('PATH_POINTS', () => {
  it('décrit un chemin qui s enfonce dans la forêt', () => {
    expect(PATH_POINTS.length).toBeGreaterThan(8);

    const depths = PATH_POINTS.map(([, , z]) => z);
    const sorted = [...depths].sort((a, b) => b - a);
    expect(depths).toEqual(sorted);
  });
});

describe('STATION_T', () => {
  it('range les stations dans l ordre, entre 0 et 1', () => {
    expect(STATION_T[0]).toBeGreaterThanOrEqual(0);
    expect(STATION_T[STATION_T.length - 1]).toBeLessThanOrEqual(1);

    for (let index = 1; index < STATION_T.length; index += 1) {
      expect(STATION_T[index]!).toBeGreaterThan(STATION_T[index - 1]!);
    }
  });
});

describe('progressToCurveT', () => {
  it('place chaque station à sa part de progression', () => {
    const last = STATION_T.length - 1;

    STATION_T.forEach((anchor, index) => {
      expect(progressToCurveT(index / last)).toBeCloseTo(anchor, 5);
    });
  });

  it('progresse toujours vers l avant', () => {
    let previous = -1;
    for (let step = 0; step <= 20; step += 1) {
      const value = progressToCurveT(step / 20);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('nearestStation', () => {
  it('identifie la station la plus proche de la caméra', () => {
    expect(nearestStation(STATION_T[0]!)).toBe(0);
    expect(nearestStation(STATION_T[3]!)).toBe(3);
    expect(nearestStation(1)).toBe(STATION_T.length - 1);
  });
});

describe('stationIntensity', () => {
  it('vaut 1 sur la station et retombe en s éloignant', () => {
    expect(stationIntensity(STATION_T[2]!, 2)).toBeCloseTo(1, 5);
    expect(stationIntensity(STATION_T[0]!, 2)).toBe(0);
  });

  it('ignore une station inexistante', () => {
    expect(stationIntensity(0.5, 99)).toBe(0);
  });
});
