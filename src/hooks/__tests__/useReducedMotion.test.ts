import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';

type Handler = (event: MediaQueryListEvent) => void;

function stubMatchMedia(initial: boolean) {
  const handlers = new Set<Handler>();

  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: initial,
    media: query,
    onchange: null,
    addEventListener: (_: string, handler: Handler) => handlers.add(handler),
    removeEventListener: (_: string, handler: Handler) => handlers.delete(handler),
    dispatchEvent: vi.fn(),
  }));

  vi.stubGlobal('matchMedia', matchMedia);
  return {
    handlers,
    emit(matches: boolean) {
      for (const handler of handlers) handler({ matches } as MediaQueryListEvent);
    },
  };
}

describe('useReducedMotion', () => {
  it('lit la préférence système au montage', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('réagit au changement de préférence', () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
    act(() => media.emit(true));
    expect(result.current).toBe(true);
  });

  it('se désabonne au démontage', () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());

    expect(media.handlers.size).toBe(1);
    unmount();
    expect(media.handlers.size).toBe(0);
  });

  it('reste inactif si matchMedia n est pas disponible', () => {
    vi.stubGlobal('matchMedia', undefined);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
