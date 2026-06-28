/**
 * AppLayout — the shared application shell (task 13.2).
 *
 * Rendered as the parent route `element` (see `src/routes.tsx`), so it sits
 * INSIDE the router context: every child here (Navigation, Footer, the routed
 * page) can use router hooks/`<Link>`s freely. The structural order is:
 *
 *   <CustomCursor />                 ← bespoke pointer (null on touch/reduced-motion)
 *   <Navigation />                   ← sticky semantic <header>/<nav>
 *   <PageTransition routeKey=…>      ← enter/exit anim + scroll-to-top + focus + announce
 *     <Outlet />                     ← the matched routed page
 *   </PageTransition>
 *   <Footer />                       ← site <footer> / contentinfo
 *
 * Responsibilities beyond structure:
 *
 *  - **ScrollTrigger refresh on route change** (design "React Integration").
 *    After each new page mounts, recalculate GSAP ScrollTrigger start/end
 *    positions so pinned/scrubbed animations measure the fresh layout. The
 *    scroll-to-top itself is owned by `PageTransition` (Requirements 26.2,
 *    20.3), so this only handles the refresh half of the contract. Guarded so
 *    it is a no-op in environments without a live ScrollTrigger.
 *
 *  - **Route prefetch** (Requirements 5.3, 5.4). The likely-next route chunk is
 *    warmed two ways: (1) on `requestIdleCallback` after mount we prefetch a
 *    couple of high-traffic routes, and (2) a delegated hover/focus listener on
 *    the document fires a route's dynamic-import thunk the first time the user
 *    points at / focuses a nav link for that route. Both dedupe through a shared
 *    `Set`, so a chunk is only ever requested once. Everything is SSR/jsdom-safe
 *    (guards `window`/`document`).
 *
 * _Requirements: 5.3, 5.4, 20.3, 26.2, 38.1_
 */
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { CustomCursor } from '@components/CustomCursor';
import { Navigation } from '@components/Navigation';
import { Footer } from '@components/Footer';
import { PageTransition } from '@components/PageTransition';

/**
 * Map of top-level route pathnames → a dynamic-import thunk for that route's
 * page chunk. Mirrors the `React.lazy` imports in `src/routes.tsx`. Only the
 * static (non-`:slug`) routes are listed: those are the ones a hover/focus on a
 * nav `<a>` can resolve by pathname. Visiting a list page (e.g. `/portfolio`)
 * is the natural precursor to its detail chunks, so warming the list is enough.
 */
const PREFETCHABLE_ROUTES: Record<string, () => Promise<unknown>> = {
  '/': () => import('@pages/HomePage'),
  '/portfolio': () => import('@pages/PortfolioListPage'),
  '/services': () => import('@pages/ServicesPage'),
  '/about': () => import('@pages/AboutPage'),
  '/manifesto': () => import('@pages/ManifestoPage'),
  '/contact': () => import('@pages/ContactPage'),
  '/blog': () => import('@pages/BlogListPage'),
  '/resources': () => import('@pages/ResourcesPage'),
  '/privacy': () => import('@pages/LegalPage'),
  '/terms': () => import('@pages/LegalPage'),
  '/cookies': () => import('@pages/LegalPage'),
};

/**
 * High-traffic routes warmed during browser idle time after the shell mounts.
 * Kept short so we never contend with the initial route's critical work.
 */
const IDLE_PREFETCH_PATHS: readonly string[] = ['/portfolio', '/services', '/contact'];

/** Normalise a pathname so `/services/` and `/services` resolve to the same key. */
function normalisePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.replace(/\/+$/, '');
  }
  return pathname;
}

/**
 * Refresh GSAP ScrollTrigger after the route changes, defensively. The plugin
 * is imported lazily inside the effect so AppLayout never pulls GSAP into a
 * synchronous import path, and any failure (missing plugin, jsdom) is swallowed.
 */
function useScrollTriggerRefreshOnRouteChange(pathname: string): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cancelled = false;
    void import('gsap/ScrollTrigger')
      .then(({ ScrollTrigger }) => {
        if (cancelled) return;
        try {
          ScrollTrigger.refresh();
        } catch {
          /* no-op: no active triggers / unsupported environment */
        }
      })
      .catch(() => {
        /* no-op: GSAP unavailable */
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);
}

/**
 * Wire up route prefetching once on mount: idle prefetch of high-traffic
 * routes plus a delegated hover/focus listener that warms a route's chunk the
 * first time the user points at a matching nav link.
 */
function useRoutePrefetch(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    const requested = new Set<string>();

    const prefetch = (pathname: string): void => {
      const key = normalisePath(pathname);
      if (requested.has(key)) return;
      const thunk = PREFETCHABLE_ROUTES[key];
      if (thunk === undefined) return;
      requested.add(key);
      void thunk().catch(() => {
        // A failed prefetch is non-fatal: allow a later real navigation to
        // re-attempt the import via the route's Suspense boundary.
        requested.delete(key);
      });
    };

    // (1) Idle prefetch of likely-next routes.
    const idleWork = (): void => {
      for (const path of IDLE_PREFETCH_PATHS) prefetch(path);
    };

    const idleApi = (
      window as Window & {
        requestIdleCallback?: (cb: () => void) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    );
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (typeof idleApi.requestIdleCallback === 'function') {
      idleHandle = idleApi.requestIdleCallback(idleWork);
    } else {
      timeoutHandle = setTimeout(idleWork, 1500);
    }

    // (2) Hover/focus prefetch via a single delegated listener. Resolve the
    // closest anchor, and only act on same-origin internal links we know about.
    const handlePointer = (event: Event): void => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a');
      if (anchor === null) return;
      const href = anchor.getAttribute('href');
      if (href === null || href.length === 0) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        prefetch(url.pathname);
      } catch {
        /* malformed href — ignore */
      }
    };

    document.addEventListener('mouseover', handlePointer, { passive: true });
    document.addEventListener('focusin', handlePointer);

    return () => {
      if (idleHandle !== undefined && typeof idleApi.cancelIdleCallback === 'function') {
        idleApi.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
      document.removeEventListener('mouseover', handlePointer);
      document.removeEventListener('focusin', handlePointer);
    };
  }, []);
}

export function AppLayout(): JSX.Element {
  const location = useLocation();

  useScrollTriggerRefreshOnRouteChange(location.pathname);
  useRoutePrefetch();

  return (
    <>
      <CustomCursor />
      <Navigation transparentUntilScroll />
      {/*
        No wrapping <main> here: every routed page renders its own single
        <main> landmark, so adding one in the shell would produce nested/double
        <main> elements and violate the one-main-per-page rule (Req 38.1).
        PageTransition wraps the Outlet directly for enter/exit + scroll/focus.
      */}
      <PageTransition routeKey={location.pathname}>
        <Outlet />
      </PageTransition>
      {/* Visual bridge: fades the page surface into the footer ink tone. */}
      <div
        aria-hidden="true"
        className="h-24 bg-gradient-to-b from-ink-900 to-mist-100"
      />
      <Footer />
    </>
  );
}

export default AppLayout;
