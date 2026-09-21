import { describe, expect, it } from 'vitest';
import { PALETTE } from '../theme';

describe('PALETTE', () => {
  it('ne contient que des couleurs hexadécimales valides', () => {
    for (const value of Object.values(PALETTE)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('expose les teintes attendues par la scène', () => {
    expect(PALETTE).toHaveProperty('jade');
    expect(PALETTE).toHaveProperty('ember');
    expect(PALETTE).toHaveProperty('arcane');
  });
});
