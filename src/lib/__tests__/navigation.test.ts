import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getSmoothScroller,
  goToStation,
  setSmoothScroller,
  stationScrollTarget,
} from '../navigation';

afterEach(() => {
  setSmoothScroller(null);
});

describe('stationScrollTarget', () => {
  it('répartit les stations sur toute la course du rail', () => {
    expect(stationScrollTarget(0, 6, 5000)).toBe(0);
    expect(stationScrollTarget(5, 6, 5000)).toBe(5000);
    expect(stationScrollTarget(3, 6, 5000)).toBe(3000);
  });

  it('reste à zéro dans les cas dégénérés', () => {
    expect(stationScrollTarget(2, 1, 5000)).toBe(0);
    expect(stationScrollTarget(2, 6, 0)).toBe(0);
  });
});

describe('goToStation', () => {
  const doc = { documentElement: { scrollHeight: 6000 } } as Pick<Document, 'documentElement'>;

  it('délègue au scroller fluide quand il est disponible', () => {
    const scrollTo = vi.fn();
    setSmoothScroller({ scrollTo });
    expect(getSmoothScroller()).not.toBeNull();

    const view = { innerHeight: 1000, scrollTo: vi.fn() };
    const target = goToStation(2, 6, view, doc);

    expect(target).toBe(2000);
    expect(scrollTo).toHaveBeenCalledWith(2000);
    expect(view.scrollTo).not.toHaveBeenCalled();
  });

  it('retombe sur le scroll natif sans scroller enregistré', () => {
    const view = { innerHeight: 1000, scrollTo: vi.fn() };

    goToStation(5, 6, view, doc);

    expect(view.scrollTo).toHaveBeenCalledWith({ top: 5000, behavior: 'smooth' });
  });
});
