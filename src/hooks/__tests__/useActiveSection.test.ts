import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useActiveSection } from '../useActiveSection';
import { scrollStore } from '@/lib/scroll-store';

describe('useActiveSection', () => {
  beforeEach(() => scrollStore.reset());

  it('part de la première section', () => {
    const { result } = renderHook(() => useActiveSection());
    expect(result.current).toBe(0);
  });

  it('suit les changements publiés par le store', () => {
    const { result } = renderHook(() => useActiveSection());

    act(() => scrollStore.setActiveIndex(3));
    expect(result.current).toBe(3);
  });

  it('libère son abonnement au démontage', () => {
    const { unmount } = renderHook(() => useActiveSection());
    expect(scrollStore.listenerCount).toBeGreaterThan(0);

    unmount();
    expect(scrollStore.listenerCount).toBe(0);
  });
});
