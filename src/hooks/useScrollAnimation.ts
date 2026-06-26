/**
 * Register GSAP timelines / ScrollTriggers scoped to a single element with
 * automatic cleanup.
 *
 * The hook creates a ref for the caller to attach to a DOM element, then in a
 * `useLayoutEffect` runs the provided `setup` inside a `gsap.context(...)`
 * scoped to that element. Every animation, timeline, and ScrollTrigger created
 * inside `setup` is tracked by the context, so the returned cleanup
 * (`ctx.revert()`) reverts and kills all of them on unmount or when `deps`
 * change. This satisfies the "cleanup is mandatory" rule and Requirement 20.4
 * (a page's ScrollTriggers/timelines are killed when it unmounts).
 *
 * `setup` receives `{ el, gsap, ScrollTrigger, reducedMotion }`. The
 * `reducedMotion` flag (sourced from {@link useReducedMotion}) lets callers
 * branch: when `true` they should skip scrubbed motion and apply the animation's
 * end state instantly (content visible, no movement) per the reduced-motion
 * fallback rules. `reducedMotion` is included in the effect dependencies so the
 * context re-runs if the preference changes at runtime.
 *
 * `ScrollTrigger` is registered with GSAP once on module load so callers never
 * have to register it themselves.
 *
 * _Requirements: 20.4_
 */
import { useLayoutEffect, useRef } from 'react';
import type { DependencyList, RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useReducedMotion } from './useReducedMotion';

// Tracks whether the ScrollTrigger plugin has been registered. Registration is
// deferred to the first browser layout effect (below) rather than module load,
// because `ScrollTrigger.register` touches `window.matchMedia`, which is absent
// in SSR/jsdom at import time. GSAP's registerPlugin is idempotent, so the flag
// just avoids redundant calls.
let scrollTriggerRegistered = false;

/** Context object passed to a {@link useScrollAnimation} setup callback. */
export interface ScrollAnimationContext {
  /** The DOM element the returned ref is attached to. */
  el: HTMLElement;
  /** The GSAP namespace, for creating tweens/timelines. */
  gsap: typeof gsap;
  /** The ScrollTrigger plugin, already registered. */
  ScrollTrigger: typeof ScrollTrigger;
  /** Live `prefers-reduced-motion` preference — branch on this for end-state. */
  reducedMotion: boolean;
}

/** A setup callback that builds the scoped GSAP animations. */
export type ScrollAnimationSetup = (context: ScrollAnimationContext) => void;

/**
 * Scope GSAP animations to an element with automatic teardown.
 *
 * @param setup - Builds the animations; runs inside a `gsap.context` scoped to
 *   the element. Anything it creates is reverted on cleanup.
 * @param deps - Optional dependency list; the context re-initializes when these
 *   (or the reduced-motion preference) change.
 * @returns A ref to attach to the target element.
 */
export function useScrollAnimation(
  setup: ScrollAnimationSetup,
  deps: DependencyList = [],
): RefObject<HTMLElement> {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // Keep the latest setup without forcing the effect to re-run on every render
  // when callers pass an inline function.
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) {
      return;
    }

    // Register ScrollTrigger lazily, now that we are in a browser layout effect
    // (window/matchMedia are available). Idempotent + guarded.
    if (!scrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      scrollTriggerRegistered = true;
    }

    const ctx = gsap.context(() => {
      setupRef.current({ el, gsap, ScrollTrigger, reducedMotion });
    }, el);

    return () => {
      ctx.revert();
    };
    // `deps` is the caller-controlled dependency list; `reducedMotion` re-runs
    // the animation when the preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);

  return ref;
}
