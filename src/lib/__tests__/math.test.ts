import { describe, expect, it } from 'vitest';
import { clamp, damp, lerp, smoothstep } from '../math';

describe('clamp', () => {
  it('borne la valeur dans l intervalle', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('retourne le minimum pour une valeur non numérique', () => {
    expect(clamp(Number.NaN, 2, 8)).toBe(2);
  });
});

describe('lerp', () => {
  it('interpole entre deux bornes', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(-10, 10, 0)).toBe(-10);
  });

  it('borne le facteur pour éviter les dépassements', () => {
    expect(lerp(0, 10, 3)).toBe(10);
    expect(lerp(0, 10, -1)).toBe(0);
  });
});

describe('smoothstep', () => {
  it('reste dans les bornes et passe par le milieu', () => {
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(0.5)).toBeCloseTo(0.5, 5);
  });

  it('adoucit les extrémités', () => {
    expect(smoothstep(0.1)).toBeLessThan(0.1);
    expect(smoothstep(0.9)).toBeGreaterThan(0.9);
  });
});

describe('damp', () => {
  it('se rapproche de la cible sans la dépasser', () => {
    const result = damp(0, 10, 4, 0.016);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  it('converge vers la cible sur une longue durée', () => {
    expect(damp(0, 10, 10, 5)).toBeCloseTo(10, 4);
  });
});
