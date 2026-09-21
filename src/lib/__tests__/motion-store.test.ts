import { afterEach, describe, expect, it } from 'vitest';
import { motionStore } from '../motion-store';

afterEach(() => motionStore.setReduced(false));

describe('motionStore', () => {
  it('transporte la préférence jusque dans la scène WebGL', () => {
    expect(motionStore.reduced).toBe(false);
    motionStore.setReduced(true);
    expect(motionStore.reduced).toBe(true);
  });
});
