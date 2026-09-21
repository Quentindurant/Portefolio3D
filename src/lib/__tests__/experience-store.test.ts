import { beforeEach, describe, expect, it, vi } from 'vitest';
import { experienceStore } from '../experience-store';

describe('experienceStore', () => {
  beforeEach(() => experienceStore.reset());

  it('démarre en chargement', () => {
    expect(experienceStore.getPhase()).toBe('loading');
  });

  it('passe en prêt puis en entré, sans revenir en arrière', () => {
    const listener = vi.fn();
    experienceStore.subscribe(listener);

    experienceStore.markReady();
    expect(experienceStore.getPhase()).toBe('ready');

    experienceStore.enter();
    expect(experienceStore.getPhase()).toBe('entered');

    experienceStore.markReady();
    expect(experienceStore.getPhase()).toBe('entered');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('permet de se désabonner', () => {
    const listener = vi.fn();
    const unsubscribe = experienceStore.subscribe(listener);
    unsubscribe();

    experienceStore.markReady();

    expect(listener).not.toHaveBeenCalled();
    expect(experienceStore.listenerCount).toBe(0);
  });
});
