/**
 * Reusable `matchMedia` mock helper for jsdom-based tests.
 *
 * jsdom does not implement `window.matchMedia`, so any code that reads media
 * queries (e.g. `useReducedMotion()` reading `(prefers-reduced-motion: reduce)`)
 * needs a stub. This helper lets tests simulate specific media-query states —
 * most importantly the reduced-motion preference (Requirement 37.2).
 *
 * Usage:
 *   import { mockMatchMedia } from '@/test/matchMedia';
 *
 *   // Simulate "prefers-reduced-motion: reduce"
 *   mockMatchMedia({ '(prefers-reduced-motion: reduce)': true });
 *
 *   // Or pass a predicate for finer control
 *   mockMatchMedia((query) => query.includes('min-width: 1024px'));
 *
 * Each call replaces `window.matchMedia` with a fresh stub. Pair with
 * `resetMatchMedia()` in an `afterEach` if you want to drop the stub between
 * tests (the global setup already runs RTL cleanup).
 */

type MatchMap = Record<string, boolean>;
type MatchPredicate = (query: string) => boolean;

export interface MockMediaQueryList extends MediaQueryList {
  /** Update `matches` for this list and notify any registered listeners. */
  setMatches(matches: boolean): void;
}

const createMediaQueryList = (
  query: string,
  matches: boolean,
): MockMediaQueryList => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const legacyListeners = new Set<(event: MediaQueryListEvent) => void>();
  let currentMatches = matches;

  const list: MockMediaQueryList = {
    get matches() {
      return currentMatches;
    },
    media: query,
    onchange: null,
    addEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    // Deprecated API kept for libraries (e.g. GSAP, Lenis) that still use it.
    addListener: (listener) => {
      if (listener) legacyListeners.add(listener);
    },
    removeListener: (listener) => {
      if (listener) legacyListeners.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      const mqEvent = event as MediaQueryListEvent;
      listeners.forEach((l) => l(mqEvent));
      legacyListeners.forEach((l) => l(mqEvent));
      return true;
    },
    setMatches(next: boolean) {
      currentMatches = next;
      const event = {
        matches: next,
        media: query,
      } as MediaQueryListEvent;
      list.onchange?.(event);
      listeners.forEach((l) => l(event));
      legacyListeners.forEach((l) => l(event));
    },
  };

  return list;
};

/**
 * Install a `window.matchMedia` mock.
 *
 * @param matcher A map of query → matches, or a predicate `(query) => boolean`.
 *                Queries not present in a map default to `false`.
 * @returns A registry of the created MediaQueryList objects keyed by query so
 *          tests can flip `matches` mid-test via `setMatches`.
 */
export function mockMatchMedia(
  matcher: MatchMap | MatchPredicate = {},
): Map<string, MockMediaQueryList> {
  const registry = new Map<string, MockMediaQueryList>();

  const resolve: MatchPredicate =
    typeof matcher === 'function'
      ? matcher
      : (query: string) => Boolean(matcher[query]);

  const impl = (query: string): MediaQueryList => {
    const existing = registry.get(query);
    if (existing) return existing;
    const list = createMediaQueryList(query, resolve(query));
    registry.set(query, list);
    return list;
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: impl,
  });

  return registry;
}

/** Convenience helper: simulate the reduced-motion preference being on/off. */
export function mockReducedMotion(reduced: boolean): Map<string, MockMediaQueryList> {
  return mockMatchMedia({ '(prefers-reduced-motion: reduce)': reduced });
}

/** Remove the `matchMedia` mock so it reverts to jsdom's (undefined) default. */
export function resetMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: undefined,
  });
}
