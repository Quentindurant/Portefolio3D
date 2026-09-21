import { describe, expect, it } from 'vitest';
import { createRandom, randomBetween } from '../random';

describe('createRandom', () => {
  it('produit la même séquence pour une même graine', () => {
    const first = createRandom(42);
    const second = createRandom(42);

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('reste dans l intervalle [0, 1[', () => {
    const random = createRandom(7);
    for (let index = 0; index < 200; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('randomBetween', () => {
  it('projette le tirage dans les bornes demandées', () => {
    const random = createRandom(3);
    for (let index = 0; index < 100; index += 1) {
      const value = randomBetween(random, -5, 5);
      expect(value).toBeGreaterThanOrEqual(-5);
      expect(value).toBeLessThanOrEqual(5);
    }
  });
});
