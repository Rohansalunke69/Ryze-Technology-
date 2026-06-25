/**
 * Unit tests for the shared hooks (Task 7.2).
 *
 * Covers:
 *  - reduced-motion boolean derived from matchMedia (and change events)
 *  - viewport category transitions at the breakpoint boundaries
 *  - section entrance trigger via IntersectionObserver (and reduced-motion path)
 *  - smooth-scroll behavior wiring (smooth vs auto)
 *  - MotionProvider context plumbing
 *
 * Validates Requirements 8.3, 8.4, 11.1, 11.2.
 */

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';
import { useViewportCategory } from './useViewportCategory';
import { useSectionEntrance } from './useSectionEntrance';
import { smoothScrollToSection } from './smoothScrollToSection';
import { MotionProvider, useReducedMotionContext } from './MotionProvider';

// --- matchMedia mock ---------------------------------------------------------

interface MatchMediaHandle {
  emit: (next: boolean) => void;
}

function mockMatchMedia(initialMatches: boolean): MatchMediaHandle {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (
      _type: string,
      cb: (event: MediaQueryListEvent) => void,
    ) => listeners.delete(cb),
    addListener: (cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
    removeListener: (cb: (event: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
    dispatchEvent: () => true,
  };

  window.matchMedia = vi
    .fn()
    .mockImplementation(() => mql) as unknown as typeof window.matchMedia;

  return {
    emit(next: boolean) {
      mql.matches = next;
      for (const cb of listeners) {
        cb({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}

// --- IntersectionObserver mock ----------------------------------------------

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let lastObserverCallback: IOCallback | null = null;
let observeSpy: ReturnType<typeof vi.fn>;
let disconnectSpy: ReturnType<typeof vi.fn>;

function installIntersectionObserver(): void {
  observeSpy = vi.fn();
  disconnectSpy = vi.fn();
  lastObserverCallback = null;

  class MockIntersectionObserver {
    constructor(cb: IOCallback) {
      lastObserverCallback = cb;
    }
    observe = observeSpy;
    disconnect = disconnectSpy;
    unobserve = vi.fn();
    takeRecords = vi.fn();
    root = null;
    rootMargin = '';
    thresholds = [];
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
}

// --- shared helpers ----------------------------------------------------------

function setInnerWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// --- useReducedMotion --------------------------------------------------------

describe('useReducedMotion', () => {
  it('returns true when the reduced-motion query matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false when the reduced-motion query does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('updates when the media query change event fires', () => {
    const handle = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    act(() => {
      handle.emit(true);
    });
    expect(result.current).toBe(true);
  });

  it('falls back to false when matchMedia is unavailable', () => {
    // @ts-expect-error - simulate an environment without matchMedia
    window.matchMedia = undefined;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});

// --- useViewportCategory -----------------------------------------------------

describe('useViewportCategory', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('classifies mobile just below the tablet boundary (767)', () => {
    setInnerWidth(767);
    const { result } = renderHook(() => useViewportCategory());
    expect(result.current).toBe('mobile');
  });

  it('classifies tablet at the tablet boundary (768)', () => {
    setInnerWidth(768);
    const { result } = renderHook(() => useViewportCategory());
    expect(result.current).toBe('tablet');
  });

  it('classifies tablet just below the desktop boundary (1023)', () => {
    setInnerWidth(1023);
    const { result } = renderHook(() => useViewportCategory());
    expect(result.current).toBe('tablet');
  });

  it('classifies desktop at the desktop boundary (1024)', () => {
    setInnerWidth(1024);
    const { result } = renderHook(() => useViewportCategory());
    expect(result.current).toBe('desktop');
  });

  it('transitions across boundaries on resize', () => {
    setInnerWidth(500);
    const { result } = renderHook(() => useViewportCategory());
    expect(result.current).toBe('mobile');

    act(() => {
      setInnerWidth(1280);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('desktop');

    act(() => {
      setInnerWidth(800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe('tablet');
  });
});

// --- useSectionEntrance ------------------------------------------------------

describe('useSectionEntrance', () => {
  it('returns false before intersection, then true once intersecting', () => {
    mockMatchMedia(false);
    installIntersectionObserver();

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      // Attach a real element so observe() has a target.
      if (ref.current === null) {
        ref.current = document.createElement('div');
      }
      return useSectionEntrance(ref);
    });

    expect(result.current).toBe(false);
    expect(observeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      lastObserverCallback?.([{ isIntersecting: true }]);
    });
    expect(result.current).toBe(true);
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('returns true immediately under reduced motion without observing', () => {
    mockMatchMedia(true);
    installIntersectionObserver();

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement | null>(null);
      if (ref.current === null) {
        ref.current = document.createElement('div');
      }
      return useSectionEntrance(ref);
    });

    expect(result.current).toBe(true);
    expect(observeSpy).not.toHaveBeenCalled();
  });
});

// --- smoothScrollToSection ---------------------------------------------------

describe('smoothScrollToSection', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrolls smoothly when reduced motion is off', () => {
    const section = document.createElement('section');
    section.id = 'portfolio';
    const scrollSpy = vi.fn();
    section.scrollIntoView = scrollSpy;
    document.body.appendChild(section);

    smoothScrollToSection('portfolio', false);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrolls instantly (auto) when reduced motion is on', () => {
    const section = document.createElement('section');
    section.id = 'contact';
    const scrollSpy = vi.fn();
    section.scrollIntoView = scrollSpy;
    document.body.appendChild(section);

    smoothScrollToSection('contact', true);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('no-ops when the target element is missing', () => {
    expect(() => smoothScrollToSection('does-not-exist', false)).not.toThrow();
  });
});

// --- MotionProvider ----------------------------------------------------------

describe('MotionProvider', () => {
  it('exposes the reduced-motion flag through context', () => {
    mockMatchMedia(true);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MotionProvider>{children}</MotionProvider>
    );

    const { result } = renderHook(() => useReducedMotionContext(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('throws when the context hook is used outside a provider', () => {
    mockMatchMedia(false);
    // Suppress the expected React error boundary console noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useReducedMotionContext())).toThrow(
      /must be used within a MotionProvider/,
    );
    spy.mockRestore();
  });
});
