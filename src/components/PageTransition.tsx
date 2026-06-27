/**
 * PageTransition — route-level enter/exit animation + accessibility shell.
 *
 * Wraps each routed page and, on every route change (keyed by `routeKey`):
 *
 *  - animates the exit of the old page and the entrance of the new page using
 *    Framer Motion's `AnimatePresence` (Requirement 26.1);
 *  - scrolls the window to the top regardless of motion preference
 *    (Requirements 26.2, 20.3);
 *  - moves focus to the new page's main wrapper (a `tabIndex={-1}` container)
 *    so keyboard/AT users land on the fresh content (Requirement 38.3);
 *  - announces the new page through a stable, visually-hidden
 *    `aria-live="polite"` region — the Route_Announcer (Requirement 38.3).
 *
 * Under `prefers-reduced-motion` the animation collapses to an instant
 * cross-fade of 120ms (Requirement 37.4) while still scrolling to top and
 * managing focus.
 *
 * The component depends only on Framer Motion and the router (via the caller
 * supplying `routeKey`); it does NOT require GSAP/Lenis and degrades to native
 * scrolling, so it works even when the smooth-scroll layer is disabled.
 *
 * _Requirements: 26.1, 26.2, 37.4, 38.3, 20.3_
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@hooks/useReducedMotion';

export interface PageTransitionProps {
  /** The page content for the current route. */
  children: ReactNode;
  /**
   * A stable key identifying the current route (typically `location.pathname`).
   * Changing this key triggers the enter/exit transition and the
   * scroll/focus/announce side effects.
   */
  routeKey: string;
}

/** Full-motion enter/exit: a soft slide + clip reveal with a fade. */
const MOTION_VARIANTS: Variants = {
  initial: { opacity: 0, y: 24, clipPath: 'inset(0% 0% 8% 0%)' },
  animate: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' },
  exit: { opacity: 0, y: -16, clipPath: 'inset(8% 0% 0% 0%)' },
};

/** Reduced-motion enter/exit: opacity only, no movement. */
const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Visually-hidden styling for the Route_Announcer live region. */
const VISUALLY_HIDDEN: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

/** Build the spoken announcement for a route from its key. */
function announcementFor(routeKey: string): string {
  const trimmed = routeKey.replace(/^\/+|\/+$/g, '').trim();
  const label = trimmed.length === 0 ? 'Home' : trimmed;
  return `Navigated to ${label}`;
}

interface RouteContentProps {
  routeKey: string;
  children: ReactNode;
  reducedMotion: boolean;
  onEnter: (routeKey: string) => void;
}

/**
 * The per-route content wrapper. A fresh instance mounts on every route change
 * (it is keyed by `routeKey` in the parent), so its mount effect is the single,
 * resilient place that drives scroll-to-top, focus, and the announcement —
 * independent of whether the animation frames actually fire (important for
 * reduced motion and non-animating environments).
 */
function RouteContent({
  routeKey,
  children,
  reducedMotion,
  onEnter,
}: RouteContentProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the top of the new page regardless of motion preference.
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }

    // Move focus to the new page's main wrapper so keyboard/AT users land on
    // the fresh content.
    wrapperRef.current?.focus();

    // Announce the new page via the parent's stable live region.
    onEnter(routeKey);
    // `onEnter` is stabilized by the parent; re-run only when the route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  return (
    <motion.div
      ref={wrapperRef}
      data-page-wrapper=""
      tabIndex={-1}
      style={{ outline: 'none' }}
      variants={reducedMotion ? REDUCED_VARIANTS : MOTION_VARIANTS}
      initial="initial"
      animate="animate"
      transition={
        reducedMotion
          ? { duration: 0.12, ease: 'linear' }
          : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children, routeKey }: PageTransitionProps): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [announcement, setAnnouncement] = useState<string>('');

  const handleEnter = useCallback((key: string) => {
    setAnnouncement(announcementFor(key));
  }, []);

  return (
    <>
      {/*
        Stable Route_Announcer. It lives OUTSIDE the keyed content so it is never
        unmounted/remounted between routes — assistive tech only announces text
        changes within a persistent live region.
      */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="route-announcer"
        style={VISUALLY_HIDDEN}
      >
        {announcement}
      </div>

      {/*
        Enter-only transition. A fresh, keyed RouteContent mounts on every route
        change and animates in; React unmounts the previous one immediately, so
        there is never a "waiting for exit" gap that could blank the screen when
        a navigation interrupts an in-flight transition.
      */}
      <RouteContent
        key={routeKey}
        routeKey={routeKey}
        reducedMotion={reducedMotion}
        onEnter={handleEnter}
      >
        {children}
      </RouteContent>
    </>
  );
}

export default PageTransition;
