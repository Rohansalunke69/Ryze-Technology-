/**
 * `useReducedMotion` — reactive `prefers-reduced-motion: reduce` boolean.
 *
 * Wraps the `prefers-reduced-motion` media query and exposes its current state
 * as a boolean. Subscribes to changes so animated components re-render when the
 * user toggles the OS-level reduced-motion preference. Degrades gracefully when
 * `window.matchMedia` is unavailable (SSR / older jsdom), returning `false`.
 *
 * Validates Requirements 1.8, 2.6, 3.5, 8.4, 11.2.
 */

import { useEffect, useState } from 'react';

/** The media query that signals the user prefers reduced motion. */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether `matchMedia` is usable in the current environment.
 * Guards against SSR and jsdom builds where it may be undefined.
 */
function canMatchMedia(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  );
}

/** Read the current preference, defaulting to `false` when unavailable. */
function getInitialPreference(): boolean {
  if (!canMatchMedia()) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * React hook returning whether the user prefers reduced motion.
 *
 * @returns `true` when the reduced-motion preference is active, else `false`.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] =
    useState<boolean>(getInitialPreference);

  useEffect(() => {
    if (!canMatchMedia()) {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);

    // Re-sync in case the preference changed between the initial render and
    // when this effect runs.
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent): void => {
      setReducedMotion(event.matches);
    };

    // Modern browsers expose addEventListener; fall back to the deprecated
    // addListener for Safari < 14.
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return reducedMotion;
}
