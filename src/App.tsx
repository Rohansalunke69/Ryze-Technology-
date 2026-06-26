/**
 * App — top-level provider composition (task 13.2).
 *
 * Wires the global providers around the data-router. The nesting order is
 * deliberate (outermost → innermost):
 *
 *   ErrorBoundary          ← a thrown error never blanks the whole app (Req 42.1)
 *     HelmetProvider       ← <head> management context for every page's SEOHead
 *       ReducedMotionProvider  ← single source of truth for motion preference
 *         SmoothScrollProvider ← owns Lenis + GSAP wiring (no-op under reduced motion)
 *           RouterProvider     ← renders AppLayout + the matched route
 *
 * Navigation, Footer, CustomCursor and PageTransition live INSIDE `AppLayout`
 * (the parent route element), so they render under the router context and can
 * use router hooks/`<Link>`s. Keeping the providers here (rather than in
 * `main.tsx`) keeps the composition testable.
 *
 * _Requirements: 5.3, 5.4, 20.3, 26.2, 38.1, 42.1_
 */
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { ErrorBoundary } from '@components/ErrorBoundary';
import { ReducedMotionProvider } from '@providers/ReducedMotionProvider';
import { SmoothScrollProvider } from '@providers/SmoothScrollProvider';
import { router } from '@/routes';

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ReducedMotionProvider>
          <SmoothScrollProvider>
            <RouterProvider router={router} />
          </SmoothScrollProvider>
        </ReducedMotionProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}
