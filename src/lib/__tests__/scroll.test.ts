import { describe, expect, it } from 'vitest';
import { computeScrollProgress, interpolateThrough } from '../scroll';

describe('computeScrollProgress', () => {
  it('retourne 0 quand la page ne défile pas', () => {
    expect(computeScrollProgress(0, 800, 800)).toBe(0);
    expect(computeScrollProgress(120, 600, 900)).toBe(0);
  });

  it('retourne la fraction parcourue', () => {
    expect(computeScrollProgress(500, 1800, 800)).toBeCloseTo(0.5, 5);
    expect(computeScrollProgress(1000, 1800, 800)).toBe(1);
  });

  it('borne la progression même si le scroll déborde', () => {
    expect(computeScrollProgress(99999, 1800, 800)).toBe(1);
    expect(computeScrollProgress(-40, 1800, 800)).toBe(0);
  });
});

describe('interpolateThrough', () => {
  const milestones = [0, 0.5, 1];

  it('renvoie les jalons aux extrémités', () => {
    expect(interpolateThrough(0, milestones)).toBe(0);
    expect(interpolateThrough(1, milestones)).toBe(1);
  });

  it('passe exactement par les jalons intermédiaires', () => {
    expect(interpolateThrough(0.5, milestones)).toBeCloseTo(0.5, 5);
  });

  it('adoucit les entrées et sorties de segment', () => {
    // Au quart du parcours on est à mi-segment, donc ralenti par le lissage.
    expect(interpolateThrough(0.25, milestones)).toBeCloseTo(0.25, 5);
    expect(interpolateThrough(0.1, milestones)).toBeLessThan(0.1);
  });

  it('gère les listes dégénérées', () => {
    expect(interpolateThrough(0.5, [])).toBe(0);
    expect(interpolateThrough(0.5, [7])).toBe(7);
  });
});
