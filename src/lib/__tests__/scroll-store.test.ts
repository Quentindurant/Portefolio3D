import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scrollStore } from '../scroll-store';

describe('scrollStore', () => {
  beforeEach(() => {
    scrollStore.reset();
  });

  it('expose la progression sans passer par React', () => {
    scrollStore.setFrame(0.42, 0.01);
    expect(scrollStore.frame.progress).toBe(0.42);
    expect(scrollStore.frame.velocity).toBe(0.01);
  });

  it('ne notifie que lorsque la section change', () => {
    const listener = vi.fn();
    scrollStore.subscribe(listener);

    scrollStore.setActiveIndex(2);
    scrollStore.setActiveIndex(2);
    scrollStore.setActiveIndex(3);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(scrollStore.getActiveIndex()).toBe(3);
  });

  it('permet de se désabonner', () => {
    const listener = vi.fn();
    const unsubscribe = scrollStore.subscribe(listener);
    unsubscribe();

    scrollStore.setActiveIndex(1);

    expect(listener).not.toHaveBeenCalled();
    expect(scrollStore.listenerCount).toBe(0);
  });
});
