/**
 * `useSectionEntrance` — reports whether a section has entered the viewport.
 *
 * Wires an IntersectionObserver to the supplied element ref and returns `true`
 * once the section first intersects the viewport, so entrance animations can be
 * gated on scroll position. When reduced motion is active the hook returns
 * `true` immediately (the final visual state), and it also reveals immediately
 * when IntersectionObserver is unavailable (older jsdom / SSR).
 *
 * Validates Requirements 11.1, 11.2.
 */

import { useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * React hook returning whether the referenced section has entered the viewport.
 *
 * @param ref - A ref to the section element to observe.
 * @returns `true` when the section has entered (or motion is reduced).
 */
export function useSectionEntrance(ref: RefObject<Element | null>): boolean {
  const reducedMotion = useReducedMotion();
  const [hasEntered, setHasEntered] = useState<boolean>(reducedMotion);

  useEffect(() => {
    // Reduced motion: skip animation gating and render the final state.
    if (reducedMotion) {
      setHasEntered(true);
      return;
    }

    const element = ref.current;
    if (element === null) {
      return;
    }

    // No IntersectionObserver (SSR / older jsdom): reveal as a safe default.
    if (typeof IntersectionObserver === 'undefined') {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, reducedMotion]);

  return hasEntered;
}
